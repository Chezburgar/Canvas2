/* ════════════════════════════════════════════════
   Canvas2 — Main App Controller
   ════════════════════════════════════════════════ */

const App = (() => {
  let currentUser = null;
  let currentView = 'dashboard';
  let syncing     = false;

  /* ── Boot ─────────────────────────────────── */
  function init() {
    const cfg  = Store.getCanvasCfg();
    const user = Store.getUser();

    if (cfg && user) {
      CanvasAPI.init(cfg.domain, cfg.token, cfg.proxyUrl);
      signInUser(user, false);
    } else {
      showLogin();
    }
  }

  function showLogin() {
    document.getElementById('view-login').style.display = 'flex';
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('sync-screen').classList.add('hidden');

    // Prefill domain + proxy (never the token) for convenience
    const prefs = Store.getLoginPrefs();
    if (prefs) {
      if (prefs.domain)   document.getElementById('login-domain').value = prefs.domain;
      if (prefs.proxyUrl) document.getElementById('login-proxy').value  = prefs.proxyUrl;
    }
  }

  /* ── Canvas Connect ───────────────────────── */
  async function connectCanvas() {
    const domain   = document.getElementById('login-domain').value.trim();
    const token    = document.getElementById('login-token').value.trim();
    const proxyUrl = document.getElementById('login-proxy').value.trim();
    const errEl    = document.getElementById('login-error');
    const label    = document.getElementById('connect-label');
    const spinner  = document.getElementById('connect-spinner');

    if (!domain)   { showLoginError('Please enter your Canvas domain.'); return; }
    if (!token)    { showLoginError('Please paste your Canvas access token.'); return; }
    if (!proxyUrl) {
      showLoginError('Please enter your Proxy URL. Canvas can’t be reached without it — see the setup note above.');
      return;
    }
    if (!/^https:\/\/.+/.test(proxyUrl)) {
      showLoginError('Proxy URL must start with https:// (your Cloudflare Worker URL).');
      return;
    }

    errEl.classList.add('hidden');
    label.textContent = 'Connecting…';
    spinner.classList.remove('hidden');
    document.getElementById('btn-connect').disabled = true;

    try {
      CanvasAPI.init(domain, token, proxyUrl);
      const user = await CanvasAPI.getUser();

      const userData = {
        name:    user.name || user.short_name || 'Student',
        email:   user.email || user.login_id || '',
        picture: user.avatar_url || '',
        isDemo:  false,
      };
      Store.saveUser(userData);
      Store.saveCanvasCfg({ domain, token, proxyUrl });
      Store.saveLoginPrefs({ domain, proxyUrl });
      Store.setDemo(false);

      // Show sync screen
      document.getElementById('view-login').style.display = 'none';
      await runSync();

      signInUser(userData, true);
    } catch (err) {
      let msg;
      if (err.message === 'INVALID_TOKEN') {
        msg = 'Invalid token — Canvas rejected it. Generate a fresh token and try again.';
      } else if (err.message === 'NETWORK' || err.message.includes('Failed to fetch')) {
        msg = 'Could not reach your proxy. Double-check the Proxy URL is correct and the Worker is deployed.';
      } else {
        msg = `Error: ${err.message}`;
      }
      showLoginError(msg);
    } finally {
      label.textContent = 'Connect to Canvas';
      spinner.classList.add('hidden');
      document.getElementById('btn-connect').disabled = false;
    }
  }

  function showLoginError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  /* ── Sync ─────────────────────────────────── */
  async function runSync() {
    if (syncing) return;
    syncing = true;

    const screen   = document.getElementById('sync-screen');
    const fill     = document.getElementById('sync-fill');
    const pctEl    = document.getElementById('sync-pct');
    const statusEl = document.getElementById('sync-status-text');
    screen.classList.remove('hidden');

    try {
      const { user, courses, assignments, announcements } = await CanvasAPI.syncAll((msg, pct) => {
        fill.style.width = pct + '%';
        pctEl.textContent = pct + '%';
        statusEl.textContent = msg;
      });

      Store.saveCourses(courses);
      Store.saveAssignments(assignments);
      Store.saveAnnouncements(announcements);
      Store.saveLastSync();

      // Merge user info if we have more details
      const saved = Store.getUser();
      if (saved && !saved.name && user) {
        saved.name = user.name;
        saved.email = user.email || saved.email;
        saved.picture = user.avatar_url || saved.picture;
        Store.saveUser(saved);
      }
    } catch (err) {
      showToast('Sync error: ' + err.message, 'error');
    } finally {
      syncing = false;
      screen.classList.add('hidden');
    }
  }

  async function syncNow() {
    if (Store.isDemo()) { showToast('Sync unavailable in demo mode.', 'warning'); return; }
    if (!CanvasAPI.isConfigured()) { showToast('Not connected to Canvas.', 'error'); return; }
    if (syncing) return;

    const icon = document.getElementById('sync-icon');
    if (icon) icon.style.animation = 'spin 1s linear infinite';

    showToast('Syncing with Canvas…');

    try {
      await runSync();
      refreshAll();
      updateSyncTime();
      showToast('Canvas data updated!', 'success');
    } catch {
      showToast('Sync failed. Check your connection.', 'error');
    } finally {
      if (icon) icon.style.animation = '';
    }
  }

  function reconnect() {
    if (!confirm('This will clear your Canvas connection. Continue?')) return;
    Store.clear();
    location.reload();
  }

  /* ── Demo mode ────────────────────────────── */
  function signInDemo() {
    const demoUser = { name:'Alex Johnson', email:'ajohnson@mcpsmd.net', picture:'', isDemo:true };
    Store.saveUser(demoUser);
    Store.setDemo(true);
    signInUser(demoUser, true);
    showToast('Demo mode — data is simulated.', 'warning');
  }

  /* ── Sign in ──────────────────────────────── */
  function signInUser(user, _animate) {
    currentUser = user;

    document.getElementById('view-login').style.display = 'none';
    document.getElementById('sync-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');

    // Populate user info
    const initials = (user.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    const avatarSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%231a73e8' rx='20'/><text y='27' x='20' text-anchor='middle' font-size='16' font-family='Arial' font-weight='bold' fill='white'>${initials}</text></svg>`;

    ['sidebar-avatar','topbar-avatar','settings-avatar'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.src = user.picture || avatarSvg;
    });

    setEl('sidebar-user-name',   user.name);
    setEl('sidebar-user-email',  user.email);
    setEl('topbar-user-name',    user.name.split(' ')[0]);
    setEl('settings-name',       user.name);
    setEl('settings-email',      user.email);

    const cfg = Store.getCanvasCfg();
    if (cfg) setEl('settings-canvas-domain', `Canvas: ${cfg.domain}`);

    wireNav();
    Todo.init();
    Agenda.init();
    renderDashboard();
    renderCourses();
    renderThemePicker();
    populateCourseSelects();
    updateSyncTime();

    navigate('dashboard');
  }

  function signOut() {
    if (!confirm('Sign out of Canvas2?')) return;
    Store.clear();
    location.reload();
  }

  /* ── Navigation ───────────────────────────── */
  function wireNav() {
    document.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', e => {
        const view = el.dataset.view;
        if (view) { e.preventDefault(); navigate(view); }
      });
    });
  }

  function navigate(viewName) {
    currentView = viewName;
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-item[data-view]').forEach(item =>
      item.classList.toggle('active', item.dataset.view === viewName)
    );
    closeSidebar();

    if (viewName === 'dashboard')   refreshDashboard();
    if (viewName === 'todo')        Todo.render();
    if (viewName === 'agenda')      Agenda.init();
    if (viewName === 'courses')     renderCourses();
    if (viewName === 'settings')    { renderThemePicker(); updateSyncTimeSettings(); }
  }

  /* ── Dashboard ────────────────────────────── */
  function renderDashboard() {
    updateGreeting();
    updateStats();
    renderUpcoming();
    renderMiniCourses();
    renderAnnouncements();
    Agenda.renderDashToday();
  }

  function refreshDashboard()  { if (currentView === 'dashboard') renderDashboard(); else updateStats(); }
  function refreshAll()        { Todo.render(); renderDashboard(); renderCourses(); }

  function updateGreeting() {
    const h     = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const name  = currentUser ? `, ${currentUser.name.split(' ')[0]}` : '';
    setEl('dashboard-greeting', `${greet}${name}!`);
    setEl('dashboard-date', new Date().toLocaleDateString('en-US', {
      weekday:'long', month:'long', day:'numeric', year:'numeric',
    }));
  }

  function updateStats() {
    const all     = Store.getAssignments();
    const today   = DateUtils.toDateStr(new Date());
    const pending   = all.filter(a => !a.completed && a.status !== 'graded').length;
    const dueToday  = all.filter(a => a.status !== 'graded' && DateUtils.toDateStr(new Date(a.due)) === today).length;
    const missing   = all.filter(a => a.missing || a.status === 'missing').length;
    const submitted = all.filter(a => a.status === 'submitted' || a.status === 'graded' || a.status === 'late').length;

    setEl('stat-pending',   pending);
    setEl('stat-due-today', dueToday);
    setEl('stat-missing',   missing);
    setEl('stat-submitted', submitted);

    // Missing alert
    const alertEl = document.getElementById('missing-alert');
    if (alertEl) {
      if (missing > 0) {
        alertEl.classList.remove('hidden');
        setEl('missing-alert-text', `${missing} missing assignment${missing > 1 ? 's' : ''}`);
      } else {
        alertEl.classList.add('hidden');
      }
    }

    Todo.updateBadge();
  }

  function renderUpcoming() {
    const all = Store.getAssignments()
      .filter(a => a.status !== 'graded' && !a.missing)
      .sort((a, b) => new Date(a.due) - new Date(b.due))
      .slice(0, 7);
    const courses  = Store.getCourses();
    const cMap     = Object.fromEntries(courses.map(c => [c.id, c]));
    const el       = document.getElementById('dash-upcoming');
    if (!el) return;

    if (all.length === 0) {
      el.innerHTML = '<div class="agenda-empty">All caught up! No pending assignments.</div>';
      return;
    }

    el.innerHTML = all.map(a => {
      const c      = cMap[a.courseId] || { color:'#607d8b', name:'' };
      const days   = DateUtils.daysUntil(a.due);
      const dueCls = days < 0 ? 'due-today' : days === 0 ? 'due-today' : days <= 3 ? 'due-soon' : 'due-later';
      const statusBadge = statusBadgeHtml(a);
      return `
        <div class="upcoming-item" onclick="App.navigate('todo')">
          <div class="upcoming-dot" style="background:${c.color}"></div>
          <div class="upcoming-info">
            <div class="upcoming-name">${escHtml(a.name)}</div>
            <div class="upcoming-meta">${escHtml(c.name)}${a.points ? ` · ${a.points}pt` : ''}</div>
          </div>
          ${statusBadge}
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
        ${c.grade !== null ? `<div class="mini-course-grade">${c.gradeLetter || c.grade + '%'}</div>` : ''}
      </div>`).join('');
  }

  function renderAnnouncements() {
    const anns = Store.getAnnouncements();
    const el   = document.getElementById('dash-announcements');
    if (!el) return;
    if (anns.length === 0) {
      el.innerHTML = '<div class="agenda-empty">No recent announcements.</div>';
      return;
    }
    el.innerHTML = anns.map(a => `
      <div class="announcement-item" ${a.url && a.url !== '#' ? `onclick="window.open('${escHtml(a.url)}','_blank')" style="cursor:pointer"` : ''}>
        <div class="ann-course">${escHtml(a.courseName)}</div>
        <div class="ann-title">${escHtml(a.title)}</div>
        <div class="ann-date">${DateUtils.formatDate(a.date)}</div>
      </div>`).join('');
  }

  /* ── Courses view ─────────────────────────── */
  function renderCourses() {
    const courses     = Store.getCourses();
    const assignments = Store.getAssignments();
    const grid        = document.getElementById('courses-grid');
    if (!grid) return;

    grid.innerHTML = courses.map(c => {
      const pending = assignments.filter(a => a.courseId === c.id && a.status !== 'graded' && !a.missing).length;
      const missing = assignments.filter(a => a.courseId === c.id && (a.missing || a.status === 'missing')).length;
      const gradeColor = c.grade === null ? '#607d8b'
        : c.grade >= 90 ? '#1e8e3e'
        : c.grade >= 80 ? '#1a73e8'
        : c.grade >= 70 ? '#f59e0b'
        : '#ea4335';
      const gradeBar = c.grade !== null
        ? `<div class="course-progress-label">
             <span>Current Grade</span>
             <span style="color:${gradeColor};font-size:.85rem;font-weight:700">${c.gradeLetter || c.grade + '%'}</span>
           </div>
           <div class="progress-bar-track">
             <div class="progress-bar-fill" style="width:${c.grade}%;background:${gradeColor}"></div>
           </div>`
        : `<div class="course-progress-label"><span>Grade</span><span style="color:var(--text-3)">Not available</span></div>`;

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
            ${gradeBar}
            <div class="course-footer">
              ${c.room ? `<span class="course-tag">Room ${escHtml(c.room)}</span>` : ''}
              <span class="course-tag">${pending} pending</span>
              ${missing > 0 ? `<span class="course-tag missing-tag">${missing} missing</span>` : ''}
              ${c.canvasUrl && c.canvasUrl !== '#'
                ? `<a class="course-tag canvas-link-tag" href="${escHtml(c.canvasUrl)}" target="_blank" onclick="event.stopPropagation()">Open in Canvas</a>`
                : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── Course modal ─────────────────────────── */
  function openCourseModal(courseId) {
    const course = Store.getCourses().find(c => c.id === courseId);
    if (!course) return;

    const assignments = Store.getAssignments()
      .filter(a => a.courseId === courseId)
      .sort((a, b) => new Date(a.due) - new Date(b.due));

    const pending  = assignments.filter(a => a.status !== 'graded' && !a.missing);
    const graded   = assignments.filter(a => a.status === 'graded');
    const missing  = assignments.filter(a => a.missing || a.status === 'missing');

    document.getElementById('modal-title').textContent = course.name;

    const gradeColor = course.grade === null ? '#607d8b'
      : course.grade >= 90 ? '#1e8e3e'
      : course.grade >= 80 ? '#1a73e8'
      : course.grade >= 70 ? '#f59e0b' : '#ea4335';

    const openAttr = (a) => {
      if (!Store.isDemo() && a.canvasId) return `onclick="App.closeModal();Work.openAssignmentById('${a.id}')" style="cursor:pointer"`;
      if (a.canvasUrl && a.canvasUrl !== '#') return `onclick="window.open('${escHtml(a.canvasUrl)}','_blank')" style="cursor:pointer"`;
      return '';
    };
    const assignmentList = (list, label) => list.length === 0 ? '' : `
      <div class="modal-section-title">${label} (${list.length})</div>
      ${list.map(a => `
        <div class="modal-assignment-item" ${openAttr(a)}>
          <div style="width:8px;height:8px;border-radius:50%;background:${course.color};flex-shrink:0"></div>
          <span class="modal-assignment-name">${escHtml(a.name)}</span>
          ${statusBadgeHtml(a)}
          <span class="modal-assignment-due">${DateUtils.formatDate(a.due)}</span>
          ${a.score !== null ? `<span class="modal-assignment-pts">${a.score}/${a.points}</span>`
            : a.points ? `<span class="modal-assignment-pts">${a.points}pt</span>` : ''}
        </div>`).join('')}`;

    document.getElementById('modal-body').innerHTML = `
      <div style="display:flex;gap:20px;margin-bottom:18px;flex-wrap:wrap;align-items:center">
        <div><div style="font-size:.75rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Teacher</div><div style="font-weight:500;margin-top:2px">${escHtml(course.teacher)}</div></div>
        ${course.room ? `<div><div style="font-size:.75rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Room</div><div style="font-weight:500;margin-top:2px">${escHtml(course.room)}</div></div>` : ''}
        ${course.grade !== null ? `<div><div style="font-size:.75rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Grade</div><div style="font-weight:800;font-size:1.2rem;color:${gradeColor};margin-top:2px">${course.gradeLetter || course.grade + '%'}</div></div>` : ''}
        ${course.canvasUrl && course.canvasUrl !== '#'
          ? `<a href="${escHtml(course.canvasUrl)}" target="_blank" class="btn-secondary btn-sm" style="margin-left:auto" onclick="event.stopPropagation()">Open in Canvas</a>`
          : ''}
      </div>
      ${assignmentList(missing, '⚠ Missing')}
      ${assignmentList(pending, 'Upcoming')}
      ${assignmentList(graded, 'Recently Graded')}
      ${assignments.length === 0 ? '<div style="color:var(--text-3);font-size:.85rem">No assignments found.</div>' : ''}`;

    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  /* ── Modules view ─────────────────────────── */
  async function loadModules(courseId) {
    const container = document.getElementById('modules-container');
    if (!courseId) return;

    // Check cache first
    const cached = Store.getModules(courseId);
    if (cached) { renderModules(cached, courseId); return; }

    if (Store.isDemo()) {
      container.innerHTML = '<div class="agenda-empty">Modules require a real Canvas connection.</div>';
      return;
    }

    container.innerHTML = '<div class="agenda-empty"><div class="loading-spinner"></div> Loading modules…</div>';

    try {
      const course    = Store.getCourses().find(c => c.id === courseId);
      const canvasId  = course?.canvasId;
      if (!canvasId) { container.innerHTML = '<div class="agenda-empty">Course not found.</div>'; return; }

      const modules = await CanvasAPI.syncModules(canvasId);
      Store.saveModules(courseId, modules);
      renderModules(modules, courseId);
    } catch (err) {
      container.innerHTML = `<div class="agenda-empty">Failed to load modules: ${escHtml(err.message)}</div>`;
    }
  }

  const MODULE_TYPE_ICONS = {
    Assignment:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    Quiz:         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    File:         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    Page:         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    Discussion:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    ExternalUrl:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    ExternalTool: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  };

  function renderModules(modules, courseId) {
    const container = document.getElementById('modules-container');
    if (!modules || modules.length === 0) {
      container.innerHTML = '<div class="agenda-empty">No modules found for this course.</div>';
      return;
    }

    const course   = Store.getCourses().find(c => c.id === courseId);
    const canvasId = course?.canvasId;
    const actionable = { Assignment: true, Quiz: true };

    container.innerHTML = modules.map(mod => {
      const items = (mod.items || []).map(item => {
        if (item.type === 'SubHeader') {
          return `<div class="module-subheader">${escHtml(item.title)}</div>`;
        }
        const icon = MODULE_TYPE_ICONS[item.type] || MODULE_TYPE_ICONS['File'];
        const completed = item.completion_requirement?.completed;
        const url = item.html_url || item.url || '#';
        const inApp = actionable[item.type] && canvasId && item.content_id && !Store.isDemo();
        const badge = inApp
          ? '<span class="module-item-action">Open</span>'
          : `<span class="module-item-type">${item.type || ''}</span>`;
        const checkSvg = completed
          ? '<svg class="module-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
          : '';

        if (inApp) {
          return `
            <a class="module-item module-item-clickable ${completed ? 'module-item-done' : ''}"
               onclick="Work.openModuleItem(${canvasId}, '${item.type}', ${item.content_id}, ${JSON.stringify(item.title).replace(/"/g, '&quot;')}, '${escHtml(url)}')">
              <span class="module-item-icon">${icon}</span>
              <span class="module-item-title">${escHtml(item.title)}</span>
              ${badge}${checkSvg}
            </a>`;
        }
        return `
          <a class="module-item ${completed ? 'module-item-done' : ''}" href="${escHtml(url)}" target="_blank" rel="noopener">
            <span class="module-item-icon">${icon}</span>
            <span class="module-item-title">${escHtml(item.title)}</span>
            ${badge}${checkSvg}
          </a>`;
      }).join('');

      const doneCount = (mod.items || []).filter(i => i.completion_requirement?.completed).length;
      const totalCount = (mod.items || []).filter(i => i.type !== 'SubHeader').length;

      return `
        <details class="module-section" open>
          <summary class="module-summary">
            <span class="module-name">${escHtml(mod.name)}</span>
            ${totalCount > 0 ? `<span class="module-progress-badge">${doneCount}/${totalCount}</span>` : ''}
          </summary>
          <div class="module-items">${items || '<div class="module-item-empty">No items</div>'}</div>
        </details>`;
    }).join('');
  }

  /* ── Discussions view ─────────────────────── */
  async function loadDiscussions(courseId) {
    const container = document.getElementById('discussions-container');
    if (!courseId) return;

    const cached = Store.getDiscussions(courseId);
    if (cached) { renderDiscussions(cached, courseId); return; }

    if (Store.isDemo()) {
      container.innerHTML = '<div class="agenda-empty">Discussions require a real Canvas connection.</div>';
      return;
    }

    container.innerHTML = '<div class="agenda-empty"><div class="loading-spinner"></div> Loading discussions…</div>';

    try {
      const course   = Store.getCourses().find(c => c.id === courseId);
      const canvasId = course?.canvasId;
      if (!canvasId) return;

      const discussions = await CanvasAPI.syncDiscussions(canvasId);
      Store.saveDiscussions(courseId, discussions);
      renderDiscussions(discussions, courseId);
    } catch (err) {
      container.innerHTML = `<div class="agenda-empty">Failed to load: ${escHtml(err.message)}</div>`;
    }
  }

  function renderDiscussions(discussions, courseId) {
    const container = document.getElementById('discussions-container');
    if (!discussions || discussions.length === 0) {
      container.innerHTML = '<div class="agenda-empty">No discussions found.</div>';
      return;
    }

    const course = Store.getCourses().find(c => c.id === courseId);

    container.innerHTML = discussions.map(d => {
      const last = d.last_reply_at ? DateUtils.formatDate(d.last_reply_at) : 'No replies yet';
      return `
        <a class="discussion-card" href="${escHtml(d.html_url || '#')}" target="_blank" rel="noopener">
          <div class="discussion-card-top">
            <div class="discussion-title">${escHtml(d.title)}</div>
            ${d.require_initial_post ? '<span class="disc-badge disc-required">Must post first</span>' : ''}
            ${d.discussion_type === 'threaded' ? '<span class="disc-badge disc-threaded">Threaded</span>' : ''}
          </div>
          <div class="discussion-meta">
            ${d.message ? `<p class="disc-preview">${escHtml(stripTags(d.message).slice(0,120))}…</p>` : ''}
            <div class="disc-footer">
              <span>${d.discussion_subentry_count ?? 0} replies</span>
              <span>Last activity: ${last}</span>
              ${d.assignment ? `<span class="disc-pts">${d.assignment.points_possible}pt</span>` : ''}
            </div>
          </div>
        </a>`;
    }).join('');
  }

  function stripTags(html) { return html.replace(/<[^>]*>/g,'').replace(/\s+/,' ').trim(); }

  /* ── Sidebar (mobile) ─────────────────────── */
  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    const o = document.getElementById('sidebar-overlay');
    o.classList.remove('hidden'); o.classList.add('visible');
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    const o = document.getElementById('sidebar-overlay');
    o.classList.add('hidden'); o.classList.remove('visible');
  }

  /* ── Course selects for Modules/Discussions ── */
  function populateCourseSelects() {
    const courses = Store.getCourses();
    const opts    = '<option value="">— Select course —</option>' +
      courses.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    ['modules-course-select','disc-course-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = opts;
    });
  }

  /* ── Search ───────────────────────────────── */
  function onSearch(query) {
    if (!query.trim()) { if (currentView === 'todo') Todo.render(); return; }
    const q = query.toLowerCase();
    const assignments = Store.getAssignments().filter(a =>
      a.name.toLowerCase().includes(q) || (a.notes||'').toLowerCase().includes(q)
    );
    const courses   = Store.getCourses();
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

    navigate('todo');
    const container = document.getElementById('todo-list');
    if (!container) return;

    if (assignments.length === 0) {
      container.innerHTML = `<div class="todo-empty"><p>No results for "${escHtml(query)}"</p></div>`;
      return;
    }
    container.innerHTML = assignments.map(a => {
      const c = courseMap[a.courseId] || { name:'Unknown', color:'#607d8b' };
      return `
        <div class="todo-item" style="border-left:4px solid ${c.color}">
          <div class="todo-content" style="padding-left:4px">
            <div class="todo-name">${escHtml(a.name)}</div>
            <div class="todo-meta">
              <span class="todo-course-tag" style="background:${c.color}">${escHtml(c.name)}</span>
              <span class="todo-type-tag">${a.type}</span>
              ${statusBadgeHtml(a)}
            </div>
          </div>
          <div class="todo-right"><span class="todo-due">${DateUtils.formatDate(a.due)}</span></div>
        </div>`;
    }).join('');
  }

  /* ── Sync time display ───────────────────── */
  function updateSyncTime() {
    const last = Store.getLastSync();
    const el   = document.getElementById('sync-time');
    if (!el) return;
    if (!last) { el.textContent = ''; return; }
    const mins = Math.round((Date.now() - new Date(last)) / 60000);
    el.textContent = mins < 1 ? 'Synced just now' : mins < 60 ? `Synced ${mins}m ago` : 'Synced earlier';
  }

  function updateSyncTimeSettings() {
    const last = Store.getLastSync();
    const el   = document.getElementById('settings-last-sync');
    if (!el) return;
    el.textContent = last
      ? `Last synced: ${new Date(last).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}`
      : 'Last synced: never';
  }

  /* ── Data actions ─────────────────────────── */
  function exportData_() { exportData(); showToast('Data exported!', 'success'); }

  function clearData() {
    if (!confirm('Clear ALL Canvas2 data? This cannot be undone.')) return;
    Store.clear();
    showToast('Data cleared. Reloading…', 'warning');
    setTimeout(() => location.reload(), 1500);
  }

  /* ── Toast ────────────────────────────────── */
  function showToast(message, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast  = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons  = {
      success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      error:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
    };
    toast.innerHTML = (icons[type] || '') + escHtml(message);
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0'; toast.style.transform = 'translateY(8px)';
      toast.style.transition = '.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  /* ── Helpers ──────────────────────────────── */
  function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  return {
    init, connectCanvas, signInDemo, signOut, syncNow, reconnect,
    navigate, refreshDashboard,
    openCourseModal, closeModal,
    loadModules, loadDiscussions,
    openSidebar, closeSidebar,
    onSearch, exportData: exportData_, clearData,
    showToast,
  };
})();

/* ── Shared helpers (used by todo.js / agenda.js) ─ */
function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

const STATUS_CONFIGS = {
  graded:        { label:'Graded',        cls:'status-graded'   },
  submitted:     { label:'Submitted',     cls:'status-submitted' },
  late:          { label:'Late',          cls:'status-late'      },
  missing:       { label:'Missing',       cls:'status-missing'   },
  not_submitted: { label:'Not Submitted', cls:'status-pending'   },
};

function statusBadgeHtml(a) {
  const key = a.missing ? 'missing' : (a.status || 'not_submitted');
  const cfg = STATUS_CONFIGS[key] || STATUS_CONFIGS['not_submitted'];
  return `<span class="status-badge ${cfg.cls}">${cfg.label}</span>`;
}

function toggleTokenVisibility() {
  const input = document.getElementById('login-token');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

/* ── CSS spin animation ─────────────────────── */
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

/* ── Boot ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  const closeBtn = document.getElementById('sidebar-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', App.closeSidebar);
});
