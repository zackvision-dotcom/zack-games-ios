/* Kunai Online — creatures on the same kind of 3D rig as the ninjas (8 directions, ink + cel shading).
   CREATURE.wolf(g, {anim:'idle'|'run'|'attack'|'hurt', phase, yaw, fur}) — feet on (0,0). */
window.CREATURE = (() => {
  const { cel, tube, curve, stroke, tones } = HERO, TAU = Math.PI * 2, INK = '#141019';
  function wolf(g, o) {
    o = o || {}; const ph = (o.phase || 0) * TAU, anim = o.anim || 'idle', yaw = (o.yaw || 0) * Math.PI / 180;
    const F = [Math.sin(yaw), Math.cos(yaw)], R = [-Math.cos(yaw), Math.sin(yaw)];
    const FUR = tones(o.fur || '#8b919c'), BELLY = tones(o.belly || '#c9ccd2'), DARK = tones(o.paws || '#4a4e57');
    // variants on the same rig: felines (round ears, short muzzle, long tail, stripes or spots), bears (heavy, round ears, stub tail)
    const cat = !!o.cat, bear = !!o.bear, BK = bear ? 1.35 : 1;
    const P = (a, b, c) => [a * F[0] + b * R[0], -c + (a * F[1] + b * R[1]) * .12, a * F[1] + b * R[1]];
    const run = anim === 'run', atk = anim === 'attack', hurt = anim === 'hurt';
    const bob = run ? Math.sin(ph * 2) * 3 : Math.sin(ph) * .6, lunge = atk ? Math.max(0, Math.sin(Math.min(1, (o.phase || 0) / .5) * Math.PI)) : 0;
    const pitch = run ? Math.sin(ph) * .08 : atk ? -.1 * lunge : hurt ? .15 : 0;
    const body = (a, b, c) => { const ca = Math.cos(pitch), sa = Math.sin(pitch), c0 = c - 52; return [a * ca - c0 * sa + lunge * 14, b, 52 + c0 * ca + a * sa + bob]; };
    const PB = (a, b, c) => P(...body(a, b, c));
    const items = [], put = (k, fn) => items.push({ k, fn });
    g.fillStyle = 'rgba(20,30,10,.25)'; g.beginPath(); g.ellipse(0, 0, 30 + 26 * Math.abs(F[0]), 8, 0, 0, TAU); g.fill();
    // legs: gallop phases (front pair, back pair offset)
    const legs = [[24, 9, 0], [24, -9, .5], [-28, 9, 2.2], [-28, -9, 2.7]];
    for (const [la, lb, off] of legs) { const f = ph + off, front = la > 0;
      const sw = run ? Math.sin(f) * .7 : atk ? (front ? .55 : -.45) * lunge : Math.sin(ph + off) * .03;
      // front legs: straight column; back legs: thigh forward, hock bent back (dog leg)
      const t0 = front ? sw : sw + .35, t1 = front ? sw - (run ? Math.max(0, Math.cos(f)) * 1.2 : .05) : sw - .75 - (run ? Math.max(0, Math.cos(f)) * .5 : 0);
      const hip = body(la, lb * 1.1, front ? 46 : 48), K = [hip[0] + (front ? 20 : 22) * Math.sin(t0), lb, hip[2] - (front ? 20 : 22) * Math.cos(t0)];
      const A = [K[0] + 20 * Math.sin(t1), lb, Math.max(5, K[2] - 20 * Math.cos(t1))], A2 = front ? A : [A[0] + 4 * Math.sin(sw), lb, Math.max(4, A[2] - 6)], paw = [A2[0] + 6, lb, Math.max(1.5, A2[2] - 4)];
      const s2 = front ? [P(...hip), P(...K), P(...A), P(...paw)] : [P(...hip), P(...K), P(...A), P(...A2), P(...paw)];
      put((s2[1][2] + s2[2][2]) / 2, () => {
        const n = s2.length; tube(g, [s2[n - 2], s2[n - 1]], (s, u) => 4.8 - u * .3, DARK, { d: 1.2 });
        tube(g, s2.slice(0, n - 1), (s, u) => (s === 0 ? (front ? 10 : 13) - u * (front ? 4 : 6) : 5.6 - u * .8) * BK, FUR, { d: 2, hi: 'rgba(255,255,255,.35)' }); }); }
    // tail
    const sway = run ? Math.sin(ph * 2) * 8 : Math.sin(ph) * 4, tail = bear ? [PB(-38, 0, 58), PB(-44, 0, 60), PB(-48, 0, 57)] : cat ? [PB(-38, 0, 56), PB(-62, sway * .5, 50), PB(-82, sway * 1.2, 64 + (run ? 0 : 6))] : [PB(-38, 0, 58), PB(-56, sway * .4, 62 + (run ? 4 : 0)), PB(-70, sway, run ? 60 : 48)];
    put(tail[1][2] - 2, () => tube(g, tail, (s, u) => (s ? 8.5 - u * 5.5 : 6 + u * 2.5) * (cat ? .62 : 1), FUR, { d: 2.2, hi: 'rgba(255,255,255,.4)' }));
    // body: chest to haunch, belly lighter, mane tufts
    const torso = [PB(-32, 0, 50), PB(-6, 0, 50), PB(20, 0, 54)];
    put(0, () => { tube(g, torso.map(p => [p[0], p[1] + 7]), (s, u) => s ? 15 + u * 3 : 15 - u * 2, BELLY, { d: 2 });
      tube(g, torso, (s, u) => (s ? 17 + u * 5 : 19 - u * 2) * BK, FUR, { d: 3, hi: 'rgba(255,255,255,.35)' });
      if (o.stripes) for (let i = 0; i < 6; i++) { const u = .1 + i * .15, q = [torso[0][0] + (torso[2][0] - torso[0][0]) * u, torso[0][1] + (torso[2][1] - torso[0][1]) * u]; curve(g, [q[0] - 3, q[1] - 15], [q[0] + 2, q[1] - 4], [q[0] - 1, q[1] + 8], 3.2, o.stripes); }
      if (o.spots) for (let i = 0; i < 9; i++) { const u = .08 + i * .1, q = [torso[0][0] + (torso[2][0] - torso[0][0]) * u, torso[0][1] + (torso[2][1] - torso[0][1]) * u]; g.fillStyle = o.spots; g.beginPath(); g.arc(q[0] + (i % 2 ? 4 : -3), q[1] - 6 + (i % 3) * 5, 2.4, 0, TAU); g.fill(); }
      const back = [PB(-28, 0, 67), PB(-6, 0, 68), PB(16, 0, 75)]; for (let i = 0; i < (cat || bear ? 0 : 7); i++) { const u = i / 6, q = [back[0][0] + (back[2][0] - back[0][0]) * u, back[0][1] + (back[2][1] - back[0][1]) * u - 1];
        g.fillStyle = FUR[1]; g.beginPath(); g.moveTo(q[0] - 5, q[1] + 3); g.lineTo(q[0] - 1, q[1] - 5); g.lineTo(q[0] + 4, q[1] + 3); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke(); } });
    // neck, head, snout, ears, eyes
    const head3 = body(40, 0, hurt ? 66 : 72 - lunge * 6), H = P(...head3);
    put(H[2] + 6, () => {
      tube(g, [PB(20, 0, 56), [H[0], H[1] + 4]], (s, u) => 15 - u * 3, FUR, { d: 2.4 });
      // fur ruff around the neck
      const rc = PB(26, 0, 58); if (!cat && !bear) cel(g, () => { g.beginPath(); for (let i = 0; i <= 18; i++) { const a = i / 18 * TAU, rr = i % 2 ? 15 : 21; g.lineTo(rc[0] + Math.cos(a) * rr * (.7 + .3 * Math.abs(F[1])), rc[1] + Math.sin(a) * rr * .8); } g.closePath(); }, FUR, { d: 2.2, hi: 'rgba(255,255,255,.4)', lw: 2 });
      for (const sd of [-1, 1]) { if (cat || bear) { const e = P(head3[0] - 3, sd * 10, head3[2] + 13); cel(g, () => { g.beginPath(); g.ellipse(e[0], e[1], bear ? 6 : 5, bear ? 6 : 6.5, 0, 0, TAU); }, FUR, { d: 1, lw: 2 }); continue; }
        const e = P(head3[0] - 4, sd * 9, head3[2] + 19), b0 = P(head3[0] - 1, sd * 4, head3[2] + 8), b1 = P(head3[0] - 7, sd * 12, head3[2] + 6);
        cel(g, () => { g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(e[0], e[1]); g.lineTo(b1[0], b1[1]); g.closePath(); }, FUR, { d: 1.2, lw: 2 }); }
      cel(g, () => { g.beginPath(); g.ellipse(H[0], H[1], 16.5, 14.5, 0, 0, TAU); }, FUR, { d: 2.4, hi: 'rgba(255,255,255,.4)' });
      const sn = P(head3[0] + (cat ? 15 : bear ? 18 : 25), 0, head3[2] - 6), sb = P(head3[0] + 8, 0, head3[2] - 3), open = atk ? lunge : run ? .25 + .2 * Math.sin(ph * 2) : 0;
      if (sn[2] > H[2] - 6) { tube(g, [sb, sn], (s, u) => 9 - u * 3.4, BELLY, { d: 1.6 });
        if (open > .1) { cel(g, () => { g.beginPath(); g.moveTo(sb[0], sb[1] + 4); g.lineTo(sn[0], sn[1] + 3 + open * 8); g.lineTo(sb[0] + (sn[0] - sb[0]) * .3, sb[1] + 9); g.closePath(); }, tones('#7a2a30'), { d: .8, lw: 1.8 });
          g.fillStyle = '#fff'; for (let i = 1; i < 3; i++) { const q = [sb[0] + (sn[0] - sb[0]) * i / 3, sb[1] + (sn[1] - sb[1]) * i / 3 + 4]; g.beginPath(); g.moveTo(q[0] - 1.5, q[1]); g.lineTo(q[0], q[1] + 3.5); g.lineTo(q[0] + 1.5, q[1]); g.fill(); } }
        g.fillStyle = INK; g.beginPath(); g.ellipse(sn[0], sn[1] - 1, 3, 2.4, 0, 0, TAU); g.fill(); }
      for (const sd of [-1, 1]) { const v = .8 * F[1] + sd * .5 * R[1]; if (v < .1) continue; const e = P(head3[0] + 10, sd * 7, head3[2] + 3);
        g.fillStyle = hurt ? INK : (o.eye || '#f2c33a'); g.beginPath(); g.ellipse(e[0], e[1], 3.4 * Math.max(.4, v), hurt ? .8 : 2.6, 0, 0, TAU); g.fill(); if (!hurt) { g.fillStyle = INK; g.beginPath(); g.ellipse(e[0], e[1], 1.1, 2, 0, 0, TAU); g.fill(); }
        curve(g, [e[0] - 4, e[1] - 3], [e[0], e[1] - 5], [e[0] + 4, e[1] - 2], 1.8, INK); }
    });
    items.sort((a, b) => a.k - b.k); for (const it of items) it.fn();
  }
  // serpents and leeches: a long body undulating on the ground; snakes raise the head, leeches gape with a round sucker
  function serpent(g, o) { o = o || {}; const ph = (o.phase || 0) * TAU, anim = o.anim || 'idle', yaw = (o.yaw || 0) * Math.PI / 180, leech = !!o.leech;
    const F = [Math.sin(yaw), Math.cos(yaw)], R = [-Math.cos(yaw), Math.sin(yaw)], P = (a, b, c) => [a * F[0] + b * R[0], -c + (a * F[1] + b * R[1]) * .12, a * F[1] + b * R[1]];
    const SK = tones(o.skin || (leech ? '#5a3a4a' : '#6a7a3a')), BL = tones(o.belly || (leech ? '#8a5a6a' : '#c8c08a'));
    const run = anim === 'run', atk = anim === 'attack', hurt = anim === 'hurt', amp = run ? 14 : 8, sp = run ? 2 : 1, lunge = atk ? Math.max(0, Math.sin(Math.min(1, (o.phase || 0) / .5) * Math.PI)) : 0;
    const N = leech ? 9 : 16, L = leech ? 70 : 120, pts = [];
    for (let i = 0; i <= N; i++) { const u = i / N, a = -L * .6 + L * u + lunge * 18 * u * u, b = Math.sin(u * 5 - ph * sp) * amp * (1 - u * .5), head = !leech && u > .82, c = (leech ? 9 + 22 + Math.sin(ph * 2 + u * 3) * 5 : 7) + (head ? (u - .82) * 160 * (1 + lunge * .6) : 0) + (hurt ? 3 : 0); pts.push(P(a, b, c)); }
    g.fillStyle = 'rgba(20,30,10,.25)'; g.beginPath(); g.ellipse(0, 0, 40 + 30 * Math.abs(F[0]), 9, 0, 0, TAU); g.fill();
    const wd = (s, u) => leech ? 9 + 7 * Math.sin(Math.PI * Math.min(1, (s + u) / N * 1.1)) : 8 + 4 * Math.sin(Math.PI * (s + u) / N) - ((s + u) / N > .9 ? 2 : 0);
    tube(g, pts.map(p => [p[0], p[1] + 4]), wd, BL, { d: 1.6 }); tube(g, pts, wd, SK, { d: 2.4, hi: 'rgba(255,255,255,.35)' });
    if (leech) for (let i = 1; i < N; i++) { const q = pts[i]; curve(g, [q[0] - 2, q[1] - 12], [q[0] + 1, q[1]], [q[0] - 1, q[1] + 10], 1.1, 'rgba(20,10,16,.5)'); }
    else for (let i = 1; i < N - 2; i += 2) { const q = pts[i]; g.fillStyle = SK[2]; g.beginPath(); g.ellipse(q[0], q[1] - 4, 3.4, 2.2, 0, 0, TAU); g.fill(); }
    const H = pts[N], vis = F[1] > -.3;
    if (leech) { cel(g, () => { g.beginPath(); g.ellipse(H[0], H[1], 11, 10, 0, 0, TAU); }, SK, { d: 1.6 }); if (vis) { g.fillStyle = '#2a0a12'; g.beginPath(); g.ellipse(H[0] + F[0] * 4, H[1], 6 + lunge * 3, 5 + lunge * 3, 0, 0, TAU); g.fill(); g.fillStyle = '#e8d8d0'; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.arc(H[0] + F[0] * 4 + Math.cos(a) * 5, H[1] + Math.sin(a) * 4.4, 1, 0, TAU); g.fill(); } } }
    else { cel(g, () => { g.beginPath(); g.ellipse(H[0] + F[0] * 6, H[1], 14, 10, 0, 0, TAU); }, SK, { d: 1.8, hi: 'rgba(255,255,255,.4)' });
      for (const sd of [-1, 1]) { const v = .7 * F[1] + sd * .6 * R[1]; if (v < .05) continue; const e = [H[0] + F[0] * 8 + sd * R[0] * 6, H[1] - 4]; g.fillStyle = o.eye || '#f2d23a'; g.beginPath(); g.ellipse(e[0], e[1], 3 * Math.max(.4, v), 2.6, 0, 0, TAU); g.fill(); g.fillStyle = INK; g.fillRect(e[0] - .6, e[1] - 2.4, 1.2, 4.8); }
      if ((atk || run) && vis) { const tg = [H[0] + F[0] * 22, H[1] + 3]; stroke(g, [[H[0] + F[0] * 16, H[1] + 2], tg], 1.6, '#c82a3a'); stroke(g, [tg, [tg[0] + 3, tg[1] - 3]], 1.4, '#c82a3a'); stroke(g, [tg, [tg[0] + 3, tg[1] + 3]], 1.4, '#c82a3a'); } }
  }
  // lazy: only the first frame now, the others one by one through out.fill() (no freeze when a pack of wolves shows up)
  function bake(kind, anim, n, px, yaw, opts, lazy) { const sz = (opts && opts.size) || 1, k = px / 120, out = new Array(n);
    const one = i => { const c = document.createElement('canvas'); c.width = Math.ceil(220 * k * sz); c.height = Math.ceil(150 * k * sz); const g = c.getContext('2d');
      g.scale(k * sz, k * sz); g.translate(110, 130); CREATURE[kind](g, Object.assign({ anim, phase: i / n, yaw }, opts)); return c; };
    for (let i = 0; i < (lazy ? 1 : n); i++) out[i] = one(i);
    out.fill = () => { for (let i = 0; i < n; i++) if (!out[i]) { out[i] = one(i); return true; } return false; };
    out.ax = 110 * k * sz; out.ay = 130 * k * sz; return out; }
  return { wolf, serpent, bake };
})();
