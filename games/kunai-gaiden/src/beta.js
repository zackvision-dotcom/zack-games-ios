// BETA IA — a simulated player inside the game, for tests and in-game video capture (spec: ZVisionAI/partage/spec-mode-beta-ia.md).
// Shared by every game: copy this file into <game>/src/beta.js, load it BEFORE the game scripts, and register the game's
// scenes after them with BETA.game({...}) (see <game>/src/beta-game.js).
// Turned on only by the address (?beta=ia) and never inside the iOS app (the native store handler is present there).
(() => {
  const Q = new URLSearchParams(location.search);
  const NATIVE = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.store);
  const ON = !NATIVE && Q.get('beta') === 'ia';
  const num = (k, d) => { const v = parseFloat(Q.get(k)); return isFinite(v) ? v : d; };
  const opts = {
    scene: Q.get('scene') || 'boucle', style: Q.get('style') || 'pro', seed: num('seed', 0), save: Q.get('save') || 'neuf',
    vitesse: num('vitesse', 1), doigt: Q.get('doigt') !== '0', ui: Q.get('ui') || 'normal', duree: num('duree', 0),
    format: Q.get('format') || '', log: Q.get('log') === '1', auto: Q.get('auto') !== '0',
  };

  // ---- seeded randomness: same seed, same game (needed to redo a take) ----
  let rnd = Math.random;
  function seedRandom(seed) {
    let a = (seed >>> 0) || 1;
    rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    Math.random = rnd;
  }

  // ---- game clock ----
  // Normal mode: time runs ×1 to ×20 (performance.now, Date.now, requestAnimationFrame stamps and timers all follow).
  // Capture mode (?capture=1, used by tools/beta-record.mjs): time stands still and only moves with BETA.step(ms),
  // timers and animation frames included, so a slow PC still gives a perfect 30 frames per second video.
  let scale = 1;
  const CAPTURE = Q.get('capture') === '1';
  const realPerf = performance.now.bind(performance), realDate = Date.now, realRaf = requestAnimationFrame.bind(window), realCaf = cancelAnimationFrame.bind(window);
  const realSetTimeout = setTimeout.bind(window), realSetInterval = setInterval.bind(window), realClearTimeout = clearTimeout.bind(window), realClearInterval = clearInterval.bind(window);
  let pBase = realPerf(), pV = pBase, dV = realDate();
  const vPerf = () => CAPTURE ? pV : pV + (realPerf() - pBase) * scale;
  function setSpeed(s) { if (CAPTURE) { scale = Math.max(0.1, s); return; } const now = realPerf(); pV = pV + (now - pBase) * scale; dV = dV + (now - pBase) * scale; pBase = now; scale = Math.max(0.1, s); }
  let vAcc = 0;   // capture mode: milliseconds of video stepped so far
  const videoNow = () => CAPTURE ? vAcc : realPerf();
  // capture-mode scheduler
  let tid = 1e6; const timers = new Map(); let rafs = [];
  function installClock() {
    performance.now = vPerf;
    Date.now = () => Math.round(dV0 + (vPerf() - pV0));
    if (!CAPTURE) {
      window.requestAnimationFrame = cb => realRaf(() => cb(vPerf()));
      window.setTimeout = (f, ms, ...a) => realSetTimeout(f, (ms || 0) / scale, ...a);
      window.setInterval = (f, ms, ...a) => realSetInterval(f, (ms || 0) / scale, ...a);
      return;
    }
    window.requestAnimationFrame = cb => { const id = ++tid; rafs.push([id, cb]); return id; };
    window.cancelAnimationFrame = id => { rafs = rafs.filter(r => r[0] !== id); };
    window.setTimeout = (f, ms, ...a) => { const id = ++tid; timers.set(id, { at: pV + Math.max(0, ms || 0), f, a, every: 0 }); return id; };
    window.setInterval = (f, ms, ...a) => { const id = ++tid; const every = Math.max(1, ms || 0); timers.set(id, { at: pV + every, f, a, every }); return id; };
    window.clearTimeout = window.clearInterval = id => { timers.delete(id); };
  }
  const pV0 = pV, dV0 = dV;
  // Moves the game clock by ms (game time = ms × speed), runs due timers in order, then one animation frame, then lets the page paint.
  async function step(ms) {
    vAcc += ms; const target = pV + ms * scale;
    // timers due now; one set from inside a callback waits for the next step (like a new browser task), so long jobs can slice themselves
    const due = [...timers].filter(([, t]) => t.at <= target).sort((x, y) => x[1].at - y[1].at);
    for (const [id, t] of due) {
      if (timers.get(id) !== t) continue; pV = Math.max(pV, t.at);
      if (t.every) { t.at += t.every; if (t.at <= target) t.at = target + 1e-3; } else timers.delete(id);
      try { typeof t.f === 'function' ? t.f(...t.a) : null; } catch (e) { B.errors.push(String(e)); }
      await Promise.resolve();
    }
    pV = target;
    const q = rafs; rafs = []; for (const [, cb] of q) { try { cb(pV); } catch (e) { B.errors.push(String(e)); } }
    for (const an of document.getAnimations ? document.getAnimations() : []) { try { if (an.playState === 'running') an.pause(); if (an.__bt == null) an.__bt = 0; an.__bt += ms * scale; an.currentTime = an.__bt; } catch (e) {} }
    await new Promise(r => realRaf(() => realRaf(r)));   // two real frames: the canvas and the DOM are painted
  }

  // ---- journal ----
  const t0 = () => (videoNow() - B.startedAt) / 1000;   // seconds of VIDEO since the scene started (what the editor cuts on), whatever the game speed
  const B = {
    on: ON, opts, log: [], marqueurs: [], sons: [], errors: [], running: false, startedAt: 0, scene: null, fps: 0, rnd: () => rnd(),
    ev(type, data) { const e = { t: +t0().toFixed(2), type, ...(data || {}) }; B.log.push(e); if (opts.log) console.log('[BETA]', JSON.stringify(e)); return e; },
    mark(label) { const m = { t: +t0().toFixed(2), label }; B.marqueurs.push(m); B.ev('moment', { label }); return m; },
    state() { return { on: ON, running: B.running, ready: !!B.ready, scene: B.scene, t: +t0().toFixed(2), fps: B.fps, actions: B.log.filter(e => e.type === 'action').length, errors: B.errors.length, marqueurs: B.marqueurs, stuck: B.stuck || false }; },
  };
  window.BETA = B;
  if (!ON) { B.start = B.stop = () => {}; B.game = () => {}; return; }

  // synthetic touches have no real pointer behind them: capturing one must not throw inside the game's handler
  for (const m of ['setPointerCapture', 'releasePointerCapture']) { const f = Element.prototype[m]; Element.prototype[m] = function (id) { try { return f.call(this, id); } catch (e) {} }; }
  if (opts.seed) seedRandom(opts.seed);
  installClock(); setSpeed(opts.vitesse);
  // ---- sound in capture mode (?capture=1&audio=N seconds): every AudioContext the game creates is one OfflineAudioContext whose clock
  // is the video clock, so each note and sound lands at its exact video time; BETA.renderAudio() then gives the soundtrack as a WAV ----
  const AUDIO_LEN = CAPTURE ? num('audio', 0) : 0;
  // The buffer only covers the clip itself (not the preparation, which can last minutes of game time): the audio clock stays at 0
  // until the recording starts, then runs from LEAD seconds. Whatever the preparation played is stacked before LEAD and muted by
  // a master gain, so the render is short (rendering 150 s of unused preparation made 30 s clips time out).
  let offCtx = null, audioOrigin = null;
  const LEAD = 1;
  if (AUDIO_LEN > 0 && window.OfflineAudioContext) {
    const RATE = 48000;   // the App Store previews are 48 kHz
    offCtx = new OfflineAudioContext(1, Math.ceil((AUDIO_LEN + LEAD) * RATE), RATE);   // mono keeps memory low on an 8 GB PC
    const realDest = offCtx.destination, master = offCtx.createGain();
    master.gain.setValueAtTime(0, 0); master.gain.setValueAtTime(1, LEAD); master.connect(realDest);
    Object.defineProperty(offCtx, 'destination', { get: () => master });
    Object.defineProperty(offCtx, 'currentTime', { get: () => {
      if (audioOrigin == null) { if (!B.ready) return 0; audioOrigin = B.startedAt; }
      return LEAD + Math.max(0, videoNow() - audioOrigin) / 1000; } });
    Object.defineProperty(offCtx, 'state', { get: () => 'running' });
    offCtx.resume = () => Promise.resolve(); offCtx.suspend = () => Promise.resolve(); offCtx.close = () => Promise.resolve();
    offCtx.outputLatency = 0; offCtx.baseLatency = 0;
    // a source started or stopped "now" (no time, or a time already past on the video clock) would play from the very start of the
    // offline buffer: the game's sound would sit at full level under the whole clip. Clamp those times to the video clock.
    for (const P of [AudioScheduledSourceNode.prototype, AudioBufferSourceNode.prototype]) {
      if (!Object.prototype.hasOwnProperty.call(P, 'start')) continue; const st = P.start, sp = P.stop;
      P.start = function (when, ...a) { if (this.context === offCtx) { const now = offCtx.currentTime; if (!(when > now)) when = now; } return st.call(this, when, ...a); };
      if (Object.prototype.hasOwnProperty.call(P, 'stop')) P.stop = function (when) { if (this.context === offCtx) { const now = offCtx.currentTime; if (!(when > now)) when = now; } return sp.call(this, when); };
    }
    const Fake = function () { return offCtx; };
    window.AudioContext = Fake; window.webkitAudioContext = Fake;
  }
  // renders the soundtrack and returns `dur` seconds from the start of the recording, as a 16-bit stereo WAV in base64
  B.renderAudio = async (from, dur) => {
    if (!offCtx) return '';
    const buf = await offCtx.startRendering(), r = buf.sampleRate, a = Math.floor(LEAD * r), n = Math.min(buf.length - a, Math.floor(dur * r));
    const L = buf.getChannelData(0), R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L, out = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, str) => { for (let i = 0; i < str.length; i++) out.setUint8(o + i, str.charCodeAt(i)); };
    w(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
    out.setUint32(24, r, true); out.setUint32(28, r * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[a + i])) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[a + i])) * 32767, true); }
    const bytes = new Uint8Array(out.buffer); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  addEventListener('error', e => { B.errors.push(String(e.message)); B.ev('erreur', { msg: String(e.message) }); });
  addEventListener('unhandledrejection', e => { B.errors.push(String(e.reason)); B.ev('erreur', { msg: String(e.reason) }); });
  // FPS (real frames per real second)
  (() => { let n = 0, last = realPerf(); const f = () => { n++; const now = realPerf(); if (now - last >= 1000) { B.fps = Math.round(n * 1000 / (now - last)); n = 0; last = now; } realRaf(f); }; realRaf(f); })();

  // ---- the finger and the real gestures ----
  const css = `#beta-finger{position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;pointer-events:none;z-index:2147483646;
    background:radial-gradient(circle,rgba(255,255,255,.95) 0 30%,rgba(255,255,255,.55) 31% 60%,rgba(255,255,255,0) 61%);box-shadow:0 2px 10px rgba(0,0,0,.35);transition:transform .08s, opacity .2s;opacity:0}
    #beta-finger.down{transform:scale(.78)}#beta-finger.on{opacity:1}
    .beta-ring{position:fixed;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid rgba(255,255,255,.9);pointer-events:none;z-index:2147483645;animation:betaRing .45s ease-out forwards}
    @keyframes betaRing{to{transform:scale(3.2);opacity:0}}
    #beta-end{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:rgba(10,10,20,.82);color:#fff;font:900 28px system-ui;text-align:center;animation:betaFade .5s}
    #beta-end img{max-width:72%;max-height:40%}@keyframes betaFade{from{opacity:0}}
    body.beta-propre .beta-hide{display:none!important}`;
  let finger = null, fx = innerWidth / 2, fy = innerHeight * 0.75;
  function ensureUI() {
    if (finger || !document.body) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    finger = document.createElement('div'); finger.id = 'beta-finger'; document.body.appendChild(finger);
    if (opts.ui === 'propre') document.body.classList.add('beta-propre');
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));           // game-time ms (follows the speed)
  const realWait = ms => new Promise(r => setTimeout(r, ms * scale));   // gesture timing (a finger moves at human speed whatever the game speed)
  const frame = () => new Promise(r => requestAnimationFrame(r));
  const jitter = (a, b) => a + (b - a) * rnd();
  const pace = () => opts.style === 'rapide' ? [250, 550] : opts.style === 'debutant' ? [900, 2200] : [600, 1400];
  function place(x, y) { fx = x; fy = y; if (finger) finger.style.transform = '', finger.style.left = x + 'px', finger.style.top = y + 'px'; }
  async function moveTo(x, y) {
    ensureUI(); if (finger && opts.doigt) finger.classList.add('on');
    const sx = fx, sy = fy, d = Math.hypot(x - sx, y - sy), dur = Math.min(350, 150 + d * 0.5) * scale, t = performance.now();
    const cx = (sx + x) / 2 + (sy - y) * 0.18, cy = (sy + y) / 2 + (x - sx) * 0.18;   // gentle curve
    while (true) { const k = Math.min(1, (performance.now() - t) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const px = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * x, py = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * y; place(px, py);
      if (k >= 1) break; await frame(); }
  }
  function fire(type, x, y, target) {
    const el = target || document.elementFromPoint(x, y) || document.body;
    const common = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: type.endsWith('down') || type.endsWith('move') ? 1 : 0, view: window };
    if (type.startsWith('pointer')) el.dispatchEvent(new PointerEvent(type, { ...common, pointerId: 7, pointerType: 'touch', isPrimary: true }));
    else el.dispatchEvent(new MouseEvent(type, common));
    return el;
  }
  function ring(x, y) { if (!opts.doigt || !document.body) return; const r = document.createElement('div'); r.className = 'beta-ring'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 500 * scale); }
  // A tap where a finger would land: pointer + mouse events, then a click on the element under it.
  async function tap(x, y, label) {
    if (!B.running) return; await moveTo(x, y); await realWait(jitter(40, 110));
    if (finger) finger.classList.add('down'); ring(x, y);
    const el = fire('pointerdown', x, y); fire('mousedown', x, y, el); await realWait(jitter(50, 90));
    fire('pointerup', x, y, el); fire('mouseup', x, y, el); el.click && el.click();
    if (finger) finger.classList.remove('down');
    B.ev('action', { action: 'tap', x: Math.round(x), y: Math.round(y), cible: label || describe(el) });
  }
  async function drag(x1, y1, x2, y2, label, ms = 420) {
    if (!B.running) return; await moveTo(x1, y1); await realWait(jitter(60, 120)); if (finger) finger.classList.add('down');
    const el = fire('pointerdown', x1, y1); fire('mousedown', x1, y1, el); const t = performance.now(); let k = 0; ms *= scale;
    while (k < 1) { k = Math.min(1, (performance.now() - t) / ms); const e = 1 - Math.pow(1 - k, 3), x = x1 + (x2 - x1) * e, y = y1 + (y2 - y1) * e; place(x, y); fire('pointermove', x, y, el); fire('mousemove', x, y, el); await frame(); }
    const end = document.elementFromPoint(x2, y2) || el; fire('pointerup', x2, y2, end); fire('mouseup', x2, y2, end); if (finger) finger.classList.remove('down');
    B.ev('action', { action: 'glisser', x: Math.round(x1), y: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2), cible: label || describe(el) });
  }
  const describe = el => el ? (el.dataset && Object.keys(el.dataset).length ? Object.entries(el.dataset).map(([k, v]) => k + '=' + v).join(',') : (el.id || el.tagName.toLowerCase())) : '';
  // Tap a DOM element by selector (its visible centre). Returns false when it is not on screen.
  async function tapEl(sel, label) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) return false;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) { el.scrollIntoView && el.scrollIntoView({ block: 'center' }); await realWait(150); }
    const q = el.getBoundingClientRect(); if (!q.width) return false;
    await tap(q.left + q.width * jitter(0.4, 0.6), q.top + q.height * jitter(0.4, 0.6), label); return true;
  }
  const think = () => wait(jitter(...pace()));   // the pause a person takes between two actions

  // ---- sounds: the game passes its SFX object; every call is logged with its time (the Monteur re-syncs the track) ----
  // only what is on camera (after 'pret'), one entry per sound name every 60 ms, at most 4000 (a time-lapse plays thousands of sounds)
  const lastSon = {};
  function logSon(k) { if (!B.ready || B.sons.length >= 4000) return; const t = t0(); if (lastSon[k] != null && t - lastSon[k] < 0.06) return; lastSon[k] = t; B.sons.push({ t: +t.toFixed(3), son: k }); }
  function wrapSfx(sfx) { if (!sfx) return; for (const k of Object.keys(sfx)) { const f = sfx[k]; if (typeof f !== 'function') continue; sfx[k] = function (...a) { logSon(k); return f.apply(this, a); }; } }

  // ---- stuck detection: no progress for 60 s of game time ----
  function watchStuck(progress) {
    let last = null, since = performance.now();
    const iv = setInterval(() => { if (!B.running) return clearInterval(iv); let p; try { p = JSON.stringify(progress()); } catch (e) { p = 'err'; }
      if (p !== last) { last = p; since = performance.now(); B.stuck = false; }
      else if (performance.now() - since > 60000 && !B.stuck) { B.stuck = true; B.ev('blocage', { etat: p }); } }, 1000);
  }

  // ---- end card ----
  function endCard() {
    if (!G.logo && !G.endText) return;
    const el = document.createElement('div'); el.id = 'beta-end';
    el.innerHTML = (G.logo ? `<img src="${G.logo()}" alt="">` : '') + `<div>${G.endText ? G.endText() : 'Joue gratuitement'}</div>`;
    document.body.appendChild(el); if (finger) finger.classList.remove('on');
  }

  // ---- scenes ----
  let G = {};
  const api = { tap, drag, tapEl, wait, think, realWait, mark: B.mark, ev: B.ev, rnd: () => rnd(), jitter, opts, running: () => B.running, speed: setSpeed };
  B.game = def => { G = def || {}; wrapSfx(G.sfx); if (opts.auto) { const go = () => setTimeout(() => B.start(), 300); document.readyState === 'complete' ? go() : addEventListener('load', go); } };
  B.start = async (o = {}) => {
    Object.assign(opts, o); if (o.vitesse) setSpeed(o.vitesse); if (o.seed) seedRandom(o.seed);
    ensureUI(); if (B.running) return; const fn = G.scenes && G.scenes[opts.scene];
    if (!fn) { B.ev('erreur', { msg: 'scène inconnue : ' + opts.scene }); return; }
    B.running = true; B.ready = false; B.scene = opts.scene; B.log.length = 0; B.marqueurs.length = 0; B.sons.length = 0; B.startedAt = videoNow();
    B.ev('debut', { scene: opts.scene, style: opts.style, seed: opts.seed, save: opts.save, vitesse: opts.vitesse });
    if (G.progress) watchStuck(G.progress);
    const stopAt = opts.duree ? opts.duree * 1000 : 0;   // video time, counted from 'pret'
    if (stopAt) (async () => { while (B.running && !(B.ready && videoNow() - B.startedAt >= stopAt)) await wait(100); if (B.running) { B.stop(); endCard(); } })();
    try { if (G.prepare) await G.prepare(opts.save, api);
      B.startedAt = videoNow(); B.marqueurs.length = 0; B.sons.length = 0; B.ready = true; B.ev('pret');   // recording starts here
      await fn(api); }
    catch (e) { if (B.running) { B.errors.push(String(e)); B.ev('erreur', { msg: String(e && e.message || e) }); } }
    if (B.running && opts.scene !== 'idle') { B.stop(); if (opts.duree) endCard(); }
  };
  B.stop = () => { if (!B.running) return; B.running = false; B.ev('fin', { fps: B.fps, erreurs: B.errors.length }); if (finger) finger.classList.remove('on'); };
  B.api = api; B.step = step; B.capture = CAPTURE;
})();
