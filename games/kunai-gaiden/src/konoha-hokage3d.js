/* Kunai Online — the Gardien residence, rebuilt from the anime references (day views):
   smooth red-orange drums with almost no windows, thin yellow-orange tiled skirts with draped ropes,
   the white 火 disc on the upper drum, a flat roof terrace with the 火 painted on it and a few big white horns at the front,
   low round annexes on both sides, a wide skirt at the base and a yellow-roofed entrance pavilion. Metres, shared ISO camera. */
window.KGARDIEN = (() => {
  const M = 24, K = KGATE, rng = K.rng;
  const T = {};
  function textures() {
    if (T.red) return T; Object.assign(T, K.textures());
    // smooth red plaster: soft mottling, darker toward the eaves, a thin pale base line
    T.red = ISO.texture('kh2-red', 256, 256, (g, W, H) => { const r = rng(43); g.fillStyle = '#2f7d8a'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 160; i++) { g.fillStyle = r() < .5 ? 'rgba(255,170,120,.10)' : 'rgba(120,20,10,.10)'; g.beginPath(); g.ellipse(r() * W, r() * H, 10 + r() * 30, 4 + r() * 10, 0, 0, 7); g.fill(); }
      for (let i = 0; i < 5; i++) { const x = r() * W, q = g.createLinearGradient(0, 0, 0, H); q.addColorStop(0, 'rgba(90,20,10,.12)'); q.addColorStop(1, 'rgba(90,20,10,0)'); g.fillStyle = q; g.fillRect(x, 0, 4 + r() * 8, H * .6); } });
    // yellow-orange roof tiles in horizontal courses (kawara), lighter crest on each row
    T.tile = ISO.texture('kh2-tile', 256, 128, (g, W, H) => { const r = rng(47), rowH = 16, tw = 14;
      for (let y = 0, row = 0; y < H; y += rowH, row++) { for (let x = -tw; x < W + tw; x += tw) { const X = x + (row % 2) * tw / 2, v = (r() - .5) * .12;
          g.fillStyle = '#f39a24'; g.fillRect(X, y, tw, rowH); g.fillStyle = v > 0 ? `rgba(255,240,180,${v})` : `rgba(140,60,0,${-v})`; g.fillRect(X, y, tw, rowH);
          const q = g.createLinearGradient(X, 0, X + tw, 0); q.addColorStop(0, 'rgba(255,240,170,.45)'); q.addColorStop(.4, 'rgba(255,240,170,0)'); q.addColorStop(1, 'rgba(150,60,0,.35)'); g.fillStyle = q; g.fillRect(X, y, tw, rowH);
          g.fillStyle = 'rgba(120,45,0,.55)'; g.fillRect(X + tw - 1, y, 1, rowH); }
        g.fillStyle = 'rgba(120,45,0,.6)'; g.fillRect(0, y + rowH - 2, W, 2); g.fillStyle = 'rgba(255,245,200,.5)'; g.fillRect(0, y, W, 1.5); } });
    T.terrace = ISO.texture('kh2-terrace', 256, 256, (g, W, H) => { const r = rng(53); g.fillStyle = '#cdbb9a'; g.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x += 32) for (let y = 0; y < H; y += 32) { g.fillStyle = `rgba(${r() < .5 ? '255,250,230' : '90,70,50'},${r() * .12})`; g.fillRect(x + 1, y + 1, 30, 30); g.strokeStyle = 'rgba(90,70,50,.35)'; g.lineWidth = 1.5; g.strokeRect(x + .5, y + .5, 31, 31); } });
    T.fireDisc = ISO.texture('kh2-fire', 512, 512, (g, W, H) => { g.clearRect(0, 0, W, H); g.fillStyle = '#f6f1e4'; g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 8, 0, 7); g.fill();
      g.lineWidth = 30; g.strokeStyle = '#1f5f6a'; g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 34, 0, 7); g.stroke(); g.lineWidth = 8; g.strokeStyle = '#5a1a12'; g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 8, 0, 7); g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold 300px ${K.JP}`; g.fillStyle = '#1f5f6a'; g.fillText('守', W / 2, H / 2 + 18); });
    T.fireRoof = ISO.texture('kh2-fireroof', 512, 512, (g, W, H) => { g.drawImage(T.terrace, 0, 0, W, H); g.drawImage(T.terrace, 256, 0, W / 2, H / 2); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold 330px ${K.JP}`; g.fillStyle = 'rgba(150,30,20,.85)'; g.fillText('守', W / 2, H / 2 + 20); });
    T.slot = ISO.texture('kh2-slot', 64, 96, (g, W, H) => { g.fillStyle = '#163a42'; g.fillRect(0, 0, W, H); g.fillStyle = '#1c2a30'; g.fillRect(8, 8, W - 16, H - 16); g.fillStyle = 'rgba(200,235,255,.25)'; g.fillRect(12, 12, 8, H - 24); });
    T.door = ISO.texture('kh2-door', 192, 192, (g, W, H) => { g.fillStyle = '#0f2a30'; g.fillRect(0, 0, W, H); g.fillStyle = '#1e4650'; g.fillRect(10, 10, W / 2 - 14, H - 10); g.fillRect(W / 2 + 4, 10, W / 2 - 14, H - 10); g.fillStyle = '#e8c36a'; g.fillRect(W / 2 - 12, H * .5, 8, 22); g.fillRect(W / 2 + 4, H * .5, 8, 22); });
    return T;
  }
  function build() {
    const t = textures(), S = new ISO.Scene(), m = v => v * M, mat = (tex, tw, x) => Object.assign({ tex, tw: m(tw) }, x || {});
    const RED = mat(t.red, 6), TILE = mat(t.tile, 3.2), STONE = mat(t.stone, 4), FLAG = mat(t.flag, 4), DARK = mat(t.dark, 2), PLANK = mat(t.wall2, 4.5);
    const white = { color: '#f4efe4', shine: 'rgba(255,255,255,.9)' }, rope = { color: '#dcc58e', shine: 'rgba(255,250,225,.8)' };
    const arcPts = (r, z, a0, a1, n) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([Math.cos(a) * m(r), Math.sin(a) * m(r), m(z)]); } return p; };
    const skirt = (r0, r1, z0, z1, seg, bias) => { S.frustum(0, 0, m(r0), m(r0), m(z0 - .25), m(z0), DARK, { seg, bias: bias - 1 }); S.frustum(0, 0, m(r0), m(r1), m(z0), m(z1), TILE, { seg, bias }); };
    const ropes = (r, z, n, bias) => { const path = []; for (let i = 0; i <= n * 10; i++) { const a = -.15 + (Math.PI + .3) * i / (n * 10), sag = Math.sin((i % 10) / 10 * Math.PI) * .45; path.push([Math.cos(a) * m(r), Math.sin(a) * m(r), m(z - sag)]); }
      S.tube(path, m(.22), rope, { bias }); for (let i = 0; i <= n; i++) { const a = -.15 + (Math.PI + .3) * i / n; S.sphere(Math.cos(a) * m(r), Math.sin(a) * m(r), m(z), m(.22), { color: '#e8d9a8' }, { bands: 3, seg: 8, bias: bias + 1 }); } };

    // courtyard, path, low ring wall open toward the village
    S.disc(0, 0, m(22), 0, FLAG, { ground: true, seg: 64 });
    S.face([[m(-3), m(19), 0], [m(3), m(19), 0], [m(3.6), m(30), 0], [m(-3.6), m(30), 0]], FLAG, { n: [0, 0, 1], O: [m(-3.6), m(19), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.ringWall(0, 0, m(21.6), m(22.3), 0, m(1.8), Math.PI / 2 + .2, Math.PI / 2 - .2 + Math.PI * 2, mat(t.red, 5), TILE, { seg: 64 });

    // side annexes: low red drums with a yellow skirt and a flat top
    for (const sd of [-1, 1]) { const cx = m(14.5 * sd), cy = m(-5);
      S.cylinder(cx, cy, m(5.6), 0, m(6.5), RED, 30, { cap: false, eave: m(.8) });
      S.frustum(cx, cy, m(6.4), m(6.4), m(6.25), m(6.5), DARK, { seg: 30, bias: 1 }); S.frustum(cx, cy, m(6.4), m(5.4), m(6.5), m(7.4), TILE, { seg: 30, bias: 2 });
      S.cylinder(cx, cy, m(5.2), m(7.4), m(7.9), RED, 30, { bias: 3, capMat: mat(t.terrace, 4) });
      S.decal(cx - m(.5), cx + m(.5), cy + m(5.62), m(3.4), m(4.9), mat(t.slot, 1, { whole: true }), { wall: [0, m(6.5)], bias: 4 }); }

    // base: a wide low skirt all around the main drum
    S.cylinder(0, 0, m(15.2), 0, m(2.6), RED, 56, { cap: false, eave: m(.6) });
    skirt(16.6, 14.6, 2.6, 3.7, 56, 2);
    // main drum
    S.cylinder(0, 0, m(12.6), m(3.5), m(10.4), RED, 52, { cap: false, eave: m(1) });
    skirt(13.9, 12, 10.4, 11.5, 52, 2);
    ropes(13.95, 10.3, 12, 40);
    // upper drum with the 火 disc and a few small windows
    S.cylinder(0, 0, m(10.2), m(11.3), m(15.6), RED, 46, { cap: false, eave: m(.8) });
    // windows laid tangent to the drum (an axis-aligned quad stuck out of the curve on the sides)
    for (const a of [Math.PI / 2 - .55, Math.PI / 2 + .55]) { const rr = m(10.2 + .04), x = Math.cos(a) * rr, y = Math.sin(a) * rr, ux = Math.sin(a), uy = -Math.cos(a), hw = m(.45);
      const A = [x - ux * hw, y - uy * hw], Bq = [x + ux * hw, y + uy * hw];
      S.face([[A[0], A[1], m(12.4)], [Bq[0], Bq[1], m(12.4)], [Bq[0], Bq[1], m(13.8)], [A[0], A[1], m(13.8)]], mat(t.slot, .9, { whole: true }), { n: [Math.cos(a), Math.sin(a), 0], O: [A[0], A[1], m(13.8)], U: [ux, uy, 0], V: [0, 0, -1], bias: 30 }); }
    const er = m(2.4), ec = [0, m(10.2) + m(.1), m(13.4)], ep = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; ep.push([ec[0] + Math.cos(a) * er, ec[1], ec[2] + Math.sin(a) * er]); }
    S.face(ep, mat(t.fireDisc, 4.8, { whole: true }), { n: [0, 1, 0], O: [ec[0] - er, ec[1], ec[2] + er], U: [1, 0, 0], V: [0, 0, -1], bias: 31 });
    skirt(11.2, 9.8, 15.6, 16.4, 46, 2);
    ropes(11.25, 15.5, 10, 41);
    // roof terrace: red parapet ring, flat floor with the 火, a small dome hatch
    S.cylinder(0, 0, m(9.6), m(16.3), m(17.2), RED, 44, { cap: false, bias: 3 });
    S.disc(0, 0, m(9.6), m(17.2), mat(t.fireRoof, 19.2, { whole: true }), { seg: 44, bias: 4 });
    S.ringWall(0, 0, m(9.1), m(9.6), m(17.2), m(17.7), 0, Math.PI * 2, RED, mat(t.red, 3), { seg: 44, bias: 5 });
    S.cylinder(m(3.6), m(-3.6), m(1.1), m(17.2), m(17.9), RED, 16, { cap: false, bias: 8 }); S.sphere(m(3.6), m(-3.6), m(17.9), m(1.1), { color: '#d9c9a8' }, { bands: 4, seg: 16, squash: .6, bias: 9 });
    // the big white horns at the front of the roof, curving up and outward
    for (const a of [Math.PI / 2 - .7, Math.PI / 2 - .24, Math.PI / 2 + .24, Math.PI / 2 + .7]) { const c = Math.cos(a), sn = Math.sin(a), path = [];
      for (let k = 0; k <= 14; k++) { const u = k / 14, r = 9.2 + Math.pow(u, 1.8) * 3.4, z = 17.3 + Math.sin(u * 1.35) * 4.4; path.push([c * m(r), sn * m(r), m(z)]); }
      S.tube(path.slice(0, 9), m(.7), white, { bias: 60 }); S.tube(path.slice(7, 12), m(.5), white, { bias: 61 }); S.tube(path.slice(11), m(.3), white, { bias: 62 }); }

    // entrance pavilion with a yellow tiled roof and red pillars
    S.box(m(-3.6), m(3.6), m(14.4), m(18.6), 0, m(3.8), { front: RED, top: DARK }, { bias: 6, eave: m(.8) });
    S.decal(m(-1.6), m(1.6), m(18.62), 0, m(3.2), mat(t.door, 3.2, { whole: true }), { wall: [0, m(3.8)], bias: 7 });
    for (const x of [-3, 3]) S.cylinder(m(x), m(19.3), m(.3), 0, m(3.8), { color: '#25707c' }, 12, { bias: 8, cap: false });
    S.box(m(-4), m(4), m(18.6), m(20), 0, m(.4), { front: STONE, top: STONE }, { bias: 5 });
    S.gable(m(-4.2), m(4.2), m(14), m(20.2), m(3.8), m(5.6), TILE, { over: m(.5), fascia: DARK, bias: 10 });
    return S;
  }
  return { build, textures };
})();
