/* ════════════════════════════════════════════════
   Canvas2 — To-Do List with Priority Algorithm
   ════════════════════════════════════════════════ */

const Todo = (() => {
  let currentFilter = 'all';
  let editingId     = null;

  /* ── Priority scoring ─────────────────────
     Urgency  45% — sooner due = higher priority
     Points   35% — more points = higher priority
     Type     20% — exam > test > project > homework
  ─────────────────────────────────────────── */
  const TYPE_WEIGHTS = {
    exam: 1.0, test: 0.9, project: 0.85, essay: 0.75,
    lab: 0.65, quiz: 0.6, discussion: 0.45,
    homework: 0.4, reading: 0.3,
  };

  function priorityScore(a) {
    const days = DateUtils.daysUntil(a.due);
    let urgency;
    if (days < 0)        urgency = 1.0;
    else if (days === 0) urgency = 0.97;
    else if (days <= 1)  urgency = 0.92;
    else if (days <= 3)  urgency = 0.78;
    else if (days <= 7)  urgency = 0.58;
    else if (days <= 14) urgency = 0.38;
    else if (days <= 30) urgency = 0.18;
    else                 urgency = 0.05;

    const pts  = Math.min((a.points || 0) / 200, 1.0);
    const type = TYPE_WEIGHTS[a.type] ?? 0.5;
    return urgency * 0.45 + pts * 0.35 + type * 0.20;
  }

  function priorityLabel(score) {
    if (score >= 0.75) return { label:'Critical', cls:'priority-critical' };
    if (score >= 0.55) return { label:'High',     cls:'priority-high'     };
    if (score >= 0.35) return { label:'Medium',   cls:'priority-medium'   };
    return                    { label:'Low',       cls:'priority-low'      };
  }

  function priorityColor(score) {
    if (score >= 0.75) return '#ea4335';
    if (score >= 0.55) return '#f59e0b';
    if (score >= 0.35) return '#1a73e8';
    return '#34a853';
  }

  /* An item is "done" once it has been submitted in any form —
     submitted, late, pending review, or graded. These are hidden from
     the active to-do views (they live under the Submitted / Graded tabs). */
  const DONE_STATUSES = ['submitted', 'late', 'pending_review', 'graded'];
  function isDone(a) { return DONE_STATUSES.includes(a.status) || a.completed; }

  /* ── Filter ───────────────────────────────── */
  function filterAssignments(all, filter) {
    switch (filter) {
      case 'today':     return all.filter(a => !isDone(a) && DateUtils.isToday(a.due));
      case 'week':      return all.filter(a => !isDone(a) && DateUtils.isThisWeek(a.due) && !DateUtils.isOverdue(a.due));
      case 'overdue':   return all.filter(a => !isDone(a) && !a.missing && DateUtils.isOverdue(a.due));
      case 'missing':   return all.filter(a => (a.missing || a.status === 'missing') && !isDone(a));
      case 'submitted': return all.filter(a => a.status === 'submitted' || a.status === 'late' || a.status === 'pending_review');
      case 'graded':    return all.filter(a => a.status === 'graded');
      // Default ("All"): active to-do. Submitted/late/pending are hidden unless
      // the user turns the preference off; graded is always hidden here.
      default:
        return Store.getPrefs().hideSubmitted
          ? all.filter(a => !isDone(a) && !a.missing)
          : all.filter(a => a.status !== 'graded' && !a.missing);
    }
  }

  /* Active to-do items, filtered + priority-sorted exactly like the
     default ("All") view. Shared with the dashboard's Upcoming list. */
  function getActiveSorted() {
    const list = filterAssignments(Store.getAssignments(), 'all');
    list.sort((a, b) => {
      const sa = priorityScore(a), sb = priorityScore(b);
      return Math.abs(sa - sb) > 0.01 ? sb - sa : new Date(a.due) - new Date(b.due);
    });
    return list;
  }

  /* ── Render ───────────────────────────────── */
  function render() {
    const all       = Store.getAssignments();
    const courses   = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

    let list = filterAssignments(all, currentFilter);

    if (currentFilter !== 'graded' && currentFilter !== 'submitted') {
      list.sort((a, b) => {
        const sa = priorityScore(a), sb = priorityScore(b);
        return Math.abs(sa - sb) > 0.01 ? sb - sa : new Date(a.due) - new Date(b.due);
      });
    } else {
      list.sort((a, b) => new Date(b.due) - new Date(a.due));
    }

    const container = document.getElementById('todo-list');
    if (!container) return;

    if (list.length === 0) {
      const emptyMessages = {
        today:     'No assignments due today.',
        week:      'Nothing due this week.',
        missing:   'No missing assignments! Great job.',
        overdue:   'No overdue assignments.',
        submitted: 'No submitted assignments yet.',
        graded:    'No graded assignments yet.',
        all:       'No pending assignments. Add one or check other filters.',
      };
      container.innerHTML = `
        <div class="todo-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <p>${emptyMessages[currentFilter] || 'Nothing here.'}</p>
        </div>`;
      return;
    }

    container.innerHTML = list.map(a => {
      const course  = courseMap[a.courseId] || { name:'Unknown', color:'#607d8b' };
      const score   = priorityScore(a);
      const pri     = priorityLabel(score);
      const color   = priorityColor(score);
      const days    = DateUtils.daysUntil(a.due);
      const dueCls  = days < 0 ? 'due-today' : days === 0 ? 'due-today' : days <= 3 ? 'due-soon' : 'due-later';
      const borderCls = a.missing ? 'missing-item' : days < 0 ? 'overdue' : days === 0 ? 'due-today-item' : '';
      const isGraded = a.status === 'graded';

      return `
        <div class="todo-item ${borderCls} ${isGraded ? 'graded-item' : ''}" data-id="${a.id}">
          <div class="todo-priority-stripe" style="background:${color}"></div>
          <div class="todo-check ${isGraded || a.status === 'submitted' ? 'checked' : ''}"
               onclick="Todo.toggle('${a.id}')" title="${isGraded ? 'Graded' : 'Mark complete'}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="todo-content">
            <div class="todo-name">${escHtml(a.name)}</div>
            <div class="todo-meta">
              <span class="todo-course-tag" style="background:${course.color}">${escHtml(course.name)}</span>
              <span class="todo-type-tag">${a.type}</span>
              ${statusBadgeHtml(a)}
              ${!isGraded && !a.missing ? `<span class="todo-priority-badge ${pri.cls}">${pri.label}</span>` : ''}
            </div>
            ${a.notes ? `<div class="todo-notes">${escHtml(a.notes)}</div>` : ''}
            ${isGraded && a.score !== null ? `<div class="todo-score">Score: <strong>${a.score}/${a.points}</strong> · ${a.grade || ''}</div>` : ''}
          </div>
          <div class="todo-right">
            <span class="todo-due ${dueCls}">${DateUtils.formatDate(a.due)}</span>
            ${a.points ? `<span class="todo-points">${a.points} pts</span>` : ''}
            <div class="todo-actions">
              ${((a.canvasId && !Store.isDemo()) || a.demoQuiz) && !isGraded
                ? `<button class="todo-action-open" onclick="Work.openAssignmentById('${a.id}')" title="${a.quizId ? 'Take quiz' : 'Submit'} in Canvas2">
                     ${a.quizId ? 'Take' : 'Submit'}
                   </button>`
                : ''}
              ${a.canvasUrl && a.canvasUrl !== '#'
                ? `<a class="todo-action-btn" href="${escHtml(a.canvasUrl)}" target="_blank" rel="noopener" title="Open in Canvas">
                     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                   </a>`
                : ''}
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
    const all    = Store.getAssignments();
    const urgent = all.filter(a => a.status !== 'graded' && (DateUtils.daysUntil(a.due) <= 3 || a.missing)).length;
    const badge  = document.getElementById('todo-badge');
    if (!badge) return;
    if (urgent > 0) { badge.textContent = urgent > 99 ? '99+' : urgent; badge.classList.remove('hidden'); }
    else            { badge.classList.add('hidden'); }
  }

  /* ── Toggle ───────────────────────────────── */
  function toggle(id) {
    const assignments = Store.getAssignments();
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    // Demo quiz → open the interactive demo
    if (a.demoQuiz) { Work.openAssignmentById(a.id); return; }
    // For real Canvas assignments, open the in-app submit/quiz view
    if (a.canvasId && !Store.isDemo()) {
      Work.openAssignmentById(a.id);
      return;
    }
    if (a.canvasUrl && a.canvasUrl !== '#') {
      window.open(a.canvasUrl, '_blank');
      return;
    }
    a.completed = !a.completed;
    a.status    = a.completed ? 'submitted' : 'not_submitted';
    Store.saveAssignments(assignments);
    render();
    App.refreshDashboard();
  }

  /* ── Delete ───────────────────────────────── */
  function delete_(id) {
    if (!confirm('Remove this assignment from Canvas2?')) return;
    const list = Store.getAssignments();
    const a = list.find(x => x.id === id);
    // Tombstone Canvas-sourced items so a background re-sync won't re-add them.
    if (a && a.canvasId) Store.addDeleted(a.canvasId);
    Store.saveAssignments(list.filter(x => x.id !== id));
    render();
    App.refreshDashboard();
    App.showToast('Assignment removed.', 'warning');
  }

  /* ── Edit ─────────────────────────────────── */
  function edit(id) {
    const a = Store.getAssignments().find(x => x.id === id);
    if (!a) return;
    editingId = id;
    populateCourseSelect();
    document.getElementById('f-name').value    = a.name;
    document.getElementById('f-course').value  = a.courseId;
    document.getElementById('f-type').value    = a.type;
    document.getElementById('f-points').value  = a.points || '';
    document.getElementById('f-due').value     = a.due ? toLocalInput(a.due) : '';
    document.getElementById('f-notes').value   = a.notes || '';
    document.getElementById('form-title').textContent       = 'Edit Assignment';
    document.getElementById('form-submit-btn').textContent  = 'Save Changes';
    showAddForm();
    document.getElementById('add-form').scrollIntoView({ behavior:'smooth' });
  }

  /* ── Form ─────────────────────────────────── */

  // datetime-local inputs need local time, not UTC
  function toLocalInput(date) {
    const d   = date instanceof Date ? date : new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function showAddForm() {
    document.getElementById('add-form').classList.remove('hidden');
    document.getElementById('btn-add-task').classList.add('hidden');
    populateCourseSelect();
    if (!editingId) {
      document.getElementById('f-name').value   = '';
      document.getElementById('f-points').value = '';
      document.getElementById('f-notes').value  = '';
      document.getElementById('f-type').value   = 'homework';
      document.getElementById('form-title').textContent      = 'Add Assignment';
      document.getElementById('form-submit-btn').textContent = 'Add Assignment';
      const d = new Date(); d.setDate(d.getDate()+1); d.setHours(23,59,0);
      document.getElementById('f-due').value = toLocalInput(d);
    }
  }

  function hideAddForm() {
    document.getElementById('add-form').classList.add('hidden');
    document.getElementById('btn-add-task').classList.remove('hidden');
    ['f-name','f-points','f-notes'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-type').value = 'homework';
    editingId = null;
  }

  function populateCourseSelect() {
    const sel     = document.getElementById('f-course');
    const courses = Store.getCourses();
    sel.innerHTML = courses.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
  }

  function submitForm() {
    try {
      const name     = (document.getElementById('f-name').value || '').trim();
      const courseId = document.getElementById('f-course').value || '';
      const type     = document.getElementById('f-type').value || 'homework';
      const points   = parseInt(document.getElementById('f-points').value, 10) || 0;
      const dueRaw   = document.getElementById('f-due').value || '';
      const notes    = (document.getElementById('f-notes').value || '').trim();

      if (!name)    { App.showToast('Please enter a name.', 'error'); return; }
      if (!dueRaw)  { App.showToast('Please set a due date.', 'error'); return; }

      const dueDate = new Date(dueRaw);
      if (isNaN(dueDate.getTime())) { App.showToast('That due date looks invalid.', 'error'); return; }
      const due = dueDate.toISOString();

      const assignments = Store.getAssignments();
      const wasEditing  = !!editingId;

      if (wasEditing) {
        const a = assignments.find(x => x.id === editingId);
        if (a) { a.name = name; a.courseId = courseId; a.type = type; a.points = points; a.due = due; a.notes = notes; }
        App.showToast('Assignment updated!', 'success');
      } else {
        assignments.push({
          id: 'u' + Date.now(), canvasId: null, courseId, name, type, points,
          due, notes,
          completed: false, status: 'not_submitted',
          score: null, grade: null, late: false, missing: false,
          canvasUrl: '#',
        });
        App.showToast(`"${name}" added!`, 'success');
      }

      Store.saveAssignments(assignments);
      editingId = null;
      hideAddForm();
      // Switch to "All" so the newly-added item is always visible regardless of filter.
      if (!wasEditing) {
        currentFilter = 'all';
        document.querySelectorAll('.filter-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.filter === 'all'));
      }
      render();
      App.refreshDashboard();
    } catch (err) {
      App.showToast('Could not save: ' + err.message, 'error');
    }
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
    render, toggle, edit, submitForm,
    showAddForm, hideAddForm, updateBadge,
    getActiveSorted, priorityScore, priorityLabel,
    delete: delete_,
  };
})();
