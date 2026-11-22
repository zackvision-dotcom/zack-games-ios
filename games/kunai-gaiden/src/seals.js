/* Kunai Gaiden — techniques by drawing (touch screens).
   The player draws a sign with the finger in the pad at the bottom right; a recogniser (a $1-style
   template matcher, orientation-sensitive so M ≠ W and Z ≠ N) turns it into a technique.
   Every technique then plays its hand seals (the twelve traditional zodiac seals) in a medallion. */
window.KSEAL = (() => {
  /* ================= the signs ================= */
  // glyph drawn → technique (a straight line is the flash step, in the direction of the stroke)
  const GLYPH = { fire: 'V', sphere: 'O', subst: 'L', water: 'S', clone: 'M', chidori: 'Z', wind: 'W', dash: '—' };
  const circle = (a0, dir) => Array.from({ length: 33 }, (_, i) => { const a = a0 + dir * i / 32 * Math.PI * 2; return [50 + 50 * Math.cos(a), 50 + 50 * Math.sin(a)]; });
  const sCurve = () => { const p = []; for (let i = 0; i <= 16; i++) { const a = -0.25 * Math.PI - i / 16 * 1.25 * Math.PI; p.push([50 + 42 * Math.cos(a), 25 + 25 * Math.sin(a)]); }
    for (let i = 1; i <= 16; i++) { const a = -0.5 * Math.PI + i / 16 * 1.25 * Math.PI; p.push([50 + 42 * Math.cos(a), 75 + 25 * Math.sin(a)]); } return p; };
  const TPL = [
    ['fire', [[0, 0], [50, 100], [100, 0]]],
    ['sphere', circle(-Math.PI / 2, -1)], ['sphere', circle(-Math.PI / 2, 1)], ['sphere', circle(0, -1)], ['sphere', circle(Math.PI, 1)],
    ['subst', [[0, 0], [0, 100], [70, 100]]],
    ['water', sCurve()],
    ['clone', [[0, 100], [0, 0], [50, 70], [100, 0], [100, 100]]], ['clone', [[0, 100], [12, 0], [50, 70], [88, 0], [100, 100]]],
    ['chidori', [[0, 0], [100, 0], [0, 100], [100, 100]]],
    ['wind', [[0, 0], [25, 100], [50, 25], [75, 100], [100, 0]]], ['wind', [[0, 0], [20, 100], [50, 0], [80, 100], [100, 0]]]];
  const N = 48;
  const len = P => { let d = 0; for (let i = 1; i < P.length; i++) d += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return d; };
  function resample(P0) { const P = P0.map(p => p.slice()), I = len(P) / (N - 1), out = [P[0].slice()]; let D = 0;
    for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      if (D + d >= I && d > 0) { const t = (I - D) / d, q = [P[i - 1][0] + t * (P[i][0] - P[i - 1][0]), P[i - 1][1] + t * (P[i][1] - P[i - 1][1])]; out.push(q); P.splice(i, 0, q); D = 0; } else D += d; }
    while (out.length < N) out.push(P[P.length - 1].slice()); return out.slice(0, N); }
  // keep the orientation, scale the larger side to 1 (keeps the shape of V vs W), centre on the centroid
  function norm(P) { P = resample(P); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const s = Math.max(x1 - x0, y1 - y0) || 1; let cx = 0, cy = 0; const Q = P.map(([x, y]) => [(x - x0) / s, (y - y0) / s]); for (const [x, y] of Q) { cx += x; cy += y; } cx /= N; cy /= N; return Q.map(([x, y]) => [x - cx, y - cy]); }
  const dist = (A, B) => { let d = 0; for (let i = 0; i < N; i++) d += Math.hypot(A[i][0] - B[i][0], A[i][1] - B[i][1]); return d / N; };
  const T = []; for (const [id, pts] of TPL) { T.push({ id, p: norm(pts) }); T.push({ id, p: norm(pts.slice().reverse()) }); }
  function recognize(pts) { if (pts.length < 2) return null; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const w = x1 - x0, h = y1 - y0, L = len(pts); if (Math.max(w, h) < 26) return null;
    // a straight line: the flash step, along the stroke
    const a = pts[0], b = pts[pts.length - 1], ch = Math.hypot(b[0] - a[0], b[1] - a[1]); if (ch > .9 * L && ch > 40) return { id: 'dash', dir: [(b[0] - a[0]) / ch, (b[1] - a[1]) / ch], score: 1 };
    if (pts.length < 6) return null;
    // a closed loop, whatever the starting point: the chakra sphere
    if (ch < .28 * Math.max(w, h) && L > 2.4 * Math.max(w, h) && Math.min(w, h) > .5 * Math.max(w, h)) { let cx = 0, cy = 0; for (const [x, y] of pts) { cx += x; cy += y; } cx /= pts.length; cy /= pts.length; let turn = 0;
      for (let i = 1; i < pts.length; i++) { let d = Math.atan2(pts[i][1] - cy, pts[i][0] - cx) - Math.atan2(pts[i - 1][1] - cy, pts[i - 1][0] - cx); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; turn += d; }
      if (Math.abs(turn) > 1.6 * Math.PI) return { id: 'sphere', score: 1 }; }
    const P = norm(pts); let best = null, bd = 1e9, second = 1e9;
    for (const t of T) { const d = dist(P, t.p); if (d < bd) { if (!best || best.id !== t.id) second = bd; bd = d; best = t; } else if (t.id !== best.id && d < second) second = d; }
    return bd < .2 ? { id: best.id, score: 1 - bd / .2, margin: second - bd } : null; }

  /* ================= the hands ================= */
  // one hand, right hand, palm towards us, fingers up; f = [thumb, index, middle, ring, little] (1 straight, 0 folded)
  const SKIN = '#f2c7a0', SKD = '#d99a72', INK = '#4a2a1c';
  function hand(g, o, left) { g.save(); g.translate(o.x, o.y); g.rotate(o.r); if (left) g.scale(-1, 1); g.lineJoin = g.lineCap = 'round'; g.lineWidth = 2.4; g.strokeStyle = INK;
    // sleeve
    g.fillStyle = '#26324a'; g.beginPath(); g.roundRect(-15, 20, 30, 30, 4); g.fill(); g.stroke(); g.fillStyle = '#c9a24a'; g.fillRect(-15, 24, 30, 3.5);
    // palm
    g.fillStyle = SKIN; g.beginPath(); g.roundRect(-16, -14, 32, 38, 10); g.fill(); g.stroke(); g.strokeStyle = 'rgba(120,60,30,.35)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-8, 4); g.quadraticCurveTo(0, 10, 10, 2); g.stroke();
    const BX = [-11.5, -3.8, 3.8, 11.5], LEN = [24, 28, 26, 20], SP = [-.1, -.03, .04, .12];
    for (let i = 0; i < 4; i++) { const ext = o.f[i + 1], l = ext ? LEN[i] : 9; g.save(); g.translate(BX[i], -12); g.rotate(SP[i] * (ext ? 1 + (o.sp || 0) : .3));
      g.fillStyle = ext ? SKIN : SKD; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.roundRect(-3.9, -l, 7.8, l + 4, 3.9); g.fill(); g.stroke();
      if (ext) { g.strokeStyle = 'rgba(120,60,30,.4)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-2.4, -l * .45); g.lineTo(2.4, -l * .45); g.stroke(); } else { g.strokeStyle = 'rgba(120,60,30,.55)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-3, -3); g.lineTo(3, -3); g.stroke(); }
      g.restore(); }
    // thumb: out to the side, or tucked across the palm
    g.save(); g.translate(-14, 10); g.rotate(o.f[0] ? -.75 : -1.75); const tl = o.f[0] ? 20 : 15; g.fillStyle = SKIN; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.roundRect(-4.4, -tl, 8.8, tl + 4, 4.4); g.fill(); g.stroke(); g.restore();
    g.restore(); }
  // the seals, after the twelve zodiac seals (approximate poses, drawn from scratch)
  const SEALS = {
    ne: { k: '子', n: 'Rat', R: { x: 4, y: -2, r: 0, f: [0, 1, 1, 0, 0] }, L: { x: -2, y: 18, r: -.15, f: [1, 0, 0, 0, 0] }, front: 'L' },
    ushi: { k: '丑', n: 'Bœuf', R: { x: 7, y: -6, r: .3, f: [1, 1, 1, 0, 0] }, L: { x: -6, y: 14, r: -1.35, f: [1, 1, 1, 0, 0] }, front: 'R' },
    tora: { k: '寅', n: 'Tigre', R: { x: 3, y: 0, r: .05, f: [1, 1, 1, 0, 0] }, L: { x: -3, y: 3, r: -.06, f: [1, 1, 1, 0, 0] }, front: 'R' },
    u: { k: '卯', n: 'Lièvre', R: { x: 4, y: -12, r: .12, f: [0, 0, 0, 0, 0] }, L: { x: -2, y: 18, r: -2.95, f: [1, 1, 1, 1, 1] }, front: 'R' },
    tatsu: { k: '辰', n: 'Dragon', R: { x: 8, y: 0, r: .4, f: [1, 1, 1, 1, 1] }, L: { x: -8, y: 4, r: -.45, f: [1, 1, 1, 1, 1] }, front: 'L' },
    mi: { k: '巳', n: 'Serpent', R: { x: 5, y: 0, r: .35, f: [1, 0, 0, 0, 0] }, L: { x: -5, y: 2, r: -.35, f: [1, 0, 0, 0, 0] }, front: 'R' },
    uma: { k: '午', n: 'Cheval', R: { x: 10, y: 4, r: .6, f: [1, 1, 0, 0, 0] }, L: { x: -10, y: 4, r: -.6, f: [1, 1, 0, 0, 0] }, front: 'R' },
    hitsuji: { k: '未', n: 'Bélier', R: { x: 2, y: -4, r: 0, f: [0, 1, 1, 0, 0] }, L: { x: -2, y: 16, r: 0, f: [0, 0, 0, 0, 0] }, front: 'L' },
    saru: { k: '申', n: 'Singe', R: { x: 4, y: -3, r: .14, f: [1, 1, 1, 1, 1] }, L: { x: -4, y: 3, r: -.14, f: [1, 1, 1, 1, 1] }, front: 'R' },
    tori: { k: '酉', n: 'Oiseau', R: { x: 8, y: 0, r: .7, f: [1, 1, 1, 1, 1], sp: 2 }, L: { x: -8, y: 0, r: -.7, f: [1, 1, 1, 1, 1], sp: 2 }, front: 'R' },
    inu: { k: '戌', n: 'Chien', R: { x: 6, y: -6, r: -1.5, f: [1, 1, 1, 1, 1] }, L: { x: -6, y: 10, r: 1.5, f: [0, 0, 0, 0, 0] }, front: 'R' },
    i: { k: '亥', n: 'Sanglier', R: { x: 4, y: -5, r: -1.45, f: [1, 1, 1, 1, 1] }, L: { x: -4, y: 9, r: 1.45, f: [1, 1, 1, 1, 1] }, front: 'L' },
    clone: { k: '十', n: 'Clonage', R: { x: 0, y: -2, r: 0, f: [0, 1, 1, 0, 0] }, L: { x: -4, y: 6, r: -1.57, f: [0, 1, 1, 0, 0] }, front: 'R' },
    palm: { k: '掌', n: 'Paume', R: { x: 0, y: 6, r: 0, f: [1, 1, 1, 1, 1], sp: 1.5 }, front: 'R', swirl: true } };
  // which seals each technique weaves (traditional-style sequences)
  const SEQ = { fire: ['mi', 'hitsuji', 'saru', 'i', 'uma', 'tora'], chidori: ['ushi', 'u', 'saru'], water: ['ushi', 'saru', 'u', 'ne', 'i', 'tori'], clone: ['clone'],
    subst: ['hitsuji', 'tora'], dash: ['tora'], sphere: ['palm'], wind: ['tori', 'inu', 'tora'] };
  const TECH = { fire: 'Boule de feu', chidori: 'Lame-tonnerre', water: 'Dragon d’eau', clone: 'Multiclonage', subst: 'Substitution', dash: 'Pas éclair', sphere: 'Sphère de chakra', wind: 'Lame de vent' };
  function drawSeal(g, id, t) { const s = SEALS[id]; g.save(); g.scale(1.55, 1.55);
    const ord = s.L ? (s.front === 'R' ? [['L', true], ['R', false]] : [['R', false], ['L', true]]) : [['R', false]];
    for (const [k, left] of ord) hand(g, s[k], left);
    if (s.swirl) { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(110,190,255,${.7 - i * .2})`; g.lineWidth = 3 - i; g.beginPath(); g.arc(0, -34, 10 + i * 5, t * 9 + i, t * 9 + i + 4.4); g.stroke(); } g.fillStyle = 'rgba(200,235,255,.8)'; g.beginPath(); g.arc(0, -34, 6, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
    g.restore(); }

  /* ================= the medallion: seals one after the other, then the technique's name ================= */
  let med = null, mq = null, run = null;
  function buildMed() { if (med) return; med = document.createElement('div'); med.id = 'k-seals';
    med.innerHTML = `<style>#k-seals{position:fixed;left:10px;bottom:44px;z-index:7;pointer-events:none;display:none;flex-direction:row;align-items:center;gap:8px}#k-seals .col{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
      #k-seals canvas{width:92px;height:92px}#k-seals .nm{font:400 16px 'Potta One',sans-serif;color:#fff4dc;text-shadow:0 0 6px #000,0 2px 0 #2a2230,0 0 14px rgba(196,123,255,.8);white-space:nowrap;opacity:0;transform:translateY(6px) scale(.9);transition:all .18s}
      #k-seals .nm.on{opacity:1;transform:none}#k-seals .dots{display:flex;gap:5px;height:8px}#k-seals .dots i{width:8px;height:8px;border-radius:50%;background:rgba(247,241,222,.35);border:1.5px solid #2a2230}#k-seals .dots i.on{background:#e6b450}
      body.compact #k-seals{bottom:34px;left:6px}body.compact #k-seals canvas{width:74px;height:74px}body.compact #k-seals .nm{font-size:13px}</style><canvas width="300" height="300"></canvas><div class="col"><div class="nm"></div><div class="dots"></div></div>`;
    document.body.appendChild(med); mq = med.querySelector('canvas').getContext('2d'); }
  function play(id, name) { const seq = SEQ[id]; if (!seq) return; buildMed(); const per = Math.min(.15, .62 / seq.length);
    run = { seq, per, t0: performance.now() / 1000, name: name || TECH[id] || '', end: seq.length * per + .9 }; med.style.display = 'flex';
    med.querySelector('.dots').innerHTML = seq.length > 1 ? seq.map(() => '<i></i>').join('') : ''; const nm = med.querySelector('.nm'); nm.classList.remove('on'); nm.textContent = run.name;
    if (!play.loop) { play.loop = true; requestAnimationFrame(tick); } }
  function tick() { if (!run) { play.loop = false; return; } const now = performance.now() / 1000, t = now - run.t0, r = run, n = r.seq.length, i = Math.min(n - 1, Math.floor(t / r.per)), u = t / r.per - i;
    const g = mq; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 300, 300); const fade = Math.max(0, Math.min(1, (r.end - t) / .3)); g.globalAlpha = fade;
    // medallion: red ring on a washi disc
    g.translate(150, 150); g.fillStyle = 'rgba(247,241,222,.94)'; g.beginPath(); g.arc(0, 0, 118, 0, 7); g.fill(); g.lineWidth = 9; g.strokeStyle = '#a82a20'; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#2a2230'; g.beginPath(); g.arc(0, 0, 124, 0, 7); g.stroke();
    const sid = r.seq[i], s = SEALS[sid]; g.fillStyle = 'rgba(168,42,32,.13)'; g.font = "400 150px 'Potta One',serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.k, 0, 8);
    const pop = t < n * r.per ? 1 + .18 * Math.max(0, 1 - u * 3) : 1; g.save(); g.translate(0, 26); g.scale(pop, pop); drawSeal(g, sid, t); g.restore();
    g.font = "800 22px 'M PLUS Rounded 1c',sans-serif"; g.fillStyle = '#2a2230'; g.fillText(s.k + ' ' + s.n, 0, 98);
    if (t < n * r.per && u < .25) { g.fillStyle = `rgba(255,255,255,${(.25 - u) * 2})`; g.beginPath(); g.arc(0, 0, 118, 0, 7); g.fill(); }
    med.querySelectorAll('.dots i').forEach((d, k) => d.classList.toggle('on', k <= i));
    if (t >= n * r.per) med.querySelector('.nm').classList.add('on'); med.style.opacity = fade;
    if (t > r.end) { run = null; med.style.display = 'none'; play.loop = false; return; } requestAnimationFrame(tick); }

  /* ================= the drawing pad (bottom right, next to the action buttons) ================= */
  let pad = null, ink = null, iq = null, stroke = null, trail = null, O = null;
  function makePad(opts) { if (pad) return; O = opts;
    ink = document.createElement('canvas'); ink.id = 'k-ink'; document.body.appendChild(ink); iq = ink.getContext('2d');
    pad = document.createElement('div'); pad.id = 'k-sealpad';
    pad.innerHTML = `<style>#k-ink{position:fixed;inset:0;width:100vw;height:100vh;z-index:6;pointer-events:none}
      #k-sealpad{position:fixed;right:232px;bottom:0;width:196px;height:146px;z-index:5;touch-action:none;background:radial-gradient(ellipse 60% 70% at 50% 100%,rgba(16,12,26,.38),rgba(16,12,26,.14) 55%,rgba(16,12,26,0) 100%);transition:background .2s}
      #k-sealpad .k{position:absolute;inset:0;display:grid;place-items:center;padding-top:30px;font:400 46px 'Potta One',serif;color:rgba(247,241,222,.13);pointer-events:none}
      #k-sealpad .hint{position:absolute;left:0;right:0;bottom:6px;text-align:center;font:800 11px 'M PLUS Rounded 1c',sans-serif;color:rgba(255,244,220,.75);text-shadow:0 1px 2px #000;pointer-events:none}
      #k-chips{position:fixed;left:8px;bottom:6px;z-index:5;display:flex;gap:3px;pointer-events:none;opacity:.88}
      #k-chips .chip{position:relative;width:28px;height:28px;border-radius:8px;background:#2a1a10;border:2px solid #6a3a1e;overflow:hidden}#k-chips .chip canvas{width:100%;height:100%;display:block}
      #k-chips .chip b{position:absolute;right:-1px;bottom:-2px;font:900 12px 'M PLUS Rounded 1c',sans-serif;color:#fff4dc;text-shadow:0 0 3px #000,0 0 2px #000;line-height:1}
      #k-chips .chip i{position:absolute;left:0;right:0;bottom:0;background:rgba(10,8,14,.72)}#k-chips .chip.no{filter:grayscale(1) brightness(.7)}
      #k-sealpad.on{background:radial-gradient(ellipse 60% 70% at 50% 100%,rgba(40,110,210,.34),rgba(40,110,210,.1) 55%,rgba(40,110,210,0) 100%)}
      body.compact #k-sealpad{right:226px;width:172px;height:124px}body.compact #k-sealpad .k{font-size:38px}body.compact #k-chips .chip{width:22px;height:22px}body.compact #k-chips .chip b{font-size:10px}</style>
      <div class="k">印</div><div class="hint">Dessine un signe</div>`;
    document.body.appendChild(pad); const cb = document.createElement('div'); cb.id = 'k-chips'; document.body.appendChild(cb);
    const fit = () => { const d = devicePixelRatio || 1; ink.width = innerWidth * d; ink.height = innerHeight * d; }; fit(); addEventListener('resize', fit);
    pad.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (stroke || !O.active()) return; stroke = { id: e.pointerId, pts: [[e.clientX, e.clientY]] }; try { pad.setPointerCapture(e.pointerId); } catch (er) {} pad.classList.add('on'); trail = null; loopInk(); });
    pad.addEventListener('pointermove', e => { if (!stroke || e.pointerId !== stroke.id) return; const l = stroke.pts[stroke.pts.length - 1]; if (Math.hypot(e.clientX - l[0], e.clientY - l[1]) > 2) stroke.pts.push([e.clientX, e.clientY]); });
    const end = e => { if (!stroke || e.pointerId !== stroke.id) return; const pts = stroke.pts; stroke = null; pad.classList.remove('on');
      const r = recognize(pts); let ok = false; if (r) ok = O.cast(r.id, r.dir); trail = { pts, t0: performance.now() / 1000, col: ok ? 'gold' : 'fail' };
      if (!r) O.fail && O.fail(pts.length > 4 && len(pts) > 30 ? 'Signe non reconnu' : null); pad.querySelector('.hint').style.opacity = ok ? 0 : 1; };
    pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
    setInterval(chips, 120); }
  let lastKey = '';
  function chips() { if (!pad) return; const vis = O.visible(); pad.style.display = vis ? 'block' : 'none'; const box = document.getElementById('k-chips'); box.style.display = vis ? 'flex' : 'none'; if (!vis) return; const L = O.skills(), key = L.map(s => s.id).join();
    if (key !== lastKey) { lastKey = key; box.innerHTML = ''; for (const s of L) { const c = document.createElement('div'); c.className = 'chip'; c.dataset.id = s.id; c.appendChild(O.icon(s.id)); c.insertAdjacentHTML('beforeend', `<i></i><b>${GLYPH[s.id]}</b>`); box.appendChild(c); } }
    for (const s of L) { const c = box.querySelector(`[data-id="${s.id}"]`); if (!c) continue; c.classList.toggle('no', !s.ready); c.querySelector('i').style.height = (s.cd * 100) + '%'; } }
  function loopInk() { if (loopInk.on) return; loopInk.on = true; const f = () => { const d = devicePixelRatio || 1, g = iq, now = performance.now() / 1000; g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
      const P = stroke ? stroke.pts : trail ? trail.pts : null; let a = 1, col = '#8fd0ff', glow = '#3a9cff';
      if (!stroke && trail) { const k = (now - trail.t0) / .45; a = 1 - k; if (trail.col === 'gold') { col = '#fff1b0'; glow = '#ffb020'; } else { col = '#ffb0a0'; glow = '#e2483a'; } if (a <= 0) { trail = null; } }
      if (P && P.length > 1 && a > 0) { g.globalAlpha = a; g.lineJoin = g.lineCap = 'round'; g.shadowColor = glow; g.shadowBlur = 18; g.strokeStyle = glow; g.lineWidth = 10; const jit = trail && trail.col === 'fail' ? Math.sin(now * 80) * 4 * a : 0;
        g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x + jit, y) : g.moveTo(x + jit, y)); g.stroke(); g.shadowBlur = 0; g.strokeStyle = col; g.lineWidth = 4; g.stroke(); g.globalAlpha = 1;
        if (stroke) { const [x, y] = P[P.length - 1]; g.fillStyle = '#fff'; g.shadowColor = glow; g.shadowBlur = 16; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.shadowBlur = 0; } }
      if (stroke || trail) requestAnimationFrame(f); else { g.clearRect(0, 0, innerWidth, innerHeight); loopInk.on = false; } }; requestAnimationFrame(f); }

  return { GLYPH, SEQ, SEALS, TECH, recognize, play, makePad, drawSeal };
})();
