// ─── SECTIUNEA RETETE ─────────────────────────────────────────────────────────
function renderRecs(){
  const sec=document.getElementById('sec-retete'); sec.innerHTML='';
  let search='', fType='all';

  const render=()=>{
    sec.innerHTML='';

    // ── Page header ──────────────────────────────────────────────────────
    const ph=document.createElement('div'); ph.className='page-header'; sec.appendChild(ph);
    const phL=document.createElement('div');
    const ti=document.createElement('div'); ti.className='stitle'; ti.innerHTML='Rețete <em>&</em> Preparate'; phL.appendChild(ti);
    const sub=document.createElement('div'); sub.className='ssub'; sub.textContent=recs.length+' preparate definite'; phL.appendChild(sub);
    ph.appendChild(phL);
    const phR=document.createElement('div'); phR.style.cssText='display:flex;gap:6px;align-items:center';
    phR.appendChild(btn('📊',async()=>{try{await exportAllRecsExcel();}catch(e){alert('Eroare: '+e.message);}},'sm-ok'));
    phR.appendChild(btn('+ Preparat',()=>showForm(null),'pri'));
    ph.appendChild(phR);

    // ── Split container ───────────────────────────────────────────────────
    const split=document.createElement('div'); split.className='sec-split'; sec.appendChild(split);

    // ── LEFT: search + type filter ────────────────────────────────────────
    const left=document.createElement('div'); left.className='sec-left';

    const si=inp('text','','Caută preparat...'); si.value=search; si.oninput=e=>{search=e.target.value;render();};
    left.appendChild(si);

    const typeLbl=document.createElement('div');
    typeLbl.style.cssText='font-size:9.5px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:2px';
    typeLbl.textContent='Tip preparat'; left.appendChild(typeLbl);

    const typeList=document.createElement('div'); typeList.style.cssText='display:flex;flex-direction:column;gap:3px';
    [['all','Toate preparatele'],['recipe','👨‍🍳 Cu rețetă'],['bought','🛒 Cumpărat']].forEach(([t,label])=>{
      const isA=fType===t;
      const cnt=t==='all'?recs.length:recs.filter(r=>r.type===t).length;
      const b=document.createElement('button');
      b.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:var(--r-sm);font-size:12px;font-weight:'+(isA?'600':'400')+';cursor:pointer;font-family:var(--font-body);text-align:left;background:'+(isA?'var(--gold-dim)':'transparent')+';color:'+(isA?'var(--gold3)':'var(--text2)')+';border:1px solid '+(isA?'var(--gold-line)':'transparent')+';width:100%';
      const ns=document.createElement('span'); ns.textContent=label; b.appendChild(ns);
      const cs=document.createElement('span'); cs.style.cssText='font-size:10px;opacity:.55;font-weight:400'; cs.textContent=cnt; b.appendChild(cs);
      b.onclick=()=>{fType=t;render();};
      typeList.appendChild(b);
    });
    left.appendChild(typeList);
    split.appendChild(left);

    // ── RIGHT: recipe cards ───────────────────────────────────────────────
    const right=document.createElement('div'); right.className='sec-right';

    const fil=recs.filter(r=>(fType==='all'||r.type===fType)&&(r.name.toLowerCase().includes(search.toLowerCase())||(r.cat||'').toLowerCase().includes(search.toLowerCase())));
    if(!fil.length){
      const e=document.createElement('div');e.className='empty';e.textContent='Niciun preparat.';right.appendChild(e);
    } else {
      fil.forEach(r=>{
        const card=document.createElement('div'); card.className='card';
        const row=document.createElement('div'); row.className='row';
        const lft=document.createElement('div');
        const nm=document.createElement('div'); nm.style.cssText="font-family:var(--font-disp);font-size:16px;font-weight:600;margin-bottom:4px";
        nm.textContent=(r.type==='bought'?'🛒 ':'👨‍🍳 ')+r.name;
        const bdg=document.createElement('div'); bdg.style.cssText='display:flex;gap:5px;flex-wrap:wrap';
        if(r.cat)bdg.appendChild(badge(r.cat,'var(--gold)18','var(--gold)'));
        bdg.appendChild(badge(r.type==='bought'?'Cumparat':MODES.find(m=>m.v===r.mode)?.l||r.mode,'var(--bg3)','#999'));
        bdg.appendChild(badge('Baza: '+r.baseQty+' '+r.baseUnit,'var(--bg3)','#999'));
        lft.appendChild(nm); lft.appendChild(bdg);
        const ab=document.createElement('div'); ab.style.cssText='display:flex;gap:5px';
        if(r.type==='recipe'){
          ab.appendChild(btn('📊',async()=>{try{await exportOneRecExcel(r);}catch(e){alert('Eroare: '+e.message);}},'sm-ok'));
        }
        ab.appendChild(btn('✏️',()=>showForm(r),'sm-sec'));
        ab.appendChild(btn('🗑️',()=>{if(confirm('Stergi?')){recs=recs.filter(x=>x.id!==r.id);LS.set('rm_recs',recs);render();updateHeaderBadges();}},'sm-dan'));
        row.appendChild(lft); row.appendChild(ab); card.appendChild(row);
        if(r.items?.length){
          const tags=document.createElement('div'); tags.style.cssText='margin-top:10px;display:flex;flex-wrap:wrap';
          r.items.forEach(item=>{
            const ing=ings.find(i=>i.id===item.ingId);
            const subR=!ing?recs.find(rc=>rc.id===item.ingId):null;
            const nm2=ing?ing.name:(subR?'[R] '+subR.name:'?');
            const un=ing?ing.unit:(subR?subR.baseUnit:'—');
            const t=document.createElement('span'); t.className='tag';
            if(subR)t.style.borderColor='var(--gold)55';
            t.innerHTML=nm2+' <span style="color:var(--gold)">'+item.qty+' '+un+'</span>';
            tags.appendChild(t);
          });
          card.appendChild(tags);
        }
        right.appendChild(card);
      });
    }

    split.appendChild(right);
    attachSplitDivider(split, left, right, 'km-rec-split', 26, 180, 220);
  };

  const showForm=(rec)=>{
    const form=document.createElement('div'); form.style.cssText='display:grid;gap:12px';
    let items=[...(rec?.items||[])];
    const tRow=document.createElement('div'); tRow.className='g2';
    let rType=rec?.type||'recipe';
    const tBtns={};
    ['recipe','bought'].forEach(t=>{
      const b=document.createElement('button');
      b.textContent=t==='recipe'?'👨‍🍳 Cu reteta':'🛒 Cumparat';
      b.style.cssText='padding:10px;border-radius:10px;font-size:12px;cursor:pointer;width:100%;font-family:var(--font-body)';
      b.onclick=()=>{rType=t;updT();}; tBtns[t]=b; tRow.appendChild(b);
    });
    form.appendChild(fld('Tip *',tRow));
    const ni=inp('text',rec?.name||'','Tiramisu, Pesto...');
    form.appendChild(fld('Nume *',ni));
    const g2=document.createElement('div'); g2.className='g2';
    const ci=inp('text',rec?.cat||'','Desert, Supa...'); g2.appendChild(fld('Categorie',ci));
    const supi=inp('text',rec?.supplier||'','Metro...');
    const supRow=document.createElement('div'); supRow.appendChild(fld('Furnizor',supi)); g2.appendChild(supRow);
    form.appendChild(g2);
    let rMode=rec?.mode||'bucata';
    const modeRow=document.createElement('div');
    const modeGrid=document.createElement('div'); modeGrid.className='mode-grid'; modeGrid.style.cssText='display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px';
    const mBtns={};
    MODES.forEach(m=>{
      const b=document.createElement('button'); b.textContent=m.l;
      b.style.cssText='padding:8px 4px;border-radius:8px;font-size:11px;cursor:pointer;font-family:var(--font-body)';
      b.onclick=()=>{rMode=m.v;updM();}; mBtns[m.v]=b; modeGrid.appendChild(b);
    });
    modeRow.appendChild(fld('Mod calcul *',modeGrid)); form.appendChild(modeRow);
    const g3=document.createElement('div'); g3.className='g2';
    const bqi=inp('number',rec?.baseQty||1,''); bqi.min='0.001'; bqi.step='0.001';
    const bui=sel(ALL_UNITS.map(u=>[u,u]),rec?.baseUnit||'buc');
    g3.appendChild(fld('Cantitate baza *',bqi)); g3.appendChild(fld('Unitate',bui)); form.appendChild(g3);
    const itemsRow=document.createElement('div');
    const ih=document.createElement('div'); ih.className='row'; ih.style.marginBottom='8px';
    ih.appendChild(lbl('Ingrediente & Sub-retete'));
    const addBtns=document.createElement('div'); addBtns.style.cssText='display:flex;gap:5px';
    addBtns.appendChild(btn('+ Ingredient',()=>{items=[...items,{id:Date.now(),ingId:ings[0]?.id,qty:'',iType:'ing'}];riRender();},'sm-sec'));
    addBtns.appendChild(btn('+ Reteta',()=>{const o=recs.filter(r2=>r2.id!==rec?.id);if(!o.length)return alert('Nu ai alte retete.');items=[...items,{id:Date.now(),ingId:o[0].id,qty:'',iType:'rec'}];riRender();},'sm-ok'));
    ih.appendChild(addBtns); itemsRow.appendChild(ih);
    const iList=document.createElement('div'); iList.style.cssText='display:grid;gap:6px'; itemsRow.appendChild(iList);
    const riRender=()=>{
      iList.innerHTML='';
      items.forEach(item=>{
        const isR=item.iType==='rec';
        const row=document.createElement('div'); row.className='rec-item-row'; row.style.cssText='display:grid;grid-template-columns:22px 1fr 80px 26px;gap:6px;align-items:center';
        const ic=document.createElement('span'); ic.style.cssText='font-size:13px;text-align:center'; ic.textContent=isR?'🍳':'🥕'; row.appendChild(ic);
        let selEl;
        if(isR){selEl=sel(recs.filter(r2=>r2.id!==rec?.id).map(r2=>[r2.id,r2.name+' ('+r2.baseUnit+')']),item.ingId); selEl.style.borderColor='var(--gold)55';}
        else{selEl=sel(ings.map(i=>[i.id,i.name+' ('+i.unit+')']),item.ingId);}
        selEl.onchange=e=>item.ingId=Number(e.target.value); row.appendChild(selEl);
        const qi=inp('number',item.qty,'Cant.'); qi.min='0.001'; qi.step='0.001'; qi.oninput=e=>item.qty=e.target.value; row.appendChild(qi);
        const xb=document.createElement('button'); xb.textContent='×'; xb.style.cssText='background:transparent;color:var(--red);font-size:18px;line-height:1;cursor:pointer';
        xb.onclick=()=>{items=items.filter(i=>i.id!==item.id);riRender();}; row.appendChild(xb);
        iList.appendChild(row);
      });
    };
    riRender(); form.appendChild(itemsRow);
    const updT=()=>{
      Object.entries(tBtns).forEach(([t,b])=>{b.style.border='2px solid '+(rType===t?'var(--gold)':'var(--border)');b.style.background=rType===t?'var(--gold)18':'var(--bg3)';b.style.color=rType===t?'var(--gold)':'#999';});
      supRow.style.display=rType==='bought'?'block':'none'; modeRow.style.display=rType==='recipe'?'block':'none'; itemsRow.style.display=rType==='recipe'?'block':'none';
    };
    const updM=()=>MODES.forEach(m=>{const b=mBtns[m.v];b.style.border='2px solid '+(rMode===m.v?'var(--gold)':'var(--border)');b.style.background=rMode===m.v?'var(--gold)18':'var(--bg3)';b.style.color=rMode===m.v?'var(--gold)':'#666';});
    updT(); updM();
    const modal=openModal(rec?'Editeaza preparatul':'Preparat nou',form,[
      btn('Anuleaza',()=>modal.close(),'sec'),
      btn('Salveaza',()=>{
        if(!ni.value.trim())return alert('Introdu numele.');
        const newRec={id:rec?.id||Date.now(),name:ni.value.trim(),type:rType,mode:rMode,baseQty:Number(bqi.value)||1,baseUnit:bui.value,cat:ci.value,supplier:supi.value,items};
        if(rec)recs=recs.map(x=>x.id===rec.id?newRec:x); else recs=[...recs,newRec];
        LS.set('rm_recs',recs); modal.close(); render(); updateHeaderBadges();
      },'pri')
    ]);
  };
  render();
}
