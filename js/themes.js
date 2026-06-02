/* ════════════════════════════════════════════════
   Canvas2 — 100 Themes
   Each theme sets CSS custom properties on :root
   ════════════════════════════════════════════════ */

const THEMES = [
  // ──── OCEAN (1-10) ──────────────────────────────
  { id:'ocean-blue',     name:'Ocean Blue',     family:'Ocean',
    primary:'#1a73e8', primaryLight:'#4a90e2', primaryDark:'#0d47a1',
    secondary:'#34a853', accent:'#fbbc04',
    bg:'#f0f4f8', surface:'#ffffff', surface2:'#f7fafc',
    border:'#e2e8f0', text1:'#1a202c', text2:'#4a5568', text3:'#718096',
    sidebarBg:'#1a73e8', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ffffff',
    dark: false },

  { id:'deep-sea',       name:'Deep Sea',       family:'Ocean',
    primary:'#0d47a1', primaryLight:'#1565c0', primaryDark:'#0a3880',
    secondary:'#00838f', accent:'#80deea',
    bg:'#e8edf2', surface:'#ffffff', surface2:'#f0f4f9',
    border:'#cfd8e3', text1:'#0d1b2a', text2:'#2d4a63', text3:'#5a7fa0',
    sidebarBg:'#0d2347', sidebarText:'rgba(255,255,255,0.8)', sidebarBrand:'#4fc3f7',
    dark: false },

  { id:'aqua-wave',      name:'Aqua Wave',      family:'Ocean',
    primary:'#00838f', primaryLight:'#00acc1', primaryDark:'#006064',
    secondary:'#1a73e8', accent:'#f9a825',
    bg:'#e0f7fa', surface:'#ffffff', surface2:'#e0f7fa',
    border:'#b2ebf2', text1:'#00363a', text2:'#004d52', text3:'#00838f',
    sidebarBg:'#00838f', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#e0f7fa',
    dark: false },

  { id:'arctic-ice',     name:'Arctic Ice',     family:'Ocean',
    primary:'#5c9ce6', primaryLight:'#82b4eb', primaryDark:'#3a7cc7',
    secondary:'#4db6ac', accent:'#ffd54f',
    bg:'#eef4fb', surface:'#ffffff', surface2:'#f5f9ff',
    border:'#dce8f5', text1:'#1c2e42', text2:'#4a6b8a', text3:'#80a4c2',
    sidebarBg:'#3a7cc7', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#e3f0ff',
    dark: false },

  { id:'pacific-breeze', name:'Pacific Breeze', family:'Ocean',
    primary:'#039be5', primaryLight:'#29b6f6', primaryDark:'#0277bd',
    secondary:'#26a69a', accent:'#ffca28',
    bg:'#e1f5fe', surface:'#ffffff', surface2:'#f0f9ff',
    border:'#b3e5fc', text1:'#01579b', text2:'#0277bd', text3:'#039be5',
    sidebarBg:'#01579b', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#4fc3f7',
    dark: false },

  { id:'caribbean',      name:'Caribbean',      family:'Ocean',
    primary:'#00897b', primaryLight:'#26a69a', primaryDark:'#00695c',
    secondary:'#1e88e5', accent:'#ffca28',
    bg:'#e0f2f1', surface:'#ffffff', surface2:'#f0faf9',
    border:'#b2dfdb', text1:'#004d40', text2:'#00695c', text3:'#00897b',
    sidebarBg:'#00695c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#80cbc4',
    dark: false },

  { id:'navy-depths',    name:'Navy Depths',    family:'Ocean',
    primary:'#1565c0', primaryLight:'#42a5f5', primaryDark:'#0d47a1',
    secondary:'#6c63ff', accent:'#ffd740',
    bg:'#e8ecf3', surface:'#f0f2f7', surface2:'#ffffff',
    border:'#d0d8e8', text1:'#0d1b35', text2:'#2c3e65', text3:'#6b80a7',
    sidebarBg:'#0d2347', sidebarText:'rgba(255,255,255,0.8)', sidebarBrand:'#7eb3ff',
    dark: false },

  { id:'cerulean',       name:'Cerulean',       family:'Ocean',
    primary:'#1e88e5', primaryLight:'#42a5f5', primaryDark:'#1565c0',
    secondary:'#00acc1', accent:'#ff6f00',
    bg:'#f3f8fe', surface:'#ffffff', surface2:'#f0f5fb',
    border:'#d9eaf9', text1:'#172b4d', text2:'#344563', text3:'#5e7da8',
    sidebarBg:'#1e88e5', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffffff',
    dark: false },

  { id:'sapphire',       name:'Sapphire',       family:'Ocean',
    primary:'#283593', primaryLight:'#3949ab', primaryDark:'#1a237e',
    secondary:'#00bcd4', accent:'#ffd740',
    bg:'#eef0f8', surface:'#ffffff', surface2:'#f3f5fc',
    border:'#d4d9ef', text1:'#1a1f4e', text2:'#2c3475', text3:'#5c6aad',
    sidebarBg:'#1a237e', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#7986cb',
    dark: false },

  { id:'tidal-blue',     name:'Tidal Blue',     family:'Ocean',
    primary:'#2196f3', primaryLight:'#64b5f6', primaryDark:'#1565c0',
    secondary:'#4caf50', accent:'#ff9800',
    bg:'#f4f8fd', surface:'#ffffff', surface2:'#f0f6ff',
    border:'#ddeeff', text1:'#1b2733', text2:'#354b5e', text3:'#607d8b',
    sidebarBg:'#1565c0', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#bbdefb',
    dark: false },

  // ──── FOREST (11-20) ────────────────────────────
  { id:'forest-green',   name:'Forest Green',   family:'Forest',
    primary:'#2e7d32', primaryLight:'#43a047', primaryDark:'#1b5e20',
    secondary:'#00838f', accent:'#fdd835',
    bg:'#f1f8f2', surface:'#ffffff', surface2:'#f4faf5',
    border:'#d4e8d6', text1:'#1b2e1c', text2:'#2e5030', text3:'#5a8a5c',
    sidebarBg:'#1b5e20', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#a5d6a7',
    dark: false },

  { id:'emerald',        name:'Emerald',        family:'Forest',
    primary:'#00c853', primaryLight:'#69f0ae', primaryDark:'#00a040',
    secondary:'#1565c0', accent:'#ffd740',
    bg:'#e8f5e9', surface:'#ffffff', surface2:'#f1faf2',
    border:'#c8e6c9', text1:'#1b3a20', text2:'#2e6b34', text3:'#4caf50',
    sidebarBg:'#00695c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#69f0ae',
    dark: false },

  { id:'sage',           name:'Sage',           family:'Forest',
    primary:'#7cb342', primaryLight:'#9ccc65', primaryDark:'#558b2f',
    secondary:'#78909c', accent:'#ffca28',
    bg:'#f4f8f0', surface:'#ffffff', surface2:'#f7faf3',
    border:'#deebd0', text1:'#1c2d0e', text2:'#3d5c1f', text3:'#739557',
    sidebarBg:'#558b2f', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#dcedc8',
    dark: false },

  { id:'mint-fresh',     name:'Mint Fresh',     family:'Forest',
    primary:'#00bfa5', primaryLight:'#1de9b6', primaryDark:'#00897b',
    secondary:'#5c6bc0', accent:'#ffd54f',
    bg:'#e0f7f4', surface:'#ffffff', surface2:'#f0fdfb',
    border:'#b2dfdb', text1:'#003d35', text2:'#00695c', text3:'#00bfa5',
    sidebarBg:'#00695c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#b2dfdb',
    dark: false },

  { id:'pine-tree',      name:'Pine Tree',      family:'Forest',
    primary:'#33691e', primaryLight:'#558b2f', primaryDark:'#1b5e20',
    secondary:'#37474f', accent:'#ffc107',
    bg:'#edf3e8', surface:'#ffffff', surface2:'#f2f7ee',
    border:'#c8dab8', text1:'#1a2e10', text2:'#2e4a20', text3:'#557a3a',
    sidebarBg:'#1b5e20', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#c5e1a5',
    dark: false },

  { id:'jungle',         name:'Jungle',         family:'Forest',
    primary:'#1b5e20', primaryLight:'#2e7d32', primaryDark:'#0a3d10',
    secondary:'#004d40', accent:'#f9a825',
    bg:'#e6f0e6', surface:'#f4faf4', surface2:'#eaf4ea',
    border:'#c3d9c3', text1:'#0a1f0a', text2:'#1a3a1a', text3:'#447044',
    sidebarBg:'#0a2e0a', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#81c784',
    dark: false },

  { id:'olive-grove',    name:'Olive Grove',    family:'Forest',
    primary:'#827717', primaryLight:'#9e9d24', primaryDark:'#5d5611',
    secondary:'#5d4037', accent:'#80deea',
    bg:'#f5f4e8', surface:'#ffffff', surface2:'#f8f7ef',
    border:'#e0ddb8', text1:'#2c2a10', text2:'#544f1c', text3:'#8c8340',
    sidebarBg:'#524e12', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#f0e68c',
    dark: false },

  { id:'spring-green',   name:'Spring Green',   family:'Forest',
    primary:'#4caf50', primaryLight:'#81c784', primaryDark:'#388e3c',
    secondary:'#29b6f6', accent:'#ff7043',
    bg:'#f2faf2', surface:'#ffffff', surface2:'#f7fdf7',
    border:'#c8e6c9', text1:'#1b3a1e', text2:'#2e5c31', text3:'#5a9060',
    sidebarBg:'#388e3c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#e8f5e9',
    dark: false },

  { id:'moss',           name:'Moss',           family:'Forest',
    primary:'#546e7a', primaryLight:'#78909c', primaryDark:'#37474f',
    secondary:'#4caf50', accent:'#ffb300',
    bg:'#eceff1', surface:'#ffffff', surface2:'#f5f8f9',
    border:'#d0dde2', text1:'#1c2a30', text2:'#3d5560', text3:'#617e8c',
    sidebarBg:'#37474f', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#cfd8dc',
    dark: false },

  { id:'bamboo',         name:'Bamboo',         family:'Forest',
    primary:'#8d6e63', primaryLight:'#a1887f', primaryDark:'#6d4c41',
    secondary:'#43a047', accent:'#ffd54f',
    bg:'#f5f0eb', surface:'#ffffff', surface2:'#f9f5f0',
    border:'#e0d5cc', text1:'#2c1e18', text2:'#5d3f35', text3:'#9c7b72',
    sidebarBg:'#4e342e', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#d7ccc8',
    dark: false },

  // ──── SUNSET (21-30) ────────────────────────────
  { id:'sunset-orange',  name:'Sunset Orange',  family:'Sunset',
    primary:'#f4511e', primaryLight:'#ff7043', primaryDark:'#bf360c',
    secondary:'#ff8f00', accent:'#1a73e8',
    bg:'#fff3ee', surface:'#ffffff', surface2:'#fff8f5',
    border:'#ffd0bf', text1:'#3e1207', text2:'#7a2c14', text3:'#c05230',
    sidebarBg:'#bf360c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffccbc',
    dark: false },

  { id:'coral-reef',     name:'Coral Reef',     family:'Sunset',
    primary:'#e64a19', primaryLight:'#ff7043', primaryDark:'#bf360c',
    secondary:'#f06292', accent:'#42a5f5',
    bg:'#fdf1ee', surface:'#ffffff', surface2:'#fdf5f2',
    border:'#fac9bc', text1:'#3c1208', text2:'#782818', text3:'#c24c30',
    sidebarBg:'#c2391c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffccbc',
    dark: false },

  { id:'autumn-blaze',   name:'Autumn Blaze',   family:'Sunset',
    primary:'#e65100', primaryLight:'#ff6d00', primaryDark:'#b84700',
    secondary:'#c62828', accent:'#f9a825',
    bg:'#fff8f3', surface:'#ffffff', surface2:'#fffaf5',
    border:'#ffd5bb', text1:'#2d1500', text2:'#6b2800', text3:'#c2560a',
    sidebarBg:'#8d3200', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffcc80',
    dark: false },

  { id:'tangerine',      name:'Tangerine',      family:'Sunset',
    primary:'#fb8c00', primaryLight:'#ffa726', primaryDark:'#e65100',
    secondary:'#ef5350', accent:'#26c6da',
    bg:'#fff8f0', surface:'#ffffff', surface2:'#fffaf3',
    border:'#ffd899', text1:'#2e1700', text2:'#6b3800', text3:'#c07000',
    sidebarBg:'#e65100', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffe0b2',
    dark: false },

  { id:'crimson',        name:'Crimson',        family:'Sunset',
    primary:'#c62828', primaryLight:'#ef5350', primaryDark:'#7f0000',
    secondary:'#ff7043', accent:'#1a73e8',
    bg:'#fdeaea', surface:'#ffffff', surface2:'#fef3f3',
    border:'#f5bfbf', text1:'#2e0000', text2:'#660000', text3:'#c72828',
    sidebarBg:'#7f0000', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ef9a9a',
    dark: false },

  { id:'ruby-red',       name:'Ruby Red',       family:'Sunset',
    primary:'#d32f2f', primaryLight:'#ef5350', primaryDark:'#b71c1c',
    secondary:'#e91e63', accent:'#ffeb3b',
    bg:'#fdf0f0', surface:'#ffffff', surface2:'#fef5f5',
    border:'#f8c4c4', text1:'#2e0a0a', text2:'#6b1818', text3:'#c43333',
    sidebarBg:'#b71c1c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffcdd2',
    dark: false },

  { id:'scarlet',        name:'Scarlet',        family:'Sunset',
    primary:'#ff1744', primaryLight:'#ff616f', primaryDark:'#c4001d',
    secondary:'#ff6d00', accent:'#2979ff',
    bg:'#fff3f4', surface:'#ffffff', surface2:'#fff7f7',
    border:'#ffc0ca', text1:'#2e0010', text2:'#700030', text3:'#c8003c',
    sidebarBg:'#c4001d', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ff8a80',
    dark: false },

  { id:'tomato',         name:'Tomato',         family:'Sunset',
    primary:'#e53935', primaryLight:'#ef5350', primaryDark:'#c62828',
    secondary:'#fb8c00', accent:'#29b6f6',
    bg:'#fdf1f0', surface:'#ffffff', surface2:'#fef6f5',
    border:'#f8c2be', text1:'#2e0c0a', text2:'#6b2220', text3:'#c04040',
    sidebarBg:'#b71c1c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffcdd2',
    dark: false },

  { id:'volcano',        name:'Volcano',        family:'Sunset',
    primary:'#bf360c', primaryLight:'#e64a19', primaryDark:'#870000',
    secondary:'#c62828', accent:'#ffd740',
    bg:'#f5ece9', surface:'#ffffff', surface2:'#f9f0ed',
    border:'#e8c7be', text1:'#2b0e08', text2:'#5e2212', text3:'#a84228',
    sidebarBg:'#870000', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ff8a65',
    dark: false },

  { id:'rust',           name:'Rust',           family:'Sunset',
    primary:'#8d4e3a', primaryLight:'#b56350', primaryDark:'#6a3025',
    secondary:'#5d4037', accent:'#80cbc4',
    bg:'#f6ede9', surface:'#ffffff', surface2:'#f9f1ee',
    border:'#e8d0c8', text1:'#2b1a14', text2:'#5c3228', text3:'#9b6050',
    sidebarBg:'#5a2d20', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ffb4a0',
    dark: false },

  // ──── LAVENDER (31-40) ──────────────────────────
  { id:'lavender-dream', name:'Lavender Dream',  family:'Lavender',
    primary:'#7c4dff', primaryLight:'#b388ff', primaryDark:'#6200ea',
    secondary:'#e91e63', accent:'#ffd740',
    bg:'#f5f0ff', surface:'#ffffff', surface2:'#f9f5ff',
    border:'#d9c8ff', text1:'#1e0e40', text2:'#4a2a8c', text3:'#8e6cc8',
    sidebarBg:'#6200ea', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#d1b3ff',
    dark: false },

  { id:'royal-purple',   name:'Royal Purple',   family:'Lavender',
    primary:'#6a1b9a', primaryLight:'#8e24aa', primaryDark:'#4a148c',
    secondary:'#1565c0', accent:'#ffca28',
    bg:'#f5eefa', surface:'#ffffff', surface2:'#f8f2fc',
    border:'#dfc5f5', text1:'#20073a', text2:'#4e1580', text3:'#903ac8',
    sidebarBg:'#4a148c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ce93d8',
    dark: false },

  { id:'violet',         name:'Violet',         family:'Lavender',
    primary:'#9c27b0', primaryLight:'#ba68c8', primaryDark:'#6a1b9a',
    secondary:'#ff4081', accent:'#ffe082',
    bg:'#f7eefa', surface:'#ffffff', surface2:'#faf2fc',
    border:'#e1bfee', text1:'#250040', text2:'#5a1080', text3:'#9c40b8',
    sidebarBg:'#6a1b9a', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#e1bee7',
    dark: false },

  { id:'plum',           name:'Plum',           family:'Lavender',
    primary:'#4a148c', primaryLight:'#6a1b9a', primaryDark:'#2e0060',
    secondary:'#37474f', accent:'#f9a825',
    bg:'#eee8f5', surface:'#ffffff', surface2:'#f3eef8',
    border:'#d2bae8', text1:'#1a0630', text2:'#3e1068', text3:'#7840a8',
    sidebarBg:'#2e0060', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#b39ddb',
    dark: false },

  { id:'amethyst',       name:'Amethyst',       family:'Lavender',
    primary:'#7b1fa2', primaryLight:'#ab47bc', primaryDark:'#6a1b9a',
    secondary:'#26a69a', accent:'#ffca28',
    bg:'#f6eefa', surface:'#ffffff', surface2:'#f9f2fc',
    border:'#e0c0ee', text1:'#240040', text2:'#581080', text3:'#9030c8',
    sidebarBg:'#5e0080', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ce93d8',
    dark: false },

  { id:'mauve',          name:'Mauve',          family:'Lavender',
    primary:'#8e6cc8', primaryLight:'#b09ada', primaryDark:'#6c48a8',
    secondary:'#ef5350', accent:'#ffd54f',
    bg:'#f2edf8', surface:'#ffffff', surface2:'#f6f0fb',
    border:'#d9caee', text1:'#1c1030', text2:'#4a3070', text3:'#8060b0',
    sidebarBg:'#5c4090', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#d1c4e9',
    dark: false },

  { id:'lilac',          name:'Lilac',          family:'Lavender',
    primary:'#ce93d8', primaryLight:'#e1bee7', primaryDark:'#ab47bc',
    secondary:'#80cbc4', accent:'#ffcc02',
    bg:'#faf4fc', surface:'#ffffff', surface2:'#fdf8ff',
    border:'#f0daf5', text1:'#2c0a40', text2:'#6a3080', text3:'#b070c8',
    sidebarBg:'#8e24aa', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#f3e5f5',
    dark: false },

  { id:'orchid',         name:'Orchid',         family:'Lavender',
    primary:'#ba68c8', primaryLight:'#e040fb', primaryDark:'#8e24aa',
    secondary:'#ef5350', accent:'#ffd740',
    bg:'#faf0fc', surface:'#ffffff', surface2:'#fdf5ff',
    border:'#f0c8f5', text1:'#280040', text2:'#6c1888', text3:'#b050c0',
    sidebarBg:'#7b1fa2', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#f8bbd0',
    dark: false },

  { id:'indigo',         name:'Indigo',         family:'Lavender',
    primary:'#3949ab', primaryLight:'#5c6bc0', primaryDark:'#283593',
    secondary:'#e91e63', accent:'#ffd740',
    bg:'#eeeffe', surface:'#ffffff', surface2:'#f3f5ff',
    border:'#c5caea', text1:'#0e1245', text2:'#2a3484', text3:'#606fc4',
    sidebarBg:'#283593', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#9fa8da',
    dark: false },

  { id:'periwinkle',     name:'Periwinkle',     family:'Lavender',
    primary:'#7986cb', primaryLight:'#9fa8da', primaryDark:'#5c6bc0',
    secondary:'#4dd0e1', accent:'#ffd740',
    bg:'#f0f2fc', surface:'#ffffff', surface2:'#f5f7ff',
    border:'#d8dcf5', text1:'#1e235a', text2:'#404c8e', text3:'#7882c4',
    sidebarBg:'#3f4b8e', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#c5cae9',
    dark: false },

  // ──── ROSE (41-50) ──────────────────────────────
  { id:'rose-pink',      name:'Rose Pink',      family:'Rose',
    primary:'#e91e63', primaryLight:'#f06292', primaryDark:'#c2185b',
    secondary:'#7c4dff', accent:'#ffd740',
    bg:'#fef0f5', surface:'#ffffff', surface2:'#fff5f8',
    border:'#f8c4d8', text1:'#3a0020', text2:'#840045', text3:'#c82060',
    sidebarBg:'#c2185b', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#f48fb1',
    dark: false },

  { id:'hot-pink',       name:'Hot Pink',       family:'Rose',
    primary:'#f50057', primaryLight:'#ff4081', primaryDark:'#c51162',
    secondary:'#7c4dff', accent:'#ffd740',
    bg:'#fff0f4', surface:'#ffffff', surface2:'#fff5f7',
    border:'#ffc0d0', text1:'#3a0018', text2:'#840040', text3:'#cc0050',
    sidebarBg:'#c51162', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ff80ab',
    dark: false },

  { id:'flamingo',       name:'Flamingo',       family:'Rose',
    primary:'#f48fb1', primaryLight:'#f8bbd0', primaryDark:'#e91e63',
    secondary:'#ff8f00', accent:'#7e57c2',
    bg:'#fdf2f7', surface:'#ffffff', surface2:'#fef8fb',
    border:'#f9d4e4', text1:'#3a1028', text2:'#7a2044', text3:'#cc5070',
    sidebarBg:'#e91e63', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#f8bbd0',
    dark: false },

  { id:'blush',          name:'Blush',          family:'Rose',
    primary:'#f06292', primaryLight:'#f48fb1', primaryDark:'#e91e63',
    secondary:'#9e9d24', accent:'#7c4dff',
    bg:'#fef5f7', surface:'#ffffff', surface2:'#fef9fb',
    border:'#f8d0de', text1:'#3a1428', text2:'#842040', text3:'#cc5080',
    sidebarBg:'#c2185b', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fce4ec',
    dark: false },

  { id:'fuchsia',        name:'Fuchsia',        family:'Rose',
    primary:'#d500f9', primaryLight:'#e040fb', primaryDark:'#aa00ff',
    secondary:'#ff6d00', accent:'#00e5ff',
    bg:'#faf0fe', surface:'#ffffff', surface2:'#fdf5ff',
    border:'#edbcfa', text1:'#2e0040', text2:'#6a008a', text3:'#b800e0',
    sidebarBg:'#aa00ff', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ea80ff',
    dark: false },

  { id:'magenta',        name:'Magenta',        family:'Rose',
    primary:'#c2185b', primaryLight:'#e91e63', primaryDark:'#880e4f',
    secondary:'#6a1b9a', accent:'#ffca28',
    bg:'#fdedf4', surface:'#ffffff', surface2:'#fef4f9',
    border:'#f5bfd6', text1:'#38001e', text2:'#7a003c', text3:'#c01860',
    sidebarBg:'#880e4f', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#f48fb1',
    dark: false },

  { id:'cherry-blossom', name:'Cherry Blossom', family:'Rose',
    primary:'#ef9a9a', primaryLight:'#ffcdd2', primaryDark:'#e57373',
    secondary:'#80cbc4', accent:'#ffd54f',
    bg:'#fef6f6', surface:'#ffffff', surface2:'#fff9f9',
    border:'#fce4e4', text1:'#3a1010', text2:'#8a2828', text3:'#cc7070',
    sidebarBg:'#e57373', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffcdd2',
    dark: false },

  { id:'raspberry',      name:'Raspberry',      family:'Rose',
    primary:'#ad1457', primaryLight:'#d81b60', primaryDark:'#880e4f',
    secondary:'#37474f', accent:'#ffd54f',
    bg:'#fdedf4', surface:'#ffffff', surface2:'#fef4f8',
    border:'#f5bace', text1:'#38001c', text2:'#7a0038', text3:'#c01858',
    sidebarBg:'#6d0b38', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#f48fb1',
    dark: false },

  { id:'berry',          name:'Berry',          family:'Rose',
    primary:'#880e4f', primaryLight:'#ad1457', primaryDark:'#560027',
    secondary:'#4a148c', accent:'#f9a825',
    bg:'#f5e8ef', surface:'#ffffff', surface2:'#f9eef4',
    border:'#e8c0d4', text1:'#280012', text2:'#600030', text3:'#a81855',
    sidebarBg:'#560027', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#f48fb1',
    dark: false },

  { id:'petal',          name:'Petal',          family:'Rose',
    primary:'#f48fb1', primaryLight:'#fce4ec', primaryDark:'#ec407a',
    secondary:'#80deea', accent:'#a5d6a7',
    bg:'#fdf6f9', surface:'#ffffff', surface2:'#fefafc',
    border:'#fad8e6', text1:'#3e1028', text2:'#8a2045', text3:'#cc6090',
    sidebarBg:'#ec407a', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fce4ec',
    dark: false },

  // ──── SLATE (51-60) ─────────────────────────────
  { id:'classic-gray',   name:'Classic Gray',   family:'Slate',
    primary:'#607d8b', primaryLight:'#78909c', primaryDark:'#455a64',
    secondary:'#1a73e8', accent:'#ff9800',
    bg:'#f0f2f5', surface:'#ffffff', surface2:'#f5f7fa',
    border:'#dde3ec', text1:'#1a2535', text2:'#3a4a5e', text3:'#6b7e90',
    sidebarBg:'#37474f', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#cfd8dc',
    dark: false },

  { id:'charcoal',       name:'Charcoal',       family:'Slate',
    primary:'#455a64', primaryLight:'#607d8b', primaryDark:'#263238',
    secondary:'#ef5350', accent:'#ffd740',
    bg:'#eceff1', surface:'#ffffff', surface2:'#f5f8fa',
    border:'#d4dce0', text1:'#1a2428', text2:'#3a4f58', text3:'#6a8290',
    sidebarBg:'#263238', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#b0bec5',
    dark: false },

  { id:'steel-blue',     name:'Steel Blue',     family:'Slate',
    primary:'#546e7a', primaryLight:'#7899a4', primaryDark:'#3d5a65',
    secondary:'#1a73e8', accent:'#ff9800',
    bg:'#eef2f4', surface:'#ffffff', surface2:'#f4f7f9',
    border:'#d8e2e8', text1:'#1a2e38', text2:'#3d5668', text3:'#6d8898',
    sidebarBg:'#2f4858', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#b0c4ce',
    dark: false },

  { id:'silver',         name:'Silver',         family:'Slate',
    primary:'#9e9e9e', primaryLight:'#bdbdbd', primaryDark:'#757575',
    secondary:'#42a5f5', accent:'#ff8a65',
    bg:'#f5f5f5', surface:'#ffffff', surface2:'#fafafa',
    border:'#e0e0e0', text1:'#1c1c1c', text2:'#4a4a4a', text3:'#888888',
    sidebarBg:'#616161', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#e0e0e0',
    dark: false },

  { id:'stone',          name:'Stone',          family:'Slate',
    primary:'#78716c', primaryLight:'#a8a29e', primaryDark:'#57534e',
    secondary:'#1a73e8', accent:'#f59e0b',
    bg:'#f5f4f2', surface:'#ffffff', surface2:'#faf9f7',
    border:'#e5e0da', text1:'#1c1a18', text2:'#45403c', text3:'#80776e',
    sidebarBg:'#44403c', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#d6d3d1',
    dark: false },

  { id:'ash',            name:'Ash',            family:'Slate',
    primary:'#6b7280', primaryLight:'#9ca3af', primaryDark:'#4b5563',
    secondary:'#3b82f6', accent:'#f59e0b',
    bg:'#f3f4f6', surface:'#ffffff', surface2:'#f9fafb',
    border:'#e5e7eb', text1:'#111827', text2:'#374151', text3:'#6b7280',
    sidebarBg:'#374151', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#d1d5db',
    dark: false },

  { id:'smoke',          name:'Smoke',          family:'Slate',
    primary:'#94a3b8', primaryLight:'#cbd5e1', primaryDark:'#64748b',
    secondary:'#3b82f6', accent:'#f97316',
    bg:'#f8fafc', surface:'#ffffff', surface2:'#f1f5f9',
    border:'#e2e8f0', text1:'#0f172a', text2:'#334155', text3:'#64748b',
    sidebarBg:'#475569', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#cbd5e1',
    dark: false },

  { id:'graphite',       name:'Graphite',       family:'Slate',
    primary:'#374151', primaryLight:'#4b5563', primaryDark:'#1f2937',
    secondary:'#2563eb', accent:'#d97706',
    bg:'#f3f4f6', surface:'#ffffff', surface2:'#f9fafb',
    border:'#d1d5db', text1:'#111827', text2:'#1f2937', text3:'#6b7280',
    sidebarBg:'#1f2937', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#9ca3af',
    dark: false },

  { id:'iron',           name:'Iron',           family:'Slate',
    primary:'#4b5563', primaryLight:'#6b7280', primaryDark:'#374151',
    secondary:'#1d4ed8', accent:'#b45309',
    bg:'#f0f1f3', surface:'#ffffff', surface2:'#f5f6f8',
    border:'#d4d7dc', text1:'#0c1115', text2:'#2a3240', text3:'#60707e',
    sidebarBg:'#1e2530', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#9ca3af',
    dark: false },

  { id:'gunmetal',       name:'Gunmetal',       family:'Slate',
    primary:'#2c3444', primaryLight:'#3d4a5e', primaryDark:'#1a2232',
    secondary:'#3b82f6', accent:'#f59e0b',
    bg:'#eaedf0', surface:'#f5f7fa', surface2:'#f0f3f7',
    border:'#cdd3db', text1:'#0c1018', text2:'#1e2838', text3:'#5a6878',
    sidebarBg:'#1a2232', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#7888a0',
    dark: false },

  // ──── AMBER (61-70) ─────────────────────────────
  { id:'golden-amber',   name:'Golden Amber',   family:'Amber',
    primary:'#f59e0b', primaryLight:'#fbbf24', primaryDark:'#d97706',
    secondary:'#ef4444', accent:'#3b82f6',
    bg:'#fffbeb', surface:'#ffffff', surface2:'#fefce8',
    border:'#fde68a', text1:'#1c1200', text2:'#4a3200', text3:'#9a6500',
    sidebarBg:'#92400e', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fcd34d',
    dark: false },

  { id:'honey',          name:'Honey',          family:'Amber',
    primary:'#d97706', primaryLight:'#f59e0b', primaryDark:'#b45309',
    secondary:'#059669', accent:'#7c3aed',
    bg:'#fef9f0', surface:'#ffffff', surface2:'#fefdf5',
    border:'#fde8b0', text1:'#1c1000', text2:'#4a2c00', text3:'#8c5c00',
    sidebarBg:'#78350f', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fcd34d',
    dark: false },

  { id:'sunflower',      name:'Sunflower',      family:'Amber',
    primary:'#fbbf24', primaryLight:'#fcd34d', primaryDark:'#f59e0b',
    secondary:'#10b981', accent:'#6366f1',
    bg:'#fefce8', surface:'#ffffff', surface2:'#fffef5',
    border:'#fef08a', text1:'#1a1200', text2:'#3d2a00', text3:'#866600',
    sidebarBg:'#a16207', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fde047',
    dark: false },

  { id:'lemon',          name:'Lemon',          family:'Amber',
    primary:'#eab308', primaryLight:'#facc15', primaryDark:'#ca8a04',
    secondary:'#22c55e', accent:'#3b82f6',
    bg:'#fefdf0', surface:'#ffffff', surface2:'#fffffb',
    border:'#fef9c3', text1:'#1c1500', text2:'#4a3800', text3:'#9a7a00',
    sidebarBg:'#854d0e', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fde047',
    dark: false },

  { id:'mustard',        name:'Mustard',        family:'Amber',
    primary:'#ca8a04', primaryLight:'#d97706', primaryDark:'#a16207',
    secondary:'#9f1239', accent:'#1e40af',
    bg:'#faf8e6', surface:'#ffffff', surface2:'#fefcf0',
    border:'#f5e888', text1:'#1c1400', text2:'#4a3000', text3:'#8c6000',
    sidebarBg:'#713f12', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fde68a',
    dark: false },

  { id:'wheat',          name:'Wheat',          family:'Amber',
    primary:'#d4a017', primaryLight:'#e6b72a', primaryDark:'#a07810',
    secondary:'#7c6a00', accent:'#2e7d32',
    bg:'#faf7ed', surface:'#ffffff', surface2:'#fdfaf3',
    border:'#eddfa0', text1:'#2a1e00', text2:'#604500', text3:'#9c7820',
    sidebarBg:'#6b4c10', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#edd370',
    dark: false },

  { id:'sand',           name:'Sand',           family:'Amber',
    primary:'#b8860b', primaryLight:'#d4a017', primaryDark:'#8c6300',
    secondary:'#6d4c41', accent:'#006064',
    bg:'#faf8f0', surface:'#fffef8', surface2:'#fdfbf2',
    border:'#e8e0c0', text1:'#2a2010', text2:'#5c4a20', text3:'#9c7c40',
    sidebarBg:'#5c4010', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#f5deb3',
    dark: false },

  { id:'caramel',        name:'Caramel',        family:'Amber',
    primary:'#c27b2a', primaryLight:'#d4922a', primaryDark:'#9a5a18',
    secondary:'#6d4c41', accent:'#2e7d32',
    bg:'#faf3e8', surface:'#ffffff', surface2:'#fdf7ef',
    border:'#e8d0a0', text1:'#2a1800', text2:'#5e3400', text3:'#9c6020',
    sidebarBg:'#7c4a10', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#d4a060',
    dark: false },

  { id:'butterscotch',   name:'Butterscotch',   family:'Amber',
    primary:'#e0901a', primaryLight:'#f0a830', primaryDark:'#b87010',
    secondary:'#ef5350', accent:'#42a5f5',
    bg:'#fff8ed', surface:'#ffffff', surface2:'#fffcf5',
    border:'#fde0a0', text1:'#2c1400', text2:'#6a3400', text3:'#b86020',
    sidebarBg:'#8b4513', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ffc864',
    dark: false },

  { id:'champagne',      name:'Champagne',      family:'Amber',
    primary:'#c5a642', primaryLight:'#d4b860', primaryDark:'#a08028',
    secondary:'#9e9e9e', accent:'#7986cb',
    bg:'#faf8f2', surface:'#ffffff', surface2:'#fefcf6',
    border:'#e8ddb0', text1:'#2a2414', text2:'#5c5030', text3:'#9c8c50',
    sidebarBg:'#7a6030', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#e8d88c',
    dark: false },

  // ──── MIDNIGHT (71-80) ──────────────────────────
  { id:'midnight-black', name:'Midnight Black',  family:'Midnight',
    primary:'#3b82f6', primaryLight:'#60a5fa', primaryDark:'#2563eb',
    secondary:'#10b981', accent:'#f59e0b',
    bg:'#0f172a', surface:'#1e293b', surface2:'#0f172a',
    border:'#334155', text1:'#f1f5f9', text2:'#cbd5e1', text3:'#64748b',
    sidebarBg:'#0f172a', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#3b82f6',
    dark: true },

  { id:'dark-mode-pro',  name:'Dark Mode Pro',   family:'Midnight',
    primary:'#6366f1', primaryLight:'#818cf8', primaryDark:'#4f46e5',
    secondary:'#10b981', accent:'#f59e0b',
    bg:'#18181b', surface:'#27272a', surface2:'#18181b',
    border:'#3f3f46', text1:'#fafafa', text2:'#d4d4d8', text3:'#71717a',
    sidebarBg:'#18181b', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#818cf8',
    dark: true },

  { id:'void',           name:'Void',            family:'Midnight',
    primary:'#38bdf8', primaryLight:'#7dd3fc', primaryDark:'#0284c7',
    secondary:'#34d399', accent:'#fb923c',
    bg:'#020617', surface:'#0f172a', surface2:'#020617',
    border:'#1e3a5f', text1:'#e2e8f0', text2:'#94a3b8', text3:'#475569',
    sidebarBg:'#020617', sidebarText:'rgba(255,255,255,0.8)', sidebarBrand:'#38bdf8',
    dark: true },

  { id:'eclipse',        name:'Eclipse',         family:'Midnight',
    primary:'#a78bfa', primaryLight:'#c4b5fd', primaryDark:'#7c3aed',
    secondary:'#34d399', accent:'#fb923c',
    bg:'#1e1128', surface:'#2d1f38', surface2:'#1e1128',
    border:'#4a3560', text1:'#f3e8ff', text2:'#d8b4fe', text3:'#7e5fa0',
    sidebarBg:'#12082a', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#c084fc',
    dark: true },

  { id:'night-sky',      name:'Night Sky',       family:'Midnight',
    primary:'#60a5fa', primaryLight:'#93c5fd', primaryDark:'#3b82f6',
    secondary:'#4ade80', accent:'#fbbf24',
    bg:'#0a0e1a', surface:'#141828', surface2:'#0a0e1a',
    border:'#1e2a42', text1:'#e8f0ff', text2:'#9bb0d0', text3:'#4a6080',
    sidebarBg:'#0a0e1a', sidebarText:'rgba(255,255,255,0.8)', sidebarBrand:'#60a5fa',
    dark: true },

  { id:'obsidian',       name:'Obsidian',        family:'Midnight',
    primary:'#64748b', primaryLight:'#94a3b8', primaryDark:'#475569',
    secondary:'#38bdf8', accent:'#fbbf24',
    bg:'#0f1117', surface:'#1a1d25', surface2:'#0f1117',
    border:'#2a2f3a', text1:'#e8ecf0', text2:'#a0aab4', text3:'#5a6270',
    sidebarBg:'#0f1117', sidebarText:'rgba(255,255,255,0.8)', sidebarBrand:'#94a3b8',
    dark: true },

  { id:'dark-ocean',     name:'Dark Ocean',      family:'Midnight',
    primary:'#0891b2', primaryLight:'#22d3ee', primaryDark:'#0e7490',
    secondary:'#34d399', accent:'#f59e0b',
    bg:'#083344', surface:'#0e4a5e', surface2:'#083344',
    border:'#164e63', text1:'#cffafe', text2:'#67e8f9', text3:'#0891b2',
    sidebarBg:'#042535', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#67e8f9',
    dark: true },

  { id:'dark-forest',    name:'Dark Forest',     family:'Midnight',
    primary:'#059669', primaryLight:'#34d399', primaryDark:'#047857',
    secondary:'#3b82f6', accent:'#fbbf24',
    bg:'#052e16', surface:'#064e2a', surface2:'#052e16',
    border:'#14532d', text1:'#d1fae5', text2:'#6ee7b7', text3:'#059669',
    sidebarBg:'#022c16', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#6ee7b7',
    dark: true },

  { id:'dark-rose',      name:'Dark Rose',       family:'Midnight',
    primary:'#e879a0', primaryLight:'#f9a8d4', primaryDark:'#be185d',
    secondary:'#a78bfa', accent:'#fbbf24',
    bg:'#1f0a18', surface:'#30102a', surface2:'#1f0a18',
    border:'#500830', text1:'#ffe4e6', text2:'#fda4af', text3:'#e879a0',
    sidebarBg:'#12040e', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#f9a8d4',
    dark: true },

  { id:'dark-purple',    name:'Dark Purple',     family:'Midnight',
    primary:'#8b5cf6', primaryLight:'#a78bfa', primaryDark:'#6d28d9',
    secondary:'#06b6d4', accent:'#f59e0b',
    bg:'#1e1030', surface:'#2a1845', surface2:'#1e1030',
    border:'#3d2060', text1:'#ede9fe', text2:'#c4b5fd', text3:'#7c5cc4',
    sidebarBg:'#100820', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#a78bfa',
    dark: true },

  // ──── PASTEL (81-90) ────────────────────────────
  { id:'pastel-blue',    name:'Pastel Blue',     family:'Pastel',
    primary:'#93c5fd', primaryLight:'#bfdbfe', primaryDark:'#60a5fa',
    secondary:'#86efac', accent:'#fca5a5',
    bg:'#f0f9ff', surface:'#ffffff', surface2:'#f8fcff',
    border:'#bfdbfe', text1:'#1e3a5f', text2:'#2563eb', text3:'#60a5fa',
    sidebarBg:'#3b82f6', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#dbeafe',
    dark: false },

  { id:'pastel-green',   name:'Pastel Green',    family:'Pastel',
    primary:'#86efac', primaryLight:'#bbf7d0', primaryDark:'#4ade80',
    secondary:'#93c5fd', accent:'#fca5a5',
    bg:'#f0fdf4', surface:'#ffffff', surface2:'#f8fff9',
    border:'#bbf7d0', text1:'#14532d', text2:'#16a34a', text3:'#4ade80',
    sidebarBg:'#16a34a', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#bbf7d0',
    dark: false },

  { id:'pastel-pink',    name:'Pastel Pink',     family:'Pastel',
    primary:'#f9a8d4', primaryLight:'#fbcfe8', primaryDark:'#f472b6',
    secondary:'#93c5fd', accent:'#86efac',
    bg:'#fdf2f8', surface:'#ffffff', surface2:'#fdf8fc',
    border:'#fbcfe8', text1:'#500724', text2:'#be185d', text3:'#f472b6',
    sidebarBg:'#ec4899', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fce7f3',
    dark: false },

  { id:'pastel-purple',  name:'Pastel Purple',   family:'Pastel',
    primary:'#c4b5fd', primaryLight:'#ddd6fe', primaryDark:'#a78bfa',
    secondary:'#93c5fd', accent:'#fca5a5',
    bg:'#f5f3ff', surface:'#ffffff', surface2:'#faf8ff',
    border:'#ddd6fe', text1:'#2e1065', text2:'#7c3aed', text3:'#a78bfa',
    sidebarBg:'#7c3aed', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ede9fe',
    dark: false },

  { id:'pastel-yellow',  name:'Pastel Yellow',   family:'Pastel',
    primary:'#fde68a', primaryLight:'#fef9c3', primaryDark:'#fcd34d',
    secondary:'#86efac', accent:'#93c5fd',
    bg:'#fefce8', surface:'#ffffff', surface2:'#fffef5',
    border:'#fef08a', text1:'#422006', text2:'#92400e', text3:'#d97706',
    sidebarBg:'#d97706', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fef08a',
    dark: false },

  { id:'pastel-orange',  name:'Pastel Orange',   family:'Pastel',
    primary:'#fdba74', primaryLight:'#fed7aa', primaryDark:'#fb923c',
    secondary:'#86efac', accent:'#93c5fd',
    bg:'#fff7ed', surface:'#ffffff', surface2:'#fffbf5',
    border:'#fed7aa', text1:'#431407', text2:'#c2410c', text3:'#f97316',
    sidebarBg:'#ea580c', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fed7aa',
    dark: false },

  { id:'pastel-teal',    name:'Pastel Teal',     family:'Pastel',
    primary:'#5eead4', primaryLight:'#99f6e4', primaryDark:'#2dd4bf',
    secondary:'#93c5fd', accent:'#fca5a5',
    bg:'#f0fdfa', surface:'#ffffff', surface2:'#f5fefc',
    border:'#99f6e4', text1:'#0f4038', text2:'#0f766e', text3:'#2dd4bf',
    sidebarBg:'#0d9488', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#ccfbf1',
    dark: false },

  { id:'pastel-coral',   name:'Pastel Coral',    family:'Pastel',
    primary:'#fca5a5', primaryLight:'#fecaca', primaryDark:'#f87171',
    secondary:'#86efac', accent:'#93c5fd',
    bg:'#fef2f2', surface:'#ffffff', surface2:'#fff8f8',
    border:'#fecaca', text1:'#450a0a', text2:'#b91c1c', text3:'#f87171',
    sidebarBg:'#dc2626', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#fecaca',
    dark: false },

  { id:'cotton-candy',   name:'Cotton Candy',    family:'Pastel',
    primary:'#f0abfc', primaryLight:'#f5d0fe', primaryDark:'#e879f9',
    secondary:'#93c5fd', accent:'#fde68a',
    bg:'#fdf4ff', surface:'#ffffff', surface2:'#fef9ff',
    border:'#f5d0fe', text1:'#4a044e', text2:'#a21caf', text3:'#e879f9',
    sidebarBg:'#c026d3', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#f5d0fe',
    dark: false },

  { id:'dreamy',         name:'Dreamy',          family:'Pastel',
    primary:'#c084fc', primaryLight:'#e9d5ff', primaryDark:'#a855f7',
    secondary:'#f9a8d4', accent:'#86efac',
    bg:'#faf5ff', surface:'#ffffff', surface2:'#fdfaff',
    border:'#e9d5ff', text1:'#3b0764', text2:'#7e22ce', text3:'#a855f7',
    sidebarBg:'#9333ea', sidebarText:'rgba(255,255,255,0.9)', sidebarBrand:'#e9d5ff',
    dark: false },

  // ──── NEON (91-100) ─────────────────────────────
  { id:'neon-green',     name:'Neon Green',      family:'Neon',
    primary:'#00ff41', primaryLight:'#66ff77', primaryDark:'#00cc33',
    secondary:'#00ffff', accent:'#ff00aa',
    bg:'#001a0a', surface:'#002a10', surface2:'#001a0a',
    border:'#00401a', text1:'#ccffdd', text2:'#66ff99', text3:'#00cc44',
    sidebarBg:'#000e05', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#00ff41',
    dark: true },

  { id:'neon-blue',      name:'Neon Blue',       family:'Neon',
    primary:'#00b4ff', primaryLight:'#44ccff', primaryDark:'#0088cc',
    secondary:'#00ff9f', accent:'#ff00aa',
    bg:'#001020', surface:'#001830', surface2:'#001020',
    border:'#003060', text1:'#cceeff', text2:'#66ccff', text3:'#00aaff',
    sidebarBg:'#000812', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#00b4ff',
    dark: true },

  { id:'neon-pink',      name:'Neon Pink',       family:'Neon',
    primary:'#ff0099', primaryLight:'#ff44bb', primaryDark:'#cc007a',
    secondary:'#00ffff', accent:'#ffff00',
    bg:'#1a0010', surface:'#28001a', surface2:'#1a0010',
    border:'#500040', text1:'#ffccee', text2:'#ff88cc', text3:'#ff0099',
    sidebarBg:'#0e0008', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ff44bb',
    dark: true },

  { id:'neon-purple',    name:'Neon Purple',     family:'Neon',
    primary:'#bf00ff', primaryLight:'#d966ff', primaryDark:'#9900cc',
    secondary:'#00ffff', accent:'#ffff00',
    bg:'#10001a', surface:'#1a0028', surface2:'#10001a',
    border:'#3a0055', text1:'#f0ccff', text2:'#cc88ff', text3:'#bf00ff',
    sidebarBg:'#08000e', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#cc44ff',
    dark: true },

  { id:'neon-orange',    name:'Neon Orange',     family:'Neon',
    primary:'#ff6600', primaryLight:'#ff9944', primaryDark:'#cc5200',
    secondary:'#ffff00', accent:'#00ffff',
    bg:'#1a0a00', surface:'#281200', surface2:'#1a0a00',
    border:'#502000', text1:'#fff0cc', text2:'#ffbb66', text3:'#ff8800',
    sidebarBg:'#0e0600', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ff8833',
    dark: true },

  { id:'electric',       name:'Electric',        family:'Neon',
    primary:'#ffe600', primaryLight:'#fff066', primaryDark:'#ccb800',
    secondary:'#00ffff', accent:'#ff00aa',
    bg:'#1a1600', surface:'#282300', surface2:'#1a1600',
    border:'#504400', text1:'#fffccc', text2:'#ffee55', text3:'#ffe600',
    sidebarBg:'#0e0c00', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ffe600',
    dark: true },

  { id:'cyber',          name:'Cyber',           family:'Neon',
    primary:'#00fff0', primaryLight:'#66fffc', primaryDark:'#00ccbf',
    secondary:'#ff00aa', accent:'#ffe600',
    bg:'#001a18', surface:'#002820', surface2:'#001a18',
    border:'#004440', text1:'#ccfffe', text2:'#66fffc', text3:'#00ccbf',
    sidebarBg:'#000e0c', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#00fff0',
    dark: true },

  { id:'plasma',         name:'Plasma',          family:'Neon',
    primary:'#ff44aa', primaryLight:'#ff88cc', primaryDark:'#cc0077',
    secondary:'#aa00ff', accent:'#00ffcc',
    bg:'#1a0018', surface:'#280022', surface2:'#1a0018',
    border:'#500050', text1:'#ffccff', text2:'#ff88ee', text3:'#ff44aa',
    sidebarBg:'#0e000c', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ff88cc',
    dark: true },

  { id:'rave',           name:'Rave',            family:'Neon',
    primary:'#ff4488', primaryLight:'#ff88bb', primaryDark:'#cc2266',
    secondary:'#44ffdd', accent:'#ffff00',
    bg:'#0e0018', surface:'#18002a', surface2:'#0e0018',
    border:'#380050', text1:'#ffeeff', text2:'#cc88ff', text3:'#9944ff',
    sidebarBg:'#080010', sidebarText:'rgba(255,255,255,0.85)', sidebarBrand:'#ff4488',
    dark: true },

  { id:'matrix',         name:'Matrix',          family:'Neon',
    primary:'#00ff41', primaryLight:'#44ff66', primaryDark:'#00cc33',
    secondary:'#00cc33', accent:'#00ff41',
    bg:'#000a00', surface:'#001200', surface2:'#000a00',
    border:'#003300', text1:'#00ff41', text2:'#00cc33', text3:'#009922',
    sidebarBg:'#000500', sidebarText:'rgba(0,255,65,0.85)', sidebarBrand:'#00ff41',
    dark: true },
];

/* ── Apply theme to document ───────────────────── */
function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--primary',        theme.primary);
  root.style.setProperty('--primary-light',  theme.primaryLight);
  root.style.setProperty('--primary-dark',   theme.primaryDark);
  root.style.setProperty('--secondary',      theme.secondary);
  root.style.setProperty('--accent',         theme.accent);
  root.style.setProperty('--bg',             theme.bg);
  root.style.setProperty('--surface',        theme.surface);
  root.style.setProperty('--surface-2',      theme.surface2);
  root.style.setProperty('--border',         theme.border);
  root.style.setProperty('--text-1',         theme.text1);
  root.style.setProperty('--text-2',         theme.text2);
  root.style.setProperty('--text-3',         theme.text3);
  root.style.setProperty('--sidebar-bg',     theme.sidebarBg);
  root.style.setProperty('--sidebar-text',   theme.sidebarText);
  root.style.setProperty('--sidebar-brand',  theme.sidebarBrand);
  root.style.setProperty('--sidebar-active', theme.dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.22)');
  root.style.setProperty('--sidebar-hover',  theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)');

  localStorage.setItem('canvas2-theme', themeId);
  document.body.setAttribute('data-dark', theme.dark ? 'true' : 'false');

  // Refresh active swatch highlight
  document.querySelectorAll('.theme-swatch').forEach(el => {
    el.classList.toggle('active-theme', el.dataset.themeId === themeId);
  });
}

/* ── Render theme picker ───────────────────────── */
function renderThemePicker() {
  const container = document.getElementById('theme-picker');
  if (!container) return;

  const families = [...new Set(THEMES.map(t => t.family))];
  const saved = localStorage.getItem('canvas2-theme') || 'ocean-blue';

  container.innerHTML = families.map(family => {
    const themes = THEMES.filter(t => t.family === family);
    const swatches = themes.map(t => `
      <div class="theme-swatch ${t.id === saved ? 'active-theme' : ''}"
           data-theme-id="${t.id}"
           onclick="applyTheme('${t.id}')"
           title="${t.name}">
        <div class="theme-swatch-color">
          <div class="theme-swatch-sidebar" style="background:${t.sidebarBg}"></div>
          <div class="theme-swatch-main"    style="background:${t.bg}; border-top:3px solid ${t.primary}"></div>
        </div>
        <div class="theme-swatch-name">${t.name}</div>
      </div>
    `).join('');
    return `
      <div class="theme-family-section">
        <div class="theme-family-name">${family}</div>
        <div class="theme-grid">${swatches}</div>
      </div>
    `;
  }).join('');
}

/* ── Init saved theme on load ──────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('canvas2-theme') || 'ocean-blue';
  applyTheme(saved);
})();
