# 🎃 Halloween Alphabet Generator

Generator alfabet **A–Z** sederhana bertema Halloween. Semua huruf tampil di grid, lalu **satu huruf di-highlight secara acak** dengan animasi.

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
| 🔤 Grid A–Z | 26 huruf kapital ditampilkan di grid responsif |
| 🎰 Highlight berjalan | Saat diacak, highlight melompat-lompat antar huruf sambil **melambat**, lalu berhenti |
| 🎯 Highlight random | Huruf terpilih membesar, menyala oranye, dan melayang |
| 💥 Animasi pop | Tiap huruf baru muncul dengan animasi "pop" + putaran + percikan cahaya |
| 🅰️ Pop up huruf | Setelah highlight berhenti, huruf muncul besar di tengah papan selama **2 detik** |
| 👻 Penanda | Hantu kecil nongol di sudut huruf terpilih |
| 🎲 Tombol Acak | Atau tekan tombol **Spasi** / **Enter** |
| ⌨️ Pilih manual | Klik huruf mana pun (atau tekan tombol huruf di keyboard) untuk memilihnya |
| 🔊 Bunyi "klek" | Efek suara dibuat pakai Web Audio API, tanpa file audio |
| 🌫️ Dekorasi | 🎃🦇👻🕷️ berjatuhan di latar belakang |
| 📊 Info | Huruf terpilih + total berapa kali sudah diacak di bagian bawah |

## 📁 Struktur

```
Letter Generator/
├── index.html   → grid A–Z + panel tombol
├── style.css    → desain Halloween + semua animasi
├── app.js       → logika acak, animasi roulette, pop up, efek suara
└── README.md
```

## 🧠 Catatan Teknis

- Huruf dibangkitkan dari kode ASCII (`65`–`90`) sehingga tidak perlu daftar manual.
- Huruf yang sama tidak akan muncul dua kali berturut-turut.
- **Animasi highlight berjalan**: 12 lompatan dengan jeda yang membesar secara eksponensial (`45ms` → `~265ms`) sehingga terasa seperti roda berputar yang melambat. Selama proses ini tombol dinonaktifkan supaya tidak bisa di-spin ganda.
- **Durasi pop up** diatur di dua tempat dan harus sama: `BURST_MS = 2000` di `app.js` dan `animation: burstPop 2s` di `style.css`.
- Animasi `pop` dipicu ulang dengan trik *force reflow* (`void tile.offsetWidth`) supaya tetap main walau hurufnya sama-sama kelas `active`.
- Efek suara baru aktif **setelah interaksi pertama** (aturan autoplay browser), dan dibuat murni dengan `OscillatorNode` + noise buffer.
- Font `Creepster` diambil dari Google Fonts; tanpa internet otomatis jatuh ke font `cursive`.
- Menghormati `prefers-reduced-motion` — kalau opsi itu aktif di OS, roulette dan pop up otomatis dimatikan dan huruf langsung ditampilkan.

Selamat Halloween! 🎃👻🕷️
