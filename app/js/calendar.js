// ─── EXCEL: FISA CONSUM EVENIMENT ─────────────────────────────────────────────
async function exportEvExcel(ev){
  const wb=mkWb();
  const x=xlX();
  const {G,DK,DK2,W,GR,GM,fill,fnt,aln,brd}=x;
  const mat=calcMat([ev]);
  const dtLong=new Date(ev.date+'T12:00:00').toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  // Sheet 1: Fisa Consum (materie prima)
  const ws1=wb.addWorksheet('Fisa Consum',{views:[{showGridLines:false}]});
  ws1.columns=[{width:3},{width:36},{width:18},{width:14},{width:14},{width:3}];
  xlHdr(ws1,'FISA DE CONSUM — '+ev.name.toUpperCase(),dtLong+(ev.loc?'   ·   '+ev.loc:''),x);
  xlStats(ws1,[['Invitati',ev.guests||'—'],['Preparate',(ev.items||[]).length],['Ingrediente',mat.length]],x);
  xlCols(ws1,['INGREDIENT / MATERIE PRIMA','CANTITATE NECESARA','U.M.','CATEGORIE'],7,x);
  const sorted=[...mat].sort((a,b)=>(a.cat||'').localeCompare(b.cat||'')||a.name.localeCompare(b.name));
  let row=8,prevCat=null;
  sorted.forEach((item,idx)=>{
    if(item.cat!==prevCat){
      if(prevCat!==null)row++;
      ws1.mergeCells('B'+row+':E'+row); ws1.getCell('B'+row).value='   '+(item.cat||'Diverse').toUpperCase();
      ws1.getCell('B'+row).font=fnt(9,true,'FF9E7C2E'); ws1.getCell('B'+row).fill=fill(GM); ws1.getRow(row).height=13;
      prevCat=item.cat; row++;
    }
    const odd=idx%2===0;
    ['B','C','D','E'].forEach(col=>{ws1.getCell(col+row).fill=fill(odd?GR:W); ws1.getCell(col+row).border=brd();});
    ws1.getCell('B'+row).value=item.name; ws1.getCell('B'+row).font=fnt(10,false,DK2); ws1.getCell('B'+row).alignment=aln('left');
    ws1.getCell('C'+row).value=item.qty; ws1.getCell('C'+row).font=fnt(11,true,'FF2C1A0A'); ws1.getCell('C'+row).alignment=aln('center'); ws1.getCell('C'+row).numFmt='0.000';
    ws1.getCell('D'+row).value=item.unit; ws1.getCell('D'+row).font=fnt(10,false,'FF666050'); ws1.getCell('D'+row).alignment=aln('center');
    ws1.getCell('E'+row).value=item.cat||'—'; ws1.getCell('E'+row).font=fnt(9,false,'FF888878'); ws1.getCell('E'+row).alignment=aln('center');
    ws1.getRow(row).height=18; row++;
  });
  row++; xlFoot(ws1,row,5,x);

  // Sheet 2: Retete comandate
  const ws2=wb.addWorksheet('Retete Comandate',{views:[{showGridLines:false}]});
  ws2.columns=[{width:3},{width:32},{width:16},{width:14},{width:20},{width:3}];
  xlHdr(ws2,'RETETE COMANDATE — '+ev.name.toUpperCase(),dtLong,x);
  xlStats(ws2,[['Invitati',ev.guests||'—'],['Nr. preparate',(ev.items||[]).length]],x);
  xlCols(ws2,['PREPARAT / RETETA','CANTITATE','U.M.','MOD DE CALCUL'],7,x);
  (ev.items||[]).forEach((item,idx)=>{
    const r=recs.find(rc=>rc.id===item.recipeId); if(!r) return;
    const rn=8+idx, odd=idx%2===0;
    ['B','C','D','E'].forEach(col=>{ws2.getCell(col+rn).fill=fill(odd?GR:W); ws2.getCell(col+rn).border=brd();});
    ws2.getCell('B'+rn).value=(r.type==='bought'?'[C] ':'[R] ')+r.name; ws2.getCell('B'+rn).font=fnt(10,false,DK2); ws2.getCell('B'+rn).alignment=aln('left');
    ws2.getCell('C'+rn).value=Number(item.qty); ws2.getCell('C'+rn).font=fnt(11,true,DK2); ws2.getCell('C'+rn).alignment=aln('center');
    ws2.getCell('D'+rn).value=r.baseUnit; ws2.getCell('D'+rn).font=fnt(10,false,'FF666050'); ws2.getCell('D'+rn).alignment=aln('center');
    ws2.getCell('E'+rn).value=MODES.find(m=>m.v===r.mode)?.l||r.mode; ws2.getCell('E'+rn).font=fnt(9,false,'FF888878'); ws2.getCell('E'+rn).alignment=aln('center');
    ws2.getRow(rn).height=18;
  });
  xlFoot(ws2,8+(ev.items||[]).length+1,5,x);

  const fname='Fisa-Consum-'+ev.name.replace(/[^a-zA-Z0-9]/g,'-').replace(/-+/g,'-')+'-'+ev.date+'.xlsx';
  await xlSave(wb,fname);
}

// ─── EXCEL: O SINGURA RETETA ──────────────────────────────────────────────────
async function exportOneRecExcel(r){
  const wb=mkWb();
  const x=xlX();
  const {DK2,W,GR,GM,fill,fnt,aln,brd}=x;
  const mat=calcRecMat(r);

  const wsName=r.name.substring(0,28).replace(/[*?:/\\[\]]/g,'');
  const ws=wb.addWorksheet(wsName,{views:[{showGridLines:false}]});
  ws.columns=[{width:3},{width:36},{width:18},{width:14},{width:14},{width:3}];
  xlHdr(ws,'RETETA: '+r.name.toUpperCase(),
    'Baza: '+r.baseQty+' '+r.baseUnit+'   ·   '+r.cat+'   ·   '+(MODES.find(m=>m.v===r.mode)?.l||r.mode),x);

  // Sectiunea 1: Lista ingrediente directe
  const ws2=wb.addWorksheet('Materie Prima - '+wsName.substring(0,15),{views:[{showGridLines:false}]});
  ws2.columns=[{width:3},{width:36},{width:18},{width:14},{width:14},{width:3}];
  xlHdr(ws2,'MATERIE PRIMA TOTALA — '+r.name.toUpperCase(),
    'Calculat recursiv (inclusiv sub-retete) per '+r.baseQty+' '+r.baseUnit,x);
  xlStats(ws2,[['Ingrediente totale',mat.length],['Cantitate baza',r.baseQty+' '+r.baseUnit]],x);
  xlCols(ws2,['INGREDIENT / MATERIE PRIMA','CANTITATE','U.M.','CATEGORIE'],7,x);
  const sorted=[...mat].sort((a,b)=>(a.cat||'').localeCompare(b.cat||'')||a.name.localeCompare(b.name));
  let row=8,prevCat=null;
  sorted.forEach((item,idx)=>{
    if(item.cat!==prevCat){
      if(prevCat!==null)row++;
      ws2.mergeCells('B'+row+':E'+row); ws2.getCell('B'+row).value='   '+(item.cat||'Diverse').toUpperCase();
      ws2.getCell('B'+row).font=fnt(9,true,'FF9E7C2E'); ws2.getCell('B'+row).fill=fill(GM); ws2.getRow(row).height=13;
      prevCat=item.cat; row++;
    }
    const odd=idx%2===0;
    ['B','C','D','E'].forEach(col=>{ws2.getCell(col+row).fill=fill(odd?GR:W); ws2.getCell(col+row).border=brd();});
    ws2.getCell('B'+row).value=item.name; ws2.getCell('B'+row).font=fnt(10,false,DK2); ws2.getCell('B'+row).alignment=aln('left');
    ws2.getCell('C'+row).value=item.qty; ws2.getCell('C'+row).font=fnt(11,true,'FF2C1A0A'); ws2.getCell('C'+row).alignment=aln('center'); ws2.getCell('C'+row).numFmt='0.000';
    ws2.getCell('D'+row).value=item.unit; ws2.getCell('D'+row).font=fnt(10,false,'FF666050'); ws2.getCell('D'+row).alignment=aln('center');
    ws2.getCell('E'+row).value=item.cat||'—'; ws2.getCell('E'+row).font=fnt(9,false,'FF888878'); ws2.getCell('E'+row).alignment=aln('center');
    ws2.getRow(row).height=18; row++;
  });
  row++; xlFoot(ws2,row,5,x);

  // Sheet 1: Ingrediente directe (nivelul 1 al retetei)
  xlStats(ws,[['Componente directe',(r.items||[]).length],['Materie prima totala',mat.length]],x);
  xlCols(ws,['COMPONENT (ingredient sau sub-reteta)','CANTITATE','U.M.','TIP'],7,x);
  (r.items||[]).forEach((item,idx)=>{
    const ing=ings.find(i=>i.id===item.ingId);
    const subR=!ing?recs.find(rc=>rc.id===item.ingId):null;
    const nm=ing?ing.name:(subR?'[Reteta] '+subR.name:'?');
    const un=ing?ing.unit:(subR?subR.baseUnit:'—');
    const tip=ing?'Ingredient':'Sub-reteta';
    const rn=8+idx, odd=idx%2===0;
    ['B','C','D','E'].forEach(col=>{ws.getCell(col+rn).fill=fill(odd?GR:W); ws.getCell(col+rn).border=brd();});
    ws.getCell('B'+rn).value=nm; ws.getCell('B'+rn).font=fnt(10,false,DK2); ws.getCell('B'+rn).alignment=aln('left');
    ws.getCell('C'+rn).value=Number(item.qty); ws.getCell('C'+rn).font=fnt(11,true,'FF2C1A0A'); ws.getCell('C'+rn).alignment=aln('center'); ws.getCell('C'+rn).numFmt='0.000';
    ws.getCell('D'+rn).value=un; ws.getCell('D'+rn).font=fnt(10,false,'FF666050'); ws.getCell('D'+rn).alignment=aln('center');
    ws.getCell('E'+rn).value=tip; ws.getCell('E'+rn).font=fnt(9,false,ing?'FF4caf80':'FFd4a853'); ws.getCell('E'+rn).alignment=aln('center');
    ws.getRow(rn).height=18;
  });
  xlFoot(ws,8+(r.items||[]).length+1,5,x);

  const fname='Reteta-'+r.name.replace(/[^a-zA-Z0-9]/g,'-').replace(/-+/g,'-')+'.xlsx';
  await xlSave(wb,fname);
}

// ─── EXCEL: TOATE RETETELE ────────────────────────────────────────────────────
async function exportAllRecsExcel(){
  const wb=mkWb();
  const x=xlX();
  const {DK2,W,GR,GM,fill,fnt,aln,brd}=x;

  // Sheet 1: Catalog
  const ws1=wb.addWorksheet('Catalog Retete',{views:[{showGridLines:false}]});
  ws1.columns=[{width:3},{width:32},{width:16},{width:14},{width:18},{width:14},{width:3}];
  xlHdr(ws1,'CATALOG RETETE & PREPARATE','RestaurantManager  ·  '+new Date().toLocaleDateString('ro-RO',{day:'2-digit',month:'long',year:'numeric'}),x);
  xlStats(ws1,[['Retete',recs.filter(r=>r.type==='recipe').length],['Cumparate',recs.filter(r=>r.type==='bought').length],['Total',recs.length]],x);
  xlCols(ws1,['PREPARAT','TIP','BAZA','MOD CALCUL','CATEGORIE'],7,x);
  const sorted=[...recs].sort((a,b)=>(a.cat||'').localeCompare(b.cat||'')||a.name.localeCompare(b.name));
  let row=8,prevCat=null;
  sorted.forEach((r,idx)=>{
    if(r.cat!==prevCat){
      if(prevCat!==null)row++;
      ws1.mergeCells('B'+row+':F'+row); ws1.getCell('B'+row).value='   '+(r.cat||'Fara categorie').toUpperCase();
      ws1.getCell('B'+row).font=fnt(9,true,'FF9E7C2E'); ws1.getCell('B'+row).fill=fill(GM); ws1.getRow(row).height=13;
      prevCat=r.cat; row++;
    }
    const odd=idx%2===0;
    ['B','C','D','E','F'].forEach(col=>{ws1.getCell(col+row).fill=fill(odd?GR:W); ws1.getCell(col+row).border=brd();});
    ws1.getCell('B'+row).value=r.name; ws1.getCell('B'+row).font=fnt(10,false,DK2); ws1.getCell('B'+row).alignment=aln('left');
    ws1.getCell('C'+row).value=r.type==='bought'?'Cumparat':'Cu reteta'; ws1.getCell('C'+row).font=fnt(9,false,r.type==='bought'?'FF5b9bd5':'FF4caf80'); ws1.getCell('C'+row).alignment=aln('center');
    ws1.getCell('D'+row).value=r.baseQty+' '+r.baseUnit; ws1.getCell('D'+row).font=fnt(10,false,'FF666050'); ws1.getCell('D'+row).alignment=aln('center');
    ws1.getCell('E'+row).value=MODES.find(m=>m.v===r.mode)?.l||r.mode; ws1.getCell('E'+row).font=fnt(9,false,'FF888878'); ws1.getCell('E'+row).alignment=aln('center');
    ws1.getCell('F'+row).value=r.cat||'—'; ws1.getCell('F'+row).font=fnt(9,false,'FF888878'); ws1.getCell('F'+row).alignment=aln('center');
    ws1.getRow(row).height=18; row++;
  });
  row++; xlFoot(ws1,row,6,x);

  // Un sheet per reteta cu materie prima calculata
  recs.filter(r=>r.type==='recipe'&&r.items?.length).forEach(r=>{
    const mat=calcRecMat(r);
    const wsName=r.name.substring(0,28).replace(/[*?:/\\[\]]/g,'');
    const ws=wb.addWorksheet(wsName,{views:[{showGridLines:false}]});
    ws.columns=[{width:3},{width:34},{width:18},{width:14},{width:14},{width:3}];
    xlHdr(ws,'RETETA: '+r.name.toUpperCase(),'Baza: '+r.baseQty+' '+r.baseUnit+'   ·   '+(MODES.find(m=>m.v===r.mode)?.l||r.mode),x);
    xlStats(ws,[['Materie prima',mat.length],['Baza',r.baseQty+' '+r.baseUnit]],x);
    xlCols(ws,['INGREDIENT / MATERIE PRIMA','CANTITATE','U.M.','CATEGORIE'],7,x);
    const smat=[...mat].sort((a,b)=>(a.cat||'').localeCompare(b.cat||'')||a.name.localeCompare(b.name));
    let rw=8,pc=null;
    smat.forEach((item,idx)=>{
      if(item.cat!==pc){
        if(pc!==null)rw++;
        ws.mergeCells('B'+rw+':E'+rw); ws.getCell('B'+rw).value='   '+(item.cat||'Diverse').toUpperCase();
        ws.getCell('B'+rw).font=fnt(9,true,'FF9E7C2E'); ws.getCell('B'+rw).fill=fill(GM); ws.getRow(rw).height=13;
        pc=item.cat; rw++;
      }
      const odd=idx%2===0;
      ['B','C','D','E'].forEach(col=>{ws.getCell(col+rw).fill=fill(odd?GR:W); ws.getCell(col+rw).border=brd();});
      ws.getCell('B'+rw).value=item.name; ws.getCell('B'+rw).font=fnt(10,false,DK2); ws.getCell('B'+rw).alignment=aln('left');
      ws.getCell('C'+rw).value=item.qty; ws.getCell('C'+rw).font=fnt(11,true,'FF2C1A0A'); ws.getCell('C'+rw).alignment=aln('center'); ws.getCell('C'+rw).numFmt='0.000';
      ws.getCell('D'+rw).value=item.unit; ws.getCell('D'+rw).font=fnt(10,false,'FF666050'); ws.getCell('D'+rw).alignment=aln('center');
      ws.getCell('E'+rw).value=item.cat||'—'; ws.getCell('E'+rw).font=fnt(9,false,'FF888878'); ws.getCell('E'+rw).alignment=aln('center');
      ws.getRow(rw).height=18; rw++;
    });
    rw++; xlFoot(ws,rw,5,x);
  });

  await xlSave(wb,'Retete-RestaurantManager-'+new Date().toISOString().split('T')[0]+'.xlsx');
}

// ─── SECTIUNEA CALENDAR ───────────────────────────────────────────────────────
function renderCal() {
  const sec=document.getElementById('sec-calendar'); sec.innerHTML='';

  const render=()=>{
    sec.innerHTML='';

    // ── Page header — flex-shrink:0, outside split ───────────────────────────
    const ph=document.createElement('div'); ph.className='page-header'; ph.style.flexShrink='0'; sec.appendChild(ph);
    const phL=document.createElement('div');
    const ti=document.createElement('div'); ti.className='stitle'; ti.textContent='Calendar'; phL.appendChild(ti);
    const today=new Date();
    const sub=document.createElement('div'); sub.className='ssub';
    sub.textContent=evs.length+' evenimente · '+today.toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long'}); phL.appendChild(sub);
    ph.appendChild(phL);
    const phR=document.createElement('div');
    const addEvBtn=btn('+ Eveniment',()=>showEvForm(null),'pri');
    addEvBtn.classList.add('add-ev-btn');
    phR.appendChild(addEvBtn);
    ph.appendChild(phR);

    // ── Split wrapper: left=calendar, right=events ───────────────────────────
    const split=document.createElement('div'); split.className='cal-split'; sec.appendChild(split);

    // ── LEFT: Calendar card ──────────────────────────────────────────────────
    const calLeft=document.createElement('div'); calLeft.className='cal-left'; split.appendChild(calLeft);

    const calCard=document.createElement('div'); calCard.className='card cal-card'; calCard.style.cssText='width:100%;box-sizing:border-box';
    calLeft.appendChild(calCard);

    // Month navigation
    const navRow=document.createElement('div'); navRow.className='row'; navRow.style.cssText='margin-bottom:14px;flex-shrink:0';

    const prevBtn=document.createElement('button'); prevBtn.className='cal-nav-btn';
    prevBtn.innerHTML='&#8592; prev';
    prevBtn.onclick=()=>{calView.m===0?Object.assign(calView,{m:11,y:calView.y-1}):calView.m--;render();};
    navRow.appendChild(prevBtn);

    const mi=document.createElement('span');
    mi.style.cssText='font-family:var(--font-disp);font-size:19px;font-weight:400;color:var(--text);letter-spacing:.01em';
    mi.textContent=MONTHS[calView.m]+' '+calView.y; navRow.appendChild(mi);

    const nextBtn=document.createElement('button'); nextBtn.className='cal-nav-btn next';
    nextBtn.innerHTML='next &#8594;';
    nextBtn.onclick=()=>{calView.m===11?Object.assign(calView,{m:0,y:calView.y+1}):calView.m++;render();};
    navRow.appendChild(nextBtn);
    calCard.appendChild(navRow);

    // Weekday headers
    const wGrid=document.createElement('div'); wGrid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:8px;flex-shrink:0';
    WDAYS.forEach(d=>{
      const s=document.createElement('div');
      s.style.cssText='text-align:center;font-size:10px;color:var(--text3);font-weight:600;letter-spacing:.06em;padding:4px 0;text-transform:uppercase';
      s.textContent=d; wGrid.appendChild(s);
    });
    calCard.appendChild(wGrid);

    // Day grid
    const evByD={};evs.forEach(e=>{if(!evByD[e.date])evByD[e.date]=[];evByD[e.date].push(e);});
    const off=(new Date(calView.y,calView.m,1).getDay()+6)%7;
    const dim=new Date(calView.y,calView.m+1,0).getDate();

    const dGrid=document.createElement('div'); dGrid.className='dGrid-el'; dGrid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:6px;flex:1;grid-auto-rows:1fr';
    for(let i=0;i<off;i++){const d=document.createElement('div');dGrid.appendChild(d);}

    for(let day=1;day<=dim;day++){
      const ds=calView.y+'-'+String(calView.m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      const dayEvs=evByD[ds]||[];
      const isT=today.getDate()===day&&today.getMonth()===calView.m&&today.getFullYear()===calView.y;
      const isS=calSel===ds;

      const b=document.createElement('button');
      b.className='cal-day'+(isT?' is-today':'')+(isS?' is-selected':'')+(dayEvs.length?' has-events':'');
      b.onclick=()=>{calSel=isS?null:ds;render();};

      const dn=document.createElement('span'); dn.style.cssText='font-size:1em;line-height:1;position:relative;z-index:1'; dn.textContent=day; b.appendChild(dn);

      if(dayEvs.length){
        // Calculeaza urgenta: cel mai apropiat eveniment din zi
        const minDays = Math.min(...dayEvs.map(e=>daysUntil(e.date)));
        let urgClass = 'far';
        if (minDays <= 1)       urgClass = 'urgent';   // azi / maine: rosu
        else if (minDays <= 7)  urgClass = 'soon';     // saptamana asta: ambra
        else if (minDays <= 21) urgClass = 'normal';   // 3 saptamani: auriu
        // else: far = verde (departe)

        // Bara de urgenta jos
        const bar=document.createElement('div');
        bar.className='cal-ev-bar '+urgClass;
        b.appendChild(bar);

        // Contor discret in colt dreapta-sus (doar daca >1 eveniment)
        if(dayEvs.length>1){
          const cnt=document.createElement('span');
          cnt.className='cal-ev-count';
          cnt.textContent=dayEvs.length;
          b.appendChild(cnt);
        }
      }
      dGrid.appendChild(b);
    }
    calCard.appendChild(dGrid);

    // ── RIGHT: Events panel ──────────────────────────────────────────────────
    const calRight=document.createElement('div'); calRight.className='cal-right'; split.appendChild(calRight);

    const rightTitle=document.createElement('div'); rightTitle.className='cal-right-title';

    if(calSel){
      // Show events for selected day
      rightTitle.textContent=fmtDateLong(calSel);
      // Add clear + add buttons
      const rActs=document.createElement('div'); rActs.style.cssText='display:flex;gap:5px;margin-left:auto';
      const clrBtn=btn('✕',()=>{calSel=null;render();},'ghost');
      clrBtn.style.cssText+='padding:2px 6px;font-size:12px';
      rActs.appendChild(clrBtn); rightTitle.appendChild(rActs);
      calRight.appendChild(rightTitle);

      const selEvs=evByD[calSel]||[];
      if(!selEvs.length){
        const em=document.createElement('div'); em.className='empty';
        em.style.cssText='padding:32px 0;font-size:13px;color:var(--text3);text-align:center';
        em.textContent='Nicio programare';
        const ab=document.createElement('button'); ab.textContent='+ Adaugă eveniment';
        ab.style.cssText='display:block;margin:10px auto 0;color:var(--gold2);background:transparent;font-size:13px;text-decoration:underline;cursor:pointer;font-family:var(--font-body)';
        ab.onclick=()=>showEvForm(null); em.appendChild(ab); calRight.appendChild(em);
      } else {
        selEvs.forEach((ev,i)=>{
          const card=buildEvCard(ev);
          card.style.animationDelay=(i*0.05)+'s';
          calRight.appendChild(card);
        });
      }
    } else {
      // Show upcoming events
      const upcoming=evs.filter(e=>new Date(e.date+'T12:00:00')>=new Date(today.toDateString()))
                        .sort((a,b)=>new Date(a.date)-new Date(b.date));
      rightTitle.textContent='Evenimente viitoare';
      const cnt=document.createElement('span');
      cnt.style.cssText='margin-left:auto;background:var(--gold-dim);color:var(--gold3);border:1px solid var(--gold-line);border-radius:4px;padding:1px 7px;font-size:10px;font-weight:600;letter-spacing:.04em';
      cnt.textContent=upcoming.length; rightTitle.appendChild(cnt);
      calRight.appendChild(rightTitle);

      if(!upcoming.length){
        const e=document.createElement('div'); e.className='empty';
        e.style.cssText='padding:40px 0;font-size:13px;color:var(--text3);text-align:center';
        e.textContent='Niciun eveniment planificat';
        calRight.appendChild(e);
      } else {
        upcoming.slice(0,15).forEach((ev,i)=>{
          const card=buildEvCard(ev);
          card.style.animationDelay=(i*0.04)+'s';
          calRight.appendChild(card);
        });
      }
    }

    attachSplitDivider(split, calLeft, calRight, 'km-cal-split', 62, 280, 200);
  };

  const buildEvCard=(ev)=>{
    const card=document.createElement('div'); card.className='card ev-card'; card.style.marginBottom='8px';
    const row=document.createElement('div'); row.className='row';
    const left=document.createElement('div'); left.style.flex='1';
    const nm=document.createElement('div'); nm.style.cssText="font-family:var(--font-disp);font-size:17px;font-weight:400;margin-bottom:6px;letter-spacing:.01em"; nm.textContent=ev.name;
    const brow=document.createElement('div'); brow.style.cssText='display:flex;gap:5px;flex-wrap:wrap';
    brow.appendChild(badge(fmtDate(ev.date),'var(--gold)18','var(--gold)'));
    const du=daysUntil(ev.date);
    if(du>=0&&du<=14)brow.appendChild(badge(du===0?'AZI!':du+' zile','var(--red)22','var(--red)'));
    if(ev.loc)brow.appendChild(badge(ev.loc,'var(--bg3)','#999'));
    if(ev.guests>0)brow.appendChild(badge(ev.guests+' inv.','var(--bg3)','#999'));
    if(ev.items?.length)brow.appendChild(badge(ev.items.length+' prep.','var(--bg3)','#999'));
    if(ev.notes){const n=document.createElement('div');n.style.cssText='font-size:12px;color:var(--text3);margin-top:5px';n.textContent=ev.notes;left.appendChild(n);}
    left.appendChild(nm); left.appendChild(brow);
    const acts=document.createElement('div'); acts.style.cssText='display:flex;gap:5px;flex-wrap:wrap';
    if(ev.items?.length){
      const xb=btn('📊 Excel',async()=>{
        xb.disabled=true; xb.textContent='⏳...';
        try{await exportEvExcel(ev);}catch(e){alert('Eroare: '+e.message);}
        xb.disabled=false; xb.textContent='📊 Excel';
      },'sm-ok');
      acts.appendChild(xb);
    }
    acts.appendChild(btn('✏️',()=>showEvForm(ev),'sm-sec'));
    acts.appendChild(btn('🗑️',()=>{if(confirm('Stergi evenimentul?')){evs=evs.filter(e=>e.id!==ev.id);LS.set('rm_evs',evs);render();updateHeaderBadges();}},'sm-dan'));
    row.appendChild(left); row.appendChild(acts); card.appendChild(row);
    if(ev.items?.length){
      const tags=document.createElement('div'); tags.style.cssText='margin-top:8px;display:flex;flex-wrap:wrap';
      ev.items.forEach(item=>{const r=recs.find(x=>x.id===item.recipeId);if(!r)return;const t=document.createElement('span');t.className='tag';t.innerHTML=r.name+' <span style="color:var(--gold)">×'+item.qty+' '+r.baseUnit+'</span>';tags.appendChild(t);});
      card.appendChild(tags);
    }
    return card;
  };

  const showEvForm=(ev)=>{
    const form=document.createElement('div'); form.style.cssText='display:grid;gap:12px';
    let items=[...(ev?.items||[])];
    const ni=inp('text',ev?.name||'','ex: Nunta Popescu, Conferinta...');
    form.appendChild(fld('Nume eveniment *',ni));
    const g2=document.createElement('div'); g2.className='g2';
    const di=inp('date',ev?.date||'',''); const gi=inp('number',ev?.guests||'','ex: 150'); gi.min='0';
    g2.appendChild(fld('Data *',di)); g2.appendChild(fld('Nr. invitati',gi)); form.appendChild(g2);
    const li=inp('text',ev?.loc||'','ex: Sala Mare, Hotel...'); form.appendChild(fld('Locatie',li));
    const noi=document.createElement('textarea'); noi.style.cssText='background:var(--bg3);color:var(--text);border:1.5px solid var(--border);border-radius:8px;padding:9px 12px;font-family:var(--font-body);font-size:14px;outline:none;width:100%;resize:vertical';
    noi.rows=2; noi.placeholder='Detalii...'; noi.value=ev?.notes||''; form.appendChild(fld('Note',noi));

    const itemsSection=document.createElement('div');
    const ih=document.createElement('div'); ih.className='row'; ih.style.marginBottom='8px';
    ih.appendChild(lbl('Preparate comandate'));
    ih.appendChild(btn('+ Adauga',()=>{items=[...items,{recipeId:recs[0]?.id,qty:1}];renderItems();},'sm-sec'));
    itemsSection.appendChild(ih);
    const itemsList=document.createElement('div'); itemsList.style.cssText='display:grid;gap:6px'; itemsSection.appendChild(itemsList);
    const renderItems=()=>{
      itemsList.innerHTML='';
      items.forEach((item,idx)=>{
        const row=document.createElement('div'); row.style.cssText='display:grid;grid-template-columns:1fr 80px 28px;gap:5px;align-items:center';
        const rs=sel(recs.map(r=>[r.id,(r.type==='bought'?'[c] ':'[r] ')+r.name]),item.recipeId);
        rs.onchange=e=>items[idx].recipeId=Number(e.target.value);
        const qi=inp('number',item.qty,'Cant.'); qi.min='0.01'; qi.step='0.01';
        qi.oninput=e=>items[idx].qty=Number(e.target.value);
        const rec=recs.find(r=>r.id===item.recipeId);
        if(rec){const us=document.createElement('span');us.style.cssText='font-size:10px;color:var(--text3);position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none';us.textContent=rec.baseUnit;const qw=document.createElement('div');qw.style.position='relative';qw.appendChild(qi);qw.appendChild(us);row.appendChild(rs);row.appendChild(qw);}
        else{row.appendChild(rs);row.appendChild(qi);}
        const xb=document.createElement('button');xb.textContent='×';xb.style.cssText='background:transparent;color:var(--red);font-size:18px;line-height:1;cursor:pointer';
        xb.onclick=()=>{items.splice(idx,1);renderItems();}; row.appendChild(xb); itemsList.appendChild(row);
      });
    };
    renderItems(); form.appendChild(itemsSection);
    const modal=openModal(ev?'Editeaza evenimentul':'Eveniment nou',form,[
      btn('Anuleaza',()=>modal.close(),'sec'),
      btn('Salveaza evenimentul',()=>{
        if(!ni.value.trim()||!di.value)return alert('Completeaza numele si data.');
        const newEv={id:ev?.id||Date.now(),name:ni.value.trim(),date:di.value,loc:li.value,guests:Number(gi.value)||0,notes:noi.value,items};
        if(ev)evs=evs.map(e=>e.id===ev.id?newEv:e); else evs=[...evs,newEv];
        LS.set('rm_evs',evs); modal.close(); render(); updateHeaderBadges();
      },'pri')
    ]);
  };

  render();
}
