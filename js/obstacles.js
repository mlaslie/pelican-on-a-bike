(function (global) {
  'use strict';

  const STAGE_W = 960;
  const GROUND_Y = 282;

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const CATALOG = {
    'mountain-view': {
      ground: [
        { kind: 'gbike-parked', w: 54, h: 42 },
        { kind: 'android-statue', w: 36, h: 48 },
        { kind: 'noogler-pack', w: 38, h: 42 }
      ],
      aerial: [
        { kind: 'seagull', w: 50, h: 26 },
        { kind: 'paper-plane', w: 46, h: 22 }
      ]
    },
    london: {
      ground: [
        { kind: 'postbox', w: 34, h: 50 },
        { kind: 'bollards', w: 50, h: 36 },
        { kind: 'umbrella-stand', w: 44, h: 44 }
      ],
      aerial: [
        { kind: 'pigeon', w: 46, h: 26 }
      ]
    },
    tokyo: {
      ground: [
        { kind: 'vending-machine', w: 40, h: 54 },
        { kind: 'tokyo-barricade', w: 52, h: 36 },
        { kind: 'delivery-crates', w: 42, h: 42 }
      ],
      aerial: [
        { kind: 'tokyo-drone', w: 50, h: 26 },
        { kind: 'origami-crane', w: 48, h: 26 }
      ]
    },
    zurich: {
      ground: [
        { kind: 'brewery-bollard', w: 42, h: 44 },
        { kind: 'tram-sign', w: 34, h: 52 },
        { kind: 'alpine-planter', w: 56, h: 38 }
      ],
      aerial: [
        { kind: 'alpine-swift', w: 50, h: 24 }
      ]
    }
  };

  // =========================================================================
  // OBSTACLE VECTOR RENDERERS
  // =========================================================================
  function drawShadow(ctx, x, w, isAerial) {
    ctx.save();
    ctx.fillStyle = isAerial ? 'rgba(32, 33, 36, 0.14)' : 'rgba(32, 33, 36, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, GROUND_Y + 2, w * (isAerial ? 0.36 : 0.48), isAerial ? 3.5 : 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParkedGBike(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Wheels
    ctx.strokeStyle = '#202124';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(11, h - 11, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(43, h - 11, 10, 0, Math.PI * 2);
    ctx.stroke();
    // 4-color frame
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#EA4335';
    ctx.beginPath();
    ctx.moveTo(11, h - 11);
    ctx.lineTo(24, h - 11);
    ctx.lineTo(19, h - 25);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = '#4285F4';
    ctx.beginPath();
    ctx.moveTo(19, h - 25);
    ctx.lineTo(36, h - 26);
    ctx.lineTo(24, h - 11);
    ctx.stroke();
    ctx.strokeStyle = '#FBBC04';
    ctx.beginPath();
    ctx.moveTo(43, h - 11);
    ctx.lineTo(36, h - 32);
    ctx.lineTo(41, h - 33);
    ctx.stroke();
    // Green basket
    ctx.fillStyle = '#34A853';
    ctx.fillRect(39, h - 30, 10, 8);
    // Saddle
    ctx.fillStyle = '#202124';
    ctx.fillRect(15, h - 29, 8, 3);
    ctx.restore();
  }

  function drawAndroidStatue(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Pedestal base
    ctx.fillStyle = '#bdc1c6';
    ctx.fillRect(4, h - 5, w - 8, 5);
    // Friendly Bugdroid green body
    ctx.fillStyle = '#3ddc84';
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 1.4;
    // Legs
    ctx.beginPath();
    ctx.roundRect(10, h - 16, 6, 12, 3);
    ctx.roundRect(20, h - 16, 6, 12, 3);
    ctx.fill();
    ctx.stroke();
    // Torso
    ctx.beginPath();
    ctx.roundRect(7, h - 32, 22, 18, [2, 2, 5, 5]);
    ctx.fill();
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.roundRect(1, h - 31, 5, 14, 2.5);
    ctx.roundRect(30, h - 31, 5, 14, 2.5);
    ctx.fill();
    ctx.stroke();
    // Dome head
    ctx.beginPath();
    ctx.arc(18, h - 34, 11, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Antennae
    ctx.strokeStyle = '#3ddc84';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, h - 42);
    ctx.lineTo(8, h - 48);
    ctx.moveTo(24, h - 42);
    ctx.lineTo(28, h - 48);
    ctx.stroke();
    // White eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(13.5, h - 38.5, 1.7, 0, Math.PI * 2);
    ctx.arc(22.5, h - 38.5, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNooglerPack(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Crate
    ctx.fillStyle = '#d7a86e';
    ctx.strokeStyle = '#8b5e34';
    ctx.lineWidth = 1.4;
    ctx.fillRect(2, h - 24, w - 4, 24);
    ctx.strokeRect(2, h - 24, w - 4, 24);
    ctx.beginPath();
    ctx.moveTo(2, h - 12);
    ctx.lineTo(w - 2, h - 12);
    ctx.stroke();

    // Noogler Propeller Beanie on top!
    const cx = w * 0.5;
    const capY = h - 24;
    ctx.fillStyle = '#4285F4';
    ctx.beginPath();
    ctx.arc(cx, capY, 11, Math.PI, Math.PI * 1.33);
    ctx.lineTo(cx, capY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#EA4335';
    ctx.beginPath();
    ctx.arc(cx, capY, 11, Math.PI * 1.33, Math.PI * 1.66);
    ctx.lineTo(cx, capY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#34A853';
    ctx.beginPath();
    ctx.arc(cx, capY, 11, Math.PI * 1.66, Math.PI * 2);
    ctx.lineTo(cx, capY);
    ctx.closePath();
    ctx.fill();
    // Yellow brim + propeller
    ctx.fillStyle = '#FBBC04';
    ctx.fillRect(cx - 12, capY - 2, 24, 3);
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, capY - 11);
    ctx.lineTo(cx, capY - 16);
    ctx.moveTo(cx - 8, capY - 16);
    ctx.lineTo(cx + 8, capY - 16);
    ctx.stroke();
    ctx.restore();
  }

  function drawPostbox(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Cylindrical British Royal Mail pillar box
    ctx.fillStyle = '#202124';
    ctx.fillRect(4, h - 6, w - 8, 6);
    ctx.fillStyle = '#d93025';
    ctx.strokeStyle = '#8c1d18';
    ctx.lineWidth = 1.4;
    ctx.fillRect(6, 12, w - 12, h - 18);
    ctx.strokeRect(6, 12, w - 12, h - 18);
    // Domed cap
    ctx.fillStyle = '#202124';
    ctx.beginPath();
    ctx.arc(w * 0.5, 12, (w - 8) * 0.5, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d93025';
    ctx.fillRect(4, 11, w - 8, 4);
    // Mail slot + collection plaque
    ctx.fillStyle = '#202124';
    ctx.fillRect(10, 19, w - 20, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 28, w - 22, 10);
    ctx.restore();
  }

  function drawBollards(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    const xs = [12, 36];
    for (let i = 0; i < xs.length; i++) {
      const bx = xs[i];
      ctx.fillStyle = '#2b2f36';
      ctx.fillRect(bx - 6, 8, 12, h - 8);
      ctx.beginPath();
      ctx.arc(bx, 8, 6, Math.PI, 0);
      ctx.fill();
      // Gold band
      ctx.fillStyle = '#fbbc04';
      ctx.fillRect(bx - 6, 13, 12, 3);
    }
    ctx.restore();
  }

  function drawUmbrellaStand(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Granite planter block
    ctx.fillStyle = '#9aa0a6';
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.3;
    ctx.fillRect(4, h - 16, w - 8, 16);
    ctx.strokeRect(4, h - 16, w - 8, 16);
    // Tipped vibrant red London brolly
    ctx.strokeStyle = '#5f4339';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(14, h - 14);
    ctx.lineTo(31, 6);
    ctx.stroke();
    ctx.fillStyle = '#ea4335';
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.quadraticCurveTo(22, 2, 38, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawVendingMachine(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Crisp Japanese beverage machine
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(2, 2, w - 4, h - 2, 4);
    ctx.fill();
    ctx.stroke();
    // Red/blue stripe header
    ctx.fillStyle = '#1a73e8';
    ctx.fillRect(3, 3, w - 6, 7);
    // Illuminated drink window
    ctx.fillStyle = '#e8f4fd';
    ctx.fillRect(6, 13, w - 12, 24);
    const cols = ['#ea4335', '#34a853', '#fbbc04', '#4285f4'];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = cols[(c + r) % 4];
        ctx.fillRect(8 + c * 6.5, 16 + r * 10, 4.5, 7);
      }
    }
    // Pickup dispenser flap
    ctx.fillStyle = '#202124';
    ctx.fillRect(8, h - 11, w - 16, 7);
    ctx.restore();
  }

  function drawTokyoBarricade(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // A-frame legs
    ctx.strokeStyle = '#3c4043';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, h);
    ctx.lineTo(14, 6);
    ctx.moveTo(w - 10, h);
    ctx.lineTo(w - 14, 6);
    ctx.stroke();
    // Yellow-black hazard bar
    ctx.fillStyle = '#fbbc04';
    ctx.fillRect(2, 8, w - 4, 11);
    ctx.fillStyle = '#202124';
    for (let sx = 6; sx < w - 10; sx += 12) {
      ctx.beginPath();
      ctx.moveTo(sx, 8);
      ctx.lineTo(sx + 6, 8);
      ctx.lineTo(sx + 2, 19);
      ctx.lineTo(sx - 4, 19);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawDeliveryCrates(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#4285F4';
    ctx.strokeStyle = '#185abc';
    ctx.lineWidth = 1.4;
    ctx.fillRect(3, h - 20, w - 6, 20);
    ctx.strokeRect(3, h - 20, w - 6, 20);
    ctx.fillStyle = '#fbbc04';
    ctx.strokeStyle = '#b06000';
    ctx.fillRect(6, h - 38, w - 12, 18);
    ctx.strokeRect(6, h - 38, w - 12, 18);
    ctx.restore();
  }

  function drawBreweryBollard(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Historic sandstone bollard with iron ring
    ctx.fillStyle = '#c8b28e';
    ctx.strokeStyle = '#7c694b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(8, 8, w - 16, h - 8, [10, 10, 2, 2]);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5f6368';
    ctx.fillRect(7, 16, w - 14, 4);
    ctx.beginPath();
    ctx.arc(w * 0.5, 25, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawTramSign(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#5f6368';
    ctx.fillRect(w * 0.5 - 2, 18, 4, h - 18);
    ctx.fillRect(w * 0.5 - 8, h - 5, 16, 5);
    // Swiss blue/white VBZ stop sign
    ctx.fillStyle = '#1d65b5';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.5, 13, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', w * 0.5, 13.5);
    ctx.restore();
  }

  function drawAlpinePlanter(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Stone planter box
    ctx.fillStyle = '#9aa0a6';
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.3;
    ctx.fillRect(2, h - 15, w - 4, 15);
    ctx.strokeRect(2, h - 15, w - 4, 15);
    // Dwarf Swiss Alpine pines
    const pines = [15, 29, 43];
    for (let i = 0; i < pines.length; i++) {
      const px = pines[i];
      ctx.fillStyle = i === 1 ? '#2e6f49' : '#3a8056';
      ctx.beginPath();
      ctx.moveTo(px, 2 + (i === 1 ? 0 : 5));
      ctx.lineTo(px - 10, h - 15);
      ctx.lineTo(px + 10, h - 15);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBirdObstacle(ctx, x, y, w, h, timeSec, colors) {
    const flap = Math.sin(timeSec * 14);
    ctx.save();
    ctx.translate(x + w * 0.5, y + h * 0.5);

    // Body
    ctx.fillStyle = colors.body;
    ctx.strokeStyle = '#3c4043';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Optional iridescent neck band (London pigeon)
    if (colors.neckBand) {
      ctx.fillStyle = colors.neckBand;
      ctx.fillRect(-10, -2, 5, 8);
    }

    // Beak facing left toward pelican
    ctx.fillStyle = colors.beak;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-24, 2);
    ctx.lineTo(-15, 4);
    ctx.closePath();
    ctx.fill();

    // Animated flapping wing
    ctx.fillStyle = colors.wing;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(6, -16 * flap - 2, 16, -9 * flap);
    ctx.quadraticCurveTo(8, 2, -3, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#202124';
    ctx.beginPath();
    ctx.arc(-11, 0, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPaperPlane(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Subtle 4-color vapor streak
    ctx.fillStyle = 'rgba(66, 133, 244, 0.35)';
    ctx.fillRect(w - 6, 8, 18, 2);
    ctx.fillStyle = 'rgba(234, 67, 53, 0.35)';
    ctx.fillRect(w - 4, 11, 14, 2);

    // Origami dart pointing left
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(w - 2, 2);
    ctx.lineTo(w - 8, 11);
    ctx.lineTo(w - 2, 19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#dce6f2';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(w - 8, 11);
    ctx.lineTo(w - 2, 19);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTokyoDrone(ctx, x, y, w, h, timeSec) {
    ctx.save();
    ctx.translate(x + w * 0.5, y + h * 0.5);
    const spin = Math.cos(timeSec * 36);

    // Arms & glowing rotors
    ctx.strokeStyle = '#3c4043';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-18, -3);
    ctx.lineTo(18, -3);
    ctx.stroke();

    // Spinning rotor discs
    ctx.fillStyle = 'rgba(77, 208, 225, 0.7)';
    ctx.fillRect(-23, -8, Math.max(4, Math.abs(spin) * 14), 2.5);
    ctx.fillRect(9, -8, Math.max(4, Math.abs(spin) * 14), 2.5);

    // Sleek white drone pod
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3c4043';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-12, -4, 24, 10, 5);
    ctx.fill();
    ctx.stroke();

    // Status LED
    ctx.fillStyle = '#34a853';
    ctx.beginPath();
    ctx.arc(-6, 1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawOrigamiCrane(ctx, x, y, w, h, timeSec) {
    const flap = Math.sin(timeSec * 11);
    ctx.save();
    ctx.translate(x + w * 0.5, y + h * 0.5);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#c5221f';
    ctx.lineWidth = 1.4;

    // Origami body & neck
    ctx.beginPath();
    ctx.moveTo(-20, -2);
    ctx.lineTo(-10, -7);
    ctx.lineTo(-5, 2);
    ctx.lineTo(14, 2);
    ctx.lineTo(22, -6);
    ctx.lineTo(10, 7);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crimson flapping wing
    ctx.fillStyle = '#ea4335';
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.lineTo(4, -14 * flap - 2);
    ctx.lineTo(11, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawObstacleBody(ctx, obs, timeSec) {
    switch (obs.kind) {
      case 'gbike-parked': drawParkedGBike(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'android-statue': drawAndroidStatue(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'noogler-pack': drawNooglerPack(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'seagull': drawBirdObstacle(ctx, obs.x, obs.y, obs.w, obs.h, timeSec, { body: '#ffffff', wing: '#cfd8dc', beak: '#fbbc04' }); break;
      case 'paper-plane': drawPaperPlane(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'postbox': drawPostbox(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'bollards': drawBollards(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'umbrella-stand': drawUmbrellaStand(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'pigeon': drawBirdObstacle(ctx, obs.x, obs.y, obs.w, obs.h, timeSec, { body: '#90a4ae', wing: '#607d8b', beak: '#455a64', neckBand: '#66bb6a' }); break;
      case 'vending-machine': drawVendingMachine(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'tokyo-barricade': drawTokyoBarricade(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'delivery-crates': drawDeliveryCrates(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'tokyo-drone': drawTokyoDrone(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'origami-crane': drawOrigamiCrane(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'brewery-bollard': drawBreweryBollard(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'tram-sign': drawTramSign(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'alpine-planter': drawAlpinePlanter(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'alpine-swift': drawBirdObstacle(ctx, obs.x, obs.y, obs.w, obs.h, timeSec, { body: '#37474f', wing: '#263238', beak: '#cfd8dc' }); break;
      default: drawAndroidStatue(ctx, obs.x, obs.y, obs.w, obs.h); break;
    }
  }

  function drawObstacle(ctx, obs, timeSec) {
    if (obs.smashed) {
      const cx = obs.x + obs.w * 0.5;
      const cy = obs.y + obs.h * 0.5;
      ctx.save();
      ctx.globalAlpha = Math.max(0, obs.alpha);
      ctx.translate(cx, cy);
      ctx.rotate(obs.rot || 0);
      ctx.translate(-cx, -cy);
      drawObstacleBody(ctx, obs, timeSec);
      ctx.restore();
      return;
    }
    drawShadow(ctx, obs.x, obs.w, obs.isAerial);
    drawObstacleBody(ctx, obs, timeSec);
  }

  class ObstacleManager {
    constructor() {
      this.items = [];
      this.nextGap = 320;
      this.clearedCount = 0;
    }

    reset() {
      this.items = [];
      this.nextGap = 320;
      this.clearedCount = 0;
    }

    isInGraceZone(score, runTime, endlessMode) {
      if (runTime < 1.5) return true;
      if (!endlessMode && score > 1335) return true;

      const boundaries = [350, 700, 1050];
      const wrapped = endlessMode ? score % 1400 : score;
      for (let i = 0; i < boundaries.length; i++) {
        if (Math.abs(wrapped - boundaries[i]) <= 35) return true;
      }
      if (endlessMode && (wrapped < 35 || wrapped > 1365)) return true;
      return false;
    }

    spawn(campusId, speed, score, runPoints, runTime, isPreview) {
      const pool = CATALOG[campusId] || CATALOG['mountain-view'];
      const allowAerial = runPoints > 90 || (isPreview && runTime > 2.2);
      const useAerial = allowAerial && Math.random() < 0.34;
      const spec = useAerial ? pickRandom(pool.aerial) : pickRandom(pool.ground);

      // High-duckable aerial sits above tucked pelican (top = 246), or occasional low-skimmer
      let y;
      if (useAerial) {
        const isLowSkimmer = Math.random() < 0.25;
        y = isLowSkimmer ? GROUND_Y - 22 - spec.h : GROUND_Y - 45 - spec.h;
      } else {
        y = GROUND_Y - spec.h;
      }

      this.items.push({
        kind: spec.kind,
        x: STAGE_W + 40,
        y: y,
        w: spec.w,
        h: spec.h,
        isAerial: useAerial,
        cleared: false,
        smashed: false
      });

      const minGap = Math.max(255, speed * 0.62 + 125);
      this.nextGap = randomRange(minGap, minGap * 1.55);
    }

    update(dt, speed, campusId, score, runPoints, runTime, isPreview, endlessMode) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const obs = this.items[i];
        if (obs.smashed) {
          obs.x += obs.vx * dt;
          obs.y += obs.vy * dt;
          obs.vy += 1250 * dt;
          obs.rot += obs.vrot * dt;
          obs.alpha -= dt * 1.45;
          if (obs.alpha <= 0 || obs.y > 420 || obs.x > STAGE_W + 140) {
            this.items.splice(i, 1);
          }
          continue;
        }
        obs.x -= speed * dt;
        if (!obs.cleared && obs.x + obs.w < 132) {
          obs.cleared = true;
          this.clearedCount += 1;
        }
        if (obs.x + obs.w < -80) {
          this.items.splice(i, 1);
        }
      }

      if (this.isInGraceZone(score, runTime, endlessMode)) {
        return;
      }

      let lastActive = null;
      for (let i = this.items.length - 1; i >= 0; i--) {
        if (!this.items[i].smashed) {
          lastActive = this.items[i];
          break;
        }
      }
      const distFromRight = lastActive ? STAGE_W - (lastActive.x + lastActive.w) : Infinity;
      if (distFromRight >= this.nextGap) {
        this.spawn(campusId, speed, score, runPoints, runTime, isPreview);
      }
    }

    findCollision(pelicanHitbox) {
      for (let i = 0; i < this.items.length; i++) {
        const o = this.items[i];
        if (o.smashed) continue;
        // Forgiving inset hitboxes (6px horizontal, 5px vertical)
        const ox = o.x + 6;
        const oy = o.y + 5;
        const ow = Math.max(8, o.w - 12);
        const oh = Math.max(8, o.h - 10);

        if (
          pelicanHitbox.x < ox + ow &&
          pelicanHitbox.x + pelicanHitbox.w > ox &&
          pelicanHitbox.y < oy + oh &&
          pelicanHitbox.y + pelicanHitbox.h > oy
        ) {
          return o;
        }
      }
      return null;
    }

    checkCollision(pelicanHitbox) {
      return Boolean(this.findCollision(pelicanHitbox));
    }

    smashObstacle(obs) {
      if (!obs || obs.smashed) return;
      obs.smashed = true;
      obs.vx = 280;
      obs.vy = -340;
      obs.rot = 0;
      obs.vrot = 9.5;
      obs.alpha = 1;
      if (!obs.cleared) {
        obs.cleared = true;
        this.clearedCount += 1;
      }
    }

    clearAheadOfPlayer(maxX) {
      this.items = this.items.filter(function (obs) {
        return obs.x >= maxX;
      });
    }

    draw(ctx, timeSec) {
      for (let i = 0; i < this.items.length; i++) {
        drawObstacle(ctx, this.items[i], timeSec);
      }
    }
  }

  global.PelicanGame = global.PelicanGame || {};
  global.PelicanGame.Obstacles = {
    ObstacleManager: ObstacleManager
  };
})(window);
