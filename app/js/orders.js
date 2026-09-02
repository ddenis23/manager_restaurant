// ─── EXCEL: COMENZI FURNIZORI ─────────────────────────────────────────────────
function getIngCat(ing){
  return ORDER_CATS.find(c=>c.cats.some(ci=>ing.cat&&ing.cat.toLowerCase().includes(ci.toLowerCase())))||ORDER_CATS[2];
}

async function exportOrdersExcel(){
  const sel=ings.filter(i=>orders[i.id]>0);
  if(!sel.length){alert('Nu ai niciun produs selectat.');return;}
  const wb=mkWb();
  const x=xlX();
  const {DK2,W,GR,GM,fill,fnt,aln,brd}=x;
  const dateLabel=new Date().toLocaleDateString('ro-RO',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});

  ORDER_CATS.forEach(cat=>{
    const items=sel.filter(i=>getIngCat(i).id===cat.id); if(!items.length)return;
    const ws=wb.addWorksheet(cat.label,{views:[{showGridLines:false}]});
    ws.columns=[{width:3},{width:34},{width:18},{width:14},{width:3}];
    xlHdr(ws,'COMANDA — '+cat.label.toUpperCase(),dateLabel,x);
    ws.mergeCells('B4:D4'); ws.getRow(4).height=8;
    xlCols(ws,['PRODUS / INGREDIENT','CANTITATE COMANDATA','UNITATE'],5,x);
    items.forEach((ing,idx)=>{
      const rn=6+idx, odd=idx%2===0;
      const chosenUnit=(window._oUnits&&window._oUnits[ing.id])||ing.unit;
      ['B','C','D'].forEach(col=>{ws.getCell(col+rn).fill=fill(odd?GR:W); ws.getCell(col+rn).border=brd();});
      ws.getCell('B'+rn).value=ing.name; ws.getCell('B'+rn).font=fnt(10,false,DK2); ws.getCell('B'+rn).alignment=aln('left');
      ws.getCell('C'+rn).value=orders[ing.id]; ws.getCell('C'+rn).font=fnt(12,true,'FF2C1A0A'); ws.getCell('C'+rn).alignment=aln('center');
      ws.getCell('D'+rn).value=chosenUnit; ws.getCell('D'+rn).font=fnt(10,true,'FF444030'); ws.getCell('D'+rn).alignment=aln('center');
      ws.getRow(rn).height=18;
    });
    xlFoot(ws,6+items.length+1,4,x);
  });

  // Rezumat pe toate categoriile
  const wsA=wb.addWorksheet('Rezumat Total',{views:[{showGridLines:false}]});
  wsA.columns=[{width:3},{width:34},{width:20},{width:14},{width:12},{width:3}];
  xlHdr(wsA,'REZUMAT COMENZI FURNIZORI',dateLabel,x);
  xlStats(wsA,[['Total produse',sel.length]],x);
  xlCols(wsA,['PRODUS / INGREDIENT','CATEGORIE','CANTITATE','UNITATE'],7,x);
  const allS=[...sel].sort((a,b)=>{
    const ai=ORDER_CATS.findIndex(c=>getIngCat(a).id===c.id), bi=ORDER_CATS.findIndex(c=>getIngCat(b).id===c.id);
    return ai-bi||a.name.localeCompare(b.name);
  });
  let rr=8,prevC=null;
  allS.forEach((ing,idx)=>{
    const catId=getIngCat(ing).id;
    if(catId!==prevC){
      if(prevC!==null)rr++;
      wsA.mergeCells('B'+rr+':E'+rr); wsA.getCell('B'+rr).value='   '+getIngCat(ing).label.toUpperCase();
      wsA.getCell('B'+rr).font=fnt(9,true,'FF9E7C2E'); wsA.getCell('B'+rr).fill=fill(GM); wsA.getRow(rr).height=13;
      prevC=catId; rr++;
    }
    const odd=idx%2===0, chosenUnit=(window._oUnits&&window._oUnits[ing.id])||ing.unit;
    ['B','C','D','E'].forEach(col=>{wsA.getCell(col+rr).fill=fill(odd?GR:W); wsA.getCell(col+rr).border=brd();});
    wsA.getCell('B'+rr).value=ing.name; wsA.getCell('B'+rr).font=fnt(10,false,DK2); wsA.getCell('B'+rr).alignment=aln('left');
    wsA.getCell('C'+rr).value=getIngCat(ing).label; wsA.getCell('C'+rr).font=fnt(9,false,'FF888878'); wsA.getCell('C'+rr).alignment=aln('center');
    wsA.getCell('D'+rr).value=orders[ing.id]; wsA.getCell('D'+rr).font=fnt(12,true,'FF2C1A0A'); wsA.getCell('D'+rr).alignment=aln('center');
    wsA.getCell('E'+rr).value=chosenUnit; wsA.getCell('E'+rr).font=fnt(10,true,'FF444030'); wsA.getCell('E'+rr).alignment=aln('center');
    wsA.getRow(rr).height=18; rr++;
  });
  xlFoot(wsA,rr+1,5,x);

  await xlSave(wb,'Comanda-Furnizori-'+new Date().toISOString().split('T')[0]+'.xlsx');
}

// ─── SECTIUNEA COMENZI ────────────────────────────────────────────────────────
function renderOrders(){
  const sec=document.getElementById('sec-comenzi'); sec.innerHTML='';
  if(!window._oUnits)window._oUnits={};
  let aCat='Legume';

  const render=()=>{
    sec.innerHTML='';

    // ── Page header ──────────────────────────────────────────────────────
    const ph=document.createElement('div'); ph.className='page-header'; sec.appendChild(ph);
    const phL=document.createElement('div');
    const ti=document.createElement('div'); ti.className='stitle'; ti.textContent='Comenzi Furnizori'; phL.appendChild(ti);
    const sub=document.createElement('div'); sub.className='ssub'; sub.textContent='Selecteaza produsele, cantit. si unitatile de masura'; phL.appendChild(sub);
    ph.appendChild(phL);
    const phR=document.createElement('div'); phR.style.cssText='display:flex;gap:8px';
    const total=Object.values(orders).filter(q=>q>0).length;
    if(total>0){
      phR.appendChild(btn('🗑️ Goleste',()=>{if(confirm('Golesti lista?')){orders={};window._oUnits={};LS.set('rm_orders',orders);render();}},'sm-dan'));
      phR.appendChild(btn('📊 Excel',async()=>{try{await exportOrdersExcel();}catch(e){alert('Eroare: '+e.message);}},'pri'));
    }
    ph.appendChild(phR);

    // ── Split container ───────────────────────────────────────────────────
    const split=document.createElement('div'); split.className='sec-split'; sec.appendChild(split);

    // ── LEFT: summary + category tabs ─────────────────────────────────────
    const left=document.createElement('div'); left.className='sec-left';

    const sumWrap=document.createElement('div'); sumWrap.style.cssText='display:flex;flex-direction:column;gap:5px';
    const totBadge=document.createElement('div'); totBadge.style.cssText='font-size:12px;color:var(--text3)';
    totBadge.innerHTML='<span style="font-weight:600;color:var(--gold3);font-size:16px">'+total+'</span> produse selectate';
    sumWrap.appendChild(totBadge);
    ORDER_CATS.forEach(c=>{
      const cnt=ings.filter(i=>getIngCat(i).id===c.id&&orders[i.id]>0).length;
      if(cnt>0){const b=badge(cnt+' '+c.label,c.bg,c.color);b.style.display='inline-flex';sumWrap.appendChild(b);}
    });
    left.appendChild(sumWrap);

    const catLbl=document.createElement('div');
    catLbl.style.cssText='font-size:9.5px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.1em';
    catLbl.textContent='Categorie furnizor'; left.appendChild(catLbl);

    const catList=document.createElement('div'); catList.style.cssText='display:flex;flex-direction:column;gap:3px';
    ORDER_CATS.forEach(c=>{
      const isA=aCat===c.id;
      const cnt=ings.filter(i=>getIngCat(i).id===c.id&&orders[i.id]>0).length;
      const b=document.createElement('button');
      b.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:9px 10px;border-radius:var(--r-sm);font-size:12px;font-weight:'+(isA?'600':'400')+';cursor:pointer;font-family:var(--font-body);text-align:left;background:'+(isA?c.bg:'transparent')+';color:'+(isA?c.color:'var(--text2)')+';border:1px solid '+(isA?c.color:'transparent')+';width:100%';
      const ns=document.createElement('span'); ns.textContent=c.label; b.appendChild(ns);
      if(cnt>0){const cs=document.createElement('span'); cs.style.cssText='font-size:10px;background:'+c.bg+';color:'+c.color+';padding:1px 6px;border-radius:3px;font-weight:600'; cs.textContent=cnt; b.appendChild(cs);}
      b.onclick=()=>{aCat=c.id;render();};
      catList.appendChild(b);
    });
    left.appendChild(catList);
    split.appendChild(left);

    // ── RIGHT: ingredient list for current category ───────────────────────
    const right=document.createElement('div'); right.className='sec-right';

    const curC=ORDER_CATS.find(c=>c.id===aCat);
    const catIngs=ings.filter(i=>getIngCat(i).id===aCat);
    if(!catIngs.length){
      const e=document.createElement('div');e.className='empty';e.textContent='Niciun ingredient.';right.appendChild(e);
    } else {
      catIngs.forEach(ing=>{
        const qty=orders[ing.id]||0, isSel=qty>0;
        if(!window._oUnits[ing.id])window._oUnits[ing.id]=ing.unit;
        const chosenUnit=window._oUnits[ing.id];

        const card=document.createElement('div'); card.className='card';
        card.style.cssText='padding:12px 14px;margin-bottom:5px;border-left:2px solid '+(isSel?curC.color:'var(--border)')+';background:'+(isSel?curC.bg:'var(--bg2)')+';border-radius:var(--r)';
        const row=document.createElement('div'); row.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:10px';
        const info=document.createElement('div'); info.style.flex='1';
        const nm=document.createElement('div'); nm.style.cssText='font-weight:'+(isSel?600:400)+';font-size:13px;color:'+(isSel?'var(--text)':'#999'); nm.textContent=ing.name;
        const sup=document.createElement('div'); sup.style.cssText='font-size:11px;color:var(--text3)'; sup.textContent=(ing.sup||'')+(ing.cat?' · '+ing.cat:'');
        info.appendChild(nm); if(ing.sup||ing.cat)info.appendChild(sup);

        const ctrl=document.createElement('div'); ctrl.style.cssText='display:flex;align-items:center;gap:5px';
        const mb=document.createElement('button'); mb.textContent='−'; mb.style.cssText='width:30px;height:30px;border-radius:6px;background:var(--bg3);color:var(--text);font-size:20px;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);cursor:pointer';
        mb.onclick=()=>{orders[ing.id]=Math.max(0,(orders[ing.id]||0)-1);LS.set('rm_orders',orders);render();};
        const qi=inp('number',qty||'','0',{width:'58px',textAlign:'center',padding:'5px 4px',fontSize:'14px',fontWeight:'600',borderColor:isSel?curC.color:'var(--border)'});
        qi.min='0'; qi.step='0.5'; qi.oninput=e=>{orders[ing.id]=Number(e.target.value)||0;LS.set('rm_orders',orders);};
        const pb=document.createElement('button'); pb.textContent='+'; pb.style.cssText='width:30px;height:30px;border-radius:6px;background:'+(isSel?curC.color:'var(--bg3)')+';color:'+(isSel?'#111':'var(--text)')+';font-size:20px;display:flex;align-items:center;justify-content:center;border:1px solid '+(isSel?curC.color:'var(--border)')+';cursor:pointer';
        pb.onclick=()=>{orders[ing.id]=(orders[ing.id]||0)+1;LS.set('rm_orders',orders);render();};

        const unitSel=document.createElement('select');
        unitSel.style.cssText='background:var(--bg3);color:'+(isSel?curC.color:'#666')+';border:1px solid '+(isSel?curC.color:'var(--border)')+';border-radius:8px;padding:4px 5px;font-size:12px;font-weight:600;width:66px;-webkit-appearance:none;text-align:center';
        ALL_UNITS.forEach(u=>{
          const o=document.createElement('option'); o.value=u; o.textContent=u;
          if(u===chosenUnit)o.selected=true; unitSel.appendChild(o);
        });
        unitSel.onchange=e=>{window._oUnits[ing.id]=e.target.value;};

        [mb,qi,pb,unitSel].forEach(el=>ctrl.appendChild(el));
        row.appendChild(info); row.appendChild(ctrl); card.appendChild(row); right.appendChild(card);
      });
    }

    split.appendChild(right);
    attachSplitDivider(split, left, right, 'km-ord-split', 26, 180, 220);
  };
  render();
}
