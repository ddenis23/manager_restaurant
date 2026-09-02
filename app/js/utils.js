// ─── DOM HELPERS ──────────────────────────────────────────────────────────────
var h = (tag, attrs, ...children) => {
  const el = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => c != null && el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return el;
};

var btn = (label, onclick, style, extra) => {
  style = style || '';
  extra = extra || {};
  const el = document.createElement('button');
  el.innerHTML = label; el.onclick = onclick;
  const base = {
    fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:'500',
    display:'inline-flex', alignItems:'center', gap:'5px',
    transition:'var(--t)', border:'1px solid transparent',
    borderRadius:'var(--r-sm)', cursor:'pointer', lineHeight:'1.4',
    letterSpacing:'.02em', padding:'7px 14px',
  };
  const styles = {
    'pri':    {background:'var(--gold2)',color:'#0a0800',fontWeight:'600',border:'none',boxShadow:'0 2px 8px rgba(184,150,12,.25)'},
    'sec':    {background:'var(--bg4)',color:'var(--text2)',borderColor:'var(--border2)'},
    'dan':    {background:'var(--red-dim)',color:'var(--red2)',borderColor:'rgba(184,80,80,.2)'},
    'ok':     {background:'var(--green-dim)',color:'var(--green2)',borderColor:'rgba(74,158,106,.2)'},
    'sm-sec': {background:'var(--bg4)',color:'var(--text2)',borderColor:'var(--border2)',padding:'5px 11px',fontSize:'12px'},
    'sm-dan': {background:'var(--red-dim)',color:'var(--red2)',borderColor:'rgba(184,80,80,.2)',padding:'5px 11px',fontSize:'12px'},
    'sm-ok':  {background:'var(--green-dim)',color:'var(--green2)',borderColor:'rgba(74,158,106,.2)',padding:'5px 11px',fontSize:'12px'},
    'ghost':  {background:'transparent',color:'var(--text3)',padding:'4px 8px',fontSize:'13px',borderColor:'transparent'},
  };
  Object.assign(base, styles[style] || {background:'transparent',color:'var(--text3)',padding:'4px 8px',fontSize:'12px'});
  Object.assign(el.style, base);
  if (extra.disabled) { el.disabled=true; el.style.opacity='0.3'; el.style.cursor='not-allowed'; }
  return el;
};

var badge = (text, bg, color) => {
  const s = document.createElement('span');
  s.className = 'badge';
  s.textContent = text;
  s.style.background = bg;
  s.style.color = color;
  s.style.borderRadius = 'var(--r-xs)';
  return s;
};

var lbl = text => {
  const s = document.createElement('span');
  s.className = 'lbl';
  s.textContent = text;
  return s;
};

var fld = (labelText, inputEl) => {
  const w = document.createElement('div');
  w.style.marginBottom = '0';
  if (labelText) w.appendChild(lbl(labelText));
  w.appendChild(inputEl);
  return w;
};

var inp = (type, val, placeholder, style) => {
  style = style || {};
  const el = document.createElement('input');
  el.type = type; el.value = val || ''; el.placeholder = placeholder || '';
  Object.assign(el.style, style);
  return el;
};

var sel = (options, val) => {
  const el = document.createElement('select');
  options.forEach(([v,l]) => {
    const o = document.createElement('option');
    o.value = v; o.textContent = l; if (v == val) o.selected = true;
    el.appendChild(o);
  });
  return el;
};

var openModal = (title, content, buttons) => {
  buttons = buttons || [];
  const ov = document.createElement('div'); ov.className = 'overlay';
  const mo = document.createElement('div'); mo.className = 'modal';
  const hd = document.createElement('div'); hd.className = 'row';
  hd.style.cssText = 'margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border);gap:12px';
  const ti = document.createElement('span');
  ti.style.cssText = "font-family:var(--font-disp);font-size:20px;font-weight:400;color:var(--text);letter-spacing:-.01em";
  ti.textContent = title;
  const xb = btn('✕', () => document.body.removeChild(ov));
  xb.style.cssText = 'background:var(--bg3);color:var(--text2);border:1.5px solid var(--border2);border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;padding:0;font-size:14px;cursor:pointer';
  hd.appendChild(ti); hd.appendChild(xb); mo.appendChild(hd); mo.appendChild(content);
  if (buttons.length) {
    const bf = document.createElement('div');
    bf.style.cssText = 'display:flex;gap:8px;margin-top:18px;justify-content:flex-end;padding-top:14px;border-top:1px solid var(--border)';
    buttons.forEach(b => bf.appendChild(b)); mo.appendChild(bf);
  }
  ov.appendChild(mo);
  ov.addEventListener('click', e => { if (e.target === ov) document.body.removeChild(ov); });
  document.body.appendChild(ov);
  return { close: () => { if (document.body.contains(ov)) document.body.removeChild(ov); } };
};

// ─── EXCEL HELPERS ────────────────────────────────────────────────────────────
function mkWb() { return new ExcelJS.Workbook(); }

function xlX() {
  const G='FFD4A853',DK='FF100E0A',DK2='FF1E1710',W='FFFFFFFF',GR='FFF7F4EF',GM='FFFCE8B2',GL='FFFFF3DC';
  const fill=a=>({type:'pattern',pattern:'solid',fgColor:{argb:a}});
  const fnt=(sz,bold,argb,ital)=>({name:'Arial',size:sz,bold,italic:ital||false,color:{argb}});
  const aln=(h,v)=>({horizontal:h,vertical:v||'middle'});
  const brd=()=>{const s={style:'thin',color:{argb:'FFD8D0C0'}};return{top:s,left:s,bottom:s,right:s};};
  return {G,DK,DK2,W,GR,GM,GL,fill,fnt,aln,brd};
}

function xlHdr(ws,title,sub,x){
  const {G,DK,fill,fnt,aln}=x;
  ws.mergeCells('B1:F1'); ws.getCell('B1').value=title;
  ws.getCell('B1').font=fnt(16,true,G); ws.getCell('B1').fill=fill(DK); ws.getCell('B1').alignment=aln('center'); ws.getRow(1).height=32;
  ws.mergeCells('B2:F2'); ws.getCell('B2').value=sub;
  ws.getCell('B2').font=fnt(10,false,'FFCCB87A'); ws.getCell('B2').fill=fill(DK); ws.getCell('B2').alignment=aln('center'); ws.getRow(2).height=18;
  ws.mergeCells('B3:F3'); ws.getCell('B3').fill=fill(DK); ws.getRow(3).height=6;
}

function xlStats(ws,stats,x){
  const {DK2,GL,fnt,aln,fill}=x;
  const cols=['B','C','D','E','F'].slice(0,stats.length);
  cols.forEach((col,i)=>{
    ws.getCell(col+'4').value=stats[i][0]; ws.getCell(col+'4').font=fnt(9,true,'FF9E7C2E'); ws.getCell(col+'4').fill=fill(GL); ws.getCell(col+'4').alignment=aln('center');
    ws.getCell(col+'5').value=stats[i][1]; ws.getCell(col+'5').font=fnt(16,true,DK2); ws.getCell(col+'5').fill=fill(GL); ws.getCell(col+'5').alignment=aln('center');
  });
  ws.getRow(4).height=15; ws.getRow(5).height=24; ws.getRow(6).height=6;
}

function xlCols(ws,headers,row,x){
  const {DK2,W,G,fnt,aln,fill}=x;
  headers.forEach((h,i)=>{
    const col=String.fromCharCode(66+i);
    ws.getCell(col+row).value=h; ws.getCell(col+row).font=fnt(10,true,W);
    ws.getCell(col+row).fill=fill(DK2); ws.getCell(col+row).alignment=aln('center');
    ws.getCell(col+row).border={bottom:{style:'medium',color:{argb:G}}};
  });
  ws.getRow(row).height=21;
}

function xlFoot(ws,row,ncols,x){
  const {DK,fnt,aln,fill}=x;
  const end=String.fromCharCode(65+ncols);
  ws.mergeCells('B'+row+':'+end+row);
  ws.getCell('B'+row).value='RestaurantManager  ·  Generat: '+new Date().toLocaleDateString('ro-RO',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  ws.getCell('B'+row).font=fnt(9,false,'FF888878',true); ws.getCell('B'+row).fill=fill(DK); ws.getCell('B'+row).alignment=aln('center'); ws.getRow(row).height=16;
}

function showDownloadModal(url, filename, isDataUrl){
  // Remove existing modal if any
  const existing = document.getElementById('dl-modal-ov');
  if(existing) document.body.removeChild(existing);

  const ov = document.createElement('div');
  ov.id = 'dl-modal-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;z-index:9999;padding:0';

  const box = document.createElement('div');
  box.style.cssText = 'background:var(--bg3);border:1.5px solid var(--border2);border-radius:22px 22px 0 0;padding:28px 24px 36px;width:100%;max-width:480px;text-align:center;box-shadow:0 -8px 40px rgba(0,0,0,.6);animation:slideUp .25s cubic-bezier(.4,0,.2,1)';

  const icon = document.createElement('div');
  icon.style.cssText = 'font-size:40px;margin-bottom:14px';
  icon.textContent = '📊';

  const title = document.createElement('div');
  title.style.cssText = 'font-family:var(--font-disp);font-size:20px;font-weight:700;color:var(--text);margin-bottom:6px';
  title.textContent = 'Fisier Excel gata!';

  const sub = document.createElement('div');
  sub.style.cssText = 'font-size:13px;color:var(--text3);margin-bottom:8px;line-height:1.55';
  sub.textContent = filename;

  const hint = document.createElement('div');
  hint.style.cssText = 'font-size:11.5px;color:var(--text3);margin-bottom:22px;line-height:1.6;background:var(--bg4);border-radius:10px;padding:10px 14px';
  hint.innerHTML = '📱 Pe iPhone: apasa <b style="color:var(--text2)">Deschide</b>, apoi din coltul stanga-jos<br>alege <b style="color:var(--text2)">Mai multe...</b> → <b style="color:var(--text2)">Salveaza in Fisiere</b>';

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  if(!isDataUrl) link.target = '_blank';
  link.style.cssText = 'display:block;background:linear-gradient(135deg,var(--gold2) 0%,var(--gold) 100%);color:#1a1200;font-weight:700;font-size:15px;padding:15px 24px;border-radius:13px;text-decoration:none;font-family:var(--font-body);letter-spacing:.2px;margin-bottom:10px;box-shadow:0 4px 16px rgba(200,162,74,.3)';
  link.textContent = '⬇  Deschide / Descarca';

  const cls = document.createElement('button');
  cls.textContent = 'Inchide';
  cls.style.cssText = 'background:transparent;color:var(--text3);border:none;padding:10px 20px;border-radius:10px;font-size:14px;cursor:pointer;font-family:var(--font-body);width:100%';
  cls.onclick = () => {
    document.body.removeChild(ov);
    if(!isDataUrl) setTimeout(()=>URL.revokeObjectURL(url), 500);
  };

  box.appendChild(icon); box.appendChild(title); box.appendChild(sub);
  box.appendChild(hint); box.appendChild(link); box.appendChild(cls);
  ov.appendChild(box);
  ov.addEventListener('click', e => { if(e.target===ov) cls.onclick(); });
  document.body.appendChild(ov);
}

function xlSave(wb, filename){
  return wb.xlsx.writeBuffer().then(buf => {
    // Converim la base64 data URL — funcționează garantat pe iOS Safari
    const uint8 = new Uint8Array(buf);
    let binary = '';
    const chunkSize = 8192;
    for(let i = 0; i < uint8.length; i += chunkSize){
      binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    const dataUrl = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64;

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if(isMobile){
      // Pe mobil: arată modal cu link tap-to-download
      showDownloadModal(dataUrl, filename, true);
    } else {
      // Desktop: download direct
      const a = document.createElement('a'); a.href = dataUrl; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  });
}

// ─── CALCUL MATERIE PRIMA ─────────────────────────────────────────────────────
// Rezolva recursiv materia prima dintr-o reteta (suporta sub-retete)
function resolveRec(r, mult, tot, depth){
  if(!r||depth>8) return;
  (r.items||[]).forEach(ri=>{
    const ing=ings.find(i=>i.id===ri.ingId);
    if(ing){
      if(!tot[ing.id]) tot[ing.id]={ingId:ing.id,name:ing.name,unit:ing.unit,cat:ing.cat||'',sup:ing.sup||'',qty:0};
      tot[ing.id].qty+=Number(ri.qty)*mult;
    } else {
      const sub=recs.find(rc=>rc.id===ri.ingId);
      if(sub){
        const subBase=Number(sub.baseQty)||1, subQty=Number(ri.qty);
        const subMult=sub.mode==='compozitie'?subQty*mult:(subQty/subBase)*mult;
        resolveRec(sub,subMult,tot,depth+1);
      }
    }
  });
}

function calcMat(evList){
  const tot={};
  evList.forEach(ev=>{
    (ev.items||[]).forEach(item=>{
      const r=recs.find(x=>x.id===item.recipeId); if(!r) return;
      const qty=Number(item.qty), base=Number(r.baseQty)||1;
      const mult=r.mode==='compozitie'?qty:qty/base;
      resolveRec(r,mult,tot,0);
    });
  });
  return Object.values(tot).map(t=>({...t,qty:Math.round(t.qty*10000)/10000}));
}

// Calculeaza materia prima pentru o singura reteta (baza=1)
function calcRecMat(r){
  const tot={};
  const base=Number(r.baseQty)||1;
  resolveRec(r,1/base,tot,0);
  return Object.values(tot).map(t=>({...t,qty:Math.round(t.qty*10000)/10000}));
}

// ─── RESIZABLE SPLIT ──────────────────────────────────────────────────────────
window._splitDrag = null;
document.addEventListener('mousemove', function(e) {
  var d = window._splitDrag; if (!d) return;
  var cw = d.container.getBoundingClientRect().width;
  var delta = e.clientX - d.startX;
  var newW = Math.max(d.minL, Math.min(cw - d.minR, d.startW + delta));
  var pct = (newW / cw) * 100;
  d.leftEl.style.width = pct + '%';
  d.pct = pct;
  e.preventDefault();
});
document.addEventListener('mouseup', function() {
  var d = window._splitDrag; if (!d) return;
  localStorage.setItem(d.key, d.pct);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  if (d.div && document.body.contains(d.div)) d.div.classList.remove('dragging');
  window._splitDrag = null;
});

var attachSplitDivider = function(splitEl, leftEl, rightEl, key, defPct, minL, minR) {
  if (window.innerWidth < 768) return;
  minL = minL || 160; minR = minR || 160; defPct = defPct || 55;
  var saved = parseFloat(localStorage.getItem(key));
  var pct = isNaN(saved) ? defPct : Math.max(15, Math.min(85, saved));
  leftEl.style.width = pct + '%';
  var existing = splitEl.querySelector(':scope > .split-divider');
  if (existing) existing.remove();
  var div = document.createElement('div'); div.className = 'split-divider';
  splitEl.insertBefore(div, rightEl);
  div.addEventListener('mousedown', function(e) {
    window._splitDrag = {
      container: splitEl, leftEl: leftEl, div: div,
      startX: e.clientX,
      startW: leftEl.getBoundingClientRect().width,
      key: key, pct: pct, minL: minL, minR: minR
    };
    div.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  });
};

// ─── BADGE HEADER ─────────────────────────────────────────────────────────────
function updateHeaderBadges() {
  const today = new Date();
  const upCnt = evs.filter(e => new Date(e.date+'T12:00:00') >= new Date(today.toDateString())).length;
  const eb = document.getElementById('ev-badge');
  if (eb) { if (upCnt > 0) { eb.textContent = upCnt; eb.style.display = 'block'; } else { eb.style.display = 'none'; } }
}
