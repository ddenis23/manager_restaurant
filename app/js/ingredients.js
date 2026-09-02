// ─── SECTIUNEA INGREDIENTE ────────────────────────────────────────────────────
function renderIngs() {
  const sec = document.getElementById('sec-ingrediente'); sec.innerHTML = '';
  let search = '', filterCat = 'all';

  const render = () => {
    sec.innerHTML = '';

    // ── Page header ──────────────────────────────────────────────────────
    const ph=document.createElement('div'); ph.className='page-header'; sec.appendChild(ph);
    const phL=document.createElement('div');
    const ti=document.createElement('div'); ti.className='stitle'; ti.innerHTML='Ingrediente'; phL.appendChild(ti);
    const sub=document.createElement('div'); sub.className='ssub'; sub.textContent=ings.length+' ingrediente · editează stocul direct'; phL.appendChild(sub);
    ph.appendChild(phL);
    const phR=document.createElement('div');
    phR.appendChild(btn('+ Adaugă', ()=>showIngForm(null), 'pri'));
    ph.appendChild(phR);

    // ── Split container ───────────────────────────────────────────────────
    const split=document.createElement('div'); split.className='sec-split'; sec.appendChild(split);

    // ── LEFT: search + category filter ───────────────────────────────────
    const left=document.createElement('div'); left.className='sec-left';

    const si = inp('text','','Caută ingredient...');
    si.value = search; si.oninput = e => { search=e.target.value; render(); };
    left.appendChild(si);

    const catLbl=document.createElement('div');
    catLbl.style.cssText='font-size:9.5px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:2px';
    catLbl.textContent='Categorii'; left.appendChild(catLbl);

    const cats=['all',...new Set(ings.map(i=>i.cat).filter(Boolean))];
    const catList=document.createElement('div'); catList.style.cssText='display:flex;flex-direction:column;gap:3px';
    cats.forEach(c=>{
      const isA=filterCat===c;
      const cnt=c==='all'?ings.length:ings.filter(i=>i.cat===c).length;
      const b=document.createElement('button');
      b.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:var(--r-sm);font-size:12px;font-weight:'+(isA?'600':'400')+';cursor:pointer;font-family:var(--font-body);text-align:left;background:'+(isA?'var(--gold-dim)':'transparent')+';color:'+(isA?'var(--gold3)':'var(--text2)')+';border:1px solid '+(isA?'var(--gold-line)':'transparent')+';width:100%';
      const ns=document.createElement('span'); ns.textContent=c==='all'?'Toate':c; b.appendChild(ns);
      const cs=document.createElement('span'); cs.style.cssText='font-size:10px;opacity:.55;font-weight:400'; cs.textContent=cnt; b.appendChild(cs);
      b.onclick=()=>{ filterCat=c; render(); };
      catList.appendChild(b);
    });
    left.appendChild(catList);
    split.appendChild(left);

    // ── RIGHT: ingredient cards ───────────────────────────────────────────
    const right=document.createElement('div'); right.className='sec-right';

    const filtered = ings.filter(i =>
      (filterCat==='all'||i.cat===filterCat) &&
      (i.name.toLowerCase().includes(search.toLowerCase())||(i.sup||'').toLowerCase().includes(search.toLowerCase()))
    );
    if(!filtered.length){
      const e=document.createElement('div'); e.className='empty'; e.textContent='Niciun ingredient gasit.'; right.appendChild(e);
    } else {
      filtered.forEach(ing => {
        const card = document.createElement('div'); card.className='card';
        card.style.cssText = 'padding:13px 14px;margin-bottom:8px';

        // ── Rândul principal: nume + butoane ─────────────────────────────
        const topR = document.createElement('div');
        topR.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px';

        const nameWrap = document.createElement('div'); nameWrap.style.flex='1';
        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-weight:500;font-size:14px;color:var(--text);margin-bottom:5px;line-height:1.3;letter-spacing:.01em';
        nameEl.textContent = ing.name;
        nameWrap.appendChild(nameEl);

        const badgeRow = document.createElement('div'); badgeRow.style.cssText='display:flex;gap:5px;flex-wrap:wrap';
        const ub = badge(ing.unit,'var(--blue-dim)','var(--blue2)');
        badgeRow.appendChild(ub);
        if(ing.cat){ const cb=badge(ing.cat,'var(--bg4)','var(--text2)'); cb.style.fontSize='11px'; badgeRow.appendChild(cb); }
        if(ing.sup){ const sb=badge('🏪 '+ing.sup,'var(--bg4)','var(--text3)'); sb.style.fontSize='10.5px'; badgeRow.appendChild(sb); }
        nameWrap.appendChild(badgeRow);

        const actBtns = document.createElement('div'); actBtns.style.cssText='display:flex;gap:4px;flex-shrink:0';
        const editB = btn('✏️',()=>showIngForm(ing),'sm-sec');
        editB.style.cssText += ';padding:6px 10px;font-size:14px';
        const delB = btn('🗑',()=>{ if(confirm('Stergi '+ing.name+'?')){ings=ings.filter(i=>i.id!==ing.id);LS.set('rm_ings',ings);render();updateHeaderBadges();}}, 'sm-dan');
        delB.style.cssText += ';padding:6px 10px;font-size:14px';
        actBtns.appendChild(editB); actBtns.appendChild(delB);

        topR.appendChild(nameWrap); topR.appendChild(actBtns);
        card.appendChild(topR);

        // ── Rândul stoc ──────────────────────────────────────────────────
        const stockRow = document.createElement('div');
        stockRow.style.cssText = 'display:flex;align-items:center;gap:10px;background:var(--bg3);border-radius:var(--r-sm);padding:8px 12px;border:1px solid var(--border);margin-top:1px';

        const stockLabel = document.createElement('span');
        stockLabel.style.cssText = 'font-size:9.5px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap';
        stockLabel.textContent = 'Stoc actual';

        const stockInp = inp('number', stock[ing.id]||0, '0');
        stockInp.style.cssText = 'background:transparent;border:none;font-size:18px;font-weight:400;color:var(--text);padding:0;text-align:right;width:80px;flex:1;box-shadow:none;font-family:var(--font-disp)';
        stockInp.min='0'; stockInp.step='0.01';
        stockInp.onchange = e => { stock[ing.id]=Number(e.target.value)||0; LS.set('rm_stock',stock); };

        const stockUnit = document.createElement('span');
        stockUnit.style.cssText = 'font-size:11px;font-weight:600;color:var(--gold2);min-width:28px;letter-spacing:.06em;text-transform:uppercase';
        stockUnit.textContent = ing.unit;

        stockRow.appendChild(stockLabel); stockRow.appendChild(stockInp); stockRow.appendChild(stockUnit);
        card.appendChild(stockRow);

        right.appendChild(card);
      });
    }

    split.appendChild(right);
    attachSplitDivider(split, left, right, 'km-ing-split', 26, 180, 220);
  };

  const showIngForm = (ing) => {
    const form=document.createElement('div'); form.style.cssText='display:grid;gap:14px';
    const ni=inp('text',ing?.name||'','ex: Smantana, Carne vita...');
    const ui=sel(ALL_UNITS.map(u=>[u,u]), ing?.unit||'kg');
    const ci=inp('text',ing?.cat||'','ex: Carne, Lactate...');
    const si2=inp('text',ing?.sup||'','ex: Metro, Selgros...');
    const cats2=[...new Set(ings.map(i=>i.cat).filter(Boolean))];
    const dl=document.createElement('datalist'); dl.id='ing-cats-dl';
    cats2.forEach(c=>{const o=document.createElement('option');o.value=c;dl.appendChild(o);}); ci.setAttribute('list','ing-cats-dl');
    form.appendChild(fld('Nume *',ni));
    const g=document.createElement('div'); g.className='g2';
    g.appendChild(fld('Unitate *',ui)); g.appendChild(fld('Categorie',ci)); form.appendChild(g);
    form.appendChild(fld('Furnizor',si2)); form.appendChild(dl);
    const modal=openModal(ing?'Editeaza ingredient':'Ingredient nou',form,[
      btn('Anuleaza',()=>modal.close(),'sec'),
      btn('Salveaza',()=>{
        if(!ni.value.trim())return alert('Introdu numele.');
        if(ing){ings=ings.map(i=>i.id===ing.id?{...i,name:ni.value.trim(),unit:ui.value,cat:ci.value,sup:si2.value}:i);}
        else{ings=[...ings,{id:Date.now(),name:ni.value.trim(),unit:ui.value,cat:ci.value,sup:si2.value}];}
        LS.set('rm_ings',ings); modal.close(); render(); updateHeaderBadges();
      },'pri')
    ]);
  };

  render();
}
