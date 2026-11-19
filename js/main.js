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
    const btnBell = document.getElementById('btn-bell');
    const btnPause = document.getElementById('btn-pause');
    const btnPauseLabel = document.getElementById('btn-pause-label');
    const iconPause = document.getElementById('icon-pause');
    const iconPlay = document.getElementById('icon-play');
    const btnSound = document.getElementById('btn-sound');
    const iconSoundOn = document.getElementById('icon-sound-on');
    const iconSoundOff = document.getElementById('icon-sound-off');

    // Overlays & overlay buttons
    const overlayStart = document.getElementById('overlay-start');
    const overlayPause = document.getElementById('overlay-pause');
    const overlayVictory = document.getElementById('overlay-victory');
    const overlayRevive = document.getElementById('overlay-revive');
    const overlayGameover = document.getElementById('overlay-gameover');

    const btnStartTour = document.getElementById('btn-start-tour');
    const btnResumeTour = document.getElementById('btn-resume-tour');
    const btnPauseRestart = document.getElementById('btn-pause-restart');
    const btnContinueEndless = document.getElementById('btn-continue-endless');
    const btnPlayAgainVictory = document.getElementById('btn-play-again-victory');
    const btnFreeContinue = document.getElementById('btn-free-continue');
    const btnReviveRestart = document.getElementById('btn-revive-restart');
    const btnRestart = document.getElementById('btn-restart');

    // Overlay stats fields
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

    function updateActiveCampusUI(campus) {
      if (campus.id === lastActiveCampusId) return;
      lastActiveCampusId = campus.id;
      hudCampusDot.style.backgroundColor = campus.badgeColor;
      hudCampusName.textContent = campus.name;
      hudCampusLandmark.textContent = campus.landmark;

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
      overlayStart.hidden = st !== 'idle';
      overlayPause.hidden = st !== 'paused';
      overlayVictory.hidden = st !== 'victory';
      overlayRevive.hidden = st !== 'revive';
      overlayGameover.hidden = st !== 'gameover';

      const canPause = st === 'playing' || st === 'paused';
      btnPause.disabled = !canPause;
      const isPaused = st === 'paused';
      btnPauseLabel.textContent = isPaused ? 'Resume' : 'Pause';
      iconPause.hidden = isPaused;
      iconPlay.hidden = !isPaused;

      if (st === 'victory') {
        victoryScoreEl.textContent = padScore(snapshot.score);
        victoryTimeEl.textContent = formatTime(snapshot.runTime);
        victoryClearedEl.textContent = String(snapshot.clearedCount);
        victoryCampusesEl.textContent = snapshot.visitedCount + ' / 4';
        if (lastState !== 'victory') {
          announce('World Tour complete! Final score ' + snapshot.score + '.');
          btnContinueEndless.focus();
        }
      } else if (st === 'revive') {
        reviveScoreEl.textContent = padScore(snapshot.score);
        reviveCampusEl.textContent = snapshot.campus.shortName;
        reviveLeftEl.textContent = String(snapshot.freeContinues || 0);
        if (lastState !== 'revive') {
          announce('Free Continue available! Press Space to continue from ' + snapshot.campus.shortName + ' at score ' + snapshot.score + '.');
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

        if (hud.endlessMode) {
          hudModeBadge.textContent = 'ENDLESS';
          hudModeBadge.dataset.mode = 'endless';
        } else if (hud.isPreview) {
          hudModeBadge.textContent = 'PREVIEW';
          hudModeBadge.dataset.mode = 'preview';
        } else {
          hudModeBadge.textContent = 'WORLD TOUR';
          hudModeBadge.dataset.mode = 'tour';
        }

        const pct = Math.round(hud.tourProgress * 100);
        tourProgressFill.style.width = pct + '%';
        tourProgressEl.setAttribute('aria-valuenow', String(Math.min(1400, hud.score)));

        const thresholds = { 'mountain-view': 0, london: 350, tokyo: 700, zurich: 1050 };
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
          hudContinueBadge.textContent = 'CONTINUE ×' + continues;
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
        } else if (type === 'continue-unlocked') {
          announce('3 Google G logos collected! Free Continue unlocked.');
        }
      }
    });

    global.PelicanGame.instance = engine;
    syncSoundButton();
    engine.startLoop();

    // Button listeners
    btnBell.addEventListener('click', function () {
      engine.ringBell();
    });

    btnPause.addEventListener('click', function () {
      engine.togglePause();
    });

    btnSound.addEventListener('click', function () {
      AudioMod.toggleMute();
      syncSoundButton();
    });

    btnStartTour.addEventListener('click', function () {
      engine.startTour('mountain-view');
      canvas.focus();
    });

    btnResumeTour.addEventListener('click', function () {
      engine.togglePause();
    });

    btnPauseRestart.addEventListener('click', function () {
      engine.restart();
      canvas.focus();
    });

    btnContinueEndless.addEventListener('click', function () {
      engine.continueEndless();
      canvas.focus();
    });

    btnPlayAgainVictory.addEventListener('click', function () {
      engine.startTour('mountain-view');
      canvas.focus();
    });

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

    // Canvas pointer controls (press-and-hold variable jump)
    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      canvas.focus();
      engine.jumpPress();
    });

    global.addEventListener('pointerup', function () {
      engine.jumpRelease();
    });

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
        engine.startTour('mountain-view');
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
        engine.ringBell();
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
          const isQuickSpaceButton = focused === btnStartTour || focused === btnRestart || focused === btnFreeContinue;
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
