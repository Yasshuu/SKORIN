# Smart Score Upgrade Edition

Aplikasi demo manajemen nilai berbasis HTML, CSS, dan JavaScript (tanpa backend). Data tersimpan di `localStorage` browser.

## Cara menjalankan
Buka folder di VS Code, jalankan `index.html` dengan **Live Server**.

## Akun demo
| Peran | Username | Password |
|-------|----------|----------|
| Guru  | `guru01`  | `guru123` |
| Murid | `murid01` | `murid123` (Alya Putri, nilai tinggi) |
| Murid | `murid02` | `murid123` (Ahmad Rizky, perlu bimbingan) |

## Fitur
- Login berbasis akun dan peran; halaman dilindungi per peran (murid tidak bisa membuka halaman guru, dan sebaliknya).
- **Guru:** dashboard, kelas & siswa (cari, tambah, hapus), input nilai (validasi 0–100, tersimpan), analisis, simulasi, rekomendasi.
- **Murid:** dashboard, analisis, simulasi target, dan rekomendasi belajar dari nilainya sendiri.
- Semua angka (rata-rata, ketuntasan, distribusi predikat, grafik, siswa berisiko, rekomendasi) **dihitung dari data siswa**, bukan teks statis.
- Tombol **Reset data demo** di halaman Kelas & Siswa mengembalikan data awal.

## Struktur
```
index.html              halaman login
pages/                  halaman guru (6) dan murid (4)
css/                    auth.css, app.css, components.css
js/data.js              sumber data, rumus nilai, autentikasi demo
js/common.js            penjaga akses, sidebar, menu mobile, grafik, toast
js/*.js                 logika per halaman
```

## Rumus
Nilai akhir = Tugas 20% + UH 25% + UTS 25% + UAS 30%. Predikat: A ≥ 90, B+ ≥ 80, B ≥ 75, C ≥ 70, D < 70. Tuntas jika nilai akhir ≥ KKM.

## Batasan
Autentikasi dan penyimpanan masih di sisi klien (simulasi). Aplikasi nyata memerlukan backend dan database, dengan password yang di-hash.
