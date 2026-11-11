/* Simulasi nilai — dipakai halaman guru dan murid. */
(() => {
  'use strict';
  if (!SS.ui.ready) return;
  const { $, esc, fmt } = SS.ui;
  const user = SS.auth.current();
  const map = { t: 'tugas', u: 'uh', s: 'uts', a: 'uas' };
  const inputs = ['t', 'u', 's', 'a', 'target'];
  const out = $('result');
  const sel = $('simStudent');

  function fill(stu) {
    Object.entries(map).forEach(([id, key]) => {
      $(id).value = stu && typeof stu[key] === 'number' ? stu[key] : '';
    });
    $('target').value = (stu && stu.target) || 90;
  }

  const read = id => { const raw = $(id).value.trim(); return raw === '' ? NaN : Number(raw); };

  function run() {
    const v = {};
    inputs.forEach(id => { v[id] = read(id); });
    if (inputs.some(id => Number.isNaN(v[id]))) {
      out.innerHTML = '<p class="muted">Isi semua kolom (0–100) untuk melihat hasil simulasi.</p>';
      return;
    }
    if (inputs.some(id => v[id] < 0 || v[id] > 100)) {
      out.innerHTML = '<p class="form-error">Semua nilai dan target harus antara 0 dan 100.</p>';
      return;
    }
    const scores = { tugas: v.t, uh: v.u, uts: v.s, uas: v.a };
    const n = SS.finalScore(scores), p = SS.predikat(n);
    const need = SS.neededUas(scores, v.target);

    let msg;
    if (n >= v.target) {
      msg = `Target ${v.target} <strong>sudah tercapai</strong>.`;
    } else if (need > 100) {
      msg = `Target ${v.target} <strong>tidak bisa dicapai hanya dari UAS</strong>: meski UAS 100, nilai akhir maksimal ` +
        `${fmt(SS.finalScore({ ...scores, uas: 100 }))}. Naikkan komponen lain atau turunkan target.`;
    } else {
      msg = `Untuk mencapai target ${v.target}, UAS yang dibutuhkan sekitar <strong>${fmt(need)}</strong>.`;
    }
    out.innerHTML = `<div class="score-big">${fmt(n)}</div><b>Nilai saat ini • ${p.kode} (${p.arti})</b>` +
      `<p class="muted" style="margin-top:7px">${msg}</p>`;
  }

  if (sel) {
    const graded = SS.students().filter(SS.isGraded);
    sel.innerHTML = '<option value="">— Isi manual —</option>' +
      graded.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
    sel.addEventListener('change', () => { if (sel.value) fill(SS.student(sel.value)); run(); });
    fill(graded[0] || null);
    if (graded[0]) sel.value = graded[0].id;
  } else if (user.role === 'murid') {
    const me = SS.student(user.studentId);
    fill(me);
    if (!me || !SS.isGraded(me)) $('simNote').textContent = 'Nilai kamu belum diinput guru, jadi isi manual dulu untuk mencoba simulasi.';
  }

  inputs.forEach(id => $(id).addEventListener('input', run));
  run();
})();
