// Braise scenes for the BETA IA simulated player (shared core: beta.js, copied by games-kit/sync.py; spec: ZVisionAI/partage/spec-mode-beta-ia.md).
// Every action is a real touch gesture: a tap on a tuft, a tree or an animal (Ka walks there and acts), a tap on the ground
// (Ka walks), the Atelier button, a tab and a recipe of the workshop, a tap on the ground to set the fire down, a tap on a
// bag slot to take the spear. Loaded last; build.py exposes BRAISE_DEV (positions, state) only with ?beta=ia or ?shots=1.
(() => {
  if (!window.BETA || !BETA.on) return;
  const $ = s => document.querySelector(s), D = () => window.BRAISE_DEV;
  // clean takes: no save line, no Deus button or panel (a tester's tool), no first-run tutorial layer
  if (BETA.opts.ui === 'propre') { const st = document.createElement('style');
    st.textContent = '#saveStatus,#deusBtn,#deusPanel,#tuto,#hover,[data-language-picker]{display:none!important}'; document.head.appendChild(st); }
  try { localStorage.setItem('braise_tuto', '1'); } catch (e) {}   // the tutorial has been seen: a player in the middle of a game
  const canvas = () => $('#game canvas') || $('canvas');
  const P = () => D().P();
  // screen position (page pixels) of a point of the world
  const scr = (x, y) => { const r = canvas().getBoundingClientRect(), p = D().W2S(x, y); return [r.left + p[0], r.top + p[1]]; };
  const inView = ([x, y]) => x > 70 && x < innerWidth - 150 && y > 90 && y < innerHeight - 110;
  const dist = e => Math.hypot(e.x - P().x, e.y - P().y);
  const near = (list, test, max) => list.filter(e => !e.dead && test(e) && dist(e) < (max || 700) && inView(scr(e.x, e.y - 20))).sort((a, b) => dist(a) - dist(b));
  const item = id => P().items.findIndex(s => s && s.id === id);

  async function tapWorld(A, x, y, label) { const [sx, sy] = scr(x, y); await A.tap(sx, sy, label); }
  async function walk(A, dx, dy) { await tapWorld(A, P().x + dx, P().y + dy, 'marcher'); await A.wait(A.jitter(700, 1000)); }
  // a target is reached and acted on when Ka stops: wait for it (or give up after a while)
  async function until(A, test, ms) { const t0 = performance.now(); while (A.running() && !test() && performance.now() - t0 < ms) await A.wait(120); }

  async function gather(A, n) {   // tufts, saplings and berry bushes near Ka: tap, Ka walks there and picks
    for (let k = 0; k < n && A.running(); k++) {
      const e = near(D().statics(), e => ['tuft', 'sapling', 'berry', 'carrot', 'mushroom', 'flower'].includes(e.type) && !e.picked, 520)[0]; if (!e) { await walk(A, A.jitter(-160, 160), A.jitter(-60, 60)); continue; }
      await A.think(); await tapWorld(A, e.x + A.jitter(-4, 4), e.y - 12, 'ramasser ' + e.type);
      await until(A, () => e.picked || e.dead, 3500); A.mark('récolte'); await A.wait(A.jitter(250, 450)); }
  }
  async function chop(A) {   // a tree felled with the axe (Ka swings until it falls)
    const i = item('axe'); if (i >= 0 && !(P().hand && P().hand.id === 'axe')) { await A.tapEl(`#inv .slot[data-i="${i}"]`, 'prendre la hache'); await A.wait(400); }
    const e = near(D().statics(), e => ['pine', 'oak', 'dead'].includes(e.type) && !e.sourceFire, 600)[0]; if (!e) return;   // not the lightning-struck acacia (that one is captured, not felled)
    const logs = P().stats.logs; await A.think(); await tapWorld(A, e.x, e.y - 30, 'abattre ' + e.type);
    for (let k = 0; k < 6 && A.running() && P().stats.logs === logs; k++) { await until(A, () => !P().target || P().stats.logs > logs, 2600); if (P().stats.logs > logs || e.dead) break; await A.wait(A.jitter(500, 800)); await tapWorld(A, e.x, e.y - 30, 'abattre ' + e.type); }
    if (P().stats.logs > logs) A.mark('arbre abattu');
  }
  async function fire(A) { const ok = await fire1(A); if (!ok) { try { D().closeCraft && D().closeCraft(); } catch (e) {} if (D().placing() && window.BRAISE_TOUCH) BRAISE_TOUCH.cancel(); } return ok; }
  async function fire1(A) {   // the workshop: Atelier, the "light" tab, Campfire, then a tap on the ground where it goes
    await A.think(); if (!(await A.tapEl('#tCraft', 'atelier'))) return false; await A.wait(A.jitter(350, 550));
    await A.tapEl('#craft .tab[data-tab="light"]', 'onglet lumière'); await A.wait(A.jitter(400, 600));
    const R = D().RECIPES || [], rec = [...document.querySelectorAll('#rec .rec, .rec')].find(el => R[+el.dataset.r] && R[+el.dataset.r].id === 'campfire');
    if (!rec) return false; await A.tapEl(rec, 'fabriquer un feu de camp'); await A.wait(A.jitter(500, 700));
    if (!D().placing()) return false;
    const n0 = D().fires().length; let ok = false;
    for (const [dx, dy] of [[95, 25], [-95, 30], [60, 80], [-70, -70], [120, -40]]) { await tapWorld(A, P().x + dx, P().y + dy, 'poser le feu'); await A.wait(300); if (P().target && P().target.place) { ok = true; break; } }
    if (!ok) return false; await until(A, () => D().fires().length > n0, 4000); if (D().fires().length > n0) { A.mark('feu allumé'); return true; } return false;
  }
  async function spear(A) { const i = item('spear'); if (i >= 0) { await A.tapEl(`#inv .slot[data-i="${i}"]`, 'prendre la lance'); await A.wait(400); } }
  async function hunt(A, ms, home) {   // tap the beast (hyena, wolf, antelope) again and again until it falls
    const t0 = performance.now(); let kills = P().stats.kills;
    while (A.running() && performance.now() - t0 < ms) {
      const m = near(D().mobs(), m => ['hyena', 'antelope', 'machairodont', 'wolf'].includes(m.kind) && m.dying == null && !m.hidden, 900)[0];
      if (P().hp < P().maxHp * .4) P().hp = P().maxHp * .8;   // a take never ends on Ka's death
      if (home && Math.hypot(P().x - home.x, P().y - home.y) > 170) { await tapWorld(A, home.x + A.jitter(-40, 40), home.y + 40, 'revenir au feu'); await A.wait(700); continue; }
      if (!m) { await A.wait(300); continue; }
      await tapWorld(A, m.x + A.jitter(-6, 6), m.y - 26, 'attaquer ' + m.kind); await A.wait(A.jitter(450, 700));
      if (P().stats.kills > kills) { kills = P().stats.kills; A.mark('bête abattue'); }
    }
  }
  function beasts(n, r) { D().hyenas(n, r); for (const m of D().mobs()) if (m.kind === 'hyena' && dist(m) < r + 60) { m.angry = 30; m.state = 'stalk'; } }
  function setUp(kind) {   // a Ka who has played a while: tools made, a little stock, the first goals done
    const p = P(); Object.assign(p.stats, { gotTwig: true, gotFlint: true, logs: 2, days: 2 }); p.stats.crafted.axe = 1;
    D().give('axe', 1); D().give('spear', 1); D().give('grass', 9); D().give('log', 6); D().give('twigs', 4); D().give('flint', 2);
    if (D().capture) D().capture();   // the acacia's fire is already captured: the campfire recipe is open
    p.hp = p.maxHp; p.hunger = p.maxHunger * .8; p.san = p.maxSan * .9;
  }
  async function start(A, era) {
    for (let i = 0; i < 600 && !$('#btnStart'); i++) await A.wait(100);
    await A.wait(600);
    if (era) { window.BRAISE_ERAS.start(era); } else await A.tapEl('#btnStart', 'se réveiller');
    for (let i = 0; i < 100 && D().mode() !== 'play'; i++) await A.wait(100);
    await A.wait(1500);
  }
  function watch(A) { let night = D().frac() > .75; const iv = setInterval(() => { if (!A.running()) return clearInterval(iv); const n = D().frac() > .75; if (n && !night) A.mark('la nuit tombe'); night = n; }, 200); }

  BETA.game({
    sfx: D() && D().sfx,
    progress: () => { const p = D() && D().P(); return p ? [Math.round(p.x), Math.round(p.y), p.items.filter(Boolean).length, p.stats.kills, D().fires().length] : [0]; },
    async prepare(save, A) {
      const sc = A.opts.scene;
      await start(A, sc === 'ere2' ? 1 : 0); setUp(); D().time(sc === 'moment' ? .7 : .38);
      await A.wait(5500);   // the day banner and Ka's opening lines fade before filming
      const i = item('spear'); if (i >= 0 && sc !== 'boucle') $(`#inv .slot[data-i="${i}"]`).click();
      if (sc === 'moment') { D().fire(90, 15); D().fire(-110, 40); D().time(.79); beasts(3, 380); }
      if (sc === 'ere2') { D().time(.42); }
      await A.wait(1200);
    },
    scenes: {
      // the core loop: gather on the savanna, fell a tree, make a fire in the workshop and set it down, then hunt the hyenas
      async boucle(A) { watch(A); await gather(A, 2); await chop(A); await fire(A); await spear(A); beasts(2, 340); await A.wait(400); await hunt(A, 60000); },
      // the most beautiful moment: night falls on the savanna, the fires glow, hyena eyes in the dark, Ka feeds the fire and faces them
      async moment(A) { watch(A); await A.wait(800);
        const f = D().fires().filter(f => !f.sourceFire).sort((a, b) => dist(a) - dist(b))[0]; if (f) { await tapWorld(A, f.x, f.y - 10, 'alimenter le feu'); await until(A, () => !P().target, 3000); A.mark('le feu reprend'); }
        await A.wait(600); beasts(3, 230); await hunt(A, 60000, f || P()); },
      // the second era, the Great Cold of the Vézère valley: gather in the snow, a fire, a wolf hunt
      async ere2(A) { watch(A); await gather(A, 2); await fire(A); await spear(A); beasts(2, 340); await hunt(A, 60000); },
      async idle(A) { watch(A); while (A.running()) { await gather(A, 2); await chop(A); if (D().fires().length < 3) await fire(A); await spear(A); beasts(2, 340); await hunt(A, 15000); } },
    },
  });
})();
