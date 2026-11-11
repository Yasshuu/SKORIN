/* Halaman murid: dashboard, analisis, rekomendasi — dari data siswa yang login. */
(() => {
  'use strict';
  if (!SS.ui.ready) return;
  const { $, esc, fmt, initials, lineChart } = SS.ui;
  const user = SS.auth.current();
  const me = SS.student(user.studentId);
  const st = SS.stats();
  const view = $('view');
  const page = document.body.dataset.page;

  const empty = text => { view.innerHTML = `<div class="panel"><p class="empty">${text}</p></div>`; };
  if (!me) return empty('Data siswa tidak ditemukan. Hubungi gurumu.');
  if (!SS.isGraded(me)) return empty('Nilai kamu belum diinput oleh guru. Cek lagi nanti.');

  const n = SS.finalScore(me), p = SS.predikat(n);
  const target = me.target || 90, kkm = st.kkm;
  const rows = SS.COMPONENTS.map((c, i) => ({ c, mine: me[c.key], avg: st.avgByComp[i] }));
  const byLow = [...rows].sort((a, b) => a.mine - b.mine);
  const level = r => r.mine < kkm ? ['PRIORITAS', 'high'] : r.mine < target ? ['LATIHAN', 'mid'] : ['AMAN', 'low'];
  const signed = d => (d >= 0 ? '+' : '') + fmt(d);

  const chartPanel = `<div class="panel"><div class="panel-head"><div><h3>Performa Saya</h3><p>Nilai per komponen dibanding rata-rata kelas</p></div></div><div class="chart" id="chart"></div></div>`;
  const drawChart = () => lineChart($('chart'), {
    labels: SS.COMPONENTS.map(c => c.label),
    series: [{ name: 'Nilai saya', values: rows.map(r => r.mine) }, { name: 'Rata-rata kelas', values: rows.map(r => r.avg) }],
    ref: { value: kkm, label: `KKM ${kkm}` }, label: 'Nilai saya dibanding rata-rata kelas'
  });

  if (page === 'dashboard') {
    const gap = round(target - n), below = rows.filter(r => r.mine < kkm).length;
    view.innerHTML =
      `<div class="hero"><div><h2>Perkembangan belajar kamu</h2><p>Lihat nilai akhir, target semester, dan rekomendasi belajar dari data penilaianmu.</p></div><span class="pill">${esc(me.kelas)} • Ganjil 2026/2027</span></div>` +
      `<div class="stats">` +
      `<div class="card"><div class="stat-head"><span>Nilai Akhir</span><i class="stat-icon">★</i></div><h3>${fmt(n)}</h3><p class="up">Predikat ${p.kode} • ${SS.status(n)}</p></div>` +
      `<div class="card"><div class="stat-head"><span>Target Semester</span><i class="stat-icon">→</i></div><h3>${target}</h3><p>${gap > 0 ? fmt(gap) + ' poin lagi' : 'target tercapai'}</p></div>` +
      `<div class="card"><div class="stat-head"><span>Dibanding Kelas</span><i class="stat-icon">↗</i></div><h3>${signed(n - st.avg)}</h3><p>rata-rata kelas ${fmt(st.avg)}</p></div>` +
      `<div class="card"><div class="stat-head"><span>Di Bawah KKM</span><i class="stat-icon">!</i></div><h3>${below}</h3><p>${below ? 'komponen perlu diperkuat' : 'semua komponen aman'}</p></div></div>` +
      `<div class="grid">${chartPanel}<div class="panel"><div class="panel-head"><div><h3>Rekomendasi</h3><p>Komponen yang perlu perhatian</p></div></div><div class="students">` +
      byLow.slice(0, 3).map(r => { const [t, cls] = level(r);
        return `<div class="student"><div class="avatar">${esc(initials(r.c.label))}</div><div class="student-info"><b>${r.c.full}</b><span>Nilai ${fmt(r.mine)} • kelas ${fmt(r.avg)}</span></div><span class="risk ${cls}">${t}</span></div>`; }).join('') +
      `</div></div></div>` +
      `<div class="insight"><div class="spark">✦</div><div><b>SKORIN — Target berikutnya: ${target}</b><p>Nilai akhir kamu ${fmt(n)}. Komponen terendah: ${byLow[0].c.label} (${fmt(byLow[0].mine)}).</p></div><a class="btn-link" href="murid-simulasi.html">Coba Simulasi →</a></div>`;
    drawChart();
  }

  if (page === 'analisis') {
    view.innerHTML =
      `<div class="hero"><div><h2>Analisis nilai saya</h2><p>Bandingkan setiap komponen penilaianmu dengan rata-rata kelas.</p></div></div>` +
      chartPanel +
      `<div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th scope="col">Komponen</th><th scope="col">Bobot</th><th scope="col">Nilai saya</th><th scope="col">Rata-rata kelas</th><th scope="col">Selisih</th><th scope="col">Posisi</th></tr></thead><tbody>` +
      rows.map(r => `<tr><td>${r.c.full}</td><td>${Math.round(r.c.weight * 100)}%</td><td><b>${fmt(r.mine)}</b></td><td>${fmt(r.avg)}</td><td>${signed(r.mine - r.avg)}</td><td><div class="bar" aria-hidden="true"><span style="width:${r.mine}%"></span></div></td></tr>`).join('') +
      `</tbody></table></div></div>` +
      `<div class="insight"><div class="spark">✦</div><div><b>Temuan utama</b><p>Nilai akhir ${fmt(n)} (${p.kode}). Terkuat di ${byLow[3].c.label} (${fmt(byLow[3].mine)}), paling perlu dikuatkan di ${byLow[0].c.label} (${fmt(byLow[0].mine)}).</p></div><a class="btn-link" href="murid-rekomendasi.html">Lihat Rekomendasi →</a></div>`;
    drawChart();
  }

  if (page === 'rekomendasi') {
    const need = SS.neededUas(me, target);
    const goal = n >= target ? `Target ${target} sudah tercapai. Pertahankan!`
      : need <= 100 ? `Untuk mencapai target ${target}, UAS yang dibutuhkan sekitar ${fmt(need)}.`
      : `Target ${target} butuh peningkatan di lebih dari satu komponen, tidak cukup dari UAS saja.`;
    view.innerHTML =
      `<div class="hero"><div><h2>Rekomendasi belajar</h2><p>Urut dari komponen yang paling perlu diperkuat.</p></div></div>` +
      `<div class="recommend">` +
      byLow.map(r => { const [t, cls] = level(r);
        return `<div class="card"><div class="stat-icon">${esc(initials(r.c.label))}</div><h4>${r.c.full} — ${fmt(r.mine)} <span class="risk ${cls}">${t}</span></h4><p>${r.c.advice}</p></div>`; }).join('') +
      `</div><div class="insight"><div class="spark">✓</div><div><b>Rekomendasi utama</b><p>Fokus dulu pada ${byLow[0].c.full}. ${goal}</p></div><a class="btn-link" href="murid-simulasi.html">Coba Simulasi →</a></div>`;
  }

  function round(x) { return Math.round(x * 10) / 10; }
})();
