/* ════════════════════════════════════════════════
   Canvas2 — Data Layer (mock + localStorage)
   ════════════════════════════════════════════════ */

const COURSE_COLORS = [
  '#1a73e8','#d93025','#1e8e3e','#e37400','#9334e6',
  '#007b83','#c5221f','#137333','#b06000','#7627bb',
  '#0d652d','#a50e0e','#1a6eae','#c77400','#5b4092',
];

const DEFAULT_COURSES = [
  { id:'c1', name:'Honors English 10',       code:'ENG10H', teacher:'Ms. Johnson',    room:'204', color:'#1a73e8', grade:88 },
  { id:'c2', name:'AP US History',            code:'APUSH',  teacher:'Mr. Thompson',  room:'118', color:'#d93025', grade:82 },
  { id:'c3', name:'Honors Algebra 2',         code:'ALG2H',  teacher:'Ms. Patel',     room:'312', color:'#1e8e3e', grade:91 },
  { id:'c4', name:'Honors Biology',           code:'BIOH',   teacher:'Dr. Williams',  room:'215', color:'#e37400', grade:85 },
  { id:'c5', name:'Spanish III',              code:'SPA3',   teacher:'Sra. Reyes',    room:'106', color:'#9334e6', grade:79 },
  { id:'c6', name:'AP Computer Science',      code:'APCSP',  teacher:'Mr. Chen',      room:'410', color:'#007b83', grade:95 },
  { id:'c7', name:'PE & Health',              code:'PHYS',   teacher:'Coach Davis',   room:'Gym', color:'#137333', grade:93 },
  { id:'c8', name:'Art Studio',              code:'ART1',   teacher:'Ms. Martinez',  room:'502', color:'#9334e6', grade:97 },
];

const DEFAULT_ANNOUNCEMENTS = [
  { id:'a1', courseId:'c2', courseName:'AP US History',       title:'Unit 7 Test moved to Friday',          date: offsetDate(-1) },
  { id:'a2', courseId:'c3', courseName:'Honors Algebra 2',    title:'Extra credit problems posted on Drive', date: offsetDate(-2) },
  { id:'a3', courseId:'c6', courseName:'AP Computer Science', title:'Project 3 rubric updated',              date: offsetDate(0) },
  { id:'a4', courseId:'c1', courseName:'Honors English 10',   title:'Essay workshop tomorrow — bring draft', date: offsetDate(0) },
];

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function makeDefaultAssignments() {
  const now = new Date();
  const f = (d, h=23, m=59) => { const x = new Date(now); x.setDate(x.getDate() + d); x.setHours(h, m, 0); return x.toISOString(); };
  return [
    { id:'t1',  courseId:'c1', name:'The Great Gatsby Essay',        type:'essay',    points:100, due: f(2),   notes:'Chapters 1-5 analysis, 5 pages MLA', completed:false },
    { id:'t2',  courseId:'c2', name:'Unit 7 Test — Civil War',       type:'test',     points:100, due: f(3),   notes:'Chapters 14-17, know key figures',   completed:false },
    { id:'t3',  courseId:'c3', name:'Chapter 6 Homework',            type:'homework', points:20,  due: f(1),   notes:'Problems 1-30 odd',                  completed:false },
    { id:'t4',  courseId:'c4', name:'Cell Division Lab Report',      type:'lab',      points:80,  due: f(4),   notes:'Mitosis and meiosis diagrams',       completed:false },
    { id:'t5',  courseId:'c5', name:'Oral Presentation — Mi Familia',type:'project',  points:60,  due: f(5),   notes:'3 minutes, use at least 30 vocab words', completed:false },
    { id:'t6',  courseId:'c6', name:'Python Loops Quiz',             type:'quiz',     points:25,  due: f(1),   notes:'for/while, range(), enumerate',      completed:false },
    { id:'t7',  courseId:'c2', name:'DBQ Practice Essay',            type:'essay',    points:50,  due: f(6),   notes:'Reconstruction era documents',       completed:false },
    { id:'t8',  courseId:'c3', name:'Midterm Exam',                  type:'exam',     points:200, due: f(10),  notes:'Chapters 1-8 cumulative',            completed:false },
    { id:'t9',  courseId:'c1', name:'Vocabulary Quiz 12',            type:'quiz',     points:30,  due: f(0),   notes:'Words from chapters 6-8',            completed:false },
    { id:'t10', courseId:'c4', name:'Evolution Reading',             type:'reading',  points:10,  due: f(0),   notes:'Chapter 22 pages 580-605',           completed:false },
    { id:'t11', courseId:'c6', name:'Final Project — App Prototype', type:'project',  points:150, due: f(21),  notes:'Full web app with 3+ features',      completed:false },
    { id:'t12', courseId:'c5', name:'Chapter 8 Workbook',           type:'homework', points:15,  due: f(2),   notes:'Exercises A-D',                      completed:false },
    { id:'t13', courseId:'c2', name:'Primary Source Analysis',       type:'essay',    points:40,  due: f(-1),  notes:'Gettysburg Address close reading',   completed:false },
    { id:'t14', courseId:'c3', name:'Factoring Practice Set',        type:'homework', points:15,  due: f(7),   notes:'All methods: GCF, trinomial, diff of squares', completed:false },
    { id:'t15', courseId:'c8', name:'Portrait Sketch',              type:'project',  points:50,  due: f(8),   notes:'Value drawing, 12x18 paper',         completed:false },
  ];
}

/* ── Storage helpers ──────────────────────────── */
const Store = {
  _key(k) { return `canvas2-${k}`; },

  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(this._key(key));
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },

  set(key, val) {
    try { localStorage.setItem(this._key(key), JSON.stringify(val)); } catch {}
  },

  /* Courses */
  getCourses() { return this.get('courses', DEFAULT_COURSES); },
  saveCourses(c) { this.set('courses', c); },

  /* Assignments */
  getAssignments() {
    const saved = this.get('assignments', null);
    if (saved !== null) return saved;
    const defaults = makeDefaultAssignments();
    this.set('assignments', defaults);
    return defaults;
  },
  saveAssignments(a) { this.set('assignments', a); },

  /* Agenda notes: { 'YYYY-MM-DD': 'note text' } */
  getNotes() { return this.get('notes', {}); },
  saveNote(dateStr, text) {
    const notes = this.getNotes();
    notes[dateStr] = text;
    this.set('notes', notes);
  },

  /* User */
  getUser() { return this.get('user', null); },
  saveUser(u) { this.set('user', u); },

  /* Announcements */
  getAnnouncements() { return this.get('announcements', DEFAULT_ANNOUNCEMENTS); },

  clear() {
    ['courses','assignments','notes','user','announcements'].forEach(k =>
      localStorage.removeItem(this._key(k))
    );
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
    return dt.toISOString().split('T')[0];
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    const today = this.today();
    const diff = Math.ceil((d - today) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    if (diff <= 7) return `Due in ${diff}d`;
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  },

  formatFull(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday:'long', month:'long', day:'numeric', year:'numeric'
    });
  },

  formatShort(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month:'short', day:'numeric', hour:'numeric', minute:'2-digit'
    });
  },

  daysUntil(dateStr) {
    const due = new Date(dateStr);
    due.setHours(0,0,0,0);
    return Math.ceil((due - this.today()) / 86400000);
  },

  isToday(dateStr) { return this.daysUntil(dateStr) === 0; },
  isOverdue(dateStr) { return this.daysUntil(dateStr) < 0; },
  isThisWeek(dateStr) {
    const d = this.daysUntil(dateStr);
    return d >= 0 && d <= 7;
  },
};

/* ── Export data as JSON download ─────────────── */
function exportData() {
  const data = {
    courses: Store.getCourses(),
    assignments: Store.getAssignments(),
    notes: Store.getNotes(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'canvas2-export.json';
  a.click();
  URL.revokeObjectURL(url);
}
