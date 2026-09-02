// ─── BACKUP / RESTORE ─────────────────────────────────────────────────────────
function exportBackup() {
  const data = { ings, recs, evs, stock, orders, staff, schedules, _v: 2, _date: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const fname = 'restaurant-backup-' + new Date().toISOString().split('T')[0] + '.json';
  const iOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(iOS){
    const a=document.createElement('a'); a.href=url; a.download=fname; a.target='_blank';
    a.style.cssText='display:none'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  } else {
    const a=document.createElement('a'); a.href=url; a.download=fname;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
}

function importBackup(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.ings || !data.recs || !data.evs) return alert('Fisier invalid. Alege un backup valid.');
      if (!confirm('Inlocuiesti toate datele cu backup-ul din ' + (data._date?.split('T')[0]||'?') + '?')) return;
      ings = data.ings; recs = data.recs; evs = data.evs;
      stock = data.stock || {}; orders = data.orders || {};
      staff = data.staff || []; schedules = data.schedules || {};
      LS.set('rm_ings', ings); LS.set('rm_recs', recs); LS.set('rm_evs', evs);
      LS.set('rm_stock', stock); LS.set('rm_orders', orders);
      LS.set('rm_staff', staff); LS.set('rm_schedules', schedules);
      updateHeaderBadges();
      // Re-render current tab
      if (curTab==='ingrediente') renderIngs();
      else if (curTab==='retete') renderRecs();
      else if (curTab==='calendar') renderCal();
      else if (curTab==='comenzi') renderOrders();
      else if (curTab==='personal') renderStaff();
      alert('Date restaurate cu succes!');
    } catch(err) { alert('Eroare la citirea fisierului: ' + err.message); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ─── TAB SWITCHING ────────────────────────────────────────────────────────────
function switchTab(id) {
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  // Sync ALL nav buttons (sidebar + mobile) by data-tab
  document.querySelectorAll('[data-tab]').forEach(b=>{
    b.classList.toggle('active', b.dataset.tab===id);
  });
  document.getElementById('sec-'+id).classList.add('active');
  curTab = id;
  if (id==='ingrediente') renderIngs();
  else if (id==='retete') renderRecs();
  else if (id==='calendar') renderCal();
  else if (id==='comenzi') renderOrders();
  else if (id==='personal') renderStaff();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
if (sessionStorage.getItem('km-auth') === '1') {
  document.getElementById('login-screen').remove();
  document.getElementById('app').style.display = '';
} else {
  document.getElementById('l-user').focus();
}

updateHeaderBadges();
curTab = 'calendar';
renderCal();
