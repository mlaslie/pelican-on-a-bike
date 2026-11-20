(function (global) {
  'use strict';

  const STAGE_W = 960;
  const GROUND_Y = 282;

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function drawGeminiSymbol(ctx, cx, cy, r, timeSec) {
    const pulse = 1 + 0.08 * Math.sin(timeSec * 5.2);
    const radius = r * pulse;

    ctx.save();
    ctx.translate(cx, cy);

    // Outer radiant halo
    const halo = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius * 1.9);
    halo.addColorStop(0, 'rgba(138, 99, 246, 0.55)');
    halo.addColorStop(0.5, 'rgba(66, 133, 244, 0.28)');
    halo.addColorStop(1, 'rgba(36, 193, 224, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.9, 0, Math.PI * 2);
    ctx.fill();

    // 4-pointed concave Gemini sparkle star
    const starGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    starGrad.addColorStop(0, '#4285F4');
    starGrad.addColorStop(0.5, '#8a63f6');
    starGrad.addColorStop(1, '#24c1e0');

    ctx.fillStyle = starGrad;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.quadraticCurveTo(0, 0, 0, radius);
    ctx.quadraticCurveTo(0, 0, -radius, 0);
    ctx.quadraticCurveTo(0, 0, 0, -radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crisp white inner sparkle highlight
    const inner = radius * 0.42;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -inner);
    ctx.quadraticCurveTo(0, 0, inner, 0);
    ctx.quadraticCurveTo(0, 0, 0, inner);
    ctx.quadraticCurveTo(0, 0, -inner, 0);
    ctx.quadraticCurveTo(0, 0, 0, -inner);
    ctx.closePath();
    ctx.fill();

    // Two orbiting micro-sparkles
    for (let i = 0; i < 2; i++) {
      const ang = timeSec * 3.1 + i * Math.PI;
      const sx = Math.cos(ang) * (radius + 6);
      const sy = Math.sin(ang) * (radius + 6) * 0.65;
      const mr = 3.2;
      ctx.fillStyle = i === 0 ? '#a8c7fa' : '#d7aefb';
      ctx.beginPath();
      ctx.moveTo(sx, sy - mr);
      ctx.quadraticCurveTo(sx, sy, sx + mr, sy);
      ctx.quadraticCurveTo(sx, sy, sx, sy + mr);
      ctx.quadraticCurveTo(sx, sy, sx - mr, sy);
      ctx.quadraticCurveTo(sx, sy, sx, sy - mr);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawGoogleGLogo(ctx, cx, cy, r, timeSec) {
    const bobSpin = Math.sin(timeSec * 2.5) * 0.04;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(bobSpin);

    // Subtle soft glow behind medallion
    const glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.55);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
    glow.addColorStop(1, 'rgba(66, 133, 244, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2);
    ctx.fill();

    // White medallion disc
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4-color Google G arcs
    const gr = r * 0.56;
    ctx.lineWidth = r * 0.25;
    ctx.lineCap = 'butt';

    // Red (top)
    ctx.strokeStyle = '#EA4335';
    ctx.beginPath();
    ctx.arc(0, 0, gr, 1.18 * Math.PI, 1.78 * Math.PI);
    ctx.stroke();

    // Yellow (left)
    ctx.strokeStyle = '#FBBC04';
    ctx.beginPath();
    ctx.arc(0, 0, gr, 0.78 * Math.PI, 1.19 * Math.PI);
    ctx.stroke();

    // Green (bottom)
    ctx.strokeStyle = '#34A853';
    ctx.beginPath();
    ctx.arc(0, 0, gr, 0.22 * Math.PI, 0.79 * Math.PI);
    ctx.stroke();

    // Blue (right + horizontal crossbar)
    ctx.strokeStyle = '#4285F4';
    ctx.beginPath();
    ctx.arc(0, 0, gr, -0.02 * Math.PI, 0.23 * Math.PI);
    ctx.stroke();

    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0.5, 0);
    ctx.lineTo(gr + ctx.lineWidth * 0.35, 0);
    ctx.stroke();

    ctx.restore();
  }

  // Microkitchen Espresso Cup collectible (triggers 2.8s 2x Score Wheelie!)
  function drawEspressoCup(ctx, x, y, r, timeSec) {
    ctx.save();
    ctx.translate(x, y);

    // Warm golden caffeine halo
    const pulse = 0.88 + 0.12 * Math.sin(timeSec * 6.5);
    const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.45 * pulse);
    halo.addColorStop(0, 'rgba(251, 188, 4, 0.42)');
    halo.addColorStop(0.65, 'rgba(234, 67, 53, 0.16)');
    halo.addColorStop(1, 'rgba(251, 188, 4, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.45 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Animated rising steam curls
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let s = -1; s <= 1; s += 2) {
      const sway = Math.sin(timeSec * 6 + s) * 2;
      ctx.beginPath();
      ctx.moveTo(s * 3.5, -8);
      ctx.quadraticCurveTo(s * 3.5 + sway, -13, s * 3.5 - sway * 0.5, -17);
      ctx.stroke();
    }

    // Cup handle
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(9.5, 1, 4.2, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Ceramic espresso cup body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.lineTo(9, -6);
    ctx.lineTo(7, 8);
    ctx.quadraticCurveTo(0, 11, -7, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tiny Google 4-color stripe on cup
    const cols = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = cols[c];
      ctx.fillRect(-6.5 + c * 3.25, 0.5, 3.3, 2.8);
    }

    // Rich dark espresso crema top
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.ellipse(0, -6, 8.2, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  class PowerupManager {
    constructor() {
      this.reset();
    }

    reset() {
      this.items = [];
      this.nextGTimer = randomRange(3.2, 4.8);
      this.nextGeminiTimer = randomRange(6.0, 9.0);
      this.nextEspressoTimer = randomRange(8.5, 12.5);
      this.riskWaitG = 0;
      this.riskWaitGemini = 0;
    }

    spawn(kind, obstacles, difficulty) {
      const diff = Math.max(1, difficulty || 1);
      const riskFactor = Math.max(0, Math.min(1, (diff - 1) / 5));
      const useRisky = Math.random() < (0.25 + riskFactor * 0.65);

      const obsList = obstacles && obstacles.items ? obstacles.items : [];
      let hostObs = null;
      for (let i = obsList.length - 1; i >= 0; i--) {
        const obs = obsList[i];
        if (!obs.smashed && obs.x >= STAGE_W - 140 && obs.x <= STAGE_W + 160) {
          hostObs = obs;
          break;
        }
      }

      let spawnX = STAGE_W + 45;
      let baseY;
      let speedMult = 1;

      if (useRisky && hostObs) {
        if (hostObs.isAerial && (hostObs.baseY || hostObs.y) + hostObs.h <= GROUND_Y - 40) {
          // Place directly in the low-duck lane beneath a high aerial obstacle
          spawnX = hostObs.x + hostObs.w * 0.5;
          baseY = GROUND_Y - 22;
          speedMult = hostObs.speedMult || 1;
        } else {
          // Place in a bold jump arc directly over a ground obstacle's peak
          spawnX = hostObs.x + hostObs.w * 0.5;
          baseY = Math.max(150, hostObs.y - 44);
        }
      } else if (useRisky) {
        const waitCount = kind === 'gemini' ? this.riskWaitGemini : this.riskWaitG;
        if (waitCount < 3) {
          return false; // briefly defer so collectible aligns over next obstacle
        }
        baseY = GROUND_Y - 112;
      } else {
        // Early-level friendly placement away from nearby obstacles
        let nearObstacle = false;
        for (let i = 0; i < obsList.length; i++) {
          const obs = obsList[i];
          if (!obs.smashed && Math.abs((obs.x + obs.w * 0.5) - spawnX) <= 85) {
            nearObstacle = true;
            break;
          }
        }
        baseY = nearObstacle
          ? GROUND_Y - 102
          : (Math.random() < 0.5 ? GROUND_Y - 42 : GROUND_Y - 90);
      }

      const radius = kind === 'gemini' ? 16 : 15;
      this.items.push({
        kind: kind,
        x: spawnX,
        baseY: baseY,
        y: baseY,
        r: radius,
        speedMult: speedMult,
        bobPhase: Math.random() * Math.PI * 2
      });
      return true;
    }

    spawnForEvaluation(kind, x, y) {
      const radius = kind === 'gemini' ? 16 : 15;
      const baseY = typeof y === 'number' ? y : GROUND_Y - 40;
      this.items.push({
        kind: kind,
        x: typeof x === 'number' ? x : 160,
        baseY: baseY,
        y: baseY,
        r: radius,
        speedMult: 1,
        bobPhase: 0
      });
    }

    update(dt, speed, obstacles, blockSpawn, timeSec, difficulty) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        item.x -= speed * (item.speedMult || 1) * dt;
        item.y = item.baseY + Math.sin(timeSec * 4.2 + item.bobPhase) * 5;
        if (item.x + item.r * 2 < -60) {
          this.items.splice(i, 1);
        }
      }

      if (blockSpawn) return;

      this.nextGTimer -= dt;
      if (this.nextGTimer <= 0) {
        if (this.spawn('google-g', obstacles, difficulty)) {
          this.riskWaitG = 0;
          this.nextGTimer = randomRange(6.5, 10.0);
        } else {
          this.riskWaitG += 1;
          this.nextGTimer = 0.2;
        }
      }

      this.nextGeminiTimer -= dt;
      if (this.nextGeminiTimer <= 0) {
        if (this.spawn('gemini', obstacles, difficulty)) {
          this.riskWaitGemini = 0;
          this.nextGeminiTimer = randomRange(12.0, 17.5);
        } else {
          this.riskWaitGemini += 1;
          this.nextGeminiTimer = 0.2;
        }
      }

      this.nextEspressoTimer -= dt;
      if (this.nextEspressoTimer <= 0) {
        if (this.spawn('espresso', obstacles, difficulty)) {
          this.nextEspressoTimer = randomRange(11.0, 16.5);
        } else {
          this.nextEspressoTimer = 0.25;
        }
      }
    }

    checkCollect(pelicanHitbox) {
      const collected = [];
      const margin = 8;
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        const ix = item.x - item.r - margin;
        const iy = item.y - item.r - margin;
        const iw = (item.r + margin) * 2;
        const ih = (item.r + margin) * 2;

        if (
          pelicanHitbox.x < ix + iw &&
          pelicanHitbox.x + pelicanHitbox.w > ix &&
          pelicanHitbox.y < iy + ih &&
          pelicanHitbox.y + pelicanHitbox.h > iy
        ) {
          collected.push(item);
          this.items.splice(i, 1);
        }
      }
      return collected;
    }

    draw(ctx, timeSec) {
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        // Subtle floating shadow on ground
        const heightRatio = Math.max(0.35, 1 - (GROUND_Y - item.y) / 170);
        ctx.save();
        ctx.fillStyle = 'rgba(32, 33, 36, ' + (0.14 * heightRatio).toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(item.x, GROUND_Y + 2, item.r * 0.72 * heightRatio, 3.2 * heightRatio, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (item.kind === 'gemini') {
          drawGeminiSymbol(ctx, item.x, item.y, item.r, timeSec);
        } else if (item.kind === 'espresso') {
          drawEspressoCup(ctx, item.x, item.y, item.r, timeSec);
        } else {
          drawGoogleGLogo(ctx, item.x, item.y, item.r, timeSec);
        }
      }
    }
  }

  global.PelicanGame = global.PelicanGame || {};
  global.PelicanGame.Powerups = {
    PowerupManager: PowerupManager,
    drawGeminiSymbol: drawGeminiSymbol,
    drawGoogleGLogo: drawGoogleGLogo
  };
})(window);
