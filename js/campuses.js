(function (global) {
  'use strict';

  const STAGE_W = 960;
  const STAGE_H = 340;
  const GROUND_Y = 282;
  const CAMPUS_SPAN = 350;
  const TOUR_FINISH = 2100;
  const SECRET_FINISH = 3150;
  const TRANSITION_PTS = 45;
  const PIXELS_PER_PT = 1 / 0.048;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function lerpHexColor(hexA, hexB, t) {
    const k = clamp(t, 0, 1);
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const r = Math.round(lerp(a.r, b.r, k));
    const g = Math.round(lerp(a.g, b.g, k));
    const bl = Math.round(lerp(a.b, b.b, k));
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  function modPositive(n, m) {
    return ((n % m) + m) % m;
  }

  const LIST = [
    {
      id: 'sydney',
      code: 'SYD',
      difficulty: 1,
      difficultyLabel: 'LVL 1 · EASY',
      name: 'Sydney, Australia',
      shortName: 'Sydney',
      city: 'Sydney',
      landmark: 'Pyrmont & Darling Harbour',
      badgeColor: '#00ACC1',
      startScore: 0,
      endScore: 350,
      palette: {
        skyTop: '#56b5f7',
        skyMid: '#b0e2ff',
        skyHorizon: '#eff9ff',
        sunX: 785,
        sunY: 66,
        sunColor: '#fff4ad',
        sunGlow: '#ffe066',
        cloudFill: '#ffffff',
        farRidge: '#7fb3d5',
        nearRidge: '#5d98bf',
        roadFill: '#7a7874',
        curbFill: '#e2d7c5',
        laneFill: '#0097a7',
        laneStripe: '#e0f7fa',
        edgeAccent: '#58a46c',
        starsAlpha: 0
      }
    },
    {
      id: 'zurich',
      code: 'ZRH',
      difficulty: 2,
      difficultyLabel: 'LVL 2',
      name: 'Zurich, Switzerland',
      shortName: 'Zurich',
      city: 'Zurich',
      landmark: 'Hürlimann Areal',
      badgeColor: '#34A853',
      startScore: 350,
      endScore: 700,
      palette: {
        skyTop: '#243a69',
        skyMid: '#5f77a8',
        skyHorizon: '#f0b28e',
        sunX: 165,
        sunY: 158,
        sunColor: '#ffd99e',
        sunGlow: '#f5987e',
        cloudFill: '#d8cfe3',
        farRidge: '#56688f',
        nearRidge: '#415275',
        roadFill: '#4d5460',
        curbFill: '#bfc6ce',
        laneFill: '#4d5460',
        laneStripe: '#fbbc04',
        edgeAccent: '#3b6a4f',
        starsAlpha: 0.72
      }
    },
    {
      id: 'london',
      code: 'LDN',
      difficulty: 3,
      difficultyLabel: 'LVL 3',
      name: 'London, UK',
      shortName: 'London',
      city: 'London',
      landmark: "King's Cross Landscraper",
      badgeColor: '#EA4335',
      startScore: 700,
      endScore: 1050,
      palette: {
        skyTop: '#83acd4',
        skyMid: '#c4dbf0',
        skyHorizon: '#eef3f8',
        sunX: 700,
        sunY: 82,
        sunColor: '#fff6cc',
        sunGlow: '#f9e39b',
        cloudFill: '#f9fbfe',
        farRidge: '#98a9bc',
        nearRidge: '#7c8ea3',
        roadFill: '#747b84',
        curbFill: '#cfd5dc',
        laneFill: '#3b78b8',
        laneStripe: '#f1f5f9',
        edgeAccent: '#588157',
        starsAlpha: 0
      }
    },
    {
      id: 'new-york',
      code: 'NYC',
      difficulty: 4,
      difficultyLabel: 'LVL 4',
      name: 'New York, USA',
      shortName: 'New York',
      city: 'New York',
      landmark: "Pier 57 & St. John's Terminal",
      badgeColor: '#F57C00',
      startScore: 1050,
      endScore: 1400,
      palette: {
        skyTop: '#5c95d6',
        skyMid: '#b5d4f1',
        skyHorizon: '#ffe4c4',
        sunX: 195,
        sunY: 112,
        sunColor: '#ffe7a6',
        sunGlow: '#ffba75',
        cloudFill: '#fff6eb',
        farRidge: '#798da8',
        nearRidge: '#60738e',
        roadFill: '#555c66',
        curbFill: '#c9cfd6',
        laneFill: '#2e8b57',
        laneStripe: '#eef7f0',
        edgeAccent: '#4f8a57',
        starsAlpha: 0.08
      }
    },
    {
      id: 'tokyo',
      code: 'TYO',
      difficulty: 5,
      difficultyLabel: 'LVL 5',
      name: 'Tokyo, Japan',
      shortName: 'Tokyo',
      city: 'Tokyo',
      landmark: 'Shibuya Stream',
      badgeColor: '#9334E6',
      startScore: 1400,
      endScore: 1750,
      palette: {
        skyTop: '#4e5d9e',
        skyMid: '#d5897d',
        skyHorizon: '#ffcf98',
        sunX: 810,
        sunY: 162,
        sunColor: '#ffe39c',
        sunGlow: '#ff9e6d',
        cloudFill: '#ffd9c2',
        farRidge: '#6f6c8f',
        nearRidge: '#575478',
        roadFill: '#5d6470',
        curbFill: '#c7cdd4',
        laneFill: '#f2c138',
        laneStripe: '#fff5cc',
        edgeAccent: '#486b5a',
        starsAlpha: 0.25
      }
    },
    {
      id: 'mountain-view',
      code: 'MTV',
      difficulty: 6,
      difficultyLabel: 'LVL 6 · HARDEST',
      name: 'Mountain View, CA',
      shortName: 'Mountain View',
      city: 'Mountain View',
      landmark: 'Bay View & Googleplex',
      badgeColor: '#4285F4',
      startScore: 1750,
      endScore: 2100,
      palette: {
        skyTop: '#6cb2f7',
        skyMid: '#b6dcfe',
        skyHorizon: '#eef7ff',
        sunX: 790,
        sunY: 70,
        sunColor: '#fff2a6',
        sunGlow: '#ffe066',
        cloudFill: '#ffffff',
        farRidge: '#89af9e',
        nearRidge: '#6a9883',
        roadFill: '#6b727a',
        curbFill: '#d9dee3',
        laneFill: '#42a362',
        laneStripe: '#eef7f0',
        edgeAccent: '#65a862',
        starsAlpha: 0
      }
    },
    {
      id: 'cloud-tpu',
      code: 'CLD',
      difficulty: 7,
      difficultyLabel: 'LVL 7 · SECRET',
      isSecret: true,
      name: 'The Cloud · TPU Pod',
      shortName: 'The Cloud',
      city: 'Google Cloud',
      landmark: 'TPU Data Center',
      badgeColor: '#00E5FF',
      startScore: 2100,
      endScore: 2450,
      palette: {
        skyTop: '#070c1a',
        skyMid: '#0e1933',
        skyHorizon: '#16284a',
        sunX: 780,
        sunY: 72,
        sunColor: '#7ef9ff',
        sunGlow: '#4285f4',
        cloudFill: '#1e355e',
        farRidge: '#132447',
        nearRidge: '#1c335e',
        roadFill: '#1b2230',
        curbFill: '#3b4a63',
        laneFill: '#1558b0',
        laneStripe: '#7ef9ff',
        edgeAccent: '#00e5ff',
        starsAlpha: 0.45,
        noSun: true
      }
    },
    {
      id: 'moonshot-moon',
      code: 'MOON',
      difficulty: 8,
      difficultyLabel: 'LVL 8 · SECRET',
      isSecret: true,
      name: 'Google X → The Moon',
      shortName: 'The Moon',
      city: 'Lunar Surface',
      landmark: 'Moonshot Factory',
      badgeColor: '#B388FF',
      startScore: 2450,
      endScore: 2800,
      palette: {
        skyTop: '#040611',
        skyMid: '#090e24',
        skyHorizon: '#141d38',
        sunX: 760,
        sunY: 96,
        sunColor: '#4fc3f7',
        sunGlow: '#1a73e8',
        cloudFill: '#1f2b4d',
        farRidge: '#464d5e',
        nearRidge: '#616878',
        roadFill: '#6e7480',
        curbFill: '#b8bec9',
        laneFill: '#555c69',
        laneStripe: '#e2e6ee',
        edgeAccent: '#9aa0a6',
        starsAlpha: 0.95,
        noSun: true
      }
    },
    {
      id: 'dino-desert',
      code: 'DINO',
      difficulty: 9,
      difficultyLabel: 'LVL 9 · SECRET',
      isSecret: true,
      name: 'Chrome Dino Desert',
      shortName: 'Dino Desert',
      city: 'Offline Mode',
      landmark: 'ERR_INTERNET_DISCONNECTED',
      badgeColor: '#535353',
      startScore: 2800,
      endScore: 3150,
      palette: {
        skyTop: '#f7f7f7',
        skyMid: '#f7f7f7',
        skyHorizon: '#f7f7f7',
        sunX: 790,
        sunY: 66,
        sunColor: '#dcdcdc',
        sunGlow: '#ececec',
        cloudFill: '#dcdcdc',
        farRidge: '#d5d5d5',
        nearRidge: '#bdbdbd',
        roadFill: '#f7f7f7',
        curbFill: '#535353',
        laneFill: '#efefef',
        laneStripe: '#535353',
        edgeAccent: '#535353',
        starsAlpha: 0,
        noSun: true
      }
    }
  ];

  function getCampusById(id) {
    for (let i = 0; i < LIST.length; i++) {
      if (LIST[i].id === id) return LIST[i];
    }
    return LIST[0];
  }

  function isDinoNight(score) {
    if (score < 2800) return false;
    return Math.floor((score - 2800) / 100) % 2 === 1;
  }

  function getCampusState(score, endlessMode) {
    const totalSpan = SECRET_FINISH;
    const maxCount = LIST.length;
    const wrappedScore = endlessMode ? modPositive(score, totalSpan) : clamp(score, 0, totalSpan - 0.001);
    const idx = Math.min(maxCount - 1, Math.floor(wrappedScore / CAMPUS_SPAN));
    const current = LIST[idx];
    const nextIdx = (idx + 1) % maxCount;
    const next = LIST[nextIdx];
    const localScore = wrappedScore - current.startScore;
    const remaining = CAMPUS_SPAN - localScore;

    let blend = 0;
    const allowBlendNext = endlessMode || idx < maxCount - 1;
    if (allowBlendNext && remaining < TRANSITION_PTS) {
      blend = clamp(1 - remaining / TRANSITION_PTS, 0, 1);
    }

    const cycleIndex = endlessMode ? Math.floor(score / totalSpan) : 0;
    return {
      current: current,
      next: next,
      blend: blend,
      index: idx,
      cycleIndex: cycleIndex,
      dinoNight: current.id === 'dino-desert' && isDinoNight(wrappedScore)
    };
  }

  function drawSkyAndSun(ctx, pA, pB, t, timeSec, endlessNightBoost) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    const nightMix = endlessNightBoost || 0;
    const topCol = nightMix > 0
      ? lerpHexColor(lerpHexColor(pA.skyTop, pB.skyTop, t), '#141d38', nightMix)
      : lerpHexColor(pA.skyTop, pB.skyTop, t);
    const midCol = nightMix > 0
      ? lerpHexColor(lerpHexColor(pA.skyMid, pB.skyMid, t), '#24345a', nightMix)
      : lerpHexColor(pA.skyMid, pB.skyMid, t);
    const horCol = nightMix > 0
      ? lerpHexColor(lerpHexColor(pA.skyHorizon, pB.skyHorizon, t), '#46587e', nightMix)
      : lerpHexColor(pA.skyHorizon, pB.skyHorizon, t);

    skyGrad.addColorStop(0, topCol);
    skyGrad.addColorStop(0.58, midCol);
    skyGrad.addColorStop(1, horCol);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, STAGE_W, GROUND_Y);

    // Subtle stars during twilight / endless night
    const starAlpha = clamp(lerp(pA.starsAlpha, pB.starsAlpha, t) + nightMix * 0.7, 0, 0.9);
    if (starAlpha > 0.04) {
      ctx.save();
      const stars = [
        [72, 28], [150, 48], [238, 22], [320, 56], [412, 30], [495, 42],
        [580, 20], [665, 52], [750, 28], [848, 44], [912, 24], [115, 78]
      ];
      for (let i = 0; i < stars.length; i++) {
        const twinkle = 0.55 + 0.45 * Math.sin(timeSec * 2.1 + i * 1.3);
        ctx.fillStyle = 'rgba(255, 252, 232, ' + (starAlpha * twinkle).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(stars[i][0], stars[i][1], i % 3 === 0 ? 1.6 : 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Sun / Twilight orb (skip on secret levels that render custom sky celestial art)
    if (pA.noSun && t < 0.5) return;
    const sunX = lerp(pA.sunX, pB.sunX, t);
    const sunY = lerp(pA.sunY, pB.sunY, t);
    const sunGlow = lerpHexColor(pA.sunGlow, pB.sunGlow, t);
    const sunCore = lerpHexColor(pA.sunColor, pB.sunColor, t);

    const glow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 54);
    glow.addColorStop(0, sunCore);
    glow.addColorStop(0.42, sunGlow);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.globalAlpha = nightMix > 0.4 ? 0.55 : 0.9;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 54, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = sunCore;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawClouds(ctx, worldDist, cloudColor) {
    const span = 1280;
    const shift = modPositive(worldDist * 0.04, span);
    const clouds = [
      { x: 110, y: 54, s: 1.0 },
      { x: 390, y: 80, s: 0.78 },
      { x: 690, y: 46, s: 1.1 },
      { x: 990, y: 74, s: 0.85 }
    ];

    ctx.save();
    ctx.fillStyle = cloudColor;
    ctx.globalAlpha = 0.82;
    for (let repeat = -1; repeat <= 1; repeat++) {
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        const cx = c.x - shift + repeat * span;
        if (cx < -140 || cx > STAGE_W + 140) continue;
        ctx.save();
        ctx.translate(cx, c.y);
        ctx.scale(c.s, c.s);
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.arc(18, -5, 20, 0, Math.PI * 2);
        ctx.arc(38, 0, 15, 0, Math.PI * 2);
        ctx.arc(20, 6, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // 1. MOUNTAIN VIEW — Bay View Dragonscale Canopy + Googleplex + Stan T-Rex
  // =========================================================================
  function drawMountainViewFar(ctx, worldDist, p) {
    const span = 960;
    const shift = modPositive(worldDist * 0.06, span);

    // Santa Cruz Mountains far ridge
    ctx.fillStyle = p.farRidge;
    for (let r = -1; r <= 1; r++) {
      const ox = -shift + r * span;
      ctx.beginPath();
      ctx.moveTo(ox, GROUND_Y);
      ctx.lineTo(ox, 206);
      ctx.quadraticCurveTo(ox + 110, 174, ox + 220, 198);
      ctx.quadraticCurveTo(ox + 360, 162, ox + 500, 196);
      ctx.quadraticCurveTo(ox + 650, 168, ox + 790, 194);
      ctx.quadraticCurveTo(ox + 890, 178, ox + 960, 206);
      ctx.lineTo(ox + 960, GROUND_Y);
      ctx.closePath();
      ctx.fill();
    }

    // Closer foothills + Bay shoreline glint
    ctx.fillStyle = p.nearRidge;
    for (let r = -1; r <= 1; r++) {
      const ox = -modPositive(worldDist * 0.1, span) + r * span;
      ctx.beginPath();
      ctx.moveTo(ox, GROUND_Y);
      ctx.lineTo(ox, 224);
      ctx.quadraticCurveTo(ox + 150, 204, ox + 300, 222);
      ctx.quadraticCurveTo(ox + 480, 194, ox + 660, 220);
      ctx.quadraticCurveTo(ox + 810, 202, ox + 960, 224);
      ctx.lineTo(ox + 960, GROUND_Y);
      ctx.closePath();
      ctx.fill();
    }

    // Subtle San Francisco Bay water glint
    ctx.fillStyle = 'rgba(173, 217, 250, 0.45)';
    ctx.fillRect(0, 236, STAGE_W, 8);
  }

  function drawBayViewCanopy(ctx, x) {
    // Landscaped green campus berm
    ctx.fillStyle = '#6db36b';
    ctx.beginPath();
    ctx.moveTo(x - 16, GROUND_Y);
    ctx.quadraticCurveTo(x + 150, GROUND_Y - 26, x + 324, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // Tall reflective glass curtain walls under dragonscale roof
    const wallY = GROUND_Y - 54;
    const wallH = 44;
    const glassGrad = ctx.createLinearGradient(0, wallY, 0, wallY + wallH);
    glassGrad.addColorStop(0, '#7ab3e8');
    glassGrad.addColorStop(1, '#cde5fb');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(x + 14, wallY, 276, wallH);

    // Subtle structural window mullions
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.2;
    for (let wx = x + 30; wx < x + 286; wx += 18) {
      ctx.beginPath();
      ctx.moveTo(wx, wallY);
      ctx.lineTo(wx, wallY + wallH);
      ctx.stroke();
    }

    // Iconic Bay View Dragonscale scalloped tented solar canopies (3 bays)
    const bays = [
      { bx: x + 2, bw: 98, peak: 52 },
      { bx: x + 98, bw: 106, peak: 62 },
      { bx: x + 202, bw: 98, peak: 50 }
    ];

    for (let i = 0; i < bays.length; i++) {
      const b = bays[i];
      const baseY = wallY + 4;
      const topY = baseY - b.peak;

      // Dark shaded under-eave soffit
      ctx.fillStyle = '#3b4a59';
      ctx.beginPath();
      ctx.moveTo(b.bx, baseY + 2);
      ctx.quadraticCurveTo(b.bx + b.bw * 0.5, baseY - 12, b.bx + b.bw, baseY + 2);
      ctx.lineTo(b.bx + b.bw - 6, baseY + 7);
      ctx.lineTo(b.bx + 6, baseY + 7);
      ctx.closePath();
      ctx.fill();

      // Main billowing white/silver dragonscale roof shell
      const roofGrad = ctx.createLinearGradient(b.bx, topY, b.bx + b.bw, baseY);
      roofGrad.addColorStop(0, '#ffffff');
      roofGrad.addColorStop(0.55, '#e8eef5');
      roofGrad.addColorStop(1, '#c9d7e6');
      ctx.fillStyle = roofGrad;
      ctx.strokeStyle = '#9aa8b8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(b.bx, baseY);
      ctx.quadraticCurveTo(b.bx + b.bw * 0.25, topY + 12, b.bx + b.bw * 0.5, topY);
      ctx.quadraticCurveTo(b.bx + b.bw * 0.75, topY + 12, b.bx + b.bw, baseY);
      ctx.quadraticCurveTo(b.bx + b.bw * 0.5, baseY - 11, b.bx, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dragonscale solar-panel rib textures
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.35)';
      ctx.lineWidth = 1.1;
      for (let r = 1; r <= 4; r++) {
        const frac = r / 5;
        ctx.beginPath();
        ctx.moveTo(b.bx + b.bw * frac, baseY - 5);
        ctx.lineTo(b.bx + b.bw * 0.5 + (frac - 0.5) * b.bw * 0.42, topY + 10);
        ctx.stroke();
      }
    }
  }

  function drawStanTRex(ctx, x, groundY) {
    ctx.save();
    ctx.translate(x, groundY);

    // Concrete plaza pedestal
    ctx.fillStyle = '#c5cbd1';
    ctx.fillRect(-16, -9, 36, 9);

    // Fossil bone palette
    ctx.strokeStyle = '#6c5a49';
    ctx.fillStyle = '#dcd0be';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';

    // Hind legs
    ctx.beginPath();
    ctx.moveTo(-2, -28);
    ctx.lineTo(-5, -18);
    ctx.lineTo(-2, -9);
    ctx.moveTo(3, -28);
    ctx.lineTo(6, -18);
    ctx.lineTo(4, -9);
    ctx.stroke();

    // Tail sweeping left
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.quadraticCurveTo(-16, -34, -27, -27);
    ctx.stroke();

    // Spine & ribcage
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.quadraticCurveTo(10, -40, 17, -48);
    ctx.stroke();

    for (let r = 0; r < 4; r++) {
      const rx = 2 + r * 3.4;
      const ry = -33 - r * 2.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.quadraticCurveTo(rx + 2, ry + 7, rx - 1, ry + 10);
      ctx.stroke();
    }

    // T-Rex Skull & Jaw
    ctx.beginPath();
    ctx.roundRect(15, -56, 15, 7, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16, -48);
    ctx.lineTo(28, -46);
    ctx.stroke();
    // Eye socket
    ctx.fillStyle = '#6c5a49';
    ctx.fillRect(19, -54, 3, 2.5);
    ctx.restore();
  }

  function drawGoogleUmbrella(ctx, x, groundY, color) {
    ctx.save();
    ctx.translate(x, groundY);
    // Pole & cafe table
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -28);
    ctx.stroke();
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(-7, -11, 14, 2.5);
    // Canopy
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-14, -26);
    ctx.quadraticCurveTo(0, -37, 14, -26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPalmTree(ctx, x, groundY, h) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.strokeStyle = '#8b6d55';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4, -h * 0.5, 2, -h);
    ctx.stroke();

    ctx.fillStyle = '#489355';
    const fronds = [-2.5, -1.8, -0.9, -0.2, 0.5];
    for (let i = 0; i < fronds.length; i++) {
      ctx.save();
      ctx.translate(2, -h);
      ctx.rotate(fronds[i]);
      ctx.beginPath();
      ctx.ellipse(11, 0, 12, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawGoogleplex(ctx, x) {
    // Modern warm-terracotta & blue glass campus buildings
    ctx.fillStyle = '#dfe5ec';
    ctx.fillRect(x + 12, GROUND_Y - 76, 134, 76);

    // Warm architectural terracotta accent wing
    ctx.fillStyle = '#d98365';
    ctx.fillRect(x + 20, GROUND_Y - 82, 42, 82);

    // Sleek horizontal glass ribbons
    ctx.fillStyle = '#82b6e8';
    for (let row = 0; row < 3; row++) {
      ctx.fillRect(x + 68, GROUND_Y - 64 + row * 20, 70, 11);
      ctx.fillRect(x + 26, GROUND_Y - 68 + row * 20, 30, 10);
    }

    // Angled modern solar roofline
    ctx.fillStyle = '#5f6b78';
    ctx.beginPath();
    ctx.moveTo(x + 8, GROUND_Y - 76);
    ctx.lineTo(x + 150, GROUND_Y - 84);
    ctx.lineTo(x + 150, GROUND_Y - 78);
    ctx.lineTo(x + 8, GROUND_Y - 71);
    ctx.closePath();
    ctx.fill();

    // 4-color Google courtyard umbrellas
    drawGoogleUmbrella(ctx, x + 172, GROUND_Y, '#4285F4');
    drawGoogleUmbrella(ctx, x + 206, GROUND_Y, '#EA4335');
    drawGoogleUmbrella(ctx, x + 240, GROUND_Y, '#FBBC04');
    drawGoogleUmbrella(ctx, x + 274, GROUND_Y, '#34A853');

    // Stan T-Rex plaza sculpture
    drawStanTRex(ctx, x + 324, GROUND_Y);

    // California palms
    drawPalmTree(ctx, x + 365, GROUND_Y, 64);
    drawPalmTree(ctx, x + 390, GROUND_Y, 52);
  }

  function drawMountainViewMid(ctx, worldDist) {
    const span = 820;
    const shift = modPositive(worldDist * 0.13, span);
    for (let r = -1; r <= 2; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 80 || ox + span < -80) continue;
      drawBayViewCanopy(ctx, ox + 18);
      drawGoogleplex(ctx, ox + 365);
    }
  }

  function drawMountainViewFore(ctx, worldDist) {
    const span = 480;
    const shift = modPositive(worldDist * 0.30, span);
    for (let r = -1; r <= 2; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 60 || ox + span < -60) continue;

      // Manicured native California hedges
      ctx.fillStyle = '#579c59';
      ctx.beginPath();
      ctx.ellipse(ox + 95, GROUND_Y - 2, 26, 8, 0, Math.PI, 0);
      ctx.ellipse(ox + 335, GROUND_Y - 2, 32, 9, 0, Math.PI, 0);
      ctx.fill();

      // Colorful Google directional campus sign
      ctx.fillStyle = '#5f6368';
      ctx.fillRect(ox + 215, GROUND_Y - 34, 3, 34);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#dadce0';
      ctx.lineWidth = 1;
      ctx.fillRect(ox + 202, GROUND_Y - 36, 30, 12);
      ctx.strokeRect(ox + 202, GROUND_Y - 36, 30, 12);
      ctx.fillStyle = '#4285F4';
      ctx.fillRect(ox + 204, GROUND_Y - 33, 8, 2.5);
      ctx.fillStyle = '#34A853';
      ctx.fillRect(ox + 204, GROUND_Y - 29, 14, 2.5);
    }
  }

  // =========================================================================
  // 2. LONDON — King's Cross KGX1 Landscraper + St Pancras Clocktower + Bus
  // =========================================================================
  function drawLondonFar(ctx, worldDist, p) {
    const span = 960;
    const shift = modPositive(worldDist * 0.06, span);
    ctx.fillStyle = p.farRidge;

    for (let r = -1; r <= 1; r++) {
      const ox = -shift + r * span;
      // Soft distant London cityscape
      ctx.fillRect(ox + 30, GROUND_Y - 62, 54, 62);
      ctx.fillRect(ox + 96, GROUND_Y - 78, 42, 78);
      // BT Tower silhouette
      ctx.fillRect(ox + 230, GROUND_Y - 122, 11, 122);
      ctx.fillRect(ox + 234, GROUND_Y - 138, 3, 18);
      // The Shard pointed glass spire
      ctx.beginPath();
      ctx.moveTo(ox + 680, GROUND_Y);
      ctx.lineTo(ox + 698, GROUND_Y - 156);
      ctx.lineTo(ox + 716, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      // Distant roofs
      ctx.fillRect(ox + 340, GROUND_Y - 52, 85, 52);
      ctx.fillRect(ox + 780, GROUND_Y - 68, 70, 68);
    }
  }

  function drawStPancrasAndKingsCross(ctx, x) {
    // King's Cross Glass & Steel Station Concave Dome Arch
    ctx.fillStyle = '#d2e2f2';
    ctx.strokeStyle = '#7b8fa6';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x + 56, GROUND_Y, 54, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fan ribs on King's Cross dome
    ctx.strokeStyle = 'rgba(95, 115, 138, 0.5)';
    ctx.lineWidth = 1;
    for (let a = 1; a <= 5; a++) {
      const ang = Math.PI + (a * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(x + 56, GROUND_Y);
      ctx.lineTo(x + 56 + Math.cos(ang) * 53, GROUND_Y + Math.sin(ang) * 53);
      ctx.stroke();
    }

    // St Pancras Renaissance Gothic Red-Brick Clocktower
    const tx = x + 120;
    ctx.fillStyle = '#b4483a';
    ctx.fillRect(tx, GROUND_Y - 118, 40, 118);

    // Ornate cream sandstone horizontal stringcourses
    ctx.fillStyle = '#e7d5be';
    ctx.fillRect(tx - 2, GROUND_Y - 72, 44, 4);
    ctx.fillRect(tx - 2, GROUND_Y - 118, 44, 5);

    // Gothic pointed slate spire
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.moveTo(tx - 2, GROUND_Y - 118);
    ctx.lineTo(tx + 20, GROUND_Y - 170);
    ctx.lineTo(tx + 42, GROUND_Y - 118);
    ctx.closePath();
    ctx.fill();

    // Golden finial tip
    ctx.strokeStyle = '#fbbc04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx + 20, GROUND_Y - 170);
    ctx.lineTo(tx + 20, GROUND_Y - 180);
    ctx.stroke();

    // Illuminated Clock Face
    ctx.fillStyle = '#fff9db';
    ctx.strokeStyle = '#3c4043';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(tx + 20, GROUND_Y - 96, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + 20, GROUND_Y - 96);
    ctx.lineTo(tx + 20, GROUND_Y - 102);
    ctx.moveTo(tx + 20, GROUND_Y - 96);
    ctx.lineTo(tx + 25, GROUND_Y - 94);
    ctx.stroke();

    // Arched gothic lancet windows
    ctx.fillStyle = '#53251e';
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      ctx.roundRect(tx + 6 + w * 10.5, GROUND_Y - 58, 6.5, 18, [4, 4, 0, 0]);
      ctx.fill();
    }
  }

  function drawKGX1Landscraper(ctx, x) {
    // Low-slung horizontal mass-timber & glass KGX1 "Landscraper"
    const w = 390;
    const h = 64;
    const topY = GROUND_Y - h;

    // Warm illuminated interior glass facade
    const glass = ctx.createLinearGradient(0, topY, 0, GROUND_Y);
    glass.addColorStop(0, '#96c2eb');
    glass.addColorStop(0.55, '#d5e7f7');
    glass.addColorStop(1, '#f8e6bd');
    ctx.fillStyle = glass;
    ctx.fillRect(x, topY, w, h);

    // Distinct terraced horizontal timber floorplates
    ctx.fillStyle = '#8b5e3c';
    ctx.fillRect(x - 4, topY, w + 8, 5);
    ctx.fillRect(x, topY + 21, w, 3.5);
    ctx.fillRect(x, topY + 42, w, 3.5);

    // Repeating vertical warm cedar/oak louvers
    ctx.strokeStyle = '#b97e4f';
    ctx.lineWidth = 2;
    for (let lx = x + 12; lx < x + w; lx += 16) {
      ctx.beginPath();
      ctx.moveTo(lx, topY + 5);
      ctx.lineTo(lx, GROUND_Y);
      ctx.stroke();
    }

    // Lush rooftop garden trees, planter beds & pergolas along the entire roof!
    ctx.fillStyle = '#558b57';
    ctx.fillRect(x + 8, topY - 4, w - 16, 4);
    for (let tx = x + 24; tx < x + w - 20; tx += 34) {
      ctx.fillStyle = '#477b4c';
      ctx.beginPath();
      ctx.arc(tx, topY - 12, 9, 0, Math.PI * 2);
      ctx.arc(tx + 9, topY - 9, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6da76e';
      ctx.beginPath();
      ctx.arc(tx - 2, topY - 14, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLondonBus(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#d93025';
    ctx.beginPath();
    ctx.roundRect(0, -28, 48, 25, 4);
    ctx.fill();
    // Upper & lower windows
    ctx.fillStyle = '#e8f0fe';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(4 + i * 10, -24, 7.5, 7);
      ctx.fillRect(4 + i * 10, -13, 7.5, 6);
    }
    // Wheels
    ctx.fillStyle = '#202124';
    ctx.beginPath();
    ctx.arc(11, -3, 3.8, 0, Math.PI * 2);
    ctx.arc(37, -3, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLondonMid(ctx, worldDist, timeSec) {
    const span = 820;
    const shift = modPositive(worldDist * 0.13, span);
    for (let r = -1; r <= 2; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 80 || ox + span < -80) continue;
      drawStPancrasAndKingsCross(ctx, ox + 16);
      drawKGX1Landscraper(ctx, ox + 215);
    }

    // Classic red double-decker bus gliding in the distant street lane
    const busX = modPositive(timeSec * 46, STAGE_W + 140) - 70;
    drawLondonBus(ctx, busX, GROUND_Y);
  }

  function drawLondonFore(ctx, worldDist) {
    const span = 320;
    const shift = modPositive(worldDist * 0.30, span);
    for (let r = -1; r <= 3; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 40 || ox + span < -40) continue;

      // Regent's Canal stone & black cast-iron parapet railing
      ctx.fillStyle = '#9aa0a6';
      ctx.fillRect(ox, GROUND_Y - 12, span, 4);
      ctx.strokeStyle = '#3c4043';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(ox, GROUND_Y - 22);
      ctx.lineTo(ox + span, GROUND_Y - 22);
      for (let rx = ox + 12; rx < ox + span; rx += 24) {
        ctx.moveTo(rx, GROUND_Y - 22);
        ctx.lineTo(rx, GROUND_Y - 12);
      }
      ctx.stroke();

      // Victorian streetlamp
      ctx.fillStyle = '#202124';
      ctx.fillRect(ox + 150, GROUND_Y - 58, 3, 58);
      ctx.fillStyle = '#ffe599';
      ctx.beginPath();
      ctx.roundRect(ox + 146, GROUND_Y - 66, 11, 9, 2);
      ctx.fill();
    }
  }

  // =========================================================================
  // 3. TOKYO — Shibuya Stream + Yamanote Line Train + Mt Fuji Horizon
  // =========================================================================
  function drawTokyoFar(ctx, worldDist, p) {
    // Distant Mount Fuji cone silhouette on right-center horizon
    const fujiShift = modPositive(worldDist * 0.03, 960);
    const fx = 690 - fujiShift * 0.15;
    ctx.fillStyle = '#6c6890';
    ctx.beginPath();
    ctx.moveTo(fx - 135, GROUND_Y);
    ctx.lineTo(fx - 26, GROUND_Y - 110);
    ctx.lineTo(fx + 26, GROUND_Y - 110);
    ctx.lineTo(fx + 135, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // Snow cap on Mt Fuji
    ctx.fillStyle = '#f8f2fa';
    ctx.beginPath();
    ctx.moveTo(fx - 44, GROUND_Y - 78);
    ctx.lineTo(fx - 26, GROUND_Y - 110);
    ctx.lineTo(fx + 26, GROUND_Y - 110);
    ctx.lineTo(fx + 44, GROUND_Y - 78);
    ctx.lineTo(fx + 24, GROUND_Y - 84);
    ctx.lineTo(fx + 6, GROUND_Y - 76);
    ctx.lineTo(fx - 14, GROUND_Y - 84);
    ctx.closePath();
    ctx.fill();

    // Distant Tokyo Tower silhouette
    const ttx = 225 - modPositive(worldDist * 0.05, 960) * 0.2;
    ctx.strokeStyle = '#995566';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ttx - 16, GROUND_Y);
    ctx.lineTo(ttx, GROUND_Y - 128);
    ctx.lineTo(ttx + 16, GROUND_Y);
    ctx.moveTo(ttx - 9, GROUND_Y - 48);
    ctx.lineTo(ttx + 9, GROUND_Y - 48);
    ctx.moveTo(ttx - 5, GROUND_Y - 85);
    ctx.lineTo(ttx + 5, GROUND_Y - 85);
    ctx.stroke();

    // Distant city block silhouettes
    ctx.fillStyle = p.nearRidge;
    const span = 960;
    const shift = modPositive(worldDist * 0.08, span);
    for (let r = -1; r <= 1; r++) {
      const ox = -shift + r * span;
      ctx.fillRect(ox + 20, GROUND_Y - 74, 48, 74);
      ctx.fillRect(ox + 85, GROUND_Y - 96, 55, 96);
      ctx.fillRect(ox + 340, GROUND_Y - 88, 62, 88);
      ctx.fillRect(ox + 820, GROUND_Y - 82, 58, 82);
    }
  }

  function drawShibuyaStreamTower(ctx, x) {
    // Terraced urban podium plaza
    ctx.fillStyle = '#485266';
    ctx.fillRect(x, GROUND_Y - 46, 170, 46);

    // Tall sleek Shibuya Stream glass tower
    const towerGrad = ctx.createLinearGradient(x + 28, GROUND_Y - 196, x + 148, GROUND_Y - 46);
    towerGrad.addColorStop(0, '#5a739e');
    towerGrad.addColorStop(1, '#7a95c4');
    ctx.fillStyle = towerGrad;
    ctx.fillRect(x + 28, GROUND_Y - 196, 120, 150);

    // Warm golden-white illuminated office floor bands
    ctx.fillStyle = 'rgba(255, 232, 168, 0.72)';
    for (let floor = 0; floor < 8; floor++) {
      ctx.fillRect(x + 34, GROUND_Y - 186 + floor * 17, 108, 6);
    }

    // Signature vertical steel mullions / architectural fins
    ctx.strokeStyle = '#b4c7e4';
    ctx.lineWidth = 1.6;
    for (let fx = x + 36; fx <= x + 142; fx += 13) {
      ctx.beginPath();
      ctx.moveTo(fx, GROUND_Y - 196);
      ctx.lineTo(fx, GROUND_Y - 46);
      ctx.stroke();
    }

    // Companion Shibuya tower with tasteful glowing vertical neon accent sign
    ctx.fillStyle = '#3f4a63';
    ctx.fillRect(x + 195, GROUND_Y - 134, 72, 134);
    ctx.fillStyle = '#ffe599';
    for (let wy = GROUND_Y - 122; wy < GROUND_Y - 46; wy += 16) {
      ctx.fillRect(x + 205, wy, 40, 4);
    }
    // Vertical Shibuya accent light bar
    ctx.fillStyle = '#4dd0e1';
    ctx.fillRect(x + 255, GROUND_Y - 122, 6, 48);
    ctx.fillStyle = '#ff6f61';
    ctx.fillRect(x + 183, GROUND_Y - 102, 7, 36);
  }

  function drawYamanoteTrainAndViaduct(ctx, timeSec) {
    // Concrete elevated viaduct across midground
    const vy = GROUND_Y - 58;
    ctx.fillStyle = '#6e7685';
    ctx.fillRect(0, vy, STAGE_W, 10);
    ctx.fillStyle = '#565e6d';
    for (let px = 60; px < STAGE_W; px += 150) {
      ctx.fillRect(px, vy + 10, 14, 48);
    }

    // Sleek silver commuter train with signature bright green Yamanote stripe!
    const trainW = 240;
    const trainX = STAGE_W - modPositive(timeSec * 125, STAGE_W + trainW + 120);
    const ty = vy - 18;

    for (let car = 0; car < 3; car++) {
      const cx = trainX + car * 80;
      ctx.fillStyle = '#dce2ea';
      ctx.beginPath();
      ctx.roundRect(cx, ty, 76, 17, 3);
      ctx.fill();

      // Bright Yamanote lime-green stripe
      ctx.fillStyle = '#7ec845';
      ctx.fillRect(cx + 1, ty + 10, 74, 3.5);

      // Train windows
      ctx.fillStyle = '#3e4a5e';
      for (let w = 0; w < 4; w++) {
        ctx.fillRect(cx + 7 + w * 17, ty + 3, 12, 5.5);
      }
    }
  }

  function drawTokyoMid(ctx, worldDist, timeSec) {
    const span = 640;
    const shift = modPositive(worldDist * 0.13, span);
    for (let r = -1; r <= 2; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 80 || ox + span < -80) continue;
      drawShibuyaStreamTower(ctx, ox + 20);
    }
    drawYamanoteTrainAndViaduct(ctx, timeSec);
  }

  function drawTokyoFore(ctx, worldDist) {
    const span = 340;
    const shift = modPositive(worldDist * 0.30, span);
    for (let r = -1; r <= 3; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 40 || ox + span < -40) continue;

      // Shibuya River waterfront steel & glass promenade railing
      ctx.strokeStyle = '#9aa4b2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox, GROUND_Y - 18);
      ctx.lineTo(ox + span, GROUND_Y - 18);
      for (let rx = ox + 16; rx < ox + span; rx += 32) {
        ctx.moveTo(rx, GROUND_Y - 18);
        ctx.lineTo(rx, GROUND_Y);
      }
      ctx.stroke();

      // Warm glowing plaza bollard
      ctx.fillStyle = '#4a5260';
      ctx.fillRect(ox + 115, GROUND_Y - 22, 6, 22);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(ox + 116, GROUND_Y - 20, 4, 5);

      // Pruned Japanese tree with subtle sakura blossom tint
      ctx.fillStyle = '#6d5247';
      ctx.fillRect(ox + 245, GROUND_Y - 30, 4, 30);
      ctx.fillStyle = '#f29eb6';
      ctx.beginPath();
      ctx.arc(ox + 247, GROUND_Y - 36, 13, 0, Math.PI * 2);
      ctx.arc(ox + 258, GROUND_Y - 32, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================================================================
  // 4. ZURICH — Hürlimann Areal Brewery + Swiss Alps Alpenglow + VBZ Tram
  // =========================================================================
  function drawZurichFar(ctx, worldDist) {
    const span = 960;
    const shift = modPositive(worldDist * 0.06, span);

    for (let r = -1; r <= 1; r++) {
      const ox = -shift + r * span;
      const peaks = [
        [0, 210, 95, 118, 190, 210],
        [140, 210, 260, 96, 385, 210],
        [330, 210, 465, 112, 590, 210],
        [520, 210, 675, 92, 820, 210],
        [750, 210, 880, 122, 960, 210]
      ];

      for (let i = 0; i < peaks.length; i++) {
        const pk = peaks[i];
        // Shadowed blue-slate Alpine mountain slope
        ctx.fillStyle = '#4e638c';
        ctx.beginPath();
        ctx.moveTo(ox + pk[0], GROUND_Y);
        ctx.lineTo(ox + pk[0], pk[1]);
        ctx.lineTo(ox + pk[2], pk[3]);
        ctx.lineTo(ox + pk[4], pk[5]);
        ctx.lineTo(ox + pk[4], GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Snow-capped face catching pink-amber alpenglow!
        ctx.fillStyle = '#ffece4';
        ctx.beginPath();
        ctx.moveTo(ox + pk[2], pk[3]);
        ctx.lineTo(ox + pk[2] - 42, pk[3] + 44);
        ctx.lineTo(ox + pk[2] - 12, pk[3] + 35);
        ctx.lineTo(ox + pk[2] + 8, pk[3] + 47);
        ctx.lineTo(ox + pk[2] + 36, pk[3] + 36);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function drawHurlimannAreal(ctx, x) {
    // Historic 19th-century yellow-ochre & brick brewery wing
    ctx.fillStyle = '#d4a359';
    ctx.fillRect(x + 20, GROUND_Y - 82, 165, 82);

    // Warm brick cornice & arched industrial gables
    ctx.fillStyle = '#b45a40';
    ctx.fillRect(x + 16, GROUND_Y - 86, 173, 7);

    // Modern glass-and-timber rooftop addition perched over historic stonework
    ctx.fillStyle = '#8bb5de';
    ctx.fillRect(x + 42, GROUND_Y - 110, 118, 24);
    ctx.fillStyle = '#6f4e37';
    ctx.fillRect(x + 38, GROUND_Y - 114, 126, 5);

    // Iconic tall tapered brick brewery chimney
    ctx.fillStyle = '#a84f39';
    ctx.beginPath();
    ctx.moveTo(x + 198, GROUND_Y);
    ctx.lineTo(x + 204, GROUND_Y - 154);
    ctx.lineTo(x + 216, GROUND_Y - 154);
    ctx.lineTo(x + 224, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6b3326';
    ctx.fillRect(x + 202, GROUND_Y - 158, 16, 5);

    // Arched multi-pane factory windows glowing warm amber inside
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const wx = x + 34 + col * 30;
        const wy = GROUND_Y - 68 + row * 34;
        ctx.fillStyle = '#ffd57e';
        ctx.beginPath();
        ctx.roundRect(wx, wy, 18, 22, [9, 9, 0, 0]);
        ctx.fill();
        ctx.strokeStyle = '#6b4d2e';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Europaallee stone-and-glass Google wing beside the brewery
    ctx.fillStyle = '#cfd4da';
    ctx.fillRect(x + 250, GROUND_Y - 94, 130, 94);
    ctx.fillStyle = '#ffd98a';
    for (let wy = GROUND_Y - 82; wy < GROUND_Y - 18; wy += 20) {
      for (let wx = x + 262; wx < x + 368; wx += 26) {
        ctx.fillRect(wx, wy, 15, 11);
      }
    }
  }

  function drawVBZTram(ctx, timeSec) {
    // Overhead catenary wire
    ctx.strokeStyle = 'rgba(200, 212, 232, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 38);
    ctx.lineTo(STAGE_W, GROUND_Y - 38);
    ctx.stroke();

    const tx = modPositive(timeSec * 64, STAGE_W + 180) - 90;
    const ty = GROUND_Y - 26;
    ctx.save();
    // Classic Zurich blue-and-white VBZ tram
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(tx, ty, 84, 24, 3);
    ctx.fill();
    ctx.fillStyle = '#1d65b5';
    ctx.fillRect(tx, ty + 13, 84, 10);
    // Windows
    ctx.fillStyle = '#ffd884';
    for (let w = 0; w < 5; w++) {
      ctx.fillRect(tx + 6 + w * 15, ty + 4, 11, 7);
    }
    // Pantograph to wire
    ctx.strokeStyle = '#9aa0a6';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(tx + 24, ty);
    ctx.lineTo(tx + 29, ty - 12);
    ctx.lineTo(tx + 34, ty);
    ctx.stroke();
    ctx.restore();
  }

  function drawZurichMid(ctx, worldDist, timeSec) {
    const span = 680;
    const shift = modPositive(worldDist * 0.13, span);
    for (let r = -1; r <= 2; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 80 || ox + span < -80) continue;
      drawHurlimannAreal(ctx, ox + 16);
    }
    drawVBZTram(ctx, timeSec);
  }

  function drawZurichFore(ctx, worldDist) {
    const span = 380;
    const shift = modPositive(worldDist * 0.30, span);
    for (let r = -1; r <= 3; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 50 || ox + span < -50) continue;

      // Terraced stone retaining wall
      ctx.fillStyle = '#8b9199';
      ctx.fillRect(ox, GROUND_Y - 12, span, 12);

      // Swiss Alpine conifer
      ctx.fillStyle = '#326348';
      ctx.beginPath();
      ctx.moveTo(ox + 90, GROUND_Y - 46);
      ctx.lineTo(ox + 76, GROUND_Y - 12);
      ctx.lineTo(ox + 104, GROUND_Y - 12);
      ctx.closePath();
      ctx.fill();

      // Tidy lantern post
      ctx.fillStyle = '#3c4043';
      ctx.fillRect(ox + 250, GROUND_Y - 48, 3, 48);
      ctx.fillStyle = '#ffe082';
      ctx.beginPath();
      ctx.arc(ox + 251.5, GROUND_Y - 50, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================================================================
  // 5. SYDNEY — Pyrmont Waterfront + Opera House + Harbour Bridge + Ferry
  // =========================================================================
  function drawSydneyFar(ctx, worldDist) {
    // Darling Harbour shimmering water band
    ctx.fillStyle = '#4ea6db';
    ctx.fillRect(0, GROUND_Y - 26, STAGE_W, 26);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let wx = 20; wx < STAGE_W; wx += 95) {
      ctx.fillRect(wx, GROUND_Y - 17, 36, 2);
      ctx.fillRect(wx + 42, GROUND_Y - 9, 22, 1.5);
    }

    const span = 960;
    const shift = modPositive(worldDist * 0.055, span);
    for (let r = -1; r <= 1; r++) {
      const ox = -shift + r * span;

      // Sydney Harbour Bridge steel arch & granite pylons
      const bx = ox + 170;
      ctx.fillStyle = '#8b939c';
      ctx.fillRect(bx - 88, GROUND_Y - 76, 16, 52);
      ctx.fillRect(bx + 72, GROUND_Y - 76, 16, 52);
      ctx.strokeStyle = '#6b7785';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bx, GROUND_Y - 24, 92, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, GROUND_Y - 24, 72, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      // Road deck
      ctx.fillStyle = '#5c6672';
      ctx.fillRect(bx - 115, GROUND_Y - 46, 230, 5);
      // Vertical hangers
      ctx.strokeStyle = 'rgba(92, 102, 114, 0.7)';
      ctx.lineWidth = 1.1;
      for (let hx = bx - 64; hx <= bx + 64; hx += 16) {
        ctx.beginPath();
        ctx.moveTo(hx, GROUND_Y - 46);
        ctx.lineTo(hx, GROUND_Y - 92);
        ctx.stroke();
      }

      // Iconic Sydney Opera House white concrete sail shells
      const sx = ox + 590;
      ctx.fillStyle = '#d3c7b4';
      ctx.fillRect(sx - 6, GROUND_Y - 32, 138, 8);
      const sails = [
        [sx + 6, GROUND_Y - 32, sx + 26, GROUND_Y - 86, sx + 48, GROUND_Y - 32],
        [sx + 34, GROUND_Y - 32, sx + 60, GROUND_Y - 98, sx + 88, GROUND_Y - 32],
        [sx + 72, GROUND_Y - 32, sx + 98, GROUND_Y - 82, sx + 122, GROUND_Y - 32]
      ];
      for (let i = 0; i < sails.length; i++) {
        const s = sails[i];
        ctx.fillStyle = i === 1 ? '#ffffff' : '#eef4fa';
        ctx.strokeStyle = '#9aa8b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s[0], s[1]);
        ctx.quadraticCurveTo(s[0] + 4, s[3] + 10, s[2], s[3]);
        ctx.quadraticCurveTo(s[4] - 2, s[3] + 16, s[4], s[5]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  function drawSydneyFerry(ctx, timeSec) {
    const fx = modPositive(timeSec * 42, STAGE_W + 160) - 80;
    const fy = GROUND_Y - 24;
    ctx.save();
    // Classic green & gold Sydney Harbour ferry
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 74, fy);
    ctx.lineTo(fx + 66, fy + 11);
    ctx.lineTo(fx + 8, fy + 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 10, fy - 11, 54, 11);
    ctx.fillStyle = '#fbbc04';
    ctx.fillRect(fx + 10, fy - 3, 54, 3);
    ctx.fillStyle = '#37474f';
    for (let w = 0; w < 5; w++) {
      ctx.fillRect(fx + 14 + w * 10, fy - 9, 7, 4.5);
    }
    ctx.restore();
  }

  function drawSydneyMid(ctx, worldDist, timeSec) {
    const span = 680;
    const shift = modPositive(worldDist * 0.13, span);
    for (let r = -1; r <= 2; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 80 || ox + span < -80) continue;

      // Google Pyrmont Workplace6 glass & warm timber waterfront campus
      ctx.fillStyle = '#8cc0ea';
      ctx.fillRect(ox + 26, GROUND_Y - 76, 210, 76);
      ctx.fillStyle = '#d7ecf9';
      for (let row = 0; row < 3; row++) {
        ctx.fillRect(ox + 34, GROUND_Y - 64 + row * 21, 194, 11);
      }
      // Signature warm Australian timber louver bays & sloped solar roof
      ctx.fillStyle = '#c4834b';
      for (let lx = ox + 42; lx < ox + 225; lx += 28) {
        ctx.fillRect(lx, GROUND_Y - 76, 6, 76);
      }
      ctx.fillStyle = '#3c4a57';
      ctx.beginPath();
      ctx.moveTo(ox + 18, GROUND_Y - 76);
      ctx.lineTo(ox + 244, GROUND_Y - 88);
      ctx.lineTo(ox + 244, GROUND_Y - 81);
      ctx.lineTo(ox + 18, GROUND_Y - 70);
      ctx.closePath();
      ctx.fill();

      // Companion harbor-side timber pavilion
      ctx.fillStyle = '#e5dac8';
      ctx.fillRect(ox + 286, GROUND_Y - 54, 120, 54);
      ctx.fillStyle = '#4e91c9';
      ctx.fillRect(ox + 296, GROUND_Y - 42, 100, 24);
    }
    drawSydneyFerry(ctx, timeSec);
  }

  function drawSydneyFore(ctx, worldDist) {
    const span = 340;
    const shift = modPositive(worldDist * 0.30, span);
    for (let r = -1; r <= 3; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 40 || ox + span < -40) continue;

      // Pyrmont timber boardwalk rail
      ctx.strokeStyle = '#9e7a57';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox, GROUND_Y - 16);
      ctx.lineTo(ox + span, GROUND_Y - 16);
      for (let rx = ox + 16; rx < ox + span; rx += 28) {
        ctx.moveTo(rx, GROUND_Y - 16);
        ctx.lineTo(rx, GROUND_Y);
      }
      ctx.stroke();

      // Coastal palm
      drawPalmTree(ctx, ox + 190, GROUND_Y, 54);
    }
  }

  // =========================================================================
  // 6. NEW YORK — Pier 57 + St. John's Terminal + Skyline + Yellow Cab
  // =========================================================================
  function drawNewYorkFar(ctx, worldDist, p) {
    // Hudson River afternoon reflection strip
    ctx.fillStyle = '#6da0cf';
    ctx.fillRect(0, GROUND_Y - 18, STAGE_W, 18);

    const span = 960;
    const shift = modPositive(worldDist * 0.06, span);
    ctx.fillStyle = p.farRidge;
    for (let r = -1; r <= 1; r++) {
      const ox = -shift + r * span;
      // Downtown & Midtown Manhattan skyline silhouettes
      ctx.fillRect(ox + 30, GROUND_Y - 78, 44, 62);
      ctx.fillRect(ox + 84, GROUND_Y - 96, 36, 80);

      // One World Trade Center tapered tower + spire
      ctx.beginPath();
      ctx.moveTo(ox + 188, GROUND_Y - 16);
      ctx.lineTo(ox + 195, GROUND_Y - 152);
      ctx.lineTo(ox + 217, GROUND_Y - 152);
      ctx.lineTo(ox + 224, GROUND_Y - 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(ox + 205, GROUND_Y - 182, 2.5, 32);

      // Midtown towers
      ctx.fillRect(ox + 340, GROUND_Y - 92, 52, 76);
      ctx.fillRect(ox + 410, GROUND_Y - 74, 48, 58);

      // Empire State Building
      ctx.fillRect(ox + 608, GROUND_Y - 122, 42, 106);
      ctx.fillRect(ox + 616, GROUND_Y - 148, 26, 28);
      ctx.fillRect(ox + 623, GROUND_Y - 164, 12, 18);
      ctx.fillRect(ox + 628, GROUND_Y - 188, 2.5, 26);

      ctx.fillRect(ox + 720, GROUND_Y - 88, 54, 72);
      ctx.fillRect(ox + 810, GROUND_Y - 104, 46, 88);
    }
  }

  function drawYellowCab(ctx, timeSec) {
    const cx = STAGE_W - modPositive(timeSec * 84, STAGE_W + 140);
    const cy = GROUND_Y - 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Iconic NYC Yellow Cab
    ctx.fillStyle = '#fbbc04';
    ctx.beginPath();
    ctx.roundRect(0, -14, 44, 11, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(9, -21, 24, 9, [4, 4, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#3c4043';
    ctx.fillRect(12, -19, 8, 5);
    ctx.fillRect(22, -19, 9, 5);
    // Medallion roof light
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(19, -23.5, 6, 2.5);
    ctx.fillStyle = '#202124';
    ctx.beginPath();
    ctx.arc(10, -3, 3.6, 0, Math.PI * 2);
    ctx.arc(34, -3, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNewYorkMid(ctx, worldDist, timeSec) {
    const span = 740;
    const shift = modPositive(worldDist * 0.13, span);
    for (let r = -1; r <= 2; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 80 || ox + span < -80) continue;

      // Google Pier 57 — historic concrete headhouse + panoramic glass + rooftop park
      const p57 = ox + 20;
      ctx.fillStyle = '#c8c3ba';
      ctx.fillRect(p57, GROUND_Y - 62, 260, 62);
      ctx.fillStyle = '#7db0de';
      for (let gx = p57 + 16; gx < p57 + 245; gx += 32) {
        ctx.fillRect(gx, GROUND_Y - 52, 24, 34);
      }
      // Rooftop park trees & green berm on Pier 57
      ctx.fillStyle = '#4e9453';
      ctx.fillRect(p57 + 8, GROUND_Y - 67, 244, 5);
      for (let tx = p57 + 26; tx < p57 + 245; tx += 36) {
        ctx.fillStyle = '#428348';
        ctx.beginPath();
        ctx.arc(tx, GROUND_Y - 75, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Google St. John's Terminal — historic brick rail terminal base + terraced modern glass upper floors
      const sjt = ox + 335;
      ctx.fillStyle = '#9c4e3c';
      ctx.fillRect(sjt, GROUND_Y - 46, 220, 46);
      // Viaduct arched brick bays
      ctx.fillStyle = '#ffd584';
      for (let ax = sjt + 16; ax < sjt + 205; ax += 32) {
        ctx.beginPath();
        ctx.roundRect(ax, GROUND_Y - 36, 18, 26, [9, 9, 0, 0]);
        ctx.fill();
      }
      // Modern terraced steel & glass upper massing
      ctx.fillStyle = '#6f9fd1';
      ctx.fillRect(sjt + 14, GROUND_Y - 94, 192, 48);
      ctx.fillStyle = '#ffe5a3';
      for (let row = 0; row < 2; row++) {
        ctx.fillRect(sjt + 22, GROUND_Y - 84 + row * 20, 176, 9);
      }
      ctx.fillStyle = '#4f8f54';
      ctx.fillRect(sjt + 18, GROUND_Y - 99, 184, 5);
    }
    drawYellowCab(ctx, timeSec);
  }

  function drawNewYorkFore(ctx, worldDist) {
    const span = 340;
    const shift = modPositive(worldDist * 0.30, span);
    for (let r = -1; r <= 3; r++) {
      const ox = -shift + r * span;
      if (ox > STAGE_W + 40 || ox + span < -40) continue;

      // Hudson River Greenway iron railing
      ctx.strokeStyle = '#3c4043';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ox, GROUND_Y - 18);
      ctx.lineTo(ox + span, GROUND_Y - 18);
      for (let rx = ox + 14; rx < ox + span; rx += 22) {
        ctx.moveTo(rx, GROUND_Y - 18);
        ctx.lineTo(rx, GROUND_Y);
      }
      ctx.stroke();

      // Classic NYC globe streetlamp
      ctx.fillStyle = '#263238';
      ctx.fillRect(ox + 165, GROUND_Y - 56, 3, 56);
      ctx.fillStyle = '#fff2b2';
      ctx.beginPath();
      ctx.arc(ox + 166.5, GROUND_Y - 58, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================================================================
  // SECRET LEVEL 7: THE CLOUD / TPU DATA CENTER
  // =========================================================================
  function drawCloudTpuFar(ctx, worldDist, timeSec) {
    // Vault steel ceiling ribs & Gemini neural constellation
    const ribSpan = 260;
    const ribShift = modPositive(worldDist * 0.05, ribSpan);
    ctx.strokeStyle = 'rgba(66, 133, 244, 0.16)';
    ctx.lineWidth = 2;
    for (let x = -ribShift; x < STAGE_W + ribSpan; x += ribSpan) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 34, GROUND_Y);
      ctx.stroke();
    }

    // Glowing Gemini neural network nodes in the upper vault
    const nodeSpan = 480;
    const nodeShift = modPositive(worldDist * 0.07, nodeSpan);
    const pts = [[45, 58], [125, 36], [210, 72], [305, 42], [395, 68], [450, 34]];
    for (let rep = -1; rep <= 2; rep++) {
      const bx = -nodeShift + rep * nodeSpan;
      ctx.strokeStyle = 'rgba(126, 249, 255, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < pts.length - 1; i++) {
        ctx.moveTo(bx + pts[i][0], pts[i][1]);
        ctx.lineTo(bx + pts[i + 1][0], pts[i + 1][1]);
      }
      ctx.stroke();
      for (let i = 0; i < pts.length; i++) {
        const pulse = 0.55 + 0.45 * Math.sin(timeSec * 3.2 + i * 1.4);
        ctx.fillStyle = i % 2 === 0
          ? 'rgba(0, 229, 255, ' + pulse.toFixed(2) + ')'
          : 'rgba(179, 136, 255, ' + pulse.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(bx + pts[i][0], pts[i][1], 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawCloudTpuMid(ctx, worldDist, timeSec) {
    // Iconic Google 4-color Data Center overhead cooling pipes
    const pipes = [
      { y: 92, col: '#4285F4', hi: '#8ab4f8' },
      { y: 106, col: '#EA4335', hi: '#f6aea9' },
      { y: 120, col: '#FBBC04', hi: '#fde293' },
      { y: 134, col: '#34A853', hi: '#81c995' }
    ];
    for (let i = 0; i < pipes.length; i++) {
      ctx.fillStyle = pipes[i].col;
      ctx.fillRect(0, pipes[i].y, STAGE_W, 8);
      ctx.fillStyle = pipes[i].hi;
      ctx.fillRect(0, pipes[i].y + 1.5, STAGE_W, 2);
    }

    // Pipe flange joints + TPU server pod aisles
    const span = 320;
    const shift = modPositive(worldDist * 0.13, span);
    for (let rep = -1; rep <= 3; rep++) {
      const ox = -shift + rep * span;

      // Pipe collar brackets
      ctx.fillStyle = '#26344d';
      ctx.fillRect(ox + 34, 88, 10, 58);
      ctx.fillRect(ox + 194, 88, 10, 58);

      // TPU Pod server rack bank
      for (let r = 0; r < 3; r++) {
        const rx = ox + 58 + r * 44;
        const ry = GROUND_Y - 118;
        ctx.fillStyle = '#111a2e';
        ctx.strokeStyle = '#2c426b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(rx, ry, 36, 118);
        ctx.strokeRect(rx, ry, 36, 118);

        // Glowing TPU blade rows + blinking status LEDs
        for (let row = 0; row < 8; row++) {
          const by = ry + 10 + row * 12.5;
          ctx.fillStyle = '#1b2c4c';
          ctx.fillRect(rx + 4, by, 28, 7);
          const blink = Math.sin(timeSec * 5 + r * 2.1 + row * 0.9) > 0.15;
          ctx.fillStyle = blink ? (row % 3 === 0 ? '#00e5ff' : '#34a853') : '#1c3e5e';
          ctx.fillRect(rx + 7, by + 2, 4, 3);
          ctx.fillStyle = row % 2 === 0 ? '#8ab4f8' : '#b388ff';
          ctx.fillRect(rx + 14, by + 2.5, 14, 2);
        }
      }

      // Subtle glowing TPU POD sign
      ctx.fillStyle = '#0d1b36';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(ox + 214, GROUND_Y - 94, 82, 22, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7ef9ff';
      ctx.font = '700 8.5px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TPU POD v6', ox + 255, GROUND_Y - 80);
    }
  }

  function drawCloudTpuFore(ctx, worldDist) {
    const span = 280;
    const shift = modPositive(worldDist * 0.30, span);
    for (let rep = -1; rep <= 4; rep++) {
      const ox = -shift + rep * span;
      // Fiber-optic conduit stanchions
      ctx.fillStyle = '#20314f';
      ctx.fillRect(ox + 40, GROUND_Y - 40, 5, 40);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(ox + 41.5, GROUND_Y - 36, 2, 24);
      // Glowing fiber strip along base
      ctx.fillStyle = 'rgba(0, 229, 255, 0.38)';
      ctx.fillRect(ox, GROUND_Y - 12, span, 2);
    }
  }

  // =========================================================================
  // SECRET LEVEL 8: GOOGLE X -> THE MOON (MOONSHOT FACTORY)
  // =========================================================================
  function drawMoonshotFar(ctx, worldDist, timeSec) {
    // Glowing Earth rising on the lunar horizon!
    const earthX = 760 - modPositive(worldDist * 0.015, 220);
    const earthY = 98;
    const earthR = 42;
    ctx.save();
    const atmo = ctx.createRadialGradient(earthX, earthY, earthR * 0.85, earthX, earthY, earthR * 1.45);
    atmo.addColorStop(0, 'rgba(79, 195, 247, 0.45)');
    atmo.addColorStop(1, 'rgba(79, 195, 247, 0)');
    ctx.fillStyle = atmo;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR * 1.45, 0, Math.PI * 2);
    ctx.fill();

    // Ocean sphere
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.clip();
    const ocean = ctx.createRadialGradient(earthX - 14, earthY - 14, 4, earthX, earthY, earthR);
    ocean.addColorStop(0, '#4fc3f7');
    ocean.addColorStop(0.7, '#1a73e8');
    ocean.addColorStop(1, '#0b2e6f');
    ctx.fillStyle = ocean;
    ctx.fillRect(earthX - earthR, earthY - earthR, earthR * 2, earthR * 2);

    // Continents
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(earthX - 10, earthY - 8, 14, 10, -0.3, 0, Math.PI * 2);
    ctx.ellipse(earthX + 15, earthY + 8, 12, 16, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Swirl clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(earthX - 4, earthY - 16, 18, 4.5, 0.15, 0, Math.PI * 2);
    ctx.ellipse(earthX + 8, earthY + 14, 16, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Distant floating Project Loon balloon + Wing drone silhouette
    const loonX = 240 - modPositive(worldDist * 0.04, 1060) + 120;
    const loonY = 66 + Math.sin(timeSec * 1.6) * 5;
    ctx.save();
    ctx.fillStyle = 'rgba(220, 232, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(loonX, loonY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220, 232, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(loonX, loonY + 11);
    ctx.lineTo(loonX, loonY + 20);
    ctx.stroke();
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(loonX - 4, loonY + 20, 8, 3);
    ctx.restore();

    // Distant lunar ridge silhouette
    const ridgeSpan = 480;
    const ridgeShift = modPositive(worldDist * 0.06, ridgeSpan);
    ctx.fillStyle = '#383e4d';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = -ridgeShift; x <= STAGE_W + ridgeSpan; x += 120) {
      ctx.lineTo(x + 40, GROUND_Y - 72);
      ctx.lineTo(x + 90, GROUND_Y - 52);
      ctx.lineTo(x + 120, GROUND_Y - 82);
    }
    ctx.lineTo(STAGE_W + ridgeSpan, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }

  function drawMoonshotMid(ctx, worldDist, timeSec) {
    const span = 460;
    const shift = modPositive(worldDist * 0.13, span);
    for (let rep = -1; rep <= 3; rep++) {
      const ox = -shift + rep * span;

      // Lunar crater hills
      ctx.fillStyle = '#555c6d';
      ctx.beginPath();
      ctx.ellipse(ox + 95, GROUND_Y, 85, 34, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#444a59';
      ctx.beginPath();
      ctx.ellipse(ox + 95, GROUND_Y - 12, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Google X Moonshot Factory lunar dome base
      ctx.fillStyle = '#d8dee9';
      ctx.beginPath();
      ctx.arc(ox + 265, GROUND_Y - 6, 48, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8e99ad';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing dome viewport windows
      ctx.fillStyle = '#7ef9ff';
      for (let w = 0; w < 4; w++) {
        ctx.fillRect(ox + 234 + w * 17, GROUND_Y - 26, 10, 8);
      }

      // Giant yellow/white "X" Moonshot badge on dome
      ctx.strokeStyle = '#FBBC04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox + 258, GROUND_Y - 44);
      ctx.lineTo(ox + 272, GROUND_Y - 30);
      ctx.moveTo(ox + 272, GROUND_Y - 44);
      ctx.lineTo(ox + 258, GROUND_Y - 30);
      ctx.stroke();

      // Parabolic deep-space comms dish beside dome
      ctx.fillStyle = '#9aa0a6';
      ctx.fillRect(ox + 338, GROUND_Y - 32, 6, 32);
      ctx.strokeStyle = '#e8eaed';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ox + 344, GROUND_Y - 44, 18, 0.35 * Math.PI, 1.25 * Math.PI);
      ctx.stroke();
      const ping = 0.4 + 0.6 * Math.abs(Math.sin(timeSec * 3));
      ctx.fillStyle = 'rgba(179, 136, 255, ' + ping.toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(ox + 354, GROUND_Y - 50, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMoonshotFore(ctx, worldDist) {
    const span = 260;
    const shift = modPositive(worldDist * 0.30, span);
    for (let rep = -1; rep <= 4; rep++) {
      const ox = -shift + rep * span;
      // Small lunar craters & beacon posts
      ctx.fillStyle = '#4c5261';
      ctx.beginPath();
      ctx.ellipse(ox + 60, GROUND_Y - 3, 18, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b8bec9';
      ctx.fillRect(ox + 185, GROUND_Y - 28, 2.5, 28);
      ctx.fillStyle = '#b388ff';
      ctx.beginPath();
      ctx.arc(ox + 186.2, GROUND_Y - 30, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================================================================
  // SECRET LEVEL 9: CHROME DINO DESERT (ERR_INTERNET_DISCONNECTED)
  // =========================================================================
  function drawDinoDesertFar(ctx, worldDist, dinoNight) {
    const ink = dinoNight ? '#c8ccd4' : '#535353';
    const faint = dinoNight ? 'rgba(200, 204, 212, 0.25)' : 'rgba(83, 83, 83, 0.22)';

    // Subtle retro Chrome offline header in sky
    ctx.save();
    ctx.fillStyle = faint;
    ctx.font = '700 11px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ERR_INTERNET_DISCONNECTED', STAGE_W * 0.5, 44);
    ctx.restore();

    // Classic blocky Chrome Dino pixel clouds
    const span = 640;
    const shift = modPositive(worldDist * 0.05, span);
    const cloudPos = [[90, 74], [290, 56], [490, 82]];
    ctx.fillStyle = dinoNight ? '#3a3d45' : '#dcdcdc';
    for (let rep = -1; rep <= 2; rep++) {
      for (let i = 0; i < cloudPos.length; i++) {
        const cx = -shift + rep * span + cloudPos[i][0];
        const cy = cloudPos[i][1];
        ctx.fillRect(cx, cy + 8, 46, 6);
        ctx.fillRect(cx + 8, cy + 2, 28, 6);
        ctx.fillRect(cx + 16, cy - 3, 14, 5);
      }
    }

    // Crescent moon in Chrome Dino Night Mode
    if (dinoNight) {
      ctx.save();
      ctx.fillStyle = '#d8dadf';
      ctx.beginPath();
      ctx.arc(820, 62, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1d21';
      ctx.beginPath();
      ctx.arc(827, 58, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Distant cheering Pixel T-Rex cameo on a mesa!
    const rexSpan = 960;
    const rexShift = modPositive(worldDist * 0.08, rexSpan);
    const rx = STAGE_W - rexShift;
    ctx.save();
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.26;
    // Pixel T-Rex silhouette
    ctx.fillRect(rx + 12, GROUND_Y - 46, 18, 12); // head
    ctx.fillRect(rx + 18, GROUND_Y - 43, 3, 3);   // eye cutout skipped via bg? subtle!
    ctx.fillRect(rx + 8, GROUND_Y - 34, 14, 16);  // torso
    ctx.fillRect(rx + 2, GROUND_Y - 28, 8, 8);    // tail
    ctx.fillRect(rx + 10, GROUND_Y - 18, 4, 10);  // leg 1
    ctx.fillRect(rx + 17, GROUND_Y - 18, 4, 10);  // leg 2
    ctx.restore();
  }

  function drawDinoDesertMid(ctx, worldDist, dinoNight) {
    const mesa = dinoNight ? '#2b2d34' : '#e6e6e6';
    const span = 520;
    const shift = modPositive(worldDist * 0.13, span);
    ctx.fillStyle = mesa;
    for (let rep = -1; rep <= 3; rep++) {
      const ox = -shift + rep * span;
      // Stepped pixel desert mesas
      ctx.fillRect(ox + 40, GROUND_Y - 22, 110, 22);
      ctx.fillRect(ox + 60, GROUND_Y - 38, 70, 16);
      ctx.fillRect(ox + 310, GROUND_Y - 16, 86, 16);
      ctx.fillRect(ox + 328, GROUND_Y - 28, 48, 12);
    }
  }

  function drawDinoDesertFore(ctx, worldDist, dinoNight) {
    const ink = dinoNight ? '#9aa0a6' : '#535353';
    const span = 180;
    const shift = modPositive(worldDist * 0.30, span);
    ctx.fillStyle = ink;
    for (let rep = -1; rep <= 6; rep++) {
      const ox = -shift + rep * span;
      // Classic Chrome Dino desert pebbles & ground bumps
      ctx.fillRect(ox + 22, GROUND_Y - 3, 12, 2);
      ctx.fillRect(ox + 26, GROUND_Y - 5, 4, 2);
      ctx.fillRect(ox + 110, GROUND_Y - 2, 6, 2);
    }
  }

  // =========================================================================
  // GRAND FINALE: END OF THE EARTH (FLAT EARTH CLIFF + COSMOS + NEON SIGN)
  // =========================================================================
  function renderEndOfEarth(ctx, state) {
    const timeSec = state.timeSec || 0;
    const viewWidth = state.viewWidth || STAGE_W;
    const viewOffsetX = state.viewOffsetX || 0;
    const viewHeight = state.viewHeight || STAGE_H;
    const stageTop = state.stageTop || 0;

    // 1. Deep Cosmos Background filling the ENTIRE viewport
    ctx.save();
    const cosmosGrad = ctx.createLinearGradient(0, -stageTop, viewWidth, viewHeight - stageTop);
    cosmosGrad.addColorStop(0, '#040612');
    cosmosGrad.addColorStop(0.45, '#0b0f29');
    cosmosGrad.addColorStop(0.78, '#170c30');
    cosmosGrad.addColorStop(1, '#050714');
    ctx.fillStyle = cosmosGrad;
    ctx.fillRect(viewOffsetX - 20, -stageTop - 20, viewWidth + 40, viewHeight + 40);

    // Colorful Cosmic Nebulae
    const nebulae = [
      { x: viewOffsetX + viewWidth * 0.68, y: 120, r: 220, col: 'rgba(138, 43, 226, 0.24)' },
      { x: viewOffsetX + viewWidth * 0.48, y: 195, r: 190, col: 'rgba(0, 229, 255, 0.16)' },
      { x: viewOffsetX + viewWidth * 0.82, y: 215, r: 175, col: 'rgba(255, 61, 245, 0.18)' }
    ];
    for (let i = 0; i < nebulae.length; i++) {
      const n = nebulae[i];
      const ng = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
      ng.addColorStop(0, n.col);
      ng.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dense organic twinkling starfield across full cosmos
    for (let s = 0; s < 110; s++) {
      const hx = Math.sin(s * 127.1 + 311.7) * 43758.5453;
      const hy = Math.sin(s * 269.5 + 183.3) * 43758.5453;
      const rx = hx - Math.floor(hx);
      const ry = hy - Math.floor(hy);
      const sx = viewOffsetX + rx * Math.max(500, viewWidth);
      const sy = -stageTop + ry * Math.max(340, viewHeight);
      const tw = 0.38 + 0.62 * Math.sin(timeSec * (1.8 + (s % 4) * 0.5) + s * 1.7);
      const rad = s % 10 === 0 ? 2.1 : (s % 3 === 0 ? 1.4 : 0.9);
      ctx.fillStyle = s % 11 === 0
        ? 'rgba(126, 249, 255, ' + tw.toFixed(2) + ')'
        : (s % 13 === 0 ? 'rgba(255, 170, 245, ' + tw.toFixed(2) + ')' : 'rgba(255, 255, 255, ' + tw.toFixed(2) + ')');
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ringed cosmic planet in upper right cosmos
    const px = viewOffsetX + viewWidth * 0.87;
    const py = 56;
    ctx.save();
    ctx.translate(px, py);
    ctx.strokeStyle = 'rgba(255, 195, 113, 0.55)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 9, -0.28, 0, Math.PI * 2);
    ctx.stroke();
    const pg = ctx.createRadialGradient(-6, -6, 2, 0, 0, 18);
    pg.addColorStop(0, '#ffcf98');
    pg.addColorStop(0.65, '#c864b4');
    pg.addColorStop(1, '#3c1e5e');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Occasional shooting star
    const shootCycle = (timeSec * 0.42) % 3.2;
    if (shootCycle < 0.7) {
      const st = shootCycle / 0.7;
      const sx0 = viewOffsetX + viewWidth * 0.82 - st * 220;
      const sy0 = 26 + st * 90;
      const sg = ctx.createLinearGradient(sx0, sy0, sx0 + 54, sy0 - 22);
      sg.addColorStop(0, 'rgba(255,255,255,0.95)');
      sg.addColorStop(1, 'rgba(126,249,255,0)');
      ctx.strokeStyle = sg;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx0, sy0);
      ctx.lineTo(sx0 + 54, sy0 - 22);
      ctx.stroke();
    }

    // 2. Flat-Earth Cliff Edge (left side ends sharply into the cosmos!)
    const cliffX = 342;
    const slabBottom = STAGE_H + Math.max(80, viewHeight - stageTop - STAGE_H + 40);

    // Rocky subterranean flat-earth slab
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.moveTo(-20, GROUND_Y);
    ctx.lineTo(cliffX, GROUND_Y);
    ctx.lineTo(cliffX + 6, GROUND_Y + 14);
    ctx.lineTo(cliffX - 10, GROUND_Y + 34);
    ctx.lineTo(cliffX - 22, GROUND_Y + 58);
    ctx.lineTo(cliffX - 48, slabBottom);
    ctx.lineTo(-20, slabBottom);
    ctx.closePath();
    ctx.fill();

    // Lighter stone strata layer
    ctx.fillStyle = '#634b38';
    ctx.beginPath();
    ctx.moveTo(-20, GROUND_Y + 14);
    ctx.lineTo(cliffX + 2, GROUND_Y + 14);
    ctx.lineTo(cliffX - 8, GROUND_Y + 32);
    ctx.lineTo(-20, GROUND_Y + 32);
    ctx.closePath();
    ctx.fill();

    // Asphalt bike path ending right at the cliff
    ctx.fillStyle = '#6b727a';
    ctx.fillRect(-20, GROUND_Y + 4, cliffX + 16, 18);
    ctx.fillStyle = '#42a362';
    ctx.fillRect(-20, GROUND_Y + 9, cliffX + 12, 8);
    ctx.fillStyle = '#eef7f0';
    for (let dx = 12; dx < cliffX - 24; dx += 52) {
      ctx.fillRect(dx, GROUND_Y + 12, 22, 2);
    }

    // Grass turf lip overhanging cliff edge
    ctx.fillStyle = '#52b768';
    ctx.fillRect(-20, GROUND_Y - 3, cliffX + 22, 7);
    ctx.fillStyle = '#34a853';
    ctx.beginPath();
    ctx.moveTo(cliffX - 2, GROUND_Y + 4);
    ctx.lineTo(cliffX + 5, GROUND_Y + 12);
    ctx.lineTo(cliffX - 6, GROUND_Y + 10);
    ctx.closePath();
    ctx.fill();

    // 3. Cartoonish Wooden Sign: "DANGER: END OF THE EARTH"
    const signX = 294;
    const signBaseY = GROUND_Y + 2;
    ctx.save();
    ctx.translate(signX, signBaseY);
    ctx.rotate(0.055); // playful cartoonish lean toward the cliff

    // Wooden post
    ctx.fillStyle = '#6d4528';
    ctx.strokeStyle = '#3a2212';
    ctx.lineWidth = 2;
    ctx.fillRect(-5, -108, 10, 110);
    ctx.strokeRect(-5, -108, 10, 110);

    // Top plank ("DANGER:")
    ctx.save();
    ctx.rotate(-0.04);
    ctx.fillStyle = '#9e6839';
    ctx.strokeStyle = '#3a2212';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-64, -104, 128, 28, 4);
    ctx.fill();
    ctx.stroke();

    // Wood grain lines
    ctx.strokeStyle = 'rgba(58, 34, 18, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-56, -96);
    ctx.lineTo(48, -96);
    ctx.moveTo(-42, -83);
    ctx.lineTo(54, -83);
    ctx.stroke();

    // Silver nail heads
    ctx.fillStyle = '#d9dee3';
    ctx.beginPath();
    ctx.arc(-52, -90, 2.2, 0, Math.PI * 2);
    ctx.arc(52, -90, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#611a15';
    ctx.lineWidth = 2.5;
    ctx.font = '900 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('DANGER:', 0, -90);
    ctx.fillText('DANGER:', 0, -90);
    ctx.restore();

    // Bottom plank ("END OF THE EARTH")
    ctx.save();
    ctx.rotate(0.025);
    ctx.fillStyle = '#8b572c';
    ctx.strokeStyle = '#3a2212';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-72, -74, 144, 30, 4);
    ctx.fill();
    ctx.stroke();

    // Wood grain + nails
    ctx.strokeStyle = 'rgba(58, 34, 18, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-62, -66);
    ctx.lineTo(58, -66);
    ctx.moveTo(-50, -51);
    ctx.lineTo(62, -51);
    ctx.stroke();

    ctx.fillStyle = '#d9dee3';
    ctx.beginPath();
    ctx.arc(-62, -59, 2.2, 0, Math.PI * 2);
    ctx.arc(62, -59, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff8dc';
    ctx.strokeStyle = '#3a2212';
    ctx.lineWidth = 2.4;
    ctx.font = '900 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('END OF THE EARTH', 0, -59);
    ctx.fillText('END OF THE EARTH', 0, -59);
    ctx.restore();
    ctx.restore(); // end wooden sign

    // 4. Lit-Up Neon Sign over the Cosmos: "THANKS FOR PLAYING" / "MADE BY GEMINI NEON"
    const isNarrow = viewWidth < 620;
    const neonCx = isNarrow ? (viewOffsetX + viewWidth * 0.5) : 648;
    const neonCy = isNarrow ? Math.max(58, -stageTop * 0.35 + 88) : 138;
    const signW = isNarrow ? Math.min(viewWidth - 26, 430) : 458;
    const signH = isNarrow ? 106 : 124;

    // Realistic subtle neon tube hum / flicker
    const flicker = 0.94 + 0.06 * Math.sin(timeSec * 19.0) * Math.sin(timeSec * 3.7);
    const pulse = 0.88 + 0.12 * Math.sin(timeSec * 2.6);

    ctx.save();
    ctx.translate(neonCx, neonCy);

    // Subtle dark glass backing so neon pops cleanly
    ctx.fillStyle = 'rgba(6, 9, 24, 0.42)';
    ctx.beginPath();
    ctx.roundRect(-signW * 0.5, -signH * 0.5, signW, signH, 18);
    ctx.fill();

    // Glowing outer neon border tube (dual-tone cyan/magenta)
    ctx.save();
    ctx.globalAlpha = flicker;
    ctx.strokeStyle = '#38e8ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 18 * pulse;
    ctx.beginPath();
    ctx.roundRect(-signW * 0.5, -signH * 0.5, signW, signH, 18);
    ctx.stroke();

    // Inner bright tube filament
    ctx.strokeStyle = '#d6fbff';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();

    // MAIN NEON TEXT: "THANKS FOR PLAYING"
    const mainFontSize = isNarrow ? 25 : 32;
    ctx.font = '900 ' + mainFontSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outer cyan glow pass
    ctx.save();
    ctx.globalAlpha = flicker;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 24 * pulse;
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 4;
    ctx.strokeText('THANKS FOR PLAYING', 0, -16);
    // Mid bright glow pass
    ctx.shadowColor = '#7ef9ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#c8fbff';
    ctx.fillText('THANKS FOR PLAYING', 0, -16);
    // White-hot neon core
    ctx.shadowBlur = 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('THANKS FOR PLAYING', 0, -16);
    ctx.restore();

    // SUBTEXT NEON: "MADE BY GEMINI NEON"
    const subFontSize = isNarrow ? 14.5 : 17.5;
    ctx.font = '800 ' + subFontSize + 'px ui-monospace, SFMono-Regular, Menlo, monospace';

    ctx.save();
    ctx.globalAlpha = 0.95 + 0.05 * Math.sin(timeSec * 13.0 + 1.1);
    ctx.shadowColor = '#ff2df0';
    ctx.shadowBlur = 20 * pulse;
    ctx.strokeStyle = '#ff3df5';
    ctx.lineWidth = 3;
    ctx.strokeText('✦ MADE BY GEMINI NEON ✦', 0, 24);
    ctx.shadowColor = '#ff9ef8';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffd1fc';
    ctx.fillText('✦ MADE BY GEMINI NEON ✦', 0, 24);
    ctx.shadowBlur = 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('✦ MADE BY GEMINI NEON ✦', 0, 24);
    ctx.restore();

    ctx.restore(); // end neon sign
    ctx.restore(); // end cosmos
  }

  function drawCampusLayers(ctx, campusId, worldDist, timeSec, palette, alpha, dinoNight) {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (campusId === 'sydney') {
      drawSydneyFar(ctx, worldDist);
      drawSydneyMid(ctx, worldDist, timeSec);
      drawSydneyFore(ctx, worldDist);
    } else if (campusId === 'new-york') {
      drawNewYorkFar(ctx, worldDist, palette);
      drawNewYorkMid(ctx, worldDist, timeSec);
      drawNewYorkFore(ctx, worldDist);
    } else if (campusId === 'mountain-view') {
      drawMountainViewFar(ctx, worldDist, palette);
      drawMountainViewMid(ctx, worldDist);
      drawMountainViewFore(ctx, worldDist);
    } else if (campusId === 'london') {
      drawLondonFar(ctx, worldDist, palette);
      drawLondonMid(ctx, worldDist, timeSec);
      drawLondonFore(ctx, worldDist);
    } else if (campusId === 'tokyo') {
      drawTokyoFar(ctx, worldDist, palette);
      drawTokyoMid(ctx, worldDist, timeSec);
      drawTokyoFore(ctx, worldDist);
    } else if (campusId === 'zurich') {
      drawZurichFar(ctx, worldDist);
      drawZurichMid(ctx, worldDist, timeSec);
      drawZurichFore(ctx, worldDist);
    } else if (campusId === 'cloud-tpu') {
      drawCloudTpuFar(ctx, worldDist, timeSec);
      drawCloudTpuMid(ctx, worldDist, timeSec);
      drawCloudTpuFore(ctx, worldDist);
    } else if (campusId === 'moonshot-moon') {
      drawMoonshotFar(ctx, worldDist, timeSec);
      drawMoonshotMid(ctx, worldDist, timeSec);
      drawMoonshotFore(ctx, worldDist);
    } else if (campusId === 'dino-desert') {
      drawDinoDesertFar(ctx, worldDist, dinoNight);
      drawDinoDesertMid(ctx, worldDist, dinoNight);
      drawDinoDesertFore(ctx, worldDist, dinoNight);
    }
    ctx.restore();
  }

  function drawGround(ctx, worldDist, pA, pB, blend) {
    const curbCol = lerpHexColor(pA.curbFill, pB.curbFill, blend);
    const roadCol = lerpHexColor(pA.roadFill, pB.roadFill, blend);
    const laneCol = lerpHexColor(pA.laneFill, pB.laneFill, blend);
    const stripeCol = lerpHexColor(pA.laneStripe, pB.laneStripe, blend);
    const edgeCol = lerpHexColor(pA.edgeAccent, pB.edgeAccent, blend);

    // Grass / landscaping verge lip right behind curb
    ctx.fillStyle = edgeCol;
    ctx.fillRect(0, GROUND_Y - 3, STAGE_W, 4);

    // Curb
    ctx.fillStyle = curbCol;
    ctx.fillRect(0, GROUND_Y, STAGE_W, 6);

    // Main bike path road
    ctx.fillStyle = roadCol;
    ctx.fillRect(0, GROUND_Y + 6, STAGE_W, STAGE_H - (GROUND_Y + 6));

    // Campus bike lane tint strip
    ctx.fillStyle = laneCol;
    ctx.fillRect(0, GROUND_Y + 14, STAGE_W, 18);

    // Crisp moving bike-lane dashes
    const dashSpan = 64;
    const dashShift = modPositive(worldDist, dashSpan);
    ctx.fillStyle = stripeCol;
    for (let dx = -dashShift; dx < STAGE_W + dashSpan; dx += dashSpan) {
      ctx.fillRect(dx, GROUND_Y + 22, 26, 2.5);
    }

    // Subtle asphalt texture ticks
    const tickSpan = 96;
    const tickShift = modPositive(worldDist, tickSpan);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    for (let tx = -tickShift; tx < STAGE_W + tickSpan; tx += tickSpan) {
      ctx.fillRect(tx + 12, GROUND_Y + 42, 14, 2);
      ctx.fillRect(tx + 54, GROUND_Y + 48, 8, 2);
    }
  }

  function drawMilestoneGates(ctx, score, endlessMode) {
    const pelicanFrontX = 186;
    const gates = LIST.slice(1).map(function (c) {
      return {
        targetScore: c.startScore,
        title: c.shortName.toUpperCase() + ' · ' + c.difficultyLabel,
        sub: c.landmark.toUpperCase(),
        color: c.badgeColor
      };
    });

    for (let i = 0; i < gates.length; i++) {
      const g = gates[i];
      const rel = endlessMode
        ? modPositive(g.targetScore - modPositive(score, SECRET_FINISH) + 300, SECRET_FINISH) - 300
        : g.targetScore - score;
      const gx = pelicanFrontX + rel * PIXELS_PER_PT;
      if (gx < -160 || gx > STAGE_W + 160) continue;

      // Welcome archway signpost
      ctx.save();
      ctx.fillStyle = '#3c4043';
      ctx.fillRect(gx - 3, GROUND_Y - 122, 6, 122);
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.roundRect(gx - 88, GROUND_Y - 134, 176, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 9.5px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(g.title, gx, GROUND_Y - 119);
      ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(g.sub, gx, GROUND_Y - 105);
      ctx.restore();
    }
  }

  function drawAtmosphericVeil(ctx, pA, pB, blend) {
    const horizon = lerpHexColor(pA.skyHorizon, pB.skyHorizon, blend);
    ctx.save();
    const grad = ctx.createLinearGradient(0, 60, 0, GROUND_Y);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.55, horizon);
    grad.addColorStop(1, horizon);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 60, STAGE_W, GROUND_Y - 60);
    ctx.restore();
  }

  function renderBackdrop(ctx, state) {
    const campusInfo = getCampusState(state.score, state.endlessMode, state.secretTour);
    const cur = campusInfo.current;
    const nxt = campusInfo.next;
    const blend = campusInfo.blend;
    const dinoNight = Boolean(campusInfo.dinoNight);
    const endlessNightBoost = state.endlessMode && campusInfo.cycleIndex % 2 === 1 ? 0.65 : 0;
    const bgDist = state.bgDist !== undefined ? state.bgDist : state.worldDist;

    const DINO_NIGHT_PAL = {
      skyTop: '#1c1d21',
      skyMid: '#1c1d21',
      skyHorizon: '#1c1d21',
      sunX: 820,
      sunY: 62,
      sunColor: '#1c1d21',
      sunGlow: '#1c1d21',
      cloudFill: '#3a3d45',
      farRidge: '#2b2d34',
      nearRidge: '#3c4043',
      roadFill: '#1c1d21',
      curbFill: '#c8ccd4',
      laneFill: '#24262c',
      laneStripe: '#9aa0a6',
      edgeAccent: '#c8ccd4',
      starsAlpha: 0.75
    };

    const curPal = (cur.id === 'dino-desert' && dinoNight) ? DINO_NIGHT_PAL : cur.palette;
    const nxtPal = (nxt.id === 'dino-desert' && dinoNight) ? DINO_NIGHT_PAL : nxt.palette;

    drawSkyAndSun(ctx, curPal, nxtPal, blend, state.timeSec, cur.isSecret ? 0 : endlessNightBoost);
    if (!cur.isSecret) {
      drawClouds(ctx, bgDist, lerpHexColor(curPal.cloudFill, nxtPal.cloudFill, blend));
    }

    if (blend <= 0.01) {
      drawCampusLayers(ctx, cur.id, bgDist, state.timeSec, curPal, 1, dinoNight);
    } else {
      drawCampusLayers(ctx, cur.id, bgDist, state.timeSec, curPal, 1 - blend, dinoNight);
      drawCampusLayers(ctx, nxt.id, bgDist, state.timeSec, nxtPal, blend, dinoNight);
    }

    if (!cur.isSecret) {
      drawAtmosphericVeil(ctx, curPal, nxtPal, blend);
    }
    drawGround(ctx, state.worldDist, curPal, nxtPal, blend);
    drawMilestoneGates(ctx, state.score, state.endlessMode);

    return campusInfo;
  }

  global.PelicanGame = global.PelicanGame || {};
  global.PelicanGame.Campuses = {
    STAGE_W: STAGE_W,
    STAGE_H: STAGE_H,
    GROUND_Y: GROUND_Y,
    CAMPUS_SPAN: CAMPUS_SPAN,
    TOUR_FINISH: TOUR_FINISH,
    SECRET_FINISH: SECRET_FINISH,
    PIXELS_PER_PT: PIXELS_PER_PT,
    LIST: LIST,
    getCampusById: getCampusById,
    getCampusState: getCampusState,
    renderBackdrop: renderBackdrop,
    renderEndOfEarth: renderEndOfEarth
  };
})(window);
