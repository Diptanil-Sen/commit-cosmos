// soundEngine.js — Web Audio API tonal pings for commit events
// Each planet gets a unique pitch from a pentatonic scale so nothing sounds dissonant

let ctx = null;
let enabled = false;

// Pentatonic scale frequencies (Hz) — cycling through for each planet index
const PENTATONIC = [
  261.63, 293.66, 329.63, 392.0, 440.0,   // C4 D4 E4 G4 A4
  523.25, 587.33, 659.25, 783.99, 880.0,  // C5 D5 E5 G5 A5
  1046.5, 1174.7, 1318.5                   // C6 D6 E6
];

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function setSoundEnabled(val) {
  enabled = val;
  // Resume context on first user gesture (browser autoplay policy)
  if (val && ctx && ctx.state === 'suspended') ctx.resume();
  if (val && !ctx) getCtx();
}

export function isSoundEnabled() {
  return enabled;
}

// planetIndex: 0-based index so each repo has a consistent pitch
export function pingCommit(planetIndex = 0, volume = 0.18) {
  if (!enabled) return;
  const audioCtx = getCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const freq = PENTATONIC[planetIndex % PENTATONIC.length];
  const now = audioCtx.currentTime;

  // Oscillator: sine wave for clean tonal ping
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.4);

  // Gain envelope: quick attack, gentle decay
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  // Optional shimmer: second osc one octave up at low volume
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, now);
  const gain2 = audioCtx.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain).connect(audioCtx.destination);
  osc2.connect(gain2).connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
  osc2.start(now);
  osc2.stop(now + 0.4);
}

// Whoosh sound for loading/intro
export function pingLoad() {
  if (!enabled) return;
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.6);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.8);
}
