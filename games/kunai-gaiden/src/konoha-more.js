/* Kunai Online — Aozora districts: academy, hospital, water tower, torii, training ground, carved cliff, river and bridge.
   Same ISO camera and metre scale as everything else. */
window.KMORE = (() => {
  const M = 24, K = KGATE, TW = KTOWN, rng = K.rng, JP = K.JP, m = v => v * M;
  const mat = (t, tw, x) => Object.assign({ tex: t, tw: m(tw) }, x || {});
  const base = () => { const t = K.textures(); return { WOOD: mat(t.wall, 4), WOOD2: mat(t.wall2, 4), DARK: mat(t.dark, 2), STONE: mat(t.stone, 4), FLAG: mat(t.flag, 4) }; };
  const tex = (id, w, h, fn) => ISO.texture('km-' + id, w, h, fn);
  const signTex = (text, bg, fg, w, h) => tex('sign' + text, w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.lineWidth = 8; g.strokeStyle = 'rgba(40,20,10,.85)'; g.strokeRect(4, 4, W - 8, H - 8);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${Math.min(H * .66, W / text.length * .86)}px ${JP}`; g.fillText(text, W / 2, H / 2 + 3); });
  const winTex = frame => tex('win' + frame, 128, 160, (g, W, H) => { g.fillStyle = frame; g.fillRect(0, 0, W, H); const gl = g.createLinearGradient(0, 0, W, H); gl.addColorStop(0, '#6a98ac'); gl.addColorStop(.5, '#2c4757'); gl.addColorStop(1, '#4f7587'); g.fillStyle = gl; g.fillRect(12, 12, W - 24, H - 24);
    g.fillStyle = 'rgba(230,245,255,.3)'; g.beginPath(); g.moveTo(22, H - 12); g.lineTo(62, 12); g.lineTo(82, 12); g.lineTo(42, H - 12); g.fill(); g.fillStyle = frame; g.fillRect(W / 2 - 4, 12, 8, H - 24); g.fillRect(12, H / 2 - 4, W - 24, 8); });
  const rockTex = () => tex('rock3', 512, 512, (g, W, H) => { const r = rng(61); g.fillStyle = '#a99c82'; g.fillRect(0, 0, W, H);
    // strata: horizontal bands of slightly different stone, each with a lit top lip and a shaded underside
    let y = 0; while (y < H) { const h = 18 + r() * 46, v = r(); g.fillStyle = `rgb(${160 + v * 26 | 0},${150 + v * 22 | 0},${126 + v * 20 | 0})`; g.fillRect(0, y, W, h);
      g.fillStyle = 'rgba(255,246,220,.35)'; g.fillRect(0, y, W, 3); g.fillStyle = 'rgba(60,42,26,.35)'; g.fillRect(0, y + h - 4, W, 4); y += h; }
    for (let i = 0; i < 260; i++) { g.fillStyle = r() < .5 ? 'rgba(255,245,215,.18)' : 'rgba(70,50,30,.16)'; g.beginPath(); g.ellipse(r() * W, r() * H, 6 + r() * 26, 3 + r() * 8, 0, 0, 7); g.fill(); }
    // vertical joints and cracks
    for (let i = 0; i < 16; i++) { let x = r() * W, yy = r() * H * .3; g.beginPath(); g.moveTo(x, yy); for (let k = 0; k < 14; k++) { x += (r() - .5) * 10; yy += 14 + r() * 18; g.lineTo(x, yy); }
      g.strokeStyle = 'rgba(45,30,18,.6)'; g.lineWidth = 2 + r() * 2; g.stroke(); g.strokeStyle = 'rgba(255,240,210,.3)'; g.lineWidth = 1; g.translate(2, 1); g.stroke(); g.translate(-2, -1); }
    // dark weathering streaks running down
    for (let i = 0; i < 26; i++) { const x = r() * W, y0 = r() * H, l = 40 + r() * 140, q = g.createLinearGradient(0, y0, 0, y0 + l); q.addColorStop(0, 'rgba(60,50,40,.28)'); q.addColorStop(1, 'rgba(60,50,40,0)'); g.fillStyle = q; g.fillRect(x, y0, 3 + r() * 8, l); }
    for (let i = 0; i < 40; i++) { g.fillStyle = r() < .6 ? 'rgba(110,140,70,.35)' : 'rgba(150,160,110,.3)'; g.beginPath(); g.ellipse(r() * W, r() * H, 3 + r() * 9, 2 + r() * 4, 0, 0, 7); g.fill(); } });
  grassTex = () => tex('grass', 256, 256, (g, W, H) => { const r = rng(81); g.fillStyle = '#7fa957'; g.fillRect(0, 0, W, H); for (let i = 0; i < 320; i++) { g.fillStyle = r() < .5 ? 'rgba(200,235,120,.28)' : 'rgba(30,70,20,.25)'; g.beginPath(); g.ellipse(r() * W, r() * H, 3 + r() * 8, 2 + r() * 3, r() * 3, 0, 7); g.fill(); } });
  // the faces of the Gardien carved in the cliff: painted relief (light from the top-left), each with its own hair and marks
  const carvedFace = kind => tex('cliff' + kind, 512, 600, (g, W, H) => { const r = rng(kind * 31 + 5); g.drawImage(rockTex(), 0, 0, W, H); return;   // Kunai Gaiden: a bare cliff
    const cx = W / 2, cy = 330, fw = 150, fh = 190, ST = { hi: 'rgba(255,248,226,', lo: 'rgba(52,36,22,' };
    const fillA = (path, col) => { g.beginPath(); path(); g.fillStyle = col; g.fill(); }, strokeA = (path, col, w) => { g.beginPath(); path(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
    // a carved line: dark groove with a light lip below-right (incised in the stone)
    const groove = (path, w) => { g.save(); g.translate(2, 2.5); strokeA(path, ST.hi + '.45)', w * .8); g.restore(); strokeA(path, ST.lo + '.8)', w); };
    // a raised volume: shaded with a gradient from top-left (lit) to bottom-right (shadow)
    const volume = (path, x0, y0, x1, y1, k) => { const q = g.createLinearGradient(x0, y0, x1, y1); q.addColorStop(0, ST.hi + (.42 * (k || 1)) + ')'); q.addColorStop(.5, 'rgba(0,0,0,0)'); q.addColorStop(1, ST.lo + (.5 * (k || 1)) + ')'); fillA(path, q); };
    const rockFill = path => { g.save(); g.beginPath(); path(); g.clip(); g.drawImage(rockTex(), -40, -60, W * 1.2, H * 1.2); g.restore(); };
    // the niche: the cliff is cut back around the head, deep shadow below and right
    for (let k = 10; k > 0; k--) fillA(() => g.ellipse(cx + 10, cy - 10 + k, fw + 70 + k * 3, fh + 80 + k * 2, 0, 0, 7), `rgba(40,28,16,${.04})`);
    // hair (behind the face): one silhouette per Gardien
    const HAIR = {
      1: () => { g.moveTo(cx - fw - 10, cy - 60); g.quadraticCurveTo(cx - fw - 20, cy - fh - 40, cx, cy - fh - 50); g.quadraticCurveTo(cx + fw + 20, cy - fh - 40, cx + fw + 10, cy - 60); g.lineTo(cx + fw + 30, cy + fh + 60); g.lineTo(cx + fw - 30, cy + fh + 70); g.lineTo(cx + fw - 30, cy); g.lineTo(cx - fw + 30, cy); g.lineTo(cx - fw + 30, cy + fh + 70); g.lineTo(cx - fw - 30, cy + fh + 60); g.closePath(); },
      2: () => { g.moveTo(cx - fw - 6, cy - 40); for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI, rr = (i % 2 ? fh + 70 : fh + 20); g.lineTo(cx + Math.cos(a) * (fw + 30) * (i % 2 ? 1.05 : .95), cy - 40 + Math.sin(a) * rr * .8); } g.lineTo(cx + fw + 6, cy - 40); g.closePath(); },
      3: () => { g.moveTo(cx - fw - 8, cy - 30); for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI, rr = (i % 2 ? fh + 45 : fh + 10); g.lineTo(cx + Math.cos(a) * (fw + 22), cy - 30 + Math.sin(a) * rr * .78); } g.lineTo(cx + fw + 8, cy - 30); g.closePath(); },
      4: () => { g.moveTo(cx - fw - 30, cy + 40); for (let i = 0; i <= 12; i++) { const a = Math.PI * .95 + i / 12 * Math.PI * 1.1, rr = (i % 2 ? fh + 85 : fh + 30); g.lineTo(cx + Math.cos(a) * (fw + 50), cy - 30 + Math.sin(a) * rr * .8); } g.lineTo(cx + fw + 30, cy + 40); g.closePath(); },
      6: () => { g.moveTo(cx - fw - 10, cy - 30); for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI, rr = (i % 2 ? fh + 70 : fh + 25), lean = (1 - i / 12) * 60; g.lineTo(cx + Math.cos(a) * (fw + 26) - lean * .9, cy - 30 + Math.sin(a) * rr * .85 - lean * .3); } g.lineTo(cx + fw + 10, cy - 30); g.closePath(); },
      7: () => { g.moveTo(cx - fw - 24, cy + 10); for (let i = 0; i <= 14; i++) { const a = Math.PI * .97 + i / 14 * Math.PI * 1.06, rr = (i % 2 ? fh + 90 : fh + 30); g.lineTo(cx + Math.cos(a) * (fw + 46), cy - 30 + Math.sin(a) * rr * .82); } g.lineTo(cx + fw + 24, cy + 10); g.closePath(); },
      5: () => { g.moveTo(cx - fw - 14, cy - 40); g.quadraticCurveTo(cx - fw - 20, cy - fh - 50, cx, cy - fh - 55); g.quadraticCurveTo(cx + fw + 20, cy - fh - 50, cx + fw + 14, cy - 40); g.lineTo(cx + fw + 40, cy + fh + 40); g.lineTo(cx + fw - 10, cy + fh + 60); g.lineTo(cx + fw - 20, cy); g.lineTo(cx - fw + 20, cy); g.lineTo(cx - fw + 10, cy + fh + 60); g.lineTo(cx - fw - 40, cy + fh + 40); g.closePath(); },
    };
    rockFill(HAIR[kind]); volume(HAIR[kind], cx - fw - 40, cy - fh - 40, cx + fw + 40, cy + fh, 1.1);
    for (let i = 0; i < 16; i++) { const a = Math.PI * 1.05 + i / 15 * Math.PI * .9, x0 = cx + Math.cos(a) * (fw - 10), y0 = cy - 40 + Math.sin(a) * (fh - 30) * .8, x1 = cx + Math.cos(a) * (fw + 40), y1 = cy - 40 + Math.sin(a) * (fh + 50) * .8;
      groove(() => { g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + (r() - .5) * 20, (y0 + y1) / 2, x1, y1); }, 3); }
    if (kind === 1 || kind === 5) for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) groove(() => { const x = cx + sx * (fw + 2 + i * 8); g.moveTo(x, cy + 10); g.quadraticCurveTo(x + sx * 6, cy + fh * .6, x + sx * 2, cy + fh + 40); }, 3);
    // the face mask
    const FACE = () => { g.moveTo(cx - fw, cy - 70); g.quadraticCurveTo(cx - fw - 4, cy + fh * .55, cx - fw * .45, cy + fh * .88); g.quadraticCurveTo(cx, cy + fh * (kind === 5 ? 1.02 : 1.08), cx + fw * .45, cy + fh * .88); g.quadraticCurveTo(cx + fw + 4, cy + fh * .55, cx + fw, cy - 70); g.quadraticCurveTo(cx, cy - fh - 10, cx - fw, cy - 70); g.closePath(); };
    rockFill(FACE); volume(FACE, cx - fw, cy - fh, cx + fw, cy + fh, 1); strokeA(FACE, ST.lo + '.35)', 4);
    // forehead: bangs or hairline over it
    if (kind === 4 || kind === 7) for (const sx of [-1, 1]) { const B = () => { g.moveTo(cx + sx * 20, cy - fh * .9); g.quadraticCurveTo(cx + sx * (fw - 10), cy - fh * .5, cx + sx * (fw + 6), cy + fh * .35); g.lineTo(cx + sx * (fw - 26), cy + fh * .2); g.quadraticCurveTo(cx + sx * (fw - 40), cy - fh * .3, cx + sx * 10, cy - fh * .7); g.closePath(); }; rockFill(B); volume(B, cx - fw, cy - fh, cx + fw, cy, 1.2); groove(B, 3); }
    if (kind === 5) { const B = () => { g.moveTo(cx - fw - 2, cy - 60); g.quadraticCurveTo(cx - 40, cy - fh * .95, cx - 6, cy - fh * .55); g.lineTo(cx - 6, cy - fh * .85); g.quadraticCurveTo(cx - 70, cy - fh * .9, cx - fw - 2, cy - 60); }; rockFill(B); groove(B, 3);
      fillA(() => { g.moveTo(cx, cy - fh * .62); g.lineTo(cx + 9, cy - fh * .55); g.lineTo(cx, cy - fh * .48); g.lineTo(cx - 9, cy - fh * .55); g.closePath(); }, ST.lo + '.75)'); }
    // brow ridge and the shadow it casts into the eye sockets
    const brow = kind === 2 ? -6 : 0; for (const sx of [-1, 1]) { const ex = cx + sx * 56, ey = cy - 18;
      fillA(() => g.ellipse(ex + 4, ey + 6, 44, 22, 0, 0, 7), ST.lo + '.38)'); fillA(() => g.ellipse(ex + 2, ey + 2, 34, 13, 0, 0, 7), ST.lo + '.3)');
      groove(() => { g.moveTo(ex - sx * 40, ey - 30 + brow * sx * -1); g.quadraticCurveTo(ex, ey - 44 + (kind === 2 ? 8 : 0), ex + sx * 38, ey - 26 - brow * sx); }, 7);
      // eye: almond with a heavy upper lid and a carved iris
      groove(() => { g.moveTo(ex - 28, ey); g.quadraticCurveTo(ex, ey - 16, ex + 28, ey); }, 5); strokeA(() => { g.moveTo(ex - 24, ey + 4); g.quadraticCurveTo(ex, ey + 12, ex + 24, ey + 4); }, ST.hi + '.4)', 3);
      fillA(() => g.ellipse(ex + sx * 2, ey - 2, 7, 8, 0, 0, 7), ST.lo + '.7)'); }
    // nose: lit left plane, shaded right plane, nostrils
    fillA(() => { g.moveTo(cx - 6, cy - 30); g.lineTo(cx - 22, cy + 52); g.lineTo(cx, cy + 58); g.closePath(); }, ST.hi + '.35)'); fillA(() => { g.moveTo(cx + 2, cy - 30); g.lineTo(cx + 24, cy + 50); g.lineTo(cx, cy + 58); g.closePath(); }, ST.lo + '.4)');
    fillA(() => g.ellipse(cx - 14, cy + 56, 8, 4, 0, 0, 7), ST.lo + '.6)'); fillA(() => g.ellipse(cx + 14, cy + 56, 8, 4, 0, 0, 7), ST.lo + '.7)'); fillA(() => g.ellipse(cx + 18, cy + 64, 26, 8, 0, 0, 7), ST.lo + '.18)');
    // mouth: stern, calm or smiling
    const my = cy + 100, curve = { 1: 6, 2: -2, 3: 10, 4: 4, 5: 3, 6: 0, 7: 14 }[kind]; if (kind !== 6) groove(() => { g.moveTo(cx - 40, my - curve * .4); g.quadraticCurveTo(cx, my + curve, cx + 40, my - curve * .4); }, 6); if (kind !== 6) strokeA(() => { g.moveTo(cx - 24, my + 16); g.quadraticCurveTo(cx, my + 22, cx + 24, my + 16); }, ST.hi + '.35)', 4);
    // cheeks and jaw: soft shadows that sell the volume
    fillA(() => g.ellipse(cx + fw * .62, cy + 50, 30, 60, -.2, 0, 7), ST.lo + '.18)'); fillA(() => g.ellipse(cx - fw * .62, cy + 40, 28, 50, .2, 0, 7), ST.hi + '.14)'); fillA(() => g.ellipse(cx + 20, cy + fh * .98, fw * .7, 22, 0, 0, 7), ST.lo + '.4)');
    // marks per Gardien
    if (kind === 2) { for (const sx of [-1, 1]) groove(() => { g.moveTo(cx + sx * 56, cy + 14); g.lineTo(cx + sx * 54, cy + 70); }, 6); groove(() => { g.moveTo(cx, cy + 128); g.lineTo(cx, cy + 165); }, 6); }
    if (kind === 3) { for (let i = 0; i < 3; i++) groove(() => { g.moveTo(cx - 50, cy - 80 - i * 16); g.quadraticCurveTo(cx, cy - 90 - i * 16, cx + 50, cy - 80 - i * 16); }, 3); for (const sx of [-1, 1]) groove(() => { g.moveTo(cx + sx * 30, cy + 50); g.quadraticCurveTo(cx + sx * 48, cy + 90, cx + sx * 40, cy + 116); }, 4);
      const goatee = () => { g.moveTo(cx - 18, cy + 128); g.lineTo(cx, cy + 172); g.lineTo(cx + 18, cy + 128); g.closePath(); }; rockFill(goatee); volume(goatee, cx - 20, cy + 128, cx + 20, cy + 172, 1); groove(goatee, 3); }
    if (kind === 6) { const MK = () => { g.moveTo(cx - fw + 2, cy + 20); g.quadraticCurveTo(cx - 30, cy + 8, cx, cy + 4); g.quadraticCurveTo(cx + 30, cy + 8, cx + fw - 2, cy + 20); g.quadraticCurveTo(cx + fw * .9, cy + fh * .6, cx + fw * .45, cy + fh * .88); g.quadraticCurveTo(cx, cy + fh * 1.08, cx - fw * .45, cy + fh * .88); g.quadraticCurveTo(cx - fw * .9, cy + fh * .6, cx - fw + 2, cy + 20); g.closePath(); };
      rockFill(MK); volume(MK, cx - fw, cy, cx + fw, cy + fh, 1.3); groove(MK, 5); strokeA(() => { g.moveTo(cx - 4, cy + 10); g.quadraticCurveTo(cx + 6, cy + 50, cx + 2, cy + 64); }, ST.hi + '.45)', 4);
      const BAND = () => { g.moveTo(cx - fw - 6, cy - 70); g.lineTo(cx + fw + 6, cy - 95); g.lineTo(cx + fw + 6, cy - 50); g.lineTo(cx - 20, cy - 8); g.lineTo(cx - fw - 6, cy - 20); g.closePath(); }; rockFill(BAND); volume(BAND, cx - fw, cy - 100, cx + fw, cy, 1.2); groove(BAND, 4); }
    if (kind === 7) for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) groove(() => { g.moveTo(cx + sx * 70, cy + 40 + i * 16); g.lineTo(cx + sx * 118, cy + 34 + i * 18); }, 5);
    if (kind === 1) for (const sx of [-1, 1]) groove(() => { g.moveTo(cx + sx * 34, cy + 60); g.quadraticCurveTo(cx + sx * 46, cy + 84, cx + sx * 40, cy + 104); }, 3);
  });

  /* the Gardien monument painted as one sculpted front: grey-ochre rock with vertical crags and stains,
     seven heads carved in the round in the upper part, each throwing its shadow on the stone (light from the top-left) */
  const cliffFront = () => tex('cliffFront9', 2048, 980, (g, W, H) => { const r = rng(77);
    // rock body: mottled grey-beige, darker brown patches, vertical crags with lit left edges
    g.fillStyle = '#a99c82'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 520; i++) { const x = r() * W, y = r() * H, rx = 20 + r() * 90, ry = 14 + r() * 60; g.fillStyle = ['rgba(122,108,88,.16)', 'rgba(196,184,154,.14)', 'rgba(104,92,76,.15)', 'rgba(150,132,100,.14)', 'rgba(90,80,70,.12)'][(r() * 5) | 0]; g.beginPath(); g.ellipse(x, y, rx * .6, ry * 1.4, (r() - .5) * .3, 0, 7); g.fill(); }
    for (let i = 0; i < 140; i++) { let x = r() * W, y = r() * H * .2, w = 14 + r() * 40; const pts = [[x, y]]; for (let k = 0; k < 12; k++) { x += (r() - .5) * 24; y += 30 + r() * 50; pts.push([x, y]); }
      g.beginPath(); pts.forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); for (let k = pts.length - 1; k >= 0; k--) g.lineTo(pts[k][0] + w * (1 - k / pts.length), pts[k][1]); g.closePath();
      const q = g.createLinearGradient(x - w, 0, x + w, 0); q.addColorStop(0, 'rgba(230,220,195,.35)'); q.addColorStop(1, 'rgba(70,60,48,.4)'); g.fillStyle = q; g.fill(); }
    for (let i = 0; i < 40; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += 10 + r() * 30; y += (r() - .5) * 18; g.lineTo(x, y); } g.strokeStyle = 'rgba(55,45,35,.55)'; g.lineWidth = 2.5; g.stroke(); }
    for (let i = 0; i < 30; i++) { const x = r() * W, y0 = r() * H, l = 80 + r() * 260, q = g.createLinearGradient(0, y0, 0, y0 + l); q.addColorStop(0, 'rgba(70,60,50,.35)'); q.addColorStop(1, 'rgba(70,60,50,0)'); g.fillStyle = q; g.fillRect(x, y0, 6 + r() * 16, l); }
    // shrubs clinging to the rock
    for (let i = 0; i < 26; i++) { const x = r() * W, y = H * (.45 + r() * .5); if (r() < .4) continue; for (let k = 0; k < 40; k++) { g.fillStyle = ['#3f6a2e', '#4f7f38', '#6a9a44', '#2f5222'][(r() * 4) | 0]; g.beginPath(); g.ellipse(x + (r() - .5) * 46, y + (r() - .5) * 22, 5, 3, r() * 3, 0, 7); g.fill(); } }
    // the heads
    const S0 = 104, Y = H * .4, P = { lit: '#d6c8a6', mid: '#b4a482', dark: '#7e6e54', deep: '#56483a' };
    const shade = (path, x0, y0, x1, y1, cols) => { g.beginPath(); path(); const q = g.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => q.addColorStop(i / (cols.length - 1), c)); g.fillStyle = q; g.fill(); };
    const line = (path, col, w) => { g.beginPath(); path(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
    const carve = (path, w) => { g.save(); g.translate(1.5, 2); line(path, 'rgba(240,230,205,.5)', w * .7); g.restore(); line(path, 'rgba(50,38,26,.85)', w); };
    // a lock of hair as a sculpted wedge: lit along its left edge, shaded along its right
    const lock = (x0, y0, x1, y1, w, bend) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, mx = (x0 + x1) / 2 + nx * (bend || 0), my = (y0 + y1) / 2 + ny * (bend || 0);
      const path = () => { g.moveTo(x0 + nx * w, y0 + ny * w); g.quadraticCurveTo(mx + nx * w * .6, my + ny * w * .6, x1, y1); g.quadraticCurveTo(mx - nx * w * .6, my - ny * w * .6, x0 - nx * w, y0 - ny * w); g.closePath(); };
      shade(path, x0 + nx * w, y0 + ny * w, x0 - nx * w, y0 - ny * w, nx < 0 ? [P.lit, P.mid, P.dark] : [P.dark, P.mid, P.lit]); line(path, 'rgba(50,38,26,.6)', 2.4); };
    const head = (cx, kind) => { const s = S0, X = u => cx + u * s, Yv = v => Y + v * s;
      // cast shadow on the rock and the dark recess the head was carved out of
      for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(40,32,24,.07)'; g.beginPath(); g.ellipse(X(.35), Yv(.45), s * (1.35 + k * .05), s * (1.6 + k * .05), .1, 0, 7); g.fill(); }
      // back hair mass
      const back = { 1: [1.25, 1.75], 2: [1.15, 1.2], 3: [1.12, 1.15], 4: [1.3, 1.3], 5: [1.25, 1.65], 6: [1.18, 1.25], 7: [1.3, 1.3] }[kind];
      shade(() => g.ellipse(X(0), Yv(-.15 + (back[1] - 1.2) * .3), back[0] * s, back[1] * s, 0, 0, 7), X(-1), Yv(-1.2), X(1.1), Yv(1), [P.mid, P.dark, P.deep]);
      // spikes and locks around the crown
      const spikes = { 2: 8, 3: 9, 4: 10, 6: 8, 7: 12 }[kind];
      if (spikes) for (let i = 0; i < spikes; i++) { const a = Math.PI * (1.02 + i / (spikes - 1) * .96) + (kind === 6 ? -.35 : 0), len = (kind === 7 || kind === 4 ? 1.5 : kind === 6 ? 1.48 : 1.36) + (i % 2) * .12;
        lock(X(Math.cos(a) * .7), Yv(-.25 + Math.sin(a) * .75), X(Math.cos(a) * len + (kind === 6 ? -.22 : 0)), Yv(-.25 + Math.sin(a) * len * .95), s * .34, s * .07 * (i % 2 ? 1 : -1)); }
      if (kind === 1 || kind === 5) for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) lock(X(sx * (.55 + i * .17)), Yv(-1.05 + i * .1), X(sx * (.92 + i * .14)), Yv(1.35 - i * .15), s * .13, sx * s * .08);
      // each Gardien has his own morphology: face outline, eyes, brows, nose, mouth
      const FC = {
        1: { w: .8, jw: .62, jy: .8, chin: 1.14, ang: 0, ex: .36, ew: .17, eh: .085, sl: -.03, lid: .25, bw: .0, bt: 5, pu: .045, nl: .36, nw: .13, my: .64, mw: .26, sm: .05 }, 
        2: { w: .84, jw: .76, jy: .7, chin: 1.0, ang: 1, ex: .37, ew: .18, eh: .055, sl: .11, lid: .1, bw: .13, bt: 7, pu: .038, nl: .35, nw: .11, my: .6, mw: .24, sm: -.05 },
        3: { w: .92, jw: .8, jy: .74, chin: 1.0, ang: 0, ex: .38, ew: .15, eh: .045, sl: -.07, lid: .6, bw: -.06, bt: 6, pu: .032, nl: .44, nw: .18, my: .66, mw: .3, sm: .07 },
        4: { w: .76, jw: .48, jy: .78, chin: 1.1, ang: 0, ex: .35, ew: .19, eh: .09, sl: .05, lid: .1, bw: .03, bt: 4, pu: .05, nl: .32, nw: .1, my: .6, mw: .2, sm: .02 },  
        5: { w: .74, jw: .5, jy: .72, chin: .98, ang: 0, ex: .34, ew: .2, eh: .1, sl: .04, lid: 0, bw: -.03, bt: 3, pu: .055, nl: .28, nw: .09, my: .6, mw: .2, sm: .03, lips: 1, lash: 1 },
        6: { w: .8, jw: .6, jy: .78, chin: 1.1, ang: 0, ex: .36, ew: .17, eh: .045, sl: -.04, lid: .65, bw: 0, bt: 5, pu: .04, nl: .3, nw: .1, my: .62, mw: .22, sm: 0 },    
        7: { w: .9, jw: .72, jy: .8, chin: 1.0, ang: 0, ex: .37, ew: .2, eh: .115, sl: 0, lid: 0, bw: .02, bt: 6, pu: .062, nl: .3, nw: .12, my: .58, mw: .38, sm: .17, grin: 1 },
      }[kind];
      const face = () => { g.moveTo(X(-FC.w), Yv(-.55));
        if (FC.ang) { g.lineTo(X(-FC.w - .02), Yv(.2)); g.lineTo(X(-FC.jw), Yv(FC.jy)); g.lineTo(X(-.2), Yv(FC.chin)); g.lineTo(X(.2), Yv(FC.chin)); g.lineTo(X(FC.jw), Yv(FC.jy)); g.lineTo(X(FC.w + .02), Yv(.2)); }
        else { g.bezierCurveTo(X(-FC.w - .04), Yv(.25), X(-FC.jw), Yv(FC.jy), X(0), Yv(FC.chin)); g.bezierCurveTo(X(FC.jw), Yv(FC.jy), X(FC.w + .04), Yv(.25), X(FC.w), Yv(-.55)); }
        g.lineTo(X(FC.w), Yv(-.55)); g.bezierCurveTo(X(FC.w * .85), Yv(-1.12), X(-FC.w * .85), Yv(-1.12), X(-FC.w), Yv(-.55)); g.closePath(); };
      shade(face, X(-.85), Yv(-.9), X(.95), Yv(.9), [P.lit, P.lit, P.mid, P.dark]); line(face, 'rgba(50,38,26,.55)', 3);
      g.fillStyle = 'rgba(60,46,32,.22)'; g.beginPath(); g.ellipse(X(.55), Yv(.25), s * .3, s * .62, -.15, 0, 7); g.fill();   // shaded right cheek
      // hair over the forehead
      if (kind === 1 || kind === 5) { lock(X(-.05), Yv(-1.02), X(-.75), Yv(-.35), s * .2, -s * .05); lock(X(.05), Yv(-1.02), X(.75), Yv(-.35), s * .2, s * .05); }
      if (kind === 4 || kind === 7) { for (const sx of [-1, 1]) lock(X(sx * .2), Yv(-1.0), X(sx * .9), Yv(.55), s * .17, sx * s * .12); lock(X(-.1), Yv(-1.05), X(-.35), Yv(-.45), s * .16, 0); lock(X(.15), Yv(-1.05), X(.3), Yv(-.5), s * .15, 0); }
      if (kind === 2 || kind === 3) for (let i = -2; i <= 2; i++) lock(X(i * .28), Yv(-1.1), X(i * .3 + .05), Yv(-.72), s * .12, 0);
      if (kind === 6) { lock(X(-.4), Yv(-1.05), X(-1.0), Yv(-.65), s * .2, -s * .05); lock(X(.3), Yv(-1.1), X(-.2), Yv(-.62), s * .16, 0); }
      // forehead protector (ton ancien maître) slanted over one eye
      if (kind === 6) { const band = () => { g.moveTo(X(-.86), Yv(-.62)); g.lineTo(X(.86), Yv(-.78)); g.lineTo(X(.86), Yv(-.48)); g.lineTo(X(.1), Yv(-.2)); g.lineTo(X(-.86), Yv(-.36)); g.closePath(); }; shade(band, X(-.8), Yv(-.8), X(.8), Yv(-.2), [P.lit, P.mid, P.dark]); line(band, 'rgba(50,38,26,.7)', 3); }
      if (kind === 5) { g.fillStyle = P.deep; g.beginPath(); g.moveTo(X(0), Yv(-.78)); g.lineTo(X(.07), Yv(-.7)); g.lineTo(X(0), Yv(-.62)); g.lineTo(X(-.07), Yv(-.7)); g.closePath(); g.fill(); }
      // brows, sockets, eyes with pupils, all from the morphology (sx = -1 left eye, +1 right eye; the inner corner faces the nose)
      for (const sx of [-1, 1]) { if (kind === 6 && sx > 0) continue; const ex = X(sx * FC.ex), ey = Yv(-.2), xi = ex - sx * FC.ew * s, xo = ex + sx * FC.ew * s, yi = ey, yo = ey - FC.sl * s, h = FC.eh * s;
        g.fillStyle = 'rgba(60,44,30,.42)'; g.beginPath(); g.ellipse(ex + 3, ey + 2, s * (FC.ew + .1), s * (FC.eh + .08), 0, 0, 7); g.fill();
        // brow: inner end lower for a frown (bw > 0), raised for a soft arch (bw < 0)
        const bi = ey - s * .2 + FC.bw * s, bo = ey - s * .22 - FC.bw * s * .6;
        line(() => { g.moveTo(xi, bi - 3); g.quadraticCurveTo(ex, Math.min(bi, bo) - s * (FC.bw < 0 ? .1 : .05) - 3, xo + sx * s * .05, bo - 3); }, 'rgba(235,225,200,.7)', FC.bt);
        carve(() => { g.moveTo(xi, bi); g.quadraticCurveTo(ex, Math.min(bi, bo) - s * (FC.bw < 0 ? .1 : .05), xo + sx * s * .05, bo); }, FC.bt * .7);
        // the almond: upper lid arches, lower lid flatter; heavy lids cover the top of the eye
        const top = h * 2 * (1 - FC.lid * .55), alm = () => { g.moveTo(xi, yi); g.quadraticCurveTo(ex, ey - top, xo, yo); g.quadraticCurveTo(ex, ey + h * 1.2, xi, yi); g.closePath(); };
        g.fillStyle = 'rgba(228,216,190,.92)'; g.beginPath(); alm(); g.fill();
        g.save(); g.beginPath(); alm(); g.clip(); g.fillStyle = 'rgba(45,34,24,.9)'; g.beginPath(); g.arc(ex + sx * 1.5, ey - top * .15 + h * .2, s * FC.pu, 0, 7); g.fill();
        if (FC.lid > .3) { g.fillStyle = 'rgba(150,132,104,.95)'; g.beginPath(); g.moveTo(xi - 4, yi - top); g.lineTo(xo + 4, yo - top); g.lineTo(xo + 4, yo - top * .1 + h * FC.lid * .6); g.quadraticCurveTo(ex, ey - top * .2 + h * FC.lid, xi - 4, yi + h * FC.lid * .3); g.closePath(); g.fill(); }
        g.restore();
        carve(() => { g.moveTo(xi, yi); g.quadraticCurveTo(ex, ey - top, xo, yo); }, FC.lid > .3 ? 5 : 3.5);
        if (FC.lash) for (let k = 0; k < 3; k++) carve(() => { g.moveTo(xo - sx * k * 4, yo - 1 - k); g.lineTo(xo + sx * (5 - k), yo - 7 - k * 2); }, 2);
        if (kind === 3) carve(() => { g.moveTo(xi, yi + h * 1.6); g.quadraticCurveTo(ex, ey + h * 2.6, xo, yo + h * 1.4); }, 2); }
      // nose: lit left plane, shaded right plane, nostril shadow
      const nb = FC.nl, nw = FC.nw;
      shade(() => { g.moveTo(X(-.02), Yv(-.12)); g.lineTo(X(-nw), Yv(nb - .04)); g.lineTo(X(.02), Yv(nb)); g.closePath(); }, X(-nw), 0, X(.02), 0, ['rgba(240,232,210,.8)', 'rgba(200,188,160,.4)']);
      shade(() => { g.moveTo(X(.02), Yv(-.12)); g.lineTo(X(nw + .02), Yv(nb - .04)); g.lineTo(X(.02), Yv(nb)); g.closePath(); }, X(.02), 0, X(nw + .02), 0, ['rgba(110,94,72,.5)', 'rgba(70,56,40,.65)']);
      g.fillStyle = 'rgba(50,38,26,.6)'; g.beginPath(); g.ellipse(X(.06), Yv(nb + .01), s * nw * .85, s * .035, 0, 0, 7); g.fill();
      // mouth or mask
      if (kind === 6) { const mask = () => { g.moveTo(X(-.84), Yv(.05)); g.quadraticCurveTo(X(0), Yv(-.02), X(.84), Yv(.05)); g.bezierCurveTo(X(.72), Yv(.8), X(.3), Yv(1.05), X(0), Yv(1.08)); g.bezierCurveTo(X(-.3), Yv(1.05), X(-.72), Yv(.8), X(-.84), Yv(.05)); g.closePath(); }; shade(mask, X(-.8), Yv(0), X(.8), Yv(1), [P.lit, P.mid, P.dark]); line(mask, 'rgba(50,38,26,.7)', 3); line(() => { g.moveTo(X(.0), Yv(.05)); g.quadraticCurveTo(X(.06), Yv(.35), X(.02), Yv(.45)); }, 'rgba(240,230,205,.5)', 3); }
      else { const my = FC.my, mw = FC.mw, sm = FC.sm;
        if (FC.grin) { const mo = () => { g.moveTo(X(-mw), Yv(my - sm * .4)); g.quadraticCurveTo(X(0), Yv(my + sm * 1.3), X(mw), Yv(my - sm * .4)); g.quadraticCurveTo(X(0), Yv(my + sm * .3), X(-mw), Yv(my - sm * .4)); g.closePath(); };
          g.fillStyle = 'rgba(50,38,26,.8)'; g.beginPath(); mo(); g.fill(); g.fillStyle = 'rgba(232,222,198,.9)'; g.beginPath(); g.moveTo(X(-mw * .8), Yv(my - sm * .2)); g.quadraticCurveTo(X(0), Yv(my + sm * .55), X(mw * .8), Yv(my - sm * .2)); g.quadraticCurveTo(X(0), Yv(my + sm * .35), X(-mw * .8), Yv(my - sm * .2)); g.fill();
          for (const sx of [-1, 1]) carve(() => { g.moveTo(X(sx * (mw + .04)), Yv(my - sm * .6)); g.quadraticCurveTo(X(sx * (mw + .1)), Yv(my - sm * .2), X(sx * (mw + .02)), Yv(my + .02)); }, 2.5); }
        else { carve(() => { g.moveTo(X(-mw), Yv(my - sm * .5)); g.quadraticCurveTo(X(0), Yv(my + sm), X(mw), Yv(my - sm * .5)); }, kind === 2 ? 5 : 4);
          if (FC.lips) { g.fillStyle = 'rgba(205,190,160,.9)'; g.beginPath(); g.moveTo(X(-mw), Yv(my)); g.quadraticCurveTo(X(-mw * .4), Yv(my - .08), X(0), Yv(my - .04)); g.quadraticCurveTo(X(mw * .4), Yv(my - .08), X(mw), Yv(my)); g.closePath(); g.fill(); g.fillStyle = 'rgba(238,228,204,.85)'; g.beginPath(); g.ellipse(X(-.02), Yv(my + .07), s * mw * .7, s * .045, 0, 0, 7); g.fill(); }
          line(() => { g.moveTo(X(-mw * .6), Yv(my + .1)); g.quadraticCurveTo(X(0), Yv(my + .14), X(mw * .6), Yv(my + .1)); }, 'rgba(240,230,205,.5)', 3); } }
      if (kind === 2) { for (const sx of [-1, 1]) carve(() => { g.moveTo(X(sx * .36), Yv(.0)); g.lineTo(X(sx * .35), Yv(.38)); }, 4); carve(() => { g.moveTo(X(0), Yv(.8)); g.lineTo(X(0), Yv(1.0)); }, 4); }
      if (kind === 3) { for (let i = 0; i < 3; i++) carve(() => { g.moveTo(X(-.35), Yv(-.62 - i * .1)); g.quadraticCurveTo(X(0), Yv(-.68 - i * .1), X(.35), Yv(-.62 - i * .1)); }, 2); for (const sx of [-1, 1]) carve(() => { g.moveTo(X(sx * .2), Yv(.3)); g.quadraticCurveTo(X(sx * .32), Yv(.5), X(sx * .28), Yv(.68)); }, 2.5);
        shade(() => { g.moveTo(X(-.12), Yv(.8)); g.lineTo(X(0), Yv(1.12)); g.lineTo(X(.12), Yv(.8)); g.closePath(); }, X(-.12), 0, X(.12), 0, [P.lit, P.dark]); }
      if (kind === 7) for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) carve(() => { g.moveTo(X(sx * .42), Yv(.18 + i * .1)); g.lineTo(X(sx * .72), Yv(.14 + i * .12)); }, 3);
      // chin and jaw: a light chin, a dark band where the head meets the rock
      g.fillStyle = 'rgba(240,232,210,.3)'; g.beginPath(); g.ellipse(X(-.05), Yv(.9), s * .25, s * .08, 0, 0, 7); g.fill();
      const q = g.createLinearGradient(0, Yv(.95), 0, Yv(1.45)); q.addColorStop(0, 'rgba(45,35,25,.55)'); q.addColorStop(1, 'rgba(45,35,25,0)'); g.fillStyle = q; g.beginPath(); g.ellipse(X(.1), Yv(1.15), s * .8, s * .32, 0, 0, 7); g.fill(); };
    for (let i = 0; i < 7; i++) head(W * (i + .5) / 7, i + 1);
  });
  /* ---------- builders ---------- */
  function academy() {
    const S = new ISO.Scene(), b = base(), PL = mat(TW.plaster('#e9b078', 21), 5), RF = mat(TW.tiles('#6a3a2a', 21), 3.6), WIN = mat(winTex('#5a2f1c'), 1.3, { whole: true }), w = 22, d = 10, fh = 3, top = m(fh * 3 + .6);
    S.face([[m(-w / 2 - 2), m(-d), 0], [m(w / 2 + 2), m(-d), 0], [m(w / 2 + 2), m(4), 0], [m(-w / 2 - 2), m(4), 0]], b.FLAG, { n: [0, 0, 1], O: [m(-w / 2 - 2), m(-d), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.box(m(-w / 2), m(w / 2), m(-d), 0, 0, m(.8), { front: b.STONE, top: b.STONE });
    S.box(m(-w / 2), m(w / 2), m(-d), 0, m(.8), top, { front: PL, top: b.DARK }, { eave: m(1) });
    for (let f = 0; f < 3; f++) { const zb = m(f * fh + 1.4); for (let i = 0; i < 8; i++) { const cx = -w / 2 + 1.6 + (w - 3.2) * i / 7; if (!f && (i === 3 || i === 4)) continue; S.decal(m(cx - .65), m(cx + .65), m(.02), zb, zb + m(1.6), WIN, { wall: [m(.8), top] }); }
      if (f) S.box(m(-w / 2), m(w / 2), 0, m(.12), zb - m(.6), zb - m(.42), { front: b.DARK }, { bias: top / 2 * .62 - zb * .62 + 3 }); }
    // entrance porch with the school sign
    S.box(m(-3), m(3), 0, m(3), 0, m(3.6), { front: mat(TW.plaster('#e3a46c', 22), 3), top: b.DARK }, { bias: 4 });
    S.decal(m(-1.2), m(1.2), m(3.02), 0, m(2.8), mat(tex('door2', 128, 150, (g, W, H) => { g.fillStyle = '#3a2216'; g.fillRect(0, 0, W, H); g.fillStyle = '#7a4a2a'; g.fillRect(8, 8, W / 2 - 12, H - 8); g.fillRect(W / 2 + 4, 8, W / 2 - 12, H - 8); g.fillStyle = '#d9b16a'; g.fillRect(W / 2 - 10, H / 2, 6, 14); g.fillRect(W / 2 + 4, H / 2, 6, 14); }), 2.4, { whole: true }), { wall: [0, m(3.6)] });
    S.hip(m(-3), m(3), 0, m(3), m(3.6), m(4.8), RF, { over: m(.6), fascia: b.DARK, ridge: .6, bias: 6 });
    S.decal(m(-3.4), m(3.4), m(.03), top - m(2.2), top - m(.5), mat(signTex('忍者学校', '#f3e6c4', '#a82a20', 512, 128), 6.8, { whole: true }), { wall: [m(.8), top], bias: 6 });
    S.hip(m(-w / 2), m(w / 2), m(-d), 0, top, top + m(3), RF, { over: m(1), fascia: b.DARK, ridge: .75, bias: 8 });
    // the big tree with a swing
    const tx = m(w / 2 + 3.5), ty = m(1.5);
    const tr = TW.tree({ seed: 9, h: 8, r: 3.4 }); tr.sprites.forEach(sp => S.sprite(sp.p[0] + tx, sp.p[1] + ty, sp.p[2], sp.obj));
    S.tube([[tx + m(.9), ty + m(.2), m(5.2)], [tx + m(1.6), ty + m(1.4), m(5.4)]], m(.16), { color: '#6b4a30' }, { bias: 40 });
    for (const dx of [1.3, 2.1]) S.tube([[tx + m(dx), ty + m(1.3), m(5.3)], [tx + m(dx), ty + m(1.3), m(1.1)]], m(.04), { color: '#c9a35a' }, { bias: 41, shine: false });
    S.box(tx + m(1.15), tx + m(2.25), ty + m(1.1), ty + m(1.5), m(.95), m(1.1), { front: b.WOOD, top: b.WOOD }, { bias: 42 });
    return S;
  }
  function hospital() {
    const S = new ISO.Scene(), b = base(), PL = mat(TW.plaster('#eeeae0', 31), 5), WIN = mat(winTex('#6f7d86'), 1.3, { whole: true }), w = 18, d = 10, fh = 3, top = m(fh * 4 + .4);
    S.face([[m(-w / 2 - 2), m(-d), 0], [m(w / 2 + 2), m(-d), 0], [m(w / 2 + 2), m(4), 0], [m(-w / 2 - 2), m(4), 0]], b.FLAG, { n: [0, 0, 1], O: [m(-w / 2 - 2), m(-d), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.box(m(-w / 2), m(w / 2), m(-d), 0, 0, top, { front: PL, top: mat(TW.plaster('#c9c4b8', 32), 4) }, { eave: m(.4) });
    for (let f = 0; f < 4; f++) { const zb = m(f * fh + 1); for (let i = 0; i < 7; i++) { const cx = -w / 2 + 1.6 + (w - 3.2) * i / 6; if (!f && i === 3) continue; S.decal(m(cx - .6), m(cx + .6), m(.02), zb, zb + m(1.5), WIN, { wall: [0, top] }); }
      S.box(m(-w / 2), m(w / 2), 0, m(.15), zb - m(.45), zb - m(.25), { front: { color: '#4f8fa8' } }, { bias: top / 2 * .62 - zb * .62 + 3 }); }
    S.decal(m(-1.2), m(1.2), m(.02), 0, m(2.6), mat(tex('glassdoor', 128, 140, (g, W, H) => { g.fillStyle = '#4a565c'; g.fillRect(0, 0, W, H); const q = g.createLinearGradient(0, 0, W, H); q.addColorStop(0, '#8fbccd'); q.addColorStop(1, '#3d6474'); g.fillStyle = q; g.fillRect(8, 8, W / 2 - 10, H - 8); g.fillRect(W / 2 + 2, 8, W / 2 - 10, H - 8); }), 2.4, { whole: true }), { wall: [0, top] });
    S.face([[m(-3), 0, m(3)], [m(3), 0, m(3)], [m(3), m(2.6), m(2.8)], [m(-3), m(2.6), m(2.8)]], { color: '#e9e6dc' }, { O: [m(-3), 0, m(3)], U: [1, 0, 0], V: [0, 1, 0], bias: 6 });
    for (const x of [-2.8, 2.6]) S.box(m(x), m(x + .2), m(2.4), m(2.6), 0, m(2.8), { front: { color: '#cfd4d6' } }, { bias: 7 });
    S.decal(m(-3.4), m(3.4), m(.03), top - m(2.4), top - m(.8), mat(signTex('青空病院', '#f7f5ee', '#2f6f8a', 512, 120), 6.8, { whole: true }), { wall: [0, top], bias: 6 });
    for (const [a0, a1, b0, b1] of [[-w / 2 - .15, w / 2 + .15, -.35, .15], [-w / 2 - .15, w / 2 + .15, -d - .15, -d + .35], [-w / 2 - .15, -w / 2 + .35, -d, 0], [w / 2 - .35, w / 2 + .15, -d, 0]]) S.box(m(a0), m(a1), m(b0), m(b1), top, top + m(.7), { front: { color: '#d8d4ca' }, top: { color: '#efece4' } }, { bias: 3 });
    TW.tank(S, m(-4), m(-5), top, 1.2, 1.6); TW.tank(S, m(4.5), m(-4.5), top, 1, 1.4);
    return S;
  }
  function waterTower() { const S = new ISO.Scene(), b = base(), MT = mat(tex('steel', 128, 128, (g, W, H) => { const r = rng(91); g.fillStyle = '#8b959a'; g.fillRect(0, 0, W, H); for (let x = 0; x < W; x += 16) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x, 0, 2, H); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 2, 0, 2, H); } for (let i = 0; i < 16; i++) { g.fillStyle = 'rgba(150,80,40,.3)'; g.fillRect(r() * W, r() * H, 3, 10 + r() * 20); } }), 3);
    for (const [x, y] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) S.box(m(x - .2), m(x + .2), m(y - .2), m(y + .2), 0, m(12), { front: b.DARK, top: b.DARK }, { bias: y > 0 ? 6 : 0 });
    for (const z of [3.5, 7.5]) { S.tube([[m(-2.2), m(2.2), m(z)], [m(2.2), m(2.2), m(z + 3)]], m(.1), { color: '#5a3a22' }, { bias: 8 }); S.tube([[m(2.2), m(2.2), m(z)], [m(-2.2), m(2.2), m(z + 3)]], m(.1), { color: '#5a3a22' }, { bias: 8 }); }
    S.cylinder(0, 0, m(3.4), m(12), m(17), MT, 28, { cap: false, bias: 10 }); S.frustum(0, 0, m(3.6), m(.3), m(17), m(19.2), MT, { seg: 28, bias: 11 });
    S.decal(m(-1.2), m(1.2), m(3.45), m(13.2), m(15.6), mat(signTex('水', '#f0ece2', '#2b6c8f', 128, 128), 2.4, { whole: true }), { wall: [m(12), m(17)], bias: 12 });
    S.tube([[m(3.3), m(.5), m(12.4)], [m(3.3), m(.5), m(0)]], m(.18), { color: '#7d868a' }, { bias: 9 });
    return S; }
  function torii() { const S = new ISO.Scene(), red = { color: '#d23a2c' }, blk = { color: '#2a2224' };
    for (const x of [-2.4, 2.4]) { S.cylinder(m(x), 0, m(.32), 0, m(5.4), red, 14, { cap: false, bias: 2 }); S.cylinder(m(x), 0, m(.42), 0, m(.6), blk, 14, { cap: false, bias: 3 }); }
    S.box(m(-3.2), m(3.2), m(-.25), m(.25), m(4.2), m(4.6), { front: red, top: red }, { bias: 4 });
    S.box(m(-3.9), m(3.9), m(-.35), m(.35), m(5.3), m(5.8), { front: red, top: red }, { bias: 5 }); S.box(m(-4.1), m(4.1), m(-.4), m(.4), m(5.8), m(6.15), { front: blk, top: blk }, { bias: 6 });
    S.decal(m(-.45), m(.45), m(.27), m(4.6), m(5.3), mat(signTex('空', '#2a2224', '#e6c45a', 96, 96), .9, { whole: true }), { bias: 7 });
    return S; }
  function target() { const S = new ISO.Scene(), b = base(); S.cylinder(0, 0, m(.15), 0, m(1.6), b.WOOD, 8, { cap: false });
    const face = tex('target', 128, 128, (g, W, H) => { g.clearRect(0, 0, W, H); [['#f2ead6', 62], ['#c8352c', 50], ['#f2ead6', 36], ['#c8352c', 22], ['#2a2224', 9]].forEach(([c, r]) => { g.fillStyle = c; g.beginPath(); g.arc(W / 2, H / 2, r, 0, 7); g.fill(); }); g.strokeStyle = '#3a2216'; g.lineWidth = 4; g.beginPath(); g.arc(W / 2, H / 2, 62, 0, 7); g.stroke(); });
    const pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; pts.push([Math.cos(a) * m(.75), m(.18), m(1.75) + Math.sin(a) * m(.75)]); }
    S.face(pts, mat(face, 1.5, { whole: true }), { n: [0, 1, 0], O: [m(-.75), m(.18), m(2.5)], U: [1, 0, 0], V: [0, 0, -1], bias: 3 });
    S.cylinder(m(.12), m(.4), m(.04), m(1.7), m(1.95), { color: '#4a4f55' }, 6, { cap: false, bias: 5 });   // a kunai stuck in it
    return S; }
  function cliff() {
    const S = new ISO.Scene(), RK = mat(rockTex(), 6), GR = mat(grassTex(), 5), w = 46, hgt = 22;
    const prof = []; for (let i = 0; i <= 23; i++) { const x = -w / 2 + w * i / 23, r = rng(i * 7 + 3)(); prof.push([x, hgt + Math.sin(i * .9) * 1.6 + r * 1.2]); }
    const outer = [[m(-w / 2), 0], [m(w / 2), 0], ...prof.slice().reverse().map(([x, z]) => [m(x), m(z)])];
    S.extrude(outer, [], 0, m(-14), RK, RK, { edgeLines: true, eave: m(2) });
    for (let i = 0; i < prof.length - 1; i++) { const [xa, za] = prof[i], [xb, zb] = prof[i + 1]; S.face([[m(xa), m(-14), m(za)], [m(xb), m(-14), m(zb)], [m(xb), 0, m(zb)], [m(xa), 0, m(za)]], GR, { n: [0, 0, 1], O: [m(xa), m(-14), m(za)], U: [1, 0, 0], V: [0, 1, 0], bias: 4, edgeMask: [2] }); }
    S.decal(m(-w / 2), m(w / 2), m(.05), 0, m(hgt - .9), mat(cliffFront(), w, { whole: true }), { wall: [0, m(hgt)], bias: 400, edges: false });   // the sculpted monument
    // a forest along the top edge, as on the real monument
    for (let i = 0; i < 16; i++) { const x = -w / 2 + 1.5 + i * (w - 3) / 15, rr = rng(i * 13 + 5)(); const tr = TW.tree({ kind: rr < .35 ? 'pine' : 'round', seed: 60 + i, h: 5 + rr * 3, r: 2.2 + rr, leaf: rr < .5 ? '#3f6e2e' : '#4f7f38' }); tr.sprites.forEach(sp => S.sprite(sp.p[0] + m(x), sp.p[1] + m(-1.5 - rr * 2), m(hgt + 1.4), sp.obj, { bias: 8 })); }
    for (const [x, y, s] of [[-18, -6, 1], [-6, -9, .8], [9, -5, 1.1], [19, -8, .9]]) { const tr = TW.tree({ kind: x > 0 ? 'pine' : 'round', seed: 30 + x, h: 6 * s, r: 2.4 * s, leaf: '#477a35' }), zb = m(hgt + 1);
      tr.sprites.forEach(sp => S.sprite(sp.p[0] + m(x), sp.p[1] + m(y), zb, sp.obj, { bias: 10 })); }
    return S; }
  function river(o) { o = o || {}; const S = new ISO.Scene(), b = base(), WT = mat(waterTex(), 6), w = o.w || 30, bw = (o.bw || 3.2) / 2;
    S.face([[m(-w / 2), m(-3), 0], [m(w / 2), m(-3), 0], [m(w / 2), m(3), 0], [m(-w / 2), m(3), 0]], WT, { n: [0, 0, 1], O: [m(-w / 2), m(-3), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    for (const y of [-3.4, 3]) S.box(m(-w / 2), m(w / 2), m(y), m(y + .4), m(-.1), m(.35), { front: b.STONE, top: b.STONE }, { bias: y > 0 ? 3 : -3 });
    // arched wooden bridge: stepped deck, rails, posts
    const N = 12; for (let i = 0; i < N; i++) { const y0 = -4 + i * 8 / N, y1 = y0 + 8 / N, z = Math.sin((i + .5) / N * Math.PI) * 1.4 + .35;
      S.box(m(-bw), m(bw), m(y0), m(y1), m(z - .2), m(z), { front: b.WOOD2, top: b.WOOD2 }, { bias: 10 }); }
    for (const x of [-bw + .05, bw - .05]) { const rail = []; for (let i = 0; i <= N; i++) { const y = -4 + i * 8 / N, z = Math.sin(i / N * Math.PI) * 1.4 + .35 + 1; rail.push([m(x), m(y), m(z)]);
        if (i % 3 === 0) S.tube([[m(x), m(y), m(z - 1)], [m(x), m(y), m(z + .05)]], m(.1), { color: '#c8432f' }, { bias: x > 0 ? 14 : 11 }); }
      S.tube(rail, m(.09), { color: '#d24a35' }, { bias: x > 0 ? 15 : 12 }); }
    return S; }

  /* the gallery plate */
  function plate(g, W, H, c) {
    const Z = .42, mpx = c.P * c.GM * Z, at = (x, y, b) => c.scene(g, W / 2 + x * mpx, H * .6 + y * mpx * c.SP, Z, b);
    const items = [[-30, -9, cliff], [-24, 6, academy], [4, 4, hospital], [24, 2, waterTower], [38, 6, torii], [-8, 18, river], [18, 16, target], [22, 17, target], [26, 15.5, () => TW.trainingPost()], [30, 17, () => TW.trainingPost()], [14, 19, () => TW.rock({ r: 1.2 })]];
    items.sort((a, b) => a[1] - b[1]).forEach(([x, y, b]) => at(x, y, b));
    [[-26, 8, 'student', 0], [-23, 9, 'student', 30], [-1, 7, 'medic', 0], [24, 21, 'jonin', 300], [20, 22, 'hero', 330]].forEach(([x, y, k, yaw]) => c.person(g, W / 2 + x * mpx, H * .6 + y * mpx * c.SP, Z, { yaw, look: c.LOOKS[k], anim: k === 'hero' ? 'attack' : 'idle', phase: .5 }));
  }
  return { carvedFace, cliffFront, academy, hospital, waterTower, torii, target, cliff, river, plate, note: 'Académie (arbre à balançoire), hôpital, grand château d’eau, torii, falaise aux visages des sept Gardien sculptés en relief, rivière et pont en arc, terrain d’entraînement avec cibles et poteaux.' };
})();
