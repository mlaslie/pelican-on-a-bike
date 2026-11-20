(function (global) {
  'use strict';

  const GROUND_Y = 282;
  const ANCHOR_X = 122;

  const GRAVITY = 2450;
  const JUMP_VEL = -760;
  const JUMP_CUT_MULT = 1.9;
  const FAST_FALL_MULT = 2.8;
  const COYOTE_TIME = 0.075;
  const JUMP_BUFFER = 0.11;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function solveTwoJointKnee(hipX, hipY, footX, footY, l1, l2) {
    const dx = footX - hipX;
    const dy = footY - hipY;
    const dist = clamp(Math.hypot(dx, dy), 2, l1 + l2 - 0.5);
    const baseAngle = Math.atan2(dy, dx);
    const cosOffset = clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
    const kneeAngle = baseAngle - Math.acos(cosOffset);
    return {
      x: hipX + Math.cos(kneeAngle) * l1,
      y: hipY + Math.sin(kneeAngle) * l1
    };
  }

  class PelicanRider {
    constructor() {
      this.x = ANCHOR_X;
      this.touchMode = false;
      this.gravityScale = 1;
      this.hat = 'noogler';
      this.wearsHelmet = false;
      this.wheelieTimer = 0;
      this.wheelieBlend = 0;
      this.reset();
    }

    setTouchMode(active) {
      this.touchMode = Boolean(active);
    }

    setGravityScale(scale) {
      this.gravityScale = clamp(scale || 1, 0.55, 1.3);
    }

    setHat(name) {
      this.hat = name || 'none';
      this.wearsHelmet = this.hat === 'helmet';
    }

    setHelmet(on) {
      this.wearsHelmet = Boolean(on);
      if (on) this.hat = 'helmet';
    }

    setWheelieTimer(sec) {
      this.wheelieTimer = Math.max(0, sec || 0);
    }

    reset() {
      this.y = GROUND_Y;
      this.vy = 0;
      this.grounded = true;
      this.ducking = false;
      this.jumpHeld = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.crankAngle = 0;
      this.wheelAngle = 0;
      this.tilt = 0;
      this.duckAmount = 0;
      this.wingTimer = 0;
      this.bellTimer = 0;
      this.crashed = false;
      this.happy = false;
      this.crashTime = 0;
      this.idleBobPhase = 0;
      this.justLanded = false;
      this.justJumped = false;
      this.invincibleTimer = 0;
      this.reviveShieldTimer = 0;
      this.wheelieTimer = 0;
      this.wheelieBlend = 0;
    }

    setShieldState(invincibleTimer, reviveShieldTimer) {
      this.invincibleTimer = Math.max(0, invincibleTimer || 0);
      this.reviveShieldTimer = Math.max(0, reviveShieldTimer || 0);
    }

    recoverFromCrash() {
      this.crashed = false;
      this.crashTime = 0;
      this.y = GROUND_Y;
      this.vy = 0;
      this.grounded = true;
      this.tilt = 0;
      this.ducking = false;
      this.duckAmount = 0;
      this.jumpHeld = false;
      this.jumpBufferTimer = 0;
    }

    pressJump() {
      this.jumpHeld = true;
      this.jumpBufferTimer = this.touchMode ? 0.135 : JUMP_BUFFER;
    }

    releaseJump() {
      this.jumpHeld = false;
    }

    setDuck(active) {
      this.ducking = Boolean(active);
    }

    ringBell() {
      this.bellTimer = 0.45;
    }

    setCrashed() {
      this.crashed = true;
      this.crashTime = 0;
    }

    setHappy(flag) {
      this.happy = Boolean(flag);
    }

    getHitbox() {
      if (this.duckAmount > 0.55 && this.grounded) {
        return {
          x: this.x + 16,
          y: this.y - 36,
          w: 56,
          h: 34
        };
      }
      return {
        x: this.x + 18,
        y: this.y - 60,
        w: 50,
        h: 56
      };
    }

    update(dt, speed, isPlaying, isIdle) {
      this.justLanded = false;
      this.justJumped = false;

      if (this.bellTimer > 0) {
        this.bellTimer = Math.max(0, this.bellTimer - dt);
      }

      if (this.crashed) {
        this.crashTime += dt;
        return;
      }

      if (isIdle) {
        this.idleBobPhase += dt * 3.2;
        this.crankAngle += dt * 1.4;
        this.wheelAngle += dt * 1.4;
        return;
      }

      if (!isPlaying) return;

      // Wheel & crank rotation tied directly to ground distance traveled
      const wheelRadius = 16;
      const dist = speed * dt;
      this.wheelAngle += dist / wheelRadius;
      this.crankAngle += (dist / wheelRadius) * 0.85;

      // Coyote & buffer timers
      if (this.grounded) {
        this.coyoteTimer = this.touchMode ? 0.095 : COYOTE_TIME;
      } else {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
      }

      if (this.jumpBufferTimer > 0) {
        this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
      }

      // Execute buffered jump if grounded or within coyote window
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        this.vy = JUMP_VEL;
        this.grounded = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.wingTimer = 0.28;
        this.justJumped = true;
      }

      // Apply Chrome-Dino variable jump height and airborne fast-fall
      if (!this.grounded) {
        let g = GRAVITY * this.gravityScale;
        if (this.ducking) {
          g = GRAVITY * FAST_FALL_MULT;
        } else if (this.vy < 0 && !this.jumpHeld) {
          g *= JUMP_CUT_MULT;
        }
        this.vy += g * dt;
        this.y += this.vy * dt;

        if (this.y >= GROUND_Y) {
          this.y = GROUND_Y;
          this.vy = 0;
          this.grounded = true;
          this.justLanded = true;
        }
      }

      if (this.wingTimer > 0) {
        this.wingTimer = Math.max(0, this.wingTimer - dt);
      }

      const targetDuck = this.ducking && this.grounded ? 1 : 0;
      this.duckAmount = lerp(this.duckAmount, targetDuck, clamp(dt * 18, 0, 1));
      const targetWheelie = (this.wheelieTimer > 0 && this.grounded && !this.ducking) ? 1 : 0;
      this.wheelieBlend = lerp(this.wheelieBlend, targetWheelie, clamp(dt * 12, 0, 1));

      let targetTilt = 0;
      if (!this.grounded) {
        targetTilt = clamp(this.vy / 2600, -0.22, 0.17);
      } else if (this.duckAmount > 0.1) {
        targetTilt = 0.05 * this.duckAmount;
      }
      this.tilt = lerp(this.tilt, targetTilt, clamp(dt * 14, 0, 1));
    }

    drawWheel(ctx, cx, cy, r, angle) {
      ctx.save();
      ctx.translate(cx, cy);

      // Tire rubber
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#202124';
      ctx.stroke();

      // Inner rim highlight
      ctx.beginPath();
      ctx.arc(0, 0, r - 2.6, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#dadce0';
      ctx.stroke();

      // 8 rotating spokes
      ctx.rotate(angle);
      ctx.strokeStyle = '#9aa0a6';
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3));
        ctx.stroke();
      }

      // Hub
      ctx.beginPath();
      ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#5f6368';
      ctx.fill();
      ctx.restore();
    }

    drawLeg(ctx, hipX, hipY, pedalX, pedalY, isFrontLeg) {
      const knee = solveTwoJointKnee(hipX, hipY, pedalX, pedalY, 12.5, 13);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Leg shaft
      ctx.strokeStyle = isFrontLeg ? '#f29900' : '#d57800';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(knee.x, knee.y);
      ctx.lineTo(pedalX, pedalY);
      ctx.stroke();

      // Webbed pelican foot on pedal
      ctx.fillStyle = isFrontLeg ? '#f9ab00' : '#df8300';
      ctx.beginPath();
      ctx.moveTo(pedalX - 4, pedalY);
      ctx.lineTo(pedalX + 7, pedalY - 1);
      ctx.lineTo(pedalX + 6, pedalY + 3.5);
      ctx.lineTo(pedalX - 4, pedalY + 2.5);
      ctx.closePath();
      ctx.fill();

      // Pedal bar
      ctx.fillStyle = '#3c4043';
      ctx.fillRect(pedalX - 4.5, pedalY - 1.2, 9, 2.6);
      ctx.restore();
    }

    draw(ctx, speed, timeSec) {
      const t = timeSec || 0;
      const altitude = Math.max(0, GROUND_Y - this.y);
      const shadowScale = clamp(1 - altitude / 190, 0.35, 1);

      // Ground shadow
      ctx.save();
      ctx.fillStyle = 'rgba(32, 33, 36, ' + (0.2 * shadowScale).toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(this.x + 42, GROUND_Y + 2, 34 * shadowScale, 5.2 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Gemini Starlight Aura (or post-continue safety shield)
      if (!this.crashed && this.invincibleTimer > 0) {
        const expirePulse = this.invincibleTimer <= 1.5
          ? (0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * 11)))
          : 1;
        ctx.save();
        ctx.translate(this.x + 44, this.y - 38);
        ctx.globalAlpha = expirePulse;

        const auraGrad = ctx.createLinearGradient(-48, -36, 48, 36);
        auraGrad.addColorStop(0, '#4285F4');
        auraGrad.addColorStop(0.5, '#8a63f6');
        auraGrad.addColorStop(1, '#24c1e0');

        ctx.fillStyle = 'rgba(138, 99, 246, 0.14)';
        ctx.strokeStyle = auraGrad;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3 orbiting miniature 4-point Gemini sparkles
        for (let i = 0; i < 3; i++) {
          const ang = t * 4.2 + (i * Math.PI * 2) / 3;
          const sx = Math.cos(ang) * 53;
          const sy = Math.sin(ang) * 41;
          const sr = 5;
          ctx.fillStyle = i === 0 ? '#4285F4' : i === 1 ? '#8a63f6' : '#24c1e0';
          ctx.beginPath();
          ctx.moveTo(sx, sy - sr);
          ctx.quadraticCurveTo(sx, sy, sx + sr, sy);
          ctx.quadraticCurveTo(sx, sy, sx, sy + sr);
          ctx.quadraticCurveTo(sx, sy, sx - sr, sy);
          ctx.quadraticCurveTo(sx, sy, sx, sy - sr);
          ctx.fill();
        }
        ctx.restore();
      } else if (!this.crashed && this.reviveShieldTimer > 0) {
        const shieldPulse = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * 11));
        ctx.save();
        ctx.translate(this.x + 44, this.y - 38);
        ctx.globalAlpha = shieldPulse;
        ctx.strokeStyle = '#34A853';
        ctx.fillStyle = 'rgba(66, 133, 244, 0.1)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.ellipse(0, 0, 48, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      const rearWheel = { x: 18, y: -16 };
      const frontWheel = { x: 66, y: -16 };
      const bb = { x: 39, y: -16 };
      const seatCluster = { x: 31, y: -36 };
      const headTubeTop = { x: 56, y: -38 };
      const crankRadius = 6.5;
      const idleBreath = Math.sin(this.idleBobPhase) * 1.1;

      const frontPedal = {
        x: bb.x + Math.cos(this.crankAngle) * crankRadius,
        y: bb.y + Math.sin(this.crankAngle) * crankRadius
      };
      const rearPedal = {
        x: bb.x + Math.cos(this.crankAngle + Math.PI) * crankRadius,
        y: bb.y + Math.sin(this.crankAngle + Math.PI) * crankRadius
      };

      const hip = {
        x: 34 + this.duckAmount * 4,
        y: -39 + this.duckAmount * 5 + idleBreath * 0.4
      };

      ctx.save();
      ctx.translate(this.x, this.y);

      // Golden espresso speed streaks trailing behind the bike during wheelie!
      if (!this.crashed && this.wheelieTimer > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 188, 4, 0.75)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        for (let s = 0; s < 3; s++) {
          const sy = -14 - s * 16;
          const sx = -10 - ((t * 180 + s * 28) % 34);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - 18, sy);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (this.wheelieBlend > 0.01) {
        ctx.translate(18, -16);
        ctx.rotate(-0.24 * this.wheelieBlend);
        ctx.translate(-18, 16);
      }

      ctx.translate(42, -16);
      ctx.rotate(this.tilt);
      ctx.translate(-42, 16);

      // Rear leg behind frame
      this.drawLeg(ctx, hip.x - 1, hip.y, rearPedal.x, rearPedal.y, false);

      // Wheels
      this.drawWheel(ctx, rearWheel.x, rearWheel.y, 16, this.wheelAngle);
      this.drawWheel(ctx, frontWheel.x, frontWheel.y, 16, this.wheelAngle);

      // 4-color Google GBike frame
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Chainstay & seatstay (Red)
      ctx.strokeStyle = '#EA4335';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rearWheel.x, rearWheel.y);
      ctx.lineTo(bb.x, bb.y);
      ctx.moveTo(rearWheel.x, rearWheel.y);
      ctx.lineTo(seatCluster.x, seatCluster.y);
      ctx.lineTo(bb.x, bb.y);
      ctx.stroke();

      // Top tube & down tube (Blue)
      ctx.strokeStyle = '#4285F4';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(seatCluster.x, seatCluster.y);
      ctx.lineTo(headTubeTop.x, headTubeTop.y);
      ctx.lineTo(bb.x, bb.y);
      ctx.stroke();

      // Fork & handlebar stem (Yellow)
      ctx.strokeStyle = '#FBBC04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(frontWheel.x, frontWheel.y);
      ctx.lineTo(headTubeTop.x, headTubeTop.y);
      ctx.lineTo(54, -46);
      ctx.lineTo(59, -48);
      ctx.stroke();

      // Handlebar grip
      ctx.strokeStyle = '#202124';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(57.5, -48);
      ctx.lineTo(62.5, -48);
      ctx.stroke();

      // Seat post & saddle
      ctx.strokeStyle = '#5f6368';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(seatCluster.x, seatCluster.y);
      ctx.lineTo(29.5, -41.5);
      ctx.stroke();
      ctx.fillStyle = '#202124';
      ctx.beginPath();
      ctx.ellipse(29, -42.5, 6.5, 2.3, -0.08, 0, Math.PI * 2);
      ctx.fill();

      // Woven green GBike front basket + tiny coffee cup & rolled blueprint
      ctx.save();
      ctx.translate(65, -41);
      // Blueprint scroll
      ctx.fillStyle = '#e8f0fe';
      ctx.strokeStyle = '#4285F4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-2, -6, 6, 8, 1.5);
      ctx.fill();
      ctx.stroke();
      // Tiny coffee cup
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#5f6368';
      ctx.fillRect(4.5, -5, 4.5, 6);
      ctx.fillStyle = '#EA4335';
      ctx.fillRect(4, -6, 5.5, 1.8);
      // Green basket body
      ctx.fillStyle = '#34A853';
      ctx.strokeStyle = '#1e7e34';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(11, 0);
      ctx.lineTo(9.5, 10);
      ctx.lineTo(-2.5, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Basket weave stripes
      ctx.strokeStyle = '#81c995';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-3, 4.5);
      ctx.lineTo(10, 4.5);
      ctx.moveTo(2.5, 0.5);
      ctx.lineTo(2.5, 9.5);
      ctx.stroke();
      ctx.restore();

      // Chrome bell on stem + active ring arcs
      ctx.fillStyle = '#bdc1c6';
      ctx.beginPath();
      ctx.arc(54.5, -47.5, 2.3, Math.PI, 0);
      ctx.fill();
      if (this.bellTimer > 0) {
        const ringAlpha = clamp(this.bellTimer / 0.45, 0, 1);
        const expand = (0.45 - this.bellTimer) * 26;
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 188, 4, ' + ringAlpha.toFixed(2) + ')';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(54.5, -50, 5 + expand * 0.45, -2.4, -0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(54.5, -50, 9 + expand * 0.65, -2.35, -0.75);
        ctx.stroke();
        ctx.restore();
      }

      // Chainring & crank arm
      ctx.fillStyle = '#5f6368';
      ctx.beginPath();
      ctx.arc(bb.x, bb.y, 4.6, 0, Math.PI * 2);
      ctx.fill();

      // --- PELICAN CHARACTER ---
      const duck = this.duckAmount;
      const bodyCx = lerp(33, 39, duck);
      const bodyCy = lerp(-47, -36.5, duck) + idleBreath * 0.5;
      const headX = lerp(49, 63, duck);
      const headY = lerp(-66, -42.5, duck) + idleBreath;
      const speedTrail = clamp((speed || 360) / 560, 0.6, 1.3);

      // Tail feathers
      ctx.fillStyle = '#e8eaed';
      ctx.strokeStyle = '#3c4043';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(bodyCx - 12, bodyCy - 2);
      ctx.lineTo(bodyCx - 25, bodyCy - 8 + duck * 3);
      ctx.lineTo(bodyCx - 21, bodyCy + 1);
      ctx.lineTo(bodyCx - 26, bodyCy + 4);
      ctx.lineTo(bodyCx - 12, bodyCy + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Plump pelican torso
      ctx.save();
      ctx.translate(bodyCx, bodyCy);
      ctx.rotate(lerp(-0.22, 0.08, duck));
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3c4043';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15.5, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Subtle belly shading
      ctx.fillStyle = '#eef1f4';
      ctx.beginPath();
      ctx.ellipse(-1, 3.8, 12.5, 5.5, 0, 0, Math.PI);
      ctx.fill();
      ctx.restore();

      // Curved S-neck connecting torso to head
      ctx.strokeStyle = '#3c4043';
      ctx.lineWidth = 9.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bodyCx + 9, bodyCy - 3);
      ctx.bezierCurveTo(
        bodyCx + 14,
        lerp(bodyCy - 12, headY + 4, duck),
        headX - 7,
        headY + 9,
        headX - 1,
        headY + 2
      );
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6.8;
      ctx.beginPath();
      ctx.moveTo(bodyCx + 9, bodyCy - 3);
      ctx.bezierCurveTo(
        bodyCx + 14,
        lerp(bodyCy - 12, headY + 4, duck),
        headX - 7,
        headY + 9,
        headX - 1,
        headY + 2
      );
      ctx.stroke();

      // Wing (flaps on jump or idle breeze, tucks flat when ducking)
      ctx.save();
      ctx.translate(bodyCx - 1, bodyCy - 3);
      const wingFlap = this.wingTimer > 0
        ? Math.sin(this.wingTimer * 36) * 0.55 - 0.35
        : (!this.grounded ? -0.3 : Math.sin(this.crankAngle * 0.5) * 0.05);
      ctx.rotate(wingFlap * (1 - duck * 0.85) + duck * 0.14);
      ctx.fillStyle = '#f8f9fa';
      ctx.strokeStyle = '#3c4043';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-4, -3);
      ctx.quadraticCurveTo(9, -6, 13, 2);
      ctx.quadraticCurveTo(3, 8, -11, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Charcoal primary wing tips
      ctx.fillStyle = '#5f6368';
      ctx.beginPath();
      ctx.moveTo(-8, 1);
      ctx.lineTo(-14, 4.5);
      ctx.lineTo(-6, 5.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Head + dynamic feathered crest
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3c4043';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(headX, headY, 8.2, 6.8, duck * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Feathered crest trailing backward
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(headX - 4, headY - 5);
      ctx.lineTo(headX - 11 - speedTrail * 2, headY - 7.5);
      ctx.lineTo(headX - 6.5, headY - 2.5);
      ctx.lineTo(headX - 11, headY - 2);
      ctx.lineTo(headX - 6, headY + 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Signature Pelican Beak & Expandable Golden Throat Pouch
      const pouchBob = Math.sin(this.crankAngle) * 0.8 + (this.grounded ? 0 : 1.5);
      const beakOpen = !this.grounded && !this.crashed ? 2.2 : 0;

      // Expandable lower throat pouch
      ctx.fillStyle = '#f29900';
      ctx.strokeStyle = '#8f5700';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(headX + 5, headY + 2);
      ctx.quadraticCurveTo(headX + 16, headY + 11.5 + pouchBob + beakOpen, headX + 29, headY + 2.5 + beakOpen * 0.6);
      ctx.lineTo(headX + 7, headY + 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Warm pouch highlight
      ctx.fillStyle = '#ffcf70';
      ctx.beginPath();
      ctx.ellipse(headX + 16.5, headY + 4.8 + pouchBob * 0.5, 6.2, 2.2, -0.06, 0, Math.PI * 2);
      ctx.fill();

      // Upper bill with classic hooked pelican tip
      ctx.fillStyle = '#FBBC04';
      ctx.strokeStyle = '#8f5700';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(headX + 5, headY - 2.6);
      ctx.lineTo(headX + 30.5, headY - 0.6);
      ctx.quadraticCurveTo(headX + 33, headY + 1.2, headX + 30, headY + 3.2);
      ctx.lineTo(headX + 28.5, headY + 1.4);
      ctx.lineTo(headX + 5.5, headY + 1.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Expressive Eye
      const eyeX = headX + 2.6;
      const eyeY = headY - 1.2;
      if (this.crashed) {
        ctx.strokeStyle = '#202124';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(eyeX - 2.3, eyeY - 2.3);
        ctx.lineTo(eyeX + 2.3, eyeY + 2.3);
        ctx.moveTo(eyeX + 2.3, eyeY - 2.3);
        ctx.lineTo(eyeX - 2.3, eyeY + 2.3);
        ctx.stroke();

        // Orbiting dizzy stars
        for (let s = 0; s < 3; s++) {
          const ang = this.crashTime * 4.5 + (s * Math.PI * 2) / 3;
          const sx = headX + Math.cos(ang) * 14;
          const sy = headY - 13 + Math.sin(ang) * 4;
          ctx.fillStyle = s === 0 ? '#FBBC04' : s === 1 ? '#4285F4' : '#EA4335';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#202124';
        ctx.beginPath();
        ctx.arc(eyeX + 0.7, eyeY, this.happy ? 1.8 : 1.45, 0, Math.PI * 2);
        ctx.fill();
        // Eye sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX + 1.1, eyeY - 0.6, 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Focused riding brow (relaxes into joyful arc on victory)
        ctx.strokeStyle = '#3c4043';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (this.happy) {
          ctx.arc(eyeX, eyeY - 1.5, 3.2, Math.PI * 1.15, Math.PI * 1.85);
        } else {
          ctx.moveTo(eyeX - 2.4, eyeY - 3.3);
          ctx.lineTo(eyeX + 2.5, eyeY - 2.4);
        }
        ctx.stroke();
      }

      // Per-campus Pelican Hat / Accessory
      if (this.hat === 'helmet' || this.wearsHelmet) {
        ctx.save();
        const hx = headX + 12;
        const hy = headY + 1;
        const hGrad = ctx.createRadialGradient(hx - 8, hy - 8, 3, hx, hy, 22);
        hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
        hGrad.addColorStop(0.65, 'rgba(130, 210, 255, 0.14)');
        hGrad.addColorStop(1, 'rgba(179, 136, 255, 0.32)');
        ctx.fillStyle = hGrad;
        ctx.strokeStyle = 'rgba(220, 240, 255, 0.85)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(hx, hy, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(hx - 4, hy - 2, 13, 1.15 * Math.PI, 1.48 * Math.PI);
        ctx.stroke();
        ctx.restore();
      } else if (this.hat === 'noogler') {
        // Iconic 4-color Google Noogler propeller beanie
        ctx.save();
        ctx.translate(headX - 0.5, headY - 6.5);
        const segs = [
          { a0: Math.PI, a1: Math.PI * 1.25, col: '#4285F4' },
          { a0: Math.PI * 1.25, a1: Math.PI * 1.5, col: '#EA4335' },
          { a0: Math.PI * 1.5, a1: Math.PI * 1.75, col: '#FBBC04' },
          { a0: Math.PI * 1.75, a1: Math.PI * 2, col: '#34A853' }
        ];
        for (let i = 0; i < segs.length; i++) {
          ctx.fillStyle = segs[i].col;
          ctx.beginPath();
          ctx.moveTo(0, 1);
          ctx.arc(0, 1, 7.5, segs[i].a0, segs[i].a1);
          ctx.closePath();
          ctx.fill();
        }
        // Spinning yellow propeller on top
        ctx.fillStyle = '#3c4043';
        ctx.fillRect(-1, -9.5, 2, 3.5);
        const propW = 2 + Math.abs(Math.cos(t * 22)) * 6.5;
        ctx.fillStyle = '#FBBC04';
        ctx.strokeStyle = '#8f5700';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, -9.5, propW, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (this.hat === 'alpine') {
        // Swiss alpine hat with red feather
        ctx.save();
        ctx.translate(headX - 0.5, headY - 7);
        ctx.fillStyle = '#2e5e3e';
        ctx.strokeStyle = '#1b3a26';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 1, 9.5, 2.3, -0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-3.5, -7);
        ctx.lineTo(4.5, -6.5);
        ctx.lineTo(6.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#EA4335';
        ctx.fillRect(-5.5, -2, 11.5, 2);
        ctx.strokeStyle = '#EA4335';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.quadraticCurveTo(-9, -8, -7, -12);
        ctx.stroke();
        ctx.restore();
      } else if (this.hat === 'bowler') {
        // Classic dapper London bowler hat
        ctx.save();
        ctx.translate(headX - 0.5, headY - 7);
        ctx.fillStyle = '#202124';
        ctx.beginPath();
        ctx.ellipse(0, 1, 10, 2.4, -0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0.5, 6.8, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EA4335';
        ctx.fillRect(-6.5, -1.5, 13, 2);
        ctx.restore();
      } else if (this.hat === 'shades') {
        // Cool NYC dark sunglasses
        ctx.save();
        ctx.fillStyle = '#14171a';
        ctx.strokeStyle = '#3c4043';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(headX - 1.5, headY - 4.2, 8.5, 5, 1.5);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX + 0.5, headY - 3);
        ctx.lineTo(headX + 2.5, headY - 0.5);
        ctx.stroke();
        ctx.restore();
      } else if (this.hat === 'headband') {
        // Tokyo hachimaki headband with fluttering ribbons
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#dadce0';
        ctx.lineWidth = 0.8;
        ctx.fillRect(headX - 7.5, headY - 6.2, 14, 3.2);
        ctx.strokeRect(headX - 7.5, headY - 6.2, 14, 3.2);
        ctx.fillStyle = '#EA4335';
        ctx.beginPath();
        ctx.arc(headX + 1.5, headY - 4.6, 1.4, 0, Math.PI * 2);
        ctx.fill();
        const flutter = Math.sin(t * 14) * 2.2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX - 7.5, headY - 5);
        ctx.quadraticCurveTo(headX - 13, headY - 6 + flutter, headX - 17, headY - 3 + flutter);
        ctx.stroke();
        ctx.restore();
      } else if (this.hat === 'visor') {
        // Glowing cyan Cloud TPU cyber-visor
        ctx.save();
        ctx.fillStyle = 'rgba(0, 229, 255, 0.85)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(headX - 2, headY - 4.2, 10, 4.6, 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (this.hat === 'pixel') {
        // Retro Chrome Dino 8-bit pixel cap
        ctx.save();
        ctx.fillStyle = '#535353';
        ctx.fillRect(headX - 7, headY - 10, 12, 4);
        ctx.fillRect(headX - 4, headY - 13, 8, 3);
        ctx.fillRect(headX + 2, headY - 8, 8, 2.5);
        ctx.restore();
      } else if (this.hat === 'crown') {
        // Gleaming Golden Crown at the End of the Earth!
        ctx.save();
        ctx.translate(headX - 0.5, headY - 7);
        ctx.fillStyle = '#FBBC04';
        ctx.strokeStyle = '#b06000';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-6.5, 1);
        ctx.lineTo(-7.5, -7.5);
        ctx.lineTo(-3, -3.5);
        ctx.lineTo(0, -9);
        ctx.lineTo(3, -3.5);
        ctx.lineTo(7.5, -7.5);
        ctx.lineTo(6.5, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Tiny Google-colored crown jewels
        const jCols = ['#4285F4', '#EA4335', '#34A853'];
        for (let j = 0; j < 3; j++) {
          ctx.fillStyle = jCols[j];
          ctx.beginPath();
          ctx.arc(-3.5 + j * 3.5, -1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Front pedaling leg in front of frame
      this.drawLeg(ctx, hip.x + 2, hip.y + 1, frontPedal.x, frontPedal.y, true);

      ctx.restore();
    }
  }

  global.PelicanGame = global.PelicanGame || {};
  global.PelicanGame.Pelican = {
    GROUND_Y: GROUND_Y,
    PelicanRider: PelicanRider
  };
})(window);
