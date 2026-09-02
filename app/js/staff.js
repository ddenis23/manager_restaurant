// ─── SECTIUNEA PERSONAL ───────────────────────────────────────────────────────
var staffTableZoom = parseFloat(localStorage.getItem('km-staff-zoom') || '1');
var staffViewMode  = localStorage.getItem('km-staff-view') || 'month';
var staffWeekDate  = (function(){ var d=new Date(); d.setHours(0,0,0,0); var day=d.getDay(); d.setDate(d.getDate()-(day===0?6:day-1)); return d; })();

function renderStaff() {
  var sec = document.getElementById('sec-personal'); sec.innerHTML = '';

  var render = function() {
    sec.innerHTML = '';

    // ── Page header ──────────────────────────────────────────────────────
    var ph = document.createElement('div'); ph.className = 'page-header'; sec.appendChild(ph);
    var phL = document.createElement('div');
    var ti = document.createElement('div'); ti.className = 'stitle'; ti.textContent = 'Program personal'; phL.appendChild(ti);
    var activ = staff.filter(function(e){ return e.status === 'activ'; }).length;
    var sub = document.createElement('div'); sub.className = 'ssub';
    sub.textContent = staff.length + ' angajați · ' + activ + ' activi · ' + SECTII.length + ' secții'; phL.appendChild(sub);
    ph.appendChild(phL);
    var phR = document.createElement('div'); phR.style.cssText = 'display:flex;gap:6px;align-items:center';
    phR.appendChild(btn('📊 Pontaj', function() {
      exportStaffExcel(staffView.y, staffView.m).catch(function(e){ alert('Eroare export: ' + e.message); });
    }, 'sm-ok'));
    phR.appendChild(btn('+ Angajat', function(){ showStaffForm(null); }, 'pri'));
    ph.appendChild(phR);

    // ── Split container ───────────────────────────────────────────────────
    var split = document.createElement('div'); split.className = 'sec-split'; sec.appendChild(split);

    // ── LEFT: section overview + employee list ────────────────────────────
    var left = document.createElement('div'); left.className = 'sec-left';

    // Section overview
    var sectLbl = document.createElement('div');
    sectLbl.style.cssText = 'font-size:9.5px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.1em';
    sectLbl.textContent = 'Secții bucătărie'; left.appendChild(sectLbl);

    SECTII.forEach(function(s) {
      var cnt = staff.filter(function(e){ return e.section === s.id && e.status === 'activ'; }).length;
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:7px;padding:4px 6px;font-size:12px';
      var dot = document.createElement('span');
      dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:' + s.color + ';flex-shrink:0';
      var nm = document.createElement('span'); nm.style.cssText = 'flex:1;color:' + s.color; nm.textContent = s.label;
      var cs = document.createElement('span'); cs.style.cssText = 'font-size:10px;color:var(--text3)'; cs.textContent = cnt + ' activi';
      row.appendChild(dot); row.appendChild(nm); row.appendChild(cs);
      left.appendChild(row);
    });

    // Employee list
    var empLbl = document.createElement('div');
    empLbl.style.cssText = 'font-size:9.5px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)';
    empLbl.textContent = 'Angajați'; left.appendChild(empLbl);

    if (!staff.length) {
      var empty = document.createElement('div'); empty.className = 'empty';
      empty.textContent = 'Adaugă primul angajat.'; left.appendChild(empty);
    } else {
      staff.forEach(function(emp) {
        var isInactive = emp.status !== 'activ';
        var sect = SECTII.find(function(s){ return s.id === emp.section; });
        var item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:5px;padding:5px 4px;border-radius:var(--r-sm);' + (isInactive ? 'opacity:.38;' : '');

        var dot = document.createElement('span');
        dot.style.cssText = 'width:5px;height:5px;border-radius:50%;flex-shrink:0;background:' + (sect ? sect.color : '#666');
        item.appendChild(dot);

        var nmWrap = document.createElement('div'); nmWrap.style.cssText = 'flex:1;min-width:0';
        var nm = document.createElement('div');
        nm.style.cssText = 'font-size:12px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' + (isInactive ? 'text-decoration:line-through;' : '');
        nm.textContent = emp.name; nmWrap.appendChild(nm);
        if (emp.role) {
          var rl = document.createElement('div'); rl.style.cssText = 'font-size:9px;color:var(--text3)'; rl.textContent = emp.role; nmWrap.appendChild(rl);
        }
        item.appendChild(nmWrap);

        if (emp.status === 'demisie') {
          var st = document.createElement('span');
          st.style.cssText = 'font-size:9px;color:var(--red2);background:var(--red-dim);padding:1px 5px;border-radius:3px;flex-shrink:0';
          st.textContent = 'DEM'; item.appendChild(st);
        } else if (emp.status === 'inactiv') {
          var st2 = document.createElement('span');
          st2.style.cssText = 'font-size:9px;color:var(--text3);background:var(--bg4);padding:1px 5px;border-radius:3px;flex-shrink:0';
          st2.textContent = 'INA'; item.appendChild(st2);
        }

        var ab = document.createElement('div'); ab.style.cssText = 'display:flex;gap:1px;flex-shrink:0';
        var editB = document.createElement('button');
        editB.textContent = '✏️'; editB.style.cssText = 'background:transparent;border:none;padding:2px 5px;cursor:pointer;font-size:11px;border-radius:4px';
        editB.onclick = (function(e){ return function(){ showStaffForm(e); }; })(emp);
        var delB = document.createElement('button');
        delB.textContent = '🗑'; delB.style.cssText = 'background:transparent;border:none;padding:2px 5px;cursor:pointer;font-size:11px;color:var(--red2);border-radius:4px';
        delB.onclick = (function(e){ return function(){
          if (confirm('Stergi angajatul ' + e.name + '?')) {
            staff = staff.filter(function(x){ return x.id !== e.id; });
            LS.set('rm_staff', staff); render();
          }
        }; })(emp);
        ab.appendChild(editB); ab.appendChild(delB);
        item.appendChild(ab);
        left.appendChild(item);
      });
    }

    split.appendChild(left);

    // ── RIGHT: schedule table ─────────────────────────────────────────────
    var right = document.createElement('div'); right.className = 'sec-right';
    right.style.overflowX = 'hidden';
    if (staffViewMode === 'week') buildStaffWeekTable(staffWeekDate, right);
    else buildStaffTable(staffView.y, staffView.m, right);
    split.appendChild(right);

    attachSplitDivider(split, left, right, 'km-staff-split', 22, 180, 320);
  };

  // ── Add / Edit employee form ──────────────────────────────────────────────
  var showStaffForm = function(emp) {
    var form = document.createElement('div'); form.style.cssText = 'display:grid;gap:12px';
    var ni = inp('text', emp ? emp.name : '', 'ex: Ion Popa');

    var sectSel = document.createElement('select');
    SECTII.forEach(function(s){
      var o = document.createElement('option'); o.value = s.id; o.textContent = s.label;
      if (emp && emp.section === s.id) o.selected = true;
      sectSel.appendChild(o);
    });

    var statusSel = document.createElement('select');
    [['activ','Activ'], ['inactiv','Inactiv / Suspendat'], ['demisie','Demisie']].forEach(function(pair){
      var o = document.createElement('option'); o.value = pair[0]; o.textContent = pair[1];
      if ((emp ? emp.status : 'activ') === pair[0]) o.selected = true;
      statusSel.appendChild(o);
    });

    var ni2 = inp('text', emp ? (emp.role  || '') : '', 'ex: Bucatar sef, Ajutor...');
    var ni3 = inp('text', emp ? (emp.phone || '') : '', 'ex: 0740 123 456');

    form.appendChild(fld('Nume complet *', ni));
    var g2a = document.createElement('div'); g2a.className = 'g2';
    g2a.appendChild(fld('Secție *', sectSel)); g2a.appendChild(fld('Status', statusSel)); form.appendChild(g2a);
    var g2b = document.createElement('div'); g2b.className = 'g2';
    g2b.appendChild(fld('Rol / Funcție', ni2)); g2b.appendChild(fld('Telefon', ni3)); form.appendChild(g2b);

    var modal = openModal(emp ? 'Editează angajat' : 'Angajat nou', form, [
      btn('Anulează', function(){ modal.close(); }, 'sec'),
      btn('Salvează', function(){
        if (!ni.value.trim()) return alert('Introdu numele angajatului.');
        var newEmp = { id: emp ? emp.id : Date.now(), name: ni.value.trim(), section: sectSel.value, status: statusSel.value, role: ni2.value, phone: ni3.value };
        if (emp) staff = staff.map(function(e){ return e.id === emp.id ? newEmp : e; });
        else staff = staff.concat([newEmp]);
        LS.set('rm_staff', staff); modal.close(); render();
      }, 'pri')
    ]);
  };

  render();
}

// ─── TABEL PROGRAM LUNAR ──────────────────────────────────────────────────────
function buildStaffTable(year, month, container) {
  container.innerHTML = '';

  var vtog = document.createElement('div'); vtog.style.cssText = 'display:flex;gap:4px;margin-bottom:10px;flex-shrink:0';
  var mkTB = function(lbl, active, fn) {
    var b = document.createElement('button'); b.className = 'cal-nav-btn'; b.textContent = lbl;
    if (active) b.style.cssText += ';color:var(--gold);border-color:var(--gold-line)'; b.onclick = fn; return b;
  };
  vtog.appendChild(mkTB('Lunar', true, function(){ staffViewMode='month'; localStorage.setItem('km-staff-view','month'); buildStaffTable(year,month,container); }));
  vtog.appendChild(mkTB('Săptămânal', false, function(){ staffViewMode='week'; localStorage.setItem('km-staff-view','week'); buildStaffWeekTable(staffWeekDate,container); }));
  container.appendChild(vtog);

  var dim   = new Date(year, month + 1, 0).getDate();
  var ds    = function(d) { return year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0'); };
  var getV  = function(eid, d) { return (schedules[eid] || {})[ds(d)] || ''; };
  var isWE  = function(d) { var day = new Date(year, month, d).getDay(); return day === 0 || day === 6; };
  var wdLbl = ['D','L','M','Mi','J','V','S'];

  // Month navigation
  var nav = document.createElement('div');
  nav.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-shrink:0';
  var prev = document.createElement('button'); prev.className = 'cal-nav-btn'; prev.innerHTML = '&#8592; prev';
  prev.onclick = function(){ staffView.m===0?Object.assign(staffView,{m:11,y:staffView.y-1}):staffView.m--; buildStaffTable(staffView.y, staffView.m, container); };
  var ml = document.createElement('span');
  ml.style.cssText = 'font-family:var(--font-disp);font-size:18px;color:var(--text);letter-spacing:.01em';
  ml.textContent = MONTHS[month] + ' ' + year;
  var next = document.createElement('button'); next.className = 'cal-nav-btn next'; next.innerHTML = 'next &#8594;';
  next.onclick = function(){ staffView.m===11?Object.assign(staffView,{m:0,y:staffView.y+1}):staffView.m++; buildStaffTable(staffView.y, staffView.m, container); };
  var zmLbl = document.createElement('span');
  zmLbl.style.cssText = 'font-size:10px;color:var(--text3);min-width:36px;text-align:center;font-variant-numeric:tabular-nums';
  zmLbl.textContent = Math.round(staffTableZoom*100)+'%';
  var applyZoom = function() {
    zmLbl.textContent = Math.round(staffTableZoom*100)+'%';
    if (wrap) wrap.style.zoom = staffTableZoom;
  };
  var zmB = function(lbl, fn) {
    var b = document.createElement('button'); b.className = 'cal-nav-btn';
    b.style.cssText += ';padding:3px 8px;font-size:12px'; b.textContent = lbl; b.onclick = fn; return b;
  };
  var zmBar = document.createElement('div'); zmBar.style.cssText = 'display:flex;align-items:center;gap:2px;margin-left:auto';
  zmBar.appendChild(zmB('−', function(){ staffTableZoom=Math.max(.5,Math.round((staffTableZoom-.1)*10)/10); localStorage.setItem('km-staff-zoom',staffTableZoom); applyZoom(); }));
  zmBar.appendChild(zmLbl);
  zmBar.appendChild(zmB('+', function(){ staffTableZoom=Math.min(2.5,Math.round((staffTableZoom+.1)*10)/10); localStorage.setItem('km-staff-zoom',staffTableZoom); applyZoom(); }));
  zmBar.appendChild(zmB('↺', function(){ staffTableZoom=1; localStorage.setItem('km-staff-zoom',staffTableZoom); applyZoom(); }));
  nav.appendChild(prev); nav.appendChild(ml); nav.appendChild(next); nav.appendChild(zmBar);
  container.appendChild(nav);

  // Legend
  var leg = document.createElement('div'); leg.style.cssText = 'display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;align-items:center';
  SCHED_TYPES.filter(function(t){ return t.v; }).forEach(function(t){
    var it = document.createElement('div'); it.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text3)';
    var chip = document.createElement('span');
    chip.style.cssText = 'min-width:26px;padding:0 4px;height:16px;border-radius:3px;background:'+t.bg+';color:'+t.fg+';font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box';
    chip.textContent = t.v; it.appendChild(chip); it.appendChild(document.createTextNode(' ' + t.desc)); leg.appendChild(it);
  });
  var clickHint = document.createElement('span'); clickHint.style.cssText = 'font-size:10px;color:var(--text4);margin-left:auto;font-style:italic';
  clickHint.textContent = 'click pe celulă pentru a schimba statusul'; leg.appendChild(clickHint);
  container.appendChild(leg);

  if (!staff.length) {
    var emp0 = document.createElement('div'); emp0.className = 'empty';
    emp0.textContent = 'Adaugă angajați din panoul din stânga pentru a vedea programul.'; container.appendChild(emp0); return;
  }

  // Table wrapper — horizontal scroll
  var wrap = document.createElement('div');
  wrap.className = 'staff-table-wrap';
  wrap.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--border);border-radius:var(--r);overflow-y:visible';
  wrap.style.zoom = staffTableZoom;
  container.appendChild(wrap);

  var table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;font-size:12px;min-width:max-content;width:100%';
  wrap.appendChild(table);

  // ── Header row ─────────────────────────────────────────────────────────
  var thead = document.createElement('thead');
  var hrow  = document.createElement('tr');

  var thN = document.createElement('th');
  thN.style.cssText = 'text-align:left;padding:7px 16px 7px 10px;font-size:10px;color:var(--text3);font-weight:600;letter-spacing:.08em;text-transform:uppercase;min-width:150px;white-space:nowrap;position:sticky;left:0;background:var(--bg3);z-index:3;border-bottom:2px solid var(--border2)';
  thN.textContent = 'Angajat'; hrow.appendChild(thN);

  for (var d = 1; d <= dim; d++) {
    var th = document.createElement('th');
    var we = isWE(d);
    th.style.cssText = 'width:28px;min-width:28px;text-align:center;padding:4px 1px;font-size:11px;color:'+(we?'var(--gold)':'var(--text2)')+';font-weight:700;border-bottom:2px solid var(--border2);background:var(--bg3)';
    th.innerHTML = d + '<br><span style="font-size:8.5px;font-weight:400;opacity:.65">' + wdLbl[new Date(year,month,d).getDay()] + '</span>';
    hrow.appendChild(th);
  }

  // Total headers
  [['ON','var(--green2)'],['SP','var(--gold2)'],['CO','var(--blue2)'],['CM','var(--red2)'],['CFP','#d4954a']].forEach(function(tc){
    var th = document.createElement('th');
    th.style.cssText = 'text-align:center;padding:4px 8px;font-size:10px;font-weight:700;color:'+tc[1]+';white-space:nowrap;border-left:2px solid var(--border2);border-bottom:2px solid var(--border2);background:var(--bg3)';
    th.textContent = tc[0]; hrow.appendChild(th);
  });

  thead.appendChild(hrow); table.appendChild(thead);
  var tbody = document.createElement('tbody'); table.appendChild(tbody);

  // ── Rows by section ────────────────────────────────────────────────────
  SECTII.forEach(function(sect) {
    var sectEmps = staff.filter(function(e){ return e.section === sect.id; });
    if (!sectEmps.length) return;

    // Section header row — shows coverage dot per day
    var srow = document.createElement('tr');
    var stTd = document.createElement('td');
    stTd.style.cssText = 'padding:8px 10px 4px;font-size:10px;font-weight:700;color:'+sect.color+';text-transform:uppercase;letter-spacing:.1em;position:sticky;left:0;background:var(--bg);z-index:2;white-space:nowrap;border-top:1px solid var(--border)';
    stTd.innerHTML = '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:'+sect.color+';margin-right:5px;vertical-align:middle"></span>' + sect.label;
    srow.appendChild(stTd);

    for (var d = 1; d <= dim; d++) {
      var dateStr = ds(d);
      var covered = sectEmps.some(function(e){
        var v = (schedules[e.id] || {})[dateStr];
        return v === 'ON' || v === 'SP' || v === 'SP+';
      });
      var we = isWE(d);
      var cvTd = document.createElement('td');
      cvTd.style.cssText = 'text-align:center;padding:5px 1px;background:var(--bg);border-top:1px solid var(--border)';
      var dot = document.createElement('div');
      dot.style.cssText = 'width:5px;height:5px;border-radius:50%;margin:0 auto;background:' + (covered ? 'rgba(74,175,100,.85)' : 'rgba(210,75,75,.85)') + (we ? ';opacity:.55' : '');
      dot.title = covered ? 'Secție acoperită' : 'ATENȚIE: secție fără personal!';
      cvTd.appendChild(dot); srow.appendChild(cvTd);
    }
    // Empty total cells for section header
    for (var t = 0; t < 5; t++) {
      var td0 = document.createElement('td'); td0.style.cssText = 'border-left:2px solid var(--border2);border-top:1px solid var(--border);background:var(--bg)'; srow.appendChild(td0);
    }
    tbody.appendChild(srow);

    // Employee rows
    sectEmps.forEach(function(emp) {
      var inactive = emp.status !== 'activ';
      var erow = document.createElement('tr');

      var nameTd = document.createElement('td');
      nameTd.style.cssText = 'padding:3px 14px 3px 10px;white-space:nowrap;font-size:12px;font-weight:500;color:'+(inactive?'var(--text3)':'var(--text)')+';position:sticky;left:0;background:var(--bg2);z-index:1;border-bottom:1px solid rgba(255,255,255,.035)';
      if (inactive) nameTd.style.cssText += 'text-decoration:line-through;';
      nameTd.textContent = emp.name;
      if (emp.role) {
        var rl = document.createElement('span'); rl.style.cssText = 'display:block;font-size:9px;color:var(--text3);font-weight:400;margin-top:1px'; rl.textContent = emp.role; nameTd.appendChild(rl);
      }
      erow.appendChild(nameTd);

      var totON=0,totSP=0,totSPP=0,totCO=0,totCM=0,totCFP=0;

      for (var d = 1; d <= dim; d++) {
        var val  = getV(emp.id, d);
        var type = SCHED_TYPES.find(function(t){ return t.v === val; }) || SCHED_TYPES[0];
        if (val==='ON') totON++; else if(val==='SP') totSP++; else if(val==='SP+') totSPP++; else if(val==='CO') totCO++; else if(val==='CM') totCM++; else if(val==='CFP') totCFP++;

        var cell = document.createElement('td');
        cell.style.cssText = 'text-align:center;width:28px;min-width:28px;height:24px;font-size:10px;font-weight:700;cursor:'+(inactive?'default':'pointer')+';border:1px solid rgba(255,255,255,.03);color:'+type.fg+';background:'+type.bg+';user-select:none;transition:background .08s,color .08s';
        cell.textContent = val;
        if (isWE(d) && !val) cell.style.background = 'rgba(255,255,255,.02)';

        if (!inactive) {
          (function(empId, dStr, el) {
            el.onmouseenter = function(){ if (!el.textContent) el.style.background = 'var(--bg4)'; };
            el.onmouseleave = function(){ var v=getV(empId, parseInt(dStr.split('-')[2])); var tp=SCHED_TYPES.find(function(t){return t.v===v;})||SCHED_TYPES[0]; el.style.background=tp.bg; };
            el.onclick = function() {
              if (!schedules[empId]) schedules[empId] = {};
              var cur   = schedules[empId][dStr] || '';
              var types = SCHED_TYPES.map(function(t){ return t.v; });
              var nxt   = types[(types.indexOf(cur) + 1) % types.length];
              schedules[empId][dStr] = nxt;
              LS.set('rm_schedules', schedules);
              var savedScroll = wrap.scrollLeft;
              buildStaffTable(year, month, container);
              var newWrap = container.querySelector('.staff-table-wrap');
              if (newWrap) newWrap.scrollLeft = savedScroll;
            };
          })(emp.id, ds(d), cell);
        }
        erow.appendChild(cell);
      }

      // Totals
      var wSP = Math.round((totSP + totSPP * 1.5) * 10) / 10;
      [[totON,'var(--green2)'],[wSP,'var(--gold2)'],[totCO,'var(--blue2)'],[totCM,'var(--red2)'],[totCFP,'#d4954a']].forEach(function(tc){
        var td = document.createElement('td');
        td.style.cssText = 'text-align:center;padding:2px 7px;font-size:11px;font-weight:700;color:'+(tc[0]>0?tc[1]:'var(--text4)')+';border-left:2px solid var(--border2);white-space:nowrap';
        td.textContent = tc[0] > 0 ? tc[0] : '—'; erow.appendChild(td);
      });

      tbody.appendChild(erow);
    });
  });
}

// ─── EXPORT PONTAJ EXCEL ──────────────────────────────────────────────────────
async function exportStaffExcel(year, month) {
  var wb  = mkWb();
  var x   = xlX();
  var G=x.G, DK=x.DK, DK2=x.DK2, W=x.W, GR=x.GR, GM=x.GM, fill=x.fill, fnt=x.fnt, aln=x.aln, brd=x.brd;
  var dim = new Date(year, month + 1, 0).getDate();

  // Column letter helper (supports AA, AB, ...)
  var xc = function(n) {
    var s = '';
    while (n > 0) { s = String.fromCharCode(65 + (n-1) % 26) + s; n = Math.floor((n-1) / 26); }
    return s;
  };

  // Layout: col1=spacer, col2=name, col3=section, col4..=days, then ON/SP/SP+/CO/CM/CFP/Ef totals
  var NC = 2, SC = 3, DC = 4, TC = DC + dim;
  // TC+0=ON, TC+1=SP(weighted SP+SP+x1.5), TC+2=CO, TC+3=CM, TC+4=CFP, TC+5=Ef(ON+SP)
  var LAST = TC + 5;

  // Column widths
  var cols = [{width:1.5}, {width:24}, {width:13}];
  for (var d = 1; d <= dim; d++) cols.push({width:3.8});
  cols.push({width:5},{width:6},{width:5},{width:5},{width:6},{width:7},{width:1.5});

  var ws = wb.addWorksheet('Pontaj ' + MONTHS[month], { views:[{showGridLines:false}] });
  ws.columns = cols;

  // Row 1: title
  ws.mergeCells(xc(NC)+'1:'+xc(LAST)+'1');
  ws.getCell(xc(NC)+'1').value = 'PONTAJ — ' + MONTHS[month].toUpperCase() + ' ' + year;
  ws.getCell(xc(NC)+'1').font = fnt(13,true,G);
  ws.getCell(xc(NC)+'1').fill = fill(DK);
  ws.getCell(xc(NC)+'1').alignment = aln('center');
  ws.getRow(1).height = 28;

  // Row 2: sub-header
  ws.mergeCells(xc(NC)+'2:'+xc(LAST)+'2');
  ws.getCell(xc(NC)+'2').value = 'KitchenManager  ·  Generat: ' + new Date().toLocaleDateString('ro-RO',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  ws.getCell(xc(NC)+'2').font = fnt(9,false,'FFCCB87A',true);
  ws.getCell(xc(NC)+'2').fill = fill(DK);
  ws.getCell(xc(NC)+'2').alignment = aln('center');
  ws.getRow(2).height = 15;

  // Row 3: legend
  ws.mergeCells(xc(NC)+'3:'+xc(LAST)+'3');
  ws.getCell(xc(NC)+'3').value = 'ON = Lucru   SP = Suplimentar (SP normal + SP+×1.5)   CO = Concediu   CM = Medical   CFP = Concediu fără plată   Ef = ON + SP';
  ws.getCell(xc(NC)+'3').font = fnt(8,false,'FF888868',true);
  ws.getCell(xc(NC)+'3').fill = fill(DK);
  ws.getCell(xc(NC)+'3').alignment = aln('center');
  ws.getRow(3).height = 13;

  // Row 4: spacer
  ws.mergeCells(xc(NC)+'4:'+xc(LAST)+'4');
  ws.getCell(xc(NC)+'4').fill = fill(DK);
  ws.getRow(4).height = 4;

  // Row 5: column headers
  ws.getCell(xc(NC)+'5').value = 'ANGAJAT / FUNCȚIE';
  ws.getCell(xc(NC)+'5').font = fnt(10,true,W);
  ws.getCell(xc(NC)+'5').fill = fill(DK2);
  ws.getCell(xc(NC)+'5').alignment = aln('left','middle');

  ws.getCell(xc(SC)+'5').value = 'SECȚIE';
  ws.getCell(xc(SC)+'5').font = fnt(9,true,W);
  ws.getCell(xc(SC)+'5').fill = fill(DK2);
  ws.getCell(xc(SC)+'5').alignment = aln('center','middle');

  for (var d = 1; d <= dim; d++) {
    var dt = new Date(year, month, d);
    var we = dt.getDay() === 0 || dt.getDay() === 6;
    var col = xc(DC + d - 1);
    var wdl = ['D','L','M','Mi','J','V','S'][dt.getDay()];
    ws.getCell(col+'5').value = d + '\n' + wdl;
    ws.getCell(col+'5').font = fnt(9, true, we ? 'FFD4A853' : W);
    ws.getCell(col+'5').fill = fill(DK2);
    ws.getCell(col+'5').alignment = aln('center','middle');
    ws.getRow(5).height = 26;
  }
  [['ON','FF4aac6a'],['SP','FFD4A853'],['CO','FF7aa4dc'],['CM','FFdc7878'],['CFP','FFd4954a'],['Ef.','FFDDDDCC']].forEach(function(tc,i){
    var col = xc(TC+i);
    ws.getCell(col+'5').value = tc[0];
    ws.getCell(col+'5').font = fnt(10,true,tc[1]);
    ws.getCell(col+'5').fill = fill(DK2);
    ws.getCell(col+'5').alignment = aln('center','middle');
    ws.getCell(col+'5').border = brd();
  });

  var rowNum = 6;

  SECTII.forEach(function(sect) {
    var sectEmps = staff.filter(function(e){ return e.section === sect.id; });
    if (!sectEmps.length) return;

    // Section header
    ws.mergeCells(xc(NC)+rowNum+':'+xc(LAST)+rowNum);
    ws.getCell(xc(NC)+rowNum).value = '  ' + sect.label.toUpperCase();
    ws.getCell(xc(NC)+rowNum).font = fnt(9,true,'FF9E7C2E');
    ws.getCell(xc(NC)+rowNum).fill = fill('FFFCE8B2');
    ws.getRow(rowNum).height = 14;
    rowNum++;

    var sectTotON=0,sectTotSP=0,sectTotCO=0,sectTotCM=0,sectTotCFP=0;

    sectEmps.forEach(function(emp, idx) {
      var odd   = idx % 2 === 0;
      var bgClr = odd ? GR : W;
      var totON=0,totSP=0,totSPP=0,totCO=0,totCM=0,totCFP=0;

      // Name cell — name + role on second line
      var nameVal = emp.name + (emp.role ? '\n' + emp.role : '');
      ws.getCell(xc(NC)+rowNum).value = nameVal;
      ws.getCell(xc(NC)+rowNum).font  = fnt(10,false,DK2);
      ws.getCell(xc(NC)+rowNum).fill  = fill(bgClr);
      ws.getCell(xc(NC)+rowNum).alignment = { horizontal:'left', vertical:'middle', wrapText: true };
      ws.getRow(rowNum).height = emp.role ? 26 : 18;

      ws.getCell(xc(SC)+rowNum).value = sect.label;
      ws.getCell(xc(SC)+rowNum).font  = fnt(9,false,'FF888878');
      ws.getCell(xc(SC)+rowNum).fill  = fill(bgClr);
      ws.getCell(xc(SC)+rowNum).alignment = aln('center','middle');

      for (var d = 1; d <= dim; d++) {
        var dateStr = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        var val = (schedules[emp.id]||{})[dateStr]||'';
        var col = xc(DC + d - 1);
        var ddt = new Date(year, month, d);
        var we  = ddt.getDay() === 0 || ddt.getDay() === 6;

        if      (val==='ON')  { totON++;  ws.getCell(col+rowNum).value='ON';  ws.getCell(col+rowNum).font=fnt(9,true,'FF4aac6a');  ws.getCell(col+rowNum).fill=fill('FF1a3a22'); }
        else if (val==='SP')  { totSP++;  ws.getCell(col+rowNum).value='SP';  ws.getCell(col+rowNum).font=fnt(9,true,'FFD4A853');  ws.getCell(col+rowNum).fill=fill('FF2a2010'); }
        else if (val==='SP+') { totSPP++; ws.getCell(col+rowNum).value='SP+'; ws.getCell(col+rowNum).font=fnt(8,true,'FFf0aa20');  ws.getCell(col+rowNum).fill=fill('FF2a1800'); }
        else if (val==='CO')  { totCO++;  ws.getCell(col+rowNum).value='CO';  ws.getCell(col+rowNum).font=fnt(9,true,'FF7aa4dc');  ws.getCell(col+rowNum).fill=fill('FF151528'); }
        else if (val==='CM')  { totCM++;  ws.getCell(col+rowNum).value='CM';  ws.getCell(col+rowNum).font=fnt(9,true,'FFdc7878');  ws.getCell(col+rowNum).fill=fill('FF2a1010'); }
        else if (val==='CFP') { totCFP++; ws.getCell(col+rowNum).value='CFP'; ws.getCell(col+rowNum).font=fnt(8,true,'FFd4954a');  ws.getCell(col+rowNum).fill=fill('FF251808'); }
        else {
          ws.getCell(col+rowNum).value = '—';
          ws.getCell(col+rowNum).font  = fnt(8,false,we ? 'FF443830' : 'FF444438');
          ws.getCell(col+rowNum).fill  = fill(we ? 'FF1c1810' : bgClr);
        }
        ws.getCell(col+rowNum).alignment = aln('center','middle');
        ws.getCell(col+rowNum).border = brd();
      }

      var wSPx = Math.round((totSP + totSPP * 1.5) * 10) / 10;
      var ef   = Math.round((totON + wSPx) * 10) / 10;
      sectTotON+=totON; sectTotSP+=wSPx; sectTotCO+=totCO; sectTotCM+=totCM; sectTotCFP+=totCFP;

      [[totON,'FF4aac6a'],[wSPx,'FFD4A853'],[totCO,'FF7aa4dc'],[totCM,'FFdc7878'],[totCFP,'FFd4954a']].forEach(function(tc,i){
        var col = xc(TC+i);
        ws.getCell(col+rowNum).value = tc[0] > 0 ? tc[0] : '';
        ws.getCell(col+rowNum).font  = fnt(11,true,tc[0]>0?tc[1]:'FF555555');
        ws.getCell(col+rowNum).fill  = fill(bgClr);
        ws.getCell(col+rowNum).alignment = aln('center','middle');
        ws.getCell(col+rowNum).border = brd();
      });
      // Ef. column
      ws.getCell(xc(TC+5)+rowNum).value = ef > 0 ? ef : '';
      ws.getCell(xc(TC+5)+rowNum).font  = fnt(11,true,ef>0?'FFDDDDCC':'FF555555');
      ws.getCell(xc(TC+5)+rowNum).fill  = fill(bgClr);
      ws.getCell(xc(TC+5)+rowNum).alignment = aln('center','middle');
      ws.getCell(xc(TC+5)+rowNum).border = brd();

      rowNum++;
    });

    // Section totals row
    var sectEf = Math.round((sectTotON + sectTotSP) * 10) / 10;
    ws.mergeCells(xc(NC)+rowNum+':'+xc(DC-1)+rowNum);
    ws.getCell(xc(NC)+rowNum).value = 'TOTAL ' + sect.label.toUpperCase();
    ws.getCell(xc(NC)+rowNum).font = fnt(9,true,'FF9E7C2E');
    ws.getCell(xc(NC)+rowNum).fill = fill('FF1a160c');
    ws.getCell(xc(NC)+rowNum).alignment = aln('left','middle');
    for (var d = 1; d <= dim; d++) {
      ws.getCell(xc(DC+d-1)+rowNum).fill = fill('FF1a160c');
    }
    [[sectTotON,'FF4aac6a'],[sectTotSP,'FFD4A853'],[sectTotCO,'FF7aa4dc'],[sectTotCM,'FFdc7878'],[sectTotCFP,'FFd4954a']].forEach(function(tc,i){
      var col = xc(TC+i);
      ws.getCell(col+rowNum).value = tc[0] > 0 ? tc[0] : '';
      ws.getCell(col+rowNum).font  = fnt(11,true,tc[1]);
      ws.getCell(col+rowNum).fill  = fill('FF1a160c');
      ws.getCell(col+rowNum).alignment = aln('center','middle');
    });
    ws.getCell(xc(TC+5)+rowNum).value = sectEf > 0 ? sectEf : '';
    ws.getCell(xc(TC+5)+rowNum).font  = fnt(11,true,'FFDDDDCC');
    ws.getCell(xc(TC+5)+rowNum).fill  = fill('FF1a160c');
    ws.getCell(xc(TC+5)+rowNum).alignment = aln('center','middle');
    ws.getRow(rowNum).height = 16;
    rowNum += 2; // gap between sections
  });

  await xlSave(wb, 'Pontaj-' + MONTHS[month] + '-' + year + '.xlsx');
}

// ─── TABEL PROGRAM SAPTAMANAL ─────────────────────────────────────────────────
function buildStaffWeekTable(weekStart, container) {
  container.innerHTML = '';
  var monNames = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec'];
  var wdNames  = ['Du','Lu','Ma','Mi','Jo','Vi','Sâ'];

  // 7 days starting Monday
  var days = [];
  for (var i = 0; i < 7; i++) {
    var dd = new Date(weekStart.getTime() + i * 86400000);
    days.push(dd);
  }
  var dsOf = function(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  var isWE = function(d) { var day = d.getDay(); return day===0||day===6; };

  // View toggle
  var vtog = document.createElement('div'); vtog.style.cssText = 'display:flex;gap:4px;margin-bottom:10px;flex-shrink:0';
  var mkTB = function(lbl, active, fn) {
    var b = document.createElement('button'); b.className = 'cal-nav-btn'; b.textContent = lbl;
    if (active) b.style.cssText += ';color:var(--gold);border-color:var(--gold-line)'; b.onclick = fn; return b;
  };
  vtog.appendChild(mkTB('Lunar', false, function(){ staffViewMode='month'; localStorage.setItem('km-staff-view','month'); buildStaffTable(staffView.y,staffView.m,container); }));
  vtog.appendChild(mkTB('Săptămânal', true, function(){ staffViewMode='week'; localStorage.setItem('km-staff-view','week'); buildStaffWeekTable(weekStart,container); }));
  container.appendChild(vtog);

  // Week label
  var weekEnd = days[6];
  var wLbl = weekStart.getMonth()===weekEnd.getMonth()
    ? weekStart.getDate()+' – '+weekEnd.getDate()+' '+MONTHS[weekStart.getMonth()]+' '+weekStart.getFullYear()
    : weekStart.getDate()+' '+monNames[weekStart.getMonth()]+' – '+weekEnd.getDate()+' '+monNames[weekEnd.getMonth()]+' '+weekStart.getFullYear();

  // Navigation + zoom
  var nav = document.createElement('div');
  nav.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-shrink:0';
  var prev = document.createElement('button'); prev.className = 'cal-nav-btn'; prev.innerHTML = '&#8592; prev';
  prev.onclick = function(){ staffWeekDate=new Date(staffWeekDate.getTime()-7*86400000); buildStaffWeekTable(staffWeekDate,container); };
  var ml = document.createElement('span');
  ml.style.cssText = 'font-family:var(--font-disp);font-size:16px;color:var(--text);letter-spacing:.01em';
  ml.textContent = wLbl;
  var next = document.createElement('button'); next.className = 'cal-nav-btn next'; next.innerHTML = 'next &#8594;';
  next.onclick = function(){ staffWeekDate=new Date(staffWeekDate.getTime()+7*86400000); buildStaffWeekTable(staffWeekDate,container); };

  var zmLbl = document.createElement('span');
  zmLbl.style.cssText = 'font-size:10px;color:var(--text3);min-width:36px;text-align:center;font-variant-numeric:tabular-nums';
  zmLbl.textContent = Math.round(staffTableZoom*100)+'%';
  var applyZoom = function() { zmLbl.textContent=Math.round(staffTableZoom*100)+'%'; if(wrap) wrap.style.zoom=staffTableZoom; };
  var zmB = function(lbl, fn) {
    var b = document.createElement('button'); b.className = 'cal-nav-btn';
    b.style.cssText += ';padding:3px 8px;font-size:12px'; b.textContent = lbl; b.onclick = fn; return b;
  };
  var zmBar = document.createElement('div'); zmBar.style.cssText = 'display:flex;align-items:center;gap:2px;margin-left:auto';
  zmBar.appendChild(zmB('−', function(){ staffTableZoom=Math.max(.5,Math.round((staffTableZoom-.1)*10)/10); localStorage.setItem('km-staff-zoom',staffTableZoom); applyZoom(); }));
  zmBar.appendChild(zmLbl);
  zmBar.appendChild(zmB('+', function(){ staffTableZoom=Math.min(2.5,Math.round((staffTableZoom+.1)*10)/10); localStorage.setItem('km-staff-zoom',staffTableZoom); applyZoom(); }));
  zmBar.appendChild(zmB('↺', function(){ staffTableZoom=1; localStorage.setItem('km-staff-zoom',staffTableZoom); applyZoom(); }));
  nav.appendChild(prev); nav.appendChild(ml); nav.appendChild(next); nav.appendChild(zmBar);
  container.appendChild(nav);

  // Legend
  var leg = document.createElement('div'); leg.style.cssText = 'display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;align-items:center';
  SCHED_TYPES.filter(function(t){ return t.v; }).forEach(function(t){
    var it = document.createElement('div'); it.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text3)';
    var chip = document.createElement('span');
    chip.style.cssText = 'min-width:26px;padding:0 4px;height:16px;border-radius:3px;background:'+t.bg+';color:'+t.fg+';font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box';
    chip.textContent = t.v; it.appendChild(chip); it.appendChild(document.createTextNode(' '+t.desc)); leg.appendChild(it);
  });
  var clickHint = document.createElement('span'); clickHint.style.cssText = 'font-size:10px;color:var(--text4);margin-left:auto;font-style:italic';
  clickHint.textContent = 'click pe celulă pentru a schimba statusul'; leg.appendChild(clickHint);
  container.appendChild(leg);

  if (!staff.length) {
    var emp0 = document.createElement('div'); emp0.className = 'empty';
    emp0.textContent = 'Adaugă angajați din panoul din stânga.'; container.appendChild(emp0); return;
  }

  // Table
  var wrap = document.createElement('div');
  wrap.className = 'staff-table-wrap';
  wrap.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--border);border-radius:var(--r);overflow-y:visible';
  wrap.style.zoom = staffTableZoom;
  container.appendChild(wrap);

  var table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;font-size:12px;min-width:max-content;width:100%';
  wrap.appendChild(table);

  var thead = document.createElement('thead');
  var hrow  = document.createElement('tr');
  var thN = document.createElement('th');
  thN.style.cssText = 'text-align:left;padding:7px 16px 7px 10px;font-size:10px;color:var(--text3);font-weight:600;letter-spacing:.08em;text-transform:uppercase;min-width:150px;white-space:nowrap;position:sticky;left:0;background:var(--bg3);z-index:3;border-bottom:2px solid var(--border2)';
  thN.textContent = 'Angajat'; hrow.appendChild(thN);

  days.forEach(function(day) {
    var th = document.createElement('th');
    var we = isWE(day);
    th.style.cssText = 'min-width:68px;text-align:center;padding:5px 4px;font-size:11px;color:'+(we?'var(--gold)':'var(--text2)')+';font-weight:700;border-bottom:2px solid var(--border2);background:var(--bg3)';
    th.innerHTML = wdNames[day.getDay()]+' '+day.getDate()+'<br><span style="font-size:9px;font-weight:400;opacity:.6">'+monNames[day.getMonth()]+'</span>';
    hrow.appendChild(th);
  });

  [['ON','var(--green2)'],['SP','var(--gold2)'],['CO','var(--blue2)'],['CM','var(--red2)'],['CFP','#d4954a']].forEach(function(tc){
    var th = document.createElement('th');
    th.style.cssText = 'text-align:center;padding:4px 8px;font-size:10px;font-weight:700;color:'+tc[1]+';white-space:nowrap;border-left:2px solid var(--border2);border-bottom:2px solid var(--border2);background:var(--bg3)';
    th.textContent = tc[0]; hrow.appendChild(th);
  });

  thead.appendChild(hrow); table.appendChild(thead);
  var tbody = document.createElement('tbody'); table.appendChild(tbody);

  SECTII.forEach(function(sect) {
    var sectEmps = staff.filter(function(e){ return e.section===sect.id; });
    if (!sectEmps.length) return;

    // Section header + coverage dots
    var srow = document.createElement('tr');
    var stTd = document.createElement('td');
    stTd.style.cssText = 'padding:8px 10px 4px;font-size:10px;font-weight:700;color:'+sect.color+';text-transform:uppercase;letter-spacing:.1em;position:sticky;left:0;background:var(--bg);z-index:2;white-space:nowrap;border-top:1px solid var(--border)';
    stTd.innerHTML = '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:'+sect.color+';margin-right:5px;vertical-align:middle"></span>'+sect.label;
    srow.appendChild(stTd);
    days.forEach(function(day) {
      var covered = sectEmps.some(function(e){ var v=(schedules[e.id]||{})[dsOf(day)]; return v==='ON'||v==='SP'||v==='SP+'; });
      var cvTd = document.createElement('td');
      cvTd.style.cssText = 'text-align:center;padding:5px 1px;background:var(--bg);border-top:1px solid var(--border)';
      var dot = document.createElement('div');
      dot.style.cssText = 'width:7px;height:7px;border-radius:50%;margin:0 auto;background:'+(covered?'rgba(74,175,100,.85)':'rgba(210,75,75,.85)')+(isWE(day)?';opacity:.55':'');
      dot.title = covered?'Secție acoperită':'ATENȚIE: secție fără personal!';
      cvTd.appendChild(dot); srow.appendChild(cvTd);
    });
    for (var t = 0; t < 5; t++) {
      var td0 = document.createElement('td'); td0.style.cssText = 'border-left:2px solid var(--border2);border-top:1px solid var(--border);background:var(--bg)'; srow.appendChild(td0);
    }
    tbody.appendChild(srow);

    sectEmps.forEach(function(emp) {
      var inactive = emp.status !== 'activ';
      var erow = document.createElement('tr');
      var nameTd = document.createElement('td');
      nameTd.style.cssText = 'padding:3px 14px 3px 10px;white-space:nowrap;font-size:12px;font-weight:500;color:'+(inactive?'var(--text3)':'var(--text)')+';position:sticky;left:0;background:var(--bg2);z-index:1;border-bottom:1px solid rgba(255,255,255,.035)';
      if (inactive) nameTd.style.cssText += 'text-decoration:line-through;';
      nameTd.textContent = emp.name;
      if (emp.role) { var rl=document.createElement('span'); rl.style.cssText='display:block;font-size:9px;color:var(--text3);font-weight:400;margin-top:1px'; rl.textContent=emp.role; nameTd.appendChild(rl); }
      erow.appendChild(nameTd);

      var totON=0,totSP=0,totSPP=0,totCO=0,totCM=0,totCFP=0;

      days.forEach(function(day) {
        var dStr = dsOf(day);
        var val  = (schedules[emp.id]||{})[dStr]||'';
        var type = SCHED_TYPES.find(function(t){ return t.v===val; })||SCHED_TYPES[0];
        if (val==='ON') totON++; else if(val==='SP') totSP++; else if(val==='SP+') totSPP++; else if(val==='CO') totCO++; else if(val==='CM') totCM++; else if(val==='CFP') totCFP++;

        var cell = document.createElement('td');
        var we = isWE(day);
        cell.style.cssText = 'text-align:center;min-width:68px;height:28px;font-size:11px;font-weight:700;cursor:'+(inactive?'default':'pointer')+';border:1px solid rgba(255,255,255,.03);color:'+type.fg+';background:'+type.bg+';user-select:none;transition:background .08s,color .08s';
        cell.textContent = val;
        if (we && !val) cell.style.background = 'rgba(255,255,255,.02)';

        if (!inactive) {
          (function(empId, dStr2, el) {
            el.onmouseenter = function(){ if(!el.textContent) el.style.background='var(--bg4)'; };
            el.onmouseleave = function(){ var v=(schedules[empId]||{})[dStr2]||''; var tp=SCHED_TYPES.find(function(t){return t.v===v;})||SCHED_TYPES[0]; el.style.background=tp.bg; };
            el.onclick = function() {
              if (!schedules[empId]) schedules[empId]={};
              var cur=schedules[empId][dStr2]||'';
              var types=SCHED_TYPES.map(function(t){return t.v;});
              schedules[empId][dStr2]=types[(types.indexOf(cur)+1)%types.length];
              LS.set('rm_schedules',schedules);
              var savedScroll=wrap.scrollLeft;
              buildStaffWeekTable(weekStart,container);
              var newWrap=container.querySelector('.staff-table-wrap');
              if(newWrap) newWrap.scrollLeft=savedScroll;
            };
          })(emp.id, dStr, cell);
        }
        erow.appendChild(cell);
      });

      var wSP = Math.round((totSP + totSPP * 1.5) * 10) / 10;
      [[totON,'var(--green2)'],[wSP,'var(--gold2)'],[totCO,'var(--blue2)'],[totCM,'var(--red2)'],[totCFP,'#d4954a']].forEach(function(tc){
        var td = document.createElement('td');
        td.style.cssText = 'text-align:center;padding:2px 7px;font-size:11px;font-weight:700;color:'+(tc[0]>0?tc[1]:'var(--text4)')+';border-left:2px solid var(--border2);white-space:nowrap';
        td.textContent = tc[0] > 0 ? tc[0] : '—'; erow.appendChild(td);
      });

      tbody.appendChild(erow);
    });
  });
}
