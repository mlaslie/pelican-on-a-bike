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
    if (muted) {
      stopEndingMusic();
    }
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

  function playBirdSquawk() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;

    // Nasal bandpass filter for authentic cartoon bird squawk timbre
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1650, now);
    filter.frequency.exponentialRampToValueAtTime(920, now + 0.22);
    filter.Q.setValueAtTime(3.2, now);

    // Main squawk voice with pitch spike & distressed drop
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(1680, now + 0.045);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.23);

    // Fast vibrato LFO for ruffled bird warble
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(30, now);
    lfoGain.gain.setValueAtTime(95, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.25);
    lfo.stop(now + 0.25);
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

  // Classic joyful 1-UP / Respawn Unlocked arcade fanfare (E5-G5-E6-C6-D6-G6)
  function playRespawnUnlocked() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const notes = [659.25, 783.99, 1318.51, 1046.5, 1174.66, 1567.98];

    for (let i = 0; i < notes.length; i++) {
      const start = now + i * 0.068;
      const dur = i === notes.length - 1 ? 0.28 : 0.11;
      const osc = ac.createOscillator();
      const harm = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], start);
      harm.type = 'sine';
      harm.frequency.setValueAtTime(notes[i] * 2, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.11, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      const hGain = ac.createGain();
      hGain.gain.setValueAtTime(0.032, start);
      hGain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      harm.connect(hGain);
      gain.connect(ac.destination);
      hGain.connect(ac.destination);

      osc.start(start);
      harm.start(start);
      osc.stop(start + dur + 0.015);
      harm.stop(start + dur + 0.015);
    }
  }

  // Retro Atari / 8-bit arcade victory chiptune loop for End of the Earth
  let endingTimer = null;
  let endingNodes = [];

  function stopEndingMusic() {
    if (endingTimer !== null) {
      global.clearTimeout(endingTimer);
      endingTimer = null;
    }
    for (let i = 0; i < endingNodes.length; i++) {
      try {
        endingNodes[i].stop();
      } catch (_) {}
      try {
        endingNodes[i].disconnect();
      } catch (_) {}
    }
    endingNodes = [];
  }

  function scheduleAtariBar(ac, startTime) {
    // Classic uplifting C-major -> G -> Am -> F -> G -> C 8-bit arcade ending melody
    const step = 0.135;
    const lead = [
      // Bar 1 (C major fanfare)
      [0, 523.25, 1], [1, 659.25, 1], [2, 783.99, 1], [3, 1046.5, 2],
      [5, 783.99, 1], [6, 880.0, 1], [7, 783.99, 1],
      // Bar 2 (G major)
      [8, 659.25, 2], [10, 587.33, 1], [11, 659.25, 1], [12, 783.99, 3],
      // Bar 3 (A minor -> F major heroic climb)
      [16, 880.0, 1], [17, 783.99, 1], [18, 659.25, 1], [19, 523.25, 1],
      [20, 698.46, 2], [22, 880.0, 2],
      // Bar 4 (G7 -> C triumphant resolve + arpeggio flourish)
      [24, 783.99, 1], [25, 659.25, 1], [26, 587.33, 1], [27, 783.99, 1],
      [28, 1046.5, 3], [31, 1318.51, 1],
      // Bar 5 (Sparkling Atari starlight bridge)
      [32, 1174.66, 1], [33, 1046.5, 1], [34, 880.0, 1], [35, 1046.5, 1],
      [36, 987.77, 2], [38, 783.99, 2],
      // Bar 6 (Warm nostalgic turnaround)
      [40, 698.46, 1], [41, 783.99, 1], [42, 880.0, 1], [43, 1046.5, 1],
      [44, 1174.66, 2], [46, 1046.5, 1], [47, 987.77, 1],
      // Bar 7 (Grand finale cadence)
      [48, 1046.5, 2], [50, 783.99, 1], [51, 659.25, 1],
      [52, 783.99, 2], [54, 1046.5, 2],
      [56, 1318.51, 4], [60, 1046.5, 4]
    ];

    const bass = [
      [0, 130.81, 4], [4, 164.81, 4], [8, 196.0, 4], [12, 146.83, 4],
      [16, 220.0, 4], [20, 174.61, 4], [24, 196.0, 4], [28, 130.81, 4],
      [32, 174.61, 4], [36, 196.0, 4], [40, 174.61, 4], [44, 196.0, 4],
      [48, 130.81, 4], [52, 196.0, 4], [56, 130.81, 4], [60, 130.81, 4]
    ];

    for (let i = 0; i < lead.length; i++) {
      const s = lead[i][0];
      const freq = lead[i][1];
      const len = lead[i][2] * step * 0.88;
      const t0 = startTime + s * step;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.042, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + len);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + len + 0.015);
      endingNodes.push(osc);
    }

    for (let i = 0; i < bass.length; i++) {
      const s = bass[i][0];
      const freq = bass[i][1];
      const len = bass[i][2] * step * 0.92;
      const t0 = startTime + s * step;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.075, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + len);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + len + 0.02);
      endingNodes.push(osc);
    }

    return 64 * step;
  }

  function playAtariEndingMusic() {
    stopEndingMusic();
    const ac = ensureContext();
    if (!ac) return;
    function loop() {
      if (muted) {
        stopEndingMusic();
        return;
      }
      const ctxNow = ensureContext();
      if (!ctxNow) return;
      endingNodes = [];
      const dur = scheduleAtariBar(ctxNow, ctxNow.currentTime + 0.04);
      endingTimer = global.setTimeout(loop, Math.round(dur * 1000));
    }
    loop();
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
    playBirdSquawk: playBirdSquawk,
    playRevive: playRevive,
    playRespawnUnlocked: playRespawnUnlocked,
    playAtariEndingMusic: playAtariEndingMusic,
    stopEndingMusic: stopEndingMusic
  };
})(window);
