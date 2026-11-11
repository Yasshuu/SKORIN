/* Halaman login: validasi akun demo, pilih role, ingat saya. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const home = u => { location.href = u.role === 'guru' ? 'pages/guru-dashboard.html' : 'pages/murid-dashboard.html'; };

  const existing = SS.auth.current();
  if (existing) { home(existing); return; }

  // Angka di panel kiri dihitung dari data asli
  const st = SS.stats();
  $('miniTuntas').textContent = st.count ? String(st.pctTuntas).replace('.', ',') + '%' : '—';
  $('miniRata').textContent = st.count ? String(st.avg).replace('.', ',') : '—';
  $('miniPerhatian').textContent = st.perhatian.length;

  let role = 'guru';
  const msg = $('loginMsg');
  const tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
    t.classList.add('active');
    t.setAttribute('aria-pressed', 'true');
    role = t.dataset.role;
    $('username').placeholder = role === 'guru' ? 'Contoh: guru01' : 'Contoh: murid01';
    msg.textContent = '';
  }));

  $('togglePass').addEventListener('click', () => {
    const p = $('password');
    const show = p.type === 'password';
    p.type = show ? 'text' : 'password';
    $('togglePass').textContent = show ? 'Sembunyi' : 'Lihat';
  });

  $('forgot').addEventListener('click', () => {
    msg.className = 'form-info';
    msg.textContent = 'Mode demo: tidak ada reset kata sandi. Pakai akun demo di kotak bawah.';
  });

  $('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const user = SS.auth.login($('username').value, $('password').value, role, $('remember').checked);
    if (!user) {
      msg.className = 'form-error';
      msg.textContent = 'Nama pengguna, kata sandi, atau peran tidak cocok. Cek akun demo di bawah.';
      return;
    }
    home(user);
  });
})();
