// ─── LOGIN / LOGOUT ───────────────────────────────────────────────────────────
var USERS = { admin: 'unda' };

function doLogin(e) {
  e.preventDefault();
  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value;
  const err  = document.getElementById('login-error');

  if (USERS[user] && USERS[user] === pass) {
    sessionStorage.setItem('km-auth', '1');
    const screen = document.getElementById('login-screen');
    screen.classList.add('hidden');
    screen.addEventListener('animationend', () => screen.remove(), { once: true });
    document.getElementById('app').style.display = '';
  } else {
    err.classList.add('visible');
    document.getElementById('l-pass').value = '';
    document.getElementById('l-pass').focus();
    setTimeout(() => err.classList.remove('visible'), 3000);
  }
}

function doLogout() {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(4,4,3,.75);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';

  const box = document.createElement('div');
  box.style.cssText = 'background:var(--bg3);border:1.5px solid var(--border2);border-radius:18px;padding:32px 28px 24px;max-width:340px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.7);animation:slideUp .22s cubic-bezier(.4,0,.2,1);text-align:center';

  const icon = document.createElement('div');
  icon.style.cssText = 'font-size:36px;margin-bottom:14px;line-height:1';
  icon.textContent = '🚪';

  const title = document.createElement('div');
  title.style.cssText = 'font-family:var(--font-disp);font-size:18px;font-weight:600;color:var(--text);margin-bottom:8px';
  title.textContent = 'Ieșire din aplicație';

  const sub = document.createElement('div');
  sub.style.cssText = 'font-size:13px;color:var(--text3);margin-bottom:24px;line-height:1.55';
  sub.textContent = 'Ești sigur că vrei să ieși din KitchenManager?';

  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:10px;justify-content:center';

  const cancel = document.createElement('button');
  cancel.textContent = 'Anulează';
  cancel.style.cssText = 'flex:1;padding:10px 0;border-radius:10px;background:var(--bg4);color:var(--text2);border:1.5px solid var(--border2);font-size:14px;font-weight:500;cursor:pointer;font-family:var(--font-body);transition:var(--t)';
  cancel.onclick = () => document.body.removeChild(ov);

  const confirm = document.createElement('button');
  confirm.textContent = 'Ieșire';
  confirm.style.cssText = 'flex:1;padding:10px 0;border-radius:10px;background:var(--red-dim);color:var(--red2);border:1.5px solid rgba(184,80,80,.3);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font-body);transition:var(--t)';
  confirm.onclick = () => { sessionStorage.removeItem('km-auth'); location.reload(); };

  btns.appendChild(cancel); btns.appendChild(confirm);
  box.appendChild(icon); box.appendChild(title); box.appendChild(sub); box.appendChild(btns);
  ov.appendChild(box);
  ov.addEventListener('click', e => { if (e.target === ov) document.body.removeChild(ov); });
  document.body.appendChild(ov);
  cancel.focus();
}
