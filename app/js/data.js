// ─── LOCAL STORAGE HELPER ─────────────────────────────────────────────────────
var LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.warn('Storage full', e); } }
};

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
var dPlus = n => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; };
var fmtDate = ds => new Date(ds+'T12:00:00').toLocaleDateString('ro-RO',{day:'2-digit',month:'short',year:'numeric'});
var fmtDateLong = ds => new Date(ds+'T12:00:00').toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
var daysUntil = ds => Math.ceil((new Date(ds+'T12:00:00') - new Date()) / 86400000);

// ─── CONSTANTE ────────────────────────────────────────────────────────────────
var ALL_UNITS = ['kg','g','100g','500g','L','dl','ml','buc','duzina','portie','set','plic','cutie','felie','legatura'];
var MONTHS = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
var WDAYS  = ['Lu','Ma','Mi','Jo','Vi','Sa','Du'];
var MODES  = [{v:'bucata',l:'Per bucata'},{v:'greutate',l:'Per greutate'},{v:'compozitie',l:'Per reteta'}];

var ORDER_CATS = [
  {id:'Legume',  label:'Legume & Fructe',       color:'var(--green)', bg:'var(--green)22', cats:['Legume','Fructe']},
  {id:'Metro',   label:'Aprovizionare Generala', color:'var(--blue)', bg:'var(--blue)22', cats:['Carne','Peste','Lactate','Cofetarie','Cereale','Branzeturi','Condimente','Uleiuri','Bauturi','Panificatie']},
  {id:'Altele',  label:'Altele',                 color:'var(--gold)', bg:'var(--gold)18', cats:['Consumabile']},
];

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
var DEMO_ING = [
  // Panificatie
  {id:1, name:'Faina alba tip 000',    unit:'kg',  cat:'Panificatie',   sup:'Dobrogea Grup'},
  {id:2, name:'Drojdie proaspata',     unit:'kg',  cat:'Panificatie',   sup:'Dobrogea Grup'},
  // Oua & Lactate
  {id:3, name:'Oua',                   unit:'buc', cat:'Lactate',       sup:'Ferma Avicola'},
  {id:4, name:'Unt 82%',               unit:'kg',  cat:'Lactate',       sup:'Napolact'},
  {id:5, name:'Lapte integral',        unit:'L',   cat:'Lactate',       sup:'Napolact'},
  {id:6, name:'Smantana 30%',          unit:'kg',  cat:'Lactate',       sup:'Napolact'},
  {id:7, name:'Frisca lichida 35%',    unit:'L',   cat:'Lactate',       sup:'Napolact'},
  {id:8, name:'Mascarpone',            unit:'kg',  cat:'Lactate',       sup:'Metro'},
  {id:9, name:'Parmezan',              unit:'kg',  cat:'Lactate',       sup:'Metro'},
  {id:10,name:'Cascaval',              unit:'kg',  cat:'Lactate',       sup:'Napolact'},
  // Carne
  {id:11,name:'Carne vita pulpa',      unit:'kg',  cat:'Carne',         sup:'Selgros'},
  {id:12,name:'Carne porc spata',      unit:'kg',  cat:'Carne',         sup:'Selgros'},
  {id:13,name:'Pui intreg',            unit:'kg',  cat:'Carne',         sup:'Transavia'},
  {id:14,name:'Piept pui',             unit:'kg',  cat:'Carne',         sup:'Transavia'},
  // Peste
  {id:15,name:'Somon filetat',         unit:'kg',  cat:'Peste',         sup:'Metro'},
  // Legume
  {id:16,name:'Cartofi',               unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  {id:17,name:'Ceapa',                 unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  {id:18,name:'Usturoi',               unit:'buc', cat:'Legume',        sup:'Piata Centrala'},
  {id:19,name:'Rosii',                 unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  {id:20,name:'Ardei gras',            unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  {id:21,name:'Morcov',                unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  {id:22,name:'Telina',                unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  {id:23,name:'Ciuperci',              unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  {id:24,name:'Spanac',                unit:'kg',  cat:'Legume',        sup:'Piata Centrala'},
  // Fructe
  {id:25,name:'Lamaie',                unit:'buc', cat:'Fructe',        sup:'Piata Centrala'},
  {id:26,name:'Capsuni',               unit:'kg',  cat:'Fructe',        sup:'Piata Centrala'},
  // Cereale & Paste
  {id:27,name:'Orez basmati',          unit:'kg',  cat:'Cereale',       sup:'Metro'},
  {id:28,name:'Paste penne',           unit:'kg',  cat:'Cereale',       sup:'Metro'},
  {id:29,name:'Zahar',                 unit:'kg',  cat:'Cofetarie',     sup:'Metro'},
  // Cofetarie
  {id:30,name:'Ciocolata neagra 70%',  unit:'kg',  cat:'Cofetarie',     sup:'Metro'},
  {id:31,name:'Cacao pudra',           unit:'kg',  cat:'Cofetarie',     sup:'Metro'},
  {id:32,name:'Piscoturi Savoiardi',   unit:'kg',  cat:'Cofetarie',     sup:'Metro'},
  // Condimente — ESENTIALE
  {id:33,name:'Sare',                  unit:'kg',  cat:'Condimente',    sup:'Metro'},
  {id:34,name:'Piper negru macinat',   unit:'kg',  cat:'Condimente',    sup:'Metro'},
  {id:35,name:'Piper boabe',           unit:'kg',  cat:'Condimente',    sup:'Metro'},
  {id:36,name:'Boia dulce',            unit:'kg',  cat:'Condimente',    sup:'Metro'},
  {id:37,name:'Boia afumata',          unit:'kg',  cat:'Condimente',    sup:'Metro'},
  {id:38,name:'Cimbru uscat',          unit:'kg',  cat:'Condimente',    sup:'Metro'},
  {id:39,name:'Oregano',               unit:'kg',  cat:'Condimente',    sup:'Metro'},
  {id:40,name:'Patrunjel proaspat',    unit:'legatura',cat:'Condimente', sup:'Piata Centrala'},
  {id:41,name:'Marar proaspat',        unit:'legatura',cat:'Condimente', sup:'Piata Centrala'},
  {id:42,name:'Busuioc proaspat',      unit:'legatura',cat:'Condimente', sup:'Piata Centrala'},
  {id:43,name:'Rozmarin',              unit:'legatura',cat:'Condimente', sup:'Piata Centrala'},
  {id:44,name:'Frunze dafin',          unit:'buc', cat:'Condimente',    sup:'Metro'},
  {id:45,name:'Nucsoara macinata',     unit:'kg',  cat:'Condimente',    sup:'Metro'},
  // Uleiuri & Bauturi
  {id:46,name:'Ulei floarea-soarelui', unit:'L',   cat:'Uleiuri',       sup:'Selgros'},
  {id:47,name:'Ulei masline extra vir',unit:'L',   cat:'Uleiuri',       sup:'Metro'},
  {id:48,name:'Vin alb sec',           unit:'L',   cat:'Bauturi',       sup:'Cramele Recas'},
  {id:49,name:'Vin rosu sec',          unit:'L',   cat:'Bauturi',       sup:'Cramele Recas'},
  {id:50,name:'Espresso cafea',        unit:'L',   cat:'Bauturi',       sup:'Lavazza'},
  // Consumabile
  {id:51,name:'Farfurii plastic premium',unit:'buc',cat:'Consumabile',  sup:'Gastronom SRL'},
  {id:52,name:'Pahare plastic cristal',  unit:'buc',cat:'Consumabile',  sup:'Gastronom SRL'},
  {id:53,name:'Servetele albe',          unit:'buc',cat:'Consumabile',  sup:'Gastronom SRL'},
];

var DEMO_REC = [
  {id:101, name:'Tiramisu',             type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'portie', cat:'Desert',
   items:[{id:1,ingId:8,qty:0.08},{id:2,ingId:3,qty:1},{id:3,ingId:29,qty:0.04},{id:4,ingId:32,qty:0.05},{id:5,ingId:50,qty:0.04},{id:6,ingId:31,qty:0.008}]},
  {id:102, name:'Mousse ciocolata',     type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'portie', cat:'Desert',
   items:[{id:7,ingId:30,qty:0.06},{id:8,ingId:7,qty:0.08},{id:9,ingId:3,qty:0.5},{id:10,ingId:29,qty:0.02}]},
  {id:103, name:'Paine de casa',        type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'buc',    cat:'Panificatie',
   items:[{id:11,ingId:1,qty:0.3},{id:12,ingId:2,qty:0.01},{id:13,ingId:5,qty:0.18},{id:14,ingId:33,qty:0.005},{id:15,ingId:46,qty:0.02}]},
  {id:104, name:'Friptura vita cu sos', type:'recipe', mode:'greutate', baseQty:1, baseUnit:'kg',     cat:'Fel principal',
   items:[{id:16,ingId:11,qty:1},{id:17,ingId:17,qty:0.08},{id:18,ingId:21,qty:0.05},{id:19,ingId:48,qty:0.1},{id:20,ingId:46,qty:0.03},{id:21,ingId:33,qty:0.01},{id:22,ingId:34,qty:0.003},{id:23,ingId:44,qty:2},{id:24,ingId:40,qty:0.1}]},
  {id:105, name:'Pui la cuptor',        type:'recipe', mode:'greutate', baseQty:1, baseUnit:'kg',     cat:'Fel principal',
   items:[{id:25,ingId:13,qty:0.7},{id:26,ingId:16,qty:0.35},{id:27,ingId:46,qty:0.04},{id:28,ingId:17,qty:0.06},{id:29,ingId:18,qty:3},{id:30,ingId:33,qty:0.01},{id:31,ingId:34,qty:0.003},{id:32,ingId:36,qty:0.005},{id:33,ingId:43,qty:0.05}]},
  {id:106, name:'Risotto parmezan',     type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'portie', cat:'Fel principal',
   items:[{id:34,ingId:27,qty:0.08},{id:35,ingId:9,qty:0.03},{id:36,ingId:4,qty:0.02},{id:37,ingId:48,qty:0.05},{id:38,ingId:17,qty:0.04},{id:39,ingId:33,qty:0.005},{id:40,ingId:34,qty:0.002}]},
  {id:107, name:'Somon la gratar',      type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'portie', cat:'Peste',
   items:[{id:41,ingId:15,qty:0.18},{id:42,ingId:4,qty:0.015},{id:43,ingId:46,qty:0.02},{id:44,ingId:33,qty:0.005},{id:45,ingId:34,qty:0.002},{id:46,ingId:25,qty:0.5},{id:47,ingId:42,qty:0.05}]},
  {id:108, name:'Supa crema morcov',    type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'portie', cat:'Supa',
   items:[{id:48,ingId:21,qty:0.12},{id:49,ingId:17,qty:0.05},{id:50,ingId:18,qty:1},{id:51,ingId:5,qty:0.05},{id:52,ingId:4,qty:0.01},{id:53,ingId:33,qty:0.005},{id:54,ingId:34,qty:0.002},{id:55,ingId:45,qty:0.001}]},
  {id:109, name:'Paste carbonara',      type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'portie', cat:'Fel principal',
   items:[{id:56,ingId:28,qty:0.1},{id:57,ingId:12,qty:0.08},{id:58,ingId:3,qty:2},{id:59,ingId:9,qty:0.03},{id:60,ingId:33,qty:0.005},{id:61,ingId:34,qty:0.003},{id:62,ingId:45,qty:0.001}]},
  {id:110, name:'Set consumabile/pers', type:'recipe', mode:'bucata',   baseQty:1, baseUnit:'set',    cat:'Consumabile',
   items:[{id:63,ingId:51,qty:2},{id:64,ingId:52,qty:2},{id:65,ingId:53,qty:4}]},
];

var DEMO_EV = [
  // 3 evenimente IN ACEEASI ZI (dPlus(10))
  {id:201, name:'Nunta Popescu & Ionescu',  date:dPlus(10), loc:'Sala Cristal',           guests:120, notes:'Meniu complet. Muzica live.',
   items:[{recipeId:104,qty:18},{recipeId:105,qty:12},{recipeId:101,qty:120},{recipeId:102,qty:120},{recipeId:103,qty:60},{recipeId:110,qty:120}]},
  {id:202, name:'Botez familie Marin',      date:dPlus(10), loc:'Restaurant propriu',     guests:60,  notes:'Meniu traditional. Pranz.',
   items:[{recipeId:105,qty:10},{recipeId:108,qty:60},{recipeId:101,qty:60},{recipeId:103,qty:30},{recipeId:110,qty:60}]},
  {id:203, name:'Aniversare firma TechRom', date:dPlus(10), loc:'Terasa',                 guests:40,  notes:'Cocktail party. Aperitive.',
   items:[{recipeId:107,qty:40},{recipeId:109,qty:40},{recipeId:106,qty:40},{recipeId:110,qty:40}]},
  // Alte evenimente
  {id:204, name:'Conferinta TechRom',       date:dPlus(5),  loc:'Hotel Intercontinental', guests:80,  notes:'Lunch buffet + coffee break x2.',
   items:[{recipeId:106,qty:80},{recipeId:107,qty:80},{recipeId:102,qty:80},{recipeId:110,qty:80}]},
  {id:205, name:'Botez Andreescu',          date:dPlus(18), loc:'Restaurant propriu',     guests:60,  notes:'Meniu traditional. Tort extern.',
   items:[{recipeId:105,qty:10},{recipeId:101,qty:60},{recipeId:103,qty:30},{recipeId:110,qty:60}]},
  {id:206, name:'Revelion Gala 2026',       date:dPlus(42), loc:'Sala Mare',              guests:200, notes:'Premium. 5 feluri. DJ + show.',
   items:[{recipeId:104,qty:25},{recipeId:107,qty:150},{recipeId:102,qty:200},{recipeId:101,qty:200},{recipeId:103,qty:100},{recipeId:110,qty:200}]},
];

var DEMO_STOCK = {1:5,3:50,4:1,5:4,6:0.5,7:2,8:1,9:0.5,11:5,13:6,15:2,16:10,17:3,18:5,21:2,27:2,28:1,29:3,30:0.5,31:0.3,33:2,34:0.5,35:0.2,46:3,48:2,51:200,52:200,53:500};

// ─── STATE ────────────────────────────────────────────────────────────────────
var ings   = LS.get('rm_ings',   DEMO_ING);
var recs   = LS.get('rm_recs',   DEMO_REC);
var evs    = LS.get('rm_evs',    DEMO_EV);
var stock  = LS.get('rm_stock',  DEMO_STOCK);
var orders = LS.get('rm_orders', {});
var curTab = 'ingrediente';
var calView = { m: new Date().getMonth(), y: new Date().getFullYear() };
var calSel = null;

// ─── PERSONAL / STAFF ─────────────────────────────────────────────────────────
var SECTII = [
  { id: 'gratar',    label: 'Grătar',    color: '#e87d3e', bg: 'rgba(232,125,62,.13)' },
  { id: 'cald',      label: 'Cald',      color: '#e8b33e', bg: 'rgba(232,179,62,.13)' },
  { id: 'rece',      label: 'Rece',      color: '#4ab8dc', bg: 'rgba(74,184,220,.13)' },
  { id: 'vase',      label: 'Vase',      color: '#9988cc', bg: 'rgba(153,136,204,.13)' },
  { id: 'cofetarie', label: 'Cofetărie', color: '#dc6aaa', bg: 'rgba(220,106,170,.13)' },
];
var SCHED_TYPES = [
  { v: '',    fg: 'var(--text4)',         bg: 'transparent',           desc: 'Liber' },
  { v: 'ON',  fg: '#5cb87a',             bg: 'rgba(74,158,106,.22)',   desc: 'Lucru' },
  { v: 'SP',  fg: '#c8a44a',             bg: 'rgba(200,164,74,.22)',   desc: 'Suplimentar' },
  { v: 'SP+', fg: '#f0aa20',             bg: 'rgba(240,170,32,.25)',   desc: 'Suplimentar ×1.5' },
  { v: 'CO',  fg: '#7aa4dc',             bg: 'rgba(74,130,220,.22)',   desc: 'Concediu' },
  { v: 'CM',  fg: '#dc7878',             bg: 'rgba(220,100,100,.22)',  desc: 'Medical' },
  { v: 'CFP', fg: '#d4954a',             bg: 'rgba(212,149,74,.22)',   desc: 'Concediu fără plată' },
];
var staff     = LS.get('rm_staff',     []);
var schedules = LS.get('rm_schedules', {});
// Migrare valori vechi L→ON, X→SP
(function() {
  var m = false;
  Object.keys(schedules).forEach(function(id) {
    Object.keys(schedules[id]).forEach(function(dt) {
      var v = schedules[id][dt];
      if (v === 'L') { schedules[id][dt] = 'ON'; m = true; }
      else if (v === 'X') { schedules[id][dt] = 'SP'; m = true; }
    });
  });
  if (m) LS.set('rm_schedules', schedules);
})();
var staffView = { y: new Date().getFullYear(), m: new Date().getMonth() };
