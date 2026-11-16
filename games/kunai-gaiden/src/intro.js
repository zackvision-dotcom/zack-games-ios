/* Kunai Online — "La Nuit des Lanternes Noires", the playable cinematic intro.
   1 · the sea of whirlpools (its own renderer): Sayo runs on the water with the baby, dodges the Black Lanterns, Yomi, the six mudras, the boat
   2 · the brush title
   3 · the reflection (character creator) and Grand-mère Tsuru's house
   4 · the lantern festival, the offering, the lanterns turning black
   5 · the rooftop chase after Kurogane, slow motion over the burning street, the duel
   6 · the sixth seal awakens, Yomi on the cliff, waking up at the hospital
   Hold Escape to skip. */
window.KINTRO = (() => {
  const TAU = Math.PI * 2, SKIP = { skip: 1 };
  Object.assign(LOOKS, {
    sayo: { coat: '#2f4a6a', hair: '#c8322a', eyes: '#3fae5a', hairStyle: 'long', coatLen: 1, pants: '#2a2a3a', headband: '#3a4a6a', skin: '#fde6d4' },
    yomi: { coat: '#141018', hair: '#141018', eyes: '#c8322f', mask: '#f2ede0', hood: '#141018', coatLen: 1, pants: '#0c0a10', belt: '#3a1f2a' },
    masked: { coat: '#2a2430', hair: '#1a1620', eyes: '#8a3a3a', mask: '#d8d2c4', coatLen: .5, pants: '#1c1820', hairStyle: 'spiky' },
    tsuru: { coat: '#6a4a7a', hair: '#d8d4cc', eyes: '#5a4a3a', hairStyle: 'long', coatLen: 1, pants: '#4a3a4a', skin: '#f0d2b8', belt: '#c9a050' } });
  let grab = false, active = false, skipping = false, creatorDone = false, finalized = false, escT = 0;
  const keys = {}; let pressed = {};
  addEventListener('keydown', e => { if (!active) return; const k = e.key.toLowerCase(); if (!keys[k]) pressed[k] = 1; keys[k] = 1; if (k === 'escape') e.preventDefault(); });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = 0; });
  const LOG = window.__kilog = []; const log = m => LOG.push((performance.now() / 1000).toFixed(1) + ' ' + m);
  const take = k => { const v = pressed[k]; pressed[k] = 0; return v; };

  /* ---------- overlay DOM: canvas, letterbox, subtitles, prompts, skip ---------- */
  let tbEl = null, root, cv, g, top, bot, subEl, prEl, skEl, cardEl, W = 0, H = 0, DPR = 1;
  function dom() { if (root) return; root = document.createElement('div'); root.id = 'ki'; root.innerHTML = `
    <style>#ki{position:fixed;inset:0;z-index:15;pointer-events:none;font-family:'M PLUS Rounded 1c',sans-serif}#ki canvas{position:absolute;inset:0;width:100%;height:100%;display:block;background:#000}
    #ki .lb{position:absolute;left:0;right:0;height:0;background:#000;transition:height .8s ease}#ki .lb.t{top:0}#ki .lb.b{bottom:0}
    #ki .sub{position:absolute;left:50%;bottom:9%;transform:translateX(-50%);max-width:min(760px,90vw);text-align:center;color:#f6efdc;font:700 clamp(15px,2.2vw,20px)/1.5 'M PLUS Rounded 1c',sans-serif;text-shadow:0 2px 4px #000,0 0 12px #000;opacity:0;transition:opacity .35s}
    #ki .sub b{display:block;font:400 clamp(13px,1.8vw,16px) 'Potta One',sans-serif;color:#e3b04a;letter-spacing:.06em;margin-bottom:2px}
    #ki .pr{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);display:none;text-align:center;color:#fff4dc;text-shadow:0 2px 6px #000}
    #ki .pr .key{display:inline-grid;place-items:center;min-width:64px;height:64px;padding:0 14px;border-radius:12px;background:#f7f1de;color:#2a2230;border:3px solid #2a2230;box-shadow:0 5px 0 #2a2230,0 0 0 4px #e3b04a;font:400 30px 'Potta One',sans-serif}
    #ki .pr .lab{display:block;margin-top:12px;font:800 16px 'M PLUS Rounded 1c',sans-serif}
    #ki .pr .big{display:block;font:400 clamp(70px,14vw,140px)/1 'Potta One',serif;color:#f6efdc;margin-bottom:8px;text-shadow:0 0 24px rgba(255,220,140,.8)}
    #ki .pr .key{pointer-events:auto;cursor:pointer;touch-action:none}#ki .tb{position:absolute;right:22px;bottom:110px;width:78px;height:78px;border-radius:50%;pointer-events:auto;touch-action:none;display:none;place-items:center;background:radial-gradient(circle at 35% 30%,#f6e6c0,#c99a4a);border:2.5px solid #2a2230;box-shadow:0 4px 0 #2a2230;color:#7a2a18;font:400 26px 'Potta One',serif}
    #ki .skb{position:absolute;right:14px;top:12px;pointer-events:auto;touch-action:none;padding:8px 14px;border-radius:999px;border:2px solid rgba(246,239,220,.6);background:rgba(0,0,0,.45);color:#f6efdc;font:800 13px 'M PLUS Rounded 1c',sans-serif}
    #ki .sk{position:absolute;right:18px;top:16px;color:rgba(246,239,220,.7);font:700 12px 'M PLUS Rounded 1c',sans-serif;text-shadow:0 1px 3px #000}
    #ki .card{position:absolute;inset:0;display:grid;place-items:center;background:#000;opacity:0;transition:opacity .9s;color:#f6efdc;font:400 clamp(26px,5vw,44px) 'Potta One',sans-serif;text-align:center}
    #ki .card small{display:block;font:700 15px 'M PLUS Rounded 1c',sans-serif;color:#b5aa9a;margin-top:10px}</style>
    <canvas></canvas><div class="lb t"></div><div class="lb b"></div><div class="sub"></div><div class="pr"></div><div class="card"></div><div class="sk">Maintenir Échap pour passer l’introduction</div><button class="skb" hidden>Maintenir pour passer ⏭</button><button class="tb">替</button>`;
    document.body.appendChild(root); cv = root.querySelector('canvas'); g = cv.getContext('2d'); top = root.querySelector('.lb.t'); bot = root.querySelector('.lb.b'); subEl = root.querySelector('.sub'); prEl = root.querySelector('.pr'); tbEl = root.querySelector('.tb');
    const skb = root.querySelector('.skb'); if ((window.KTOUCH && KTOUCH.enabled)) { skb.hidden = false; root.querySelector('.sk').style.display = 'none'; const dn = e => { e.preventDefault(); keys.escape = 1; }, up = () => { keys.escape = 0; }; skb.addEventListener('pointerdown', dn); skb.addEventListener('pointerup', up); skb.addEventListener('pointercancel', up); skb.addEventListener('pointerleave', up); }
    const tdn = e => { e.preventDefault(); keys.i = 1; pressed.i = 1; }, tup = () => { keys.i = 0; }; tbEl.addEventListener('pointerdown', tdn); tbEl.addEventListener('pointerup', tup); tbEl.addEventListener('pointercancel', tup); skEl = root.querySelector('.sk'); cardEl = root.querySelector('.card');
    const rs = () => { DPR = Math.min((window.KTOUCH && KTOUCH.enabled) ? 1.25 : 2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; }; addEventListener('resize', rs); rs(); }
  const letterbox = on => { top.style.height = bot.style.height = on ? '11vh' : '0'; };
  const canvasOn = on => { cv.style.display = on ? 'block' : 'none'; };

  // animation loop that keeps running when the tab is in the background (rAF + timer fallback, one tick per frame)
  function anim(fn) { let tok = 0, alive = true; const go = () => { const k = ++tok; requestAnimationFrame(n => { if (k === tok && alive) { fn(performance.now()); go(); } }); setTimeout(() => { if (k === tok && alive) { fn(performance.now()); go(); } }, 50); }; go(); return () => { alive = false; }; }
  /* ---------- timing helpers (all abort when the player skips) ---------- */
  const chk = () => { if (skipping) throw SKIP; };
  const wait = ms => new Promise((res, rej) => { const t0 = performance.now(); const tick = () => { if (skipping) return rej(SKIP); if (performance.now() - t0 >= ms) return res(); setTimeout(tick, 30); }; tick(); });
  const until = (cond, step) => new Promise((res, rej) => { const tick = () => { if (skipping) return rej(SKIP); try { if (step) step(); if (cond()) return res(); } catch (e) { return rej(e); } setTimeout(tick, 30); }; tick(); });
  async function sub(name, text, ms) { chk(); subEl.innerHTML = (name ? '<b>' + name + '</b>' : '') + text; subEl.style.opacity = 1; await wait(ms || Math.max(2200, text.length * 55)); subEl.style.opacity = 0; await wait(300); }
  function prompt(key, label, big) { prEl.innerHTML = (big ? '<span class="big">' + big + '</span>' : '') + (key ? '<span class="key">' + key + '</span>' : '') + (label ? '<span class="lab">' + label + '</span>' : ''); prEl.style.display = 'block';
    const kEl = prEl.querySelector('.key'); if (kEl && key && key.length === 1) { const k = key.toLowerCase(), dn = e => { e.preventDefault(); keys[k] = 1; pressed[k] = 1; }, up = () => { keys[k] = 0; }; kEl.addEventListener('pointerdown', dn); kEl.addEventListener('pointerup', up); kEl.addEventListener('pointercancel', up); kEl.addEventListener('pointerleave', up); } }
  const unprompt = () => { prEl.style.display = 'none'; };
  async function card(text, small, ms) { cardEl.innerHTML = text + (small ? '<small>' + small + '</small>' : ''); cardEl.style.opacity = 1; await wait(ms || 2600); cardEl.style.opacity = 0; await wait(900); }
  const fadeBlack = async (on, ms) => { cardEl.innerHTML = ''; cardEl.style.transition = 'opacity ' + (ms || 900) + 'ms'; cardEl.style.opacity = on ? 1 : 0; await wait(ms || 900); cardEl.style.transition = 'opacity .9s'; };

  // skipping: hold Escape for a second
  setInterval(() => { if (!active) return; if (keys.escape) { escT += 50; skEl.style.color = '#e3b04a'; skEl.textContent = 'Passer… ' + Math.min(100, Math.round(escT / 10)) + ' %'; if (escT > 1000 && !skipping) skipping = true; } else { escT = 0; skEl.style.color = ''; skEl.textContent = 'Maintenir Échap pour passer l’introduction'; } }, 50);

  /* ================= 1 · the sea of whirlpools (own renderer) ================= */
  const bank = {};
  function frames(look, anim, yaw, px) { const k = look + anim + yaw + px; if (!bank[k]) bank[k] = HERO.bake(anim, { idle: 8, run: 12, ninjarun: 12, seal: 8, cast: 8, hurt: 6, attack: 10 }[anim] || 8, px, yaw, { look: LOOKS[look] }); return bank[k]; }
  const yawOf = (dx, dy) => ((Math.round(Math.atan2(dx, dy) * 180 / Math.PI / 45) * 45) % 360 + 360) % 360;
  async function seaSequence() { log('seaSequence');
    canvasOn(true); letterbox(true); KAMB.setWeather('storm'); Object.assign(KAMB.weather, { rain: 1, dark: .2, wind: 3, clouds: 1 }); KAMB.score('silence'); KAMB.mix(.9, .6);
    const S = 30, SP = Math.sin(38 * Math.PI / 180), PX = Math.round(92 * S / 41 * DPR);
    const sayo = { x: 0, y: 0, vx: 0, vy: 0, yaw: 180, t: 0, slow: 0, hurt: 0, subCD: 0 }, cam = { x: 0, y: -4 }, rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(5);
    const pool = []; for (let i = 0; i < 14; i++) pool.push({ x: (rnd() - .5) * 26, y: -14 - i * 8 - rnd() * 4, r: 2 + rnd() * 2.2, sp: (rnd() < .5 ? 1 : -1) * (1.2 + rnd()) });
    const rocks = []; for (let i = 0; i < 22; i++) rocks.push({ x: (rnd() - .5) * 50, y: -rnd() * 125, r: .6 + rnd() * 1.4 }); const ROCK = { x: 0, y: -132, r: 6 };
    const foes = []; for (let i = 0; i < 7; i++) foes.push({ x: (i - 3) * 2.6, y: 16 + rnd() * 4, t: rnd() * 5, cd: 1.5 + rnd() * 2, off: (i - 3) * 2.6 });
    const kunai = [], smoke = [], ripples = []; let t = 0, flash = 0, nextBolt = 3, mode = 'run', tutDone = false, tutKunai = null, ts = 1, slowT = 0, boat = null, spiral = 0, yomi = null, white = 0;
    const P = (x, y, z) => [W * DPR / 2 + (x - cam.x) * S * DPR, H * DPR / 2 + ((y - cam.y) * SP - (z || 0) * .79) * S * DPR];
    function drawChar(look, anim, yaw, x, y, z, tt, alpha) { const set = frames(look, anim, yaw, PX), f = set[Math.floor((tt / (anim === 'ninjarun' ? .42 : 1.6)) % 1 * set.length) % set.length], p = P(x, y, z); g.globalAlpha = alpha ?? 1; g.shadowColor = 'rgba(200,225,255,.6)'; g.shadowBlur = 9 * DPR; g.drawImage(f, p[0] - set.ax, p[1] - set.ay); g.shadowBlur = 0; g.globalAlpha = 1; return p; }
    function lanternAt(x, y, t2) { const p = P(x, y, 1.6); const gr = g.createRadialGradient(p[0], p[1], 2, p[0], p[1], 40 * DPR); gr.addColorStop(0, 'rgba(150,70,230,.55)'); gr.addColorStop(1, 'rgba(120,40,200,0)'); g.fillStyle = gr; g.fillRect(p[0] - 40 * DPR, p[1] - 40 * DPR, 80 * DPR, 80 * DPR);
      g.fillStyle = '#120a18'; g.strokeStyle = '#7a3ab0'; g.lineWidth = 1.5 * DPR; g.beginPath(); g.ellipse(p[0], p[1], 6 * DPR, 8 * DPR, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(190,110,255,' + (.6 + .3 * Math.sin(t2 * 13)) + ')'; g.beginPath(); g.ellipse(p[0], p[1] - DPR, 1.8 * DPR, 3.5 * DPR, 0, 0, TAU); g.fill(); }
    function frame(dt) { t += dt; const D = DPR; KAMB.weather.dark = .1;
      // sea
      const gr = g.createLinearGradient(0, 0, 0, H * D); gr.addColorStop(0, '#123456'); gr.addColorStop(1, '#1f5478'); g.fillStyle = gr; g.fillRect(0, 0, W * D, H * D);
      g.save(); const wp = g.createPattern(KGROUND.waveTex, 'repeat'), o = P(0, 0); wp.setTransform(new DOMMatrix().translate(o[0] + t * 20 * D, o[1] + t * 9 * D).scale(.9 * D, .9 * D * SP)); g.globalAlpha = .5; g.fillStyle = wp; g.fillRect(0, 0, W * D, H * D);
      const wp2 = g.createPattern(KGROUND.waveTex, 'repeat'); wp2.setTransform(new DOMMatrix().translate(o[0] - t * 14 * D, o[1] + t * 14 * D).scale(1.4 * D, 1.4 * D * SP)); g.globalAlpha = .35; g.fillStyle = wp2; g.fillRect(0, 0, W * D, H * D); g.restore();
      for (let k = 0; k < 7; k++) { const yy = ((k * 140 + t * 60) % (H * D + 200)) - 100; g.fillStyle = 'rgba(0,10,25,.18)'; g.fillRect(0, yy, W * D, 30 * D); }
      // whirlpools and rocks
      for (const w of pool) { const p = P(w.x, w.y); for (let a = 0; a < 4; a++) { g.strokeStyle = 'rgba(210,235,255,.42)'; g.lineWidth = 2 * D; g.beginPath(); for (let s = 0; s <= 1; s += .05) { const an = t * w.sp * 2 + a * TAU / 4 + s * 5, rr = w.r * (1 - s) * S * D; const x = p[0] + Math.cos(an) * rr, y = p[1] + Math.sin(an) * rr * SP; s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
        g.fillStyle = 'rgba(0,8,20,.55)'; g.beginPath(); g.ellipse(p[0], p[1], w.r * .25 * S * D, w.r * .25 * S * D * SP, 0, 0, TAU); g.fill(); }
      for (const r of rocks.concat([ROCK])) { const p = P(r.x, r.y), R = r.r * S * D; g.fillStyle = 'rgba(230,245,255,.35)'; g.beginPath(); g.ellipse(p[0], p[1] + R * .15, R * 1.15, R * .5, 0, 0, TAU); g.fill(); g.fillStyle = '#2a3036'; g.strokeStyle = '#0c1014'; g.lineWidth = 2 * D; g.beginPath(); g.ellipse(p[0], p[1], R, R * .55, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(160,180,190,.35)'; g.beginPath(); g.ellipse(p[0] - R * .2, p[1] - R * .15, R * .55, R * .22, 0, 0, TAU); g.fill(); }
      for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; r.t += dt; if (r.t > 1.1) { ripples.splice(i, 1); continue; } const p = P(r.x, r.y), u = r.t / 1.1; g.strokeStyle = 'rgba(225,245,255,' + (.6 * (1 - u)) + ')'; g.lineWidth = 1.5 * D; g.beginPath(); g.ellipse(p[0], p[1], (6 + u * 26) * D, (6 + u * 26) * D * SP, 0, 0, TAU); g.stroke(); }
      // telegraphed kunai
      for (const k of kunai) { const p = P(k.tx, k.ty); if (k.t < k.warn) { const a = k.t / k.warn; g.strokeStyle = 'rgba(255,60,40,' + (.35 + a * .5) + ')'; g.lineWidth = 2 * D; g.beginPath(); g.ellipse(p[0], p[1], 14 * D * (1.4 - a * .6), 14 * D * SP * (1.4 - a * .6), 0, 0, TAU); g.stroke(); const q = P(k.x0, k.y0); g.setLineDash([6 * D, 6 * D]); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(p[0], p[1]); g.stroke(); g.setLineDash([]); }
        else { const u = Math.min(1, (k.t - k.warn) / .22), x = k.x0 + (k.tx - k.x0) * u, y = k.y0 + (k.ty - k.y0) * u, q = P(x, y, 1.2); g.save(); g.translate(q[0], q[1]); FX.draw(g, 'kunai', 0, { size: D, angle: Math.atan2((k.ty - k.y0) * SP, k.tx - k.x0) }); g.restore(); } }
      // characters, back to front
      const list = foes.map(f => ({ y: f.y, f })).concat([{ y: sayo.y, s: 1 }]); if (yomi) list.push({ y: yomi.y, yo: 1 }); list.sort((a, b) => a.y - b.y);
      for (const it of list) { if (it.f) { const f = it.f; drawChar('masked', f.stand ? 'idle' : 'ninjarun', f.yaw ?? 0, f.x, f.y, 0, f.t); lanternAt(f.x + .4, f.y, f.t); continue; }
        if (it.yo) { const p = drawChar('yomi', 'idle', 0, yomi.x, yomi.y, 0, t, yomi.a); for (let e = 0; e < 14; e++) { const ph = (t * .6 + e / 14) % 1, ex = p[0] + Math.sin(e * 7.3 + t) * 26 * D, ey = p[1] - ph * 110 * D; g.fillStyle = 'rgba(255,' + (120 + e * 6) + ',40,' + (1 - ph) * yomi.a + ')'; g.fillRect(ex, ey, 2.5 * D, 2.5 * D); } continue; }
        const p = drawChar('sayo', mode === 'run' && Math.hypot(sayo.vx, sayo.vy) > .5 ? 'ninjarun' : 'idle', sayo.yaw, sayo.x, sayo.y, 0, sayo.t);
        if (!boat) { const bx = p[0] + (sayo.yaw === 90 ? 8 : sayo.yaw === 270 ? -8 : 0) * D, by = p[1] - 50 * D; g.fillStyle = '#3d6fb0'; g.strokeStyle = '#1a2a40'; g.lineWidth = 1.5 * D; g.beginPath(); g.ellipse(bx, by, 9 * D, 6 * D, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#fde6d4'; g.beginPath(); g.arc(bx + 2 * D, by - 2 * D, 3 * D, 0, TAU); g.fill();
          if (spiral > 0) { g.save(); g.globalCompositeOperation = 'lighter'; for (let a = 0; a < 3; a++) { g.strokeStyle = 'rgba(255,230,150,' + Math.min(1, spiral) * .9 + ')'; g.lineWidth = 3 * D; g.beginPath(); for (let s = 0; s <= 1; s += .03) { const an = t * 6 + a * TAU / 3 + s * 7, rr = (1 - s) * 70 * D * Math.min(1.4, spiral); s ? g.lineTo(bx + Math.cos(an) * rr, by + Math.sin(an) * rr * .7) : g.moveTo(bx + Math.cos(an) * rr, by + Math.sin(an) * rr * .7); } g.stroke(); } const gl = g.createRadialGradient(bx, by, 2, bx, by, 90 * D * spiral); gl.addColorStop(0, 'rgba(255,240,190,.9)'); gl.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gl; g.fillRect(bx - 100 * D, by - 100 * D, 200 * D, 200 * D); g.restore(); } } }
      for (const s of smoke) { const p = P(s.x, s.y, .8); g.save(); g.translate(p[0], p[1]); FX.draw(g, 'smoke', s.t / .7, { size: 1.1 * D }); g.restore(); if (s.log) { g.fillStyle = 'rgba(138,90,50,' + (1 - s.t / .7) + ')'; g.beginPath(); g.ellipse(p[0], p[1] + 10 * D, 16 * D, 6 * D, 0, 0, TAU); g.fill(); } }
      if (boat) { const p = P(boat.x, boat.y); g.fillStyle = '#7a4e2c'; g.strokeStyle = '#2a1a10'; g.lineWidth = 2 * D; g.beginPath(); g.moveTo(p[0] - 16 * D, p[1]); g.lineTo(p[0] + 16 * D, p[1]); g.lineTo(p[0] + 11 * D, p[1] + 7 * D); g.lineTo(p[0] - 11 * D, p[1] + 7 * D); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#3d6fb0'; g.beginPath(); g.ellipse(p[0] - 3 * D, p[1] - 3 * D, 8 * D, 5 * D, 0, 0, TAU); g.fill(); const gl = g.createRadialGradient(p[0] + 8 * D, p[1] - 14 * D, 1, p[0] + 8 * D, p[1] - 14 * D, 40 * D); gl.addColorStop(0, 'rgba(255,230,160,.8)'); gl.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gl; g.fillRect(p[0] - 32 * D, p[1] - 54 * D, 80 * D, 80 * D);
        g.fillStyle = '#fff2c8'; g.strokeStyle = '#2a2230'; g.beginPath(); g.ellipse(p[0] + 8 * D, p[1] - 14 * D, 4 * D, 6 * D, 0, 0, TAU); g.fill(); g.stroke(); }
      // storm overlay, lightning
      g.save(); KAMB.drawWeather(g, W * D, H * D, D, t, 0); g.restore();
      if ((nextBolt -= dt) < 0 && mode === 'run') { nextBolt = 5 + Math.random() * 6; flash = 1; KAMB.thunder(.3 + Math.random()); }
      if (flash > 0) { g.fillStyle = 'rgba(235,240,255,' + flash * .7 + ')'; g.fillRect(0, 0, W * D, H * D); flash = Math.max(0, flash - dt * 3); }
      if (sayo.hurt > 0) { g.fillStyle = 'rgba(200,20,20,' + sayo.hurt * .35 + ')'; g.fillRect(0, 0, W * D, H * D); }
      { const vg = g.createRadialGradient(W * D / 2, H * D / 2, Math.min(W, H) * .3 * D, W * D / 2, H * D / 2, Math.max(W, H) * .75 * D); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,4,12,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W * D, H * D); }
      if (white > 0) { g.fillStyle = 'rgba(255,252,240,' + Math.min(1, white) + ')'; g.fillRect(0, 0, W * D, H * D); } }
    function stepRun(dt) { // player control of Sayo, pursuers, kunai
      let dx = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft || keys.q || keys.a ? 1 : 0), dy = (keys.arrowdown || keys.s ? 1 : 0) - (keys.arrowup || keys.z || keys.w ? 1 : 0); if (window.KTOUCH) { const v = KTOUCH.vec(); if (v.len) { dx = v.x; dy = v.y; } } const l = Math.hypot(dx, dy);
      let sp = 10.5; for (const w of pool) if (Math.hypot(sayo.x - w.x, sayo.y - w.y) < w.r) { sp *= .45; sayo.x += Math.cos(t * w.sp) * dt * 2; }
      if (sayo.slow > 0) { sayo.slow -= dt; sp *= .55; } sayo.hurt = Math.max(0, sayo.hurt - dt * 1.5); sayo.subCD = Math.max(0, sayo.subCD - dt);
      sayo.vx = l ? dx / l * sp : 0; sayo.vy = l ? dy / l * sp : 0; sayo.x = Math.max(-24, Math.min(24, sayo.x + sayo.vx * dt)); sayo.y = Math.min(6, sayo.y + sayo.vy * dt); if (l) { sayo.yaw = yawOf(dx, dy); sayo.t += dt; }
      if (take('i') && sayo.subCD <= 0) { smoke.push({ x: sayo.x, y: sayo.y, t: 0, log: 1 }); const side = sayo.x > 0 ? -1 : 1; sayo.x += side * 3.2; sayo.y -= 1.5; sayo.subCD = 2.2; KAMB.step('water', true); for (const k of kunai) k.dodged = true; }
      for (const f of foes) { f.t += dt; const tx = sayo.x + f.off, ty = Math.max(sayo.y + 11, f.y - 30); f.x += (tx - f.x) * Math.min(1, dt * 1.2); f.y += Math.max(-11.5 * dt, Math.min(11.5 * dt, (ty - f.y) * dt * 1.5)); f.yaw = 180;
        if ((f.cd -= dt) < 0 && !tutKunai) { f.cd = 1.2 + Math.random() * 1.6; kunai.push({ x0: f.x, y0: f.y, tx: sayo.x + sayo.vx * .55, ty: sayo.y + sayo.vy * .55, t: 0, warn: .6 }); } }
      for (let i = kunai.length - 1; i >= 0; i--) { const k = kunai[i]; k.t += dt; if (k.t >= k.warn + .22) { const d = Math.hypot(sayo.x - k.tx, sayo.y - k.ty); if (!k.dodged && d < .95) { sayo.hurt = 1; sayo.slow = .8; KAMB.step('stone', true); } else if (d < 2.4 && !k.dodged) { slowT = .4; KAMB.heart(); } kunai.splice(i, 1); } }
      for (let i = smoke.length - 1; i >= 0; i--) { smoke[i].t += dt; if (smoke[i].t > .7) smoke.splice(i, 1); }
      cam.x += (sayo.x * .6 - cam.x) * Math.min(1, dt * 3); cam.y += (sayo.y + 4.5 - cam.y) * Math.min(1, dt * 3);
      if ((sayo.rip = (sayo.rip || 0) - dt) < 0 && l) { sayo.rip = .22; ripples.push({ x: sayo.x, y: sayo.y, t: 0 }); } }
    window.__ki = () => ({ sayo, mode, cam, ts, foes: foes.length, kunai: kunai.length });
    // --- the run ---
    let last = performance.now(), running = true, err = null; const loop = now => { if (!running) return; const rdt = Math.min(.05, (now - last) / 1000); last = now; let dt = rdt * ts; if (slowT > 0) { slowT -= rdt; dt *= .3; }
      try { if (mode === 'run') stepRun(dt); else for (const s of smoke) s.t += dt; frame(dt); } catch (e) { err = e; } }; const stopSea = anim(loop);
    try {
      await fadeBlack(true, 10); KAMB.heart(); await wait(600); KAMB.heart(); await fadeBlack(false, 1600); KAMB.score('theme'); KAMB.mix(.9, .25);
      await sub('', 'La mer des tourbillons. Il y a douze ans.', 2600);
      if ((window.KTOUCH && KTOUCH.enabled)) tbEl.style.display = 'grid'; prompt((window.KTOUCH && KTOUCH.enabled) ? '🕹' : 'ZQSD', (window.KTOUCH && KTOUCH.enabled) ? 'Le joystick : cours sur l’eau. Évite les tourbillons et les cercles rouges.' : 'Cours sur l’eau. Évite les tourbillons et les cercles rouges.'); await wait(3200); unprompt();
      await until(() => sayo.y < -48); KAMB.score('combat'); KAMB.mix(.9, .45);
      // the substitution lesson: a kunai aimed at the baby, time stops
      const f0 = foes[3]; tutKunai = { x0: f0.x, y0: f0.y, tx: sayo.x, ty: sayo.y, t: 0, warn: .45 }; kunai.push(tutKunai); await wait(380); ts = 0; prompt('I', (window.KTOUCH && KTOUCH.enabled) ? 'Touche le bouton : substitution, le kunai vise le bébé !' : 'Substitution : le kunai vise le bébé !'); await until(() => keys.i || pressed.i); ts = 1; unprompt(); tutKunai = null;
      await sub('Sayo', 'Tiens bon… encore un peu. Juste jusqu’au rocher.', 2600);
      await until(() => sayo.y < -122);
      // the flat rock: Yomi
      mode = 'scene'; tbEl.style.display = 'none'; KAMB.score('silence'); for (const f of foes) f.stand = true; const tw = (obj, k, to, ms) => { const from = obj[k], t0 = performance.now(); return until(() => { const u = Math.min(1, (performance.now() - t0) / ms); obj[k] = from + (to - from) * u * u * (3 - 2 * u); return u >= 1; }); };
      const circle = foes.map((f, i) => { const a = Math.PI * .15 + i / foes.length * Math.PI * 1.7; return [ROCK.x + Math.cos(a) * 11, ROCK.y + Math.sin(a) * 6 + 5]; });
      await Promise.all([tw(sayo, 'x', ROCK.x, 1200), tw(sayo, 'y', ROCK.y + 1, 1200), tw(cam, 'x', ROCK.x, 1400), tw(cam, 'y', ROCK.y - 1, 1400), ...foes.map((f, i) => Promise.all([tw(f, 'x', circle[i][0], 1500), tw(f, 'y', circle[i][1], 1500)]))]);
      sayo.yaw = 0; yomi = { x: ROCK.x, y: ROCK.y - 9, a: 0 }; await tw(yomi, 'a', 1, 1600); Object.assign(KAMB.weather, { rain: 0 }); KAMB.mix(0, 0); await wait(1800); KAMB.mix(.7, .4);
      await sub('Yomi', 'Cinq sceaux pour fermer la faille. On t’a menti, Sayo. Il en manque un.', 3600);
      await sub('Yomi', 'Et tu le tiens dans tes bras.', 2400);
      await sub('Sayo', 'Alors tu ne le trouveras jamais.', 2400);
      // six mudras to the beat of the taiko
      const SIGNS = [['子', 'J'], ['丑', 'K'], ['寅', 'L'], ['卯', 'U'], ['辰', 'I'], ['巳', 'J']]; let good = 0; KAMB.score('silence');
      for (const [kan, key] of SIGNS) { chk(); KAMB.hit(.7); prompt(key, '', kan); pressed = {}; const t0 = performance.now(); let ok = false; while (performance.now() - t0 < 900) { if (take(key.toLowerCase())) { ok = true; break; } await wait(20); } if (ok) { good++; spiral = good / 6 * .6; KAMB.step('stone', true); } unprompt(); await wait(220); }
      KAMB.swell(1.6); await tw({ get v() { return spiral; }, set v(x) { spiral = x; } }, 'v', 1.4, 1600); await wait(400); spiral = 0;
      // the offering boat
      KAMB.score('theme'); boat = { x: sayo.x + 1.2, y: sayo.y + 1.5 }; sayo.yaw = 135; await wait(900);
      const bt = performance.now(); await until(() => { const u = (performance.now() - bt) / 4200; boat.x += .05; boat.y += .035; cam.x += (boat.x - cam.x) * .03; cam.y += (boat.y - cam.y) * .03; return u >= 1; });
      await sub('Sayo', '(très bas) Grandis. Et ne regarde pas en arrière.', 3000);
      KAMB.thunder(.1); await tw({ get v() { return white; }, set v(x) { white = x; } }, 'v', 1, 500); KAMB.mix(0, 0); await wait(700);
      if (err) console.error(err);
    } finally { running = false; stopSea(); unprompt(); subEl.style.opacity = 0; if (tbEl) tbEl.style.display = 'none'; }
  }

  /* ================= 2 · the brush title ================= */
  async function titleSequence() { if (window.KTOUCH) KTOUCH.show(false); log('titleSequence'); const D = DPR, t0 = performance.now(); let running = true; KAMB.mix(.4, .55); KAMB.score('theme');
    const loop = () => { if (!running) return; const t = (performance.now() - t0) / 1000; g.fillStyle = '#000'; g.fillRect(0, 0, W * D, H * D); const cx = W * D / 2, cy = H * D / 2, fs = Math.min(W, H) * .32 * D;
      g.font = '400 ' + fs + 'px "Potta One",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const crack = Math.max(0, t - 3.2), titleA = Math.min(1, Math.max(0, (t - 3.4) / 1.2));
      [['影', -fs * .55, .2], ['忍', fs * .55, 1.5]].forEach(([ch, dx, st]) => { const u = Math.max(0, Math.min(1, (t - st) / 1.1)); if (u <= 0) return; g.save(); g.beginPath(); g.rect(cx + dx - fs * .6, cy - fs * .6, fs * 1.2, fs * 1.2 * u); g.clip();
        g.globalAlpha = Math.max(0, 1 - crack * .7); g.fillStyle = '#c8322a'; g.translate(cx + dx + (crack ? (dx > 0 ? 1 : -1) * crack * 40 * D : 0), cy); g.fillText(ch, 0, 0); g.restore(); });
      if (crack > 0 && crack < 1) { g.strokeStyle = 'rgba(255,240,210,' + (1 - crack) + ')'; g.lineWidth = 3 * D; g.beginPath(); g.moveTo(cx, cy - fs * .6); g.lineTo(cx + 12 * D, cy - fs * .1); g.lineTo(cx - 8 * D, cy + fs * .2); g.lineTo(cx + 4 * D, cy + fs * .6); g.stroke(); }
      if (titleA > 0) { g.globalAlpha = titleA; g.fillStyle = '#f6efdc'; { let s = Math.round(fs * .3); g.font = '400 ' + s + 'px "Potta One",sans-serif'; const tw = g.measureText('Kunai Gaiden').width, mx = g.canvas.width * .88; if (tw > mx) { s = Math.floor(s * mx / tw); g.font = '400 ' + s + 'px "Potta One",sans-serif'; } g.fillText('Kunai Gaiden', cx, cy); } g.font = '700 ' + Math.round(fs * .07) + 'px "M PLUS Rounded 1c",sans-serif'; g.fillStyle = '#e3b04a'; g.fillText('LA NUIT DES LANTERNES NOIRES', cx, cy + fs * .32); g.globalAlpha = 1; }
      const lx = -60 * D + (t - 4.5) * W * D / 3.2; if (t > 4.5) { const ly = cy + fs * .55 + Math.sin(t * 2) * 8 * D, gl = g.createRadialGradient(lx, ly, 2, lx, ly, 70 * D); gl.addColorStop(0, 'rgba(255,240,200,.9)'); gl.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gl; g.fillRect(lx - 70 * D, ly - 70 * D, 140 * D, 140 * D); g.fillStyle = '#fff6e0'; g.strokeStyle = '#2a2230'; g.lineWidth = 2 * D; g.beginPath(); g.ellipse(lx, ly, 13 * D, 17 * D, 0, 0, TAU); g.fill(); g.stroke(); }
      }; const stopT = anim(loop);
    try { await wait(8200); } finally { running = false; stopT(); if (window.KTOUCH) KTOUCH.show(true); } }

  /* ================= 3–6 · in Aozora ================= */
  let FP = null, HOUSE = null, boats = [], bk = 0, myBoat = null, marker = null, chaseArrow = null;
  function setupFestivalPlaces() { const M = KMAP, houses = M.B.filter(b => b.house && !M.blocked(b.x, b.y + 1.2) && Math.hypot(b.x, b.y) < 120);
    let best = null, bd = 1e9; for (const b of houses) { for (let r = 3; r < 16; r += 1) { const x = b.x, y = b.y + r; if (M.cls(x, y) === 2) { if (r < bd) { bd = r; best = { b, wx: x, wy: y }; } break; } } }
    if (!best) best = { b: houses[0], wx: houses[0].x, wy: houses[0].y + 6 }; HOUSE = best.b; FP = { x: best.wx, y: best.wy };
    let bank = { x: FP.x, y: FP.y - 1.2 }; for (let r = 0; r < 4; r += .3) if (M.cls(FP.x, FP.y - r) !== 2) { bank = { x: FP.x, y: FP.y - r - .4 }; break; } marker = bank;
    boats = []; for (let i = 0; i < 900 && boats.length < 170; i++) { const x = FP.x + (Math.random() - .5) * 110, y = FP.y + (Math.random() - .5) * 80; if (M.cls(x, y) === 2 && M.cls(x + 1, y) === 2 && M.cls(x - 1, y) === 2) boats.push({ x, y, ph: Math.random() * TAU }); } }
  function drawBoat(g2, b, t, blackT) { const M = KMAP, q = M.toS(b.x, b.y + Math.sin(t * .4 + b.ph) * .15), dark = blackT; g2.save(); g2.translate(q[0], q[1]); g2.scale(1.8, 1.8); const p = [0, 0]; g2.fillStyle = '#6a4428'; g2.strokeStyle = '#2a1a10'; g2.lineWidth = 1; g2.beginPath(); g2.moveTo(p[0] - 7, p[1]); g2.lineTo(p[0] + 7, p[1]); g2.lineTo(p[0] + 5, p[1] + 3); g2.lineTo(p[0] - 5, p[1] + 3); g2.closePath(); g2.fill(); g2.stroke();
    const ly = p[1] - 7, gl = g2.createRadialGradient(p[0], ly, 1, p[0], ly, 22); gl.addColorStop(0, dark ? 'rgba(150,60,230,.6)' : 'rgba(255,200,110,.55)'); gl.addColorStop(1, 'rgba(255,160,60,0)'); g2.fillStyle = gl; g2.fillRect(p[0] - 22, ly - 22, 44, 44);
    g2.fillStyle = dark ? '#1a1020' : '#fff0c8'; g2.strokeStyle = dark ? '#7a3ab0' : '#2a2230'; g2.beginPath(); g2.ellipse(p[0], ly, 3.6, 5, 0, 0, TAU); g2.fill(); g2.stroke(); if (dark) { g2.fillStyle = 'rgba(190,110,255,.8)'; g2.beginPath(); g2.ellipse(p[0], ly, 1.2, 2.4, 0, 0, TAU); g2.fill(); } g2.restore(); }
  function groundHook(g2, t) { for (const b of boats) drawBoat(g2, b, t, Math.hypot(b.x - FP.x, b.y - FP.y) < bk); if (myBoat) drawBoat(g2, myBoat, t, Math.hypot(myBoat.x - FP.x, myBoat.y - FP.y) < bk);
    if (marker && !myBoat) { const p = KMAP.toS(marker.x, marker.y), a = .5 + .4 * Math.sin(t * 4); g2.strokeStyle = 'rgba(255,215,120,' + a + ')'; g2.lineWidth = 2.5; g2.beginPath(); g2.ellipse(p[0], p[1], 22, 22 * .55, 0, 0, TAU); g2.stroke(); } }
  function screenHook(g2) { if (!chaseArrow) return; const a = chaseArrow(); if (!a) return; const [sx, sy] = KMAP.toScreen(a.x, a.y, a.z || 0), D = DPR, Wd = innerWidth, Hd = innerHeight; if (sx > 40 && sx < Wd - 40 && sy > 60 && sy < Hd - 60) return;
    const cx = Wd / 2, cy = Hd / 2, an = Math.atan2(sy - cy, sx - cx), r = Math.min(Wd, Hd) * .42, x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r; g2.save(); g2.translate(x * D, y * D); g2.rotate(an); g2.fillStyle = '#e0594a'; g2.strokeStyle = '#2a2230'; g2.lineWidth = 2.5 * D; g2.beginPath(); g2.moveTo(18 * D, 0); g2.lineTo(-10 * D, -12 * D); g2.lineTo(-4 * D, 0); g2.lineTo(-10 * D, 12 * D); g2.closePath(); g2.fill(); g2.stroke(); g2.restore(); }

  async function houseSequence() { log('houseSequence'); const M = KMAP, GI = KGAME.intro; canvasOn(false);
    // morning, clear sky, village music
    KSTREET.tod = 7.6; KAMB.setWeather('clear'); Object.assign(KAMB.weather, { rain: 0, dark: 0, wind: 1, clouds: .1 }); KAMB.score(null); KAMB.mix(.8, .55); setupFestivalPlaces();
    GI.begin(); GI.showHud(false); M.lock = true; M.setLevel(4); M.hero.x = HOUSE.x; M.hero.y = HOUSE.y + 1.4; M.hero.z = 0; M.snap();
    await new Promise(res => M.enterHouse(HOUSE, INT => { const R = INT.room; R.resident = Object.assign(R.resident || {}, { x: R.x1 - 2.2, y: -2.2, look: 'tsuru', name: 'Grand-mère Tsuru' }); M.hero.x = 4000 + R.x0 + 1.4; M.hero.y = 4000 + R.y0 + 1.6; M.snap(); res(); }));
    await wait(400); await fadeBlack(false, 1200); letterbox(true); await sub('Grand-mère Tsuru', '(depuis la cuisine) Debout ! Le jour de ton bandeau et tu dors comme un chat au soleil !', 3600); letterbox(false);
    M.lock = false; GI.setObjective('Le matin du bandeau', 'Va voir Grand-mère Tsuru (E pour parler)');
    let talked = false; const R = M.getInt().room; R.resident.talk = () => KGAME.say('Grand-mère Tsuru', 'tsuru', ['Te voilà enfin. Approche.', 'On t’a trouvé dans une barque, au bord de la rivière. Tu riais. Moi je ne savais pas quoi faire, alors je t’ai gardé.', '*Elle te tend un bandeau frappé de la feuille d’Aozora, encore dans son papier.*', 'Va. Ce soir c’est le festival des lanternes, et ce soir tu es genin.'], () => { talked = true; });
    log('tsuru ready'); await until(() => talked); log('talked'); GI.setObjective('Le jour du bandeau', 'Sors de la maison (par la porte, en bas)');
    await until(() => !M.getInt()); M.lock = true; await fadeBlack(true, 700); KSTREET.tod = 18.55; await card('Le soir venu…', 'Le festival des lanternes', 2200); }

  async function festivalSequence() { log('festivalSequence'); const M = KMAP, GI = KGAME.intro; M.groundHook = groundHook; KAMB.score('festival'); KAMB.mix(.8, .6);
    M.hero.x = HOUSE.x; M.hero.y = HOUSE.y + 1.6; M.hero.yaw = 0; M.snap(); await fadeBlack(false, 1000); M.lock = false;
    const LK = ['villager', 'merchant', 'student', 'medic', 'kunoichi', 'villager', 'student', 'jonin'], crowd = [];
    for (let n = 0, k = 0; n < 220 && crowd.length < 14; n++) { const x = FP.x + (Math.random() - .5) * 26, y = FP.y - 1.5 - Math.random() * 6; if (M.cls(x, y) === 2 || M.blocked(x, y) || Math.hypot(x - marker.x, y - marker.y) < 2.5) continue;
      const a = { x, y, look: LK[k++ % LK.length], anim: 'idle', yaw: 0, t: Math.random() * 3, crowd: 1 }; crowd.push(a); M.actors.push(a); }
    GI.setObjective('Le festival des lanternes', 'Rejoins la rivière et pose ta barque (le cercle doré)');
    await wait(1400); await sub('Gardien Daisuke', 'Félicitations, genin ! Fais attention au fleuve ce soir, il y a tellement de lanternes qu’on ne voit plus l’eau.', 4200);
    let placed = false; M.prompt = () => (marker && !placed && Math.hypot(M.hero.x - marker.x, M.hero.y - marker.y) < 2.2) ? { txt: 'Poser ta barque', fn: () => { placed = true; } } : null;
    log('wait boat ' + JSON.stringify(marker)); await until(() => placed); log('placed'); M.prompt = null; myBoat = { x: marker.x, y: marker.y + 1.6, ph: 0 }; M.lock = true; letterbox(true); M.camTarget = { x: FP.x, y: FP.y };
    KAMB.mix(.4, .3); await sub('', 'Toute la foule se tait pour regarder les barques s’éloigner.', 3000);
    // the blackout: one boat, then the river, then every lantern of the village
    M.setLevel(2); const t0 = performance.now(); KAMB.setDetune(.2); await until(() => { const u = (performance.now() - t0) / 6000; bk = 4 + u * u * 70; KAMB.setDetune(.2 + u * .8); KSTREET.tod = 18.55 + u * 1.2; return u >= 1; });
    const t1 = performance.now(); KSTREET.black.x = FP.x; KSTREET.black.y = FP.y; await until(() => { const u = (performance.now() - t1) / 6500; KSTREET.black.r = u * 420; KSTREET.tod = 19.75 + u * .9; M.camTarget = { x: FP.x, y: FP.y + 2 }; return u >= 1; });
    KAMB.score('silence'); KAMB.setDetune(0); await wait(900); KAMB.hit(1.4); for (const a of M.actors) if (a.crowd) a.hidden = true; await wait(500); }

  // a parabolic leap for a scripted actor
  const leap = (a, x, y, z, ms, hgt) => { const x0 = a.x, y0 = a.y, z0 = a.z || 0, t0 = performance.now(); a.anim = 'ninjarun'; return until(() => { const u = Math.min(1, (performance.now() - t0) / ms); a.x = x0 + (x - x0) * u; a.y = y0 + (y - y0) * u; a.z = z0 + (z - z0) * u + Math.sin(u * Math.PI) * (hgt ?? 3); a.yaw = yawOf(x - x0, y - y0); return u >= 1; }); };
  async function chaseSequence() { log('chaseSequence'); const M = KMAP, GI = KGAME.intro; KAMB.score('combat'); KAMB.mix(.9, .55); KSTREET.tod = Math.max(KSTREET.tod, 19.6);
    // masked ninjas walk out of the river
    const masks = []; for (let i = 0; i < 6; i++) { const a = { x: FP.x + (i - 2.5) * 3, y: FP.y + 3 + (i % 2) * 2, z: -1.8, look: 'masked', anim: 'idle', yaw: 180, t: Math.random() * 3, after: (g2, t, p) => { g2.fillStyle = '#120a18'; g2.strokeStyle = '#7a3ab0'; g2.lineWidth = 1.2; g2.beginPath(); g2.ellipse(p[0] + 12, p[1] - 30, 5, 7, 0, 0, TAU); g2.fill(); g2.stroke(); g2.fillStyle = 'rgba(190,110,255,.8)'; g2.beginPath(); g2.ellipse(p[0] + 12, p[1] - 31, 1.6, 3, 0, 0, TAU); g2.fill(); } }; masks.push(a); M.actors.push(a); }
    const e0 = performance.now(); await until(() => { const u = Math.min(1, (performance.now() - e0) / 2200); for (const a of masks) a.z = -1.8 + u * 1.8; return u >= 1; });
    // Kurogane drops from the roofs with the stolen seal
    const kx = M.hero.x + 5, ky = M.hero.y - 2, kuro = { x: kx, y: ky, z: 14, look: 'rogue', anim: 'jump', yaw: 270, t: 0, after: (g2, t, p) => { g2.save(); g2.translate(p[0] - 10, p[1] - 44); g2.rotate(-.5); g2.fillStyle = '#f2ead4'; g2.strokeStyle = '#2a2230'; g2.lineWidth = 1.3; g2.fillRect(-9, -3, 18, 6); g2.strokeRect(-9, -3, 18, 6); g2.fillStyle = '#c8322a'; g2.fillRect(-2, -3, 4, 6); g2.restore(); } };
    M.actors.push(kuro); M.camTarget = null; await leap(kuro, kx, ky, 0, 700, 0); kuro.anim = 'idle'; KAMB.step('stone', true);
    await sub('Gardien Daisuke', '(au loin) Le sceau ! Ils ont pris le sceau de la résidence !', 2600);
    await sub('Kurogane', 'Tiens, un petit genin. Suis-moi si tu l’oses.', 2400); letterbox(false);
    // route: a chain of rooftops, then down to a courtyard
    const roofs = [], used = new Set(); let cx = kx, cy = ky; for (let n = 0; n < 5; n++) { let best = null, bs = -1e9; for (const b of M.B) { if (!b.house || used.has(b)) continue; const rx = b.x, ry = b.y - b.house.d / 2, d = Math.hypot(rx - cx, ry - cy); if (d < 7 || d > 19) continue; const h = M.support(rx, ry, 99).h; if (h < 4 || h > 11.5) continue; const sc = -Math.abs(d - 12) - ry * .05 + Math.random(); if (sc > bs) { bs = sc; best = { b, x: rx, y: ry, z: h }; } }
      if (!best) break; used.add(best.b); roofs.push(best); cx = best.x; cy = best.y; }
    let end = null; for (let r = 4; r < 30 && !end; r += 1.5) for (let a = 0; a < TAU; a += .6) { const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (!M.blocked(x, y) && !M.blocked(x + 3, y) && !M.blocked(x - 3, y) && !M.blocked(x, y + 3) && M.cls(x, y) !== 2) { end = { x, y, z: 0 }; break; } }
    roofs.push(end || { x: cx, y: cy + 5, z: 0 });
    M.lock = false; GI.showBar(true); GI.toast('Poursuis Kurogane !', (window.KTOUCH && KTOUCH.enabled) ? 'Saute de toit en toit avec 跳 (deux fois : double saut)' : 'Saute de toit en toit : Espace, deux fois pour le double saut'); GI.setObjective('La nuit des lanternes noires', (window.KTOUCH && KTOUCH.enabled) ? 'Poursuis Kurogane sur les toits ! (bouton 跳 : saut, encore : double saut)' : 'Poursuis Kurogane sur les toits ! (Espace : saut, encore Espace : double saut)'); chaseArrow = () => kuro;
    let slowDone = 0, slowing = false; const slowWatch = setInterval(() => { const h = M.hero; if (!slowing && slowDone < 2 && h.air && h.z > 4.5 && Math.abs(h.vz) < 6 && !M.support(h.x, h.y, h.z).by) { slowing = true; slowDone++; M.ts = .22; KAMB.mix(.15, .1); KAMB.heart(); setTimeout(() => KAMB.heart(), 700); setTimeout(() => { M.ts = 1; KAMB.mix(.9, .55); slowing = false; }, 1500); } }, 60);
    try { for (const w of roofs) { chk(); await until(() => Math.hypot(M.hero.x - kuro.x, M.hero.y - kuro.y) < 11); await leap(kuro, w.x, w.y, w.z, Math.max(650, Math.hypot(w.x - kuro.x, w.y - kuro.y) * 70), 3.5); kuro.anim = 'idle'; kuro.yaw = 180; await wait(250); } }
    finally { clearInterval(slowWatch); M.ts = 1; }
    await until(() => Math.hypot(M.hero.x - kuro.x, M.hero.y - kuro.y) < 7 && M.hero.z < 1.2);
    // the duel: real combat, but it cannot be won
    chaseArrow = null; M.lock = true; letterbox(true); await sub('Kurogane', 'Un genin du jour ? Ils envoient vraiment n’importe qui.', 2600); letterbox(false);
    M.actors.splice(M.actors.indexOf(kuro), 1); const boss = GI.spawnBoss(kuro.x, kuro.y); GI.setNoDeath(true); GI.showHud(true); GI.heal(); M.lock = false; GI.toast('Le duel', 'Frappe Kurogane !');
    GI.setObjective('Le duel', (window.KTOUCH && KTOUCH.enabled) ? 'Combats ! Boutons de taijutsu et de kunai' : 'Combats ! J : taijutsu · K : kunai'); const d0 = performance.now(); await until(() => performance.now() - d0 > 24000 || GI.hp() < .22);
    return { boss, masks }; }

  async function awakeningSequence(ctx) { log('awakeningSequence'); const M = KMAP, GI = KGAME.intro, boss = ctx.boss, cvMain = document.getElementById('c');
    M.lock = true; GI.showHud(false); GI.showBar(false); const kuro = { x: boss.x, y: boss.y, z: 0, look: 'rogue', anim: 'attack', yaw: yawOf(M.hero.x - boss.x, M.hero.y - boss.y), t: 0, phase: .3 }; GI.removeEnemy(boss); M.actors.push(kuro); letterbox(true);
    await sub('Kurogane', '(il lève sa lame) …Non. Le rouleau tremble. Il répond à… toi ?', 3000);
    grab = true; M.ts = 0; cvMain.style.filter = 'grayscale(.92) brightness(1.15) sepia(.25)'; KAMB.mix(.2, .4); KAMB.score('theme'); let charge = 0, holding = false;
    M.screenHook = (g2, t) => { const [sx, sy] = M.toScreen(M.hero.x, M.hero.y, 1.1), D = DPR; g2.save(); g2.globalCompositeOperation = 'lighter'; const R = (60 + charge * 260) * D, gl = g2.createRadialGradient(sx * D, sy * D, 4, sx * D, sy * D, R); gl.addColorStop(0, 'rgba(255,245,200,' + (.4 + charge * .5) + ')'); gl.addColorStop(1, 'rgba(255,190,70,0)'); g2.fillStyle = gl; g2.fillRect(sx * D - R, sy * D - R, R * 2, R * 2);
      for (let a = 0; a < 3; a++) { g2.strokeStyle = 'rgba(255,225,140,.85)'; g2.lineWidth = 3 * D; g2.beginPath(); for (let s = 0; s <= 1; s += .025) { const an = t * 5 + a * TAU / 3 + s * 8, rr = (1 - s) * (30 + charge * 150) * D; const x = sx * D + Math.cos(an) * rr, y = sy * D + Math.sin(an) * rr * .7; s ? g2.lineTo(x, y) : g2.moveTo(x, y); } g2.stroke(); } g2.restore(); };
    prompt('U', (window.KTOUCH && KTOUCH.enabled) ? 'Garde le doigt sur U' : 'Maintiens U'); KAMB.swell(2); const c0 = performance.now(); await until(() => { holding = !!keys.u; if (holding) charge = Math.min(1, charge + .03); else if (charge > 0 && charge < 1) charge = Math.max(0, charge - .01); prEl.querySelector('.lab').textContent = charge >= 1 ? 'Relâche !' : 'Maintiens U · ' + Math.round(charge * 100) + ' %'; return (charge >= 1 && !keys.u) || performance.now() - c0 > 14000; });
    grab = false; unprompt(); KAMB.hit(1.6); KAMB.thunder(0); cvMain.style.filter = ''; M.ts = 1; let boom = 0; const bt = performance.now();
    M.screenHook = (g2) => { const u = (performance.now() - bt) / 900, D = DPR, [sx, sy] = M.toScreen(M.hero.x, M.hero.y, 1); if (u > 1.4) return; g2.save(); g2.globalCompositeOperation = 'lighter'; const R = Math.max(1, u * Math.max(innerWidth, innerHeight) * D); const gl = g2.createRadialGradient(sx * D, sy * D, R * .6, sx * D, sy * D, R); gl.addColorStop(0, 'rgba(255,250,230,0)'); gl.addColorStop(.85, 'rgba(255,240,190,' + Math.max(0, .9 - u * .6) + ')'); gl.addColorStop(1, 'rgba(255,200,90,0)'); g2.fillStyle = gl; g2.fillRect(0, 0, innerWidth * D, innerHeight * D);
      if (u < .25) { g2.fillStyle = 'rgba(255,255,245,' + (1 - u * 4) + ')'; g2.fillRect(0, 0, innerWidth * D, innerHeight * D); } g2.restore(); };
    const away = Math.atan2(kuro.y - M.hero.y, kuro.x - M.hero.x); kuro.anim = 'hurt'; await leap(kuro, kuro.x + Math.cos(away) * 13, kuro.y + Math.sin(away) * 13, 0, 900, 5); KAMB.step('stone', true); M.screenHook = null;
    await wait(800); kuro.anim = 'idle'; kuro.yaw = yawOf(M.hero.x - kuro.x, M.hero.y - kuro.y);
    await sub('Kurogane', 'Yomi avait raison… Le sixième sceau respire.', 3000);
    for (const a of ctx.masks) a.hidden = true; kuro.hidden = true; KAMB.step('water', true);
    await sub('', 'Tes jambes lâchent. Des pas qui accourent. Les lanternes du village se rallument, une à une, blanches.', 3800);
    await fadeBlack(true, 1200); M.actors.length = 0; M.groundHook = null; boats = []; myBoat = null; bk = 0; KSTREET.black.r = 0; GI.setNoDeath(false); }

  async function cliffSequence() { log('cliffSequence'); canvasOn(true); const D = DPR, t0 = performance.now(); let running = true; let laOn = 1; KAMB.score('silence'); KAMB.mix(.6, .3); Object.assign(KAMB.weather, { rain: 0, dark: 0 });
    const lights = []; for (let i = 0; i < 160; i++) lights.push([Math.random(), .62 + Math.random() * .38, Math.random()]);
    const loop = () => { if (!running) return; const t = (performance.now() - t0) / 1000, w = W * D, h = H * D; const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#05060f'); sky.addColorStop(1, '#1a1830'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
      for (const [x, y, p] of lights) { g.fillStyle = 'rgba(255,240,210,' + (.4 + .4 * Math.sin(t * 2 + p * 9)) + ')'; g.fillRect(x * w, y * h, 2 * D, 2 * D); }
      g.fillStyle = '#07060a'; g.beginPath(); g.moveTo(w * .45, h); g.lineTo(w * .52, h * .6); g.lineTo(w * .62, h * .55); g.lineTo(w * .8, h * .58); g.lineTo(w, h * .52); g.lineTo(w, h); g.closePath(); g.fill();
      const px = Math.round(92 * 2.4 * D), set = frames('yomi', 'idle', 180, px), f = set[Math.floor((t / 1.6) % 1 * set.length) % set.length]; g.drawImage(f, w * .68 - set.ax, h * .57 - set.ay);
      if (laOn > 0) { const lx = w * .76, ly = h * .38 + Math.sin(t * 1.4) * 6 * D, gl = g.createRadialGradient(lx, ly, 2, lx, ly, 80 * D); gl.addColorStop(0, 'rgba(160,70,240,' + .6 * laOn + ')'); gl.addColorStop(1, 'rgba(120,40,200,0)'); g.fillStyle = gl; g.fillRect(lx - 80 * D, ly - 80 * D, 160 * D, 160 * D);
        g.globalAlpha = laOn; g.fillStyle = '#120a18'; g.strokeStyle = '#7a3ab0'; g.lineWidth = 2 * D; g.beginPath(); g.ellipse(lx, ly, 16 * D, 21 * D, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(190,110,255,.85)'; g.beginPath(); g.ellipse(lx, ly - 2 * D, 4 * D, 8 * D, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
      }; const stopC = anim(loop);
    try { await fadeBlack(false, 1400); await sub('Yomi', 'Laissez-le grandir. Un sceau qu’on cueille trop tôt ne s’ouvre pas.', 4000); const s0 = performance.now(); await until(() => { laOn = Math.max(0, 1 - (performance.now() - s0) / 900); return laOn <= 0; }); await wait(700); await fadeBlack(true, 900); }
    finally { running = false; stopC(); canvasOn(false); } }

  async function hospitalSequence() { log('hospitalSequence'); const M = KMAP, GI = KGAME.intro; KSTREET.tod = 8.2; KAMB.score(null); KAMB.mix(.8, .55); const ren = KGAME.dbg().NPCS.find(n => n.id === 'ren');
    M.hero.x = ren.x; M.hero.y = ren.y + 2.2; M.hero.z = 0; M.hero.yaw = 0; M.snap(); M.setLevel(3); M.lock = true; letterbox(false); await fadeBlack(false, 1400);
    await new Promise(res => KGAME.say('Secrétaire Mei', 'kunoichi', ['Tu es réveillé. Ren dit que tu as dormi deux jours.', 'Le Gardien veut te voir. Rejoins-moi devant sa résidence, au nord de l’avenue.', 'Et personne, je dis bien personne, ne doit savoir ce que tu as fait cette nuit-là.'], res)); }

  async function finalize(fromSkip) { if (finalized) return; finalized = true; const M = KMAP, GI = KGAME.intro;
    if (fromSkip) { unprompt(); subEl.style.opacity = 0; canvasOn(false); M.actors.length = 0; M.groundHook = null; M.screenHook = null; M.prompt = null; M.camTarget = null; M.ts = 1; boats = []; myBoat = null; bk = 0; chaseArrow = null; KSTREET.black.r = 0; KAMB.setDetune(0); document.getElementById('c').style.filter = '';
      for (const e of KGAME.dbg().enemies.filter(e => e.scripted)) GI.removeEnemy(e); if (M.getInt()) M.exitHouse();
      if (!creatorDone) { await new Promise(res => GI.creator(res)); creatorDone = true; } if (!KGAME.isStarted()) GI.begin();
      const ren = KGAME.dbg().NPCS.find(n => n.id === 'ren'); setTimeout(() => { M.hero.x = ren.x; M.hero.y = ren.y + 2.2; M.hero.z = 0; M.snap(); }, 400); KSTREET.tod = 8.2; KAMB.score(null); KAMB.mix(.8, .55); }
    KSTREET.freeze(false); grab = false; M.lock = false; M.ts = 1; M.camTarget = null; M.screenHook = null; M.prompt = null; letterbox(false); GI.setNoDeath(false); GI.setObjective(null); GI.showHud(true); GI.heal(); GI.done(); cardEl.style.opacity = 0; active = false; root.style.display = 'none';
    setTimeout(() => GI.toast('Kunai Gaiden', 'Rejoins la secrétaire Mei devant la résidence du Gardien'), 600); }

  async function start(from) { dom(); root.style.display = 'block'; active = true; skipping = false; creatorDone = false; finalized = false; pressed = {}; from = from || 1;
    try { await until(() => KMAP.isReady && KMAP.isReady()); KSTREET.freeze(true);
      if (from <= 1) { await seaSequence(); chk(); await titleSequence(); chk(); }
      await fadeBlack(true, 10); canvasOn(false); if (from <= 3) await new Promise(res => KGAME.intro.creator(res)); creatorDone = true; chk();
      if (from <= 3) await houseSequence(); else { setupFestivalPlaces(); KGAME.intro.begin(); KGAME.intro.showHud(false); KSTREET.tod = 18.35; KAMB.setWeather('clear'); Object.assign(KAMB.weather, { rain: 0, dark: 0, wind: 1 }); }
      if (from <= 4) await festivalSequence(); else { KMAP.groundHook = groundHook; KSTREET.tod = 19.6; KMAP.hero.x = FP.x; KMAP.hero.y = marker.y - 1; KMAP.snap(); await fadeBlack(false, 300); }
      const ctx = await chaseSequence(); await awakeningSequence(ctx); await cliffSequence(); await hospitalSequence(); await finalize(false); }
    catch (e) { log('abort ' + (e === SKIP ? 'skip' : e && e.message)); if (e !== SKIP) console.error(e); await finalize(true); } }
  return { start, active: () => active, grab: () => grab };
})();
