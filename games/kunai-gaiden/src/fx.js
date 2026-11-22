/* Kunai Online — combat effects and thrown weapons, vector and animated: FX.draw(g, kind, t, o).
   t loops 0..1; o.size scales (1 ≈ a 92 px ninja). All shapes are original. */
window.FX = (() => {
  const TAU = Math.PI * 2, INK = '#141019';
  const rnd = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const glow = (g, x, y, r, inner, outer) => { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, inner); q.addColorStop(1, outer); g.fillStyle = q; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
  const blob = (g, x, y, r, n, wob, ph) => { g.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = r * (1 + wob * Math.sin(a * 3 + ph) * .5 + wob * Math.sin(a * 5 - ph * 1.3) * .3); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };

  function kunai(g, t, o) { // flying kunai, slight wobble, motion trail
    g.save(); g.rotate((o.angle || 0) + Math.sin(t * TAU * 3) * .04);
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, 0); g.lineTo(-18, 0); g.stroke();
    g.fillStyle = '#c9d2d8'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(26, 0); g.lineTo(4, -6); g.lineTo(-2, 0); g.lineTo(4, 6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(24, 0); g.lineTo(5, -4); g.lineTo(2, 0); g.closePath(); g.fill();
    g.fillStyle = '#2a2531'; g.fillRect(-16, -2.4, 15, 4.8); g.strokeRect(-16, -2.4, 15, 4.8); g.fillStyle = '#e8e2d4'; for (let x = -14; x < -2; x += 4) g.fillRect(x, -2.4, 1.5, 4.8);
    g.beginPath(); g.arc(-20, 0, 4, 0, TAU); g.lineWidth = 2.2; g.stroke(); g.restore(); }
  function shuriken(g, t, o) { g.save(); g.rotate(t * TAU * 4);
    for (let i = 0; i < 4; i++) { g.rotate(TAU / 4); g.beginPath(); g.moveTo(0, -4); g.lineTo(16, -1.5); g.quadraticCurveTo(9, 2, 4, 4); g.closePath(); g.fillStyle = i % 2 ? '#aeb8bf' : '#cdd5da'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.8; g.stroke(); }
    g.fillStyle = '#2a2531'; g.beginPath(); g.arc(0, 0, 4, 0, TAU); g.fill(); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.stroke(); }
  function fireball(g, t, o) { // rolling ball of flame with a trailing tail
    const r = rnd(7), ph = t * TAU;
    for (let i = 7; i >= 0; i--) { const k = i / 7, x = -k * 70 + Math.sin(ph * 2 + i) * 4, y = Math.sin(ph * 3 + i * 1.3) * 5 * k, rr = 30 * (1 - k * .75);
      g.globalAlpha = .5 + (1 - k) * .5; glow(g, x, y, rr * 1.6, 'rgba(255,170,60,.55)', 'rgba(255,90,20,0)');
      blob(g, x, y, rr, 26, .35, ph * 3 + i); g.fillStyle = k > .6 ? '#c43a1c' : '#ff6a22'; g.fill(); }
    g.globalAlpha = 1; blob(g, 4, 0, 22, 26, .28, ph * 4); g.fillStyle = '#ffb33a'; g.fill(); blob(g, 8, -2, 13, 20, .3, -ph * 5); g.fillStyle = '#fff2b0'; g.fill();
    g.lineWidth = 2.2; g.strokeStyle = 'rgba(120,20,10,.55)'; blob(g, 4, 0, 30, 26, .35, ph * 3); g.stroke();
    for (let i = 0; i < 8; i++) { const a = r() * TAU, d = 30 + ((t * 60 + r() * 60) % 50); g.fillStyle = `rgba(255,${150 + r() * 80 | 0},60,${1 - d / 80})`; g.beginPath(); g.arc(-d * .8, Math.sin(a) * d * .35, 2 + r() * 2.5, 0, TAU); g.fill(); } }
  function chakraSphere(g, t, o) { // spinning sphere of chakra held in a palm
    const ph = t * TAU; glow(g, 0, 0, 52, 'rgba(160,220,255,.55)', 'rgba(60,140,255,0)');
    g.save(); g.beginPath(); g.arc(0, 0, 26, 0, TAU); g.clip(); glow(g, -6, -6, 34, '#f2fbff', '#3d8ff0');
    for (let i = 0; i < 9; i++) { const a = ph * 3 + i * TAU / 9; g.strokeStyle = `rgba(255,255,255,${.35 + .4 * (i % 2)})`; g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, 0, 26, 9 + (i % 3) * 5, a, 0, Math.PI * 1.3); g.stroke(); }
    g.restore(); g.strokeStyle = 'rgba(20,60,140,.8)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 26, 0, TAU); g.stroke();
    for (let i = 0; i < 4; i++) { const a = -ph * 2 + i * TAU / 4; g.strokeStyle = 'rgba(200,240,255,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 32 + (i % 2) * 6, a, a + .9); g.stroke(); } }
  function lightning(g, t, o) { const r = rnd(11 + Math.floor(t * 12)); glow(g, 0, 0, 46, 'rgba(210,230,255,.6)', 'rgba(120,150,255,0)');
    for (let b = 0; b < 6; b++) { let x = 0, y = 0, a = r() * TAU; g.beginPath(); g.moveTo(0, 0); for (let k = 0; k < 6; k++) { a += (r() - .5) * 1.2; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); }
      g.strokeStyle = 'rgba(120,160,255,.6)'; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#f4f8ff'; g.lineWidth = 2; g.stroke(); }
    glow(g, 0, 0, 14, '#ffffff', 'rgba(180,210,255,.2)'); }
  function windSlash(g, t, o) { const k = t, w = 70 * (.3 + k); g.save(); g.globalAlpha = 1 - k * .8;
    for (let i = 0; i < 3; i++) { g.strokeStyle = i ? 'rgba(220,255,240,.55)' : 'rgba(255,255,255,.9)'; g.lineWidth = 6 - i * 1.6; g.beginPath(); g.arc(-20 + k * 40 - i * 8, 0, w - i * 10, -.9, .9); g.stroke(); }
    g.restore(); }
  function waterBullet(g, t, o) { const ph = t * TAU;
    for (let i = 5; i >= 0; i--) { const k = i / 5; g.globalAlpha = .4 + (1 - k) * .6; blob(g, -k * 46, Math.sin(ph * 2 + i) * 3, 18 * (1 - k * .6), 20, .2, ph * 2 + i); g.fillStyle = k > .5 ? '#3a86c8' : '#5fb3e8'; g.fill(); }
    g.globalAlpha = 1; blob(g, 2, 0, 18, 22, .15, ph * 3); g.fillStyle = '#7fd0f5'; g.fill(); g.strokeStyle = 'rgba(20,60,110,.7)'; g.lineWidth = 2; g.stroke(); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(7, -6, 6, 3, -.4, 0, TAU); g.fill(); }
  function smoke(g, t, o) { // substitution puff: blooms then fades
    const r = rnd(5), k = t, s = .4 + k * 1.1; g.globalAlpha = Math.min(1, (1 - k) * 1.6);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + r(), d = 18 * s * (.6 + r() * .6), rr = 20 * s * (.7 + r() * .5);
      blob(g, Math.cos(a) * d, Math.sin(a) * d * .7 - k * 10, rr, 18, .18, i); g.fillStyle = i % 2 ? '#f0ece6' : '#dcd6ce'; g.fill(); g.strokeStyle = 'rgba(90,80,80,.45)'; g.lineWidth = 2; g.stroke(); }
    g.globalAlpha = 1; }
  function leafSwirl(g, t, o) { const r = rnd(3); for (let i = 0; i < 18; i++) { const a = t * TAU * 1.5 + i * TAU / 18 + r() * .3, d = 20 + (i % 3) * 12 + t * 14, x = Math.cos(a) * d, y = Math.sin(a) * d * .45 - t * 40 + (i % 4) * 4;
      g.save(); g.translate(x, y); g.rotate(a * 2); g.fillStyle = ['#7fbf4a', '#5a9a3a', '#a8d65a'][i % 3]; g.beginPath(); g.ellipse(0, 0, 6, 2.6, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(30,60,20,.7)'; g.lineWidth = 1; g.stroke(); g.restore(); } }
  function hit(g, t, o) { const k = t, r = rnd(9); g.save(); g.globalAlpha = 1 - k; glow(g, 0, 0, 30 * (.5 + k), 'rgba(255,250,220,.9)', 'rgba(255,200,80,0)');
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + r() * .3, l0 = 8 + k * 20, l1 = l0 + 14 + r() * 10; g.strokeStyle = i % 2 ? '#fff6c8' : '#ffb84a'; g.lineWidth = 3.4 * (1 - k) + 1; g.beginPath(); g.moveTo(Math.cos(a) * l0, Math.sin(a) * l0); g.lineTo(Math.cos(a) * l1, Math.sin(a) * l1); g.stroke(); }
    g.restore(); }
  function aura(g, t, o) { const ph = t * TAU, col = o.color || [90, 190, 255];
    for (let i = 0; i < 7; i++) { const x = (i - 3) * 9, hgt = 70 + Math.sin(ph * 2 + i) * 14; g.fillStyle = `rgba(${col},${.18 + .1 * (i % 2)})`; g.beginPath(); g.moveTo(x - 12, 0); g.quadraticCurveTo(x - 8 + Math.sin(ph + i) * 6, -hgt * .6, x + Math.sin(ph * 3 + i) * 5, -hgt); g.quadraticCurveTo(x + 10, -hgt * .5, x + 12, 0); g.closePath(); g.fill(); }
    g.strokeStyle = `rgba(${col},.6)`; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, 34, 9, 0, 0, TAU); g.stroke(); }
  const KINDS = { kunai, shuriken, fireball, chakraSphere, lightning, windSlash, waterBullet, smoke, leafSwirl, hit, aura };
  function draw(g, kind, t, o) { o = o || {}; g.save(); const s = o.size || 1; g.scale(s, s); try { KINDS[kind](g, ((t % 1) + 1) % 1, o); } finally { g.restore(); } }
  return { draw, kinds: Object.keys(KINDS), LABELS: { kunai: 'Kunai', shuriken: 'Shuriken', fireball: 'Boule de feu', chakraSphere: 'Sphère de souffle', lightning: 'Éclair', windSlash: 'Lame de vent', waterBullet: 'Balle d’eau', smoke: 'Fumée (substitution)', leafSwirl: 'Tourbillon de feuilles', hit: 'Impact', aura: 'Aura de souffle' } };
})();
