/* =========================================================
   Halloween Alphabet Generator — app.js
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   1. Data & state
   --------------------------------------------------------- */

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const BURST_MS = 2000; // durasi pop up, harus sama dengan animasi burstPop di style.css

const state = {
  current: null,      // huruf yang sedang di-highlight
  count: 0,           // total berapa kali diacak
  sound: true,
};

/* ---------------------------------------------------------
   2. DOM
   --------------------------------------------------------- */

const $ = (id) => document.getElementById(id);

const el = {
  grid: $("grid"),
  btnPick: $("btnPick"),
  toggleSound: $("toggleSound"),
  result: $("result"),
  count: $("count"),
  toast: $("toast"),
  decor: $("decor"),
  burst: $("burst"),
  burstLetter: $("burstLetter"),
};

/* ---------------------------------------------------------
   3. Utilitas
   --------------------------------------------------------- */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

let toastTimer;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 1500);
}

/* ---------------------------------------------------------
   4. Bunyi "klek" (Web Audio, tanpa file)
   --------------------------------------------------------- */

let audioCtx = null;
let userInteracted = false;

// AudioContext hanya boleh dibuat setelah ada interaksi user
function unlockAudio() {
  userInteracted = true;
  if (state.sound) playKlek._warm();
}
playKlek._warm = () => {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  } catch { /* abaikan */ }
};

function playKlek() {
  if (!state.sound || !userInteracted) return;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;

    // nada pendek menurun
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.16);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    // "ketukan" logam singkat
    const noiseLen = Math.floor(audioCtx.sampleRate * 0.05);
    const buffer = audioCtx.createBuffer(1, noiseLen, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(0.12, t);
    nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    noise.connect(nGain).connect(audioCtx.destination);
    noise.start(t);
  } catch {
    /* audio tidak tersedia — abaikan */
  }
}

/* ---------------------------------------------------------
   5. Membangun grid A-Z
   --------------------------------------------------------- */

function buildGrid() {
  el.grid.innerHTML = "";
  ALPHABET.forEach((letter) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "letter";
    tile.dataset.letter = letter;
    tile.textContent = letter;
    tile.setAttribute("aria-label", "Huruf " + letter);
    // klik manual: pilih huruf ini
    tile.addEventListener("click", () => {
      if (spinning) return;
      select(letter, { manual: true });
    });
    el.grid.appendChild(tile);
  });
}

/* ---------------------------------------------------------
   6. Memilih huruf
   --------------------------------------------------------- */

const reduceMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SPIN_STEPS = 12;   // jumlah lompatan highlight
const SPIN_FAST = 45;    // jeda awal (ms)
const SPIN_SLOW = 220;   // tambahan jeda di akhir (ms)

let spinning = false;
let spinTimer = null;
let burstTimer = null;

function tileOf(letter) {
  return el.grid.querySelector(`.letter[data-letter="${letter}"]`);
}

function clearSpinHighlight() {
  el.grid.querySelectorAll(".letter.spin").forEach((t) => t.classList.remove("spin"));
}

/* --- pilih huruf final + animasi pop --- */
function select(letter, { manual = false, silent = false, burst = false } = {}) {
  const tile = tileOf(letter);
  if (!tile) return;

  // bersihkan highlight sebelumnya
  el.grid.querySelectorAll(".letter.active").forEach((t) => {
    t.classList.remove("active", "pop");
  });
  clearSpinHighlight();
  el.grid.classList.remove("spinning");

  state.current = letter;
  tile.classList.add("active");
  el.grid.classList.add("has-active");

  // paksa animasi "pop" main ulang
  tile.classList.remove("pop");
  void tile.offsetWidth; // reflow
  tile.classList.add("pop");
  tile.addEventListener("animationend", function onEnd(e) {
    if (e.animationName === "pop") {
      tile.classList.remove("pop");
      tile.removeEventListener("animationend", onEnd);
    }
  });

  // pop up huruf besar
  if (burst) showBurst(letter);
  else hideBurst(); // jangan biarkan pop up huruf lama menempel

  // update info
  if (!manual) {
    state.count++;
    el.count.textContent = state.count;
  }
  el.result.textContent = letter;

  if (!manual && !silent) playKlek();
  if (manual) toast("Kamu pilih huruf " + letter);
}

/* --- pop up huruf besar di tengah papan --- */
function hideBurst() {
  clearTimeout(burstTimer);
  burstTimer = null;
  el.burst.classList.remove("show");
}

function showBurst(letter) {
  hideBurst();
  el.burstLetter.textContent = letter;
  void el.burst.offsetWidth; // reflow agar animasi main ulang
  el.burst.classList.add("show");

  burstTimer = setTimeout(() => el.burst.classList.remove("show"), BURST_MS);
}

/* --- animasi highlight berjalan, melambat, lalu berhenti --- */
function spinTo(target, { silent = false } = {}) {
  spinning = true;
  el.btnPick.disabled = true;
  el.btnPick.classList.add("busy");
  hideBurst(); // bersihkan pop up lama sebelum highlight berjalan

  // matikan highlight lama, aktifkan mode spinning
  el.grid.querySelectorAll(".letter.active").forEach((t) => t.classList.remove("active", "pop"));
  el.grid.classList.remove("has-active");
  el.grid.classList.add("spinning");

  let i = 0;

  const tick = () => {
    if (i >= SPIN_STEPS) {
      stop();
      return;
    }
    // lompatan terakhir mendarat di huruf target
    const isLast = i === SPIN_STEPS - 1;
    const letter = isLast ? target : pick(ALPHABET);

    clearSpinHighlight();
    const t = tileOf(letter);
    if (t) t.classList.add("spin");

    // makin ke belakang makin lambat
    const progress = i / (SPIN_STEPS - 1);
    const delay = SPIN_FAST + Math.pow(progress, 2.6) * SPIN_SLOW;
    i++;
    spinTimer = setTimeout(tick, delay);
  };

  const stop = () => {
    spinning = false;
    el.btnPick.disabled = false;
    el.btnPick.classList.remove("busy");
    select(target, { silent, burst: true });
  };

  tick();
}

/* --- acak: jalankan animasi highlight berjalan lalu reveal --- */
function shuffle({ silent = false } = {}) {
  if (spinning) return;

  // hindari mengulang huruf yang sama dua kali berturut-turut
  let next = pick(ALPHABET);
  if (ALPHABET.length > 1) {
    let guard = 0;
    while (next === state.current && guard++ < 20) next = pick(ALPHABET);
  }

  if (reduceMotion) select(next, { silent });
  else spinTo(next, { silent });
}

/* ---------------------------------------------------------
   7. Dekorasi terbang
   --------------------------------------------------------- */

const DECOR = ["🎃", "🦇", "👻", "🕷️", "🕸️", "💀", "🌙", "⚰️", "🪦"];

function buildDecorations() {
  el.decor.innerHTML = "";
  const count = window.innerWidth < 700 ? 8 : 14;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = pick(DECOR);
    const dur = 9 + Math.random() * 12;
    s.style.left = Math.random() * 98 + "%";
    s.style.fontSize = 16 + Math.random() * 26 + "px";
    s.style.opacity = (0.3 + Math.random() * 0.55).toFixed(2);
    s.style.animationDuration = `${dur.toFixed(1)}s, ${(2.5 + Math.random() * 2.5).toFixed(1)}s`;
    s.style.animationDelay = `${(-dur).toFixed(1)}s, 0s`;
    el.decor.appendChild(s);
  }
}

/* ---------------------------------------------------------
   8. Event
   --------------------------------------------------------- */

el.btnPick.addEventListener("click", shuffle);

el.toggleSound.addEventListener("change", (e) => {
  state.sound = e.target.checked;
  toast(state.sound ? "Bunyi aktif 🔊" : "Bunyi mati 🔇");
});

document.addEventListener("keydown", (e) => {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;

  unlockAudio();

  // Spasi / Enter = acak
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    shuffle();
    return;
  }
  // huruf A-Z = pilih huruf itu
  const k = e.key.toUpperCase();
  if (!spinning && k.length === 1 && k >= "A" && k <= "Z") {
    select(k, { manual: true });
  }
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildDecorations, 400);
});

/* ---------------------------------------------------------
   9. Inisialisasi
   --------------------------------------------------------- */

buildGrid();
buildDecorations();
shuffle({ silent: true }); // langsung tampilkan animasi saat halaman dibuka

// buka izin audio pada interaksi pertama
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
