/* Braise · touch controls for phones and tablets (the game itself only knows the keyboard and the mouse).
   A joystick on the left drives the arrow keys; the buttons on the right send the same keys as the keyboard
   (Space attack, E talk/pick, Shift dash, F shield, I bag, B build) and the fire button aims where the stick points.
   A tap on the world still attacks there, as with the mouse. Active only on touch screens (or with ?touch). */
(() => {
  const coarse = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || /[?&]touch/.test(location.search);
  if (!coarse) return;
  document.documentElement.classList.add('tch');
  const css = document.createElement('style');
  css.textContent = `
  .tch #keys{display:none!important}
  .tch #hints,.tch .key,.tch #mini .key,.tch #mapBtn small{display:none!important}
  .tch #stats{transform:scale(.62);transform-origin:top left;left:max(8px,env(safe-area-inset-left));top:max(6px,env(safe-area-inset-top))}
  .tch #quests{left:max(8px,env(safe-area-inset-left));top:94px;bottom:auto;width:min(230px,34vw);padding:7px 10px;gap:3px;max-height:34vh;overflow:auto}
  .tch #quests h3{font-size:14px}.tch #quests li{font-size:12px;gap:6px}.tch #quests li::before{width:11px;height:11px}
  .tch #mini{width:104px;height:104px;right:max(10px,env(safe-area-inset-right));top:8px}.tch #mini canvas{width:104px;height:104px;border-width:3px}
  .tch #clock{right:auto;left:50%;transform:translateX(-50%) scale(.72);transform-origin:top center;top:4px;bottom:auto}
  .tch #mapBtn{left:auto;right:max(122px,calc(env(safe-area-inset-right) + 112px));top:10px;bottom:auto;font-size:0;gap:0}.tch #mapBtn .icon{width:44px;height:44px}.tch #mapBtn .icon canvas{width:30px;height:27px}
  .tch #hotbar{bottom:max(6px,env(safe-area-inset-bottom));padding:4px;gap:4px}.tch #hotbar .slot{--s:36px}.tch #hotbar .slot .k{display:none}.tch #hotbar .slot .n{font-size:12px}
  .tch #dialog{bottom:max(56px,env(safe-area-inset-bottom));grid-template-columns:64px 1fr;padding:10px 12px}.tch #dialog canvas{width:64px;height:64px}.tch #dialog b{font-size:17px}.tch #dialog p{font-size:14px;margin:2px 0 6px}
  .tch #boss{top:60px}
  #tj{position:fixed;left:0;bottom:0;width:42vw;height:62vh;z-index:6;touch-action:none}
  #tj .base{position:absolute;width:118px;height:118px;margin:-59px 0 0 -59px;border-radius:50%;background:radial-gradient(circle,rgba(28,18,10,.25),rgba(28,18,10,.55));box-shadow:inset 0 0 0 2px rgba(255,226,170,.35);display:none}
  #tj .nub{position:absolute;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffe2a0,#c8902a);box-shadow:0 2px 8px rgba(0,0,0,.5);display:none}
  #tj.on .base,#tj.on .nub{display:block}
  #tj .ghost{position:absolute;left:max(70px,calc(env(safe-area-inset-left) + 60px));bottom:max(62px,calc(env(safe-area-inset-bottom) + 52px));width:96px;height:96px;margin:0 0 -48px -48px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,226,170,.22);pointer-events:none}
  #tj.on .ghost{display:none}
  #tb{position:fixed;right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));width:204px;height:176px;z-index:7;pointer-events:none}
  #tb button{position:absolute;pointer-events:auto;border-radius:50%;border:2px solid rgba(42,23,12,.9);color:#2a170c;font:800 12px 'Baloo 2','Trebuchet MS',sans-serif;line-height:1;display:grid;place-items:center;box-shadow:0 3px 0 rgba(42,23,12,.8),0 6px 14px rgba(0,0,0,.35);touch-action:none;-webkit-tap-highlight-color:transparent;padding:0}
  #tb button:active,#tb button.dn{transform:translateY(2px);box-shadow:0 1px 0 rgba(42,23,12,.8)}
  #tb .atk{right:0;bottom:0;width:78px;height:78px;background:radial-gradient(circle at 40% 30%,#ffd77a,#f2a83a);font-size:28px}
  #tb .use{right:86px;bottom:2px;width:56px;height:56px;background:radial-gradient(circle at 40% 30%,#fff4dc,#e6d2ac);font-size:13px}
  #tb .fire{right:4px;bottom:88px;width:52px;height:52px;background:radial-gradient(circle at 40% 30%,#ffc06a,#ff6a2a);font-size:22px}
  #tb .dash{right:62px;bottom:66px;width:48px;height:48px;background:radial-gradient(circle at 40% 30%,#bfe8ff,#4aa8e6);font-size:20px}
  #tb .shield{right:118px;bottom:66px;width:44px;height:44px;background:radial-gradient(circle at 40% 30%,#e8d8ff,#a07ae0);font-size:19px}
  #tm{position:fixed;right:max(10px,env(safe-area-inset-right));top:122px;z-index:7;display:flex;flex-direction:column;gap:6px}
  #tm button{width:44px;height:44px;border-radius:12px;border:1.5px solid rgba(255,226,170,.25);background:rgba(28,18,10,.74);color:#fff4dc;font:800 18px system-ui;display:grid;place-items:center;-webkit-tap-highlight-color:transparent}
  .tch.noplay #tj,.tch.noplay #tb,.tch.noplay #tm{display:none}`;
  document.head.appendChild(css);

  const key = (code, k, down) => dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: k, bubbles: true }));
  const tapKey = (code, k) => { key(code, k, true); setTimeout(() => key(code, k, false), 70); };
  const el = (tag, attrs, parent) => { const e = document.createElement(tag); Object.assign(e, attrs); (parent || document.body).appendChild(e); return e; };

  // ---- the joystick: appears where the thumb lands, drives the arrows ----
  const tj = el('div', { id: 'tj', innerHTML: '<div class="ghost"></div><div class="base"></div><div class="nub"></div>' });
  const base = tj.querySelector('.base'), nub = tj.querySelector('.nub'); let jid = null, ox = 0, oy = 0, dir = [1, 0];
  const held = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
  const press = (code, on) => { if (held[code] === on) return; held[code] = on; key(code, code, on); };
  const steer = (dx, dy) => { const l = Math.hypot(dx, dy), dead = 14;
    if (l < dead) { for (const c in held) press(c, false); return; } const nx = dx / l, ny = dy / l; dir = [nx, ny];
    press('ArrowRight', nx > .38); press('ArrowLeft', nx < -.38); press('ArrowDown', ny > .38); press('ArrowUp', ny < -.38); };
  tj.addEventListener('pointerdown', e => { e.preventDefault(); jid = e.pointerId; tj.setPointerCapture(jid); ox = e.clientX; oy = e.clientY; tj.classList.add('on'); base.style.left = nub.style.left = ox + 'px'; base.style.top = nub.style.top = oy + 'px'; });
  tj.addEventListener('pointermove', e => { if (e.pointerId !== jid) return; let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx *= m / l; dy *= m / l; } nub.style.left = ox + dx + 'px'; nub.style.top = oy + dy + 'px'; steer(dx, dy); });
  const release = e => { if (e.pointerId !== jid) return; jid = null; tj.classList.remove('on'); steer(0, 0); };
  tj.addEventListener('pointerup', release); tj.addEventListener('pointercancel', release);

  // ---- action buttons ----
  const tb = el('div', { id: 'tb' }), btn = (cls, label, aria, down, up) => { const b = el('button', { className: cls, type: 'button', innerHTML: label }, tb); b.setAttribute('aria-label', aria);
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); b.classList.add('dn'); down(); }); const end = e => { b.classList.remove('dn'); if (up) up(); }; b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('pointerleave', end); return b; };
  btn('atk', '⚔', 'Attaquer', () => tapKey('Space', ' '));
  btn('use', 'Agir', 'Parler, ramasser, entrer', () => tapKey('KeyE', 'e'));
  btn('dash', '💨', 'Sprint', () => tapKey('ShiftLeft', 'Shift'));
  btn('shield', '🛡', 'Bouclier', () => tapKey('KeyF', 'f'));
  // fire: a right click where the stick points (the game aims the fireball at the cursor)
  btn('fire', '🔥', 'Boule de feu', () => { const cv = document.getElementById('view'); if (!cv) return; const x = innerWidth / 2 + dir[0] * 220, y = innerHeight / 2 - 50 + dir[1] * 220;
    cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, button: 2, buttons: 2, pointerType: 'touch', bubbles: true })); });
  const tm = el('div', { id: 'tm' }); for (const [lab, code, k, aria] of [['🎒', 'KeyI', 'i', 'Sac'], ['🔨', 'KeyB', 'b', 'Construire']]) { const b = el('button', { type: 'button', textContent: lab }, tm); b.setAttribute('aria-label', aria); b.addEventListener('click', e => { e.stopPropagation(); tapKey(code, k); }); }

  // controls only while playing (not on the title screen, not behind a sheet)
  setInterval(() => { const title = document.getElementById('title'), hud = document.getElementById('hud'), sheet = document.querySelector('.sheet:not([hidden])');
    document.documentElement.classList.toggle('noplay', !!((title && !title.hidden) || (hud && hud.hidden) || sheet)); if (document.documentElement.classList.contains('noplay')) steer(0, 0); }, 250);
})();
