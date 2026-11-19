(function (global) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const AudioMod = global.PelicanGame.Audio;
    const EngineMod = global.PelicanGame.Engine;

    const canvas = document.getElementById('game-canvas');
    const srAnnouncer = document.getElementById('sr-announcer');

    // HUD elements
    const hudCampusDot = document.getElementById('hud-campus-dot');
    const hudCampusName = document.getElementById('hud-campus-name');
    const hudCampusLandmark = document.getElementById('hud-campus-landmark');
    const hudCampusDiff = document.getElementById('hud-campus-diff');
    const hudModeBadge = document.getElementById('hud-mode-badge');
    const hudHiScore = document.getElementById('hud-hi-score');
    const hudScore = document.getElementById('hud-score');
    const hudGeminiPill = document.getElementById('hud-gemini-pill');
    const hudGeminiTime = document.getElementById('hud-gemini-time');
    const hudGPips = Array.from(document.querySelectorAll('#hud-g-tracker .g-pip'));
    const hudContinueBadge = document.getElementById('hud-continue-badge');
    const tourProgressEl = document.getElementById('tour-progress');
    const tourProgressFill = document.getElementById('tour-progress-fill');
    const routeStops = Array.from(document.querySelectorAll('.route-stop[data-stop]'));
    const campusPills = Array.from(document.querySelectorAll('.campus-pill'));

    // Toolbar buttons
    const btnModeNoogler = document.getElementById('btn-mode-noogler');
    const btnModeGoogler = document.getElementById('btn-mode-googler');
    const btnBell = document.getElementById('btn-bell');
    const btnPause = document.getElementById('btn-pause');
    const btnPauseLabel = document.getElementById('btn-pause-label');
    const iconPause = document.getElementById('icon-pause');
    const iconPlay = document.getElementById('icon-play');
    const btnSound = document.getElementById('btn-sound');
    const iconSoundOn = document.getElementById('icon-sound-on');
    const iconSoundOff = document.getElementById('icon-sound-off');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnExitFullscreen = document.getElementById('btn-exit-fullscreen');
    const btnFsPause = document.getElementById('btn-fs-pause');
    const fsIconPause = document.getElementById('fs-icon-pause');
    const fsIconPlay = document.getElementById('fs-icon-play');

    // Overlays & overlay buttons
    const overlayStart = document.getElementById('overlay-start');
    const overlayPause = document.getElementById('overlay-pause');
    const overlayRespawnUnlocked = document.getElementById('overlay-respawn-unlocked');
    const overlayVictory = document.getElementById('overlay-victory');
    const overlayEndOfEarth = document.getElementById('overlay-end-of-earth');
    const overlayRevive = document.getElementById('overlay-revive');
    const overlayGameover = document.getElementById('overlay-gameover');
    const secretPickerSection = document.getElementById('secret-picker-section');
    const secretPickerTitle = document.getElementById('secret-picker-title');
    const secretPills = Array.from(document.querySelectorAll('.campus-pill-secret[data-secret-index]'));

    const btnStartTour = document.getElementById('btn-start-tour');
    const btnResumeTour = document.getElementById('btn-resume-tour');
    const btnPauseRestart = document.getElementById('btn-pause-restart');
    const btnRespawnContinue = document.getElementById('btn-respawn-continue');
    const btnEnterSecrets = document.getElementById('btn-enter-secrets');
    const btnContinueEndless = document.getElementById('btn-continue-endless');
    const btnPlayAgainVictory = document.getElementById('btn-play-again-victory');
    const btnEoeEndless = document.getElementById('btn-eoe-endless');
    const btnEoeRestart = document.getElementById('btn-eoe-restart');
    const btnFreeContinue = document.getElementById('btn-free-continue');
    const btnReviveRestart = document.getElementById('btn-revive-restart');
    const btnRestart = document.getElementById('btn-restart');

    // Overlay stats fields
    const respawnStoredCountEl = document.getElementById('respawn-stored-count');
    const victoryScoreEl = document.getElementById('victory-score');
    const victoryTimeEl = document.getElementById('victory-time');
    const victoryClearedEl = document.getElementById('victory-cleared');
    const victoryCampusesEl = document.getElementById('victory-campuses');
    const reviveScoreEl = document.getElementById('revive-score');
    const reviveCampusEl = document.getElementById('revive-campus');
    const reviveLeftEl = document.getElementById('revive-left');
    const gameoverScoreEl = document.getElementById('gameover-score');
    const gameoverBestEl = document.getElementById('gameover-best');
    const gameoverCampusEl = document.getElementById('gameover-campus');
    const gameoverNewHiEl = document.getElementById('gameover-new-hi');

    // Touch controls
    const btnTouchDuck = document.getElementById('btn-touch-duck');
    const btnTouchJump = document.getElementById('btn-touch-jump');

    let lastActiveCampusId = '';
    let lastState = '';

    function padScore(n) {
      return String(Math.max(0, Math.floor(n))).padStart(5, '0');
    }

    function formatTime(sec) {
      const total = Math.max(0, Math.round(sec));
      const m = Math.floor(total / 60);
      const s = total % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function announce(text) {
      if (!srAnnouncer || !text) return;
      srAnnouncer.textContent = '';
      global.setTimeout(function () {
        srAnnouncer.textContent = text;
      }, 30);
    }

    function syncSoundButton() {
      const muted = AudioMod.isMuted();
      btnSound.setAttribute('aria-pressed', muted ? 'false' : 'true');
      iconSoundOn.hidden = muted;
      iconSoundOff.hidden = !muted;
    }

    function syncSpeedModeButtons(mode) {
      const isNoogler = mode === 'noogler';
      btnModeNoogler.setAttribute('aria-pressed', isNoogler ? 'true' : 'false');
      btnModeGoogler.setAttribute('aria-pressed', isNoogler ? 'false' : 'true');
    }

    function updateActiveCampusUI(campus) {
      if (campus.id === lastActiveCampusId) return;
      lastActiveCampusId = campus.id;
      hudCampusDot.style.backgroundColor = campus.badgeColor;
      hudCampusName.textContent = campus.name;
      hudCampusLandmark.textContent = campus.landmark;
      hudCampusDiff.textContent = campus.difficultyLabel || ('LVL ' + (campus.difficulty || 1));
      if (campus.difficulty >= 6) {
        hudCampusDiff.classList.add('diff-badge-hardest');
      } else {
        hudCampusDiff.classList.remove('diff-badge-hardest');
      }

      for (let i = 0; i < campusPills.length; i++) {
        const pill = campusPills[i];
        if (pill.dataset.campus === campus.id) {
          pill.setAttribute('aria-current', 'true');
        } else {
          pill.removeAttribute('aria-current');
        }
      }
    }

    function updateOverlays(snapshot) {
      const st = snapshot.state;
      document.body.classList.toggle('is-playing', st === 'playing');
      overlayStart.hidden = st !== 'idle';
      overlayPause.hidden = st !== 'paused';
      overlayRespawnUnlocked.hidden = st !== 'respawn-unlocked';
      overlayVictory.hidden = st !== 'victory';
      if (overlayEndOfEarth) overlayEndOfEarth.hidden = st !== 'end-of-earth';
      overlayRevive.hidden = st !== 'revive';
      overlayGameover.hidden = st !== 'gameover';
      if (secretPickerSection) {
        const unlocked = snapshot.secretUnlockCount || 0;
        secretPickerSection.hidden = unlocked <= 0;
        if (secretPickerTitle) {
          secretPickerTitle.textContent = unlocked === 1 ? 'Secret Level Unlocked' : 'Secret Levels Unlocked';
        }
        for (let i = 0; i < secretPills.length; i++) {
          const idx = parseInt(secretPills[i].dataset.secretIndex || '99', 10);
          secretPills[i].hidden = idx > unlocked;
        }
      }

      const canPause = st === 'playing' || st === 'paused';
      btnPause.disabled = !canPause;
      const isPaused = st === 'paused';
      btnPauseLabel.textContent = isPaused ? 'Resume' : 'Pause';
      btnPause.setAttribute('aria-label', isPaused ? 'Resume' : 'Pause');
      iconPause.hidden = isPaused;
      iconPlay.hidden = !isPaused;
      if (btnFsPause) {
        btnFsPause.disabled = !canPause;
        btnFsPause.setAttribute('aria-label', isPaused ? 'Resume' : 'Pause');
        fsIconPause.hidden = isPaused;
        fsIconPlay.hidden = !isPaused;
      }

      if (st === 'victory') {
        victoryScoreEl.textContent = padScore(snapshot.score);
        victoryTimeEl.textContent = formatTime(snapshot.runTime);
        victoryClearedEl.textContent = String(snapshot.clearedCount);
        victoryCampusesEl.textContent = snapshot.visitedCount + ' / 6';
        if (lastState !== 'victory') {
          announce('World Tour complete! Final score ' + snapshot.score + '.');
          btnContinueEndless.focus();
        }
      } else if (st === 'respawn-unlocked') {
        const stored = snapshot.freeContinues || 1;
        respawnStoredCountEl.textContent = '×' + stored;
        if (lastState !== 'respawn-unlocked') {
          announce('Respawn unlocked! ' + stored + ' respawns stored. Press Space to keep riding.');
          btnRespawnContinue.focus();
        }
      } else if (st === 'revive') {
        reviveScoreEl.textContent = padScore(snapshot.score);
        reviveCampusEl.textContent = snapshot.campus.shortName;
        reviveLeftEl.textContent = String(snapshot.freeContinues || 0);
        if (lastState !== 'revive') {
          announce('Respawn available! Press Space to continue from ' + snapshot.campus.shortName + ' at score ' + snapshot.score + '.');
          btnFreeContinue.focus();
        }
      } else if (st === 'gameover') {
        gameoverScoreEl.textContent = padScore(snapshot.score);
        gameoverBestEl.textContent = padScore(snapshot.highScore);
        gameoverCampusEl.textContent = snapshot.campus.shortName;
        gameoverNewHiEl.hidden = !snapshot.isNewHighScore;
        if (lastState !== 'gameover') {
          announce('Game over at ' + snapshot.campus.shortName + '. Score ' + snapshot.score + '. Press Space to ride again.');
          btnRestart.focus();
        }
      } else if (st === 'paused' && lastState !== 'paused') {
        announce('Game paused.');
        btnResumeTour.focus();
      } else if (st === 'playing') {
        if (lastState === 'paused') {
          announce('Game resumed.');
        }
        const active = document.activeElement;
        if (!active || active === document.body || active.closest('.stage-overlay')) {
          canvas.focus();
        }
      }

      lastState = st;
    }

    const engine = new EngineMod.GameEngine(canvas, {
      onHud: function (hud) {
        hudHiScore.textContent = padScore(hud.highScore);
        hudScore.textContent = padScore(hud.score);
        syncSpeedModeButtons(hud.speedMode);

        const speedLabel = hud.speedMode === 'noogler' ? 'NOOGLER' : 'GOOGLER';
        if (hud.endlessMode) {
          hudModeBadge.textContent = speedLabel + ' · ENDLESS';
          hudModeBadge.dataset.mode = 'endless';
        } else if (hud.isPreview) {
          hudModeBadge.textContent = speedLabel + ' · PREVIEW';
          hudModeBadge.dataset.mode = 'preview';
        } else {
          hudModeBadge.textContent = speedLabel + ' · TOUR';
          hudModeBadge.dataset.mode = 'tour';
        }

        const pct = Math.round(hud.tourProgress * 100);
        tourProgressFill.style.width = pct + '%';
        tourProgressEl.setAttribute('aria-valuenow', String(Math.min(2100, hud.score)));

        const thresholds = { sydney: 0, zurich: 350, london: 700, 'new-york': 1050, tokyo: 1400, 'mountain-view': 1750 };
        for (let i = 0; i < routeStops.length; i++) {
          const stop = routeStops[i];
          const minPts = thresholds[stop.dataset.stop] || 0;
          if (hud.score >= minPts) {
            stop.classList.add('is-reached');
          } else {
            stop.classList.remove('is-reached');
          }
        }

        for (let i = 0; i < hudGPips.length; i++) {
          if (i < (hud.gCount || 0)) {
            hudGPips[i].classList.add('is-collected');
          } else {
            hudGPips[i].classList.remove('is-collected');
          }
        }

        const continues = hud.freeContinues || 0;
        hudContinueBadge.hidden = continues <= 0;
        if (continues > 0) {
          hudContinueBadge.textContent = 'RESPAWNS ×' + continues;
        }

        const invTime = hud.invincibleTimer || 0;
        hudGeminiPill.hidden = invTime <= 0;
        if (invTime > 0) {
          hudGeminiTime.textContent = 'INVINCIBLE ' + invTime.toFixed(1) + 's';
        }

        updateActiveCampusUI(hud.campus);
      },
      onStateChange: function (snapshot) {
        updateOverlays(snapshot);
      },
      onCampusChange: function (campus) {
        announce('Now entering ' + campus.name + ', ' + campus.landmark + '.');
      },
      onMilestone: function (pts) {
        hudScore.classList.remove('milestone-pulse');
        void hudScore.offsetWidth;
        hudScore.classList.add('milestone-pulse');
        announce(pts + ' points reached.');
      },
      onPowerup: function (type, value) {
        if (type === 'gemini') {
          announce('Gemini invincibility active for 6 seconds.');
        } else if (type === 'google-g') {
          announce('Google G collected, ' + value + ' of 3.');
        }
      }
    });

    global.PelicanGame.instance = engine;
    syncSoundButton();
    syncSpeedModeButtons(engine.speedMode);

    // Capability-based mobile / touch detection (prefers pointer/hover media queries over brittle UA strings)
    const coarseQuery = global.matchMedia ? global.matchMedia('(pointer: coarse) and (hover: none)') : null;
    let isTouchDevice = false;
    function applyTouchMode(nextTouch) {
      isTouchDevice = Boolean(nextTouch);
      document.documentElement.classList.toggle('is-touch-device', isTouchDevice);
      engine.setTouchMode(isTouchDevice);
    }
    function detectMobileTouch() {
      const uaMobile = Boolean(global.navigator && global.navigator.userAgentData && global.navigator.userAgentData.mobile);
      return Boolean((coarseQuery && coarseQuery.matches) || uaMobile);
    }
    applyTouchMode(detectMobileTouch());
    if (coarseQuery) {
      if (typeof coarseQuery.addEventListener === 'function') {
        coarseQuery.addEventListener('change', function () {
          applyTouchMode(detectMobileTouch());
        });
      } else if (typeof coarseQuery.addListener === 'function') {
        coarseQuery.addListener(function () {
          applyTouchMode(detectMobileTouch());
        });
      }
    }

    // Unlock Web Audio synchronously on first touch/pointer gesture (iOS Safari requirement)
    function unlockAudioOnce() {
      if (AudioMod.unlock) AudioMod.unlock();
    }
    global.addEventListener('touchstart', unlockAudioOnce, { passive: true, once: true });
    global.addEventListener('pointerdown', unlockAudioOnce, { passive: true, once: true });

    // Mobile Full Screen Arcade Mode (uses native Fullscreen API when supported + 100dvh viewport fallback for iOS Safari)
    let isMobileFullscreen = false;
    function setMobileFullscreen(active, skipNative) {
      isMobileFullscreen = Boolean(active);
      document.documentElement.classList.toggle('is-mobile-fullscreen', isMobileFullscreen);
      document.body.classList.toggle('is-mobile-fullscreen', isMobileFullscreen);
      if (btnFullscreen) {
        btnFullscreen.setAttribute('aria-pressed', isMobileFullscreen ? 'true' : 'false');
      }
      if (!skipNative) {
        try {
          if (isMobileFullscreen) {
            const docEl = document.documentElement;
            if (!document.fullscreenElement && docEl.requestFullscreen) {
              const p = docEl.requestFullscreen();
              if (p && typeof p.catch === 'function') p.catch(function () {});
            } else if (!document.webkitFullscreenElement && docEl.webkitRequestFullscreen) {
              docEl.webkitRequestFullscreen();
            }
          } else {
            if (document.fullscreenElement && document.exitFullscreen) {
              const p = document.exitFullscreen();
              if (p && typeof p.catch === 'function') p.catch(function () {});
            } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          }
        } catch (_) {}
      }
      global.requestAnimationFrame(function () {
        engine.resizeCanvas();
      });
    }

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', function () {
        setMobileFullscreen(!isMobileFullscreen);
      });
    }
    if (btnExitFullscreen) {
      btnExitFullscreen.addEventListener('click', function () {
        setMobileFullscreen(false);
      });
    }
    if (btnFsPause) {
      btnFsPause.addEventListener('click', function () {
        engine.togglePause();
      });
    }
    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement && isMobileFullscreen) {
        setMobileFullscreen(false, true);
      }
    });

    engine.startLoop();

    // Direct preview hash for End of the Earth finale (#end-of-earth)
    if (global.location && global.location.hash === '#end-of-earth') {
      engine.jumpToEndOfEarth();
      const startEndingAudioOnGesture = function () {
        if (engine.state === 'end-of-earth' && AudioMod.playAtariEndingMusic) {
          AudioMod.unlock();
          AudioMod.playAtariEndingMusic();
        }
      };
      global.addEventListener('pointerdown', startEndingAudioOnGesture, { once: true });
      global.addEventListener('keydown', startEndingAudioOnGesture, { once: true });
    }

    // Button listeners
    btnModeNoogler.addEventListener('click', function (e) {
      engine.setSpeedMode('noogler');
      syncSpeedModeButtons('noogler');
      announce('Noogler mode: steady cruise speed.');
      if (e.detail > 0) canvas.focus();
    });

    btnModeGoogler.addEventListener('click', function (e) {
      engine.setSpeedMode('googler');
      syncSpeedModeButtons('googler');
      announce('Googler mode: speed increases continuously.');
      if (e.detail > 0) canvas.focus();
    });

    // Easter Egg: Every 5 Bike Bell rings reveals the next Secret Level one at a time
    let bellEasterCount = 0;
    function handleBellRing() {
      engine.ringBell();
      bellEasterCount += 1;
      if (bellEasterCount % 5 === 0 && engine.secretUnlockCount < 3) {
        engine.unlockNextSecret(true);
        announce('New secret level unlocked!');
      }
    }

    btnBell.addEventListener('click', function (e) {
      handleBellRing();
      if (e.detail > 0) canvas.focus();
    });

    btnPause.addEventListener('click', function () {
      engine.togglePause();
    });

    btnSound.addEventListener('click', function (e) {
      AudioMod.toggleMute();
      syncSoundButton();
      if (e.detail > 0) canvas.focus();
    });

    btnStartTour.addEventListener('click', function () {
      engine.startTour('sydney');
      canvas.focus();
    });

    btnResumeTour.addEventListener('click', function () {
      engine.togglePause();
    });

    btnPauseRestart.addEventListener('click', function () {
      engine.restart();
      canvas.focus();
    });

    btnRespawnContinue.addEventListener('click', function () {
      engine.dismissRespawnSplash();
      canvas.focus();
    });

    if (btnEnterSecrets) {
      btnEnterSecrets.addEventListener('click', function () {
        engine.enterSecretLevels();
        canvas.focus();
      });
    }

    btnContinueEndless.addEventListener('click', function () {
      engine.continueEndless();
      canvas.focus();
    });

    btnPlayAgainVictory.addEventListener('click', function () {
      engine.startTour('sydney');
      canvas.focus();
    });

    if (btnEoeEndless) {
      btnEoeEndless.addEventListener('click', function () {
        engine.continueEndless();
        canvas.focus();
      });
    }

    if (btnEoeRestart) {
      btnEoeRestart.addEventListener('click', function () {
        engine.startTour('sydney');
        canvas.focus();
      });
    }

    btnFreeContinue.addEventListener('click', function () {
      engine.useFreeContinue();
      canvas.focus();
    });

    btnReviveRestart.addEventListener('click', function () {
      engine.restart();
      canvas.focus();
    });

    btnRestart.addEventListener('click', function () {
      engine.restart();
      canvas.focus();
    });

    // Campus Jump Picker
    for (let i = 0; i < campusPills.length; i++) {
      campusPills[i].addEventListener('click', function (e) {
        const campusId = e.currentTarget.dataset.campus;
        const campus = global.PelicanGame.Campuses.getCampusById(campusId);
        engine.startTour(campusId);
        announce('Jumped to ' + campus.name + ', ' + campus.landmark + '.');
        canvas.focus();
      });
    }

    // Canvas pointer & multi-touch controls (split-screen thumb zones + swipe-down fast-fall)
    const activeTouches = new Map();

    function syncTouchActionsFromMap() {
      let hasJump = false;
      let hasDuck = false;
      activeTouches.forEach(function (entry) {
        if (entry.action === 'jump') hasJump = true;
        if (entry.action === 'duck') hasDuck = true;
      });
      if (!hasJump) engine.jumpRelease();
      engine.setDuck(hasDuck);
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') {
        if (!isTouchDevice) applyTouchMode(true);
        const rect = canvas.getBoundingClientRect();
        const relX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.7;
        const action = engine.state === 'playing' && relX < 0.35 ? 'duck' : 'jump';
        activeTouches.set(e.pointerId, { startY: e.clientY, action: action });
        if (action === 'duck') {
          engine.setDuck(true);
        } else {
          engine.jumpPress();
        }
        return;
      }

      if (e.button !== 0) return;
      canvas.focus();
      engine.jumpPress();
    });

    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'touch') return;
      const entry = activeTouches.get(e.pointerId);
      if (!entry) return;
      if (entry.action === 'jump' && engine.state === 'playing' && (e.clientY - entry.startY) > 26) {
        entry.action = 'duck';
        syncTouchActionsFromMap();
      }
    });

    function handlePointerEnd(e) {
      if (e.pointerType === 'touch') {
        if (activeTouches.delete(e.pointerId)) {
          syncTouchActionsFromMap();
        }
        return;
      }
      engine.jumpRelease();
    }

    global.addEventListener('pointerup', handlePointerEnd);
    global.addEventListener('pointercancel', handlePointerEnd);

    // Dedicated Touch Controls
    btnTouchJump.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      engine.jumpPress();
    });
    btnTouchJump.addEventListener('pointerup', function () {
      engine.jumpRelease();
    });
    btnTouchJump.addEventListener('pointercancel', function () {
      engine.jumpRelease();
    });

    btnTouchDuck.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (engine.state === 'idle') {
        engine.startTour('sydney');
      }
      engine.setDuck(true);
    });
    btnTouchDuck.addEventListener('pointerup', function () {
      engine.setDuck(false);
    });
    btnTouchDuck.addEventListener('pointercancel', function () {
      engine.setDuck(false);
    });
    btnTouchDuck.addEventListener('pointerleave', function () {
      engine.setDuck(false);
    });

    // Keyboard bindings
    global.addEventListener('keydown', function (e) {
      const code = e.code;

      if (code === 'KeyB') {
        e.preventDefault();
        handleBellRing();
        return;
      }

      if (code === 'KeyM') {
        e.preventDefault();
        AudioMod.toggleMute();
        syncSoundButton();
        return;
      }

      if (code === 'KeyP' || code === 'Escape') {
        if (engine.state === 'playing' || engine.state === 'paused') {
          e.preventDefault();
          engine.togglePause();
        }
        return;
      }

      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      const isButtonFocused = activeTag === 'BUTTON';

      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
        // Allow native <button> Space activation for toolbar, campus picker, pause, and victory buttons
        if (code === 'Space' && isButtonFocused) {
          const focused = document.activeElement;
          const isQuickSpaceButton = focused === btnStartTour || focused === btnRestart || focused === btnFreeContinue || focused === btnRespawnContinue;
          if (!isQuickSpaceButton) {
            return;
          }
        }
        e.preventDefault();
        if (!e.repeat) {
          engine.jumpPress();
        }
        return;
      }

      if (code === 'ArrowDown' || code === 'KeyS') {
        e.preventDefault();
        engine.setDuck(true);
      }
    });

    global.addEventListener('keyup', function (e) {
      const code = e.code;
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
        engine.jumpRelease();
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        engine.setDuck(false);
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        engine.pauseIfPlaying();
      }
    });
  });
})(window);
