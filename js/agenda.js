/* ════════════════════════════════════════════════
   Canvas2 — Agenda / Planner
   ════════════════════════════════════════════════ */

const Agenda = (() => {
  let weekStart = getMonday(new Date());
  let selectedDate = DateUtils.toDateStr(new Date());

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatWeekLabel(monday) {
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 6);
    const opts = { month: 'long', day: 'numeric' };
    return `${monday.toLocaleDateString('en-US', opts)} – ${friday.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  }

  function prevWeek() {
    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() - 7);
    renderWeek();
  }

  function nextWeek() {
    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() + 7);
    renderWeek();
  }

  function goToToday() {
    weekStart = getMonday(new Date());
    selectedDate = DateUtils.toDateStr(new Date());
    renderWeek();
    renderDayPanel(selectedDate);
  }

  function renderWeek() {
    const label = document.getElementById('week-label');
    if (label) label.textContent = formatWeekLabel(weekStart);

    const grid = document.getElementById('week-grid');
    if (!grid) return;

    const assignments = Store.getAssignments();
    const notes = Store.getNotes();
    const today = DateUtils.toDateStr(new Date());
    const courses = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let html = '';

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dateStr = DateUtils.toDateStr(day);
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      const hasNote = !!notes[dateStr];

      const dayAssignments = assignments.filter(a =>
        !a.completed && DateUtils.toDateStr(new Date(a.due)) === dateStr
      );

      const dots = dayAssignments.slice(0, 5).map(a => {
        const color = courseMap[a.courseId]?.color || '#607d8b';
        return `<div class="day-dot" style="background:${color}" title="${escHtml(a.name)}"></div>`;
      }).join('');

      const noteIndicator = hasNote ? `<div class="day-dot" style="background:#9ca3af" title="Has notes"></div>` : '';

      html += `
        <div class="day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
             data-date="${dateStr}" onclick="Agenda.selectDay('${dateStr}')">
          <div class="day-cell-header">
            <div class="day-cell-name">${dayNames[i]}</div>
            ${isToday
              ? `<div class="day-cell-num">${day.getDate()}</div>`
              : `<div class="day-cell-num" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;${isSelected ? 'background:var(--primary);color:#fff;font-size:.9rem;' : ''}">${day.getDate()}</div>`}
          </div>
          <div class="day-cell-dots">${dots}${noteIndicator}</div>
          ${dayAssignments.length > 5 ? `<div style="font-size:.65rem;color:var(--text-3);margin-top:3px;">+${dayAssignments.length - 5} more</div>` : ''}
        </div>`;
    }

    grid.innerHTML = html;
  }

  function selectDay(dateStr) {
    selectedDate = dateStr;
    renderWeek();
    renderDayPanel(dateStr);
  }

  function renderDayPanel(dateStr) {
    const panel = document.getElementById('day-panel');
    if (!panel) return;

    const title = document.getElementById('day-panel-title');
    if (title) {
      const d = new Date(dateStr + 'T12:00:00');
      title.textContent = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    }

    // Assignments due this day
    const assignments = Store.getAssignments();
    const courses = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
    const dayTasks = assignments.filter(a => DateUtils.toDateStr(new Date(a.due)) === dateStr);

    const tasksEl = document.getElementById('day-tasks');
    if (tasksEl) {
      if (dayTasks.length === 0) {
        tasksEl.innerHTML = '<div class="agenda-empty">No assignments due this day.</div>';
      } else {
        tasksEl.innerHTML = dayTasks.map(a => {
          const c = courseMap[a.courseId] || { color:'#607d8b', name:'Unknown' };
          return `
            <div class="day-task-item ${a.completed ? 'completed' : ''}">
              <div class="dot" style="background:${c.color}"></div>
              <span class="day-task-name" style="${a.completed ? 'text-decoration:line-through;opacity:.6' : ''}">${escHtml(a.name)}</span>
              ${a.points ? `<span class="day-task-pts">${a.points}pt</span>` : ''}
            </div>`;
        }).join('');
      }
    }

    // Notes
    const notes = Store.getNotes();
    const notesInput = document.getElementById('day-notes-input');
    if (notesInput) {
      notesInput.value = notes[dateStr] || '';
      notesInput.dataset.date = dateStr;
    }
  }

  function saveNotes() {
    const input = document.getElementById('day-notes-input');
    if (!input) return;
    const dateStr = input.dataset.date || selectedDate;
    Store.saveNote(dateStr, input.value);
    App.showToast('Notes saved!', 'success');
    renderWeek(); // refresh dots
  }

  /* ── Dashboard: render today's agenda ──────── */
  function renderDashToday() {
    const todayStr = DateUtils.toDateStr(new Date());
    const assignments = Store.getAssignments().filter(a =>
      !a.completed && DateUtils.toDateStr(new Date(a.due)) === todayStr
    );
    const notes = Store.getNotes()[todayStr] || '';
    const courses = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
    const el = document.getElementById('dash-agenda');
    if (!el) return;

    let html = '';
    if (assignments.length === 0 && !notes) {
      html = '<div class="agenda-empty">Nothing scheduled for today.</div>';
    } else {
      html = assignments.map(a => {
        const c = courseMap[a.courseId] || { color:'#607d8b' };
        return `
          <div class="agenda-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style="flex:1;font-size:.85rem;color:var(--text-1)">${escHtml(a.name)}</span>
            <span style="width:8px;height:8px;border-radius:50%;background:${c.color};flex-shrink:0"></span>
          </div>`;
      }).join('');
      if (notes) {
        html += `<div class="agenda-item" style="border-top:1px solid var(--border-light);margin-top:4px;padding-top:10px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style="font-size:.82rem;color:var(--text-3);font-style:italic">${escHtml(notes.slice(0,80))}${notes.length>80?'…':''}</span>
        </div>`;
      }
    }
    el.innerHTML = html;
  }

  return {
    init() {
      renderWeek();
      renderDayPanel(selectedDate);
    },
    prevWeek, nextWeek, goToToday,
    selectDay, saveNotes,
    renderDashToday,
  };
})();
