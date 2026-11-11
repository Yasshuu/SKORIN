/* Smart Score — lapisan data, perhitungan nilai, dan autentikasi demo.
   Semua halaman memakai file ini sebagai SATU-SATUNYA sumber data. */
const SS = (() => {
  'use strict';

  const DATA_KEY = 'smartScoreData_v2';
  const SESSION_KEY = 'smartScoreSession_v2';

  // Komponen penilaian + bobotnya (satu tempat saja, dipakai semua halaman)
  const COMPONENTS = [
    { key: 'tugas', label: 'Tugas', full: 'Tugas', weight: 0.20,
      advice: 'Kerjakan tugas lebih awal dan minta masukan guru sebelum dikumpulkan. Bobotnya 20% dan paling mudah dinaikkan.' },
    { key: 'uh', label: 'UH', full: 'Ulangan Harian', weight: 0.25,
      advice: 'Ulangi soal ulangan harian yang salah, lalu buat ringkasan satu halaman per bab.' },
    { key: 'uts', label: 'UTS', full: 'Ujian Tengah Semester', weight: 0.25,
      advice: 'Susun jadwal belajar mingguan dan latihan soal tipe UTS sebelum ujian.' },
    { key: 'uas', label: 'UAS', full: 'Ujian Akhir Semester', weight: 0.30,
      advice: 'Mulai review materi seluruh semester sejak awal dan kerjakan soal latihan UAS dengan batas waktu.' }
  ];

  const PREDIKAT = [
    { kode: 'A',  min: 90, range: '90–100', arti: 'Sangat baik' },
    { kode: 'B+', min: 80, range: '80–89',  arti: 'Baik' },
    { kode: 'B',  min: 75, range: '75–79',  arti: 'Cukup baik' },
    { kode: 'C',  min: 70, range: '70–74',  arti: 'Perlu penguatan' },
    { kode: 'D',  min: 0,  range: '< 70',   arti: 'Perlu bimbingan' }
  ];

  // Akun demo. (Password polos hanya boleh untuk demo; aplikasi nyata wajib pakai backend + hash.)
  const ACCOUNTS = [
    { username: 'guru01',  password: 'guru123',  role: 'guru',  name: 'Ibu Warnety' },
    { username: 'murid01', password: 'murid123', role: 'murid', name: 'Alya Putri',   studentId: 's01' },
    { username: 'murid02', password: 'murid123', role: 'murid', name: 'Ahmad Rizky',  studentId: 's02' }
  ];

  const mk = (id, name, tugas, uh, uts, uas) =>
    ({ id, name, kelas: 'XII-A', tugas, uh, uts, uas, target: 90 });

  const seed = () => ({
    kkm: 75,
    students: [
      mk('s01', 'Alya Putri', 94, 92, 90, 93),
      mk('s02', 'Ahmad Rizky', 70, 58, 60, 58),
      mk('s03', 'Dimas Nugraha', 72, 62, 65, 63),
      mk('s04', 'Fajar Aditya', 75, 64, 66, 65),
      mk('s05', 'Nabila Rahma', 74, 70, 68, 71),
      mk('s06', 'Raka Pratama', 88, 85, 87, 89),
      mk('s07', 'Salsa Nabila', 85, 84, 83, 86),
      mk('s08', 'Bima Saputra', 80, 78, 76, 80),
      mk('s09', 'Citra Lestari', 91, 90, 92, 94),
      mk('s10', 'Dewi Anggraini', 82, 80, 79, 83),
      mk('s11', 'Eko Prasetyo', 77, 74, 76, 78),
      mk('s12', 'Farhan Maulana', 86, 88, 85, 90),
      mk('s13', 'Gita Permata', 90, 93, 91, 95),
      mk('s14', 'Hendra Wijaya', 79, 72, 74, 76),
      mk('s15', 'Intan Maharani', 83, 86, 84, 85),
      mk('s16', 'Joko Santoso', 87, 83, 88, 87)
    ]
  });

  const round1 = n => Math.round(n * 10) / 10;
  const isNum = v => typeof v === 'number' && Number.isFinite(v);

  /* ---------- Penyimpanan (localStorage) ---------- */
  let state = null;

  function load() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(DATA_KEY);
      const parsed = raw && JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students) && isNum(parsed.kkm)) {
        state = parsed;
        return state;
      }
    } catch (e) { /* data rusak → pakai data awal */ }
    state = seed();
    save();
    return state;
  }

  function save() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(state)); } catch (e) { /* storage penuh/diblokir */ }
  }

  /* ---------- Perhitungan nilai ---------- */
  const isGraded = s => COMPONENTS.every(c => isNum(s[c.key]));

  const finalScore = s =>
    isGraded(s) ? round1(COMPONENTS.reduce((t, c) => t + s[c.key] * c.weight, 0)) : null;

  const predikat = n => PREDIKAT.find(p => n >= p.min) || PREDIKAT[PREDIKAT.length - 1];

  const kkm = () => load().kkm;
  const status = (n, k = kkm()) => (n >= k ? 'Tuntas' : 'Belum Tuntas');

  // Risiko ditentukan dari seberapa jauh nilai di bawah KKM
  function risk(n, k = kkm()) {
    if (n >= k) return 'Aman';
    const gap = k - n;
    return gap > 10 ? 'Tinggi' : gap > 5 ? 'Sedang' : 'Rendah';
  }

  // Komponen terendah milik satu siswa
  function weakest(s) {
    return COMPONENTS
      .map(c => ({ key: c.key, label: c.label, value: s[c.key] }))
      .reduce((a, b) => (b.value < a.value ? b : a));
  }

  // Nilai UAS yang dibutuhkan agar nilai akhir mencapai target
  function neededUas(scores, target) {
    const uas = COMPONENTS.find(c => c.key === 'uas');
    const others = COMPONENTS.filter(c => c.key !== 'uas')
      .reduce((t, c) => t + scores[c.key] * c.weight, 0);
    return (target - others) / uas.weight;
  }

  // Validasi input nilai → null kalau valid, atau {field, text}
  function validateScores(scores) {
    for (const c of COMPONENTS) {
      const v = scores[c.key];
      if (!isNum(v)) return { field: c.key, text: `Nilai ${c.label} wajib diisi dengan angka.` };
      if (v < 0 || v > 100) return { field: c.key, text: `Nilai ${c.label} harus antara 0 dan 100.` };
    }
    return null;
  }

  /* ---------- Statistik kelas (dihitung dari data, bukan diketik manual) ---------- */
  function stats() {
    const k = kkm();
    const all = load().students;
    const graded = all.filter(isGraded).map(s => ({ s, n: finalScore(s) }));
    const count = graded.length;
    const tuntas = graded.filter(g => g.n >= k).length;
    const avgByComp = COMPONENTS.map(c =>
      count ? round1(graded.reduce((t, g) => t + g.s[c.key], 0) / count) : null);

    let weakestComp = null;
    if (count) {
      let idx = 0;
      avgByComp.forEach((v, i) => { if (v < avgByComp[idx]) idx = i; });
      weakestComp = { label: COMPONENTS[idx].label, avg: avgByComp[idx] };
    }

    return {
      kkm: k,
      total: all.length,
      count,
      avg: count ? round1(graded.reduce((t, g) => t + g.n, 0) / count) : null,
      tuntas,
      pctTuntas: count ? round1((tuntas / count) * 100) : null,
      avgByComp,
      weakest: weakestComp,
      distribusi: PREDIKAT.map(p => ({
        ...p, jumlah: graded.filter(g => predikat(g.n).kode === p.kode).length
      })),
      perhatian: graded.filter(g => g.n < k).sort((a, b) => a.n - b.n),
      pengayaan: graded.filter(g => g.n >= 90).sort((a, b) => b.n - a.n)
    };
  }

  /* ---------- Operasi data (CRUD) ---------- */
  function addStudent(name) {
    name = String(name || '').trim().replace(/\s+/g, ' ');
    if (!name) return { ok: false, error: 'Nama siswa wajib diisi.' };
    if (name.length > 40) return { ok: false, error: 'Nama maksimal 40 karakter.' };
    const list = load().students;
    if (list.some(s => s.name.toLowerCase() === name.toLowerCase()))
      return { ok: false, error: 'Nama siswa sudah ada di kelas ini.' };
    const student = {
      id: 's' + Date.now().toString(36), name, kelas: 'XII-A',
      tugas: null, uh: null, uts: null, uas: null, target: 90
    };
    list.push(student);
    save();
    return { ok: true, student };
  }

  function saveScores(id, scores) {
    const s = load().students.find(x => x.id === id);
    if (!s) return false;
    COMPONENTS.forEach(c => { s[c.key] = scores[c.key]; });
    save();
    return true;
  }

  function removeStudent(id) {
    const st = load();
    st.students = st.students.filter(s => s.id !== id);
    save();
  }

  function setKkm(value) {
    if (!isNum(value) || value < 0 || value > 100) return;
    load().kkm = value;
    save();
  }

  function reset() { state = seed(); save(); }

  /* ---------- Autentikasi demo (sisi klien, hanya simulasi) ---------- */
  const auth = {
    login(username, password, role, remember) {
      const uname = String(username || '').trim().toLowerCase();
      const acc = ACCOUNTS.find(a => a.username === uname && a.password === password && a.role === role);
      if (!acc) return null;
      const session = { username: acc.username, role: acc.role, name: acc.name, studentId: acc.studentId || null };
      auth.logout();
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },
    current() {
      for (const store of [sessionStorage, localStorage]) {
        try {
          const s = JSON.parse(store.getItem(SESSION_KEY) || 'null');
          if (s && (s.role === 'guru' || s.role === 'murid')) return s;
        } catch (e) { /* sesi rusak → dianggap belum login */ }
      }
      return null;
    },
    logout() {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  return {
    COMPONENTS, PREDIKAT,
    students: () => load().students,
    student: id => load().students.find(s => s.id === id) || null,
    kkm, setKkm, isGraded, finalScore, predikat, status, risk, weakest, neededUas,
    validateScores, stats, addStudent, saveScores, removeStudent, reset, auth,
    ui: { ready: false }
  };
})();
