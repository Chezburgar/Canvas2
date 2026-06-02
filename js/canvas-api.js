/* ════════════════════════════════════════════════
   Canvas2 — Canvas LMS API Service
   Handles all communication with the Canvas REST API
   ════════════════════════════════════════════════ */

const CanvasAPI = (() => {
  let _baseUrl  = '';
  let _token    = '';
  let _proxyUrl = '';

  const headers = () => ({
    'Authorization': `Bearer ${_token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  /* ── Route a Canvas URL through the proxy ──────
     Canvas blocks direct browser requests (no CORS),
     so all calls go through the user's Cloudflare
     Worker, which adds CORS headers. If no proxy is
     configured, fall back to a direct call (works
     only on Canvas instances that allow CORS).
  ─────────────────────────────────────────── */
  function wrap(canvasUrl) {
    if (!_proxyUrl) return canvasUrl;
    return `${_proxyUrl}?target=${encodeURIComponent(canvasUrl)}`;
  }

  /* ── Core fetch with pagination ──────────────
     Canvas paginates via Link headers:
     Link: <url>; rel="next", <url>; rel="last"
     The "next" URL is a raw Canvas URL, so we wrap
     it through the proxy again on each loop.
  ─────────────────────────────────────────── */
  async function fetchPage(canvasUrl) {
    let resp;
    try {
      resp = await fetch(wrap(canvasUrl), { headers: headers() });
    } catch (e) {
      throw new Error('NETWORK');
    }
    if (resp.status === 401 || resp.status === 403) throw new Error('INVALID_TOKEN');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    const data = await resp.json();
    const link = resp.headers.get('Link') || '';
    const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
    return { data, nextUrl: nextMatch ? nextMatch[1] : null };
  }

  async function fetchAll(endpoint, params = {}) {
    const searchParams = new URLSearchParams({ per_page: '100' });
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(item => searchParams.append(k, item));
      else searchParams.set(k, String(v));
    });

    let url = `${_baseUrl}${endpoint}?${searchParams}`;
    const results = [];

    while (url) {
      const { data, nextUrl } = await fetchPage(url);
      if (Array.isArray(data)) results.push(...data);
      else results.push(data);
      url = nextUrl;
    }
    return results;
  }

  async function fetchOne(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(item => searchParams.append(k, item));
      else searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    const url = `${_baseUrl}${endpoint}${qs ? '?' + qs : ''}`;
    const { data } = await fetchPage(url);
    return data;
  }

  /* ── Init ────────────────────────────────── */
  function init(domain, token, proxyUrl) {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    _baseUrl  = `https://${clean}/api/v1`;
    _token    = token.trim();
    _proxyUrl = (proxyUrl || '').trim().replace(/\/$/, '');
  }

  function isConfigured() { return !!_token && !!_baseUrl; }
  function hasProxy()     { return !!_proxyUrl; }

  /* ── User ────────────────────────────────── */
  async function getUser() {
    return fetchOne('/users/self', { 'include[]': ['avatar_url', 'email'] });
  }

  /* ── Courses ─────────────────────────────── */
  async function getCourses() {
    return fetchAll('/courses', {
      enrollment_state: 'active',
      'include[]': ['teachers', 'total_scores', 'current_grading_period_scores', 'course_image', 'favorites'],
      state: 'available',
    });
  }

  /* ── Assignments ─────────────────────────── */
  async function getAssignments(courseId) {
    return fetchAll(`/courses/${courseId}/assignments`, {
      'include[]': ['submission', 'score_statistics', 'overrides'],
      order_by: 'due_at',
      bucket: 'unsubmitted',
    });
  }

  async function getAllAssignments(courseId) {
    return fetchAll(`/courses/${courseId}/assignments`, {
      'include[]': ['submission', 'score_statistics'],
      order_by: 'due_at',
    });
  }

  /* ── Submissions ─────────────────────────── */
  async function getSubmissions(courseId) {
    return fetchAll(`/courses/${courseId}/students/submissions`, {
      'student_ids[]': 'self',
      'include[]': ['assignment', 'visibility'],
    });
  }

  /* ── Grades / Enrollments ────────────────── */
  async function getEnrollments(courseId) {
    return fetchAll(`/courses/${courseId}/enrollments`, {
      type: 'StudentEnrollment',
      'include[]': ['total_scores', 'current_points'],
      user_id: 'self',
    });
  }

  /* ── Assignment Groups (for grade weights) ── */
  async function getAssignmentGroups(courseId) {
    return fetchAll(`/courses/${courseId}/assignment_groups`, {
      'include[]': ['assignments', 'submission'],
    });
  }

  /* ── Announcements ───────────────────────── */
  async function getAnnouncements(courseIds) {
    const contextCodes = courseIds.map(id => `course_${id}`);
    return fetchAll('/announcements', {
      'context_codes[]': contextCodes,
      per_page: '30',
    });
  }

  /* ── To-Do ───────────────────────────────── */
  async function getTodo() {
    return fetchAll('/users/self/todo');
  }

  /* ── Modules ─────────────────────────────── */
  async function getModules(courseId) {
    return fetchAll(`/courses/${courseId}/modules`, {
      'include[]': ['items', 'content_details'],
    });
  }

  /* ── Discussion Topics ───────────────────── */
  async function getDiscussions(courseId) {
    return fetchAll(`/courses/${courseId}/discussion_topics`, {
      order_by: 'recent_activity',
      'include[]': ['all_dates'],
    });
  }

  /* ── Calendar Events ─────────────────────── */
  async function getUpcomingEvents() {
    return fetchAll('/users/self/upcoming_events');
  }

  /* ── Activity Stream ─────────────────────── */
  async function getActivityStream() {
    return fetchAll('/users/self/activity_stream', { per_page: '30' });
  }

  /* ════════════════════════════════════════════
     DATA TRANSFORMATION — Canvas → Canvas2
  ═════════════════════════════════════════════ */

  const COURSE_COLORS = [
    '#1a73e8','#d93025','#1e8e3e','#e37400','#9334e6',
    '#007b83','#c5221f','#137333','#c77400','#5b4092',
    '#0d652d','#a50e0e','#1a6eae','#6b3fa0','#007067',
  ];

  function courseColor(index) {
    return COURSE_COLORS[index % COURSE_COLORS.length];
  }

  function transformCourse(c, index) {
    const enrollment = (c.enrollments || [])[0] || {};
    const grade = enrollment.computed_current_score
                ?? enrollment.current_score
                ?? null;
    const teacher = (c.teachers || [])[0];

    return {
      id:          `c${c.id}`,
      canvasId:    c.id,
      name:        c.name || 'Untitled Course',
      code:        c.course_code || '',
      teacher:     teacher ? teacher.display_name : 'Instructor',
      room:        '',
      color:       courseColor(index),
      grade:       grade !== null ? Math.round(grade) : null,
      gradeLetter: enrollment.computed_current_grade || null,
      canvasUrl:   `${_baseUrl.replace('/api/v1', '')}/courses/${c.id}`,
      imageUrl:    c.image_download_url || null,
    };
  }

  function mapSubmissionType(submissionTypes, name) {
    const types  = submissionTypes || ['none'];
    const lower  = (name || '').toLowerCase();

    // Name-based detection (more accurate)
    if (lower.includes('final exam') || lower.includes('midterm exam')) return 'exam';
    if (lower.includes(' exam'))   return 'exam';
    if (lower.includes(' test') || lower.includes('unit test')) return 'test';
    if (lower.includes(' quiz'))   return 'quiz';
    if (lower.includes('essay') || lower.includes('paper') || lower.includes('writing')) return 'essay';
    if (lower.includes(' lab') || lower.includes('lab report')) return 'lab';
    if (lower.includes('project') || lower.includes('presentation')) return 'project';
    if (lower.includes('discussion')) return 'discussion';
    if (lower.includes('reading')) return 'reading';

    // Submission type fallback
    if (types.includes('online_quiz'))         return 'quiz';
    if (types.includes('discussion_topic'))    return 'discussion';
    if (types.includes('online_upload'))       return 'project';
    if (types.includes('online_text_entry'))   return 'essay';
    if (types.includes('media_recording'))     return 'project';
    return 'homework';
  }

  function submissionStatus(sub) {
    if (!sub || sub.workflow_state === 'unsubmitted') {
      if (sub && sub.missing) return 'missing';
      return 'not_submitted';
    }
    if (sub.workflow_state === 'graded')         return 'graded';
    if (sub.workflow_state === 'submitted')      return sub.late ? 'late' : 'submitted';
    if (sub.workflow_state === 'pending_review') return 'submitted';
    return 'not_submitted';
  }

  function transformAssignment(a, courseId) {
    const sub    = a.submission || null;
    const status = submissionStatus(sub);

    return {
      id:          `a${a.id}`,
      canvasId:    a.id,
      courseId:    `c${courseId}`,
      name:        a.name || 'Untitled',
      type:        mapSubmissionType(a.submission_types, a.name),
      points:      a.points_possible || 0,
      due:         a.due_at || a.lock_at || new Date(Date.now() + 7*86400000).toISOString(),
      notes:       stripHtml(a.description || '').slice(0, 200),
      completed:   status === 'graded' || status === 'submitted' || status === 'late',
      // Canvas-specific extras
      status,
      score:       sub ? sub.score : null,
      grade:       sub ? sub.grade : null,
      late:        sub ? !!sub.late : false,
      missing:     sub ? !!sub.missing : false,
      canvasUrl:   `${_baseUrl.replace('/api/v1', '')}/courses/${courseId}/assignments/${a.id}`,
      locked:      !!a.locked_for_user,
    };
  }

  function transformAnnouncement(a) {
    const courseIdMatch = (a.context_code || '').match(/course_(\d+)/);
    return {
      id:         `ann${a.id}`,
      canvasId:   a.id,
      courseId:   courseIdMatch ? `c${courseIdMatch[1]}` : '',
      courseName: a.context_name || '',
      title:      a.title || '',
      date:       a.posted_at || a.created_at,
      url:        a.html_url || '',
    };
  }

  function stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* ── Full sync orchestrator ──────────────── */
  async function syncAll(onProgress) {
    const report = (msg, pct) => onProgress && onProgress(msg, pct);

    report('Fetching your profile…', 5);
    const user = await getUser();

    report('Fetching courses…', 15);
    const rawCourses = await getCourses();
    const courses = rawCourses
      .filter(c => c.workflow_state !== 'deleted' && !c.access_restricted_by_date)
      .map((c, i) => transformCourse(c, i));

    report('Fetching assignments & grades…', 30);
    const courseIds = rawCourses.map(c => c.id);
    const allAssignments = [];

    for (let i = 0; i < rawCourses.length; i++) {
      const c = rawCourses[i];
      const pct = 30 + Math.round((i / rawCourses.length) * 45);
      report(`Loading ${c.name}…`, pct);
      try {
        const assignments = await getAllAssignments(c.id);
        allAssignments.push(...assignments.map(a => transformAssignment(a, c.id)));
      } catch { /* skip inaccessible course */ }
    }

    report('Fetching announcements…', 78);
    let announcements = [];
    try {
      const raw = await getAnnouncements(courseIds);
      announcements = raw.map(a => {
        // attach course name from courses list
        const matchCourse = courses.find(c => c.id === `c${(a.context_code||'').replace('course_','')}`)
        if (matchCourse) a.context_name = matchCourse.name;
        return transformAnnouncement(a);
      });
    } catch {}

    report('Fetching upcoming events…', 88);
    let upcomingEvents = [];
    try { upcomingEvents = await getUpcomingEvents(); } catch {}

    report('Done!', 100);

    return { user, courses, assignments: allAssignments, announcements, upcomingEvents };
  }

  /* ── Modules sync (on demand) ─────────────  */
  async function syncModules(canvasCourseId) {
    return getModules(canvasCourseId);
  }

  async function syncDiscussions(canvasCourseId) {
    return getDiscussions(canvasCourseId);
  }

  return {
    init, isConfigured, hasProxy,
    getUser, syncAll, syncModules, syncDiscussions,
    getDomain: () => _baseUrl.replace('/api/v1','').replace('https://',''),
  };
})();
