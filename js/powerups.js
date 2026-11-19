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

  class PowerupManager {
    constructor() {
      this.reset();
    }

    reset() {
      this.items = [];
      this.nextGTimer = randomRange(2.4, 3.8);
      this.nextGeminiTimer = randomRange(5.2, 7.8);
    }

    spawn(kind, obstacles) {
      const spawnX = STAGE_W + 45;
      const obsList = obstacles && obstacles.items ? obstacles.items : [];
      let nearObstacle = false;
      for (let i = 0; i < obsList.length; i++) {
        const obs = obsList[i];
        const obsCenter = obs.x + obs.w * 0.5;
        if (Math.abs(obsCenter - spawnX) <= 85) {
          nearObstacle = true;
          break;
        }
      }

      const baseY = nearObstacle
        ? GROUND_Y - 102
        : (Math.random() < 0.5 ? GROUND_Y - 40 : GROUND_Y - 94);

      const radius = kind === 'gemini' ? 16 : 15;
      this.items.push({
        kind: kind,
        x: spawnX,
        baseY: baseY,
        y: baseY,
        r: radius,
        bobPhase: Math.random() * Math.PI * 2
      });
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
        bobPhase: 0
      });
    }

    update(dt, speed, obstacles, blockSpawn, timeSec) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        item.x -= speed * dt;
        item.y = item.baseY + Math.sin(timeSec * 4.2 + item.bobPhase) * 5;
        if (item.x + item.r * 2 < -60) {
          this.items.splice(i, 1);
        }
      }

      if (blockSpawn) return;

      this.nextGTimer -= dt;
      if (this.nextGTimer <= 0) {
        this.spawn('google-g', obstacles);
        this.nextGTimer = randomRange(5.2, 8.5);
      }

      this.nextGeminiTimer -= dt;
      if (this.nextGeminiTimer <= 0) {
        this.spawn('gemini', obstacles);
        this.nextGeminiTimer = randomRange(10.5, 16.0);
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
