export function triggerHaptic(ms = 12) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms);
    }
  } catch {
    // ignore in unsupported browsers
  }
}

let audioCtx: AudioContext | null = null;
let songInterval: number | null = null;

export function playTone(freq = 440, durationMs = 140, type: OscillatorType = 'sine', volume = 0.08) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + durationMs / 1000);
  } catch {
    // ignore audio block
  }
}

export function startBeatPreview(baseFreq = 293.66, bpm = 96) {
  stopBeatPreview();
  const stepMs = Math.max(220, Math.round((60 / bpm) * 1000));
  const notes = [1, 1.125, 1.25, 1.5, 1.25, 1.125];
  let idx = 0;
  playTone(baseFreq, 180, 'triangle', 0.09);
  songInterval = window.setInterval(() => {
    idx = (idx + 1) % notes.length;
    playTone(baseFreq * notes[idx], 170, 'triangle', 0.07);
  }, stepMs);
}

export function stopBeatPreview() {
  if (songInterval !== null) {
    window.clearInterval(songInterval);
    songInterval = null;
  }
}

export function playGiftChime() {
  playTone(523.25, 130, 'triangle', 0.09);
  setTimeout(() => playTone(659.25, 150, 'triangle', 0.09), 90);
  setTimeout(() => playTone(783.99, 220, 'triangle', 0.1), 180);
}

export function playBirthdaySong() {
  const melody: [number, number][] = [
    [261.63, 0],
    [261.63, 220],
    [293.66, 440],
    [261.63, 760],
    [349.23, 1080],
    [329.63, 1400],
    [261.63, 1950],
    [261.63, 2170],
    [293.66, 2390],
    [261.63, 2710],
    [392.0, 3030],
    [349.23, 3350],
  ];
  melody.forEach(([freq, delay]) => {
    setTimeout(() => playTone(freq, 260, 'triangle', 0.09), delay);
  });
}

export function playMysteryOpenSound() {
  playTone(392.0, 120, 'sine', 0.08);
  setTimeout(() => playTone(523.25, 150, 'triangle', 0.09), 110);
  setTimeout(() => playTone(783.99, 260, 'triangle', 0.11), 230);
  setTimeout(() => playTone(1046.5, 320, 'sine', 0.1), 360);
}

