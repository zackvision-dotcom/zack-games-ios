/* Kunai Online — touch controls: a virtual joystick (bottom left) shown on touch screens.
   KTOUCH.vec() gives the stick direction (-1..1) used by the map and by the intro. */
window.KTOUCH = (() => {
  const enabled = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
  const v = { x: 0, y: 0, len: 0 }; let el = null, knob = null, id = null, cx = 0, cy = 0;
  // floating stick: it appears, half transparent, where the thumb lands on the left half of the screen, and fades on release
  let zone = null;
  function build() { if (!enabled || el) return; zone = document.createElement('div'); zone.id = 'k-zone'; el = document.createElement('div'); el.id = 'k-stick';
    el.innerHTML = `<style>#k-zone{position:fixed;left:0;top:0;bottom:0;width:46vw;z-index:4;touch-action:none}
      #k-stick{position:fixed;left:0;top:0;width:128px;height:128px;margin:-64px 0 0 -64px;border-radius:50%;z-index:16;pointer-events:none;opacity:0;transition:opacity .25s;background:radial-gradient(circle,rgba(247,241,222,.22),rgba(42,34,48,.3));border:2.5px solid rgba(247,241,222,.55);box-shadow:0 0 0 3px rgba(214,166,64,.35)}
      #k-stick.on{opacity:.6;transition:opacity .08s}
      #k-stick i{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff2d0,#d9b77a);border:2.5px solid #2a2230}</style><i></i>`;
    document.body.appendChild(zone); document.body.appendChild(el); knob = el.querySelector('i');
    const R = 64, move = e => { let dx = e.clientX - cx, dy = e.clientY - cy; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; }
      knob.style.transform = `translate(${dx}px,${dy}px)`; const n = Math.min(1, l / R); v.len = n < .15 ? 0 : n; v.x = v.len ? dx / R : 0; v.y = v.len ? dy / R : 0; };
    let sid = null; const G = () => window.KGAME && KGAME.slashOn && KGAME.slashOn();
    zone.addEventListener('pointerdown', e => { e.preventDefault(); if (sid === null && G() && (id !== null || KGAME.slashWants(e.clientX, e.clientY))) { sid = e.pointerId; try { zone.setPointerCapture(sid); } catch (err) {} KGAME.slashStart(e.clientX, e.clientY); return; } if (id !== null) return; id = e.pointerId; try { zone.setPointerCapture(id); } catch (err) {} cx = e.clientX; cy = e.clientY; el.style.left = cx + 'px'; el.style.top = cy + 'px'; knob.style.transform = ''; el.classList.add('on'); });
    zone.addEventListener('pointermove', e => { if (e.pointerId === sid) { KGAME.slashMove(e.clientX, e.clientY); return; } if (e.pointerId === id) move(e); });
    const end = e => { if (e.pointerId === sid) { sid = null; KGAME.slashEnd(); return; } if (e.pointerId !== id) return; id = null; v.x = v.y = v.len = 0; knob.style.transform = ''; el.classList.remove('on'); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end); }
  // phones held upright: an animated "turn your phone" screen (landscape 16:9 is the way the game is meant to be played)
  function rotateScreen() { if (!enabled) return; const r = document.createElement('div'); r.id = 'k-rotate';
    r.innerHTML = `<style>#k-rotate{position:fixed;inset:0;z-index:40;display:none;place-items:center;text-align:center;background:radial-gradient(circle at 50% 40%,#2a3a24,#0e120c);color:#f7f1de;font-family:'M PLUS Rounded 1c',system-ui,sans-serif;padding:24px}
      #k-rotate .ph{width:74px;height:130px;margin:0 auto 26px;border:5px solid #f7f1de;border-radius:14px;position:relative;box-shadow:0 0 0 4px #d6a640;animation:krot 2.4s ease-in-out infinite}
      #k-rotate .ph::before{content:'';position:absolute;left:50%;top:7px;width:18px;height:4px;margin-left:-9px;border-radius:2px;background:#f7f1de}
      #k-rotate .ph::after{content:'木';position:absolute;inset:18px 8px;display:grid;place-items:center;background:#a82a20;color:#f7f1de;border-radius:4px;font:400 30px 'Potta One',serif}
      @keyframes krot{0%,15%{transform:rotate(0)}45%,70%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
      #k-rotate h2{margin:0 0 8px;font:400 26px 'Potta One',sans-serif}#k-rotate p{margin:0 0 18px;font-size:15px;color:#d8ccb8;max-width:30ch}
      #k-rotate button{font:800 15px 'M PLUS Rounded 1c',sans-serif;color:#fff4dc;background:linear-gradient(180deg,#d8463a,#a32a20);border:2.5px solid #2a2230;border-radius:10px;padding:11px 20px;box-shadow:inset 0 0 0 2px #e6b450,0 4px 0 #2a2230}</style>
      <div><div class="ph"></div><h2>Tourne ton téléphone</h2><p>Kunai Gaiden se joue à l’horizontale, en 16:9.</p><button type="button">Plein écran en paysage</button></div>`;
    document.body.appendChild(r);
    r.querySelector('button').onclick = async () => { try { await (document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : Promise.reject()); } catch (e) {} try { await screen.orientation.lock('landscape'); } catch (e) {} check(); };
    const check = () => { r.style.display = innerHeight > innerWidth * 1.05 ? 'grid' : 'none'; };
    addEventListener('resize', check); addEventListener('orientationchange', () => setTimeout(check, 200)); check(); }
  const boot = () => { build(); rotateScreen(); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
  return { enabled, vec: () => v, show: on => { if (zone) zone.style.display = on ? 'block' : 'none'; if (el && !on) { el.classList.remove('on'); v.x = v.y = v.len = 0; id = null; } } };
})();
