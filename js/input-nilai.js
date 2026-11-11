/* Input Nilai — validasi, hitung otomatis, dan simpan ke data siswa. */
(() => {
  'use strict';
  if (!SS.ui.ready) return;
  const { $, esc, fmt, toast } = SS.ui;
  const sel = $('student'), form = $('nilaiForm'), err = $('formError'), out = $('result'), kkmSel = $('kkm');
  const students = SS.students();

  if (!students.length) {
    form.hidden = true;
    $('emptyNote').hidden = false;
    return;
  }

  sel.innerHTML = students.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
  const wanted = new URLSearchParams(location.search).get('id');
  if (wanted && SS.student(wanted)) sel.value = wanted;
  kkmSel.value = String(SS.kkm());

  function loadStudent() {
    const s = SS.student(sel.value);
    SS.COMPONENTS.forEach(c => { $(c.key).value = typeof s[c.key] === 'number' ? s[c.key] : ''; });
    out.hidden = true;
    err.textContent = '';
  }
  sel.addEventListener('change', loadStudent);
  loadStudent();

  form.addEventListener('submit', e => {
    e.preventDefault();
    err.textContent = '';

    const scores = {};
    SS.COMPONENTS.forEach(c => {
      const raw = $(c.key).value.trim();
      scores[c.key] = raw === '' ? NaN : Number(raw);
    });

    const problem = SS.validateScores(scores);
    if (problem) {
      err.textContent = problem.text;
      $(problem.field).focus();
      return;
    }

    SS.setKkm(Number(kkmSel.value));
    SS.saveScores(sel.value, scores);

    const n = SS.finalScore(scores), p = SS.predikat(n);
    const name = sel.options[sel.selectedIndex].text;
    out.hidden = false;
    out.innerHTML = `<div class="score-big">${fmt(n)}</div><b>${p.kode} — ${p.arti}</b>` +
      `<p class="muted" style="margin-top:7px">${esc(name)} • Status <strong>${SS.status(n)}</strong> (KKM ${SS.kkm()}) • Nilai tersimpan</p>`;
    toast('Nilai tersimpan.');
  });
})();
