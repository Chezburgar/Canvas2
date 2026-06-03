/* ════════════════════════════════════════════════
   Canvas2 — Work module
   In-app assignment submission + classic quiz taking.
   Talks to Canvas through CanvasAPI (which routes via
   the user's proxy) and mirrors the result locally so
   the dashboard / to-do update instantly.
   ════════════════════════════════════════════════ */

const Work = (() => {
  let ctx = null;     // { courseCanvasId, assignment, quiz, submission, questions }
  let busy = false;

  /* ── Small HTML sanitizer for teacher-authored content ── */
  function sanitize(html) {
    if (!html) return '';
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('script,style,iframe,object,embed,link,meta').forEach(n => n.remove());
    tpl.content.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        const n = attr.name.toLowerCase();
        const v = (attr.value || '').toLowerCase();
        if (n.startsWith('on')) el.removeAttribute(attr.name);
        if ((n === 'href' || n === 'src') && v.trim().startsWith('javascript:')) el.removeAttribute(attr.name);
      });
      if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
    });
    return tpl.innerHTML;
  }

  /* ── Page plumbing ────────────────────────────
     The work area is a full content-view (not a popup). We remember
     which view the user came from so the Back button returns there. */
  let returnView = 'todo';

  function open(title) {
    // Only capture the origin the first time we open (re-renders re-call open()).
    const active = document.querySelector('.content-view.active');
    const activeView = active ? active.id.replace('view-', '') : 'todo';
    if (activeView !== 'work') returnView = activeView;

    document.getElementById('work-title').textContent = title || 'Loading…';
    document.getElementById('work-body').innerHTML =
      '<div class="work-loading"><div class="loading-spinner"></div> Loading…</div>';
    document.getElementById('view-work').scrollTop = 0;
    App.navigate('work');
  }
  function close() {
    ctx = null;
    App.navigate(returnView || 'todo');
  }
  function setBody(html) { document.getElementById('work-body').innerHTML = html; }
  function setTitle(t)   { document.getElementById('work-title').textContent = t; }

  function demoBlock() {
    setBody(`<div class="work-empty">
      <p>Submitting and taking quizzes needs a real Canvas connection.</p>
      <p class="work-empty-sub">Sign in with your Canvas token to use this.</p>
    </div>`);
  }

  function courseCanvasIdFromLocal(localAssignment) {
    const course = Store.getCourses().find(c => c.id === localAssignment.courseId);
    return course ? course.canvasId : null;
  }

  /* ── Entry points ─────────────────────────── */

  // From the To-Do list / course modal (we already hold a local assignment)
  function openAssignmentById(localId) {
    const a = Store.getAssignments().find(x => x.id === localId);
    if (!a) return;
    if (a.demoQuiz) { openDemoQuiz(a); return; }     // interactive demo quiz
    if (Store.isDemo() || !a.canvasId) { open(a.name); demoBlock(); return; }
    const cid = courseCanvasIdFromLocal(a);
    if (!cid) return;
    if (a.quizId) openQuiz(cid, a.quizId, a.name);
    else openAssignment(cid, a.canvasId, a.name);
  }

  // From the Modules list (raw Canvas ids, or a demo localId)
  function openModuleItem(courseCanvasId, type, contentId, title, url) {
    if (Store.isDemo()) { open(title); demoBlock(); return; }
    if (type === 'Quiz')        return openQuiz(courseCanvasId, contentId, title);
    if (type === 'Assignment')  return openAssignment(courseCanvasId, contentId, title);
    if (url && url !== '#') window.open(url, '_blank');   // pages, files, links
  }

  /* ════════════════════════════════════════════
     ASSIGNMENTS
  ═════════════════════════════════════════════ */
  async function openAssignment(courseCanvasId, assignmentId, title) {
    open(title);
    try {
      const a = await CanvasAPI.getAssignmentDetail(courseCanvasId, assignmentId);
      ctx = { courseCanvasId, assignment: a, quiz: null };
      renderAssignment();
    } catch (err) {
      errorBody(err);
    }
  }

  const SUPPORTED_TYPES = {
    online_text_entry: 'Text entry',
    online_url:        'Website URL',
    online_upload:     'File upload',
  };

  const TYPE_LABELS = {
    online_text_entry: 'Text entry',
    online_url:        'Website URL',
    online_upload:     'File upload',
    online_quiz:       'Quiz',
    discussion_topic:  'Discussion',
    media_recording:   'Media recording',
    student_annotation:'Annotation',
    on_paper:          'On paper',
    external_tool:     'External tool',
    none:              'No submission',
  };
  function prettyType(t) { return TYPE_LABELS[t] || t.replace(/_/g, ' '); }

  function renderAssignment() {
    const a   = ctx.assignment;
    const sub = a.submission || null;
    setTitle(a.name);

    const due = a.due_at ? DateUtils.formatFull(a.due_at) : 'No due date';
    const supported = (a.submission_types || []).filter(t => SUPPORTED_TYPES[t]);
    const graded = sub && sub.workflow_state === 'graded';
    const alreadySubmitted = sub && ['submitted', 'graded', 'pending_review'].includes(sub.workflow_state);

    const statusChip = graded
      ? `<span class="status-badge status-graded">Graded${sub.score != null ? ` · ${sub.score}/${a.points_possible}` : ''}</span>`
      : alreadySubmitted
        ? `<span class="status-badge status-submitted">Submitted</span>`
        : (sub && sub.missing)
          ? `<span class="status-badge status-missing">Missing</span>`
          : `<span class="status-badge status-pending">Not submitted</span>`;

    // List every format Canvas allows so the student always sees the full set,
    // including ones Canvas2 can't submit in-browser (e.g. media recording).
    const allTypes = (a.submission_types || []);
    const unsupported = allTypes.filter(t => !SUPPORTED_TYPES[t] && t !== 'none' && t !== 'not_graded');

    let submitArea;
    if (supported.length === 0) {
      const reason = allTypes.includes('on_paper') ? 'This is an on-paper assignment.'
                   : allTypes.length === 0         ? 'No submission type is set.'
                   : `Submission type${allTypes.length > 1 ? 's' : ''} (${allTypes.map(prettyType).join(', ')}) can't be submitted from Canvas2.`;
      submitArea = `
        <div class="work-note">${reason} Open it in Canvas to submit.</div>
        <div class="work-actions">
          <a class="btn-primary" href="${escHtml(a.html_url || '#')}" target="_blank" rel="noopener">Open in Canvas</a>
        </div>`;
    } else {
      const typePicker = supported.length > 1
        ? `<div class="work-format-note">This assignment accepts <strong>${supported.length} submission formats</strong> — choose one:</div>
           <div class="work-type-tabs" id="work-type-tabs">${supported.map((t, i) => `
             <button type="button" class="work-type-tab ${i === 0 ? 'active' : ''}" data-type="${t}" onclick="Work.switchType('${t}')">
               ${SUPPORTED_TYPES[t]}
             </button>`).join('')}</div>`
        : `<div class="work-format-note">Submit as <strong>${SUPPORTED_TYPES[supported[0]]}</strong>.</div>`;

      submitArea = `
        ${alreadySubmitted ? `<div class="work-note work-note-info">You've already submitted. Submitting again will replace your previous work.</div>` : ''}
        ${typePicker}
        ${supported.map((t, i) => renderSubmitControl(t, i === 0, a)).join('')}
        ${unsupported.length ? `<div class="work-hint">Other formats this assignment allows (use Canvas for these): ${unsupported.map(t => prettyType(t)).join(', ')}.</div>` : ''}
        <div class="work-actions">
          <button class="btn-primary" id="work-submit-btn" onclick="Work.submitAssignment()">Submit to Canvas</button>
          <a class="btn-secondary" href="${escHtml(a.html_url || '#')}" target="_blank" rel="noopener">Open in Canvas</a>
        </div>
        <div class="work-msg hidden" id="work-msg"></div>`;
    }

    setBody(`
      <div class="work-meta">
        ${statusChip}
        ${a.points_possible != null ? `<span class="work-meta-pill">${a.points_possible} pts</span>` : ''}
        <span class="work-meta-pill">Due: ${escHtml(due)}</span>
      </div>
      ${a.description ? `<div class="work-desc">${sanitize(a.description)}</div>`
                      : '<div class="work-desc work-desc-empty">No description provided.</div>'}
      ${graded && sub.score != null
        ? `<div class="work-grade-box">Your grade: <strong>${sub.score}/${a.points_possible}</strong>${sub.grade ? ` (${escHtml(sub.grade)})` : ''}</div>`
        : ''}
      <div class="work-submit-section">
        <h4>Submit your work</h4>
        ${submitArea}
      </div>`);
  }

  function renderSubmitControl(type, visible, a) {
    const hide = visible ? '' : 'hidden';
    if (type === 'online_text_entry') {
      return `<div class="work-control ${hide}" data-type="online_text_entry">
        <textarea id="work-text" class="work-textarea" placeholder="Type your response here…"></textarea>
      </div>`;
    }
    if (type === 'online_url') {
      return `<div class="work-control ${hide}" data-type="online_url">
        <input type="url" id="work-url" class="work-input" placeholder="https://…">
      </div>`;
    }
    if (type === 'online_upload') {
      const exts = (a.allowed_extensions || []).length
        ? `<span class="work-hint">Allowed: ${a.allowed_extensions.join(', ')}</span>` : '';
      return `<div class="work-control ${hide}" data-type="online_upload">
        <input type="file" id="work-file" class="work-file"
          ${(a.allowed_extensions || []).length ? `accept=".${a.allowed_extensions.join(',.')}"` : ''}>
        ${exts}
        <span class="work-hint">Large files may upload faster directly in Canvas.</span>
      </div>`;
    }
    return '';
  }

  function switchType(type) {
    document.querySelectorAll('#work-body .work-control').forEach(el => {
      el.classList.toggle('hidden', el.dataset.type !== type);
    });
    document.querySelectorAll('#work-body .work-type-tab').forEach(el => {
      el.classList.toggle('active', el.dataset.type === type);
    });
  }

  function selectedType() {
    const activeTab = document.querySelector('#work-body .work-type-tab.active');
    if (activeTab) return activeTab.dataset.type;
    const single = document.querySelector('#work-body .work-control');
    return single ? single.dataset.type : null;
  }

  async function submitAssignment() {
    if (busy || !ctx) return;
    const a    = ctx.assignment;
    const type = selectedType();
    const btn  = document.getElementById('work-submit-btn');
    const msg  = document.getElementById('work-msg');
    const fail = (t) => { msg.textContent = t; msg.className = 'work-msg work-msg-error'; };

    let payload;
    try {
      if (type === 'online_text_entry') {
        const body = document.getElementById('work-text').value.trim();
        if (!body) return fail('Please type a response before submitting.');
        payload = { submission_type: 'online_text_entry', body };
      } else if (type === 'online_url') {
        const url = document.getElementById('work-url').value.trim();
        if (!/^https?:\/\/.+/.test(url)) return fail('Enter a valid URL starting with http(s)://');
        payload = { submission_type: 'online_url', url };
      } else if (type === 'online_upload') {
        const fileEl = document.getElementById('work-file');
        if (!fileEl.files || !fileEl.files[0]) return fail('Choose a file to upload first.');
        // handled below (needs upload step)
        payload = { submission_type: 'online_upload', _file: fileEl.files[0] };
      } else {
        return fail('Unsupported submission type.');
      }
    } catch { return fail('Something went wrong reading your input.'); }

    busy = true;
    btn.disabled = true;
    btn.textContent = type === 'online_upload' ? 'Uploading…' : 'Submitting…';
    msg.className = 'work-msg';
    msg.textContent = '';

    try {
      if (payload._file) {
        const fileId = await CanvasAPI.uploadSubmissionFile(ctx.courseCanvasId, a.id, payload._file);
        payload = { submission_type: 'online_upload', file_ids: [fileId] };
      }
      await CanvasAPI.submitAssignment(ctx.courseCanvasId, a.id, payload);
      mirrorAssignmentSubmitted(a.id);
      msg.className = 'work-msg work-msg-success';
      msg.textContent = '✓ Submitted to Canvas!';
      App.showToast('Assignment submitted!', 'success');
      // Refresh the detail so the new submission shows
      setTimeout(() => openAssignment(ctx.courseCanvasId, a.id, a.name), 700);
    } catch (err) {
      const t = err.message === 'NETWORK' ? 'Could not reach Canvas — check your connection / proxy.'
              : err.message === 'INVALID_TOKEN' ? 'Your token was rejected. Reconnect in Settings.'
              : `Submission failed: ${err.message}`;
      fail(t);
    } finally {
      busy = false;
      btn.disabled = false;
      btn.textContent = 'Submit to Canvas';
    }
  }

  /* Update the locally-stored assignment so the rest of the app reflects it. */
  function mirrorAssignmentSubmitted(canvasAssignmentId, status = 'submitted') {
    const list = Store.getAssignments();
    const a = list.find(x => x.canvasId === canvasAssignmentId);
    if (a) {
      a.status = status;
      a.completed = true;
      a.missing = false;
      Store.saveAssignments(list);
      Todo.render();
      App.refreshDashboard();
    }
  }

  /* ════════════════════════════════════════════
     CLASSIC QUIZZES
  ═════════════════════════════════════════════ */
  async function openQuiz(courseCanvasId, quizId, title) {
    open(title);
    try {
      const q = await CanvasAPI.getQuiz(courseCanvasId, quizId);
      ctx = { courseCanvasId, quiz: q, assignment: null, submission: null, questions: null };
      renderQuizIntro();
    } catch (err) {
      // New Quizzes / LTI quizzes aren't reachable via this API
      setTitle(title || 'Quiz');
      setBody(`<div class="work-note">This quiz can't be opened inside Canvas2
        (it may be a "New Quizzes" quiz, which Canvas only allows in its own app).</div>
        <div class="work-actions"><a class="btn-primary" href="${escHtml(quizUrl(courseCanvasId, quizId))}" target="_blank" rel="noopener">Open in Canvas</a></div>`);
    }
  }

  /* Interactive demo quiz — no Canvas calls, graded locally */
  function openDemoQuiz(localAssignment) {
    open(DEMO_QUIZ.title);
    ctx = {
      demo: true, quiz: DEMO_QUIZ, localId: localAssignment.id,
      courseCanvasId: null, assignment: null,
      submission: { id: 'demo', attempt: 1, validation_token: 'demo' },
      questions: null,
    };
    renderQuizIntro();
  }

  function quizUrl(courseCanvasId, quizId) {
    const dom = CanvasAPI.getDomain();
    return `https://${dom}/courses/${courseCanvasId}/quizzes/${quizId}`;
  }

  function renderQuizIntro() {
    const q = ctx.quiz;
    setTitle(q.title);
    const due = q.due_at ? DateUtils.formatFull(q.due_at) : 'No due date';
    const attemptsLeft = q.allowed_attempts === -1 ? 'Unlimited'
      : `${Math.max(0, (q.allowed_attempts || 1))}`;
    const locked = q.locked_for_user;
    const canvasLink = ctx.demo ? ''
      : `<a class="btn-secondary" href="${escHtml(quizUrl(ctx.courseCanvasId, q.id))}" target="_blank" rel="noopener">Open in Canvas</a>`;
    const note = ctx.demo
      ? 'This is a sample quiz so you can see how taking a quiz works. Answer the questions and press <strong>Submit Quiz</strong> — it grades instantly.'
      : 'Once you start, answer the questions below and press <strong>Submit Quiz</strong>. Your answers are sent to Canvas and graded automatically where possible.';

    setBody(`
      <div class="work-meta">
        ${ctx.demo ? '<span class="work-meta-pill work-meta-demo">Demo</span>' : ''}
        <span class="work-meta-pill">${q.points_possible != null ? q.points_possible + ' pts' : 'Practice'}</span>
        <span class="work-meta-pill">${q.question_count || 0} questions</span>
        ${q.time_limit ? `<span class="work-meta-pill">${q.time_limit} min limit</span>` : ''}
        <span class="work-meta-pill">Attempts: ${attemptsLeft}</span>
        <span class="work-meta-pill">Due: ${escHtml(due)}</span>
      </div>
      ${q.description ? `<div class="work-desc">${sanitize(q.description)}</div>` : ''}
      ${locked
        ? `<div class="work-note">This quiz is currently locked.</div>
           <div class="work-actions">${canvasLink}</div>`
        : `<div class="work-note work-note-info">${note}</div>
           <div class="work-actions">
             <button class="btn-primary" id="quiz-start-btn" onclick="Work.startQuiz()">Start Quiz</button>
             ${canvasLink}
           </div>`}`);
  }

  async function startQuiz() {
    if (busy || !ctx) return;
    const btn = document.getElementById('quiz-start-btn');
    busy = true;
    if (btn) { btn.disabled = true; btn.textContent = 'Starting…'; }
    try {
      if (ctx.demo) {
        ctx.questions = ctx.quiz.questions;
      } else {
        const sub = await CanvasAPI.startQuiz(ctx.courseCanvasId, ctx.quiz.id);
        ctx.submission = sub;
        ctx.questions = await CanvasAPI.getQuizQuestions(sub.id);
      }
      renderQuizQuestions();
    } catch (err) {
      App.showToast('Could not start quiz: ' + err.message, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Start Quiz'; }
    } finally {
      busy = false;
    }
  }

  function renderQuizQuestions() {
    const qs = ctx.questions || [];
    if (qs.length === 0) {
      setBody(`<div class="work-note">No answerable questions were returned for this quiz.</div>
        ${ctx.demo ? '' : `<div class="work-actions"><a class="btn-secondary" href="${escHtml(quizUrl(ctx.courseCanvasId, ctx.quiz.id))}" target="_blank" rel="noopener">Open in Canvas</a></div>`}`);
      return;
    }
    const body = qs.map((q, idx) => `
      <div class="quiz-q" data-qid="${q.id}" data-type="${q.question_type}">
        <div class="quiz-q-head"><span class="quiz-q-num">${idx + 1}</span>
          ${q.points_possible != null ? `<span class="quiz-q-pts">${q.points_possible} pts</span>` : ''}</div>
        <div class="quiz-q-text">${sanitize(q.question_text)}</div>
        <div class="quiz-q-answers">${renderQuizInputs(q)}</div>
      </div>`).join('');

    setBody(`
      <div class="quiz-progress-note">Answer every question, then submit. Unanswered questions are left blank.</div>
      <form id="quiz-form" onsubmit="return false">${body}</form>
      <div class="work-actions">
        <button class="btn-primary" id="quiz-submit-btn" onclick="Work.submitQuiz()">Submit Quiz</button>
        <button class="btn-secondary" onclick="Work.close()">Cancel</button>
      </div>
      <div class="work-msg hidden" id="quiz-msg"></div>`);
  }

  function renderQuizInputs(q) {
    const name = `q_${q.id}`;
    const answers = q.answers || [];
    const ans = a => sanitize(a.html || '') || escHtml(a.text || '');

    switch (q.question_type) {
      case 'multiple_choice_question':
      case 'true_false_question':
        return answers.map(a => `
          <label class="quiz-opt">
            <input type="radio" name="${name}" value="${a.id}">
            <span>${ans(a)}</span>
          </label>`).join('');

      case 'multiple_answers_question':
        return answers.map(a => `
          <label class="quiz-opt">
            <input type="checkbox" name="${name}" value="${a.id}">
            <span>${ans(a)}</span>
          </label>`).join('');

      case 'short_answer_question':
        return `<input type="text" class="work-input" name="${name}" placeholder="Your answer">`;

      case 'numerical_question':
        return `<input type="number" step="any" class="work-input" name="${name}" placeholder="Your answer">`;

      case 'essay_question':
        return `<textarea class="work-textarea" name="${name}" placeholder="Write your response…"></textarea>`;

      case 'fill_in_multiple_blanks_question':
      case 'multiple_dropdowns_question': {
        // group answers by blank_id
        const blanks = [...new Set(answers.map(a => a.blank_id).filter(Boolean))];
        return blanks.map(b => {
          if (q.question_type === 'multiple_dropdowns_question') {
            const opts = answers.filter(a => a.blank_id === b)
              .map(a => `<option value="${a.id}">${escHtml(a.text || '')}</option>`).join('');
            return `<div class="quiz-blank"><span class="quiz-blank-label">${escHtml(b)}</span>
              <select class="work-input" name="${name}__${b}"><option value="">— choose —</option>${opts}</select></div>`;
          }
          return `<div class="quiz-blank"><span class="quiz-blank-label">${escHtml(b)}</span>
            <input type="text" class="work-input" name="${name}__${b}" placeholder="Answer for ${escHtml(b)}"></div>`;
        }).join('');
      }

      case 'text_only_question':
        return '<div class="quiz-text-only">(No answer required)</div>';

      default:
        return `<div class="work-hint">This question type isn't supported in Canvas2 — answer it in Canvas if needed.</div>`;
    }
  }

  function gatherAnswers() {
    return (ctx.questions || []).map(q => {
      const name = `q_${q.id}`;
      const form = document.getElementById('quiz-form');
      let answer;
      switch (q.question_type) {
        case 'multiple_choice_question':
        case 'true_false_question': {
          const el = form.querySelector(`input[name="${name}"]:checked`);
          if (!el) return null;
          answer = parseInt(el.value);
          break;
        }
        case 'multiple_answers_question': {
          const els = [...form.querySelectorAll(`input[name="${name}"]:checked`)];
          if (els.length === 0) return null;
          answer = els.map(e => parseInt(e.value));
          break;
        }
        case 'short_answer_question':
        case 'essay_question': {
          const el = form.querySelector(`[name="${name}"]`);
          if (!el || !el.value.trim()) return null;
          answer = el.value;
          break;
        }
        case 'numerical_question': {
          const el = form.querySelector(`[name="${name}"]`);
          if (!el || el.value === '') return null;
          answer = parseFloat(el.value);
          break;
        }
        case 'fill_in_multiple_blanks_question':
        case 'multiple_dropdowns_question': {
          const obj = {};
          form.querySelectorAll(`[name^="${name}__"]`).forEach(el => {
            const blank = el.name.split('__')[1];
            if (el.value !== '') obj[blank] = q.question_type === 'multiple_dropdowns_question' ? parseInt(el.value) : el.value;
          });
          if (Object.keys(obj).length === 0) return null;
          answer = obj;
          break;
        }
        default:
          return null;
      }
      return { id: q.id, answer };
    }).filter(Boolean);
  }

  async function submitQuiz() {
    if (busy || !ctx || !ctx.submission) return;
    const btn = document.getElementById('quiz-submit-btn');
    const msg = document.getElementById('quiz-msg');
    const sub = ctx.submission;

    if (!confirm(ctx.demo
      ? 'Submit your demo quiz? It will be graded instantly.'
      : 'Submit your quiz to Canvas? You may not be able to change answers afterward.')) return;

    if (ctx.demo) { gradeDemoQuiz(); return; }

    busy = true;
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    msg.className = 'work-msg';
    msg.textContent = '';

    try {
      const answers = gatherAnswers();
      if (answers.length > 0) {
        await CanvasAPI.answerQuizQuestions(sub.id, sub.attempt, sub.validation_token, answers);
      }
      const completed = await CanvasAPI.completeQuiz(
        ctx.courseCanvasId, ctx.quiz.id, sub.id, sub.attempt, sub.validation_token);

      // mirror to local store if this quiz is tied to an assignment
      const list = Store.getAssignments();
      const local = list.find(x => x.quizId === ctx.quiz.id);
      if (local) { local.status = 'submitted'; local.completed = true; local.missing = false; Store.saveAssignments(list); Todo.render(); App.refreshDashboard(); }

      renderQuizResult(completed);
      App.showToast('Quiz submitted!', 'success');
    } catch (err) {
      msg.className = 'work-msg work-msg-error';
      msg.textContent = 'Submit failed: ' + err.message;
      btn.disabled = false;
      btn.textContent = 'Submit Quiz';
    } finally {
      busy = false;
    }
  }

  /* Grade the demo quiz locally and show the result */
  function gradeDemoQuiz() {
    const answers = gatherAnswers();
    const given = Object.fromEntries(answers.map(x => [x.id, x.answer]));
    let score = 0, hasEssay = false;

    ctx.quiz.questions.forEach(q => {
      if (q.question_type === 'essay_question') { hasEssay = true; return; }
      const a = given[q.id];
      if (a === undefined) return;
      if (q.question_type === 'multiple_answers_question') {
        const correct = q.answers.filter(x => x.correct).map(x => x.id).sort((m, n) => m - n);
        const sel = [...a].sort((m, n) => m - n);
        if (correct.length === sel.length && correct.every((v, i) => v === sel[i])) score += q.points_possible;
      } else if (q.question_type === 'short_answer_question') {
        if (q.answers.some(x => x.correct && x.text.trim().toLowerCase() === String(a).trim().toLowerCase()))
          score += q.points_possible;
      } else { // multiple choice / true-false
        const correct = q.answers.find(x => x.correct);
        if (correct && a === correct.id) score += q.points_possible;
      }
    });

    // reflect the result on the local assignment
    const list = Store.getAssignments();
    const local = list.find(x => x.id === ctx.localId);
    if (local) {
      local.status = 'graded'; local.completed = true; local.missing = false;
      local.score = score;
      local.grade = Math.round((score / (ctx.quiz.points_possible || 1)) * 100) + '%';
      Store.saveAssignments(list);
      Todo.render(); App.refreshDashboard();
    }
    App.showToast('Demo quiz graded!', 'success');
    renderQuizResult({ kept_score: score }, hasEssay);
  }

  function renderQuizResult(completed, hasEssay) {
    const q = ctx.quiz;
    const score = completed && completed.kept_score != null ? completed.kept_score
                : completed && completed.score != null ? completed.score : null;
    const total = q.points_possible;
    const canvasLink = ctx.demo ? ''
      : `<a class="btn-secondary" href="${escHtml(quizUrl(ctx.courseCanvasId, q.id))}" target="_blank" rel="noopener">View in Canvas</a>`;
    const note = ctx.demo
      ? `Auto-graded${hasEssay ? ' — the essay question would be graded by your teacher.' : '.'}`
      : 'Auto-graded score. Questions graded by hand (like essays) may change this later.';

    setBody(`
      <div class="quiz-result">
        <div class="quiz-result-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3>Quiz submitted!</h3>
        ${score != null
          ? `<div class="quiz-result-score">${score}${total != null ? ' / ' + total : ''}</div>
             <p class="quiz-result-note">${note}</p>`
          : `<p class="quiz-result-note">Your answers were sent to Canvas. Your teacher will grade them.</p>`}
        <div class="work-actions">
          ${canvasLink}
          <button class="btn-primary" onclick="Work.close()">Done</button>
        </div>
      </div>`);
  }

  /* ── Shared error body ────────────────────── */
  function errorBody(err) {
    const t = err.message === 'NETWORK' ? 'Could not reach Canvas. Check your connection / proxy.'
            : err.message === 'INVALID_TOKEN' ? 'Your Canvas token was rejected. Reconnect in Settings.'
            : `Couldn't load: ${err.message}`;
    setBody(`<div class="work-note work-note-error">${escHtml(t)}</div>`);
  }

  return {
    close, openAssignmentById, openModuleItem,
    switchType, submitAssignment,
    startQuiz, submitQuiz,
  };
})();
