/* Smart Score — fungsi bersama semua halaman:
   penjaga akses per role, sidebar, menu mobile, logout, grafik, toast. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => (n === null || n === undefined || Number.isNaN(n)) ? '—' : Number(n).toFixed(1).replace('.', ',');
  const initials = name => {
    const w = String(name).split(/\s+/).filter(x => x && !/^(bu|pak|dr)\.?$/i.test(x));
    return ((w[0]?.[0] || '') + (w[1]?.[0] || '')).toUpperCase() || '?';
  };
  const riskClass = r => ({ Tinggi: 'high', Sedang: 'mid', Rendah: 'low', Aman: 'low' }[r] || '');

  function toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  /* Grafik garis SVG dari data asli. opts: {labels, series:[{name,values,color}], ref:{value,label}, label} */
  function lineChart(el, opts) {
    const { labels, series, ref } = opts;
    const W = 600, H = 250, L = 42, R = 24, T = 24, B = 34;
    const palette = ['#5b57df', '#17924b'];
    const vals = series.flatMap(s => s.values).filter(v => v !== null && v !== undefined);
    if (!vals.length) { el.innerHTML = '<p class="empty">Belum ada data nilai untuk ditampilkan.</p>'; return; }
    if (ref) vals.push(ref.value);

    const min = Math.max(0, Math.floor((Math.min(...vals) - 8) / 10) * 10);
    const max = Math.min(100, Math.ceil((Math.max(...vals) + 4) / 10) * 10);
    const step = (max - min) > 50 ? 20 : 10;
    const x = i => labels.length === 1 ? L + (W - L - R) / 2 : L + i * (W - L - R) / (labels.length - 1);
    const y = v => T + (max - v) * (H - T - B) / (max - min);

    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || 'Grafik nilai')}">`;
    for (let t = min; t <= max; t += step) {
      svg += `<line x1="${L}" y1="${y(t)}" x2="${W - R}" y2="${y(t)}" stroke="#eceef4"/>` +
             `<text x="${L - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="#6f7180">${t}</text>`;
    }
    labels.forEach((lb, i) => {
      svg += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="12" fill="#555">${esc(lb)}</text>`;
    });
    if (ref) {
      svg += `<line x1="${L}" y1="${y(ref.value)}" x2="${W - R}" y2="${y(ref.value)}" stroke="#dc3b3b" stroke-dasharray="5 4"/>` +
             `<text x="${W - R}" y="${y(ref.value) - 6}" text-anchor="end" font-size="11" fill="#dc3b3b">${esc(ref.label)}</text>`;
    }
    series.forEach((s, si) => {
      const color = s.color || palette[si % palette.length];
      const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
      svg += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      s.values.forEach((v, i) => {
        svg += `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="#fff" stroke="${color}" stroke-width="2.5"><title>${esc(s.name)} — ${esc(labels[i])}: ${fmt(v)}</title></circle>` +
               `<text x="${x(i)}" y="${y(v) + (si === 0 ? -10 : 18)}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${fmt(v)}</text>`;
      });
    });
    svg += '</svg>';

    const legend = (series.length > 1 || ref)
      ? '<div class="legend">' + series.map((s, si) =>
          `<span><i style="background:${s.color || palette[si % palette.length]}"></i>${esc(s.name)}</span>`).join('') +
        (ref ? `<span><i style="background:#dc3b3b"></i>${esc(ref.label)}</span>` : '') + '</div>'
      : '';
    el.innerHTML = svg + legend;
  }

  SS.ui = { ready: false, $, esc, fmt, initials, riskClass, toast, lineChart };

  /* ---------- Penjaga akses: hanya jalan di halaman yang punya data-role ---------- */
  const needRole = document.body.dataset.role;
  if (!needRole) return;

  const user = SS.auth.current();
  if (!user || user.role !== needRole) {
    document.body.hidden = true;
    location.replace(!user ? '../index.html'
      : (user.role === 'guru' ? 'guru-dashboard.html' : 'murid-dashboard.html'));
    return;
  }
  SS.ui.ready = true;

  /* ---------- Sidebar (satu sumber untuk semua halaman) ---------- */
  const NAV = {
    guru: [
      { label: 'OVERVIEW', items: [['dashboard', 'guru-dashboard.html', '⌂', 'Dashboard']] },
      { label: 'AKADEMIK', items: [
        ['siswa', 'kelas-siswa.html', '♙', 'Kelas & Siswa'],
        ['input', 'input-nilai.html', '✎', 'Input Nilai'],
        ['analisis', 'analisis.html', '◉', 'Analisis Nilai'],
        ['simulasi', 'simulasi.html', '◇', 'Simulasi Nilai']] },
      { label: 'INSIGHT', items: [['rekomendasi', 'rekomendasi.html', '★', 'Rekomendasi']] }
    ],
    murid: [
      { label: 'OVERVIEW', items: [['dashboard', 'murid-dashboard.html', '⌂', 'Dashboard']] },
      { label: 'BELAJAR', items: [
        ['analisis', 'murid-analisis.html', '◉', 'Analisis Saya'],
        ['simulasi', 'murid-simulasi.html', '◇', 'Simulasi Target'],
        ['rekomendasi', 'murid-rekomendasi.html', '★', 'Rekomendasi Belajar']] }
    ]
  };

  const page = document.body.dataset.page;
  const me = user.role === 'murid' ? SS.student(user.studentId) : null;
  const sub = user.role === 'guru' ? 'Guru • Informatika' : `Murid • ${me ? me.kelas : 'XII-A'}`;
  const badgeCount = user.role === 'guru' ? SS.stats().perhatian.length : 0;

  const navHtml = NAV[user.role].map(g =>
    `<div class="menu-label">${g.label}</div>` + g.items.map(([key, href, icon, label]) => {
      const active = key === page;
      const badge = (key === 'rekomendasi' && badgeCount) ? `<span class="badge">${badgeCount}</span>` : '';
      return `<a href="${href}" class="${active ? 'active' : ''}"${active ? ' aria-current="page"' : ''}>` +
             `<span aria-hidden="true">${icon}</span> ${label}${badge}</a>`;
    }).join('')
  ).join('');

  const sidebar = $('sidebar');
  sidebar.innerHTML =
    '<div class="brand"><div class="brand-mark">SS</div><div><b>SKORIN</b><small>Academic Intelligence</small></div></div>' +
    `<div class="profile"><div class="avatar">${esc(initials(user.name))}</div><div><b>${esc(user.name)}</b><span>${esc(sub)}</span></div></div>` +
    `<nav class="nav" aria-label="Navigasi utama">${navHtml}</nav>` +
    '<div class="side-bottom"><button class="logout" type="button" id="logoutBtn"><span aria-hidden="true">↪</span> Keluar</button></div>';

  document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = user.name; });

  $('logoutBtn').addEventListener('click', () => {
    SS.auth.logout();
    location.href = '../index.html';
  });

  /* ---------- Menu mobile + backdrop ---------- */
  const burger = document.querySelector('.mobile');
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  document.body.appendChild(backdrop);
  const setOpen = open => {
    sidebar.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
  };
  if (burger) burger.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();
