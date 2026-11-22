// Kunai Gaiden scenes for the BETA IA simulated player (shared core: beta.js, copied by games-kit/sync.py; spec: ZVisionAI/partage/spec-mode-beta-ia.md).
// Every action is a real touch gesture: the katana slashes are finger swipes across the enemies, the techniques are signs
// drawn in the pad at the bottom right (V = fireball, Z = thunder blade, O = breath sphere, W = wind blade), the run is the
// floating joystick on the left. Loaded last (after the map script), inactive unless the address has ?beta=ia.
(() => {
  if (!window.BETA || !BETA.on) return;
  const K = window.KGAME, E = K.ext, D = () => K.dbg(), $ = s => document.querySelector(s);
  // clean takes: no chat handle or "Système" lines, no mission tracker banner, no tutorial, no route GPS, no hidden max-account button
  if (BETA.opts.ui === 'propre') { const st = document.createElement('style');
    st.textContent = ['#k-chath', '#k-chat', '#k-track', '#k-tu', '#k-gps', '#k-max', '#k-toast', '#k-stick', '#k-sealpad .hint'].map(q => 'html body.beta-propre ' + q).join(',') + '{display:none!important}'; document.head.appendChild(st); }
  const H = () => E.hero();
  const live = () => E.enemies.filter(e => !e.dead && !e.pvp);
  const pack = () => live().filter(e => e.beta);   // the enemies of the take (the village's own stay in their woods)
  const scr = (x, y, z) => KMAP.toScreen(x, y, z == null ? 1.4 : z);   // the body of an actor on screen (1.4 m above its feet)
  const onScreen = p => p[0] > 30 && p[0] < innerWidth - 30 && p[1] > 70 && p[1] < innerHeight - 90;

  // ---- a stroke with several segments (a sign in the pad): the same touch events as beta.js's drag, through each point ----
  const fingerEl = () => document.getElementById('beta-finger');
  function put(x, y) { const f = fingerEl(); if (f && BETA.opts.doigt) { f.classList.add('on'); f.style.left = x + 'px'; f.style.top = y + 'px'; } }
  function fire(type, x, y, el) { el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0, buttons: type === 'pointerup' ? 0 : 1, pointerId: 7, pointerType: 'touch', isPrimary: true, view: window })); }
  const frame = () => new Promise(r => requestAnimationFrame(r));
  async function trace(A, pts, ms, label) {
    if (!A.running()) return; const [x0, y0] = pts[0];
    // reach the start like a finger would (a short move of the dot), then press, draw through every point, lift
    const f = fingerEl(); const fx = f ? parseFloat(f.style.left) || innerWidth / 2 : innerWidth / 2, fy = f ? parseFloat(f.style.top) || innerHeight * .7 : innerHeight * .7;
    for (let k = 1; k <= 6; k++) { put(fx + (x0 - fx) * k / 6, fy + (y0 - fy) * k / 6); await frame(); }
    const el = document.elementFromPoint(x0, y0) || document.body; if (f) f.classList.add('down'); fire('pointerdown', x0, y0, el);
    let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    const t0 = performance.now(), dur = ms; let k = 0;
    while (k < 1) { k = Math.min(1, (performance.now() - t0) / dur); let want = k * L, i = 0; while (i < seg.length - 1 && want > seg[i]) { want -= seg[i]; i++; }
      const u = seg[i] ? Math.min(1, want / seg[i]) : 1, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u;
      put(x, y); fire('pointermove', x, y, el); await frame(); }
    const [x1, y1] = pts[pts.length - 1]; fire('pointerup', x1, y1, el); if (f) f.classList.remove('down');
    A.ev('action', { action: 'tracer', x: Math.round(x0), y: Math.round(y0), cible: label });
  }
  // the signs, drawn inside the pad (orientation matters: the recogniser tells Z from N and M from W)
  const SIGN = { fire: [[0, 0], [.5, 1], [1, 0]], chidori: [[0, 0], [1, 0], [0, 1], [1, 1]], wind: [[0, 0], [.25, 1], [.5, .25], [.75, 1], [1, 0]],
    sphere: Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 2 - i / 24 * Math.PI * 2; return [.5 + .5 * Math.cos(a), .5 + .5 * Math.sin(a)]; }) };
  const NAME = { fire: 'signe V : boule de feu', chidori: 'signe Z : lame-tonnerre', wind: 'signe W : lame de vent', sphere: 'signe O : sphère de souffle' };
  async function sign(A, id) {
    const pad = $('#k-sealpad'); if (!pad || pad.style.display === 'none') return false;
    const r = pad.getBoundingClientRect(), s = Math.min(r.width, r.height) * .62, ox = r.left + (r.width - s) / 2 + A.jitter(-4, 4), oy = r.top + (r.height - s) / 2 - 4 + A.jitter(-4, 4);
    const pts = SIGN[id].map(([x, y]) => [ox + x * s + A.jitter(-2, 2), oy + y * s + A.jitter(-2, 2)]);
    await trace(A, pts, id === 'sphere' ? 560 : id === 'wind' ? 520 : 420, NAME[id]); return true;
  }
  // a katana swipe through the enemies in reach (the finger crosses their bodies fast: one swipe can cut several)
  async function slash(A) {
    const h = H(), near = pack().filter(e => Math.hypot(e.x - h.x, e.y - h.y) < 4.4).map(e => ({ e, p: scr(e.x, e.y) })).filter(o => onScreen(o.p));
    if (!near.length) return false;
    near.sort((a, b) => a.p[0] - b.p[0]); const a = near[0].p, b = near[near.length - 1].p;
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    let x1, y1, x2, y2; if (l < 40) { const ang = A.jitter(-.5, .5); x1 = a[0] - 90 * Math.cos(ang); y1 = a[1] - 60 * Math.sin(ang) - 20; x2 = a[0] + 90 * Math.cos(ang); y2 = a[1] + 60 * Math.sin(ang) + 20; }
    else { x1 = a[0] - dx / l * 50; y1 = a[1] - dy / l * 50; x2 = b[0] + dx / l * 50; y2 = b[1] + dy / l * 50; }
    if (A.rnd() < .5) [x1, y1, x2, y2] = [x2, y2, x1, y1];
    await A.drag(x1, y1, x2, y2, 'coup de katana' + (near.length > 1 ? ' ×' + near.length : ''), A.jitter(170, 240)); return true;
  }
  // a few steps with the floating joystick toward a point of the world (the thumb lands on the left half, pushes, lets go)
  async function run(A, tx, ty, ms) {
    const h = H(), p = scr(h.x, h.y, 0), q = scr(tx, ty, 0), dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    const sx = innerWidth * A.jitter(.14, .2), sy = innerHeight * A.jitter(.62, .7); await A.drag(sx, sy, sx + dx / l * 60, sy + dy / l * 60, 'courir', ms || 700);
  }
  // the pack stays in the frame: an enemy that drifted away comes back in front of the hero (south, the camera side)
  function regroup(r) { const h = H(); let k = 0; for (const e of pack()) { const d = Math.hypot(e.x - h.x, e.y - h.y); if (d > r) { for (let t = 0; t < 8; t++) { const a = ((k + t * .37) / 4 - .5) * 1.8, rr = 2.8 + Math.random() * 1.2, x = h.x + Math.sin(a) * rr, y = h.y + Math.cos(a) * rr * .75 + .6; if (E.free(x, y, .8)) { e.x = x; e.y = y; break; } } k++; e.home = [h.x, h.y]; e.state = 'chase'; e.show = 3; } } }
  const nearest = () => { const h = H(); let b = null, bd = 1e9; for (const e of pack()) { const d = Math.hypot(e.x - h.x, e.y - h.y); if (d < bd) { bd = d; b = e; } } return [b, bd]; };

  // ---- the pack at the gate of Aozora: wolves from the southern woods and bandits, all around the hero ----
  function wave(n, r0, r1, kinds, weak) {
    const h = H(), out = [];
    for (let i = 0, tries = 0; out.length < n && tries < 200; tries++) { const a = (i / n) * Math.PI * 1.6 - Math.PI * .8 + (Math.random() - .5) * .4, r = r0 + Math.random() * (r1 - r0);
      // in front of the camera side (south of the hero, +y), spread on an arc
      const x = h.x + Math.sin(a) * r, y = h.y + Math.cos(a) * r * .75 + .6; if (!E.free(x, y, .8)) continue; i++;
      const e = E.spawn(kinds[out.length % kinds.length], x, y); e.beta = true; e.home = [x, y]; e.wander = [x, y]; e.state = 'chase'; e.show = 3; e.elite = false;
      if (weak) e.hp = Math.round(e.max * weak); out.push(e); }
    return out;
  }
  function midSave() {   // a hero in the middle of the story: level 14, the techniques of the first levels, the bandit mission running
    const today = new Date().toDateString();
    return { lvl: 14, xp: 900, sp: 1, ryo: 1840, rank: D().S.rank, tutoDone: true, introDone: true, done: false,
      inv: { kunai: 24, pillHp: 4, pillCk: 3, ramen: 2, ramenBowl: 0 }, skills: { fire: true, sphere: true, chidori: true, water: true, wind: true, clone: true, dash: true },
      rk: { fist: 3, kunai: 2, fire: 3, sphere: 2, subst: 1, chidori: 2, water: 1, wind: 3, clone: 1, dash: 2 },
      q: { q1: 'done', q2: 'done', q3: 'done', q4: 'done', q5: 'active' }, qp: { q1met: true, wolves: 6, roof: true, q3back: true, ramenGiven: true, bandits: 2 },
      kills: { wolf: 31, bandit: 9, boss: 0 }, daily: { last: today, streak: 4 }, region: 'konoha', ach: { c40: 1, roof: 1, water: 1, herb: 1, scroll6: 1, lvl10: 1 },
      eq: { weapon: { id: 'betakat', slot: 'weapon', w: 'katana', r: 2, lvl: 12, st: { atk: 34, crit: 6 }, name: 'Katana du Vent' } } };
  }
  function watch(A) {
    let kills = 0, lv = D().S.lvl; const h0 = { n: 0 };
    E.hooks.kill.push(e => { if (!A.running()) return; kills++; h0.n++; if (kills === 1) A.mark('premier ennemi vaincu'); if (kills % 4 === 0) A.mark(kills + ' ennemis vaincus'); });
    const iv = setInterval(() => { if (!A.running()) return clearInterval(iv); const S = D().S; if (S.lvl > lv) { lv = S.lvl; A.mark('niveau ' + lv); } }, 200);
    return h0;
  }
  const hideToast = () => { const t = $('#k-toast'); if (t) t.classList.remove('on'); };

  BETA.game({
    progress: () => { const h = H(); return h ? [Math.round(h.x), Math.round(h.y), live().length, D().S.xp, D().S.lvl] : [0]; },
    async prepare(save, A) {
      // the world is baked behind the title scroll; "Continuer" needs a save read at load, so the mid-game hero is put in place directly
      for (let i = 0; i < 1200 && !($('#k-new') && !$('#k-new').disabled); i++) await A.wait(100);
      const S = D().S; Object.assign(S, midSave()); K.intro.heal(); K.intro.setNoDeath(true);   // a take never ends on a knock-out
      K.intro.begin(); hideToast();
      // the road just outside the great gate, the gate behind the hero
      const h = H(); h.x = 0.5; h.y = 160; h.z = 0; h.yaw = 0; __k.snap();
      // the village's own wolves and bandits stay where they are; the pack for the take comes out of the woods around the gate
      for (const e of live()) if (Math.hypot(e.x - h.x, e.y - h.y) < 30) e.dead = 1e9;
      const sc = A.opts.scene;
      if (sc === 'moment') { h.y = 158; __k.snap(); await A.wait(400); wave(6, 2.6, 4.2, ['bandit', 'wolf'], .3); }
      else wave(5, 3.2, 5, ['wolf', 'bandit', 'wolf']);
      // let the frames of every actor be painted before filming, then hide the hint that pops up after the start
      for (let i = 0; i < 30; i++) { await A.wait(100); }
      await A.wait(4600); hideToast();
      for (const e of live()) if (Math.hypot(e.x - h.x, e.y - h.y) < 14) { e.state = 'chase'; }
      K.intro.heal(); E.refresh();
      // the joystick and the sign pad are touch controls: make sure they exist (they do whenever the page runs as a phone)
      if (!$('#k-sealpad')) A.ev('erreur', { msg: 'pas de pavé des signes (écran non tactile)' });
    },
    scenes: {
      // the core: the pack rushes in, katana swipes through it, techniques drawn in the pad (V, Z, O), the pack thins out
      async boucle(A) { watch(A); const plan = ['fire', null, null, 'chidori', null, 'sphere', null, null, 'fire', null, 'wind', null];
        await A.wait(600); let i = 0, far = 0;
        while (A.running()) {
          const [e, d] = nearest();
          if (!e) { wave(4, 3, 5, ['wolf', 'bandit', 'wolf']); await A.wait(600); continue; }
          if (D().S.hp < 60) K.intro.heal();
          if (d > 5) { regroup(5); await A.wait(250); if (nearest()[1] > 5 && ++far > 4) {   // stuck out of reach (behind a wall or the gate): gone, a fresh pack comes in
              for (const o of pack()) if (Math.hypot(o.x - H().x, o.y - H().y) > 5) o.dead = 1e9; wave(4, 3, 4.5, ['wolf', 'bandit', 'wolf']); far = 0; } continue; }
          far = 0;
          if (pack().length < 3) wave(3, 3.5, 5, ['bandit', 'wolf', 'bandit']);
          const id = plan[i++ % plan.length];
          if (id && d < 5.5) { const ok = await sign(A, id); if (ok) { A.mark(NAME[id]); await A.wait(A.jitter(500, 800)); continue; } }
          if (!(await slash(A))) { regroup(3.9); await A.wait(150); } await A.wait(A.jitter(160, 320));
          if (D().S.hp < 60) K.intro.heal();
          for (const e of pack()) { e.home = [H().x + (e.home[0] - H().x) * .5, H().y + (e.home[1] - H().y) * .5]; if (e.state === 'home') e.state = 'chase'; }
        } },
      // the wow moment: six weakened enemies pressed around the hero, the wind blade (W) mows them down, the sphere (O) finishes
      async moment(A) { watch(A); await A.wait(500);
        if (await sign(A, 'wind')) A.mark('lame de vent sur la meute'); await A.wait(900);
        for (let k = 0; k < 4 && A.running() && live().some(e => Math.hypot(e.x - H().x, e.y - H().y) < 6); k++) { await slash(A); await A.wait(A.jitter(200, 320)); }
        if (live().some(e => Math.hypot(e.x - H().x, e.y - H().y) < 5)) { await sign(A, 'sphere'); A.mark('sphère de souffle'); }
        await A.wait(1200);
        while (A.running()) { if (pack().length < 3) wave(4, 2.8, 4.2, ['bandit', 'wolf'], .4); regroup(4.5); if (!(await slash(A))) { const [e, d] = nearest(); if (e && d < 5.5 && A.rnd() < .5) await sign(A, ['fire', 'chidori'][(A.rnd() * 2) | 0]); else await A.wait(300); } await A.wait(250); } },
      // plays on until stopped (long tests): the same fight, the pack coming back
      async idle(A) { watch(A); while (A.running()) { const [e, d] = nearest(); if (!e) { wave(4, 6, 9, ['wolf', 'bandit']); await A.wait(1000); continue; }
        if (d > 6) await run(A, e.x, e.y, 700); else if (A.rnd() < .25) await sign(A, ['fire', 'chidori', 'sphere', 'wind'][(A.rnd() * 4) | 0]); else await slash(A); await A.think(); } },
    },
  });
})();
