/* Analisis nilai kelas — dihitung dari data siswa. */
(() => {
  'use strict';
  if (!SS.ui.ready) return;
  const { $, fmt } = SS.ui;
  const st = SS.stats();
  const aCount = st.distribusi.find(d => d.kode === 'A').jumlah;

  $('statAvg').textContent = fmt(st.avg);
  $('statTuntas').textContent = st.count ? fmt(st.pctTuntas) + '%' : '—';
  $('statTuntasNote').textContent = `${st.tuntas} dari ${st.count} siswa`;
  $('statA').textContent = aCount;
  $('statRisk').textContent = st.perhatian.length;

  $('distBody').innerHTML = st.distribusi.map(d =>
    `<tr><td>${d.kode}</td><td>${d.range}</td><td>${d.jumlah}</td>` +
    `<td>${st.count ? fmt(d.jumlah / st.count * 100) + '%' : '—'}</td><td>${d.arti}</td></tr>`).join('');

  $('compBody').innerHTML = SS.COMPONENTS.map((c, i) => {
    const avg = st.avgByComp[i];
    return `<tr><td>${c.full}</td><td>${Math.round(c.weight * 100)}%</td><td>${fmt(avg)}</td>` +
      `<td><div class="bar" aria-hidden="true"><span style="width:${avg || 0}%"></span></div></td></tr>`;
  }).join('');

  if (!st.count) {
    $('insightText').textContent = 'Belum ada siswa yang dinilai.';
  } else {
    $('insightText').textContent =
      `Rata-rata kelas ${fmt(st.avg)}; ${st.tuntas} dari ${st.count} siswa tuntas (KKM ${st.kkm}). ` +
      `${st.perhatian.length} siswa berada di bawah KKM. Komponen terendah: ${st.weakest.label} (${fmt(st.weakest.avg)}).`;
  }
})();
