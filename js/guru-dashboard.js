/* Dashboard guru — semua angka dihitung dari data. */
(() => {
  'use strict';
  if (!SS.ui.ready) return;
  const { $, esc, fmt, initials, riskClass, lineChart } = SS.ui;
  const st = SS.stats();

  $('statTotal').textContent = st.total;
  $('statTotalNote').textContent = st.total - st.count
    ? `${st.total - st.count} siswa belum dinilai` : 'semua siswa sudah dinilai';
  $('statAvg').textContent = fmt(st.avg);
  $('statAvgNote').textContent = st.count ? `dari ${st.count} siswa yang sudah dinilai` : 'belum ada nilai';
  $('statTuntas').textContent = st.count ? fmt(st.pctTuntas) + '%' : '—';
  $('statTuntasNote').textContent = `${st.tuntas} dari ${st.count} siswa (KKM ${st.kkm})`;
  $('statRisk').textContent = st.perhatian.length;
  $('statRiskNote').textContent = 'siswa di bawah KKM';

  lineChart($('chart'), {
    labels: SS.COMPONENTS.map(c => c.label),
    series: [{ name: 'Rata-rata kelas', values: st.avgByComp }],
    ref: { value: st.kkm, label: `KKM ${st.kkm}` },
    label: 'Rata-rata kelas per komponen penilaian'
  });

  const watch = st.perhatian.slice(0, 4);
  $('watchlist').innerHTML = watch.length
    ? watch.map(({ s, n }) => {
        const r = SS.risk(n);
        return `<div class="student"><div class="avatar">${esc(initials(s.name))}</div>` +
          `<div class="student-info"><b>${esc(s.name)}</b><span>Nilai akhir ${fmt(n)}</span></div>` +
          `<span class="risk ${riskClass(r)}">${r.toUpperCase()}</span></div>`;
      }).join('')
    : '<p class="empty">Tidak ada siswa di bawah KKM.</p>';

  if (!st.count) {
    $('insightTitle').textContent = 'SKORIN — Belum ada nilai';
    $('insightText').textContent = 'Input nilai siswa terlebih dahulu agar analisis bisa dibuat.';
  } else {
    $('insightTitle').textContent = `SKORIN — Ketuntasan kelas ${fmt(st.pctTuntas)}%`;
    $('insightText').textContent =
      (st.perhatian.length ? `${st.perhatian.length} siswa masih di bawah KKM ${st.kkm}. ` : 'Semua siswa sudah mencapai KKM. ') +
      `Komponen dengan rata-rata terendah: ${st.weakest.label} (${fmt(st.weakest.avg)}).`;
  }
})();
