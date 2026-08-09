/* ============================================================
   sounds.js — tiny chiptune synth (Web Audio API)
   ------------------------------------------------------------
   No audio files! Every sound is synthesized from scratch:
   an oscillator (the "instrument") + a gain envelope (how
   loud, and for how long). Square waves = retro blips,
   triangle waves = softer and warmer.
   ============================================================ */

let ctx = null;
let muted = false;

// Lazily create the audio context. Browsers won't play sound
// until the user has interacted with the page, so we create
// (and resume) the context on the first click.
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null; // no audio support in this browser — stay quiet
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function setMuted(m) {
  muted = m;
}
function isMuted() {
  return muted;
}

// Play one note: frequency (Hz), delay before it starts,
// duration, volume, and waveform ('square' = chiptune).
function note(freq, start, dur, vol = 0.14, type = 'square') {
  if (muted) return;
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  // the envelope: quick attack up, then decay back to silence
  const t = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// play a little melody: an array of note frequencies, one after another
function melody(notes, step, dur, vol, type, offset = 0) {
  notes.forEach((f, i) => note(f, offset + i * step, dur, vol, type));
}

// ☕ coin blip when you earn beans (B5 -> E6, a happy "up" leap)
function playCoin() {
  melody([988, 1319], 0.09, 0.14, 0.13);
}

// 🛒 happy arpeggio when you buy a drink (C E G C)
function playPurchase() {
  melody([523, 659, 784, 1047], 0.11, 0.2, 0.14);
}

// ⏰ soft alarm when a session ends — a gentle chime, twice
function playAlarm() {
  melody([659, 784, 988], 0.16, 0.4, 0.1, 'triangle', 0);
  melody([659, 784, 988], 0.16, 0.4, 0.1, 'triangle', 0.9);
}

// unlock audio on the very first click anywhere
document.addEventListener('click', () => getCtx(), { once: true });
