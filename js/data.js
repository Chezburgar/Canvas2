/* ════════════════════════════════════════════════
   Canvas2 — Data Layer
   localStorage persistence + demo data fallback
   ════════════════════════════════════════════════ */

/* ── Demo mode mock data ──────────────────────── */
const DEMO_COURSES = [
  { id:'c1', canvasId:1, name:'Honors English 10',   code:'ENG10H', teacher:'Ms. Johnson',   room:'204', color:'#1a73e8', grade:88, gradeLetter:'B+', canvasUrl:'#' },
  { id:'c2', canvasId:2, name:'AP US History',        code:'APUSH',  teacher:'Mr. Thompson', room:'118', color:'#d93025', grade:82, gradeLetter:'B',  canvasUrl:'#' },
  { id:'c3', canvasId:3, name:'Honors Algebra 2',     code:'ALG2H',  teacher:'Ms. Patel',    room:'312', color:'#1e8e3e', grade:91, gradeLetter:'A-', canvasUrl:'#' },
  { id:'c4', canvasId:4, name:'Honors Biology',       code:'BIOH',   teacher:'Dr. Williams', room:'215', color:'#e37400', grade:85, gradeLetter:'B',  canvasUrl:'#' },
  { id:'c5', canvasId:5, name:'Spanish III',          code:'SPA3',   teacher:'Sra. Reyes',   room:'106', color:'#9334e6', grade:79, gradeLetter:'C+', canvasUrl:'#' },
  { id:'c6', canvasId:6, name:'AP Computer Science',  code:'APCSP',  teacher:'Mr. Chen',     room:'410', color:'#007b83', grade:95, gradeLetter:'A',  canvasUrl:'#' },
  { id:'c7', canvasId:7, name:'PE & Health',          code:'PHYS',   teacher:'Coach Davis',  room:'Gym', color:'#137333', grade:93, gradeLetter:'A',  canvasUrl:'#' },
  { id:'c8', canvasId:8, name:'Art Studio',          code:'ART1',   teacher:'Ms. Martinez', room:'502', color:'#9334e6', grade:97, gradeLetter:'A+', canvasUrl:'#' },
];

function makeDemoAssignments() {
  const f = (d, h=23, m=59) => { const x = new Date(); x.setDate(x.getDate()+d); x.setHours(h,m,0); return x.toISOString(); };
  return [
    { id:'a1',  canvasId:1,  courseId:'c1', name:'The Great Gatsby Essay',         type:'essay',    points:100, due:f(2),  notes:'Chapters 1-5 analysis, 5 pages MLA',      completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a2',  canvasId:2,  courseId:'c2', name:'Unit 7 Test — Civil War',        type:'test',     points:100, due:f(3),  notes:'Chapters 14-17, know key figures',        completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a3',  canvasId:3,  courseId:'c3', name:'Chapter 6 Homework',             type:'homework', points:20,  due:f(1),  notes:'Problems 1-30 odd',                       completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a4',  canvasId:4,  courseId:'c4', name:'Cell Division Lab Report',       type:'lab',      points:80,  due:f(4),  notes:'Mitosis and meiosis diagrams',            completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a5',  canvasId:5,  courseId:'c5', name:'Oral Presentation — Mi Familia', type:'project',  points:60,  due:f(5),  notes:'3 min, 30+ vocab words',                  completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a6',  canvasId:6,  courseId:'c6', name:'Python Loops Quiz',              type:'quiz',     points:5,   due:f(1),  notes:'for/while, range(), enumerate — try the "Take" button!', completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#', demoQuiz:true, quizId:'demoquiz1' },
    { id:'a7',  canvasId:7,  courseId:'c2', name:'DBQ Practice Essay',             type:'essay',    points:50,  due:f(6),  notes:'Reconstruction era documents',            completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a8',  canvasId:8,  courseId:'c3', name:'Midterm Exam',                   type:'exam',     points:200, due:f(10), notes:'Chapters 1-8 cumulative',                 completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a9',  canvasId:9,  courseId:'c1', name:'Vocabulary Quiz 12',             type:'quiz',     points:30,  due:f(0),  notes:'Words from chapters 6-8',                 completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a10', canvasId:10, courseId:'c4', name:'Evolution Reading',              type:'reading',  points:10,  due:f(0),  notes:'Chapter 22 pages 580-605',                completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a11', canvasId:11, courseId:'c6', name:'Final Project — App Prototype',  type:'project',  points:150, due:f(21), notes:'Full web app with 3+ features',           completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a12', canvasId:12, courseId:'c5', name:'Chapter 8 Workbook',            type:'homework', points:15,  due:f(2),  notes:'Exercises A-D',                           completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a13', canvasId:13, courseId:'c2', name:'Primary Source Analysis',        type:'essay',    points:40,  due:f(-1), notes:'Gettysburg Address close reading',        completed:true,  status:'graded',        score:38, grade:'95%', late:false, missing:false, canvasUrl:'#' },
    { id:'a14', canvasId:14, courseId:'c3', name:'Chapter 5 Homework',            type:'homework', points:20,  due:f(-3), notes:'All methods: GCF, trinomial',             completed:true,  status:'graded',        score:19, grade:'95%', late:false, missing:false, canvasUrl:'#' },
    { id:'a15', canvasId:15, courseId:'c8', name:'Portrait Sketch',              type:'project',  points:50,  due:f(8),  notes:'Value drawing, 12x18 paper',              completed:false, status:'not_submitted', score:null, grade:null, late:false, missing:false, canvasUrl:'#' },
    { id:'a16', canvasId:16, courseId:'c2', name:'Chapter 16 Reading',            type:'reading',  points:10,  due:f(-5), notes:'',                                        completed:false, status:'missing',       score:null, grade:null, late:false, missing:true,  canvasUrl:'#' },
  ];
}

const DEMO_ANNOUNCEMENTS = [
  { id:'ann1', canvasId:1, courseId:'c2', courseName:'AP US History',       title:'Unit 7 Test moved to Friday',            date: offsetDate(-1), url:'#' },
  { id:'ann2', canvasId:2, courseId:'c3', courseName:'Honors Algebra 2',    title:'Extra credit problems posted on Drive',   date: offsetDate(-2), url:'#' },
  { id:'ann3', canvasId:3, courseId:'c6', courseName:'AP Computer Science',  title:'Project 3 rubric updated — check Canvas', date: offsetDate(0),  url:'#' },
  { id:'ann4', canvasId:4, courseId:'c1', courseName:'Honors English 10',    title:'Essay workshop tomorrow — bring draft',   date: offsetDate(0),  url:'#' },
];

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/* ── Demo quiz (used by Work module in demo mode) ──
   Questions follow the same shape the Work module renders
   for real Canvas quizzes. `correct` marks the right answer(s)
   so demo submissions can be graded locally.                 */
const DEMO_QUIZ = {
  id: 'demoquiz1',
  title: 'Python Loops Quiz',
  points_possible: 5,
  question_count: 5,
  time_limit: null,
  allowed_attempts: -1,
  description: 'A short 5-question demo quiz so you can see how taking a quiz in Canvas2 works. Answer the questions and press Submit Quiz — it grades instantly.',
  questions: [
    {
      id: 1, question_type: 'multiple_choice_question', points_possible: 1,
      question_text: 'Which keyword begins a loop that repeats <em>while</em> a condition stays true?',
      answers: [
        { id: 11, text: 'while', correct: true },
        { id: 12, text: 'for' },
        { id: 13, text: 'if' },
        { id: 14, text: 'def' },
      ],
    },
    {
      id: 2, question_type: 'true_false_question', points_possible: 1,
      question_text: 'In Python, <code>range(5)</code> produces the numbers 0, 1, 2, 3, 4.',
      answers: [
        { id: 21, text: 'True', correct: true },
        { id: 22, text: 'False' },
      ],
    },
    {
      id: 3, question_type: 'multiple_answers_question', points_possible: 1,
      question_text: 'Which of these are real loop keywords in Python? (select all that apply)',
      answers: [
        { id: 31, text: 'for', correct: true },
        { id: 32, text: 'while', correct: true },
        { id: 33, text: 'repeat' },
        { id: 34, text: 'loop' },
      ],
    },
    {
      id: 4, question_type: 'short_answer_question', points_possible: 1,
      question_text: 'Which built-in function gives you both the index and the value while looping? (one word)',
      answers: [
        { id: 41, text: 'enumerate', correct: true },
      ],
    },
    {
      id: 5, question_type: 'essay_question', points_possible: 1,
      question_text: 'In one sentence, describe a situation where a <strong>while</strong> loop is a better choice than a <strong>for</strong> loop.',
      answers: [],
    },
  ],
};

/* Build modules for a course in demo mode out of its assignments,
   so the course page's Modules section has real, clickable content. */
function makeDemoModules(courseId) {
  const items = Store.getAssignments().filter(a => a.courseId === courseId);
  if (items.length === 0) return [];
  const toItem = a => ({
    id: a.id,
    title: a.name,
    type: a.demoQuiz ? 'Quiz' : a.type === 'discussion' ? 'Discussion' : 'Assignment',
    localId: a.id,
    completion_requirement: (a.completed || a.status === 'graded') ? { completed: true } : null,
  });
  const half = Math.ceil(items.length / 2);
  return [
    { id: `m-${courseId}-1`, name: 'Unit 1 — Getting Started', items: items.slice(0, half).map(toItem) },
    { id: `m-${courseId}-2`, name: 'Unit 2 — In Progress',     items: items.slice(half).map(toItem) },
  ].filter(m => m.items.length);
}

/* ── Storage ──────────────────────────────────── */
const Store = {
  _k: k => `canvas2-${k}`,

  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(this._k(key));
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },

  set(key, val) {
    try { localStorage.setItem(this._k(key), JSON.stringify(val)); } catch {}
  },

  /* Auth / config */
  getUser()       { return this.get('user', null); },
  saveUser(u)     { this.set('user', u); },
  getCanvasCfg()  { return this.get('canvas-cfg', null); },
  saveCanvasCfg(c){ this.set('canvas-cfg', c); },

  /* Login prefs — domain + proxy only (NEVER the token).
     Persisted across reconnects so the user doesn't retype them. */
  getLoginPrefs()    { return this.get('login-prefs', null); },
  saveLoginPrefs(p)  { this.set('login-prefs', p); },

  /* User preferences — appearance + behaviour. Persist across reconnects. */
  getPrefs() {
    return Object.assign({
      textSize:      'medium',       // small | medium | large
      density:       'comfortable',  // comfortable | compact
      autoSync:      '10',           // minutes between background syncs, or 'off'
      defaultView:   'dashboard',    // view to open after sign-in
      hideSubmitted: true,           // hide submitted/late/pending items from To-Do
    }, this.get('prefs', {}));
  },
  savePrefs(p) { this.set('prefs', Object.assign(this.getPrefs(), p)); },

  /* Deletion tombstones — Canvas assignment ids the user removed.
     A background re-sync must NOT bring these back. */
  getDeleted()    { return this.get('deleted', []); },
  addDeleted(id)  {
    if (id === null || id === undefined) return;
    const d = this.getDeleted();
    if (!d.includes(id)) { d.push(id); this.set('deleted', d); }
  },

  /* Canvas data */
  getCourses()            { return this.get('courses', DEMO_COURSES); },
  saveCourses(c)          { this.set('courses', c); },
  getAssignments()        { return this.get('assignments', makeDemoAssignments()); },
  saveAssignments(a)      { this.set('assignments', a); },
  getAnnouncements()      { return this.get('announcements', DEMO_ANNOUNCEMENTS); },
  saveAnnouncements(a)    { this.set('announcements', a); },

  /* Modules cache */
  getModules(courseId)    { return this.get(`modules-${courseId}`, null); },
  saveModules(courseId,m) { this.set(`modules-${courseId}`, m); },

  /* Discussions cache */
  getDiscussions(courseId)   { return this.get(`disc-${courseId}`, null); },
  saveDiscussions(courseId,d){ this.set(`disc-${courseId}`, d); },

  /* Agenda notes */
  getNotes()               { return this.get('notes', {}); },
  saveNote(dateStr, text)  {
    const notes = this.getNotes();
    notes[dateStr] = text;
    this.set('notes', notes);
  },

  /* Sync metadata */
  getLastSync()   { return this.get('last-sync', null); },
  saveLastSync()  { this.set('last-sync', new Date().toISOString()); },

  isDemo() { return this.get('is-demo', false); },
  setDemo(v){ this.set('is-demo', v); },

  clear() {
    // Note: 'prefs' and 'theme' are intentionally preserved so the user's
    // appearance choices survive a reconnect / data reset.
    const keys = ['user','canvas-cfg','courses','assignments','announcements',
                  'notes','last-sync','is-demo','deleted'];
    keys.forEach(k => localStorage.removeItem(this._k(k)));
    // clear module/discussion caches
    Object.keys(localStorage)
      .filter(k => k.startsWith('canvas2-modules-') || k.startsWith('canvas2-disc-'))
      .forEach(k => localStorage.removeItem(k));
  },
};

/* ── Date helpers ─────────────────────────────── */
const DateUtils = {
  today() {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  },

  toDateStr(d) {
    const dt = d instanceof Date ? d : new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  },

  formatDate(dateStr) {
    const days = this.daysUntil(dateStr);
    if (days < -1)  return `${Math.abs(days)}d overdue`;
    if (days === -1) return 'Yesterday';
    if (days === 0)  return 'Due today';
    if (days === 1)  return 'Due tomorrow';
    if (days <= 7)   return `Due in ${days}d`;
    return new Date(dateStr).toLocaleDateString('en-US', { month:'short', day:'numeric' });
  },

  formatShort(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month:'short', day:'numeric', hour:'numeric', minute:'2-digit',
    });
  },

  formatFull(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday:'long', month:'long', day:'numeric', year:'numeric',
    });
  },

  daysUntil(dateStr) {
    const due = new Date(dateStr);
    due.setHours(0,0,0,0);
    return Math.ceil((due - this.today()) / 86400000);
  },

  isToday(dateStr)    { return this.daysUntil(dateStr) === 0; },
  isOverdue(dateStr)  { return this.daysUntil(dateStr) < 0; },
  isThisWeek(dateStr) { const d = this.daysUntil(dateStr); return d >= 0 && d <= 7; },
};

/* ── Export ───────────────────────────────────── */
function exportData() {
  const data = {
    courses:      Store.getCourses(),
    assignments:  Store.getAssignments(),
    notes:        Store.getNotes(),
    exported_at:  new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `canvas2-export-${DateUtils.toDateStr(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
