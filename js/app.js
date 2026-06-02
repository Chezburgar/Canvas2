/* ════════════════════════════════════════════════
   Canvas2 — Main App Controller
   ════════════════════════════════════════════════ */

const App = (() => {
  let currentUser = null;
  let currentView = 'dashboard';

  /* ── Boot ─────────────────────────────────── */
  function init() {
    const user = Store.getUser();
    if (user) {
      signInUser(user, false);
    } else {
      document.getElementById('view-login').style.display = 'flex';
    }
  }

  /* ── Auth ─────────────────────────────────── */
  function signInDemo() {
    const demoUser = {
      name: 'Alex Johnson',
      email: 'ajohnson@mcpsmd.net',
      picture: '',
      isDemo: true,
    };
    Store.saveUser(demoUser);
    signInUser(demoUser, true);
  }

  function signInUser(user, animate) {
    currentUser = user;
    Store.saveUser(user);

    // Hide login, show app
    document.getElementById('view-login').style.display = 'none';
    const shell = document.getElementById('app-shell');
    shell.classList.remove('hidden');
    if (animate) shell.style.animation = 'fadeIn 0.3s ease';

    // Populate user info
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    const avatarSrc = user.picture || '';

    ['sidebar-avatar', 'topbar-avatar', 'settings-avatar'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (avatarSrc) { el.src = avatarSrc; el.style.background = ''; }
      else {
        el.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%231a73e8' rx='20'/><text y='27' x='20' text-anchor='middle' font-size='16' font-family='Arial' font-weight='bold' fill='white'>${initials}</text></svg>`;
      }
    });

    if (document.getElementById('sidebar-user-name')) document.getElementById('sidebar-user-name').textContent = user.name;
    if (document.getElementById('sidebar-user-email')) document.getElementById('sidebar-user-email').textContent = user.email;
    if (document.getElementById('topbar-user-name')) document.getElementById('topbar-user-name').textContent = user.name.split(' ')[0];
    if (document.getElementById('settings-name')) document.getElementById('settings-name').textContent = user.name;
    if (document.getElementById('settings-email')) document.getElementById('settings-email').textContent = user.email;

    // Wire nav
    wireNav();

    // Init modules
    Todo.init();
    Agenda.init();
    renderDashboard();
    renderCourses();
    renderThemePicker();

    navigate('dashboard');
  }

  function signOut() {
    if (!confirm('Sign out of Canvas2?')) return;
    Store.clear();
    currentUser = null;
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('view-login').style.display = 'flex';
    showToast('Signed out successfully.', 'success');
  }

  /* ── Navigation ───────────────────────────── */
  function wireNav() {
    document.querySelectorAll('[data-view]').forEach(el => {
      if (el.tagName === 'A' && el.href && !el.href.includes('#')) return; // external link
      el.addEventListener('click', (e) => {
        const view = el.dataset.view;
        if (view) { e.preventDefault(); navigate(view); }
      });
    });
  }

  function navigate(viewName) {
    currentView = viewName;

    // Update content views
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    // Update nav highlights
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Refresh view-specific content
    if (viewName === 'dashboard') refreshDashboard();
    if (viewName === 'todo')      Todo.render();
    if (viewName === 'agenda')    Agenda.init();
    if (viewName === 'courses')   renderCourses();
    if (viewName === 'settings')  renderThemePicker();

    closeSidebar();
    window.scrollTo(0, 0);
  }

  /* ── Dashboard ────────────────────────────── */
  function renderDashboard() {
    updateGreeting();
    renderUpcoming();
    renderMiniCourses();
    renderAnnouncements();
    Agenda.renderDashToday();
    updateStats();
  }

  function refreshDashboard() {
    if (currentView === 'dashboard') renderDashboard();
    else updateStats();
  }

  function updateGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const name = currentUser ? `, ${currentUser.name.split(' ')[0]}` : '';
    const el = document.getElementById('dashboard-greeting');
    if (el) el.textContent = `${greet}${name}!`;

    const dateEl = document.getElementById('dashboard-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday:'long', month:'long', day:'numeric', year:'numeric'
    });
  }

  function updateStats() {
    const all = Store.getAssignments();
    const courses = Store.getCourses();
    const today = DateUtils.toDateStr(new Date());

    const pending   = all.filter(a => !a.completed).length;
    const dueToday  = all.filter(a => !a.completed && DateUtils.toDateStr(new Date(a.due)) === today).length;
    const completed = all.filter(a => a.completed).length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-pending',   pending);
    set('stat-due-today', dueToday);
    set('stat-completed', completed);
    set('stat-courses',   courses.length);

    Todo.updateBadge();
  }

  function renderUpcoming() {
    const assignments = Store.getAssignments().filter(a => !a.completed);
    const courses = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

    assignments.sort((a, b) => new Date(a.due) - new Date(b.due));
    const upcoming = assignments.slice(0, 6);

    const el = document.getElementById('dash-upcoming');
    if (!el) return;

    if (upcoming.length === 0) {
      el.innerHTML = '<div class="agenda-empty">All caught up! No pending assignments.</div>';
      return;
    }

    el.innerHTML = upcoming.map(a => {
      const c = courseMap[a.courseId] || { color:'#607d8b', name:'' };
      const days = DateUtils.daysUntil(a.due);
      const dueCls = days < 0 ? 'due-today' : days === 0 ? 'due-today' : days <= 3 ? 'due-soon' : 'due-later';
      return `
        <div class="upcoming-item" onclick="App.navigate('todo')">
          <div class="upcoming-dot" style="background:${c.color}"></div>
          <div class="upcoming-info">
            <div class="upcoming-name">${escHtml(a.name)}</div>
            <div class="upcoming-meta">${escHtml(c.name)} · ${a.type}${a.points ? ` · ${a.points}pt` : ''}</div>
          </div>
          <span class="upcoming-due ${dueCls}">${DateUtils.formatDate(a.due)}</span>
        </div>`;
    }).join('');
  }

  function renderMiniCourses() {
    const courses = Store.getCourses();
    const el = document.getElementById('dash-courses');
    if (!el) return;
    el.innerHTML = courses.map(c => `
      <div class="mini-course-card" style="background:${c.color}" onclick="App.openCourseModal('${c.id}')">
        <div class="mini-course-name">${escHtml(c.name)}</div>
        <div class="mini-course-teacher">${escHtml(c.teacher)}</div>
      </div>
    `).join('');
  }

  function renderAnnouncements() {
    const anns = Store.getAnnouncements();
    const el = document.getElementById('dash-announcements');
    if (!el) return;
    el.innerHTML = anns.map(a => `
      <div class="announcement-item">
        <div class="ann-course">${escHtml(a.courseName)}</div>
        <div class="ann-title">${escHtml(a.title)}</div>
        <div class="ann-date">${DateUtils.formatDate(a.date)}</div>
      </div>
    `).join('');
  }

  /* ── Courses view ─────────────────────────── */
  function renderCourses() {
    const courses = Store.getCourses();
    const assignments = Store.getAssignments();
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    grid.innerHTML = courses.map(c => {
      const courseAssignments = assignments.filter(a => a.courseId === c.id && !a.completed);
      const gradeColor = c.grade >= 90 ? '#1e8e3e' : c.grade >= 80 ? '#1a73e8' : c.grade >= 70 ? '#f59e0b' : '#ea4335';
      return `
        <div class="course-card" onclick="App.openCourseModal('${c.id}')">
          <div class="course-card-banner" style="background:${c.color}">
            <div class="course-card-banner-text">
              <div class="course-code">${escHtml(c.code)}</div>
              <div class="course-name">${escHtml(c.name)}</div>
            </div>
          </div>
          <div class="course-card-body">
            <div class="course-teacher">Teacher: <span>${escHtml(c.teacher)}</span></div>
            <div class="course-progress-label">
              <span>Current Grade</span>
              <span style="color:${gradeColor};font-size:.85rem">${c.grade}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width:${c.grade}%;background:${gradeColor}"></div>
            </div>
            <div class="course-footer">
              <span class="course-tag">Room ${escHtml(c.room)}</span>
              <span class="course-tag">${courseAssignments.length} pending</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── Course Modal ─────────────────────────── */
  function openCourseModal(courseId) {
    const course = Store.getCourses().find(c => c.id === courseId);
    if (!course) return;

    const assignments = Store.getAssignments()
      .filter(a => a.courseId === courseId && !a.completed)
      .sort((a, b) => new Date(a.due) - new Date(b.due));

    document.getElementById('modal-title').textContent = course.name;

    const gradeColor = course.grade >= 90 ? '#1e8e3e' : course.grade >= 80 ? '#1a73e8' : course.grade >= 70 ? '#f59e0b' : '#ea4335';

    document.getElementById('modal-body').innerHTML = `
      <div style="display:flex;gap:20px;margin-bottom:18px;flex-wrap:wrap">
        <div><span style="font-size:.75rem;color:var(--text-3);font-weight:600;text-transform:uppercase">Teacher</span><div style="font-weight:500;margin-top:2px">${escHtml(course.teacher)}</div></div>
        <div><span style="font-size:.75rem;color:var(--text-3);font-weight:600;text-transform:uppercase">Room</span><div style="font-weight:500;margin-top:2px">${escHtml(course.room)}</div></div>
        <div><span style="font-size:.75rem;color:var(--text-3);font-weight:600;text-transform:uppercase">Grade</span><div style="font-weight:700;color:${gradeColor};margin-top:2px">${course.grade}%</div></div>
      </div>
      <div class="modal-assignments-title">Upcoming Assignments (${assignments.length})</div>
      ${assignments.length === 0
        ? '<div style="color:var(--text-3);font-size:.85rem;padding:10px 0">No pending assignments.</div>'
        : assignments.map(a => `
            <div class="modal-assignment-item">
              <div style="width:8px;height:8px;border-radius:50%;background:${course.color};flex-shrink:0"></div>
              <span class="modal-assignment-name">${escHtml(a.name)}</span>
              <span class="modal-assignment-due">${DateUtils.formatDate(a.due)}</span>
              ${a.points ? `<span class="modal-assignment-pts">${a.points}pt</span>` : ''}
            </div>`).join('')
      }`;

    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  /* ── Sidebar (mobile) ─────────────────────── */
  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    const overlay = document.getElementById('sidebar-overlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    const overlay = document.getElementById('sidebar-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('visible');
  }

  /* ── Search ───────────────────────────────── */
  function onSearch(query) {
    if (!query.trim()) { Todo.render(); return; }
    const q = query.toLowerCase();
    const assignments = Store.getAssignments().filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.notes||'').toLowerCase().includes(q)
    );
    const courses = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

    navigate('todo');

    const container = document.getElementById('todo-list');
    if (!container) return;
    if (assignments.length === 0) {
      container.innerHTML = `<div class="todo-empty"><p>No results for "${escHtml(query)}"</p></div>`;
      return;
    }
    // Borrow Todo's render with filtered data
    container.innerHTML = assignments.map(a => {
      const c = courseMap[a.courseId] || { name:'Unknown', color:'#607d8b' };
      return `
        <div class="todo-item" style="border-left:4px solid ${c.color}">
          <div class="todo-content" style="padding-left:4px">
            <div class="todo-name">${escHtml(a.name)}</div>
            <div class="todo-meta">
              <span class="todo-course-tag" style="background:${c.color}">${escHtml(c.name)}</span>
              <span class="todo-type-tag">${a.type}</span>
            </div>
          </div>
          <div class="todo-right">
            <span class="todo-due">${DateUtils.formatDate(a.due)}</span>
          </div>
        </div>`;
    }).join('');
  }

  /* ── Data actions ─────────────────────────── */
  function exportData_() {
    exportData(); // from data.js
    showToast('Data exported!', 'success');
  }

  function clearData() {
    if (!confirm('Clear ALL Canvas2 data? This cannot be undone.')) return;
    Store.clear();
    showToast('All data cleared. Reloading…', 'warning');
    setTimeout(() => location.reload(), 1500);
  }

  /* ── Toast ────────────────────────────────── */
  function showToast(message, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
      success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      error:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };
    toast.innerHTML = (icons[type] || '') + escHtml(message);
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  }

  /* ── Sidebar close button ─────────────────── */
  function wireSidebarClose() {
    const btn = document.getElementById('sidebar-close-btn');
    if (btn) btn.addEventListener('click', closeSidebar);
  }

  return {
    init,
    signInDemo,
    signOut,
    navigate,
    refreshDashboard,
    openCourseModal,
    closeModal,
    openSidebar,
    closeSidebar,
    onSearch,
    exportData: exportData_,
    clearData,
    showToast,
  };
})();

/* ── Google OAuth callback ────────────────────── */
function handleGoogleCredential(response) {
  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const user = {
      name: payload.name || 'Student',
      email: payload.email || '',
      picture: payload.picture || '',
      isDemo: false,
    };
    Store.saveUser(user);
    App.signInUser ? App.init() : location.reload();
    // Re-init with user
    App.init();
  } catch {
    App.showToast('Google sign-in failed. Try Demo Mode.', 'error');
  }
}

/* ── Start ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Wire sidebar close
  const closeBtn = document.getElementById('sidebar-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', App.closeSidebar);
});
