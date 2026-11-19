/* BRAISE — Les lieux de la lignée. One landmark per era, drawn as large ink set pieces.
   Each function draws with its base centred on (0,0), y up negative.
   Requires ink.js (ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, lineageMark, mulberry, vnoise, lerp, TAU, INK)
   and era1.js (burningTree) for the Olduvai scene. */
window.BraiseLandmarkSets = (() => {
  const R = s => mulberry(s);
  /* pen hatching with a ragged leading edge, like strokes laid by hand */
  function rag(g, x0, y0, x1, y1, col, sp, seed) {
    const r = R(seed || 5), h = y1 - y0, k = .62; g.strokeStyle = col || 'rgba(30,20,12,.38)'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath();
    for (let x = x0 - h * k; x < x1; x += (sp || 3.4)) { const xs = x0 + r() * 26, a = Math.max(0, (xs - x) / (h * k)), b = Math.min(1, (x1 - x) / (h * k)); if (a >= b) continue; const len = b - (r() * .12); g.moveTo(x + h * k * a, y1 - h * a); g.lineTo(x + h * k * len, y1 - h * len); }
    g.stroke();
  }
  /* fill + optional ragged hatch box + ink outline */
  function sh(g, fn, fill, o) {
    o = o || {}; fn(); g.fillStyle = fill; g.fill();
    if (o.hatch || o.extra) { g.save(); fn(); g.clip(); if (o.hatch) rag(g, o.hatch[0], o.hatch[1], o.hatch[2], o.hatch[3], o.hc, o.sp, o.seed); if (o.extra) o.extra(); g.restore(); }
    if (o.lw !== 0) { fn(); ink(g, o.lw || 2.2); }
  }
  const block = (g, x, y, w, h, col, lw) => { g.beginPath(); g.rect(x, y, w, h); fillInk(g, col, lw || 1.6); };
  const cloud = (g, x, y, s, a) => { g.save(); g.globalAlpha = a == null ? .9 : a; for (let i = 0; i < 5; i++) { ell(g, x + (i - 2) * 16 * s, y - Math.sin(i / 4 * Math.PI) * 9 * s, 18 * s, 11 * s); g.fillStyle = '#f3ead6'; g.fill(); } g.restore(); };

  /* I · Olduvai gorge under Kilimanjaro (broad flat-topped Kibo, jagged Mawenzi) */
  function olduvai(g, t) {
    t = t || 0;
    const mt = () => { g.beginPath(); g.moveTo(-330, -40); g.quadraticCurveTo(-230, -90, -150, -150); g.quadraticCurveTo(-110, -182, -60, -192); g.lineTo(40, -194); g.quadraticCurveTo(80, -186, 110, -164); g.lineTo(150, -168); g.lineTo(166, -186); g.lineTo(180, -170); g.lineTo(194, -182); g.lineTo(206, -160); g.quadraticCurveTo(260, -110, 330, -46); g.closePath(); };
    sh(g, mt, '#8f8ba3', { hatch: [60, -196, 330, -40], hc: 'rgba(40,35,60,.28)', lw: 2 });
    const snow = () => { g.beginPath(); g.moveTo(-96, -180); g.quadraticCurveTo(-70, -192, -60, -192); g.lineTo(40, -194); g.quadraticCurveTo(70, -188, 92, -174); g.lineTo(76, -170); g.lineTo(64, -180); g.lineTo(48, -168); g.lineTo(30, -182); g.lineTo(12, -166); g.lineTo(-6, -182); g.lineTo(-26, -170); g.lineTo(-44, -184); g.lineTo(-62, -170); g.lineTo(-78, -182); g.closePath(); };
    sh(g, snow, '#f2efe8', { hatch: [10, -196, 96, -164], hc: 'rgba(100,110,140,.35)', lw: 1.8 });
    poly(g, [[160, -178], [166, -186], [172, -176]]); fillInk(g, '#f2efe8', 1.2);
    cloud(g, -170 + Math.sin(t * .1) * 20, -140, 1.2, .85); cloud(g, 200 + Math.sin(t * .08 + 2) * 18, -122, 1, .8); cloud(g, -10 + Math.sin(t * .06 + 4) * 30, -206, .8, .7);
    g.beginPath(); g.rect(-340, -42, 680, 46); g.fillStyle = '#c9a85a'; g.fill();
    for (const [x, s] of [[-270, .55], [-140, .4], [200, .5], [270, .35], [120, .3]]) { g.save(); g.translate(x, -40); g.scale(s, s); acaciaSil(g); g.restore(); }
    // stratified gorge walls
    const bands = ['#b8673a', '#d9a066', '#9c4f2c', '#e0b878', '#a85a34'];
    for (const side of [-1, 1]) {
      const edge = (i, off) => { const pts = []; for (let x = 340; x >= 46; x -= 14) pts.push([side * x, -38 + i * 7.5 + off + Math.sin(x * .07 + i) * 2.4 + (x < 110 ? (110 - x) * .45 : 0)]); return pts; };
      for (let i = 0; i < bands.length; i++) { const a = edge(i, 0), b = edge(i, 8).reverse(); g.beginPath(); g.moveTo(a[0][0], a[0][1]); for (const p of a) g.lineTo(p[0], p[1]); for (const p of b) g.lineTo(p[0], p[1]); g.closePath(); g.fillStyle = bands[i]; g.fill(); }
      const top = edge(0, 0); g.beginPath(); g.moveTo(top[0][0], top[0][1]); for (const p of top) g.lineTo(p[0], p[1]); ink(g, 2.2);
      g.save(); g.beginPath(); for (const p of top) g.lineTo(p[0], p[1]); const bot = edge(4, 8).reverse(); for (const p of bot) g.lineTo(p[0], p[1]); g.closePath(); g.clip(); rag(g, side > 0 ? 46 : -340, -40, side > 0 ? 340 : -46, 30, 'rgba(60,25,10,.25)', 5, 3); g.restore();
    }
    g.beginPath(); g.moveTo(-70, 16); g.quadraticCurveTo(0, -6, 70, 16); g.closePath(); g.fillStyle = '#8a5a34'; g.fill();
    g.save(); g.translate(0, 2); g.scale(.62, .62); burningTree(g, t, false); g.restore();
  }
  function acaciaSil(g) { line(g, [[0, 0], [-2, -40], [-18, -62]], 5, '#4a3c2c'); line(g, [[-2, -40], [14, -66]], 4, '#4a3c2c'); ell(g, -2, -70, 44, 8); g.fillStyle = '#5e6634'; g.fill(); ell(g, 4, -76, 30, 6); g.fill(); }

  /* II · Lascaux — the painted wall, lit by a torch */
  function lascaux(g, t) {
    t = t || 0;
    const wall = () => { g.beginPath(); g.moveTo(-420, 10); g.lineTo(-420, -120); g.bezierCurveTo(-360, -230, -220, -250, -60, -250); g.bezierCurveTo(120, -252, 300, -232, 420, -170); g.lineTo(420, 10); g.closePath(); };
    sh(g, wall, '#cdb48c', { hatch: [180, -260, 430, 10], hc: 'rgba(60,40,20,.2)', sp: 4, lw: 2.6 });
    g.strokeStyle = 'rgba(90,65,40,.38)'; g.lineWidth = 1.2; const r = R(31); for (let i = 0; i < 16; i++) { g.beginPath(); const x = -380 + r() * 760, y = -40 - r() * 180; g.arc(x, y, 14 + r() * 26, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); }
    g.save(); g.globalCompositeOperation = 'multiply'; const fl = .86 + Math.sin(t * 9) * .05 + vnoise(t * 4, 1, 3) * .1; const gr = g.createRadialGradient(-60, -70, 20, -60, -70, 420 * fl); gr.addColorStop(0, 'rgba(255,222,175,1)'); gr.addColorStop(1, 'rgba(110,72,52,1)'); g.fillStyle = gr; wall(); g.fill(); g.restore();
    aurochs(g, -170, -160, 1.25); horse(g, 40, -180, .95, '#2a1d16'); horse(g, 130, -122, .8, '#9c3a20'); stag(g, -40, -98, .9); horse(g, 250, -186, .7, '#b5452b'); aurochs(g, 330, -110, .7);
    g.fillStyle = '#2a1d16'; for (let i = 0; i < 9; i++) { ell(g, 180 + i * 9, -64 + Math.sin(i) * 4, 2.6, 2.6); g.fill(); }
    for (const [x, y, a] of [[-320, -96, -.2], [-286, -62, .15], [300, -50, .1]]) handStencil(g, x, y, a);
    for (let i = 0; i < 13; i++) { poly(g, blobPts(-400 + i * 66 + r() * 20, 2, 12 + r() * 8, 7, 7, .35, r)); fillInk(g, '#a8957a', 1.5); }
  }
  function aurochs(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(30,20,14,.85)'; g.beginPath(); g.moveTo(-70, 0); g.bezierCurveTo(-74, -30, -40, -40, -10, -36); g.bezierCurveTo(20, -44, 50, -40, 64, -22); g.lineTo(80, -24); g.quadraticCurveTo(84, -12, 70, -8); g.quadraticCurveTo(50, 6, 30, 4); g.lineTo(28, 30); g.lineTo(20, 30); g.lineTo(16, 8); g.lineTo(-40, 8); g.lineTo(-46, 30); g.lineTo(-54, 30); g.lineTo(-56, 6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(30,20,14,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(70, -26); g.quadraticCurveTo(76, -46, 90, -48); g.moveTo(66, -26); g.quadraticCurveTo(64, -50, 52, -56); g.stroke(); g.fillStyle = 'rgba(181,69,43,.55)'; ell(g, -10, -14, 30, 12); g.fill(); g.restore(); }
  function horse(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.globalAlpha = .82; g.beginPath(); g.moveTo(-50, 0); g.bezierCurveTo(-52, -26, -20, -30, 10, -28); g.quadraticCurveTo(30, -46, 46, -48); g.quadraticCurveTo(58, -44, 56, -34); g.quadraticCurveTo(44, -32, 38, -20); g.quadraticCurveTo(30, 0, 20, 4); g.lineTo(18, 26); g.lineTo(12, 26); g.lineTo(8, 6); g.lineTo(-30, 6); g.lineTo(-36, 26); g.lineTo(-42, 26); g.lineTo(-44, 4); g.quadraticCurveTo(-60, 0, -64, 14); g.quadraticCurveTo(-60, -4, -50, 0); g.closePath(); g.fill(); g.globalAlpha = 1; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 6; i++) { g.moveTo(14 + i * 5, -34 - i * 2.4); g.lineTo(20 + i * 5, -42 - i * 2); } g.stroke(); g.restore(); }
  function stag(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#2a1d16'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-36, 0); g.quadraticCurveTo(0, -14, 30, -6); g.lineTo(42, -26); g.moveTo(-30, 0); g.lineTo(-32, 24); g.moveTo(-20, 2); g.lineTo(-18, 24); g.moveTo(20, -2); g.lineTo(22, 24); g.moveTo(28, -4); g.lineTo(32, 24); g.moveTo(42, -26); g.lineTo(54, -22); g.stroke(); g.lineWidth = 1.8; g.beginPath(); for (const sd of [-1, 1]) { g.moveTo(42, -28); g.quadraticCurveTo(36 + sd * 8, -50, 30 + sd * 16, -64); for (let k = 0; k < 3; k++) { const yy = -40 - k * 8; g.moveTo(38 + sd * (4 + k * 3), yy); g.lineTo(30 + sd * (10 + k * 4), yy - 6); } } g.stroke(); g.restore(); }
  function handStencil(g, x, y, a) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(181,69,43,.4)'; ell(g, 0, 0, 30, 34); g.fill(); g.fillStyle = '#e8d6b0'; ell(g, 0, 6, 10, 12); g.fill(); for (let i = 0; i < 4; i++) { ell(g, -7 + i * 4.6, -12 - (i === 1 || i === 2 ? 4 : 0), 2.2, 9); g.fill(); } ell(g, 11, 2, 2.2, 7, -.8); g.fill(); g.restore(); }

  /* III · Stonehenge at the solstice */
  function stonehenge(g, t) {
    const r = R(51); g.fillStyle = 'rgba(27,22,18,.15)'; ell(g, 0, -6, 300, 40); g.fill();
    const sarsen = (x, y, w, h, tilt, col) => { g.save(); g.translate(x, y); g.rotate(tilt || 0); const p = () => { g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2 + 2, -h); g.quadraticCurveTo(0, -h - 4, w / 2 - 2, -h); g.lineTo(w / 2, 0); g.closePath(); }; sh(g, p, col || '#a8a49a', { hatch: [0, -h - 4, w / 2 + 2, 2], hc: 'rgba(25,25,25,.4)', seed: x | 0 }); g.fillStyle = 'rgba(160,170,90,.55)'; for (let i = 0; i < 3; i++) { ell(g, (r() - .5) * w * .7, -r() * h, 3 + r() * 3, 2 + r() * 2); g.fill(); } g.strokeStyle = 'rgba(40,40,40,.35)'; g.lineWidth = .9; g.beginPath(); g.moveTo(-w * .2, -h * .2); g.lineTo(-w * .15, -h * .8); g.stroke(); g.restore(); };
    const lintel = (x0, x1, y, h) => sh(g, () => { g.beginPath(); g.moveTo(x0 - 3, y); g.lineTo(x0 - 1, y - h); g.lineTo(x1 + 1, y - h); g.lineTo(x1 + 3, y); g.closePath(); }, '#b4b0a5', { hatch: [x0, y - h, x1, y], hc: 'rgba(25,25,25,.3)', seed: x0 | 0 });
    // the rising sun between the great trilithon
    g.save(); g.globalCompositeOperation = 'lighter'; const sun = g.createRadialGradient(0, -90, 4, 0, -90, 140); sun.addColorStop(0, 'rgba(255,230,170,.9)'); sun.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = sun; g.fillRect(-160, -240, 320, 240); g.restore();
    for (let i = 0; i < 9; i++) sarsen(-200 + i * 50, -36, 22, 60, 0, '#99958c'); lintel(-212, 212, -96, 10);
    for (const [x, y, h] of [[-112, -12, 92], [-72, -12, 92], [72, -12, 100], [112, -12, 100], [-22, -22, 116], [22, -22, 116]]) sarsen(x, y, 30, h);
    lintel(-128, -56, -104, 14); lintel(56, 128, -112, 14); lintel(-38, 38, -138, 16);
    for (let i = 0; i < 8; i++) { if (i === 3) continue; sarsen(-245 + i * 70, 8, 26, 72); }
    lintel(-258, -162, -64, 12); lintel(150, 250, -64, 12);
    g.save(); g.translate(-30, 10); g.rotate(-.1); sh(g, () => { g.beginPath(); g.moveTo(-50, 0); g.lineTo(-48, -20); g.lineTo(50, -22); g.lineTo(52, 0); g.closePath(); }, '#a8a49a', { hatch: [-50, -22, 52, 2] }); g.restore();
    sarsen(272, 12, 34, 56, .18, '#9c9284'); for (let i = 0; i < 7; i++) sarsen(-150 + i * 50, 18, 12, 22, 0, '#7f8aa0');
  }

  /* IV · Giza — pyramids, the Sphinx, palms of the Nile (building = top unfinished, ramp) */
  function giza(g, t, building) {
    const duneTop = () => { g.moveTo(-420, -4); g.quadraticCurveTo(-200, -26, -60, -12); g.quadraticCurveTo(120, 2, 420, -18); };
    g.beginPath(); duneTop(); g.lineTo(420, 20); g.lineTo(-420, 20); g.closePath(); g.fillStyle = '#e2c690'; g.fill(); g.beginPath(); duneTop(); ink(g, 2);
    const pyr = (x, s, casing, unfinished) => {
      g.save(); g.translate(x, 0); g.scale(s, s);
      g.save(); if (unfinished) { g.beginPath(); g.rect(-200, -100, 400, 120); g.clip(); }
      sh(g, () => poly(g, [[-120, 0], [0, -150], [0, 0]]), '#dcc088', { lw: 0 });
      sh(g, () => poly(g, [[0, -150], [100, 0], [0, 0]]), '#b48e58', { hatch: [0, -150, 100, 0], hc: 'rgba(70,40,15,.45)', lw: 0, seed: x | 0 });
      g.save(); poly(g, [[-120, 0], [0, -150], [100, 0]]); g.clip(); g.strokeStyle = 'rgba(80,55,25,.32)'; g.lineWidth = .9;
      for (let y = -6; y > -150; y -= 6) { g.beginPath(); g.moveTo(-130, y); g.lineTo(110, y); g.stroke(); for (let xx = -130 + (y % 12 ? 0 : 6); xx < 110; xx += 12) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + 6); g.stroke(); } } g.restore();
      if (casing) { poly(g, [[-22, -122], [0, -150], [19, -126]]); fillInk(g, '#f1e6c8', 1.4); }
      if (unfinished) { poly(g, [[-120, 0], [-40, -100], [33, -100], [100, 0]]); ink(g, 2.4); line(g, [[0, -100], [0, 0]], 1.6, INK); } else { poly(g, [[-120, 0], [0, -150], [100, 0]]); ink(g, 2.4); line(g, [[0, -150], [0, 0]], 1.6, INK); }
      g.restore();
      if (unfinished) {
        sh(g, () => { g.beginPath(); g.moveTo(-190, 0); g.lineTo(-40, -100); g.lineTo(-14, -100); g.lineTo(-150, 0); g.closePath(); }, '#c7a56e', { hatch: [-190, -100, -14, 0], hc: 'rgba(70,40,15,.35)' });
        for (let i = 0; i < 6; i++) { const k = i / 6, xx = lerp(-168, -40, k), yy = lerp(-12, -96, k); block(g, xx - 6, yy - 8, 12, 8, '#e2cc98', 1.2); }
        for (const xx of [-22, 0, 22]) line(g, [[xx, -100], [xx, -120]], 1.6, '#6a4a2a'); line(g, [[-26, -116], [26, -116]], 1.4, '#6a4a2a');
        poly(g, [[-6, -126], [0, -138], [6, -126]]); fillInk(g, '#f6e2a0', 1.2); // the golden capstone waiting
      }
      g.restore();
    };
    for (const xx of [270, 300, 328]) pyr(xx, .16, false);
    pyr(-230, .55, false); pyr(160, .86, true); pyr(-40, 1.08, false, !!building);
    sphinx(g, 78, 30, 1.05);
    for (const [xx, s] of [[-330, .85], [-298, .62], [340, .75], [370, .55]]) palm(g, xx, 14, s);
  }
  function sphinx(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    sh(g, () => { g.beginPath(); g.moveTo(-104, 0); g.quadraticCurveTo(-108, -22, -88, -30); g.quadraticCurveTo(-40, -36, 4, -34); g.lineTo(18, -30); g.lineTo(18, 0); g.closePath(); }, '#c9a46c', { hatch: [-104, -36, 18, 2], hc: 'rgba(70,40,15,.38)' });
    inkCurve(g, [[-104, -10], [-118, -14], [-116, -2]], 3, '#c9a46c', 1.4);
    for (const [px, w] of [[14, 46], [20, 40]]) sh(g, () => { g.beginPath(); g.moveTo(px, -12); g.lineTo(px + w, -12); g.quadraticCurveTo(px + w + 6, -6, px + w, 0); g.lineTo(px, 0); g.closePath(); }, '#cfab72', { lw: 1.6 });
    // nemes headdress with stripes, face, beard-less, broken nose
    const head = () => { g.beginPath(); g.moveTo(-12, -32); g.lineTo(-16, -60); g.quadraticCurveTo(-4, -84, 16, -80); g.quadraticCurveTo(30, -70, 30, -56); g.lineTo(36, -32); g.closePath(); };
    sh(g, head, '#d6b27c', { extra: () => { g.strokeStyle = 'rgba(70,90,140,.5)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-18 + i * 6, -86); g.lineTo(-16 + i * 6, -30); g.stroke(); } } });
    sh(g, () => { g.beginPath(); g.moveTo(4, -70); g.quadraticCurveTo(22, -72, 26, -60); g.lineTo(28, -44); g.quadraticCurveTo(22, -36, 12, -38); g.lineTo(6, -46); g.closePath(); }, '#e2c08a', { lw: 1.8 });
    ell(g, 17, -60, 3.2, 2.2); g.fillStyle = INK; g.fill(); line(g, [[13, -63], [21, -64]], 1.6, INK);
    line(g, [[27, -54], [29, -50], [26, -49]], 1.4, INK); line(g, [[18, -44], [24, -45]], 1.6, INK);
    g.restore();
  }
  function palm(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); inkCurve(g, [[0, 0], [4, -40], [-2, -80]], 5, '#7a5a3a', 1.6); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i / 6 - .5) * 2.8; g.beginPath(); g.moveTo(-2, -80); g.quadraticCurveTo(-2 + Math.cos(a) * 20, -84 + Math.sin(a) * 18, -2 + Math.cos(a) * 34, -76 + Math.sin(a) * 14); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.4; g.strokeStyle = '#5f7a34'; g.stroke(); } g.restore(); }

  /* V · Rome — the Colosseum in its prime, 80 AD */
  function colosseum(g, t) {
    const W = 270, tiers = [44, 42, 42, 34], sag = 26;
    g.fillStyle = 'rgba(27,22,18,.15)'; ell(g, 0, 6, 296, 30); g.fill();
    // far inner wall and cavea seen above the front façade
    const topY = -tiers.reduce((a, b) => a + b, 0);
    sh(g, () => { g.beginPath(); g.ellipse(0, topY, W, 40, 0, Math.PI, 0); g.lineTo(W, topY + 2); g.ellipse(0, topY + 8, W - 22, 30, 0, 0, Math.PI, true); g.closePath(); }, '#b39c74', { hatch: [60, topY - 42, W, topY + 10], hc: 'rgba(60,40,20,.3)' });
    g.save(); g.beginPath(); g.ellipse(0, topY + 8, W - 22, 30, 0, Math.PI, 0); g.closePath(); g.clip(); g.fillStyle = '#9c8662'; g.fillRect(-W, topY - 30, 2 * W, 40); g.strokeStyle = 'rgba(40,28,14,.5)'; g.lineWidth = 1; for (let k = 1; k < 6; k++) { g.beginPath(); g.ellipse(0, topY + 8 + k * 4, W - 22 - k * 16, 30 - k * 3, 0, Math.PI, 0); g.stroke(); } g.restore();
    let y = 0; const orders = ['tuscan', 'ionic', 'corinthian', 'attic'];
    tiers.forEach((h, k) => {
      const yTop = y - h;
      const band = () => { g.beginPath(); g.moveTo(-W, yTop); g.quadraticCurveTo(0, yTop + sag, W, yTop); g.lineTo(W, y); g.quadraticCurveTo(0, y + sag, -W, y); g.closePath(); };
      sh(g, band, k === 3 ? '#cdb58a' : '#d8c296', { hatch: [W * .35, yTop - 6, W + 4, y + sag], hc: 'rgba(70,45,20,.36)', seed: k + 3, lw: 0 });
      const n = 16;
      for (let i = 0; i < n; i++) {
        const u = -1 + (i + .5) / n * 2, x = u * W * .985, curve = (1 - u * u) * sag, w = (2 * W / n) * (1 - Math.abs(u) * .45) * .62;
        if (orders[k] === 'attic') { if (i % 2 === 0) block(g, x - w * .22, yTop + curve + 12, w * .44, 10, '#3d342a', 1.1); }
        else { const ah = h - 12, ay = y + curve - 3; g.beginPath(); g.moveTo(x - w / 2, ay); g.lineTo(x - w / 2, ay - ah + w / 2); g.arc(x, ay - ah + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, ay); g.closePath(); fillInk(g, '#3d342a', 1.4);
          if (k > 0) { ell(g, x, ay - 8, w * .16, 7); fillInk(g, '#e6dcc4', .9); ell(g, x, ay - 17, w * .12, 3); fillInk(g, '#e6dcc4', .8); }
          const cx = x + (2 * W / n) * (1 - Math.abs(u) * .45) * .5; if (i < n - 1) line(g, [[cx, y + (1 - u * u) * sag - 2], [cx, yTop + curve + 4]], 2.4, k === 2 ? '#efe0be' : '#e5d3ac'); }
      }
      band(); ink(g, 2); y = yTop;
    });
    for (let i = 0; i < 12; i++) { const u = -1 + (i + .5) / 12 * 2, x = u * W * .97, cy = y + (1 - u * u) * sag; line(g, [[x, cy], [x, cy - 16]], 1.6, '#5a4632'); }
    // little banners
    for (const u of [-.5, 0, .5]) { const x = u * W, cy = y + (1 - u * u) * sag - 16; poly(g, [[x, cy], [x + 10, cy + 3], [x, cy + 6]]); fillInk(g, '#a8322e', .8); }
  }

  /* VI · Notre-Dame de Paris, about 1250 (building = south tower in scaffolding, no flèche yet) */
  function notreDame(g, t, building) {
    const S = '#d3c09c', S2 = '#c3ae88', DK = '#2c2e30';
    const W = 120, Hp = 92, Hk = 112, Hr = 206, Hg = 232, Ht = 330; // portals, kings, rose level top, gallery top, towers top
    // nave + flying buttresses behind, to the right
    sh(g, () => poly(g, [[W, -Hr + 20], [W + 30, -Hr - 6], [W + 210, -Hr - 6], [W + 236, -Hr + 20]]), '#5d6870', { hatch: [W, -Hr - 6, W + 236, -Hr + 20], hc: 'rgba(10,15,20,.4)' });
    sh(g, () => { g.beginPath(); g.rect(W, -Hr + 20, 230, Hr - 20); }, '#bba887', { hatch: [W, -Hr + 20, W + 230, 0], hc: 'rgba(60,45,25,.3)' });
    for (let i = 0; i < 5; i++) { const x = W + 26 + i * 44; g.beginPath(); g.moveTo(x - 7, -40); g.lineTo(x - 7, -120); g.quadraticCurveTo(x, -132, x + 7, -120); g.lineTo(x + 7, -40); g.closePath(); fillInk(g, '#3a4a6a', 1.3); inkCurve(g, [[x + 20, -10], [x + 30, -100], [x + 8, -160]], 3, S2, 1.2); }
    if (!building) { line(g, [[W + 120, -Hr - 6], [W + 120, -Hr - 90]], 3, '#4a4f55'); poly(g, [[W + 113, -Hr - 66], [W + 120, -Hr - 104], [W + 127, -Hr - 66]]); fillInk(g, '#5d6870', 1.4); }
    // main façade block
    sh(g, () => { g.beginPath(); g.rect(-W, -Hg, 2 * W, Hg); }, S, { hatch: [W * .35, -Hg, W, 0], hc: 'rgba(60,45,25,.3)' });
    // towers
    const tower = (cx, scaf) => {
      const w = 80, x = cx - w / 2;
      sh(g, () => { g.beginPath(); g.rect(x, -Ht, w, Ht - Hg + 2); }, S, { hatch: [cx + 4, -Ht, x + w, -Hg], hc: 'rgba(60,45,25,.33)', seed: cx | 0 });
      for (let j = 0; j < 2; j++) { const xx = x + 22 + j * 36, top = -Ht + 22; g.beginPath(); g.moveTo(xx - 11, -Hg - 6); g.lineTo(xx - 11, top + 16); g.quadraticCurveTo(xx, top, xx + 11, top + 16); g.lineTo(xx + 11, -Hg - 6); g.closePath(); fillInk(g, DK, 1.6); for (let k = 0; k < 9; k++) line(g, [[xx - 10, top + 22 + k * 7], [xx + 10, top + 25 + k * 7]], 1.2, '#7a7062'); }
      block(g, x - 4, -Ht - 8, w + 8, 8, '#d9c8a4'); for (let k = 0; k < 8; k++) block(g, x - 2 + k * (w + 4) / 8, -Ht - 15, 6, 7, '#d9c8a4', 1);
      for (const dx of [0, w]) line(g, [[x + dx, -Hg], [x + dx, -Ht]], 3, S2);
      if (scaf) { g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.6; g.beginPath(); for (let k = 0; k < 5; k++) { const xx = x - 6 + k * (w + 12) / 4; g.moveTo(xx, -Ht + 60); g.lineTo(xx, -Ht - 44); } for (let k = 0; k < 6; k++) { g.moveTo(x - 8, -Ht - 38 + k * 18); g.lineTo(x + w + 8, -Ht - 38 + k * 18); } g.moveTo(x - 6, -Ht - 38); g.lineTo(x + w + 6, -Ht + 52); g.stroke();
        line(g, [[x + w + 6, -Ht - 44], [x + w + 46, -Ht - 70]], 2.6, '#5a3a20'); line(g, [[x + w + 46, -Ht - 70], [x + w + 46, -Ht - 22]], 1, '#8a7a60'); block(g, x + w + 40, -Ht - 22, 12, 8, '#d9c8a4', 1.2);
        for (let k = 0; k < 3; k++) block(g, x + 10 + k * 22, -Ht - 6, 16, 6, '#d9c8a4', 1); }
    };
    tower(-W + 40, false); tower(W - 40, !!building);
    // gallery of chimeras (open arcade) across the whole façade
    block(g, -W, -Hg, 2 * W, 26, '#cbb791'); for (let i = 0; i < 20; i++) { const x = -W + 6 + i * 12; g.beginPath(); g.moveTo(x, -Hg + 24); g.lineTo(x, -Hg + 10); g.arc(x + 4, -Hg + 10, 4, Math.PI, 0); g.lineTo(x + 8, -Hg + 24); g.closePath(); g.fillStyle = DK; g.fill(); }
    // rose window level: rose + flanking tower windows
    const ry = -(Hk + Hr) / 2 - 4; ell(g, 0, ry, 40, 40); fillInk(g, '#2e3448', 2.6);
    g.save(); g.globalCompositeOperation = 'lighter'; const sp = .5 + Math.sin(t * 1.4) * .15; g.fillStyle = `rgba(80,120,200,${sp * .35})`; ell(g, 0, ry, 36, 36); g.fill(); g.restore();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; line(g, [[Math.cos(a) * 8, ry + Math.sin(a) * 8], [Math.cos(a) * 36, ry + Math.sin(a) * 36]], 1.8, '#c8b48a'); ell(g, Math.cos(a) * 27, ry + Math.sin(a) * 27, 3.6, 3.6); g.fillStyle = ['#b5452b', '#3c5fa0', '#c9a24a'][i % 3]; g.fill(); }
    ell(g, 0, ry, 9, 9); fillInk(g, '#c9a24a', 1.2); ell(g, 0, ry, 44, 44); ink(g, 2);
    for (const cx of [-W + 40, W - 40]) for (const dx of [-14, 14]) { const xx = cx + dx; g.beginPath(); g.moveTo(xx - 8, -Hk - 16); g.lineTo(xx - 8, -Hr + 40); g.quadraticCurveTo(xx, -Hr + 26, xx + 8, -Hr + 40); g.lineTo(xx + 8, -Hk - 16); g.closePath(); fillInk(g, DK, 1.4); }
    // gallery of kings
    block(g, -W, -Hk - 8, 2 * W, 20, S2); for (let i = 0; i < 28; i++) { const x = -W + 6 + i * 8.4; ell(g, x + 2, -Hk + 2, 2.6, 6.4); fillInk(g, '#8a7a5c', .8); }
    // buttresses splitting the façade in three
    for (const x of [-W, -W + 80, W - 80, W]) line(g, [[x, 0], [x, -Hg]], 3.4, S2);
    // three portals with stepped archivolts
    for (const [x, w] of [[-W + 40, 40], [0, 54], [W - 40, 40]]) { g.beginPath(); g.moveTo(x - w / 2, 0); g.lineTo(x - w / 2, -46); g.quadraticCurveTo(x - w / 2, -78, x, -86); g.quadraticCurveTo(x + w / 2, -78, x + w / 2, -46); g.lineTo(x + w / 2, 0); g.closePath(); fillInk(g, '#2a2724', 2); for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - w / 2 - k * 3.4, 0); g.lineTo(x - w / 2 - k * 3.4, -46); g.quadraticCurveTo(x - w / 2 - k * 3.4, -80 - k * 3, x, -88 - k * 3.4); g.quadraticCurveTo(x + w / 2 + k * 3.4, -80 - k * 3, x + w / 2 + k * 3.4, -46); g.lineTo(x + w / 2 + k * 3.4, 0); g.strokeStyle = 'rgba(60,45,25,.55)'; g.lineWidth = 1.2; g.stroke(); } poly(g, [[x - w / 2 + 3, -46], [x, -80], [x + w / 2 - 3, -46]]); fillInk(g, '#b8a37c', 1.2); line(g, [[x, 0], [x, -44]], 1.8, '#8a7a5c'); }
    // gargoyles on tower corners
    for (const x of [-W, -W + 80, W - 80, W]) { g.save(); g.translate(x, -Hg - 4); g.scale(x < 0 ? -1 : 1, 1); poly(g, [[0, 0], [16, -4], [21, 2], [14, 6], [4, 6]]); fillInk(g, '#8a7a5c', 1.2); g.restore(); }
  }

  /* VII · Paris 1889 — the Eiffel Tower on true proportions (building = 1888, stopped at 2nd floor) */
  function eiffel(g, t, building) {
    const P = '#6e5a46', PL = '#9a7f60', H = 330, y1 = -63, y2 = -127, y3 = -304;
    const hw = y => { const u = -y / H; return 6 + 64 * Math.pow(1 - u, 2.15); }; // half-width profile
    const lattice = (fn, x0, ya, x1, yb, sp) => { g.save(); fn(); g.clip(); g.strokeStyle = 'rgba(28,20,14,.72)'; g.lineWidth = .9; g.beginPath(); for (let y = ya; y > yb; y -= sp) { g.moveTo(x0, y); g.lineTo(x1, y - sp); g.moveTo(x1, y); g.lineTo(x0, y - sp); } g.stroke(); g.restore(); };
    // four legs (two visible pairs), curved, to the first platform
    for (const s of [-1, 1]) {
      const leg = () => { g.beginPath(); g.moveTo(s * hw(0), 0); for (let y = 0; y >= y1; y -= 6) g.lineTo(s * hw(y), y); g.lineTo(s * (hw(y1) - 18), y1); for (let y = y1; y <= 0; y += 6) g.lineTo(s * (hw(y) - 26 - (y - y1) * .02), y); g.closePath(); };
      sh(g, leg, P, { lw: 0 }); lattice(leg, s * 80, 0, s * 20, y1, 7); leg(); ink(g, 2);
    }
    // great decorative arch
    g.beginPath(); g.moveTo(-(hw(0) - 26), -2); g.bezierCurveTo(-36, -60, 36, -60, hw(0) - 26, -2); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.4; g.strokeStyle = PL; g.stroke();
    // first platform with its arcade
    block(g, -hw(y1) - 6, y1 - 10, 2 * hw(y1) + 12, 10, PL, 2); for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(-hw(y1) - 2 + i * (2 * hw(y1) + 4) / 12 + 4, y1 - 4, 3.4, Math.PI, 0); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
    // second section: two converging legs to the second platform
    for (const s of [-1, 1]) {
      const sec = () => { g.beginPath(); g.moveTo(s * hw(y1 - 10), y1 - 10); for (let y = y1 - 10; y >= y2; y -= 6) g.lineTo(s * hw(y), y); g.lineTo(s * 2, y2); g.lineTo(s * 10, y1 - 10); g.closePath(); };
      sh(g, sec, P, { lw: 0 }); lattice(sec, s * 50, y1 - 10, 0, y2, 6); sec(); ink(g, 1.8);
    }
    block(g, -hw(y2) - 5, y2 - 8, 2 * hw(y2) + 10, 8, PL, 1.8);
    if (building) {
      line(g, [[-6, y2 - 8], [-6, y2 - 52]], 2.6, '#3a3028'); line(g, [[-6, y2 - 52], [44, y2 - 40]], 2, '#3a3028'); line(g, [[44, y2 - 40], [44, y2 - 16]], 1, '#3a3028'); block(g, 38, y2 - 16, 12, 8, '#8a7a60', 1.2);
    } else {
      const shaft = () => { g.beginPath(); g.moveTo(-hw(y2 - 8), y2 - 8); for (let y = y2 - 8; y >= y3; y -= 6) g.lineTo(-hw(y), y); g.lineTo(hw(y3), y3); for (let y = y3; y <= y2 - 8; y += 6) g.lineTo(hw(y), y); g.closePath(); };
      sh(g, shaft, P, { lw: 0 }); lattice(shaft, -20, y2 - 8, 20, y3, 5); shaft(); ink(g, 1.8);
      block(g, -9, y3 - 8, 18, 8, PL, 1.4); block(g, -5, y3 - 18, 10, 10, '#d9c094', 1.2); line(g, [[0, y3 - 18], [0, -H - 14]], 2, INK);
      g.save(); g.globalCompositeOperation = 'lighter'; const b = Math.sin(t * 2) * .5 + .5; g.fillStyle = `rgba(255,${200 + b * 40 | 0},140,${.22 + b * .2})`; ell(g, 0, y3 - 13, 24, 24); g.fill(); g.restore();
      const fy = -H - 14; g.fillStyle = '#3c5fa0'; g.fillRect(1, fy, 6, 6); g.fillStyle = '#f1ead8'; g.fillRect(7, fy, 6, 6); g.fillStyle = '#b5452b'; g.fillRect(13, fy, 6, 6); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(1, fy, 18, 6);
    }
    // Haussmann buildings framing the Champ-de-Mars
    const r = R(71); let x = -420;
    while (x < 420) { const w = 50 + r() * 40, h = 46 + r() * 26; if (x + w > -110 && x < 110) { x += 12; continue; }
      sh(g, () => { g.beginPath(); g.rect(x, -h, w, h + 8); }, '#e3d6bb', { hatch: [x + w * .55, -h, x + w, 8], hc: 'rgba(60,45,25,.3)', seed: x | 0 });
      sh(g, () => poly(g, [[x - 2, -h], [x + 8, -h - 22], [x + w - 8, -h - 22], [x + w + 2, -h]]), '#7d8a96', { hatch: [x, -h - 22, x + w, -h], hc: 'rgba(20,25,35,.35)', seed: (x | 0) + 1 });
      for (let k = 0; k < Math.floor(w / 16); k++) { const xx = x + 8 + k * 16; block(g, xx, -h + 12, 7, 12, '#4a4f58', 1); block(g, xx, -h + 30, 7, 12, '#4a4f58', 1); line(g, [[xx - 2, -h + 25], [xx + 9, -h + 25]], 1.4, '#2a2a2a'); }
      for (let k = 0; k < 2; k++) block(g, x + 10 + k * (w - 24), -h - 34, 6, 12, '#b56a4a', 1.2);
      x += w + 2; }
  }

  /* VIII · Nouvelle Babel — the megacity and the Signal tower */
  function babel(g, t) {
    t = t || 0; const GLOW = '#6ff0e6', r = R(91);
    for (let i = 0; i < 22; i++) { const x = -420 + i * 40 + r() * 10, w = 22 + r() * 16, h = 80 + r() * 120; g.fillStyle = '#3e4c66'; g.fillRect(x, -h, w, h); g.fillStyle = 'rgba(111,240,230,.18)'; for (let k = 0; k < 6; k++) g.fillRect(x + 4, -h + 10 + k * 14, w - 8, 2); }
    const ring = front => { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(111,240,230,.3)'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, -170, 320, 34, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); g.stroke(); g.strokeStyle = GLOW; g.lineWidth = 1.6; g.stroke(); g.restore(); };
    ring(false);
    const tower = (x, w, h, kind) => {
      const tp = () => { g.beginPath(); if (kind === 'twist') { g.moveTo(x - w / 2, 0); g.bezierCurveTo(x - w * .8, -h * .3, x + w * .1, -h * .6, x - w * .15, -h); g.lineTo(x + w * .15, -h); g.bezierCurveTo(x + w * .5, -h * .6, x - w * .1, -h * .3, x + w / 2, 0); } else if (kind === 'dome') { g.moveTo(x - w / 2, 0); g.lineTo(x - w / 2, -h * .7); g.quadraticCurveTo(x, -h * 1.15, x + w / 2, -h * .7); g.lineTo(x + w / 2, 0); } else { g.moveTo(x - w / 2, 0); g.bezierCurveTo(x - w / 2 - 8, -h * .5, x - w * .2, -h * .9, x, -h); g.bezierCurveTo(x + w * .2, -h * .9, x + w / 2 + 8, -h * .5, x + w / 2, 0); } g.closePath(); };
      sh(g, tp, '#e6ecf2', { hatch: [x, -h, x + w / 2 + 12, 0], hc: 'rgba(40,60,90,.3)', lw: 2.2, seed: x | 0, extra: () => { g.strokeStyle = 'rgba(40,60,90,.3)'; g.lineWidth = 1; for (let k = 1; k < 16; k++) { const yy = -k * h / 16; g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x + w, yy); g.stroke(); } g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 12; k++) { const yy = -14 - k * h / 13, on = Math.sin(t * 2 + k * 1.7 + x) > .2; g.fillStyle = on ? 'rgba(111,240,230,.5)' : 'rgba(111,240,230,.1)'; g.fillRect(x - w * .35, yy, w * .7, 2); } } });
      for (const f of [.35, .62]) { smoothPath(g, blobPts(x, -h * f, w * .66, 6, 10, .3, r)); fillInk(g, '#6f9a5a', 1.4); for (let k = 0; k < 4; k++) { ell(g, x - w * .5 + k * w * .33, -h * f - 6, 4, 6); fillInk(g, '#4f7a3a', 1); } }
    };
    tower(-250, 64, 200, 'dome'); tower(-160, 48, 290, 'twist'); tower(170, 54, 270, 'spire'); tower(262, 66, 190, 'dome');
    // the Signal tower
    const st = () => { g.beginPath(); g.moveTo(-40, 0); g.bezierCurveTo(-32, -120, -12, -250, -4, -420); g.lineTo(4, -420); g.bezierCurveTo(12, -250, 32, -120, 40, 0); g.closePath(); };
    sh(g, st, '#f4f7fa', { hatch: [0, -420, 42, 0], hc: 'rgba(40,60,90,.3)', lw: 2.4 });
    for (const yy of [-90, -170, -250]) { const w2 = 40 - (-yy) * .08; ell(g, 0, yy, w2 + 14, 6); fillInk(g, '#dfe6ee', 1.6); }
    g.save(); g.globalCompositeOperation = 'lighter'; const pulse = (t * .8) % 1; g.fillStyle = 'rgba(111,240,230,.85)'; ell(g, 0, -420 * pulse, 5, 9); g.fill(); g.fillStyle = 'rgba(111,240,230,.25)'; ell(g, 0, -420 * pulse, 20, 30); g.fill(); line(g, [[0, -10], [0, -420]], 1.2, 'rgba(111,240,230,.7)'); g.restore();
    ring(true);
    const pod = (t * .35) % 1 * TAU; const px = Math.cos(pod) * 320, py = -170 + Math.sin(pod) * 34; if (Math.sin(pod) > 0) block(g, px - 10, py - 5, 20, 8, '#e6ecf2', 1.4);
    g.save(); g.translate(64, -320); g.scale(4, 4); lineageMark(g, 0, 0, 'circuit'); g.restore();
    for (let i = 0; i < 5; i++) { const x = -280 + i * 140 + Math.sin(t + i) * 20, y = -250 - i * 16 + Math.cos(t * 1.3 + i) * 8; ell(g, x, y, 5, 3); fillInk(g, '#e6ecf2', 1); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = GLOW; ell(g, x, y + 4, 2, 1); g.fill(); g.restore(); }
  }

  return [
    { id: 'olduvai', era: 'I · L\'Étincelle', place: 'Gorges d\'Olduvai, Tanzanie', when: '≈ 1,8 Ma', sky: ['#f1c67c', '#e9a35c'], ground: '#b58a4f', scale: 1.55, draw: olduvai, work: 'Voler le feu à l\'acacia foudroyé et le garder trois nuits.' },
    { id: 'lascaux', era: 'II · Le Grand Froid', place: 'Grotte de Lascaux, France', when: '≈ 17 000 ans', sky: ['#2a1c18', '#120c0a'], ground: '#3a2a22', scale: 1.5, draw: lascaux, work: 'Peindre la mémoire de la tribu sur la paroi.' },
    { id: 'stonehenge', era: 'III · La Graine', place: 'Stonehenge, Angleterre', when: '≈ 2 500 av. J.-C.', sky: ['#b9c4c8', '#f0d9a8'], ground: '#7f8f4e', scale: 1.55, draw: stonehenge, work: 'Lever les trilithes alignés sur le solstice.' },
    { id: 'giza', era: 'IV · Le Bronze', place: 'Plateau de Gizeh, Égypte', when: '≈ 2 560 av. J.-C.', sky: ['#f6d79a', '#e9b06a'], ground: '#d9bb80', scale: 1.5, draw: (g, t) => giza(g, t, false), drawBuild: (g, t) => giza(g, t, true), work: 'Poser la dernière pierre de la grande pyramide.' },
    { id: 'colosseum', era: 'V · L\'Empire', place: 'Colisée, Rome', when: '80 apr. J.-C.', sky: ['#a9c4dc', '#f0dcb4'], ground: '#b9a47a', scale: 1.5, draw: colosseum, work: 'Survivre aux jeux et rallumer la flamme de Vesta.' },
    { id: 'notredame', era: 'VI · La Cathédrale', place: 'Notre-Dame, Paris', when: '1250', sky: ['#9aa6b4', '#d6cdb8'], ground: '#8a8a7a', scale: 1.1, draw: (g, t) => notreDame(g, t, false), drawBuild: (g, t) => notreDame(g, t, true), work: 'Achever la tour sud avant l\'hiver.' },
    { id: 'eiffel', era: 'VII · La Vapeur', place: 'Exposition universelle, Paris', when: '1889', sky: ['#e8b98a', '#c97a5a'], ground: '#6a6a6a', scale: 1.15, draw: (g, t) => eiffel(g, t, false), drawBuild: (g, t) => eiffel(g, t, true), work: 'Allumer le phare de la tour le soir de l\'ouverture.' },
    { id: 'babel', era: 'VIII · Le Signal', place: 'Nouvelle Babel', when: '≈ 2200', sky: ['#1a2440', '#3a4a7a'], ground: '#2a3040', scale: .92, draw: babel, work: 'Envoyer la Braise vers le passé.' }
  ];
})();
