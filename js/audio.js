(function (global) {
  'use strict';

  const STORAGE_KEY = 'pelicanBikeMuted';
  const AudioCtx = global.AudioContext || global.webkitAudioContext;

  let ctx = null;
  let muted = false;

  try {
    muted = global.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_) {
    muted = false;
  }

  function ensureContext() {
    if (muted || !AudioCtx) return null;
    if (!ctx) {
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function isMuted() {
    return muted;
  }

  function setMuted(nextMuted) {
    muted = Boolean(nextMuted);
    try {
      global.localStorage.setItem(STORAGE_KEY, String(muted));
    } catch (_) {}
    return muted;
  }

  function toggleMute() {
    return setMuted(!muted);
  }

  function unlock() {
    if (muted || !AudioCtx) return;
    if (!ctx) {
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
  }

  function playJump() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.11);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.125);

    // Soft filtered noise puff for wing flap
    const sampleCount = Math.floor(ac.sampleRate * 0.07);
    const buffer = ac.createBuffer(1, sampleCount, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }

    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.Q.setValueAtTime(1.2, now);

    const nGain = ac.createGain();
    nGain.gain.setValueAtTime(0.05, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ac.destination);
    noise.start(now);
  }

  function playDuck() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(170, now + 0.065);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  function playMilestone() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;

    const notes = [
      { freq: 987.77, start: 0, dur: 0.075 },
      { freq: 1318.51, start: 0.07, dur: 0.17 }
    ];

    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.linearRampToValueAtTime(0.05, now + n.start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.01);
    }
  }

  function triggerBellRing(ac, startTime, duration) {
    const partials = [
      { freq: 2180, amp: 0.075 },
      { freq: 4360, amp: 0.032 },
      { freq: 5890, amp: 0.016 }
    ];
    for (let i = 0; i < partials.length; i++) {
      const p = partials[i];
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(p.amp, startTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    }
  }

  function playBikeBell() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    triggerBellRing(ac, now, 0.24);
    triggerBellRing(ac, now + 0.115, 0.34);
  }

  function playCrash() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(72, now + 0.14);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    // Dull tire thump
    const thump = ac.createOscillator();
    const tGain = ac.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(110, now);
    thump.frequency.exponentialRampToValueAtTime(42, now + 0.12);
    tGain.gain.setValueAtTime(0.14, now);
    tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    thump.connect(tGain);
    tGain.connect(ac.destination);
    thump.start(now);
    thump.stop(now + 0.14);
  }

  function playVictory() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5];

    for (let i = 0; i < arpeggio.length; i++) {
      const start = now + i * 0.085;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(arpeggio[i], start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    }

    triggerBellRing(ac, now + 0.36, 0.22);
    triggerBellRing(ac, now + 0.48, 0.34);
  }

  function playGeminiPowerup() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1318.51];

    for (let i = 0; i < notes.length; i++) {
      const start = now + i * 0.055;
      const osc = ac.createOscillator();
      const shimmer = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      shimmer.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], start);
      shimmer.frequency.setValueAtTime(notes[i] * 2, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.075, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

      osc.connect(gain);
      shimmer.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      shimmer.start(start);
      osc.stop(start + 0.23);
      shimmer.stop(start + 0.23);
    }
  }

  function playCollectG(step) {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;

    if (step >= 3) {
      const fanfare = [783.99, 987.77, 1174.66, 1567.98];
      for (let i = 0; i < fanfare.length; i++) {
        const start = now + i * 0.065;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(fanfare[i], start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.085, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      }
      return;
    }

    const freq = step === 2 ? 987.77 : 783.99;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + 0.09);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.085, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  function playObstacleSmash() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.085);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    const sampleCount = Math.floor(ac.sampleRate * 0.045);
    const buffer = ac.createBuffer(1, sampleCount, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const nGain = ac.createGain();
    nGain.gain.setValueAtTime(0.06, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    noise.connect(nGain);
    nGain.connect(ac.destination);
    noise.start(now);
  }

  function playRevive() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const notes = [392.0, 523.25, 659.25, 783.99];

    for (let i = 0; i < notes.length; i++) {
      const start = now + i * 0.06;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.21);
    }

    triggerBellRing(ac, now + 0.25, 0.28);
  }

  global.PelicanGame = global.PelicanGame || {};
  global.PelicanGame.Audio = {
    isMuted: isMuted,
    setMuted: setMuted,
    toggleMute: toggleMute,
    unlock: unlock,
    playJump: playJump,
    playDuck: playDuck,
    playMilestone: playMilestone,
    playBikeBell: playBikeBell,
    playCrash: playCrash,
    playVictory: playVictory,
    playGeminiPowerup: playGeminiPowerup,
    playCollectG: playCollectG,
    playObstacleSmash: playObstacleSmash,
    playRevive: playRevive
  };
})(window);
