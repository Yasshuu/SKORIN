/* Rekomendasi guru — dibuat dari aturan sederhana atas data nilai. */
(() => {
  'use strict';
  if (!SS.ui.ready) return;
  const { $, esc, fmt } = SS.ui;
  const st = SS.stats();
  const box = $('recommend');

  if (!st.count) {
    box.innerHTML = '<div class="card"><p class="empty">Belum ada nilai. Input nilai siswa dulu.</p></div>';
    $('mainRec').hidden = true;
    return;
  }

  // Aturan 1: nilai < KKM → remedial pada komponen terendah
  const remedial = st.perhatian.map(({ s, n }) => {
    const w = SS.weakest(s);
    return `<li><b>${esc(s.name)}</b> — nilai ${fmt(n)}, terendah di ${w.label} (${fmt(w.value)})</li>`;
  }).join('');

  // Aturan 2: nilai >= 90 → pengayaan
  const pengayaan = st.pengayaan.map(({ s, n }) => `<li><b>${esc(s.name)}</b> — nilai ${fmt(n)}</li>`).join('');

  box.innerHTML =
    `<div class="card"><div class="stat-icon">!</div><h4>Prioritas Remedial</h4>` +
    (st.perhatian.length
      ? `<p>${st.perhatian.length} siswa di bawah KKM ${st.kkm}. Berikan asesmen ulang pada komponen terendah masing-masing.</p><ul class="plain-list">${remedial}</ul>`
      : '<p>Tidak ada siswa di bawah KKM. Pertahankan.</p>') + '</div>' +
    `<div class="card"><div class="stat-icon">↗</div><h4>Pengayaan</h4>` +
    (st.pengayaan.length
      ? `<p>${st.pengayaan.length} siswa bernilai ≥ 90 dapat diberi proyek mini atau tantangan tambahan.</p><ul class="plain-list">${pengayaan}</ul>`
      : '<p>Belum ada siswa dengan nilai ≥ 90.</p>') + '</div>' +
    `<div class="card"><div class="stat-icon">✦</div><h4>Strategi Kelas</h4>` +
    `<p>Ketuntasan kelas ${fmt(st.pctTuntas)}%. Komponen dengan rata-rata terendah adalah ${st.weakest.label} (${fmt(st.weakest.avg)}). ` +
    `Beri latihan tambahan dan evaluasi singkat pada ${st.weakest.label} sebelum masuk materi baru.</p></div>`;

  const first = st.perhatian[0];
  $('mainRecText').textContent = first
    ? `Fokuskan intervensi pada ${first.s.name} (nilai ${fmt(first.n)}) terlebih dahulu, lalu gunakan menu Simulasi untuk menentukan target nilai yang realistis.`
    : 'Semua siswa sudah tuntas. Fokus pada pengayaan dan pertahankan pola belajar kelas.';
})();
