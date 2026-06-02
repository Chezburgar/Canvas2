/* ════════════════════════════════════════════════
   Canvas2 — To-Do List with Priority Algorithm
   ════════════════════════════════════════════════ */

const Todo = (() => {
  let currentFilter = 'all';
  let editingId = null;

  /* ── Priority scoring ─────────────────────────
     Formula weights:
       45% urgency   (due sooner → higher)
       35% points    (more points → higher)
       20% type      (exam/test > homework)
     ─────────────────────────────────────────── */
  const TYPE_WEIGHTS = {
    exam: 1.0, test: 0.9, project: 0.85, essay: 0.75,
    lab: 0.65, quiz: 0.6, discussion: 0.45,
    homework: 0.4, reading: 0.3,
  };

  function priorityScore(a) {
    const days = DateUtils.daysUntil(a.due);
    let urgency;
    if (days < 0)       urgency = 1.0;
    else if (days === 0) urgency = 0.97;
    else if (days <= 1)  urgency = 0.92;
    else if (days <= 3)  urgency = 0.78;
    else if (days <= 7)  urgency = 0.58;
    else if (days <= 14) urgency = 0.38;
    else if (days <= 30) urgency = 0.18;
    else                 urgency = 0.05;

    const pts = Math.min((a.points || 0) / 200, 1.0);
    const type = TYPE_WEIGHTS[a.type] ?? 0.5;
    return urgency * 0.45 + pts * 0.35 + type * 0.20;
  }

  function priorityLabel(score) {
    if (score >= 0.75) return { label:'Critical', cls:'priority-critical' };
    if (score >= 0.55) return { label:'High',     cls:'priority-high' };
    if (score >= 0.35) return { label:'Medium',   cls:'priority-medium' };
    return                    { label:'Low',       cls:'priority-low' };
  }

  function priorityColor(score) {
    if (score >= 0.75) return '#ea4335';
    if (score >= 0.55) return '#f59e0b';
    if (score >= 0.35) return '#1a73e8';
    return '#34a853';
  }

  /* ── Filter logic ─────────────────────────── */
  function filterAssignments(assignments, filter) {
    switch (filter) {
      case 'today':     return assignments.filter(a => !a.completed && DateUtils.isToday(a.due));
      case 'week':      return assignments.filter(a => !a.completed && DateUtils.isThisWeek(a.due) && !DateUtils.isOverdue(a.due));
      case 'overdue':   return assignments.filter(a => !a.completed && DateUtils.isOverdue(a.due));
      case 'completed': return assignments.filter(a => a.completed);
      default:          return assignments.filter(a => !a.completed);
    }
  }

  /* ── Render ───────────────────────────────── */
  function render() {
    const all = Store.getAssignments();
    const courses = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

    let list = filterAssignments(all, currentFilter);

    // Sort: completed items by completion time; others by priority desc then due asc
    if (currentFilter !== 'completed') {
      list.sort((a, b) => {
        const sa = priorityScore(a), sb = priorityScore(b);
        if (Math.abs(sa - sb) > 0.01) return sb - sa;
        return new Date(a.due) - new Date(b.due);
      });
    } else {
      list.sort((a, b) => new Date(b.completedAt||0) - new Date(a.completedAt||0));
    }

    const container = document.getElementById('todo-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="todo-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p>No assignments here!</p>
          <small>${currentFilter === 'completed' ? 'Complete some tasks to see them here.' : 'Add an assignment or switch filters.'}</small>
        </div>`;
      return;
    }

    container.innerHTML = list.map(a => {
      const course = courseMap[a.courseId] || { name:'Unknown', color:'#607d8b' };
      const score  = priorityScore(a);
      const pri    = priorityLabel(score);
      const color  = priorityColor(score);
      const days   = DateUtils.daysUntil(a.due);
      const dueCls = days < 0 ? 'due-today' : days === 0 ? 'due-today' : days <= 3 ? 'due-soon' : 'due-later';
      const overdueCls = days < 0 ? 'overdue' : days === 0 ? 'due-today-item' : '';
      const dueText = DateUtils.formatDate(a.due);

      return `
        <div class="todo-item ${overdueCls} ${a.completed ? 'completed' : ''}" data-id="${a.id}">
          <div class="todo-priority-stripe" style="background:${color}"></div>
          <div class="todo-check ${a.completed ? 'checked' : ''}" onclick="Todo.toggle('${a.id}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="todo-content">
            <div class="todo-name">${escHtml(a.name)}</div>
            <div class="todo-meta">
              <span class="todo-course-tag" style="background:${course.color}">${escHtml(course.name)}</span>
              <span class="todo-type-tag">${a.type}</span>
              ${!a.completed ? `<span class="todo-priority-badge ${pri.cls}">${pri.label}</span>` : ''}
            </div>
            ${a.notes ? `<div class="todo-notes">${escHtml(a.notes)}</div>` : ''}
          </div>
          <div class="todo-right">
            <span class="todo-due ${dueCls}">${dueText}</span>
            ${a.points ? `<span class="todo-points">${a.points} pts</span>` : ''}
            <div class="todo-actions">
              <button class="todo-action-btn" onclick="Todo.edit('${a.id}')" title="Edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="todo-action-btn delete" onclick="Todo.delete('${a.id}')" title="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    updateBadge();
  }

  /* ── Badge ────────────────────────────────── */
  function updateBadge() {
    const all = Store.getAssignments();
    const urgent = all.filter(a => !a.completed && DateUtils.daysUntil(a.due) <= 3).length;
    const badge = document.getElementById('todo-badge');
    if (!badge) return;
    if (urgent > 0) {
      badge.textContent = urgent;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  /* ── Actions ──────────────────────────────── */
  function toggle(id) {
    const assignments = Store.getAssignments();
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    a.completed = !a.completed;
    a.completedAt = a.completed ? new Date().toISOString() : null;
    Store.saveAssignments(assignments);
    render();
    App.refreshDashboard();
    App.showToast(a.completed ? `Marked "${a.name}" complete!` : `Unmarked "${a.name}"`, 'success');
  }

  function delete_(id) {
    if (!confirm('Delete this assignment?')) return;
    const assignments = Store.getAssignments().filter(x => x.id !== id);
    Store.saveAssignments(assignments);
    render();
    App.refreshDashboard();
    App.showToast('Assignment deleted.', 'warning');
  }

  function edit(id) {
    const a = Store.getAssignments().find(x => x.id === id);
    if (!a) return;
    editingId = id;

    populateCourseSelect();
    document.getElementById('f-name').value  = a.name;
    document.getElementById('f-course').value = a.courseId;
    document.getElementById('f-type').value  = a.type;
    document.getElementById('f-points').value = a.points || '';
    document.getElementById('f-due').value   = a.due ? a.due.slice(0,16) : '';
    document.getElementById('f-notes').value = a.notes || '';
    document.getElementById('form-title').textContent = 'Edit Assignment';
    document.getElementById('form-submit-btn').textContent = 'Save Changes';

    showAddForm();
    document.getElementById('add-form').scrollIntoView({ behavior:'smooth' });
  }

  function showAddForm() {
    document.getElementById('add-form').classList.remove('hidden');
    document.getElementById('btn-add-task').classList.add('hidden');
    populateCourseSelect();
    if (!editingId) {
      document.getElementById('form-title').textContent = 'Add Assignment';
      document.getElementById('form-submit-btn').textContent = 'Add Assignment';
      // Default due date: tomorrow 11:59pm
      const d = new Date(); d.setDate(d.getDate()+1); d.setHours(23,59,0,0);
      document.getElementById('f-due').value = d.toISOString().slice(0,16);
    }
  }

  function hideAddForm() {
    document.getElementById('add-form').classList.add('hidden');
    document.getElementById('btn-add-task').classList.remove('hidden');
    clearForm();
    editingId = null;
  }

  function clearForm() {
    ['f-name','f-points','f-notes'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-type').value = 'homework';
  }

  function populateCourseSelect() {
    const sel = document.getElementById('f-course');
    const courses = Store.getCourses();
    sel.innerHTML = courses.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
  }

  function submitForm() {
    const name    = document.getElementById('f-name').value.trim();
    const courseId = document.getElementById('f-course').value;
    const type    = document.getElementById('f-type').value;
    const points  = parseInt(document.getElementById('f-points').value) || 0;
    const due     = document.getElementById('f-due').value;
    const notes   = document.getElementById('f-notes').value.trim();

    if (!name) { App.showToast('Please enter a name.', 'error'); return; }
    if (!due)  { App.showToast('Please set a due date.', 'error'); return; }

    const assignments = Store.getAssignments();

    if (editingId) {
      const a = assignments.find(x => x.id === editingId);
      if (a) { a.name = name; a.courseId = courseId; a.type = type; a.points = points; a.due = new Date(due).toISOString(); a.notes = notes; }
      App.showToast('Assignment updated!', 'success');
    } else {
      assignments.push({
        id: 't' + Date.now(),
        courseId, name, type, points,
        due: new Date(due).toISOString(),
        notes, completed: false,
      });
      App.showToast(`"${name}" added!`, 'success');
    }

    Store.saveAssignments(assignments);
    hideAddForm();
    render();
    App.refreshDashboard();
    editingId = null;
  }

  /* ── Filter tabs ──────────────────────────── */
  function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }

  return {
    init() { initFilters(); render(); },
    render,
    toggle,
    delete: delete_,
    edit,
    showAddForm,
    hideAddForm,
    submitForm,
    updateBadge,
  };
})();

function escHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}
