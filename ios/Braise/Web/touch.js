/* Braise on iPhone: touch buttons for what the keyboard and right mouse button do on a computer.
   Ramasser = Space (gather the nearest thing), Attaquer = F, Atelier = C, Annuler = right click while placing,
   long press on a bag slot = drop it (right click), two-finger pinch = zoom (mouse wheel).
   Uses window.BRAISE_TOUCH, exposed by the game script at build time (build.py). */
(() => {
  'use strict';
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || /[?&]touch=1/.test(location.search);
  if (!touch) return;
  const css = document.createElement('style');
  css.textContent = `
  #tbar{position:fixed;right:calc(14px + env(safe-area-inset-right));bottom:calc(14px + env(safe-area-inset-bottom));z-index:40;display:flex;gap:10px;align-items:flex-end;pointer-events:none}
  #tbar[hidden]{display:none}
  #tbar button{pointer-events:auto;width:60px;height:60px;border-radius:50%;border:2px solid rgba(240,214,160,.75);background:radial-gradient(circle at 40% 35%,rgba(120,64,30,.92),rgba(40,22,12,.92));color:#f6e6c4;font:600 11px/1.1 Georgia,serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 3px 10px rgba(0,0,0,.6);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  #tbar button b{font-size:22px;line-height:1}
  #tbar button:active{transform:scale(.92);filter:brightness(1.25)}
  #tbar #tCancel{background:radial-gradient(circle at 40% 35%,rgba(150,40,30,.95),rgba(60,14,10,.95))}
  #tbar #tCancel[hidden]{display:none}
  #inv .slot{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
  #game canvas{touch-action:none}`;
  document.head.appendChild(css);

  const bar = document.createElement('div'); bar.id = 'tbar'; bar.hidden = true;
  const btn = (id, icon, label, fn) => { const b = document.createElement('button'); b.id = id; b.type = 'button'; b.innerHTML = `<b>${icon}</b>${label}`;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const T = window.BRAISE_TOUCH; if (T) fn(T); }); bar.appendChild(b); return b; };
  btn('tGather', '✋', 'Ramasser', T => T.autoAct());
  btn('tAttack', '⚔', 'Attaquer', T => T.attackNearest());
  btn('tCraft', '🔨', 'Atelier', T => T.toggleCraft());
  const cancel = btn('tCancel', '✕', 'Annuler', T => T.cancel());
  document.body.appendChild(bar);

  // show the buttons only while playing
  (function loop() { const T = window.BRAISE_TOUCH; if (T) { const s = T.state(); bar.hidden = !(s.mode === 'play' && !s.paused && !s.dead); cancel.hidden = !s.placing; }
    const inv = document.getElementById('inv'); if (inv && !bar.hidden) { const r = inv.getBoundingClientRect(); if (r.height) bar.style.bottom = Math.round(innerHeight - r.top + 10) + 'px'; } requestAnimationFrame(loop); })();

  // long press on a bag slot drops it
  let lp = null;
  document.addEventListener('pointerdown', e => { const slot = e.target.closest && e.target.closest('#inv .slot[data-i]'); if (!slot) return;
    const i = +slot.dataset.i; clearTimeout(lp); lp = setTimeout(() => { lp = 'done'; const T = window.BRAISE_TOUCH; if (T) T.dropSlot(i); if (navigator.vibrate) navigator.vibrate(30); }, 550); }, true);
  const stop = () => { if (lp !== 'done') clearTimeout(lp); };
  document.addEventListener('pointerup', stop, true); document.addEventListener('pointercancel', stop, true); document.addEventListener('pointermove', e => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) stop(); }, true);
  // the click that follows a long press must not also use the item
  document.addEventListener('click', e => { if (lp === 'done' && e.target.closest && e.target.closest('#inv .slot')) { e.stopPropagation(); e.preventDefault(); lp = null; } }, true);
  document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('#inv .slot')) e.preventDefault(); }, true);

  // pinch to zoom the world
  let pinch = 0;
  document.addEventListener('touchmove', e => { if (e.touches.length !== 2) { pinch = 0; return; } e.preventDefault();
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    if (pinch) { const T = window.BRAISE_TOUCH; if (T) T.zoom(d / pinch); } pinch = d; }, { passive: false });
  document.addEventListener('touchend', () => { pinch = 0; });
})();
