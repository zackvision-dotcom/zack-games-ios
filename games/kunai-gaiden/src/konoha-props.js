/* Kunai Online — street props for Aozora (ISO scenes, metres, front = +y). */
window.KPROPS = (() => {
  const M = 24, K = KGATE, TW = KTOWN, rng = K.rng, JP = K.JP, m = v => v * M;
  const mat = (t, tw, x) => Object.assign({ tex: t, tw: m(tw) }, x || {});
  const base = () => { const t = K.textures(); return { WOOD: mat(t.wall, 3), WOOD2: mat(t.wall2, 3), DARK: mat(t.dark, 1.5), STONE: mat(t.stone, 3) }; };
  const tex = (id, w, h, fn) => ISO.texture('kp-' + id, w, h, fn);
  const cloth = (a, b) => tex('cl' + a + b, 128, 128, (g, W, H) => { for (let x = 0; x < W; x += 32) { g.fillStyle = (x / 32) % 2 ? a : b; g.fillRect(x, 0, 32, H); } g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 1); });
  const label = (text, bg, fg) => tex('lb' + text + bg, 192, 96, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(30,15,5,.8)'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${Math.min(60, W / text.length * .85)}px ${JP}`; g.fillText(text, W / 2, H / 2 + 2); });
  const produce = ['#e2483a', '#f2a23a', '#7fbf4a', '#f4d35e', '#9a5ad0'];

  function stall(o) { o = Object.assign({ a: '#c8352c', b: '#f4efe2', seed: 1, sign: '八百屋' }, o); const S = new ISO.Scene(), b = base(), r = rng(o.seed);
    S.box(m(-1.6), m(1.6), m(-.8), m(.6), 0, m(.9), { front: b.WOOD, top: b.DARK });
    for (let i = 0; i < 6; i++) { const x = -1.3 + (i % 3) * 1.3, y = -.4 + Math.floor(i / 3) * .7; S.box(m(x - .5), m(x + .5), m(y - .25), m(y + .25), m(.9), m(1.05), { front: b.WOOD2, top: b.WOOD2 }, { bias: 3 });
      for (let k = 0; k < 4; k++) S.sphere(m(x - .3 + (k % 2) * .55 + r() * .1), m(y - .05 + Math.floor(k / 2) * .2), m(1.12), m(.14), { color: produce[(i + k) % 5] }, { bands: 3, seg: 8, bias: 4 }); }
    for (const x of [-1.6, 1.5]) for (const y of [-.8, .5]) S.box(m(x), m(x + .1), m(y), m(y + .1), 0, m(2.4), { front: b.DARK }, { bias: y > 0 ? 5 : -1 });
    S.face([[m(-1.9), m(-1), m(2.6)], [m(1.9), m(-1), m(2.6)], [m(1.9), m(1.1), m(2.1)], [m(-1.9), m(1.1), m(2.1)]], mat(cloth(o.a, o.b), 1.4), { O: [m(-1.9), m(-1), m(2.6)], U: [1, 0, 0], V: ISO.norm([0, 2.1, -.5]), bias: 8 });
    S.decal(m(-.7), m(.7), m(.62), m(.15), m(.75), mat(label(o.sign, '#f2e2b4', '#7a1f14'), 1.4, { whole: true }), { bias: 6 });
    return S; }
  function cart() { const S = new ISO.Scene(), b = base(); S.box(m(-1.2), m(1.2), m(-.6), m(.6), m(.6), m(1), { front: b.WOOD2, top: b.WOOD2 });
    for (const x of [-1.2, 1.1]) S.box(m(x), m(x + .1), m(-.6), m(.6), m(1), m(1.4), { front: b.WOOD, top: b.WOOD }, { bias: 2 });
    for (const y of [-.7, .62]) { const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; pts.push([Math.cos(a) * m(.55), m(y), m(.55) + Math.sin(a) * m(.55)]); } S.face(pts, { color: '#6b4428' }, { n: [0, y > 0 ? 1 : -1, 0], bias: y > 0 ? 6 : -2 });
      if (y > 0) for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI; S.tube([[Math.cos(a) * m(.5), m(y + .02), m(.55) + Math.sin(a) * m(.5)], [-Math.cos(a) * m(.5), m(y + .02), m(.55) - Math.sin(a) * m(.5)]], m(.04), { color: '#3a2416' }, { bias: 7, shine: false }); } }
    S.tube([[m(1.2), 0, m(.8)], [m(2.6), 0, m(.5)]], m(.06), { color: '#6b4428' }, { bias: 3 });
    for (let i = 0; i < 3; i++) S.box(m(-.9 + i * .6), m(-.4 + i * .6), m(-.4), m(.2), m(1), m(1.4), { front: { color: '#c9a35a' }, top: { color: '#e2c27a' } }, { bias: 4 });
    return S; }
  function barrels() { const S = new ISO.Scene(), b = base();
    for (const [x, y, z] of [[-.5, 0, 0], [.5, 0, 0], [0, .1, 1]]) { S.cylinder(m(x), m(y), m(.45), m(z), m(z + .95), b.WOOD, 14, { bias: z ? 4 : 1 }); for (const h of [.2, .75]) S.frustum(m(x), m(y), m(.47), m(.47), m(z + h), m(z + h + .07), { color: '#4a4f55' }, { seg: 14, bias: z ? 5 : 2 }); }
    S.box(m(.9), m(1.6), m(-.3), m(.4), 0, m(.7), { front: b.WOOD2, top: b.WOOD2 }, { bias: 2 }); S.box(m(1), m(1.5), m(-.2), m(.3), m(.7), m(1.15), { front: b.WOOD2, top: b.WOOD2 }, { bias: 3 });
    return S; }
  function laundry() { const S = new ISO.Scene(), b = base(), cols = ['#f4efe2', '#4f7fc0', '#e2483a', '#f4d35e', '#7fbf4a'];
    for (const x of [-2.2, 2.2]) S.box(m(x - .06), m(x + .06), m(-.06), m(.06), 0, m(2.1), { front: b.DARK, top: b.DARK }, { bias: 1 });
    const line = []; for (let i = 0; i <= 12; i++) { const x = -2.2 + 4.4 * i / 12; line.push([m(x), 0, m(2 - Math.sin(i / 12 * Math.PI) * .2)]); } S.tube(line, m(.02), { color: '#ddd' }, { bias: 2, shine: false });
    for (let i = 0; i < 5; i++) { const x = -1.7 + i * .85, z = 2 - Math.sin((x + 2.2) / 4.4 * Math.PI) * .2, w = .32 + (i % 2) * .1, hh = .7 + (i % 3) * .15;
      S.face([[m(x - w), m(.02), m(z - hh)], [m(x + w), m(.02), m(z - hh)], [m(x + w), m(.02), m(z)], [m(x - w), m(.02), m(z)]], { color: cols[i] }, { n: [0, 1, 0], bias: 3 }); }
    return S; }
  function signpost(o) { o = Object.assign({ text: ['守護', '茶屋', '学校'] }, o); const S = new ISO.Scene(), b = base();
    S.box(m(-.08), m(.08), m(-.08), m(.08), 0, m(2.4), { front: b.DARK, top: b.DARK });
    o.text.forEach((t, i) => { const z = 2.1 - i * .5, d = i % 2 ? -1 : 1; S.face([[m(d > 0 ? .05 : -1.25), m(.1), m(z - .3)], [m(d > 0 ? 1.25 : -.05), m(.1), m(z - .3)], [m(d > 0 ? 1.25 : -.05), m(.1), m(z)], [m(d > 0 ? .05 : -1.25), m(.1), m(z)]], mat(label(t, '#d9b16a', '#3a2216'), 1.2, { whole: true }), { n: [0, 1, 0], O: [m(d > 0 ? .05 : -1.25), m(.1), m(z)], U: [1, 0, 0], V: [0, 0, -1], bias: 3 + i }); });
    return S; }
  function well() { const S = new ISO.Scene(), b = base(); S.ringWall(0, 0, m(.8), m(1.1), 0, m(.8), 0, Math.PI * 2, b.STONE, b.STONE, { seg: 20 }); S.disc(0, 0, m(.8), m(.3), { color: '#2a4a5a' }, { seg: 20, bias: -2 });
    for (const x of [-1, .95]) S.box(m(x), m(x + .1), m(-.05), m(.05), m(.8), m(2.3), { front: b.DARK, top: b.DARK }, { bias: 3 });
    S.gable(m(-1.3), m(1.3), m(-.8), m(.8), m(2.2), m(2.8), mat(TW.tiles('#4a5f86', 5), 2), { over: m(.2), bias: 5 });
    S.tube([[0, 0, m(2.2)], [0, 0, m(1.2)]], m(.02), { color: '#c9a35a' }, { bias: 4, shine: false }); S.cylinder(0, 0, m(.2), m(.9), m(1.2), b.WOOD, 8, { bias: 4 });
    return S; }
  function vending() { const S = new ISO.Scene(); S.box(m(-.5), m(.5), m(-.4), m(.4), 0, m(1.9), { front: { color: '#e2483a' }, top: { color: '#c23a2c' } });
    S.decal(m(-.4), m(.4), m(.41), m(.9), m(1.75), mat(tex('vend', 96, 96, (g, W, H) => { g.fillStyle = '#d8eef2'; g.fillRect(0, 0, W, H); const cols = ['#3fa2ff', '#7fbf4a', '#f2a23a', '#e2483a']; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { g.fillStyle = cols[(r + c) % 4]; g.fillRect(8 + c * 21, 10 + r * 28, 14, 20); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(10 + c * 21, 12 + r * 28, 3, 14); } }), .8, { whole: true }), { bias: 3 });
    S.decal(m(-.3), m(.3), m(.41), m(.2), m(.5), { color: '#222' }, { bias: 3 }); return S; }
  function lanternLine(o) { o = Object.assign({ len: 8 }, o); const S = new ISO.Scene(), b = base();
    for (const x of [0, o.len]) S.box(m(x - .08), m(x + .08), m(-.08), m(.08), 0, m(3.4), { front: b.DARK, top: b.DARK }, { bias: 1 });
    const line = []; for (let i = 0; i <= 16; i++) { const x = o.len * i / 16; line.push([m(x), 0, m(3.3 - Math.sin(i / 16 * Math.PI) * .5)]); } S.tube(line, m(.02), { color: '#222' }, { bias: 2, shine: false });
    for (let i = 1; i < 8; i++) { const x = o.len * i / 8, z = 3.3 - Math.sin(i / 8 * Math.PI) * .5 - .45; S.sphere(m(x), 0, m(z), m(.28), { color: '#e8402f' }, { bands: 5, seg: 12, squash: 1.3, bias: 4 }); S.cylinder(m(x), 0, m(.12), m(z + .33), m(z + .42), { color: '#2a2224' }, 8, { bias: 5 }); }
    return S; }
  function flowerBed(o) { o = Object.assign({ w: 3, seed: 2 }, o); const S = new ISO.Scene(), b = base(), r = rng(o.seed);
    S.box(m(-o.w / 2), m(o.w / 2), m(-.5), m(.5), 0, m(.35), { front: b.STONE, top: { color: '#6a4a30' } });
    for (let i = 0; i < o.w * 6; i++) { const x = -o.w / 2 + .2 + r() * (o.w - .4), y = -.35 + r() * .7; S.sphere(m(x), m(y), m(.45), m(.12 + r() * .06), { color: ['#e86a8a', '#f4d35e', '#ffffff', '#b06ad0', '#ff9a4a'][i % 5] }, { bands: 3, seg: 7, bias: 2 + y * 10 }); }
    return S; }
  return { stall, cart, barrels, laundry, signpost, well, vending, lanternLine, flowerBed };
})();
