/* BRAISE — articulated rig shared by the heirs of the lineage (eras II to VIII).
   Same joints and clocks as Ka's (walkT, bob, crouch, nearAngle/farAngle, action, actionT, drawHeld),
   so the engine animates every heir the same way. Each heir brings its own costume, head and props.
   Origin = between the feet, y up negative. Requires art.js (BRAISE_ART.K). */
window.BRAISE_HEIRS = window.BRAISE_HEIRS || {};
window.HEIR_KIT = (() => {
  const K = BRAISE_ART.K, { ell, fillInk, line, inkCurve, arm, hand } = K;
  /* legs: C = {leg, legFar, foot(g,x,y,side,col), wrap} */
  function legs(g, o, side, C) {
    const moving = o.moving, phase = o.walkT || 0, bob = o.bob || 0, crouch = o.crouch || 0;
    for (const sign of [-1, 1]) {
      const ph = phase + (sign > 0 ? Math.PI : 0), stride = moving ? Math.sin(ph) : 0;
      const hipX = side ? 0 : sign * 6, hipY = -38 - bob + crouch;
      const footX = side ? stride * 17 : sign * 7 + stride * 2;
      const lift = moving ? Math.max(0, Math.cos(ph)) * 9 : 0, footY = -3 - lift;
      const kneeX = (hipX + footX) / 2 + (side ? 4 + crouch * .35 : sign * 2), kneeY = (hipY + footY) / 2 - 2;
      const col = side && sign < 0 ? (C.legFar || C.leg) : C.leg;
      inkCurve(g, [[hipX, hipY], [kneeX, kneeY], [footX, footY - 4]], C.legW || 8, col, 1.8);
      if (C.wrap) C.wrap(g, hipX, hipY, kneeX, kneeY, footX, footY, sign, side);
      g.save(); g.translate(footX, footY); g.rotate(side ? stride * .13 : stride * .05);
      C.foot(g, 0, 1, side, side && sign < 0); g.restore();
    }
    g.translate(0, -bob + crouch);
    const lean = (side ? (o.moving ? .045 : 0) : o.moving ? Math.sin(phase) * .025 : 0) + (o.action === 'pick' ? .07 * Math.sin((o.actionT || 0) * Math.PI) : 0);
    g.translate(0, -38); g.rotate(lean); g.translate(0, 38);
  }
  /* one arm: C = {sleeve, sleeveFar, skin, cuff(g,x,y)} */
  function limb(g, o, near, side, C) {
    const angle = near ? (o.nearAngle || 0) : (o.farAngle || 0), x = side ? (near ? 2 : -5) : (near ? 16 : -16);
    g.save(); g.translate(x, -64);
    const col = !near && side ? (C.sleeveFar || C.sleeve) : C.sleeve, w = C.armW || 8.5;
    if (near && o.action === 'eat') {
      const lift = Math.min(1, (o.actionT || 0) * 5), hx = side ? 18 : -13, hy = -10 * lift;
      arm(g, 0, 0, side ? 22 : 10, 15, hx, hy, w, col);
      g.save(); g.translate(hx, hy); if (o.drawHeld) o.drawHeld(g); g.restore(); hand(g, hx, hy, C.skin, 4.2); g.restore(); return;
    }
    let reach = 28; if (o.action === 'pick' && near) reach += Math.sin((o.actionT || 0) * Math.PI) * 12;
    let rotation;
    if (side || o.action) rotation = -angle * (side ? 1 : near ? 1 : -1);
    else { reach = 25 + Math.sin(angle) * 7; rotation = (near ? -1 : 1) * (.10 + Math.abs(angle) * .12); }
    g.rotate(rotation);
    arm(g, 0, 0, side ? 3 : near ? 3 : -3, reach * .5, 0, reach - 3, w, col);
    if (C.cuff) C.cuff(g, 0, reach - 4);
    if (near && o.drawHeld) { g.save(); g.translate(0, reach); g.rotate(-rotation + (o.toolAngle || 0)); o.drawHeld(g); g.restore(); }
    hand(g, 0, reach + 1, C.skin, 4.2);
    g.restore();
  }
  return { legs, limb };
})();
