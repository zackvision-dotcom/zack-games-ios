/* Kunai Online — street life and light: wooden utility poles along the streets with sagging cables
   (some carrying festival lantern strings), paper chōchin at house fronts, stone lanterns on the avenue,
   and the day/night cycle (dawn, day, golden dusk, blue night where lanterns and windows really light the street). */
window.KSTREET = (() => {
  const TAU = Math.PI * 2, U = 24;
  let poles = [], cables = [], lanterns = [], lights = [], flies = [];
  const KANJI = ['祭', '酒', '茶', '火', '木', '宿', '飯', '忍'];

  /* ---------- layout (called once by the map, before the collision index is built) ---------- */
  function plan(o) { const { B, add, G, GW, GH, L, R0 } = o, rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(91);
    const cls = (x, y) => { const i = Math.floor(x - L.x0), j = Math.floor(y - L.y0); return i < 0 || j < 0 || i >= GW || j >= GH ? 0 : G[j * GW + i]; };
    const solid = B.filter(b => b.col && !b.shared);
    const hit = (x, y, r) => { for (const b of solid) { if (Math.abs(b.x - x) > 30 || Math.abs(b.y - y) > 50) continue; for (const [dx, dy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) if (b.col(x + dx - b.x, y + dy - b.y)) return true; } return false; };
    const inHouse = (x, y) => { for (const b of solid) { if (!b.shape || Math.abs(b.x - x) > 30 || Math.abs(b.y - y) > 50) continue; if (b.col(x - b.x, y - b.y)) return true; } return false; };
    // poles: roadside path cells, ~13 m apart
    const cand = []; for (let j = 0; j < GH; j += 2) for (let i = 0; i < GW; i += 2) { if (G[j * GW + i] !== 1) continue; const x = i + L.x0 + .5, y = j + L.y0 + .5; if (Math.hypot(x, y) > R0 - 5) continue;
      let edge = false; for (const [dx, dy] of [[2.2, 0], [-2.2, 0], [0, 2.2], [0, -2.2]]) if (cls(x + dx, y + dy) !== 1) edge = true; if (edge) cand.push([x, y, rnd()]); }
    cand.sort((a, b) => a[2] - b[2]);
    for (const [x, y] of cand) { if (poles.length > 95) break; if (poles.some(p => Math.hypot(p.x - x, p.y - y) < 13)) continue; if (Math.abs(x) < 3 && y > 130) continue; if (hit(x, y, .8)) continue;
      const h = 8.6 + rnd() * .8; poles.push({ x, y, h }); add(() => KTOWN.pole({ h }), x, y, { col: (a, b) => a * a + b * b < .14, top: h, pole: true }); }
    // cables: each pole to its two nearest neighbours, never across a roof
    const key = (a, b) => a < b ? a + ':' + b : b + ':' + a, seen = new Set();
    poles.forEach((p, i) => { const nb = poles.map((q, j) => [j, Math.hypot(q.x - p.x, q.y - p.y)]).filter(([j, d]) => j !== i && d < 20).sort((a, b) => a[1] - b[1]).slice(0, 2);
      for (const [j, d] of nb) { const k = key(i, j); if (seen.has(k)) continue; seen.add(k); const q = poles[j]; let over = false;
        for (let t = .1; t < .95; t += .08) if (inHouse(p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t)) { over = true; break; } if (over) continue;
        const c = { a: p, b: q, len: d, sag: .25 + d * .045, n: 2 + (rnd() < .5 ? 1 : 0), fest: d > 7 && rnd() < .38, hue: rnd() };
        cables.push(c);
        if (c.fest) for (let s = 1.6; s < d - 1.4; s += 1.7) { const t = s / d; lanterns.push({ cable: c, t, size: .75, red: rnd() < .55, kan: KANJI[(rnd() * KANJI.length) | 0], ph: rnd() * TAU }); } } });
    // paper chōchin at house fronts (under the first eave), a pair for the bigger ones
    for (const b of B) { const sh = b.shape; if (!sh || sh[0] !== 'h' || rnd() > .5) continue; const w = sh[1], pair = w > 8 && rnd() < .5, red = rnd() < .6, kan = KANJI[(rnd() * KANJI.length) | 0];
      for (const sx of pair ? [-1.4, 1.4] : [w / 2 - .8]) { const x = b.x + sx, y = b.y + .95; lanterns.push({ x, y, z: 2.6, size: 1.05, red, kan, ph: rnd() * TAU }); lights.push({ x, y, z: 2.2, r: 5, k: .8, warm: 1 }); } }
    // lit windows (a soft glow in front of every house at night)
    for (const b of B) { const sh = b.shape; if (!sh) continue; if (sh[0] === 'h') lights.push({ x: b.x, y: b.y + .5, z: 1.4, r: Math.min(6, sh[1] * .45 + 1.5), k: .42, warm: .6 }); else if (sh[0] === 'c') lights.push({ x: b.x, y: b.y + sh[1] * .7, z: 1.4, r: sh[1] * .7, k: .4, warm: .6 }); }
    // stone lanterns along the main avenue
    for (let y = 136; y > -50; y -= 12) for (const x of [-6.5, 6.5]) { if (cls(x, y) === 2 || hit(x, y, .9)) continue; add(() => KTOWN.lantern(), x, y, { col: (a, b) => a * a + b * b < .5 }); lights.push({ x, y, z: 1.3, r: 5.5, k: .85, warm: 1, stone: true }); }
    for (const c of cables) if (c.fest) lights.push({ cable: c, r: c.len * .55, k: .55, warm: 1 });
    for (let i = 0; i < 40; i++) flies.push({ x: 0, y: 0, z: .6, ph: Math.random() * TAU, sp: .5 + Math.random(), on: false });
    return { poles: poles.length, cables: cables.length, lanterns: lanterns.length };
  }

  /* ---------- clock ---------- */
  const DAY = 840;   // seconds for 24 h
  let tod = 9; try { const v = parseFloat(localStorage.getItem('kunai-time')); if (v >= 0 && v < 24) tod = v; } catch (e) {}
  let saveT = 0;
  let frozen = false;
  function tick(dt) { if (frozen) return; tod = (tod + dt * 24 / DAY) % 24; if ((saveT += dt) > 10) { saveT = 0; try { localStorage.setItem('kunai-time', tod.toFixed(3)); } catch (e) {} } }
  const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const night = () => tod < 12 ? 1 - sm(4.6, 7, tod) : sm(18, 20.6, tod);              // 0 day … 1 deep night
  const golden = () => Math.max(Math.exp(-((tod - 6.2) ** 2) / .8), Math.exp(-((tod - 18.6) ** 2) / 1.1));
  const clock = () => { const h = Math.floor(tod), m = Math.floor((tod - h) * 60 / 10) * 10; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };

  /* ---------- runtime drawing ---------- */
  function cablePt(c, i, t, A, wind) { const off = [-1, .35, 1][i] * .9, x = c.a.x + off + (c.b.x - c.a.x) * t, y = c.a.y + (c.b.y - c.a.y) * t, z0 = c.a.h - .55, z1 = c.b.h - .55,
      s = 4 * t * (1 - t), z = z0 + (z1 - z0) * t - c.sag * s; return [x + wind * s * .25, y, z]; }
  function sortItems(Ls, vis, A) { for (const c of cables) if (vis(c.a.x, c.a.y) || vis(c.b.x, c.b.y)) Ls.push({ y: Math.max(c.a.y, c.b.y) + .15, street: c, kind: 'cable' });
    for (const l of lanterns) { const x = l.cable ? l.cable.a.x + (l.cable.b.x - l.cable.a.x) * l.t : l.x, y = l.cable ? l.cable.a.y + (l.cable.b.y - l.cable.a.y) * l.t : l.y; if (vis(x, y)) Ls.push({ y: (l.cable ? Math.max(l.cable.a.y, l.cable.b.y) + .2 : y + .05), street: l, kind: 'lantern' }); } }
  // blackout: lanterns within `black.r` of the source turn black, with a purple flame
  const black = { x: 0, y: 0, r: 0 }; const isBlack = (x, y) => black.r > 0 && Math.hypot(x - black.x, y - black.y) < black.r;
  function drawLantern(g, A, l, t, x, y, z) { if (isBlack(x, y)) { const p = A.toS(x, y), S = l.size * A.PM * .5, top = p[1] - z * A.CP * A.PM; g.save(); g.translate(p[0], top + S * .35);
      g.shadowColor = 'rgba(150,60,220,.9)'; g.shadowBlur = 14; g.fillStyle = '#1a1020'; g.strokeStyle = '#7a3ab0'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, S * .58, S * .62, S * .52, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.shadowBlur = 0;
      g.fillStyle = 'rgba(170,90,255,' + (.5 + .3 * Math.sin(t * 12 + l.ph)) + ')'; g.beginPath(); g.ellipse(0, S * .2, S * .14, S * .3, 0, 0, Math.PI * 2); g.fill(); g.restore(); return; }
    const n = night(), p = A.toS(x, y), w = A.wind(t, x, y), sw = Math.sin(t * 1.7 + l.ph) * .08 + w * .05, S = l.size * A.PM * .5;
    const top = p[1] - z * A.CP * A.PM; g.save(); g.translate(p[0], top); g.rotate(sw);
    g.strokeStyle = '#2a2230'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, S * .35); g.stroke();
    g.translate(0, S * .35); const bw = S * .62, bh = S * 1.05, lit = n > .25;
    const body = l.red ? (lit ? '#ff6a3a' : '#cf3a2a') : (lit ? '#fff0c0' : '#f2ead2');
    if (lit) { const G = bw * 2.6; g.globalAlpha = n; g.drawImage(l.red ? GLOW_R : GLOW_W, -G, bh * .55 - G, G * 2, G * 2); g.globalAlpha = 1; }
    g.fillStyle = body; g.strokeStyle = '#2a2230'; g.lineWidth = 1.3; g.beginPath(); g.ellipse(0, bh * .55, bw, bh * .5, 0, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = l.red ? 'rgba(90,20,15,.45)' : 'rgba(120,100,70,.4)'; g.lineWidth = .7; for (let k = 1; k < 5; k++) { const yy = bh * .55 + (k - 2.5) * bh * .19, hw = bw * Math.sqrt(Math.max(0, 1 - ((yy - bh * .55) / (bh * .5)) ** 2)); g.beginPath(); g.moveTo(-hw, yy); g.lineTo(hw, yy); g.stroke(); }
    g.fillStyle = '#2a2230'; g.fillRect(-bw * .55, bh * .02, bw * 1.1, bh * .12); g.fillRect(-bw * .55, bh * .96, bw * 1.1, bh * .12);
    if (S > 9) { g.fillStyle = l.red ? '#2a1410' : '#b8322a'; g.font = '400 ' + Math.round(bh * .42) + 'px "Potta One",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(l.kan, 0, bh * .57); g.textAlign = 'start'; g.textBaseline = 'alphabetic'; }
    if (l.red || n > .2) { g.strokeStyle = '#2a2230'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, bh * 1.08); g.lineTo(0, bh * 1.3); g.stroke(); }
    g.restore(); }
  function drawItem(g, it, t, A) {
    if (it.kind === 'cable') { const c = it.street, w = A.wind(t, (c.a.x + c.b.x) / 2, (c.a.y + c.b.y) / 2); g.strokeStyle = 'rgba(34,30,40,.9)'; g.lineWidth = 1.15;
      for (let i = 0; i < c.n; i++) { g.beginPath(); for (let k = 0; k <= 14; k++) { const [x, y, z] = cablePt(c, i, k / 14, A, w * (1 + i * .15)), p = A.toS(x, y); const sy = p[1] - z * A.CP * A.PM; k ? g.lineTo(p[0], sy) : g.moveTo(p[0], sy); } g.stroke(); }
      if (c.fest) { g.strokeStyle = 'rgba(60,40,30,.85)'; g.lineWidth = .9; g.beginPath(); for (let k = 0; k <= 14; k++) { const [x, y, z] = cablePt(c, 1, k / 14, A, w), p = A.toS(x, y), sy = p[1] - (z - .45) * A.CP * A.PM; k ? g.lineTo(p[0], sy) : g.moveTo(p[0], sy); } g.stroke(); }
      return; }
    const l = it.street; if (l.cable) { const w = A.wind(t, l.cable.a.x, l.cable.a.y), [x, y, z] = cablePt(l.cable, 1, l.t, A, w); drawLantern(g, A, l, t, x, y, z - .45); } else drawLantern(g, A, l, t, l.x, l.y, l.z); }

  /* ---------- light: dusk tint, night darkness with lit holes, glows, fireflies ---------- */
  const NB = document.createElement('canvas');
  const sprite = stops => { const c = document.createElement('canvas'); c.width = c.height = 128; const q = c.getContext('2d'), gr = q.createRadialGradient(64, 64, 0, 64, 64, 64); for (const [o, col] of stops) gr.addColorStop(o, col); q.fillStyle = gr; q.fillRect(0, 0, 128, 128); return c; };
  const HOLE = sprite([[0, 'rgba(0,0,0,1)'], [.5, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]), GLOW = sprite([[0, 'rgba(255,170,80,1)'], [1, 'rgba(255,120,40,0)']]),
    GLOW_R = sprite([[0, 'rgba(255,120,50,.9)'], [1, 'rgba(255,120,50,0)']]), GLOW_W = sprite([[0, 'rgba(255,220,140,.9)'], [1, 'rgba(255,220,140,0)']]);
  const LP = { on: false, s: {} }; let lpt = 0; const lm = k => { if (!LP.on) return; const t = performance.now(); LP.s[k] = (LP.s[k] || 0) + t - lpt; lpt = t; };
  function drawLight(g, A, t, vx0, vy0, vw, vh) { lpt = performance.now(); const n = night(), gold = golden(); if (n < .02 && gold < .05) return;
    const W = g.canvas.width, H = g.canvas.height, M = g.getTransform(), toScr = (x, y, z) => { const p = A.toS(x, y); return [M.a * p[0] + M.e, M.d * (p[1] - z * A.CP * A.PM) + M.f]; }, sc = M.a;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    if (gold > .05) { g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,140,60,${gold * .55})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(255,150,80,${gold * .08})`; g.fillRect(0, 0, W, H); }
    if (n > .02) { const NW = Math.ceil(W / 2), NH = Math.ceil(H / 2); if (NB.width !== NW || NB.height !== NH) { NB.width = NW; NB.height = NH; } const q = NB.getContext('2d'); q.setTransform(.5, 0, 0, .5, 0, 0); q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, W, H);
      q.fillStyle = `rgba(8,14,40,${n * .64})`; q.fillRect(0, 0, W, H); q.globalCompositeOperation = 'destination-out';
      const vis = (x, y) => x > vx0 / A.PM - 10 && x < (vx0 + vw) / A.PM + 10 && y > vy0 / (A.SP * A.PM) - 10 && y < (vy0 + vh) / (A.SP * A.PM) + 12;
      const hole = (x, y, z, r, k) => { const [sx, sy] = toScr(x, y, z), R = r * A.PM * sc; q.globalAlpha = Math.min(1, k); q.drawImage(HOLE, sx - R, sy - R * .8, R * 2, R * 1.6); q.globalAlpha = 1; };
      for (let i = 0; i < lights.length; i++) { const L = lights[i]; let x = L.x, y = L.y, z = L.z; if (L.cable) { x = (L.cable.a.x + L.cable.b.x) / 2; y = (L.cable.a.y + L.cable.b.y) / 2; z = 7; } if (!vis(x, y)) continue; if (isBlack(x, y)) continue; hole(x, y, z * .3, L.r, L.k * (.93 + .07 * Math.sin(t * 9 + i))); }
      hole(A.hero.x, A.hero.y, .5, 6.5, .5); lm('holes');
      g.drawImage(NB, 0, 0, W, H); lm('composite');
      // warm glow around the flames
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < lights.length; i++) { const L = lights[i]; if (L.cable || !vis(L.x, L.y) || L.k < .6 || isBlack(L.x, L.y)) continue; const [sx, sy] = toScr(L.x, L.y, L.z), R = L.r * .55 * A.PM * sc, f = .92 + .08 * Math.sin(t * 11 + i * 1.7);
        g.globalAlpha = .38 * n * f; g.drawImage(GLOW, sx - R, sy - R, R * 2, R * 2); } g.globalAlpha = 1; lm('glows');
      // fireflies near the hero, over grass and water
      for (const F of flies) { if (!F.on || Math.hypot(F.x - A.hero.x, F.y - A.hero.y) > 22) { F.x = A.hero.x + (Math.random() - .5) * 36; F.y = A.hero.y + (Math.random() - .5) * 26; F.on = true; }
        F.ph += .016 * F.sp; F.x += Math.sin(F.ph * 1.3) * .02; F.y += Math.cos(F.ph) * .015; const a = Math.max(0, Math.sin(F.ph * 2.2)) * n; if (a < .05) continue;
        const [sx, sy] = toScr(F.x, F.y, .8 + Math.sin(F.ph) * .4), R = 7 * sc, gr = g.createRadialGradient(sx, sy, 0, sx, sy, R); gr.addColorStop(0, `rgba(230,255,140,${a})`); gr.addColorStop(1, 'rgba(180,255,90,0)'); g.fillStyle = gr; g.fillRect(sx - R, sy - R, R * 2, R * 2); }
      g.globalCompositeOperation = 'source-over'; lm('flies'); }
    g.restore(); }
  return { LP, freeze: v => { frozen = v; }, black, plan, tick, night, golden, clock, sortItems, drawItem, drawLight, get tod() { return tod; }, set tod(v) { tod = v; }, stats: () => ({ poles: poles.length, cables: cables.length, lanterns: lanterns.length, lights: lights.length }) };
})();
