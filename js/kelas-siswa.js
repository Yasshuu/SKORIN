/* Kelas & Siswa — cari, tambah, hapus siswa (tersimpan di localStorage). */
(() => {
  'use strict';
  if (!SS.ui.ready) return;
  const { $, esc, fmt, riskClass, toast } = SS.ui;
  const rows = $('rows'), q = $('q'), dlg = $('addDialog'), form = $('addForm'), err = $('addError');

  function actions(s) {
    return `<a class="link-btn" href="input-nilai.html?id=${encodeURIComponent(s.id)}">Input nilai</a>` +
           `<button type="button" class="link-btn danger" data-del="${esc(s.id)}">Hapus</button>`;
  }

  function render() {
    const term = q.value.trim().toLowerCase();
    const all = SS.students();
    const list = all.filter(s => s.name.toLowerCase().includes(term));
    $('countInfo').textContent = `${list.length} dari ${all.length} siswa`;

    if (!list.length) {
      rows.innerHTML = `<tr><td colspan="6" class="empty">${term ? 'Tidak ada siswa dengan nama itu.' : 'Belum ada siswa.'}</td></tr>`;
      return;
    }
    rows.innerHTML = list.map(s => {
      const n = SS.finalScore(s);
      if (n === null) {
        return `<tr><td><b>${esc(s.name)}</b></td><td>—</td><td>—</td><td>Belum dinilai</td><td>—</td><td>${actions(s)}</td></tr>`;
      }
      const r = SS.risk(n);
      return `<tr><td><b>${esc(s.name)}</b></td><td>${fmt(n)}</td><td>${SS.predikat(n).kode}</td>` +
        `<td>${SS.status(n)}</td><td><span class="risk ${riskClass(r)}">${r.toUpperCase()}</span></td><td>${actions(s)}</td></tr>`;
    }).join('');
  }

  q.addEventListener('input', render);

  rows.addEventListener('click', e => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const s = SS.student(btn.dataset.del);
    if (s && confirm(`Hapus ${s.name}? Data nilainya ikut terhapus.`)) {
      SS.removeStudent(s.id);
      render();
      toast('Siswa dihapus.');
    }
  });

  $('openAdd').addEventListener('click', () => {
    form.reset();
    err.textContent = '';
    dlg.showModal();
    $('newName').focus();
  });
  $('cancelAdd').addEventListener('click', () => dlg.close());

  form.addEventListener('submit', e => {
    e.preventDefault();
    const res = SS.addStudent($('newName').value);
    if (!res.ok) { err.textContent = res.error; return; }
    dlg.close();
    render();
    toast(`${res.student.name} ditambahkan. Lanjut isi nilainya lewat tombol "Input nilai".`);
  });

  $('resetData').addEventListener('click', () => {
    if (confirm('Kembalikan semua data siswa dan nilai ke data awal demo?')) {
      SS.reset();
      render();
      toast('Data demo dikembalikan.');
    }
  });

  render();
})();
