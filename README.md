# 🎃 Halloween Alphabet Generator

Generator huruf bertema Halloween. Hurufnya **disembunyikan** di papan — kamu cuma lihat animasi ngocoknya, lalu huruf hasilnya **muncul besar di tengah dan menetap** (tidak hilang) sampai kamu tekan Acak lagi.

Layout-nya **portrait**: kolom yang di-center di tengah layar, jadi enak dilihat di HP maupun desktop.

## 🎯 Huruf yang dipakai

Pool hurufnya bisa diatur di `app.js` (variabel `LETTERS`). Saat ini berisi **11 huruf**:

```
A  B  C  G  K  L  M  O  P  S  T
```

Huruf yang **tidak dipakai**: `D E F H I J N Q R U V W X Y Z`

## 🚀 Cara Menjalankan

Tidak perlu install apa pun.

1. Klik dua kali **`index.html`** → langsung terbuka di browser.

Opsional lewat server lokal:

```powershell
python -m http.server 8765 --directory "C:\Kuliah\Magang\Letter Generator"
```

Lalu buka `http://127.0.0.1:8765/index.html`.

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 📱 Layout portrait | Kolom di-center di tengah layar, elemen besar dan lega |
| 🅰️ Huruf besar di tengah | Panggung besar untuk huruf hasil — ukurannya ikut lebar papan |
| 📌 Hasil menetap | Setelah di-roll, hurufnya **tetap tampil** dan tidak hilang; baru berganti kalau di-roll lagi |
| 🫥 Huruf disembunyikan | Tile di papan tidak menampilkan huruf sama sekali, cuma tanda kecil |
| 🎰 Animasi ngocok | Highlight melompat-lompat antar tile sambil **melambat**, lalu berhenti |
| 🎯 Tile terpilih | Tile pemenang membesar, menyala oranye, dan melayang |
| 💥 Animasi pop | Tile pemenang "meletup" dengan animasi pop + putaran + percikan cahaya |
| 👻 Penanda | Hantu kecil nongol di sudut tile terpilih |
| 🎲 Tombol Acak | Atau tekan tombol **Spasi** / **Enter** |
| ⌨️ Pilih manual | Tekan tombol huruf di keyboard (hanya huruf yang ada di pool) |
| 🚫 Huruf terhapus | Kalau tekan huruf yang sudah dibuang, muncul info "tidak dipakai" |
| 🔊 Bunyi "klek" | Efek suara dibuat pakai Web Audio API, tanpa file audio |
| 🌫️ Dekorasi | 🎃🦇👻🕷️ berjatuhan di latar belakang |

## 📁 Struktur

```
Letter Generator/
├── index.html   → papan animasi + panel tombol
├── style.css    → desain Halloween + semua animasi
├── app.js       → pool huruf, animasi ngocok, reveal huruf, efek suara
└── README.md
```

## 🧠 Catatan Teknis

- **Mau ganti daftar huruf?** Edit satu baris di `app.js`:
  ```js
  const LETTERS = ["A", "B", "C", "G", "K", "L", "M", "O", "P", "S", "T"];
  ```
  Jumlah tile di papan otomatis ikut menyesuaikan, dan keyboard juga otomatis menolak huruf yang tidak ada di daftar.
- Tile dibuat sebagai `<div>` (bukan tombol) dan papannya `aria-hidden` karena murni dekorasi — hasilnya diumumkan lewat elemen `#result` yang `aria-live="polite"` dan disembunyikan secara visual (`.sr-only`).
- Huruf yang sama tidak akan muncul dua kali berturut-turut.
- **Animasi ngocok**: 12 lompatan dengan jeda yang membesar secara eksponensial (`45ms` → `~265ms`) sehingga terasa seperti roda berputar yang melambat. Selama proses ini tombol dinonaktifkan supaya tidak bisa di-spin ganda.
- **Huruf menetap** karena `.letter-big.show` memakai animasi `letterReveal` dengan `animation-fill-mode: forwards` yang berakhir di `opacity: 1` (bukan memudar), lalu dilanjutkan `bigGlow` tanpa batas.
- Ukuran huruf besar pakai `42cqw` (container query unit, mengikuti lebar papan) dengan fallback `22vw` untuk browser lama.
- Animasi `pop` dan `letterReveal` dipicu ulang dengan trik *force reflow* (`void el.offsetWidth`).
- Efek suara baru aktif **setelah interaksi pertama** (aturan autoplay browser), dan dibuat murni dengan `OscillatorNode` + noise buffer.
- Font `Creepster` diambil dari Google Fonts; tanpa internet otomatis jatuh ke font `cursive`.
- Menghormati `prefers-reduced-motion` — kalau opsi itu aktif di OS, animasi ngocok dimatikan dan huruf langsung ditampilkan.

Selamat Halloween! 🎃👻🕷️
