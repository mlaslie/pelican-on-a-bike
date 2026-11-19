(function (global) {
  'use strict';

  const STAGE_W = 960;
  const STAGE_H = 340;
  const GROUND_Y = 282;
  const SCORE_RATE = 0.048;
  const LEGACY_HIGH_SCORE_KEY = 'pelicanBikeHighScore';
  const HI_GOOGLER_KEY = 'pelicanBikeHighScoreGoogler';
  const HI_NOOGLER_KEY = 'pelicanBikeHighScoreNoogler';
  const SPEED_MODE_KEY = 'pelicanBikeSpeedMode';
  const NOOGLER_SPEED = 380;
  const GOOGLER_START_SPEED = 370;
  const GOOGLER_TOUR_MAX_SPEED = 720;
  const GOOGLER_ENDLESS_MAX_SPEED = 880;
  const GEMINI_DURATION = 6.0;
  const REVIVE_SHIELD_DURATION = 2.2;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  class GameEngine {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.callbacks = callbacks || {};

      this.Audio = global.PelicanGame.Audio;
      this.Campuses = global.PelicanGame.Campuses;
      this.PelicanMod = global.PelicanGame.Pelican;
      this.ObstaclesMod = global.PelicanGame.Obstacles;
      this.PowerupsMod = global.PelicanGame.Powerups;

      this.pelican = new this.PelicanMod.PelicanRider();
      this.obstacles = new this.ObstaclesMod.ObstacleManager();
      this.powerups = new this.PowerupsMod.PowerupManager();

      this.state = 'idle'; // 'idle' | 'playing' | 'paused' | 'respawn-unlocked' | 'revive' | 'victory' | 'gameover'
      this.score = 0;
      this.runPoints = 0;
      this.runTime = 0;
      this.worldDist = 0;
      this.timeSec = 0;
      this.endlessMode = false;
      this.isPreview = false;
      this.startCampusId = 'sydney';
      this.lastCampusId = 'sydney';
      this.visitedCampuses = new Set(['sydney']);
      this.lastMilestoneBucket = 0;
      this.gameOverTimestamp = 0;
      this.reviveTimestamp = 0;
      this.respawnSplashTimestamp = 0;
      this.isNewHighScore = false;
      this.invincibleTimer = 0;
      this.reviveShieldTimer = 0;
      this.gCount = 0;
      this.freeContinues = 0;
      this._lastHudInvincibleBucket = -1;

      this.speedMode = 'googler';
      this.highScores = { googler: 0, noogler: 0 };
      try {
        const savedMode = global.localStorage.getItem(SPEED_MODE_KEY);
        if (savedMode === 'noogler' || savedMode === 'googler') {
          this.speedMode = savedMode;
        }
        const legacy = parseInt(global.localStorage.getItem(LEGACY_HIGH_SCORE_KEY) || '0', 10);
        const storedG = global.localStorage.getItem(HI_GOOGLER_KEY);
        if (storedG !== null) {
          const parsedG = parseInt(storedG, 10);
          if (!Number.isNaN(parsedG) && parsedG > 0) this.highScores.googler = parsedG;
        } else if (!Number.isNaN(legacy) && legacy > 0) {
          this.highScores.googler = legacy;
          global.localStorage.setItem(HI_GOOGLER_KEY, String(legacy));
        }
        const storedN = parseInt(global.localStorage.getItem(HI_NOOGLER_KEY) || '0', 10);
        if (!Number.isNaN(storedN) && storedN > 0) {
          this.highScores.noogler = storedN;
        }
      } catch (_) {}

      this.highScore = this.highScores[this.speedMode];
      this.speed = this.computeSpeed();

      this.particles = [];
      this.toast = null;

      this.rafId = null;
      this.lastTs = 0;
      this.dpr = 1;

      this.setupResizeObserver();
      this.resizeCanvas();
      this.emitHud(true);
      this.emitState();
    }

    setupResizeObserver() {
      const update = () => this.resizeCanvas();
      if (typeof global.ResizeObserver === 'function') {
        this.ro = new global.ResizeObserver(update);
        this.ro.observe(this.canvas);
      } else {
        global.addEventListener('resize', update);
      }
    }

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const cssW = Math.max(300, rect.width || STAGE_W);
      const scale = cssW / STAGE_W;
      const dpr = clamp(global.devicePixelRatio || 1, 1, 2.5);
      this.dpr = dpr;

      const targetW = Math.round(STAGE_W * dpr * Math.max(1, scale));
      const targetH = Math.round(STAGE_H * dpr * Math.max(1, scale));
      if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
        this.canvas.width = targetW;
        this.canvas.height = targetH;
      }
    }

    startLoop() {
      if (this.rafId !== null) return;
      this.lastTs = 0;
      const tick = (ts) => {
        if (!this.lastTs) this.lastTs = ts;
        const dt = Math.min((ts - this.lastTs) / 1000, 0.05);
        this.lastTs = ts;
        this.update(dt);
        this.render();
        this.rafId = global.requestAnimationFrame(tick);
      };
      this.rafId = global.requestAnimationFrame(tick);
    }

    setSpeedMode(mode) {
      const nextMode = mode === 'noogler' ? 'noogler' : 'googler';
      if (this.speedMode === nextMode) return;
      this.speedMode = nextMode;
      this.highScore = this.highScores[this.speedMode] || 0;
      this.speed = this.computeSpeed();
      try {
        global.localStorage.setItem(SPEED_MODE_KEY, this.speedMode);
      } catch (_) {}
      this.emitHud(true);
      this.emitState();
    }

    startTour(campusId) {
      const targetId = campusId || 'sydney';
      const campus = this.Campuses.getCampusById(targetId);

      this.startCampusId = campus.id;
      this.isPreview = campus.id !== 'sydney';
      this.endlessMode = false;
      this.score = campus.startScore;
      this.runPoints = 0;
      this.runTime = 0;
      this.worldDist = campus.startScore * this.Campuses.PIXELS_PER_PT;
      this.speed = this.computeSpeed();
      this.lastCampusId = campus.id;
      this.visitedCampuses = new Set([campus.id]);
      this.lastMilestoneBucket = Math.floor(this.score / 100);
      this.isNewHighScore = false;
      this.invincibleTimer = 0;
      this.reviveShieldTimer = 0;
      this.gCount = 0;
      this.freeContinues = 0;
      this._lastHudInvincibleBucket = -1;
      this.particles = [];

      this.pelican.reset();
      this.obstacles.reset();
      this.powerups.reset();

      this.state = 'playing';
      this.showCampusToast(campus);
      this.emitState();
      this.emitHud(true);
    }

    continueEndless() {
      this.endlessMode = true;
      this.pelican.setHappy(false);
      this.state = 'playing';
      this.toast = {
        kicker: 'ENDLESS MODE UNLOCKED',
        title: 'Keep pedaling — speed & difficulty ramp up!',
        color: '#34A853',
        timer: 2.6,
        duration: 2.6
      };
      this.emitState();
      this.emitHud(true);
    }

    restart() {
      this.startTour(this.startCampusId);
    }

    jumpPress() {
      if (this.state === 'idle') {
        this.startTour('sydney');
        this.pelican.pressJump();
        return;
      }
      if (this.state === 'respawn-unlocked') {
        if (performance.now() - this.respawnSplashTimestamp > 320) {
          this.dismissRespawnSplash();
        }
        return;
      }
      if (this.state === 'revive') {
        if (performance.now() - this.reviveTimestamp > 280) {
          this.useFreeContinue();
        }
        return;
      }
      if (this.state === 'gameover') {
        if (performance.now() - this.gameOverTimestamp > 280) {
          this.restart();
        }
        return;
      }
      if (this.state === 'playing') {
        this.pelican.pressJump();
      }
    }

    jumpRelease() {
      this.pelican.releaseJump();
    }

    setDuck(active) {
      if (this.state === 'playing') {
        const wasDucking = this.pelican.ducking;
        this.pelican.setDuck(active);
        if (active && !wasDucking && !this.pelican.grounded) {
          this.Audio.playDuck();
        }
      } else {
        this.pelican.setDuck(false);
      }
    }

    ringBell() {
      this.pelican.ringBell();
      this.Audio.playBikeBell();
    }

    togglePause() {
      if (this.state === 'playing') {
        this.state = 'paused';
        this.pelican.setDuck(false);
        this.pelican.releaseJump();
        this.emitState();
      } else if (this.state === 'paused') {
        this.state = 'playing';
        this.emitState();
      }
    }

    pauseIfPlaying() {
      if (this.state === 'playing') {
        this.state = 'paused';
        this.pelican.setDuck(false);
        this.pelican.releaseJump();
        this.emitState();
      }
    }

    computeSpeed() {
      if (this.speedMode === 'noogler') {
        return NOOGLER_SPEED;
      }
      if (!this.endlessMode) {
        const progress = clamp(this.score / this.Campuses.TOUR_FINISH, 0, 1);
        return GOOGLER_START_SPEED + progress * (GOOGLER_TOUR_MAX_SPEED - GOOGLER_START_SPEED);
      }
      const extra = Math.max(0, this.score - this.Campuses.TOUR_FINISH);
      return Math.min(GOOGLER_ENDLESS_MAX_SPEED, GOOGLER_TOUR_MAX_SPEED + extra * 0.065);
    }

    showCampusToast(campus) {
      this.toast = {
        kicker: 'NOW ENTERING',
        title: campus.name.toUpperCase() + ' — ' + campus.landmark.toUpperCase(),
        color: campus.badgeColor,
        timer: 2.5,
        duration: 2.5
      };
    }

    spawnDust(x, y, count, speedBias) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          kind: 'dust',
          x: x + (Math.random() - 0.5) * 14,
          y: y - Math.random() * 4,
          vx: -60 - Math.random() * 90 + (speedBias || 0),
          vy: -18 - Math.random() * 45,
          r: 2 + Math.random() * 3,
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6,
          color: 'rgba(220, 224, 230, 0.85)'
        });
      }
    }

    spawnFeathers(x, y, count) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          kind: 'feather',
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 180,
          vy: -90 - Math.random() * 140,
          r: 4 + Math.random() * 3,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 8,
          life: 0.75 + Math.random() * 0.4,
          maxLife: 1.15,
          color: '#ffffff'
        });
      }
    }

    spawnConfetti(count) {
      const cols = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          kind: 'confetti',
          x: 120 + Math.random() * 720,
          y: 20 + Math.random() * 70,
          vx: (Math.random() - 0.5) * 140,
          vy: 40 + Math.random() * 120,
          r: 4 + Math.random() * 3,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 10,
          life: 2.2 + Math.random() * 1.4,
          maxLife: 3.6,
          color: cols[i % cols.length]
        });
      }
    }

    spawnSparkles(x, y, count, palette) {
      const cols = palette || ['#4285F4', '#8a63f6', '#24c1e0', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const mag = 55 + Math.random() * 140;
        this.particles.push({
          kind: 'sparkle',
          x: x,
          y: y,
          vx: Math.cos(ang) * mag,
          vy: Math.sin(ang) * mag - 25,
          r: 3.5 + Math.random() * 3.5,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 6,
          life: 0.45 + Math.random() * 0.35,
          maxLife: 0.8,
          color: cols[i % cols.length]
        });
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === 'feather') {
          p.vy += 260 * dt;
          p.rot += p.vrot * dt;
        } else if (p.kind === 'confetti') {
          p.vy += 90 * dt;
          p.vx *= 0.99;
          p.rot += p.vrot * dt;
        } else if (p.kind === 'sparkle') {
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.rot += p.vrot * dt;
        }
      }
    }

    triggerVictory() {
      this.score = this.Campuses.TOUR_FINISH;
      this.state = 'victory';
      this.invincibleTimer = 0;
      this.reviveShieldTimer = 0;
      this.pelican.setShieldState(0, 0);
      this.pelican.setHappy(true);
      this.pelican.setDuck(false);
      this.Audio.playVictory();
      this.spawnConfetti(70);
      this.saveHighScoreIfEligible();
      this.emitHud(true);
      this.emitState();
    }

    triggerRevivePrompt() {
      this.state = 'revive';
      this.reviveTimestamp = performance.now();
      this.pelican.setCrashed();
      this.pelican.setDuck(false);
      this.Audio.playCrash();
      this.spawnFeathers(this.pelican.x + 48, this.pelican.y - 45, 7);
      this.spawnDust(this.pelican.x + 42, GROUND_Y, 8, 35);
      this.emitHud(true);
      this.emitState();
    }

    useFreeContinue() {
      if (this.state !== 'revive' || this.freeContinues <= 0) return;
      this.freeContinues -= 1;
      this.pelican.recoverFromCrash();
      this.obstacles.clearAheadOfPlayer(this.pelican.x + 420);
      this.reviveShieldTimer = REVIVE_SHIELD_DURATION;
      this.pelican.setShieldState(this.invincibleTimer, this.reviveShieldTimer);
      this.state = 'playing';
      this.Audio.playRevive();
      this.spawnSparkles(this.pelican.x + 46, this.pelican.y - 38, 18, ['#4285F4', '#EA4335', '#FBBC04', '#34A853']);
      this.toast = {
        kicker: 'FREE CONTINUE ACTIVATED',
        title: 'KEEP RIDING FROM HERE!',
        color: '#34A853',
        timer: 2.2,
        duration: 2.2
      };
      this.emitHud(true);
      this.emitState();
    }

    triggerGameOver() {
      this.state = 'gameover';
      this.gameOverTimestamp = performance.now();
      this.invincibleTimer = 0;
      this.reviveShieldTimer = 0;
      this.pelican.setShieldState(0, 0);
      this.pelican.setCrashed();
      this.pelican.setDuck(false);
      this.Audio.playCrash();
      this.spawnFeathers(this.pelican.x + 48, this.pelican.y - 45, 9);
      this.spawnDust(this.pelican.x + 42, GROUND_Y, 10, 40);
      this.saveHighScoreIfEligible();
      this.emitHud(true);
      this.emitState();
    }

    dismissRespawnSplash() {
      if (this.state !== 'respawn-unlocked') return;
      this.reviveShieldTimer = Math.max(this.reviveShieldTimer, 0.8);
      this.pelican.setShieldState(this.invincibleTimer, this.reviveShieldTimer);
      this.state = 'playing';
      this.emitHud(true);
      this.emitState();
    }

    saveHighScoreIfEligible() {
      if (this.isPreview) return;
      const floored = Math.floor(this.score);
      if (floored > this.highScore) {
        this.highScore = floored;
        this.highScores[this.speedMode] = floored;
        this.isNewHighScore = true;
        try {
          const key = this.speedMode === 'noogler' ? HI_NOOGLER_KEY : HI_GOOGLER_KEY;
          global.localStorage.setItem(key, String(this.highScore));
        } catch (_) {}
      }
    }

    // Helper for deterministic verification of finish line / transitions
    setScoreForEvaluation(targetScore) {
      this.score = Math.max(0, targetScore);
      this.worldDist = this.score * this.Campuses.PIXELS_PER_PT;
      this.lastMilestoneBucket = Math.floor(this.score / 100);
      if (!this.endlessMode && this.score >= this.Campuses.TOUR_FINISH) {
        this.triggerVictory();
      } else {
        this.emitHud(true);
      }
    }

    update(dt) {
      if (this.state === 'paused') return;

      this.timeSec += dt;
      this.updateParticles(dt);

      if (this.toast) {
        this.toast.timer -= dt;
        if (this.toast.timer <= 0) {
          this.toast = null;
        }
      }

      if (this.state === 'idle') {
        this.pelican.update(dt, 0, false, true);
        return;
      }

      if (this.state === 'gameover' || this.state === 'victory' || this.state === 'revive' || this.state === 'respawn-unlocked') {
        this.pelican.update(dt, 0, false, false);
        return;
      }

      // Playing state
      this.runTime += dt;
      this.speed = this.computeSpeed();
      const deltaDist = this.speed * dt;
      const deltaScore = deltaDist * SCORE_RATE;
      this.worldDist += deltaDist;
      this.score += deltaScore;
      this.runPoints += deltaScore;

      if (this.invincibleTimer > 0) {
        this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
        if (Math.random() < dt * 14) {
          this.spawnSparkles(
            this.pelican.x + 12 + Math.random() * 18,
            this.pelican.y - 16 - Math.random() * 34,
            1,
            ['#4285F4', '#8a63f6', '#24c1e0', '#ffffff']
          );
        }
      }
      if (this.reviveShieldTimer > 0) {
        this.reviveShieldTimer = Math.max(0, this.reviveShieldTimer - dt);
      }

      // Subtle tire dust while riding on ground
      if (this.pelican.grounded && Math.random() < dt * 11) {
        this.spawnDust(this.pelican.x + 18, GROUND_Y, 1, -20);
      }

      this.pelican.update(dt, this.speed, true, false);
      if (this.pelican.justJumped) {
        this.Audio.playJump();
        this.spawnDust(this.pelican.x + 28, GROUND_Y, 5, -30);
        this.spawnFeathers(this.pelican.x + 36, this.pelican.y - 44, 2);
      }
      if (this.pelican.justLanded) {
        this.spawnDust(this.pelican.x + 42, GROUND_Y, 6, 0);
      }

      // Check 100-pt milestone chime
      const bucket = Math.floor(this.score / 100);
      if (bucket > this.lastMilestoneBucket && (!this.endlessMode ? this.score < this.Campuses.TOUR_FINISH : true)) {
        this.lastMilestoneBucket = bucket;
        this.Audio.playMilestone();
        if (this.callbacks.onMilestone) {
          this.callbacks.onMilestone(bucket * 100);
        }
      }

      // World Tour Finish check
      if (!this.endlessMode && this.score >= this.Campuses.TOUR_FINISH) {
        this.triggerVictory();
        return;
      }

      const campusState = this.Campuses.getCampusState(this.score, this.endlessMode);
      const activeCampus = campusState.current;
      this.visitedCampuses.add(activeCampus.id);

      if (activeCampus.id !== this.lastCampusId) {
        this.lastCampusId = activeCampus.id;
        this.showCampusToast(activeCampus);
        this.pelican.ringBell();
        this.Audio.playBikeBell();
        if (this.callbacks.onCampusChange) {
          this.callbacks.onCampusChange(activeCampus);
        }
      }

      const difficulty = (activeCampus.difficulty || 1) + (this.endlessMode && campusState.cycleIndex > 0 ? 1 : 0);

      this.obstacles.update(
        dt,
        this.speed,
        activeCampus.id,
        this.score,
        this.runPoints,
        this.runTime,
        this.isPreview,
        this.endlessMode,
        difficulty,
        this.timeSec
      );

      const blockPowerupSpawn = this.runTime < 1.2 || (!this.endlessMode && this.score > this.Campuses.TOUR_FINISH - 55);
      this.powerups.update(dt, this.speed, this.obstacles, blockPowerupSpawn, this.timeSec, difficulty);

      const collected = this.powerups.checkCollect(this.pelican.getHitbox());
      for (let c = 0; c < collected.length; c++) {
        const item = collected[c];
        if (item.kind === 'gemini') {
          this.invincibleTimer = GEMINI_DURATION;
          this.Audio.playGeminiPowerup();
          this.spawnSparkles(this.pelican.x + 48, this.pelican.y - 36, 16, ['#4285F4', '#8a63f6', '#24c1e0', '#ffffff']);
          this.toast = {
            kicker: 'GEMINI POWER-UP',
            title: 'INVINCIBLE FOR 6S!',
            color: '#8a63f6',
            timer: 2.1,
            duration: 2.1
          };
          if (this.callbacks.onPowerup) {
            this.callbacks.onPowerup('gemini', GEMINI_DURATION);
          }
          this.emitHud(true);
        } else if (item.kind === 'google-g') {
          this.gCount += 1;
          if (this.gCount >= 3) {
            this.gCount = 0;
            this.freeContinues += 1;
            this.Audio.playCollectG(3);
            this.spawnConfetti(42);
            this.spawnSparkles(this.pelican.x + 48, this.pelican.y - 38, 18, ['#4285F4', '#EA4335', '#FBBC04', '#34A853']);
            this.state = 'respawn-unlocked';
            this.respawnSplashTimestamp = performance.now();
            this.pelican.setDuck(false);
            this.pelican.releaseJump();
            this.pelican.setShieldState(this.invincibleTimer, this.reviveShieldTimer);
            if (this.callbacks.onPowerup) {
              this.callbacks.onPowerup('continue-unlocked', this.freeContinues);
            }
            this.emitHud(true);
            this.emitState();
            return;
          }
          this.Audio.playCollectG(this.gCount);
          this.spawnSparkles(this.pelican.x + 48, this.pelican.y - 38, 10, ['#4285F4', '#EA4335', '#FBBC04', '#34A853']);
          this.toast = {
            kicker: 'GOOGLE G COLLECTED',
            title: this.gCount + '/3 TOWARD RESPAWN',
            color: '#4285F4',
            timer: 1.8,
            duration: 1.8
          };
          if (this.callbacks.onPowerup) {
            this.callbacks.onPowerup('google-g', this.gCount);
          }
          this.emitHud(true);
        }
      }

      this.pelican.setShieldState(this.invincibleTimer, this.reviveShieldTimer);

      const hitObs = this.obstacles.findCollision(this.pelican.getHitbox());
      if (hitObs) {
        if (this.invincibleTimer > 0) {
          this.obstacles.smashObstacle(hitObs);
          this.Audio.playObstacleSmash();
          this.spawnSparkles(hitObs.x + hitObs.w * 0.5, hitObs.y + hitObs.h * 0.5, 14, ['#4285F4', '#8a63f6', '#24c1e0', '#ffffff']);
        } else if (this.reviveShieldTimer > 0) {
          // Post-revive safety shield protects rider briefly
        } else if (this.freeContinues > 0) {
          this.triggerRevivePrompt();
          return;
        } else {
          this.triggerGameOver();
          return;
        }
      }

      this.emitHud(false);
    }

    drawParticles(ctx) {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const alpha = clamp(p.life / p.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        if (p.kind === 'dust') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'feather') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#5f6368';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 1.4, p.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (p.kind === 'confetti') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9);
        } else if (p.kind === 'sparkle') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          const r = p.r;
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    drawToast(ctx) {
      if (!this.toast) return;
      const t = this.toast;
      const fadeIn = clamp((t.duration - t.timer) / 0.22, 0, 1);
      const fadeOut = clamp(t.timer / 0.35, 0, 1);
      const alpha = Math.min(fadeIn, fadeOut);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(STAGE_W * 0.5, 22 + (1 - fadeIn) * -8);

      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, sans-serif';
      const labelText = t.kicker + '  •  ' + t.title;
      const textW = ctx.measureText(labelText).width;
      const pillW = Math.min(STAGE_W - 40, textW + 40);

      ctx.fillStyle = 'rgba(32, 33, 36, 0.86)';
      ctx.beginPath();
      ctx.roundRect(-pillW * 0.5, 0, pillW, 28, 999);
      ctx.fill();

      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(-pillW * 0.5 + 16, 14, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 6, 14.5);
      ctx.restore();
    }

    render() {
      const ctx = this.ctx;
      const sx = this.canvas.width / STAGE_W;
      const sy = this.canvas.height / STAGE_H;

      ctx.save();
      ctx.scale(sx, sy);

      const campusInfo = this.Campuses.renderBackdrop(ctx, {
        score: this.score,
        worldDist: this.worldDist,
        timeSec: this.timeSec,
        endlessMode: this.endlessMode
      });

      this.obstacles.draw(ctx, this.timeSec);
      this.powerups.draw(ctx, this.timeSec);
      this.pelican.draw(ctx, this.state === 'playing' ? this.speed : 0, this.timeSec);
      this.drawParticles(ctx);
      this.drawToast(ctx);

      ctx.restore();
      return campusInfo;
    }

    emitHud(force) {
      if (!this.callbacks.onHud) return;
      const floored = Math.floor(this.score);
      const invBucket = this.invincibleTimer > 0 ? Math.ceil(this.invincibleTimer * 10) : 0;
      if (!force && floored === this._lastReportedScore && invBucket === this._lastHudInvincibleBucket) return;
      this._lastReportedScore = floored;
      this._lastHudInvincibleBucket = invBucket;

      const campusState = this.Campuses.getCampusState(this.score, this.endlessMode);
      this.callbacks.onHud({
        score: floored,
        highScore: this.highScore,
        campus: campusState.current,
        endlessMode: this.endlessMode,
        isPreview: this.isPreview,
        speedMode: this.speedMode,
        speed: this.speed,
        tourProgress: clamp(this.score / this.Campuses.TOUR_FINISH, 0, 1),
        gCount: this.gCount,
        freeContinues: this.freeContinues,
        invincibleTimer: this.invincibleTimer,
        reviveShieldTimer: this.reviveShieldTimer
      });
    }

    emitState() {
      if (!this.callbacks.onStateChange) return;
      const campusState = this.Campuses.getCampusState(this.score, this.endlessMode);
      this.callbacks.onStateChange({
        state: this.state,
        score: Math.floor(this.score),
        highScore: this.highScore,
        isNewHighScore: this.isNewHighScore,
        runTime: this.runTime,
        clearedCount: this.obstacles.clearedCount,
        visitedCount: this.visitedCampuses.size,
        campus: campusState.current,
        endlessMode: this.endlessMode,
        isPreview: this.isPreview,
        speedMode: this.speedMode,
        speed: this.speed,
        gCount: this.gCount,
        freeContinues: this.freeContinues,
        invincibleTimer: this.invincibleTimer,
        reviveShieldTimer: this.reviveShieldTimer
      });
    }
  }

  global.PelicanGame = global.PelicanGame || {};
  global.PelicanGame.Engine = {
    GameEngine: GameEngine
  };
})(window);
