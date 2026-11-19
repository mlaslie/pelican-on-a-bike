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
    },
    sydney: {
      ground: [
        { kind: 'surfboard-rack', w: 44, h: 48 },
        { kind: 'ferry-bollard', w: 44, h: 36 },
        { kind: 'sydney-scooter', w: 48, h: 42 }
      ],
      aerial: [
        { kind: 'harbour-gull', w: 50, h: 26 }
      ]
    },
    'new-york': {
      ground: [
        { kind: 'nyc-hydrant', w: 34, h: 46 },
        { kind: 'coffee-cart', w: 52, h: 48 },
        { kind: 'subway-barrier', w: 48, h: 38 }
      ],
      aerial: [
        { kind: 'nyc-pigeon', w: 46, h: 26 }
      ]
    },
    'cloud-tpu': {
      ground: [
        { kind: 'tpu-rack', w: 38, h: 54 },
        { kind: 'cooling-valve', w: 48, h: 38 },
        { kind: 'fiber-node', w: 36, h: 48 }
      ],
      aerial: [
        { kind: 'data-packet', w: 48, h: 24 }
      ]
    },
    'moonshot-moon': {
      ground: [
        { kind: 'lunar-rover', w: 54, h: 42 },
        { kind: 'moon-dish', w: 40, h: 50 },
        { kind: 'moon-rock', w: 44, h: 36 }
      ],
      aerial: [
        { kind: 'orbital-sat', w: 54, h: 26 }
      ]
    },
    'dino-desert': {
      ground: [
        { kind: 'pixel-cactus-sm', w: 30, h: 48 },
        { kind: 'pixel-cactus-lg', w: 48, h: 52 }
      ],
      aerial: [
        { kind: 'pixel-ptero', w: 50, h: 28 }
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

  function drawSurfboardRack(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Timber stand base
    ctx.fillStyle = '#8b5e3c';
    ctx.fillRect(4, h - 7, w - 8, 7);
    // Two colorful surfboards leaning upright
    ctx.fillStyle = '#00acc1';
    ctx.strokeStyle = '#006064';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(14, 21, 7, 19, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbc04';
    ctx.strokeStyle = '#8f5700';
    ctx.beginPath();
    ctx.ellipse(29, 23, 7, 17, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawFerryBollard(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#5f6368';
    ctx.fillRect(6, h - 6, w - 12, 6);
    ctx.fillStyle = '#00838f';
    ctx.strokeStyle = '#004d40';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(10, 8, w - 20, h - 13, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(10, 14, w - 20, 4);
    ctx.restore();
  }

  function drawSydneyScooter(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Wheels
    ctx.fillStyle = '#202124';
    ctx.beginPath();
    ctx.arc(10, h - 6, 5.5, 0, Math.PI * 2);
    ctx.arc(38, h - 6, 5.5, 0, Math.PI * 2);
    ctx.fill();
    // Teal deck & stem
    ctx.strokeStyle = '#00acc1';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(10, h - 8);
    ctx.lineTo(35, h - 8);
    ctx.lineTo(31, 7);
    ctx.stroke();
    ctx.strokeStyle = '#202124';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(26, 7);
    ctx.lineTo(36, 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawNYCHydrant(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#9aa0a6';
    ctx.fillRect(8, h - 6, w - 16, 6);
    ctx.fillStyle = '#fbbc04';
    ctx.strokeStyle = '#7c4a00';
    ctx.lineWidth = 1.4;
    ctx.fillRect(10, 12, w - 20, h - 18);
    ctx.strokeRect(10, 12, w - 20, h - 18);
    // Side nozzles
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(4, 17, 6, 7);
    ctx.fillRect(w - 10, 17, 6, 7);
    // Domed silver cap
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.arc(w * 0.5, 12, 8, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawCoffeeCart(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Wheels
    ctx.fillStyle = '#202124';
    ctx.beginPath();
    ctx.arc(12, h - 6, 5.5, 0, Math.PI * 2);
    ctx.arc(w - 12, h - 6, 5.5, 0, Math.PI * 2);
    ctx.fill();
    // Stainless steel body
    ctx.fillStyle = '#cfd8dc';
    ctx.strokeStyle = '#455a64';
    ctx.lineWidth = 1.4;
    ctx.fillRect(4, h - 30, w - 8, 22);
    ctx.strokeRect(4, h - 30, w - 8, 22);
    // Blue & yellow NYC cart canopy
    ctx.fillStyle = '#1a73e8';
    ctx.fillRect(2, 5, w - 4, 10);
    ctx.fillStyle = '#fbbc04';
    ctx.fillRect(10, 5, 10, 10);
    ctx.fillRect(32, 5, 10, 10);
    ctx.strokeStyle = '#455a64';
    ctx.beginPath();
    ctx.moveTo(8, 15);
    ctx.lineTo(8, h - 30);
    ctx.moveTo(w - 8, 15);
    ctx.lineTo(w - 8, h - 30);
    ctx.stroke();
    ctx.restore();
  }

  function drawSubwayBarrier(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Classic green MTA subway railing post & sign
    ctx.fillStyle = '#2e6f40';
    ctx.fillRect(7, 8, 5, h - 8);
    ctx.fillRect(w - 12, 8, 5, h - 8);
    ctx.fillRect(4, 11, w - 8, 5);
    ctx.fillRect(4, 22, w - 8, 4);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w * 0.5, 13, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a73e8';
    ctx.beginPath();
    ctx.arc(w * 0.5, 13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Secret Level 7: The Cloud / TPU Data Center ---
  function drawTpuRack(ctx, x, y, w, h, timeSec) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#141e33';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(3, 2, w - 6, h - 2, 4);
    ctx.fill();
    ctx.stroke();
    for (let r = 0; r < 4; r++) {
      const ry = 8 + r * 11;
      ctx.fillStyle = '#223659';
      ctx.fillRect(7, ry, w - 14, 7);
      const blink = Math.sin(timeSec * 7 + r * 1.4) > 0;
      ctx.fillStyle = blink ? '#00e5ff' : '#34a853';
      ctx.fillRect(9, ry + 2, 4, 3);
      ctx.fillStyle = r % 2 === 0 ? '#4285F4' : '#b388ff';
      ctx.fillRect(16, ry + 2.5, w - 25, 2);
    }
    ctx.restore();
  }

  function drawCoolingValve(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(4, h - 20, w - 8, 12);
    ctx.fillStyle = '#EA4335';
    ctx.fillRect(10, h - 32, 8, 14);
    ctx.fillStyle = '#34A853';
    ctx.fillRect(w - 18, h - 32, 8, 14);
    ctx.strokeStyle = '#FBBC04';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(w * 0.5, h - 28, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#26344d';
    ctx.fillRect(2, h - 8, w - 4, 8);
    ctx.restore();
  }

  function drawFiberNode(ctx, x, y, w, h, timeSec) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#1b2942';
    ctx.strokeStyle = '#7ef9ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(8, 12, w - 16, h - 12, 4);
    ctx.fill();
    ctx.stroke();
    const glow = 0.65 + 0.35 * Math.sin(timeSec * 6);
    ctx.fillStyle = 'rgba(0, 229, 255, ' + glow.toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(w * 0.5, 9, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w * 0.5, 9, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDataPacket(ctx, x, y, w, h, timeSec) {
    ctx.save();
    ctx.translate(x + w * 0.5, y + h * 0.5);
    const pulse = 0.8 + 0.2 * Math.sin(timeSec * 8);
    // Neon speed tail
    ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(10, -5);
    ctx.lineTo(w * 0.55, 0);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();
    // Glowing diamond packet
    ctx.fillStyle = '#b388ff';
    ctx.strokeStyle = '#7ef9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(0, -10 * pulse);
    ctx.lineTo(16, 0);
    ctx.lineTo(0, 10 * pulse);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Secret Level 8: Google X -> The Moon ---
  function drawLunarRover(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    // Gold-foil chassis
    ctx.fillStyle = '#fbbc04';
    ctx.strokeStyle = '#b06000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(8, h - 28, w - 16, 16, 4);
    ctx.fill();
    ctx.stroke();
    // Camera mast & dish
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(14, h - 40, 3, 14);
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(10, h - 42, 10, 6);
    // Mesh lunar wheels
    const wheels = [14, w * 0.5, w - 14];
    for (let i = 0; i < wheels.length; i++) {
      ctx.fillStyle = '#3c4043';
      ctx.strokeStyle = '#d9dee3';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(wheels[i], h - 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMoonDish(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#9aa0a6';
    ctx.fillRect(w * 0.5 - 3, 20, 6, h - 20);
    ctx.fillRect(w * 0.5 - 10, h - 6, 20, 6);
    ctx.fillStyle = '#e8eaed';
    ctx.strokeStyle = '#5f6368';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(w * 0.5, 18, 15, 0.9 * Math.PI, 1.95 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#b388ff';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 6, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMoonRock(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#8b92a1';
    ctx.strokeStyle = '#555c6d';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4, h);
    ctx.lineTo(10, 12);
    ctx.lineTo(w * 0.45, 4);
    ctx.lineTo(w - 8, 14);
    ctx.lineTo(w - 3, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#636a7a';
    ctx.beginPath();
    ctx.ellipse(w * 0.38, 18, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.65, 25, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawOrbitalSat(ctx, x, y, w, h, timeSec) {
    ctx.save();
    ctx.translate(x + w * 0.5, y + h * 0.5);
    // Blue solar wings
    ctx.fillStyle = '#1a73e8';
    ctx.strokeStyle = '#8ab4f8';
    ctx.lineWidth = 1.2;
    ctx.fillRect(-w * 0.46, -5, 16, 10);
    ctx.strokeRect(-w * 0.46, -5, 16, 10);
    ctx.fillRect(w * 0.46 - 16, -5, 16, 10);
    ctx.strokeRect(w * 0.46 - 16, -5, 16, 10);
    // Gold satellite core
    ctx.fillStyle = '#fbbc04';
    ctx.strokeStyle = '#b06000';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.strokeRect(-8, -8, 16, 16);
    // Blinking beacon
    ctx.fillStyle = Math.sin(timeSec * 8) > 0 ? '#ff5252' : '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -11, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Secret Level 9: Chrome Dino Desert ---
  function drawPixelCactus(ctx, x, y, w, h, isLarge, dinoNight) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = dinoNight ? '#d8dadf' : '#535353';
    if (!isLarge) {
      // Classic single Chrome Dino pixel cactus
      ctx.fillRect(w * 0.5 - 4, 2, 8, h - 2);
      ctx.fillRect(3, 14, 7, 5);
      ctx.fillRect(3, 10, 4, 9);
      ctx.fillRect(w - 10, 18, 7, 5);
      ctx.fillRect(w - 7, 12, 4, 11);
    } else {
      // Classic twin pixel cactus cluster
      ctx.fillRect(10, 2, 8, h - 2);
      ctx.fillRect(3, 16, 7, 5);
      ctx.fillRect(3, 11, 4, 10);
      ctx.fillRect(18, 20, 6, 5);
      ctx.fillRect(30, 10, 8, h - 10);
      ctx.fillRect(38, 22, 7, 5);
      ctx.fillRect(41, 16, 4, 11);
    }
    ctx.restore();
  }

  function drawPixelPtero(ctx, x, y, w, h, timeSec, dinoNight) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = dinoNight ? '#d8dadf' : '#535353';
    const wingUp = Math.floor(timeSec * 8) % 2 === 0;
    // Head & beak pointing left
    ctx.fillRect(2, 10, 12, 5);
    ctx.fillRect(10, 7, 10, 8);
    // Body & tail
    ctx.fillRect(18, 11, 20, 7);
    ctx.fillRect(38, 13, 8, 4);
    // Classic flapping pixel wing
    if (wingUp) {
      ctx.fillRect(20, 1, 12, 10);
      ctx.fillRect(24, -2, 6, 4);
    } else {
      ctx.fillRect(20, 18, 12, 9);
      ctx.fillRect(24, 25, 6, 4);
    }
    ctx.restore();
  }

  function drawObstacleBody(ctx, obs, timeSec, dinoNight) {
    switch (obs.kind) {
      case 'gbike-parked': drawParkedGBike(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'android-statue': drawAndroidStatue(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'noogler-pack': drawNooglerPack(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'seagull':
      case 'harbour-gull':
        drawBirdObstacle(ctx, obs.x, obs.y, obs.w, obs.h, timeSec, { body: '#ffffff', wing: '#cfd8dc', beak: '#fbbc04' }); break;
      case 'paper-plane': drawPaperPlane(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'postbox': drawPostbox(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'bollards': drawBollards(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'umbrella-stand': drawUmbrellaStand(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'pigeon':
      case 'nyc-pigeon':
        drawBirdObstacle(ctx, obs.x, obs.y, obs.w, obs.h, timeSec, { body: '#90a4ae', wing: '#607d8b', beak: '#455a64', neckBand: '#66bb6a' }); break;
      case 'vending-machine': drawVendingMachine(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'tokyo-barricade': drawTokyoBarricade(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'delivery-crates': drawDeliveryCrates(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'tokyo-drone': drawTokyoDrone(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'origami-crane': drawOrigamiCrane(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'brewery-bollard': drawBreweryBollard(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'tram-sign': drawTramSign(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'alpine-planter': drawAlpinePlanter(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'alpine-swift': drawBirdObstacle(ctx, obs.x, obs.y, obs.w, obs.h, timeSec, { body: '#37474f', wing: '#263238', beak: '#cfd8dc' }); break;
      case 'surfboard-rack': drawSurfboardRack(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'ferry-bollard': drawFerryBollard(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'sydney-scooter': drawSydneyScooter(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'nyc-hydrant': drawNYCHydrant(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'coffee-cart': drawCoffeeCart(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'subway-barrier': drawSubwayBarrier(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'tpu-rack': drawTpuRack(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'cooling-valve': drawCoolingValve(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'fiber-node': drawFiberNode(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'data-packet': drawDataPacket(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'lunar-rover': drawLunarRover(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'moon-dish': drawMoonDish(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'moon-rock': drawMoonRock(ctx, obs.x, obs.y, obs.w, obs.h); break;
      case 'orbital-sat': drawOrbitalSat(ctx, obs.x, obs.y, obs.w, obs.h, timeSec); break;
      case 'pixel-cactus-sm': drawPixelCactus(ctx, obs.x, obs.y, obs.w, obs.h, false, dinoNight); break;
      case 'pixel-cactus-lg': drawPixelCactus(ctx, obs.x, obs.y, obs.w, obs.h, true, dinoNight); break;
      case 'pixel-ptero': drawPixelPtero(ctx, obs.x, obs.y, obs.w, obs.h, timeSec, dinoNight); break;
      default: drawAndroidStatue(ctx, obs.x, obs.y, obs.w, obs.h); break;
    }
  }

  function drawObstacle(ctx, obs, timeSec, dinoNight) {
    if (obs.smashed) {
      const cx = obs.x + obs.w * 0.5;
      const cy = obs.y + obs.h * 0.5;
      ctx.save();
      ctx.globalAlpha = Math.max(0, obs.alpha);
      ctx.translate(cx, cy);
      ctx.rotate(obs.rot || 0);
      ctx.translate(-cx, -cy);
      drawObstacleBody(ctx, obs, timeSec, dinoNight);
      ctx.restore();
      return;
    }
    drawShadow(ctx, obs.x, obs.w, obs.isAerial);
    ctx.save();
    ctx.shadowColor = 'rgba(20, 24, 31, 0.30)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    drawObstacleBody(ctx, obs, timeSec, dinoNight);
    ctx.restore();
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
      if (runTime < 1.2) return true;
      if (!endlessMode && score > 2045 && score < 2100) return true;
      if (!endlessMode && score > 3095) return true;

      const boundaries = [350, 700, 1050, 1400, 1750, 2100, 2450, 2800];
      const wrapped = endlessMode ? score % 3150 : score;
      for (let i = 0; i < boundaries.length; i++) {
        if (Math.abs(wrapped - boundaries[i]) <= 18) return true;
      }
      if (endlessMode && (wrapped < 18 || wrapped > 3132)) return true;
      return false;
    }

    buildAerial(spec, x, diff, allowLowSkimmer) {
      const speedMult = diff <= 2 ? 1.0 : diff === 3 ? 1.15 : diff === 4 ? 1.22 : diff === 5 ? 1.28 : 1.34;
      const isLowSkimmer = allowLowSkimmer && Math.random() < 0.22;
      const swoopAmp = isLowSkimmer ? 0 : (diff >= 6 ? 11 : diff === 5 ? 9 : diff === 4 ? 7 : 0);
      const baseY = isLowSkimmer
        ? GROUND_Y - 22 - spec.h
        : GROUND_Y - 46 - swoopAmp - spec.h;

      return {
        kind: spec.kind,
        x: x,
        y: baseY,
        baseY: baseY,
        w: spec.w,
        h: spec.h,
        isAerial: true,
        speedMult: speedMult,
        swoopAmp: swoopAmp,
        swoopFreq: 4.2,
        swoopPhase: Math.random() * Math.PI * 2,
        cleared: false,
        smashed: false
      };
    }

    spawn(campusId, speed, score, runPoints, runTime, isPreview, difficulty) {
      const pool = CATALOG[campusId] || CATALOG['mountain-view'];
      const diff = Math.max(1, difficulty || 1);
      const allowAerial = runPoints > 70 || diff >= 2 || (isPreview && runTime > 1.8);
      const spawnX = STAGE_W + 40;

      // Pattern 1: Jump -> Fast-Fall -> Duck combo (Level 3+)
      const comboChance = diff >= 3 ? Math.min(0.32, 0.14 + (diff - 3) * 0.055) : 0;
      // Pattern 2: Double Ground Cluster (Level 2+)
      const clusterChance = diff >= 2 ? Math.min(0.32, 0.14 + (diff - 2) * 0.045) : 0;

      const roll = Math.random();
      if (allowAerial && roll < comboChance) {
        const gSpec = pickRandom(pool.ground);
        const aSpec = pickRandom(pool.aerial);
        this.items.push({
          kind: gSpec.kind,
          x: spawnX,
          y: GROUND_Y - gSpec.h,
          baseY: GROUND_Y - gSpec.h,
          w: gSpec.w,
          h: gSpec.h,
          isAerial: false,
          speedMult: 1,
          swoopAmp: 0,
          swoopFreq: 0,
          swoopPhase: 0,
          cleared: false,
          smashed: false
        });
        const comboGap = Math.max(265, speed * 0.50 + 95);
        this.items.push(this.buildAerial(aSpec, spawnX + gSpec.w + comboGap, diff, false));
      } else if (roll < comboChance + clusterChance) {
        const compactGround = pool.ground.filter(function (g) { return g.w <= 46; });
        const clusterPool = compactGround.length > 0 ? compactGround : pool.ground;
        const s1 = pickRandom(clusterPool);
        const s2 = pickRandom(clusterPool);
        this.items.push({
          kind: s1.kind,
          x: spawnX,
          y: GROUND_Y - s1.h,
          baseY: GROUND_Y - s1.h,
          w: s1.w,
          h: s1.h,
          isAerial: false,
          speedMult: 1,
          swoopAmp: 0,
          swoopFreq: 0,
          swoopPhase: 0,
          cleared: false,
          smashed: false
        });
        if (s1.w + s2.w + 8 <= 96) {
          this.items.push({
            kind: s2.kind,
            x: spawnX + s1.w + 8,
            y: GROUND_Y - s2.h,
            baseY: GROUND_Y - s2.h,
            w: s2.w,
            h: s2.h,
            isAerial: false,
            speedMult: 1,
            swoopAmp: 0,
            swoopFreq: 0,
            swoopPhase: 0,
            cleared: false,
            smashed: false
          });
        }
      } else {
        const useAerial = allowAerial && Math.random() < Math.min(0.42, 0.28 + (diff - 1) * 0.025);
        if (useAerial) {
          this.items.push(this.buildAerial(pickRandom(pool.aerial), spawnX, diff, true));
        } else {
          const spec = pickRandom(pool.ground);
          this.items.push({
            kind: spec.kind,
            x: spawnX,
            y: GROUND_Y - spec.h,
            baseY: GROUND_Y - spec.h,
            w: spec.w,
            h: spec.h,
            isAerial: false,
            speedMult: 1,
            swoopAmp: 0,
            swoopFreq: 0,
            swoopPhase: 0,
            cleared: false,
            smashed: false
          });
        }
      }

      const gapFactor = Math.max(0.45, 0.64 - (diff - 1) * 0.035);
      const minGap = Math.max(220, speed * gapFactor + (130 - diff * 5));
      const maxMult = Math.max(1.22, 1.52 - (diff - 1) * 0.045);
      this.nextGap = randomRange(minGap, minGap * maxMult);
    }

    update(dt, speed, campusId, score, runPoints, runTime, isPreview, endlessMode, difficulty, timeSec) {
      const t = timeSec || 0;
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
        obs.x -= speed * (obs.speedMult || 1) * dt;
        if (obs.swoopAmp > 0) {
          obs.y = obs.baseY + Math.sin(t * obs.swoopFreq + obs.swoopPhase) * obs.swoopAmp;
        }
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
        this.spawn(campusId, speed, score, runPoints, runTime, isPreview, difficulty);
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

    draw(ctx, timeSec, dinoNight) {
      for (let i = 0; i < this.items.length; i++) {
        drawObstacle(ctx, this.items[i], timeSec, dinoNight);
      }
    }
  }

  global.PelicanGame = global.PelicanGame || {};
  global.PelicanGame.Obstacles = {
    ObstacleManager: ObstacleManager
  };
})(window);
