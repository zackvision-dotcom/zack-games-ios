/* Kunai Online — game layer for the Aozora map: title & character creation, ninja-scroll interface (HUD, skill bar,
   dialogues, bag, missions, shop, options), progression (levels, ryō, items, techniques), combat against wolves,
   bandits and a rogue ninja, a five-mission story, synthesized sound effects and a local save.
   The map (konoha-full.html) owns the world, the hero's movement and jumps; it calls KGAME at a few hooks. */
window.KGAME = (() => {
  let A = null;                                   // api handed over by the map
  const EXT = { hooks: { kill: [], place: [] }, peers: [] };   // peers: the other players (net.js)   // filled by saga.js (story chapters across the regions)
  // AdMob, iOS app only (ios/Ads/NativeAds.swift, handler "ads"). Never during a fight: an interstitial after a finished
  // mission (at most one every 3 minutes), an optional video on the KO screen to keep your ryō, "Choix publicitaires" in the menu.
  const NADS = () => window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ads;
  const nads = op => NADS() ? NADS().postMessage({ op }).catch(() => false) : Promise.resolve(false);
  const AD_GAP = 180e3; let adsInit = null, lastAd = Date.now(), keepRyo = false;
  const adsReady = () => adsInit || (adsInit = nads('init'));   // 1st time: Google consent (UMP) → Apple tracking prompt (ATT) → SDK
  async function adBreak() { if (!NADS() || Date.now() - lastAd < AD_GAP || (A && A.hero && A.hero.dead > 0)) return; await adsReady(); lastAd = Date.now(); await nads('interstitial'); }
  document.addEventListener('click', async e => { const b = e.target && e.target.closest && e.target.closest('#k-keepryo'); if (!b || b.disabled || !A || !A.hero.dead) return;
    b.disabled = true; const h = A.hero; h.dead = 999; await adsReady(); const ok = (await nads('rewarded')) === true; lastAd = Date.now(); keepRyo = ok; b.hidden = true; b.disabled = false; h.dead = .3; });
  const TAU = Math.PI * 2, $ = s => document.querySelector(s), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = Math.random;
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* ================= state ================= */
  const NEW = () => ({ v: 1, name: 'Kaze', look: { hair: '#2b2a3b', hairStyle: 'short', eyes: '#1c6fe0', skin: '#fde2cb', coat: '#2f90aa', coatLen: 1, headband: true, scarf: false, vest: false },
    lvl: 1, xp: 0, hp: 100, ck: 80, ryo: 50, inv: { kunai: 12, pillHp: 2, pillCk: 1, ramen: 0, ramenBowl: 0 }, skills: { fire: false, sphere: false, chidori: false, water: false, wind: false, clone: false, dash: false },
    q: { q1: 'active' }, qp: {}, kills: { wolf: 0, bandit: 0, boss: 0 }, pos: null, sound: true, rank: 'Genin', done: false,
    eq: { weapon: { id: 'katana0', slot: 'weapon', w: 'katana', r: 0, lvl: 1, st: { atk: 3 }, name: 'Katana de genin' } }, gotKatana: true, bag: [], sp: 0, rk: { fist: 1, kunai: 1, fire: 1, sphere: 1, subst: 1, chidori: 1, water: 1, wind: 1, clone: 1, dash: 1 }, herbs: 0, scrolls: [], perm: { atk: 0, hp: 0 }, ach: {}, st: { maxCombo: 0, roofs: 0, water: 0, elites: 0, legend: 0, contracts: 0, herbs: 0 }, contracts: [], daily: { last: '', streak: 0 } });
  let S = NEW();
  const MAXL = 30;
  // the "max level" account: level 30, every technique learned and at rank 5, legendary gear, Aozora's missions done (the saga stays to be played)
  function MAXSAVE() { const m = NEW(), L = MAXL, base = { atk: 3, def: 4, hp: 14, ck: 10, crit: 1.5, spd: 2 }, MN = { head: 'ck', body: 'def', hands: 'atk', feet: 'spd', weapon: 'atk' };
    const leg = (slot, w, name) => { const st = {}; for (const k of [MN[slot], 'hp', 'def', 'crit']) if (!st[k]) st[k] = Math.round(base[k] * (1 + L * (k === MN[slot] ? .35 : .2)) * (k === MN[slot] ? (k === 'spd' ? 1.1 : 2.8) : .8)); return { id: Math.random().toString(36).slice(2, 9), slot, r: 3, lvl: L, st, w, name }; };
    Object.assign(m, { lvl: L, xp: 0, sp: 0, ryo: 99999, rank: 'Jōnin', done: true, inv: { kunai: 99, pillHp: 30, pillCk: 30, ramen: 10, ramenBowl: 0 },
      skills: { fire: true, sphere: true, chidori: true, water: true, wind: true, clone: true, dash: true }, rk: { fist: 5, kunai: 5, fire: 5, sphere: 5, subst: 5, chidori: 5, water: 5, wind: 5, clone: 5, dash: 5 },
      q: { q1: 'done', q2: 'done', q3: 'done', q4: 'done', q5: 'done' }, qp: { q1met: true, wolves: 6, roof: true, ramenGiven: true, bandits: 5, boss: true, q5back: true },
      kills: { wolf: 6, bandit: 5, boss: 1 }, scrolls: Array.from({ length: 12 }, (_, i) => 's' + i), perm: { atk: 24, hp: 120 },
      eq: { head: leg('head', undefined, 'Bandeau du Gardien'), body: leg('body', undefined, 'Gilet du Renard'), hands: leg('hands', undefined, 'Gantelets du Tonnerre'), feet: leg('feet', undefined, 'Sandales du Vent'), weapon: leg('weapon', 'katana', 'Katana du Dragon') },
      tutoDone: true, bag: [leg('weapon', 'hache', 'Hache de la Lune'), leg('weapon', 'marteau', 'Marteau de l’Aube'), leg('weapon', 'fouet', 'Fouet de la Brume'), leg('weapon', 'kunai', 'Kunai de l’Ombre')], region: 'konoha' });
    return m; }
  // equipment stats (+ permanent bonuses from the secret scrolls)
  const gear = () => { const g = { atk: S.perm.atk || 0, def: 0, hp: S.perm.hp || 0, ck: 0, crit: 0, spd: 0 }; for (const k in S.eq) { const it = S.eq[k]; if (it) for (const st in it.st) g[st] += it.st[st]; } return g; };
  const maxHp = () => 100 + 22 * (S.lvl - 1) + gear().hp, maxCk = () => 80 + 16 * (S.lvl - 1) + gear().ck, xpNeed = () => Math.round(100 * Math.pow(S.lvl, 1.45));
  const lookOf = L => ({ hair: L.hair, hairStyle: L.hairStyle === 'short' ? undefined : L.hairStyle, eyes: L.eyes, skin: L.skin, coat: L.coat, coatLen: L.coatLen, headband: L.headband, scarf: L.scarf ? '#c8352c' : undefined, vest: L.vest ? '#5f7d45' : undefined });

  /* ================= sound (synthesized, no files) ================= */
  let AC = null;
  const sfx = (kind) => { if (!S.sound) return; AC = window.KAMB && KAMB.ctx(); if (!AC) return; const t = AC.currentTime, o = AC.createGain(); o.connect(KAMB.out());
    const tone = (f, d, type, v, f2) => { const s = AC.createOscillator(); s.type = type || 'sine'; s.frequency.setValueAtTime(f, t); if (f2) s.frequency.exponentialRampToValueAtTime(f2, t + d); const gg = AC.createGain(); gg.gain.setValueAtTime(v || .2, t); gg.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(gg); gg.connect(o); s.start(t); s.stop(t + d); };
    const noise = (d, v, fq, q) => { const n = AC.createBuffer(1, AC.sampleRate * d, AC.sampleRate), dd = n.getChannelData(0); for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / dd.length); const s = AC.createBufferSource(); s.buffer = n; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq || 1200; f.Q.value = q || 1; const gg = AC.createGain(); gg.gain.value = v || .3; s.connect(f); f.connect(gg); gg.connect(o); s.start(t); };
    ({ swing: () => noise(.14, .25, 2400, 2), hit: () => { noise(.12, .45, 700, 1.5); tone(140, .12, 'square', .08, 60); }, throw: () => noise(.18, .2, 3800, 4), fire: () => { noise(.6, .35, 500, .7); tone(90, .5, 'sawtooth', .05, 50); },
      jump: () => tone(320, .16, 'sine', .12, 640), coin: () => { tone(988, .09, 'square', .06); setTimeout(() => sfx('coin2'), 80); }, coin2: () => tone(1318, .14, 'square', .06),
      lvl: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => { if (AC) { const s = AC.createOscillator(), gg = AC.createGain(); s.type = 'triangle'; s.frequency.value = f; gg.gain.setValueAtTime(.12, AC.currentTime); gg.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .35); s.connect(gg); gg.connect(KAMB.out()); s.start(); s.stop(AC.currentTime + .35); } }, i * 110)),
      quest: () => { tone(659, .25, 'triangle', .1); setTimeout(() => sfx('quest2'), 140); }, quest2: () => tone(988, .4, 'triangle', .1), hurt: () => tone(220, .2, 'sawtooth', .08, 110), smoke: () => noise(.35, .3, 900, .5),
      talk: () => tone(660, .05, 'triangle', .05), ui: () => tone(880, .04, 'triangle', .05), sphere: () => { tone(200, .5, 'sawtooth', .06, 900); noise(.5, .2, 1800, 3); }, bite: () => noise(.1, .4, 1500, 3) })[kind]?.(); };

  /* ================= CSS + DOM (ninja scrolls) ================= */
  const PAPER = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .42 0 0 0 0 .3 0 0 0 0 .16 0 0 0 .26 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const SWIRL = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='22'%3E%3Cpath d='M16 11a6 6 0 1 0-6 6 4 4 0 1 0 4-4 2 2 0 1 0-2 2' fill='none' stroke='%23b06a72' stroke-width='2.2' stroke-linecap='round'/%3E%3Cpath d='M22 11q12-8 26 0q-12 8-26 0z' fill='%235d7e72' stroke='%232a2230' stroke-width='1.4'/%3E%3Cpath d='M24 11h22' stroke='%232a2230' stroke-width='1'/%3E%3Ccircle cx='60' cy='11' r='2.2' fill='%23b06a72'/%3E%3C/svg%3E\")";
  const WASHI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.02 .55' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 .55 0 0 0 0 .45 0 0 0 0 .3 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23w)'/%3E%3C/svg%3E\")";
  const BRUSH = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 60' preserveAspectRatio='none'%3E%3Cpath d='M6 34C40 10 120 8 200 12s90 6 96 18-30 22-110 24S20 60 8 48 2 38 6 34z' fill='%23a82a20' stroke='%232a2230' stroke-width='3'/%3E%3Cpath d='M30 22c60-8 150-10 230-4' stroke='%23d8463a' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")";
  const ROD = c => '<i class="rod ' + (c || '') + '"></i>';
  const CSS = `
  :root{--paper1:#f7ebcb;--paper2:#e9d29f;--inkb:#3a2414;--red:#b8322a;--wood1:#4a2410;--wood2:#a3602f;--gold:#e0b04a}
  .k-font{font-family:'Potta One',sans-serif}
  /* ninja scrolls: a thick rolled cylinder (red caps, gold rings, coloured body, black knobs) + flat cream paper with ink outlines */
  .paper{background:#f7f1de;color:var(--inkb);border:2.5px solid #2a2230;box-shadow:0 5px 0 rgba(30,20,10,.25),0 8px 18px rgba(0,0,0,.35)}
  .maki{position:relative;border-radius:2px;background:linear-gradient(90deg,transparent calc(100% - 11px),#2a2230 calc(100% - 11px) calc(100% - 9px),#d8cba3 calc(100% - 9px)),#f7f1de}
  .kake{position:relative;border-radius:2px;padding-top:40px!important;padding-bottom:40px!important;
    background:${SWIRL} repeat-x 0 5px/72px 22px,${SWIRL} repeat-x 30px calc(100% - 5px)/72px 22px,
      linear-gradient(#2a2230,#2a2230) 0 31px/100% 2px no-repeat,linear-gradient(#2a2230,#2a2230) 0 calc(100% - 31px)/100% 2px no-repeat,
      linear-gradient(#cdb58c,#cdb58c) top/100% 32px no-repeat,linear-gradient(#cdb58c,#cdb58c) bottom/100% 32px no-repeat,#f7f1de}
  .rod{position:absolute;left:-30px;top:-12px;bottom:-12px;width:46px;border:2.5px solid #2a2230;border-radius:12px/9px;z-index:2;pointer-events:none;
    background:linear-gradient(90deg,rgba(0,0,0,.2),rgba(255,255,255,.22) 30%,rgba(255,255,255,0) 55%,rgba(0,0,0,.28)),
      linear-gradient(180deg,#b8505c 0 16%,#2a2230 16% calc(16% + 2px),#d6a640 calc(16% + 2px) calc(16% + 7px),#2a2230 calc(16% + 7px) calc(16% + 9px),var(--rod,#4f6e64) calc(16% + 9px) calc(84% - 9px),#2a2230 calc(84% - 9px) calc(84% - 7px),#d6a640 calc(84% - 7px) calc(84% - 2px),#2a2230 calc(84% - 2px) 84%,#b8505c 84%)}
  .rod::before,.rod::after{content:'';position:absolute;left:22%;right:22%;height:9px;background:linear-gradient(90deg,#1e1e22,#5a5a62 40%,#1e1e22);border:2px solid #2a2230;border-radius:4px}
  .rod::before{top:-10px}.rod::after{bottom:-10px}
  .rod.y{--rod:#efe39a}.rod.r{--rod:#c24d4d}.rod.b{--rod:#3d5a8a}
  .vt{position:absolute;right:12px;top:42px;bottom:42px;writing-mode:vertical-rl;font:400 19px 'Potta One',serif;color:#2a2230;letter-spacing:.12em;border-left:2px solid #2a2230;padding-left:6px;pointer-events:none}
  .cols{background-image:repeating-linear-gradient(90deg,transparent 0 63px,rgba(42,34,48,.18) 63px 65px)}
  .seal{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:5px;background:var(--red);color:#fbe9d0;font:400 17px 'Potta One',serif;box-shadow:inset 0 0 0 2px #e9a28a,0 2px 3px rgba(0,0,0,.3);transform:rotate(-4deg)}
  .kbtn{font:800 14px 'M PLUS Rounded 1c',system-ui,sans-serif;color:#fbe9d0;background:linear-gradient(180deg,#c43c30,#8e2219);border:2px solid #5e150f;border-radius:8px;padding:9px 16px;cursor:pointer;box-shadow:0 3px 0 #4a100b,0 4px 8px rgba(0,0,0,.35);text-shadow:0 1px 0 #4a100b}
  .kbtn:active{transform:translateY(2px);box-shadow:0 1px 0 #4a100b}.kbtn.alt{background:linear-gradient(180deg,#6a4a2a,#4a2e18);border-color:#2e1c0e;box-shadow:0 3px 0 #22140a}
  .kbtn:disabled{opacity:.55;cursor:default}
  #kg *{box-sizing:border-box}
  #kg{font-family:'M PLUS Rounded 1c',system-ui,sans-serif}
  /* HUD */
  #k-hud{position:fixed;left:42px;top:16px;display:flex;gap:10px;align-items:center;padding:8px 18px 8px 10px;z-index:5;pointer-events:none}
  #k-por{width:66px;height:66px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#9cc87a,#4f7a3a);box-shadow:0 0 0 3px #e0b04a,0 0 0 6px #5a2e16,0 3px 8px rgba(0,0,0,.5)}
  #k-hud .nm{font:400 15px 'Potta One',serif;display:flex;gap:8px;align-items:baseline}#k-hud .nm small{font:700 12px 'M PLUS Rounded 1c',sans-serif;color:#7a2a18}
  .kbar{position:relative;width:min(210px,40vw);height:13px;border-radius:7px;background:#3a2a1a;margin-top:4px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,.6)}
  .kbar i{position:absolute;inset:0 auto 0 0;border-radius:7px;transition:width .2s}.kbar b{position:absolute;inset:0;font:800 10px/13px system-ui;color:#fff;text-align:center;text-shadow:0 1px 1px #000}
  #k-hp i{background:linear-gradient(180deg,#ff7a5a,#c8281e)}#k-ck i{background:linear-gradient(180deg,#7ac8ff,#1f6fd0)}#k-xp{height:6px}#k-xp i{background:linear-gradient(90deg,#e0b04a,#ffe08a)}
  #k-top{position:fixed;right:14px;top:12px;display:flex;gap:8px;z-index:5;align-items:center}
  #k-top .ryo{margin-right:10px;padding:6px 20px 6px 28px;font:400 15px 'Potta One',serif}
  #k-top button{width:44px;height:44px;border-radius:10px;border:2px solid #5a2e16;cursor:pointer;font:400 18px 'Potta One',serif;color:var(--inkb);position:relative}
  #k-top button span{position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);font:700 10px system-ui;color:#fff;text-shadow:0 1px 2px #000;white-space:nowrap}
  #k-track{position:fixed;right:16px;top:92px;width:min(260px,44vw);padding:10px 18px 10px 28px;z-index:4;font-size:13px;pointer-events:none}
  #k-track h4{margin:0 0 4px;font:400 14px 'Potta One',serif;color:#7a2a18}#k-track p{margin:2px 0}
  #k-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:7px;padding:9px 22px 9px 28px;z-index:5;align-items:flex-end}
  .slot{position:relative;width:56px;height:56px;border-radius:10px;background:#2a1a10;border:2px solid #6a3a1e;cursor:pointer;padding:0;touch-action:none;overflow:hidden}
  .slot canvas{width:100%;height:100%;display:block}.slot .key{position:absolute;left:3px;top:1px;font:800 11px system-ui;color:#fbe9d0;text-shadow:0 1px 2px #000}
  .slot .cnt{position:absolute;right:3px;bottom:1px;font:800 12px system-ui;color:#fff;text-shadow:0 1px 2px #000}
  .slot .cd{position:absolute;inset:0;background:rgba(10,6,4,.68);transform-origin:bottom;transform:scaleY(0)}.slot.locked::after{content:'封';position:absolute;inset:0;display:grid;place-items:center;font:400 26px 'Potta One',serif;color:#e9a28a;background:rgba(20,10,6,.72)}
  .slot.jumpS{border-radius:50%;background:radial-gradient(circle at 35% 30%,#f6e6c0,#c99a4a);color:#7a2a18;font:400 22px 'Potta One',serif}
  .sep{width:2px;align-self:stretch;background:rgba(90,46,22,.4);margin:0 2px}
  #k-talk{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:5}
  #k-toast{position:fixed;left:50%;top:16%;transform:translateX(-50%);padding:14px 40px 14px 44px;z-index:7;text-align:center;pointer-events:none;transition:opacity .5s,transform .5s;opacity:0}
  #k-toast.on{opacity:1;transform:translateX(-50%) translateY(6px)}#k-toast h3{margin:0;font:400 24px 'Potta One',serif;color:#7a2a18}#k-toast p{margin:4px 0 0;font-weight:700}
  #k-dlg{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);width:min(720px,calc(100vw - 70px));display:flex;gap:14px;padding:16px 26px 16px 30px;z-index:8;align-items:flex-start}
  #k-dlg canvas{width:92px;height:92px;flex:none;border-radius:8px;background:radial-gradient(circle at 40% 35%,#d9c08a,#a8824a);box-shadow:0 0 0 2px #5a2e16}
  #k-dlg .who{font:400 17px 'Potta One',serif;color:#7a2a18;margin-bottom:4px}#k-dlg .txt{font-size:15px;line-height:1.45;min-height:44px}
  #k-dlg .ch{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  #k-panel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(var(--pw,640px),calc(100vw - 70px));max-height:calc(100vh - 70px);overflow:visible;padding:22px 64px 22px 32px;z-index:8}
  #k-panel .scr{max-height:calc(100vh - 170px);overflow:auto;padding-right:6px}
  #k-mapview{position:relative;height:calc(100vh - 230px);min-height:200px;overflow:hidden;border-radius:6px;border:2.5px solid #2a2230;background:#e4d9bc;touch-action:none;cursor:grab}#k-mapview:active{cursor:grabbing}
  #k-bigmap{position:absolute;left:0;top:0;transform-origin:0 0;display:block;max-width:none}
  #k-mapview .mz{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px;z-index:2}
  #k-mapview .mz button{width:40px;height:40px;border-radius:50%;border:2.5px solid #2a2230;background:#f7f1de;color:#2a2230;font:900 20px sans-serif;cursor:pointer;box-shadow:0 2px 0 #2a2230}
  #k-panel.mapP .scr{overflow:hidden}
  #k-mapview .mz button.clr{display:none;background:#c47bff;color:#fff}#k-mapview.haswp .mz button.clr{display:block}
  #k-mapview .mtip{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);background:rgba(42,34,48,.82);color:#fff4dc;font:800 12px 'M PLUS Rounded 1c',sans-serif;padding:5px 12px;border-radius:14px;pointer-events:none;white-space:nowrap}#k-mapview.haswp .mtip{display:none}
  #k-gps{position:fixed;left:50%;top:44px;transform:translateX(-50%);z-index:5;display:flex;align-items:center;gap:8px;padding:4px 6px 4px 12px;border-radius:20px;background:rgba(42,19,64,.88);border:2px solid #c47bff;color:#fff;font:900 14px 'M PLUS Rounded 1c',sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.4)}#k-gps[hidden]{display:none}
  #k-gps i{font-style:normal;color:#c47bff;display:inline-block;font-size:18px;transition:transform .15s}#k-gps button{width:26px;height:26px;border-radius:50%;border:0;background:#c47bff;color:#fff;font:900 13px sans-serif;cursor:pointer}
  body.compact #k-gps{top:24px;font-size:12px;padding:2px 4px 2px 10px}
  #k-panel h2{margin:0 0 12px;font:400 24px 'Potta One',serif;color:#7a2a18;display:flex;gap:10px;align-items:center}
  #k-panel .x{position:absolute;right:8px;top:2px;z-index:3;border:0;background:none;font:900 22px serif;color:#7a2a18;cursor:pointer}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
  .item{display:grid;grid-template-columns:44px 1fr;gap:6px;align-items:center;padding:6px;border-radius:8px;background:rgba(120,80,30,.12);border:1px solid rgba(90,46,22,.25);font-size:13px}
  .item canvas{width:44px;height:44px}.item b{display:block}.item button{grid-column:1/-1}
  .quest{padding:10px 12px;border-radius:8px;background:rgba(120,80,30,.12);border-left:4px solid var(--red);margin-bottom:8px}.quest.done{border-color:#5a8a3a;opacity:.75}.quest h4{margin:0 0 4px;font:400 15px 'Potta One',serif}
  .stats{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:14px;margin-bottom:14px}
  #k-dim{position:fixed;inset:0;background:rgba(10,8,4,.45);z-index:7}
  #k-dead{position:fixed;inset:0;display:grid;place-items:center;background:rgba(20,0,0,.6);z-index:9;font:400 34px 'Potta One',serif;color:#fbe9d0;text-shadow:0 2px 6px #000}
  /* title + creator */
  #k-title{position:fixed;inset:0;z-index:20;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#3a4a2a,#10140c);overflow:auto;padding:30px 16px}
  #k-title .box{padding:30px 74px 30px 46px;text-align:center;max-width:560px}
  #k-title h1{margin:0;font:400 clamp(30px,6vw,52px)/1.05 'Potta One',serif;color:#7a2a18;letter-spacing:.03em;text-wrap:balance}
  #k-title h1 em{display:block;font-style:normal;font-size:.42em;color:#3a2414;letter-spacing:.3em;margin-top:8px}
  #k-title .leaf{font:900 64px serif;color:var(--red);line-height:1}
  #k-title p{font-size:14px;line-height:1.5}
  #k-title .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px}
  #k-cr{display:grid;grid-template-columns:minmax(200px,280px) minmax(240px,380px);gap:20px;padding:24px 64px 24px 36px;max-width:100%}
  @media (max-width:640px){#k-cr{grid-template-columns:1fr}#k-track{display:none}}
  #k-cr h2{grid-column:1/-1;margin:0;font:400 26px 'Potta One',serif;color:#7a2a18}
  #k-cr canvas{width:100%;height:auto;aspect-ratio:260/300;border-radius:10px;background:radial-gradient(circle at 50% 40%,#b9d48f,#6f9a4f);box-shadow:inset 0 0 0 2px #5a2e16}
  .opt{display:grid;gap:5px;margin-bottom:8px}.opt b{font-size:13px;color:#7a2a18}.sw{display:flex;flex-wrap:wrap;gap:6px}
  .sw button{width:28px;height:28px;border-radius:7px;border:2px solid rgba(58,36,20,.4);cursor:pointer}.sw button[aria-pressed=true]{border-color:#7a2a18;box-shadow:0 0 0 2px #e0b04a}
  .sw .t{width:auto;padding:0 10px;background:rgba(120,80,30,.15);color:var(--inkb);font:700 12px system-ui}
  #k-cr input{width:100%;background:rgba(255,250,235,.7);border:1px solid #a8824a;border-radius:7px;color:var(--inkb);padding:8px;font:700 15px 'M PLUS Rounded 1c',sans-serif}
  .help{font-size:12px;line-height:1.5;color:#5a3a20}

  /* ===== polish: washi paper, lacquer, gold, brush strokes ===== */
  .paper{background-color:#f7f1de;background-image:${WASHI}}
  .maki{background:linear-gradient(90deg,transparent calc(100% - 11px),#2a2230 calc(100% - 11px) calc(100% - 9px),#d8cba3 calc(100% - 9px)),${WASHI},#f7f1de}
  .paper.kake{background:${SWIRL} repeat-x 0 5px/72px 22px,${SWIRL} repeat-x 30px calc(100% - 5px)/72px 22px,
      linear-gradient(#2a2230,#2a2230) 0 31px/100% 2px no-repeat,linear-gradient(#2a2230,#2a2230) 0 calc(100% - 31px)/100% 2px no-repeat,
      linear-gradient(#cdb58c,#cdb58c) top/100% 32px no-repeat,linear-gradient(#cdb58c,#cdb58c) bottom/100% 32px no-repeat,${WASHI},#f7f1de}
  .kbtn{font:800 14px 'M PLUS Rounded 1c',sans-serif;letter-spacing:.02em;color:#fff4dc;background:linear-gradient(180deg,#d8463a,#a32a20 55%,#7e1d16);border:2.5px solid #2a2230;border-radius:10px;padding:9px 18px;
    box-shadow:inset 0 0 0 2px #e6b450,inset 0 3px 0 rgba(255,255,255,.25),0 4px 0 #2a2230;text-shadow:0 1px 0 #5a120c}
  .kbtn:active{transform:translateY(3px);box-shadow:inset 0 0 0 2px #e6b450,0 1px 0 #2a2230}
  .kbtn.alt{background:linear-gradient(180deg,#4d6e64,#36524a 60%,#28403a);box-shadow:inset 0 0 0 2px #d6a640,inset 0 3px 0 rgba(255,255,255,.2),0 4px 0 #2a2230;text-shadow:0 1px 0 #1a2a26}
  /* HUD: portrait in a gold ring, level seal, kanji-tagged brush bars */
  #k-hud{padding:10px 20px 12px 14px;gap:14px}
  #k-por{box-shadow:0 0 0 3px #2a2230,0 0 0 7px #d6a640,0 0 0 9.5px #2a2230,0 6px 10px rgba(0,0,0,.4)}
  .lvseal{position:absolute;left:58px;top:58px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e65a48,#a82a20);border:2.5px solid #2a2230;color:#fff4dc;font:400 15px/25px 'Potta One',sans-serif;text-align:center;box-shadow:0 2px 0 #2a2230;z-index:3}
  #k-hud .nm{font:400 18px 'Potta One',sans-serif;color:#2a2230;margin-bottom:2px}#k-hud .nm small{font:800 11px 'M PLUS Rounded 1c',sans-serif;color:#fff4dc;background:#a82a20;border:2px solid #2a2230;border-radius:5px;padding:0 6px;line-height:16px}
  .brow{display:flex;align-items:center;gap:6px;margin-top:4px}.brow .kj{width:20px;height:20px;border-radius:5px;border:2px solid #2a2230;display:grid;place-items:center;font:400 12px 'Potta One',sans-serif;color:#fff4dc}
  .kbar{margin-top:0;height:15px;border:2px solid #2a2230;border-radius:3px 9px 3px 9px;background:#2e2430;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)}
  .kbar i{border-radius:0;box-shadow:inset 0 3px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.18)}
  .kbar b{font:800 10px/11px 'M PLUS Rounded 1c',sans-serif}
  #k-xp{height:8px;border-width:1.5px}
  /* top buttons: lacquered discs with a gold ring */
  #k-top button{width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e65a48,#a82a20 60%,#7a1d16);color:#fff4dc;border:2.5px solid #2a2230;box-shadow:inset 0 0 0 2.5px #e6b450,0 4px 0 #2a2230;font:400 19px 'Potta One',sans-serif}
  #k-top button:active{transform:translateY(3px);box-shadow:inset 0 0 0 2.5px #e6b450,0 1px 0 #2a2230}
  #k-top button span{bottom:-17px;font:800 10px 'M PLUS Rounded 1c',sans-serif}
  #k-top .ryo{font:400 17px 'Potta One',sans-serif;display:flex;align-items:center;gap:7px}
  #k-top .ryo::after{content:'';order:-1;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle,transparent 3px,#2a2230 3px 4.5px,#e6b450 4.5px 7px,#2a2230 7px);border:1px solid #2a2230}
  /* tracker */
  #k-track h4{font:400 15px 'Potta One',sans-serif;color:#a82a20;padding-bottom:3px;margin-bottom:5px;background:linear-gradient(90deg,#a82a20,rgba(168,42,32,0)) bottom/100% 2px no-repeat}
  /* skill bar: indigo slots in gold frames, ofuda seals on locked techniques, radial cooldown */
  #k-bar{gap:8px;padding:10px 24px 12px 32px}
  .slot{width:58px;height:58px;border-radius:9px;border:2.5px solid #2a2230;background:radial-gradient(circle at 50% 35%,#3a4a7a,#1c2240);box-shadow:inset 0 0 0 2px #d6a640,0 4px 0 #2a2230;overflow:visible}
  .slot canvas{border-radius:6px;padding:3px}
  .slot .key{left:-6px;top:-8px;min-width:18px;height:18px;padding:0 4px;border-radius:4px;background:#f7f1de;border:2px solid #2a2230;color:#2a2230;font:800 10px/14px 'M PLUS Rounded 1c',sans-serif;text-align:center;text-shadow:none;z-index:2}
  .slot .cnt{font:800 12px 'M PLUS Rounded 1c',sans-serif;right:4px;bottom:2px}
  .slot .cd{inset:2px;border-radius:7px;transform:none!important;background:conic-gradient(rgba(10,8,20,.72) calc(var(--p,0)*1%),transparent 0)}
  .slot:active{transform:translateY(3px);box-shadow:inset 0 0 0 2px #d6a640,0 1px 0 #2a2230}
  .slot.locked::after{content:'封';inset:6px 14px;border-radius:2px;background:linear-gradient(#f7ecd0,#efe0b8);border:1.5px solid #2a2230;color:#b8322a;font:400 20px 'Potta One',sans-serif;transform:rotate(-8deg);box-shadow:0 2px 3px rgba(0,0,0,.4)}
  .slot.jumpS,.slot.sprintS{border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff2d0,#d9b77a);color:#7a2a18;font:400 22px 'Potta One',sans-serif}
  .slot.sprintS.on{background:radial-gradient(circle at 35% 30%,#ffd38a,#e0882a);box-shadow:inset 0 0 0 2px #fff4dc,0 0 12px #ffb04a,0 4px 0 #2a2230}
  .sep{width:2.5px;background:#2a2230;opacity:.35;border-radius:2px}
  /* dialogue: red name plate, blinking arrow */
  #k-dlg{padding-top:22px}
  #k-dlg .who{position:absolute;top:-17px;left:132px;background:#a82a20;color:#fff4dc;border:2.5px solid #2a2230;border-radius:6px;padding:2px 14px;font:400 16px 'Potta One',sans-serif;box-shadow:0 3px 0 #2a2230}
  #k-dlg canvas{box-shadow:0 0 0 2.5px #2a2230,0 0 0 5.5px #d6a640,0 0 0 8px #2a2230;border-radius:50%}
  #k-dlg .txt{font:700 15.5px/1.55 'M PLUS Rounded 1c',sans-serif;color:#2a2230}
  #k-dlg .txt.done::after{content:' ▼';color:#a82a20;animation:kblink 1s steps(2) infinite}
  @keyframes kblink{50%{opacity:0}}
  /* toast: a red brush stroke behind the title */
  #k-toast h3{display:inline-block;padding:4px 26px;color:#fff4dc;font:400 24px 'Potta One',sans-serif;background:${BRUSH} center/100% 100% no-repeat}
  #k-toast p{font:700 14px 'M PLUS Rounded 1c',sans-serif;color:#2a2230}
  #k-panel h2{font:400 26px 'Potta One',sans-serif;color:#2a2230}#k-panel h2 .seal{font:400 17px 'Potta One',sans-serif}
  .seal{background:#a82a20;border:2px solid #2a2230;box-shadow:inset 0 0 0 2px #e6b450}
  .item{background:#fbf6e6;border:2px solid #2a2230;border-radius:8px;box-shadow:0 3px 0 rgba(42,34,48,.25)}.item canvas{border-radius:6px;background:radial-gradient(circle at 50% 35%,#3a4a7a,#1c2240);box-shadow:0 0 0 2px #2a2230}
  .quest{background:#fbf6e6;border:2px solid #2a2230;border-left:7px solid #a82a20;box-shadow:0 3px 0 rgba(42,34,48,.25)}
  #k-tgt{position:fixed;left:50%;top:52px;transform:translateX(-50%);padding:6px 18px 8px 26px;z-index:4;min-width:220px;pointer-events:none}#k-tgt .tn{font:800 12px 'M PLUS Rounded 1c',sans-serif;color:#a82a20;margin-bottom:3px}#k-tgt .kbar{width:100%}#k-tgt .kbar i{background:linear-gradient(180deg,#ff7a5a,#c8281e)}
  #k-combo{position:fixed;right:40px;top:44%;z-index:4;text-align:center;pointer-events:none;opacity:0;transition:opacity .4s}#k-combo.on{opacity:1}
  #k-combo b{display:block;font:400 64px/1 'Potta One',sans-serif;color:#fff4dc;-webkit-text-stroke:3px #2a2230;text-shadow:0 5px 0 #a82a20,0 7px 0 #2a2230}#k-combo small{display:inline-block;margin-top:4px;padding:2px 14px;font:400 15px 'Potta One',sans-serif;color:#fff4dc;background:${BRUSH} center/100% 100% no-repeat}
  #k-combo.pop b{animation:kpop .18s ease-out}@keyframes kpop{0%{transform:scale(1.45)}100%{transform:scale(1)}}
  .rar0{color:#6a665e}.rar1{color:#2a6ac0}.rar2{color:#8a2ac0}.rar3{color:#d08a10}.eqrow{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}.eqs{min-height:86px;padding:6px;border:2px dashed rgba(42,34,48,.4);border-radius:8px;font-size:11px;text-align:center}.eqs.full{border-style:solid;background:#fbf6e6}
  .rk{display:flex;gap:3px;justify-content:center;margin:4px 0}.rk i{width:10px;height:10px;border-radius:50%;border:1.5px solid #2a2230;background:#e9dfc4}.rk i.on{background:#e0a020}
  /* cards never let text or buttons spill: two-column header, wrapping text, full-width buttons */
  .grid{grid-template-columns:repeat(auto-fill,minmax(min(100%,168px),1fr))}
  .item{grid-template-columns:44px minmax(0,1fr);align-items:start;min-width:0}.item>div{min-width:0;overflow-wrap:anywhere;line-height:1.35}
  .item .kbtn{grid-column:1/-1;width:100%;min-width:0;white-space:normal;font-size:12px;padding:6px 8px;line-height:1.25}
  .eqrow{grid-template-columns:repeat(auto-fit,minmax(min(100%,96px),1fr))}.eqs{min-width:0;overflow-wrap:anywhere}.eqs .kbtn{width:100%;white-space:normal}
  .stats>*{min-width:0;overflow-wrap:anywhere}.quest{overflow-wrap:anywhere}
  #k-dlg .who{max-width:calc(100% - 150px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #k-toast{max-width:calc(100vw - 60px)}#k-toast h3,#k-toast p{overflow-wrap:anywhere}
  #k-weather{position:fixed;left:50%;top:12px;transform:translateX(-50%);padding:4px 18px 4px 26px;z-index:4;font:800 12px 'M PLUS Rounded 1c',sans-serif;pointer-events:none}
  @media (max-width:700px){
    #k-bar{gap:4px;padding:6px 10px 6px 22px;bottom:10px}.slot{width:40px;height:40px;border-radius:8px}.sep{display:none}
    #k-hud{left:34px;top:10px;padding:5px 10px 5px 8px;gap:7px}#k-por{width:46px;height:46px}.kbar{width:min(150px,34vw);height:11px}.kbar b{font-size:9px;line-height:11px}
    #k-top{top:8px;right:8px;gap:5px}#k-top button{width:36px;height:36px;font-size:15px}#k-top .ryo{display:none}
    #k-dlg canvas{width:64px;height:64px}#k-dlg .txt{font-size:14px}#k-talk{bottom:66px}
    #k-panel{padding:18px 18px 18px 26px}#k-panel .vt{display:none}
    #k-top{top:78px}
    #k-dlg .who{left:96px;max-width:calc(100% - 110px)}
    #k-weather{left:40px;top:112px;bottom:auto;transform:none}#zone{top:146px!important;bottom:auto!important;left:40px!important;transform:none!important;font-size:12px!important}
  }
  @media (max-height:500px){
    #k-hud{left:34px;top:6px;padding:4px 10px 4px 8px;gap:7px}#k-por{width:42px;height:42px}.lvseal{left:40px;top:38px;width:22px;height:22px;font-size:11px;line-height:17px}.kbar{width:150px;height:10px}.kbar b{font-size:8px;line-height:10px}#k-hud .nm{font-size:14px}
    #k-top{top:6px;right:8px;gap:5px}#k-top button{width:34px;height:34px;font-size:14px}#k-top button span,#k-top .ryo,#k-track{display:none}
    #k-bar{left:auto;right:8px;transform:none;bottom:8px;gap:4px;padding:5px 10px 5px 22px}.slot{width:38px;height:38px}.slot .key{display:none}.sep{display:none}
    #k-weather{left:50%;top:6px;transform:translateX(-50%)}#zone{top:40px!important;bottom:auto!important;left:50%!important;transform:translateX(-50%)!important;font-size:12px!important}#k-dlg .who{left:90px}#k-talk{bottom:62px}#k-dlg{bottom:8px;padding:10px 16px 10px 22px}#k-dlg canvas{width:56px;height:56px}#k-dlg .txt{font-size:13.5px;min-height:0}
    #k-title{padding:10px 16px}#k-title .box{padding:40px 64px 40px 40px!important}#k-title .leaf{font-size:28px}#k-title h1{font-size:30px}#k-title h1 em{margin-top:4px}#k-title p{margin:6px 0;font-size:13px}#k-title .row{margin-top:6px}#k-title .vt{font-size:14px}
    #k-panel{max-height:calc(100vh - 30px);padding:14px 16px 14px 24px}#k-panel .scr{max-height:calc(100vh - 80px)}#k-panel .vt{display:none}#k-toast{top:8%}
  }
  #k-slash{position:fixed;inset:0;width:100vw;height:100vh;z-index:4;pointer-events:none}
  .ptabs{display:none}
  @media (max-width:700px),(max-height:500px){
    #k-panel{left:6px;right:6px;top:6px;bottom:6px;transform:none;width:auto;max-height:none;display:flex;flex-direction:column;padding:10px 14px 8px 18px!important;background:linear-gradient(#2a2230,#2a2230) left/5px 100% no-repeat,${WASHI},#f7f1de!important;border:2.5px solid #2a2230;border-radius:10px}#k-panel[hidden]{display:none}
    #k-panel .scr{flex:1;min-height:0;max-height:none!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:10px}
    #k-panel.mapP .scr{display:flex;flex-direction:column;padding-bottom:4px}#k-panel.mapP #k-mapview{flex:1;height:auto;min-height:0}#k-panel.mapP .help{display:none}
    #k-panel .x{right:6px;top:6px;width:44px;height:44px;border-radius:50%;background:#a82a20;color:#fff4dc;border:2.5px solid #2a2230;font-size:20px;box-shadow:inset 0 0 0 2px #e6b450}
    #k-panel h2{font-size:20px;margin:0 0 8px}#k-panel .rod{display:none}
    .ptabs{display:flex;gap:6px;margin:0 52px 8px 0;flex:none}.ptabs button{flex:1;min-width:0;min-height:42px;border:2.5px solid #2a2230;border-radius:10px;background:#fbf6e6;color:#2a2230;font:800 12px 'M PLUS Rounded 1c',sans-serif;display:flex;align-items:center;justify-content:center;gap:5px;padding:2px 4px}
    .ptabs button b{font:400 16px 'Potta One',sans-serif;color:#a82a20}.ptabs button.on{background:#a82a20;color:#fff4dc;box-shadow:inset 0 0 0 2px #e6b450}.ptabs button.on b{color:#fff4dc}
    #k-panel .kbtn{min-height:42px}.item .kbtn{min-height:40px;font-size:13px}#k-panel [data-o]{width:100%}
    .grid{grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr))}
    #k-dlg .ch .kbtn{min-height:42px;padding:8px 16px}
    #k-top button{width:40px;height:40px}
  }
  @media (max-width:440px){.slot{width:29px;height:29px;border-radius:7px}#k-bar{gap:3px;padding:6px 8px 6px 20px}.slot .key{display:none}.slot .key{font-size:9px}.slot .cnt{font-size:10px}.slot.jumpS{font-size:16px}
    #k-top button span{display:none}#k-top{flex-direction:column;top:70px}}
  /* ===== compact screens (phones, small windows): small HUD, no decorative rods, the map stays visible ===== */
  body.compact .rod{display:none!important}
  body.compact #k-hud{left:6px;top:6px;padding:3px 9px 3px 4px;gap:6px;border-radius:9px}
  body.compact #k-por{width:34px;height:34px}body.compact .lvseal{left:26px;top:26px;width:17px;height:17px;font-size:9px;line-height:13px}
  body.compact #k-hud .nm{font-size:11px;margin-bottom:1px}body.compact #k-hud .nm small{font-size:9px;padding:0 5px;margin-left:4px}
  body.compact .kbar{width:92px;height:7px}body.compact .kbar b{display:none}body.compact .brow{gap:4px;margin-top:2px}body.compact .brow .kj{width:14px!important;height:12px!important;font-size:8px!important;line-height:12px}
  body.compact #k-weather{top:4px;left:50%;transform:translateX(-50%);padding:1px 12px!important;font-size:10px;white-space:nowrap;min-width:max-content}
  body.compact #zone{top:24px!important;bottom:auto!important;left:50%!important;transform:translateX(-50%)!important;font-size:10px!important;padding:1px 10px!important}
  body.compact #k-top{top:5px;right:6px;gap:4px;flex-direction:row}body.compact #k-top button{width:28px!important;height:28px!important;font-size:12px!important}body.compact #k-top button span,body.compact #k-top .ryo{display:none}
  body.compact #mini{width:86px!important;height:76px!important;top:38px!important;right:6px!important;bottom:auto!important;box-shadow:0 0 0 2px #d6a640,0 0 0 3.5px #2a2230}
  body.compact .zoom{top:118px!important;right:6px!important;bottom:auto!important;flex-direction:row;gap:4px}body.compact .zoom button{width:26px!important;height:24px!important;font-size:14px!important}
  body.compact #mt{display:none!important}
  body.compact #k-bar{right:6px;left:auto;transform:none;bottom:6px;padding:3px 6px;gap:3px}body.compact .slot{width:30px;height:30px}body.compact .slot .key{display:none}body.compact .sep{display:none}
  body.compact #k-talk{bottom:44px;right:8px;left:auto;transform:none;font-size:12px;padding:5px 12px;min-height:0}
  body.compact #k-dlg{left:50%;right:auto;transform:translateX(-50%);width:min(560px,78vw);bottom:6px;padding:16px 10px 6px!important;gap:8px}
  body.compact #k-dlg canvas{width:40px!important;height:40px!important}body.compact #k-dlg .who{font-size:12px;left:52px!important;top:-12px;padding:1px 8px}
  body.compact #k-dlg .txt{font-size:12px!important;line-height:1.35;min-height:0}body.compact #k-dlg .ch .kbtn{min-height:28px;padding:3px 10px;font-size:12px}
  body.compact #k-toast{top:44px!important;max-width:56vw;padding:4px 14px}body.compact #k-toast h3{font-size:14px;padding:2px 14px}body.compact #k-toast p{font-size:11px;margin:2px 0 0}
  body.compact #k-tgt{top:44px;min-width:140px;padding:2px 10px}body.compact #k-combo{right:110px}body.compact #k-combo b{font-size:34px}
  body.compact #k-panel{padding:6px 10px!important}body.compact #k-panel h2{font-size:15px;margin:0 0 4px}body.compact #k-panel h2 .seal{font-size:12px}
  body.compact .ptabs{margin:0 42px 6px 0}body.compact .ptabs button{min-height:30px;font-size:11px}body.compact .ptabs button b{font-size:13px}
  body.compact #k-panel .x{width:32px;height:32px;font-size:15px}body.compact #k-panel .scr{font-size:12px}
  body.compact #k-panel .scr :is(p,li,td,th,span,div,b,small,label){font-size:12px}body.compact #k-panel .scr :is(h3,h4){font-size:13px;margin:6px 0 3px}
  body.compact #k-panel .kbtn{min-height:30px;font-size:12px;padding:4px 10px}body.compact .item{padding:5px}body.compact .grid{gap:6px}
  /* ===== touch screens: a gamepad on the right (big attack button, techniques in an arc, jump and sprint under the thumb) ===== */
  body.touch #k-bar{position:fixed;right:6px;bottom:6px;left:auto;width:220px;height:150px;padding:0;background:none!important;border:0!important;box-shadow:none!important;transform:none}
  body.touch #k-bar .slot{position:absolute;border-radius:50%!important;box-shadow:0 0 0 2px #2a2230,0 3px 0 #2a2230}body.touch #k-bar .slot canvas{border-radius:50%}
  body.touch #k-bar .slot[title=fist]{right:8px;bottom:8px;width:62px;height:62px}
  body.touch #k-bar .slot[title=jump]{right:80px;bottom:4px;width:44px;height:44px}body.touch #k-bar .slot[title=sprint]{right:12px;bottom:78px;width:44px;height:44px}
  body.touch #k-bar .slot[title=kunai]{right:74px;bottom:54px;width:42px;height:42px}body.touch #k-bar .slot[title=fire]{right:128px;bottom:8px;width:42px;height:42px}
  body.touch #k-bar .slot[title=sphere]{right:122px;bottom:56px;width:42px;height:42px}body.touch #k-bar .slot[title=subst]{right:62px;bottom:102px;width:40px;height:40px}body.touch #k-bar .slot[title=chidori]{right:126px;bottom:104px;width:42px;height:42px}body.touch #k-bar .slot[title=water]{right:180px;bottom:128px;width:38px;height:38px}body.touch #k-bar .slot[title=wind]{right:118px;bottom:154px;width:38px;height:38px}body.touch #k-bar .slot[title=clone]{right:66px;bottom:150px;width:38px;height:38px}body.touch #k-bar .slot[title=dash]{right:12px;bottom:126px;width:40px;height:40px}body.touch #k-bar .slot.locked{display:none}body.touch #k-bar .slot.tech{display:none!important}
  body.touch #k-bar .slot[title=pillHp]{right:178px;bottom:6px;width:34px;height:34px}body.touch #k-bar .slot[title=pillCk]{right:174px;bottom:46px;width:34px;height:34px}body.touch #k-bar .slot[title=ramen]{right:164px;bottom:88px;width:34px;height:34px}
  body.touch #k-talk{bottom:160px;right:10px}body.touch #jb{display:none!important}
  body.touch:not(.compact) #mini{top:58px!important;bottom:auto!important;right:14px!important}body.touch:not(.compact) .zoom{top:230px!important;bottom:auto!important;right:14px!important;flex-direction:row}body.touch #mt{display:none!important}
  body.touch:not(.compact) #k-track{left:14px;right:auto;top:138px}body.touch #k-bar .rod{display:none!important}
  body.touch.compact #k-dlg{width:min(520px,62vw);left:8px;transform:none}
  @media (orientation:portrait){body.touch #k-bar{transform:scale(.9);transform-origin:bottom right}}

  `;
  function buildDom() {
    for (const href of ['https://fonts.googleapis.com/css2?family=Potta+One&family=M+PLUS+Rounded+1c:wght@500;700;800;900&display=swap']) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    const d = document.createElement('div'); d.id = 'kg'; d.innerHTML = `
      <div id="k-hud" class="paper maki" hidden>${ROD()}<canvas id="k-por" width="132" height="132"></canvas><span class="lvseal" id="k-lvs">1</span><div><div class="nm"><span id="k-name">Kaze</span><small id="k-lvl">Genin</small></div>
        <div class="brow"><span class="kj" style="background:#c8281e">体</span><div class="kbar" id="k-hp"><i></i><b></b></div></div><div class="brow"><span class="kj" style="background:#1f6fd0">気</span><div class="kbar" id="k-ck"><i></i><b></b></div></div><div class="brow"><span class="kj" style="background:#c99a3a;width:20px;height:14px;font-size:9px">経</span><div class="kbar" id="k-xp"><i></i></div></div></div></div>
      <div id="k-weather" class="paper maki" hidden>${ROD('b')}<span id="k-wl">Ciel dégagé</span></div>
      <div id="k-top" hidden><div class="ryo paper maki">${ROD("r")}両 <span id="k-ryo">0</span></div>
        <button class="paper" data-p="bag" title="Sac (B)">袋<span>Sac</span></button><button class="paper" data-p="quests" title="Missions (M)">任<span>Missions</span></button>
        <button class="paper" data-p="map" title="Carte (N)">地<span>Carte</span></button><button class="paper" data-p="opts" title="Menu (Échap)">巻<span>Menu</span></button></div>
      <div id="k-tgt" class="paper maki" hidden>${ROD("r")}<div class="tn"></div><div class="kbar"><i></i><b></b></div></div>
      <div id="k-combo"><b>0</b><small>COMBO</small></div>
      <div id="k-track" class="paper maki" hidden>${ROD("b")}<div class="in"></div></div>
      <div id="k-bar" class="paper maki" hidden></div>
      <button id="k-talk" class="kbtn" hidden>Parler (E)</button>
      <div id="k-toast" class="paper maki">${ROD("r")}<h3></h3><p></p></div>
      <div id="k-dim" hidden></div>
      <div id="k-dlg" class="paper maki cols" hidden>${ROD("y")}<canvas width="184" height="184"></canvas><div style="flex:1"><div class="who"></div><div class="txt"></div><div class="ch"></div></div></div>
      <div id="k-panel" class="paper kake" hidden></div>
      <div id="k-dead" hidden><div style="text-align:center">Tu as été vaincu…<br><button class="kbtn" id="k-keepryo" hidden style="font:600 15px system-ui,sans-serif;margin-top:16px;min-height:44px;padding:8px 18px">Garder tes ryō (vidéo)</button></div></div>
      <div id="k-title"><div class="box paper kake">${ROD()}<span class="vt">青空の里</span><div class="leaf">青空</div><h1>Kunai Gaiden<em>Le village d’Aozora</em></h1>
        <p>Deviens ninja, accomplis tes missions et protège le village.</p><div class="row" id="k-trow"><button class="kbtn" id="k-new">Nouvelle partie</button><button class="kbtn alt" id="k-cont" hidden>Continuer</button></div><button class="kbtn alt" id="k-max" style="margin-top:8px;font-size:13px;padding:6px 12px;opacity:.85">Compte niveau max (tout débloqué)</button>
        <p class="help" id="k-tload">Préparation d’Aozora…</p></div></div>`;
    document.body.appendChild(d);
    // compact layout on small screens, gamepad on touch screens (?touch=1 forces it for testing)
    const fit = () => { const c = innerHeight <= 520 || innerWidth <= 760; document.body.classList.toggle('compact', c);
      document.body.classList.toggle('touch', !!((window.KTOUCH && KTOUCH.enabled) || /[?&]touch=1/.test(location.search))); };
    fit(); addEventListener('resize', fit);
  }

  /* ================= portraits ================= */
  function portrait(cv, look, bg) { const q = cv.getContext('2d'), W = cv.width; q.clearRect(0, 0, W, W); if (bg) { q.fillStyle = bg; q.fillRect(0, 0, W, W); }
    q.save(); q.beginPath(); q.arc(W / 2, W / 2, W / 2, 0, TAU); q.clip(); const s = W / 72; q.translate(W / 2, W / 2 + 150 * s); q.scale(s, s);
    try { HERO.draw(q, { anim: 'idle', phase: .2, yaw: 0, look }); } catch (e) {} q.restore(); }

  /* ================= skills, items ================= */
  const SK = {
    fist: { key: 'j', icon: 'sFist', name: 'Taijutsu', ck: 0, cd: .45, act: 'attack' },
    kunai: { key: 'k', icon: 'kunai', name: 'Lancer de kunai', ck: 0, cd: .5, act: 'throw', item: 'kunai' },
    fire: { key: 'l', icon: 'sFire', name: 'Boule de feu', ck: 22, cd: 2.6, act: 'seal', lock: () => !S.skills.fire, hint: 'Mission « Le toit du Gardien »' },
    sphere: { key: 'u', icon: 'sSphere', name: 'Sphère de chakra', ck: 32, cd: 4.5, act: 'seal', lock: () => !S.skills.sphere, hint: 'Niveau 4' },
    subst: { key: 'i', icon: 'sSubst', name: 'Substitution', ck: 12, cd: 3.5, act: 'subst' },
    // learned by level (Kunai Gaiden)
    dash: { key: 'g', icon: 'sDash', name: 'Pas éclair', ck: 8, cd: 1.4, act: 'dash0', lock: () => !S.skills.dash, hint: 'Niveau 5' },
    water: { key: 'p', icon: 'sWater', name: 'Dragon d’eau', ck: 24, cd: 3, act: 'seal', lock: () => !S.skills.water, hint: 'Niveau 7' },
    clone: { key: 'h', icon: 'sClone', name: 'Multiclonage', ck: 28, cd: 7, act: 'seal', lock: () => !S.skills.clone, hint: 'Niveau 9' },
    chidori: { key: 'o', icon: 'sBolt', name: 'Lame-tonnerre', ck: 30, cd: 5, act: 'seal', lock: () => !S.skills.chidori, hint: 'Niveau 11' },
    wind: { key: 'y', icon: 'sWind', name: 'Lame de vent', ck: 18, cd: 2.4, act: 'seal', lock: () => !S.skills.wind, hint: 'Niveau 13' } };
  const ITEMUSE = { pillHp: { key: '1', name: 'Pilule de soin', use: () => heal(60, 0) }, pillCk: { key: '2', name: 'Pilule de chakra', use: () => heal(0, 60) }, ramen: { key: '3', name: 'Bol de ramen', use: () => { S.regen = 8; toastMini('Ramen : régénération'); } } };
  const PRICES = { kunai: [6, 'Kunai ×1'], pillHp: [30, 'Pilule de soin'], pillCk: [30, 'Pilule de chakra'], ramen: [18, 'Bol de ramen'] };
  const cds = {};
  function heal(h, c) { S.hp = Math.min(maxHp(), S.hp + h); S.ck = Math.min(maxCk(), S.ck + c); if (h) addText(A.hero.x, A.hero.y, '+' + h, '#7dff8a'); if (c) addText(A.hero.x, A.hero.y, '+' + c, '#7ac8ff'); fx('aura', A.hero.x, A.hero.y, .6, .9); }

  /* ================= loot: equipment with rarities ================= */
  const RAR = [{ n: 'Commun', c: '#9a958a' }, { n: 'Rare', c: '#3a86e0' }, { n: 'Épique', c: '#a44ae0' }, { n: 'Légendaire', c: '#f0a020' }];
  const SLOTS = { head: ['Bandeau', 'headband'], body: ['Gilet', 'scroll'], hands: ['Gantelets', 'wire'], feet: ['Sandales', 'pouch'], weapon: ['Kunai', 'kunai'] };
  // weapon types: the melee ones (everything but the kunai) slash with the finger on touch screens, Fruit Ninja style
  const WT = { kunai: { n: 'Kunai', ic: 'kunai' },
    katana: { n: 'Katana', ic: 'katana', dmg: 1, cd: .13, reach: 4.6, kb: 1.4, col: '#bfe6ff', w: 9 },
    hache: { n: 'Hache', ic: 'hache', dmg: 1.45, cd: .24, reach: 4.2, kb: 2.4, col: '#ffb35a', w: 12 },
    marteau: { n: 'Marteau', ic: 'marteau', dmg: 1.9, cd: .34, reach: 4, kb: 3.2, col: '#ffe08a', w: 15, heavy: true },
    fouet: { n: 'Fouet', ic: 'fouet', dmg: .8, cd: .1, reach: 6.2, kb: 1, col: '#ff8aa8', w: 6, wide: true } };
  const WSHOP = [['katana', 150], ['fouet', 170], ['hache', 190], ['marteau', 230]];
  const iconOf = it => it.slot === 'weapon' ? WT[it.w || 'kunai'].ic : SLOTS[it.slot][1];
  const SLOTN = { head: 'Tête', body: 'Corps', hands: 'Mains', feet: 'Pieds', weapon: 'Arme' };
  const SUFFIX = ['du Loup', 'de l’Aube', 'du Tonnerre', 'de l’Érable', 'du Renard', 'de l’Ombre', 'du Vent', 'de la Brume', 'du Dragon', 'de la Lune'];
  const MAIN = { head: 'ck', body: 'def', hands: 'atk', feet: 'spd', weapon: 'atk' }, STN = { atk: 'Attaque', def: 'Défense', hp: 'Vie', ck: 'Chakra', crit: 'Critique %', spd: 'Vitesse %' };
  function genItem(lvl, minR) { let r = 0; const x = rnd(); r = x < .03 ? 3 : x < .14 ? 2 : x < .42 ? 1 : 0; r = Math.max(r, minR || 0); const slot = Object.keys(SLOTS)[(rnd() * 5) | 0], m = 1 + r * .6, st = {};
    const base = { atk: 3, def: 4, hp: 14, ck: 10, crit: 1.5, spd: 2 }; st[MAIN[slot]] = Math.round(base[MAIN[slot]] * (1 + lvl * .35) * m);
    const extra = Object.keys(base).filter(k => k !== MAIN[slot]); for (let i = 0; i < r; i++) { const k = extra[(rnd() * extra.length) | 0]; st[k] = (st[k] || 0) + Math.round(base[k] * (1 + lvl * .25) * (.6 + rnd() * .5)); }
    const w = slot === 'weapon' ? ['kunai', 'katana', 'katana', 'hache', 'marteau', 'fouet'][(rnd() * 6) | 0] : undefined;
    return { id: Math.random().toString(36).slice(2, 9), slot, r, lvl, st, w, name: (w ? WT[w].n : SLOTS[slot][0]) + ' ' + SUFFIX[(rnd() * SUFFIX.length) | 0] }; }
  const itemValue = it => Math.round((8 + it.lvl * 4) * (1 + it.r * 1.6));
  const itemLines = it => Object.keys(it.st).map(k => '+' + it.st[k] + ' ' + STN[k]).join(' · ');
  function giveItem(it) { if (S.bag.length >= 30) { S.ryo += itemValue(it); toastMini('Sac plein : vendu ' + itemValue(it) + ' ryō'); return; } S.bag.push(it); if (it.r === 3) { S.st.legend++; checkAch(); }
    addText(H().x, H().y, it.name, RAR[it.r].c, 1.15); if (it.r >= 2) { toast(RAR[it.r].n + ' !', it.name + ' — ' + itemLines(it)); sfx('lvl'); } }

  /* ================= collectibles: herbs in the grass, secret scrolls on rooftops and tree tops ================= */
  const herbs = [], secrets = [];
  /* ================= contracts (endless missions, three at a time) ================= */
  function newContract() { const L = S.lvl, kinds = ['hunt', 'hunt', 'herb', 'combo', 'roof', S.lvl >= 3 ? 'elite' : 'hunt', S.lvl >= 3 ? 'bandit' : 'herb'], k = kinds[(rnd() * kinds.length) | 0];
    const c = { k, p: 0, rw: { ryo: 35 + L * 14, xp: 50 + L * 28, gear: rnd() < .4 ? (k === 'elite' ? 2 : 1) : (k === 'elite' ? 1 : -1) } };
    if (k === 'hunt') { c.n = 5 + ((rnd() * 5) | 0); c.t = 'Chasse : ' + c.n + ' loups'; }
    if (k === 'bandit') { c.n = 4 + ((rnd() * 4) | 0); c.t = 'Contrat ★★ : ' + c.n + ' bandits'; c.rw.ryo += 40; }
    if (k === 'herb') { c.n = 4 + ((rnd() * 5) | 0); c.t = 'Cueillette : ' + c.n + ' herbes médicinales'; }
    if (k === 'combo') { c.n = 8 + ((rnd() * 4) | 0) * 3; c.t = 'Entraînement : un combo de ' + c.n; }
    if (k === 'roof') { c.n = 3 + ((rnd() * 3) | 0); c.t = 'Course sur les toits : ' + c.n + ' toits différents'; }
    if (k === 'elite') { c.n = 1; c.t = 'Traque : un ennemi Élite ★'; c.rw.ryo *= 2; c.rw.xp *= 2; }
    return c; }
  function fillContracts() { if (!S.q.q1 || S.q.q1 !== 'done') return; while (S.contracts.length < 3) S.contracts.push(newContract()); }
  function progress(k, v, abs) { let ch = false; for (const c of S.contracts) { if (c.k !== k || c.p >= c.n) continue; c.p = abs ? Math.max(c.p, v) : c.p + (v || 1); ch = true;
      if (c.p >= c.n) { c.p = c.n; S.ryo += c.rw.ryo; S.st.contracts++; sfx('quest'); toast('Contrat rempli', c.t + ' — ' + c.rw.ryo + ' ryō'); if (c.rw.gear >= 0) giveItem(genItem(S.lvl, c.rw.gear)); gainXp(c.rw.xp); c.done = true; checkAch(); } }
    if (ch) { S.contracts = S.contracts.filter(c => !c.done); fillContracts(); refresh(); } }

  /* ================= achievements ================= */
  const ACH = [['blood', 'Premier sang', 'Vaincre un ennemi', () => S.kills.wolf + S.kills.bandit + S.kills.boss >= 1, 20], ['wolf50', 'Fléau des loups', 'Vaincre 50 loups', () => S.kills.wolf >= 50, 200],
    ['band30', 'Justicier', 'Vaincre 30 bandits', () => S.kills.bandit >= 30, 250], ['boss', 'Tueur de déserteur', 'Vaincre Kurogane', () => S.kills.boss >= 1, 300], ['c15', 'Enchaînement', 'Combo de 15', () => S.st.maxCombo >= 15, 80],
    ['c40', 'Tempête de coups', 'Combo de 40', () => S.st.maxCombo >= 40, 300], ['roof', 'Chat des toits', 'Atterrir sur 25 toits', () => S.st.roofs >= 25, 120], ['water', 'Marche sur l’eau', 'Parcourir 200 m sur l’eau', () => S.st.water >= 200, 150],
    ['elite', 'Chasseur d’élites', 'Vaincre 10 Élites', () => S.st.elites >= 10, 300], ['legend', 'Légende vivante', 'Trouver un objet légendaire', () => S.st.legend >= 1, 400], ['herb', 'Herboriste', 'Cueillir 40 herbes', () => S.st.herbs >= 40, 120],
    ['scroll6', 'Archiviste', 'Trouver 6 rouleaux secrets', () => S.scrolls.length >= 6, 200], ['scroll', 'Gardien des secrets', 'Trouver les 12 rouleaux secrets', () => S.scrolls.length >= 12, 800], ['lvl10', 'Ninja aguerri', 'Atteindre le niveau 10', () => S.lvl >= 10, 400],
    ['contr', 'Mercenaire du Ciel', 'Remplir 20 contrats', () => S.st.contracts >= 20, 300], ['chunin', 'Chûnin', 'Terminer l’histoire', () => S.done, 500]];
  function checkAch() { for (const [id, n, d, test, r] of ACH) { if (S.ach[id] || !test()) continue; S.ach[id] = 1; S.ryo += r; setTimeout(() => { toast('Succès : ' + n, d + ' — ' + r + ' ryō'); sfx('lvl'); }, 900); } }

  /* ================= world entities ================= */
  const enemies = [], shots = [], fxs = [], texts = [], drops = [];
  const NPCS = [];  // quest NPCs (static, face the player)
  const ETYPE = {
    wolf: { name: 'Loup des bois', lvl: 1, hp: 46, dmg: 9, sp: 7.2, xp: 26, ryo: [4, 10], range: 1.7, aggro: 10 },
    bandit: { name: 'Bandit', lvl: 3, hp: 90, dmg: 14, sp: 5.6, xp: 48, ryo: [14, 30], range: 1.9, aggro: 11, look: 'bandit' },
    boss: { name: 'Kurogane le déserteur', lvl: 5, hp: 520, dmg: 22, sp: 6.4, xp: 420, ryo: [180, 220], range: 2, aggro: 15, look: 'rogue', boss: true } };
  if (window.KREG) Object.assign(ETYPE, KREG.enemyTypes());
  function roll(e) { const T = e.T, dl = Math.max(0, Math.floor((S.lvl - T.lvl) * .7)); e.elite = !T.boss && rnd() < .14; e.lvl = T.lvl + dl + (e.elite ? 1 : 0);
    e.max = Math.round(T.hp * (1 + .24 * dl) * (e.elite ? 2.6 : 1)); e.hp = e.max; e.dmg = Math.round(T.dmg * (1 + .16 * dl) * (e.elite ? 1.45 : 1)); e.xp = Math.round(T.xp * (1 + .3 * dl) * (e.elite ? 3 : 1)); }
  let nidC = 0;
  function spawn(type, x, y) { const T = ETYPE[type], e = { nid: ++nidC, type, T, x, y, home: [x, y], hp: T.hp, max: T.hp, yaw: rnd() * 360 | 0, t: rnd() * 5, state: 'idle', anim: 'idle', cd: 1, cd2: 3, act: null, actT: 0, hurtT: 0, dead: 0, wander: [x, y], wt: 0, show: 0 }; roll(e); enemies.push(e); return e; }

  /* ================= missions ================= */
  const Q = {
    q1: { title: 'Bienvenue à Aozora', giver: 'guard', steps: [{ txt: 'Présente-toi à la secrétaire, devant la résidence du Gardien', done: () => S.qp.q1met }], reward: { xp: 60, ryo: 30 } },
    q2: { title: '★ Les loups de la forêt', giver: 'mei', steps: [{ txt: 'Repousse les loups au sud du village', n: 6, cnt: () => S.qp.wolves || 0 }], reward: { xp: 180, ryo: 120, items: { kunai: 10, pillHp: 1 } } },
    q3: { title: 'Le toit du Gardien', giver: 'hayato', steps: [{ txt: 'Grimpe sur le toit de la résidence du Gardien (double saut !)', done: () => S.qp.roof }, { txt: 'Reviens voir Sensei Hayato', done: () => S.qp.q3back }], reward: { xp: 150, skill: 'fire' } },
    q4: { title: 'Livraison de ramen', giver: 'genzo', steps: [{ txt: 'Apporte le bol de ramen au médecin Ren, près du temple', done: () => S.qp.ramenGiven }], reward: { xp: 120, ryo: 60, items: { pillHp: 2, pillCk: 2 } } },
    q5: { title: '★★ Le camp des bandits', giver: 'mei', need: () => S.q.q2 === 'done' && S.lvl >= 3, steps: [{ txt: 'Mets en fuite les bandits du nord-ouest', n: 5, cnt: () => S.qp.bandits || 0 }, { txt: 'Bats leur chef, Kurogane le déserteur', done: () => S.qp.boss }, { txt: 'Fais ton rapport à la secrétaire Mei', done: () => S.qp.q5back }], reward: { xp: 600, ryo: 400, rank: 'Chûnin' } } };
  const qStep = id => { const q = Q[id]; for (let i = 0; i < q.steps.length; i++) { const s = q.steps[i]; const ok = s.n ? s.cnt() >= s.n : s.done(); if (!ok) return i; } return q.steps.length; };
  function startQuest(id) { if (S.q[id]) return; S.q[id] = 'active'; sfx('quest'); toast('Nouvelle mission', Q[id].title); if (id === 'q4') S.inv.ramenBowl = 1; refresh(); }
  function finishQuest(id) { const q = Q[id], r = q.reward; S.q[id] = 'done'; sfx('quest'); let msg = [];
    if (r.ryo) { S.ryo += r.ryo; msg.push(r.ryo + ' ryō'); } if (r.items) for (const k in r.items) { S.inv[k] = (S.inv[k] || 0) + r.items[k]; msg.push(r.items[k] + ' × ' + (ICONS.LABELS[k] || k)); }
    if (r.skill) { S.skills[r.skill] = true; msg.push('Technique : ' + SK[r.skill].name); }
    if (r.rank) { S.rank = r.rank; S.done = true; msg.push('Promotion : ' + r.rank + ' !'); }
    if (r.gear !== undefined) { const it = genItem(S.lvl, r.gear); giveItem(it); msg.push(it.name); }
    toast('Mission accomplie', q.title + ' — ' + msg.join(' · ')); if (r.xp) gainXp(r.xp); refresh(); save(); setTimeout(adBreak, 2500); }
  function gainXp(n) { S.xp += n; addText(A.hero.x, A.hero.y, '+' + n + ' XP', '#ffe08a', 1.3);
    while (S.lvl < MAXL && S.xp >= xpNeed()) { S.xp -= xpNeed(); S.lvl++; S.sp++; S.hp = maxHp(); S.ck = maxCk(); checkAch(); sfx('lvl'); fx('leafSwirl', A.hero.x, A.hero.y, 1, 1.6);
      let extra = ''; if (S.lvl >= 4 && !S.skills.sphere) { S.skills.sphere = true; extra = ' · Technique : Sphère de chakra (U)'; } for (const [id, lv] of [['dash', 5], ['water', 7], ['clone', 9], ['chidori', 11], ['wind', 13]]) if (S.lvl >= lv && !S.skills[id]) { S.skills[id] = true; extra += ' · Technique : ' + SK[id].name + ' (' + SK[id].key.toUpperCase() + ')'; } for (const [id, lv] of [['dash', 5], ['water', 7], ['clone', 9], ['chidori', 11], ['wind', 13]]) if (S.lvl >= lv && !S.skills[id]) { S.skills[id] = true; extra += ' · Technique : ' + SK[id].name + ' (' + SK[id].key.toUpperCase() + ')'; } for (const [id, lv] of [['dash', 5], ['water', 7], ['clone', 9], ['chidori', 11], ['wind', 13]]) if (S.lvl >= lv && !S.skills[id]) { S.skills[id] = true; extra += ' · Technique : ' + SK[id].name + ' (' + SK[id].key.toUpperCase() + ')'; } for (const [id, lv] of [['dash', 5], ['water', 7], ['clone', 9], ['chidori', 11], ['wind', 13]]) if (S.lvl >= lv && !S.skills[id]) { S.skills[id] = true; extra += ' · Technique : ' + SK[id].name + ' (' + SK[id].key.toUpperCase() + ')'; } for (const [id, lv] of [['dash', 5], ['water', 7], ['clone', 9], ['chidori', 11], ['wind', 13]]) if (S.lvl >= lv && !S.skills[id]) { S.skills[id] = true; extra += ' · Technique : ' + SK[id].name + ' (' + SK[id].key.toUpperCase() + ')'; } toast('Niveau ' + S.lvl + ' !', 'Vie et chakra augmentés · +1 point de technique (T)' + extra); } refresh(); }

  /* ================= dialogues ================= */
  const DLG = {
    guard: () => S.q.q1 === 'active' && !S.qp.q1met ? ['Halte ! Ah, c’est toi, le nouveau genin. Bienvenue à Aozora.', 'Va te présenter à la secrétaire Mei, devant la grande résidence rouge du Gardien, tout au nord de l’avenue.', 'Astuce : appuie sur Espace pour sauter, et encore une fois en l’air pour un double saut.']
      : ['Rien à signaler à la porte.', 'Les loups rôdent dans la forêt au sud. Reste sur tes gardes.'],
    mei: () => {
      if (S.q.q1 === 'active') return ['Te voilà ! Le Gardien m’a parlé de toi.', '*Mei tamponne ton dossier.* Tu es officiellement en service.', { act: () => { S.qp.q1met = true; finishQuest('q1'); } }, 'J’ai déjà une mission de rang D pour toi : des loups attaquent les voyageurs au sud de la porte. Repousses-en six.', { act: () => startQuest('q2') }];
      if (S.q.q2 === 'active') return qStep('q2') >= 1 ? ['Six loups ? Parfait, les voyageurs pourront passer.', { act: () => finishQuest('q2') }, 'Va voir Sensei Hayato près de l’académie (à l’ouest), il a quelque chose à t’apprendre.']
        : ['Les loups sont au sud, de l’autre côté de la grande porte. Tu en as repoussé ' + (S.qp.wolves || 0) + ' sur 6.'];
      if (S.q.q2 === 'done' && !S.q.q5) return S.lvl >= 3 ? ['Tu progresses vite. Une mission de rang C, maintenant.', 'Des bandits ont installé un camp au nord-ouest, près des falaises. Leur chef est un ninja déserteur : Kurogane. Sois prudent.', { act: () => startQuest('q5') }]
        : ['Entraîne-toi encore un peu. Reviens quand tu auras atteint le niveau 3 (tu es niveau ' + S.lvl + ').'];
      if (S.q.q5 === 'active') { const st = qStep('q5'); if (st >= 2) return ['Kurogane vaincu ?! Le conseil va en parler pendant des semaines.', { act: () => { S.qp.q5back = true; finishQuest('q5'); } }, 'Par décision du Gardien, tu es promu Chûnin. Félicitations !', { act: () => showEnd() }];
        return ['Le camp des bandits est au nord-ouest. ' + (st === 0 ? 'Bandits repoussés : ' + (S.qp.bandits || 0) + '/5.' : 'Il reste leur chef, Kurogane.')]; }
      return ['Merci pour tout ce que tu fais pour le village, ' + S.rank + ' ' + S.name + '.'];
    },
    hayato: () => {
      if (!S.q.q3 && S.q.q2 === 'done') return ['Alors c’est toi qui as chassé les loups ? Pas mal.', 'Un ninja doit savoir se déplacer partout, même sur les toits.', 'Grimpe tout en haut de la résidence du Gardien. Double saut, et accroche-toi aux rebords !', { act: () => startQuest('q3') }];
      if (!S.q.q3) return ['Je suis Hayato, instructeur à l’académie.', 'Termine d’abord ta première mission auprès de la secrétaire Mei.'];
      if (S.q.q3 === 'active') return S.qp.roof ? ['Je t’ai vu là-haut ! Tu as de bonnes jambes.', 'Je vais t’apprendre une technique de feu : la boule de feu. Touche L.', { act: () => { S.qp.q3back = true; finishQuest('q3'); } }] : ['Le toit de la résidence du Gardien, c’est tout en haut. Saute de toit en toit si c’est trop haut.'];
      return ['Continue à t’entraîner. La boule de feu coûte du chakra : surveille ta jauge bleue.'];
    },
    genzo: () => {
      if (!S.q.q4) return ['Bienvenue ! Le meilleur ramen du village.', 'Dis, tu pourrais me rendre un service ? Le médecin Ren, près du temple à l’est, n’a pas mangé depuis ce matin.', { act: () => startQuest('q4') }, 'Voilà le bol. Ne le renverse pas !'];
      if (S.q.q4 === 'active') return ['Le temple est à l’est du centre, avec son grand toit rouge. Ren t’attend devant.'];
      return ['Reviens quand tu veux ! (Les bols de ramen se vendent chez la marchande Aiko.)'];
    },
    ren: () => {
      if (S.q.q4 === 'active' && !S.qp.ramenGiven) return ['Un ramen de chez Genzo ? Tu me sauves la vie !', { act: () => { S.qp.ramenGiven = true; S.inv.ramenBowl = 0; finishQuest('q4'); } }, 'Prends ces pilules, elles soignent les blessures et rendent du chakra.'];
      return ['Si tu es blessé, viens me voir.', { act: () => { S.hp = maxHp(); S.ck = maxCk(); fx('aura', A.hero.x, A.hero.y, .8, 1); }, txt: '*Ren te soigne entièrement.*' }];
    },
    aiko: () => ['Kunai, pilules, ramen… J’ai tout ce qu’il faut à un ninja !', { shop: true }],
  };
  let dlg = null;
  // region NPCs never use the Aozora dialogues (Kiri's Mei is not the secretary)
  function openDlg(npc, custom) { const lines = custom || (EXT.dlg && EXT.dlg(npc)) || (!A.region && DLG[npc.id] ? DLG[npc.id]() : npc.lines || ['…']); dlg = { npc, lines, i: 0 }; $('#k-dlg').hidden = false; portrait($('#k-dlg canvas'), LOOKS[npc.look] || npc.lookObj || {}, null); $('#k-dlg .who').textContent = npc.name; nextLine(true); }
  function nextLine(first) { if (!dlg) return; if (!first) dlg.i++;
    while (dlg.i < dlg.lines.length && typeof dlg.lines[dlg.i] === 'object') { const o = dlg.lines[dlg.i]; if (o.shop) { closeDlg(); openPanel('shop'); return; } o.act && o.act(); if (o.txt) { dlg.lines.splice(dlg.i + 1, 0, o.txt); } dlg.i++; }
    if (dlg.i >= dlg.lines.length) { closeDlg(); return; }
    const t = dlg.lines[dlg.i]; dlg.full = t; dlg.shown = 0; dlg.typing = true; sfx('talk');
    const ch = $('#k-dlg .ch'); ch.innerHTML = ''; const b = document.createElement('button'); b.className = 'kbtn'; b.textContent = dlg.i < dlg.lines.length - 1 ? 'Suite ▸' : 'Au revoir'; b.onclick = e => { e.stopPropagation(); advance(); }; ch.appendChild(b); }
  function advance() { if (!dlg) return; if (dlg.typing) { dlg.shown = dlg.full.length; dlg.typing = false; } else nextLine(); }
  function closeDlg() { const cb = dlg && dlg.onClose; dlg = null; $('#k-dlg').hidden = true; refresh(); save(); if (cb) setTimeout(cb, 0); }

  /* ================= menus v2 (the approved mock-up): Sac, Rouleau des jutsus, Missions ================= */
  let bagSel = null, bagF = 'all', jutSel = null, qSel = null, qF = 'story';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const RCOL = ['#A8A29A', '#4DA8FF', '#B26BFF', '#F0A020'];
  const WDESC = { kunai: 'se lance à distance', katana: 'rapide et précis', hache: 'coups lents, gros recul', marteau: 'très lent, frappe fort', fouet: 'longue portée, balaie large' };
  const IDESC = { pillHp: 'Rend 60 points de vie.', pillCk: 'Rend 60 points de chakra.', ramen: 'Régénère ta vie pendant quelques secondes.', kunai: 'Munitions du lancer de kunai.', ramenBowl: 'Le bol à livrer au médecin Ren, près du temple.' };
  const JDESC = { fist: 'Coups de poing et de pied au corps à corps. Enchaîne-les pour faire monter le combo.', kunai: 'Lance un kunai sur ta cible. Chaque lancer consomme un kunai du sac.',
    fire: 'Une boule de feu part droit devant toi et brûle le premier ennemi touché.', sphere: 'Une sphère de chakra explose devant toi et repousse violemment les ennemis proches.',
    subst: 'Tu disparais dans un nuage de fumée et laisses une bûche à ta place.', dash: 'Un pas éclair dans la direction de ton trait.',
    water: 'Un dragon d’eau fonce devant toi et traverse tous les ennemis sur sa route.', clone: 'Trois clones apparaissent et attaquent chacun l’ennemi le plus proche.',
    chidori: 'Tu fonces en ligne droite, la main chargée d’éclairs, et traverses les ennemis sur ta route.', wind: 'Une lame de vent tranche tous les ennemis devant toi.' };
  const GDESC = { V: 'Trace un V', O: 'Trace un cercle', L: 'Trace un L', S: 'Trace un S', M: 'Trace un M', Z: 'Trace un Z', W: 'Trace un W', '—': 'Trace un trait droit, dans la direction voulue' };
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const labOf = k => k === 'ramenBowl' ? 'Bol pour Ren' : ICONS.LABELS[k] || k;
  const isTouch = () => document.body.classList.contains('touch');
  const v2head = (t, kj, extra) => `<div class="v2h"><h2>${t} <small>${kj}</small></h2>${extra || ''}</div>`;
  function gpsTo(x, y) { S.wp = { r: regId(), x, y }; gpsRoute(true); if (!GPS.path) { S.wp = null; return false; } const e2 = GPS.path[GPS.path.length - 1]; S.wp.x = e2[0]; S.wp.y = e2[1]; GPS.key = S.wp.x + ',' + S.wp.y; save(); return true; }

  /* ---------- Sac: the character with his five slots, the bag, the detail card with comparison ---------- */
  function renderBag(P) { const box = P.querySelector('#k-v2'); if (!box) return; const g = gear();
    for (const it of S.bag) if (!it.id) it.id = Math.random().toString(36).slice(2, 9);
    const ents = []; for (const k in S.inv) if (S.inv[k] > 0) ents.push({ key: 'i:' + k, k });
    S.bag.slice().sort((a, b) => b.r - a.r || b.lvl - a.lvl).forEach(it => ents.push({ key: 'g:' + it.id, it }));
    const find = key => { if (!key) return null; if (key.startsWith('e:')) { const sl = key.slice(2), it = S.eq[sl]; return it ? { key, it, eq: sl } : null; } return ents.find(e => e.key === key) || null; };
    let sel = find(bagSel); if (!sel) { sel = ents.find(e => e.it) || ents[0] || null; bagSel = sel && sel.key; }
    const vis = ents.filter(e => bagF === 'all' || (bagF === 'gear') === !!e.it);
    const SLP = { head: 'l t', body: 'l m', weapon: 'r t', hands: 'r m', feet: 'c b' };
    box.innerHTML = v2head('Sac', '忍具袋', `<span class="pill gold">${fmt(S.ryo)} 両</span>`) + `<div class="v2b bagb">
      <section class="card eqc"><div class="fig"><canvas id="k-fig" width="200" height="340"></canvas>${Object.keys(SLOTS).map(sl => { const it = S.eq[sl]; return `<button class="eqslot ${SLP[sl]}${bagSel === 'e:' + sl ? ' sel' : ''}${it ? '' : ' empty'}" data-sl="${sl}" style="--r:${it ? RCOL[it.r] : 'rgba(246,235,211,.16)'}" aria-label="${SLOTN[sl]}${it ? ' : ' + esc(it.name) : ', vide'}"><small>${SLOTN[sl]}</small></button>`; }).join('')}</div>
        <div class="sts"><span>Vie <b>${fmt(maxHp())}</b></span><span>Chakra <b>${fmt(maxCk())}</b></span><span>Attaque <b>+${g.atk} %</b></span><span>Défense <b>${g.def}</b></span><span>Critique <b>${g.crit} %</b></span><span>Vitesse <b>${g.spd} %</b></span></div></section>
      <section class="inv"><div class="chips">${[['all', 'Tout'], ['gear', 'Équipement'], ['cons', 'Consommables']].map(([k, n]) => `<button data-f="${k}" class="${bagF === k ? 'on' : ''}">${n}</button>`).join('')}<span class="cnt">${S.bag.length} / 30</span></div>
        <div class="igrid">${vis.map(e => `<button class="bi${e.key === bagSel ? ' sel' : ''}" data-k="${e.key}" style="--r:${e.it ? RCOL[e.it.r] : 'rgba(246,235,211,.16)'}" aria-label="${esc(e.it ? e.it.name : labOf(e.k) + ', ' + S.inv[e.k])}">${e.it ? '' : `<span>${S.inv[e.k]}</span>`}</button>`).join('')}</div>${vis.length ? '' : '<p class="help">Rien ici pour l’instant.</p>'}
        <p class="help">${S.rank} · niveau ${S.lvl} · rouleaux secrets ${S.scrolls.length} / ${secrets.length} · herbes ${S.herbs}</p></section>
      <section class="card det" id="k-det" style="--r:${sel && sel.it ? RCOL[sel.it.r] : 'rgba(246,235,211,.16)'}"></section></div>`;
    // icons and the hero
    box.querySelectorAll('.eqslot').forEach(b => { const it = S.eq[b.dataset.sl]; b.prepend(iconCanvas(it ? iconOf(it) : SLOTS[b.dataset.sl][1], 28)); });
    box.querySelectorAll('.bi').forEach(b => { const e = find(b.dataset.k); if (e) b.prepend(iconCanvas(e.it ? iconOf(e.it) : e.k, 30)); });
    const fc = box.querySelector('#k-fig'), fq = fc.getContext('2d'); fq.save(); fq.translate(100, 326); fq.scale(1.85, 1.85); try { HERO.draw(fq, { anim: 'idle', phase: .2, yaw: 0, look: LOOKS.player }); } catch (e) {} fq.restore();
    // the detail card
    const det = box.querySelector('#k-det');
    if (!sel) det.innerHTML = '<p class="help">Ton sac est vide.</p>';
    else if (sel.it) { const it = sel.it, cur = sel.eq ? null : S.eq[it.slot], keys = [...new Set([...Object.keys(it.st), ...(cur ? Object.keys(cur.st) : [])])];
      det.innerHTML = `<div class="rk" style="color:${RCOL[it.r]}">${RAR[it.r].n} · ${SLOTN[it.slot]}${sel.eq ? ' · porté' : ''}</div><h3>${esc(it.name)}</h3><div class="sub">Niveau ${it.lvl}${it.slot === 'weapon' ? ' · ' + WDESC[it.w || 'kunai'] : ''}</div><hr>
        ${keys.map(k => { const v = it.st[k] || 0, d = cur ? v - (cur.st[k] || 0) : null, u = k === 'crit' || k === 'spd' ? ' %' : ''; return `<div class="st"><span>${STN[k].replace(' %', '')}</span><b class="${v ? 'up' : 'nil'}">${v ? '+' + v + u : '—'}${d ? ` <small class="${d > 0 ? 'up' : 'dn'}">(${d > 0 ? '+' : '−'}${Math.abs(d)})</small>` : ''}</b></div>`; }).join('')}
        <div class="sub">${sel.eq ? 'Équipé en ce moment' : cur ? 'Entre parenthèses : l’écart avec ' + esc(cur.name) : 'Emplacement ' + SLOTN[it.slot].toLowerCase() + ' libre'}</div>
        <div class="acts">${sel.eq ? '<button class="b1" data-a="unequip">Retirer</button>' : `<button class="b1" data-a="equip">Équiper</button><button class="b2" data-a="sell"><small>Vendre</small>${itemValue(it)} 両</button>`}</div>`; }
    else { const k = sel.k; det.innerHTML = `<div class="rk">Consommable</div><h3>${esc(labOf(k))}</h3><div class="sub">Tu en as ${S.inv[k]}</div><hr><p class="dsc">${IDESC[k] || ''}</p><div class="acts">${ITEMUSE[k] ? `<button class="b1" data-a="use">Utiliser${isTouch() ? '' : ' (' + ITEMUSE[k].key + ')'}</button>` : ''}</div>`; }
    const act = a => { const it = sel.it;
      if (a === 'equip') { S.bag = S.bag.filter(x => x !== it); if (S.eq[it.slot]) S.bag.push(S.eq[it.slot]); S.eq[it.slot] = it; bagSel = 'e:' + it.slot; S.hp = Math.min(S.hp, maxHp()); sfx('coin2'); refresh(); weaponHint(); }
      if (a === 'unequip') { if (S.bag.length >= 30) { toast('Sac plein', 'Vends un objet avant de retirer celui-ci'); return; } S.bag.push(it); delete S.eq[sel.eq]; S.hp = Math.min(S.hp, maxHp()); bagSel = 'g:' + it.id; sfx('ui'); refresh(); }
      if (a === 'sell') { S.bag = S.bag.filter(x => x !== it); S.ryo += itemValue(it); bagSel = null; sfx('coin'); refresh(); }
      if (a === 'use') useItem(sel.k);
      save(); renderBag(P); };
    box.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { bagF = b.dataset.f; sfx('ui'); renderBag(P); });
    box.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { bagSel = b.dataset.k; renderBag(P); });
    box.querySelectorAll('[data-sl]').forEach(b => b.onclick = () => { if (S.eq[b.dataset.sl]) { bagSel = 'e:' + b.dataset.sl; renderBag(P); } else { bagF = 'gear'; renderBag(P); } });
    box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => act(b.dataset.a)); }

  /* ---------- Rouleau des jutsus: the list, the seals of each technique, a pad to practise the gesture ---------- */
  function renderJutsu(P) { const box = P.querySelector('#k-v2'); if (!box) return; const KS = window.KSEAL, ids = Object.keys(SK);
    if (!SK[jutSel]) jutSel = ids.find(id => KS && KS.GLYPH[id] && !(SK[id].lock && SK[id].lock())) || ids[0];
    const id = jutSel, k = SK[id], lk = !!(k.lock && k.lock()), r = S.rk[id] || 1, gl = KS && KS.GLYPH[id], seq = (KS && KS.SEQ[id]) || [];
    const glyph = i => KS && KS.GLYPH[i] ? `<span class="g">${KS.GLYPH[i]}</span>` : `<span class="g ic" data-ic="${SK[i].icon}"></span>`;
    box.innerHTML = v2head('Rouleau des jutsus', '巻物', `<span class="pill gold">${S.sp} point${S.sp > 1 ? 's' : ''} de technique</span>`) + `<div class="v2b jutb">
      <div class="list">${ids.map(i => { const L = !!(SK[i].lock && SK[i].lock()), R = S.rk[i] || 1; return `<button class="j${i === id ? ' on' : ''}${L ? ' lk' : ''}" data-j="${i}">${L ? '<span class="g">🔒</span>' : glyph(i)}<span class="nm"><b>${esc(SK[i].name)}</b>${L ? `<small>${esc(SK[i].hint)}</small>` : `<span class="pips">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= R ? 'on' : ''}"></i>`).join('')}</span>`}</span>${!L && SK[i].ck ? `<small class="ck">${SK[i].ck}</small>` : ''}</button>`; }).join('')}</div>
      <section class="card jdet"><div class="col">
        <div class="t"><h3>${esc(k.name)}</h3><span>${lk ? 'verrouillée' : 'rang ' + r + ' / 5'}</span></div>
        <p class="dsc">${JDESC[id] || ''}</p>
        <div class="nums">${['fist', 'kunai', 'fire', 'sphere', 'chidori', 'water', 'wind', 'clone'].includes(id) ? `<span>Dégâts <b>${fmt(dmgOf(id))}</b></span>` : ''}${k.ck ? `<span>Chakra <b class="ck">${k.ck}</b></span>` : ''}<span>Recharge <b>${(k.cd * (1 - (r - 1) * .08)).toFixed(1).replace('.', ',')} s</b></span>${isTouch() ? '' : `<span>Touche <b>${k.key.toUpperCase()}</b></span>`}</div>
        ${lk ? `<div class="lock">🔒 S’apprend : ${esc(k.hint)}</div>` : ''}
        ${seq.length ? `<div class="lab">Signes</div><div class="seals">${seq.map(s => `<div class="sg"><canvas width="128" height="128" data-s="${s}"></canvas><b>${KS.SEALS[s].k}</b><span>${KS.SEALS[s].n}</span></div>`).join('')}</div>` : ''}
        <div class="acts">${!lk && r < 5 ? `<button class="b1" data-up ${S.sp ? '' : 'disabled'}>Améliorer · +20 % dégâts</button>` : !lk ? '<span class="sub">Rang maximal atteint</span>' : ''}</div></div>
        ${gl ? `<div class="pad"><div class="lab ck">S’entraîner</div><div class="pz"><canvas></canvas><div class="gh">${gl}</div></div><div class="sub" id="k-pmsg">${GDESC[gl]} pour lancer ${esc(KS.TECH[id] || k.name)}</div></div>`
          : `<div class="pad"><div class="lab ck">En combat</div><div class="pz nogl"><div class="sub">${id === 'fist' ? 'Le bouton poing, en bas à droite' : 'Le bouton kunai, en bas à droite'}${isTouch() ? '' : ' · touche ' + k.key.toUpperCase()}</div></div></div>`}
      </section></div>`;
    box.querySelectorAll('.g.ic').forEach(s => s.appendChild(iconCanvas(s.dataset.ic, 22)));
    box.querySelectorAll('.sg canvas').forEach(c => { const q = c.getContext('2d'); q.scale(128 / 230, 128 / 230); q.fillStyle = 'rgba(246,235,211,.92)'; q.beginPath(); q.arc(115, 115, 112, 0, TAU); q.fill(); q.translate(115, 128); try { KS.drawSeal(q, c.dataset.s, 0); } catch (e) {} });
    box.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { jutSel = b.dataset.j; sfx('ui'); renderJutsu(P); });
    const up = box.querySelector('[data-up]'); if (up) up.onclick = () => { if (!S.sp) return; S.sp--; S.rk[id] = (S.rk[id] || 1) + 1; sfx('lvl'); refresh(); save(); renderJutsu(P); };
    // the practice pad: the same recognizer as in combat
    const pz = box.querySelector('.pz:not(.nogl)'); if (!pz || !KS) return; const cv = pz.querySelector('canvas'), msg = box.querySelector('#k-pmsg'); let pts = null;
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = pz.clientWidth * d; cv.height = pz.clientHeight * d; const q = cv.getContext('2d'); q.setTransform(d, 0, 0, d, 0, 0); return q; }; let q = fit();
    const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.onpointerdown = e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); q = fit(); pts = [pos(e)]; pz.classList.add('on'); };
    cv.onpointermove = e => { if (!pts) return; const p = pos(e), l = pts[pts.length - 1]; pts.push(p); q.strokeStyle = '#9fd4ff'; q.lineWidth = 5; q.lineCap = q.lineJoin = 'round'; q.shadowColor = '#4DA8FF'; q.shadowBlur = 10; q.beginPath(); q.moveTo(l[0], l[1]); q.lineTo(p[0], p[1]); q.stroke(); };
    cv.onpointerup = cv.onpointercancel = () => { if (!pts) return; const res = KS.recognize(pts); pts = null; pz.classList.remove('on');
      if (res && res.id === id) { msg.innerHTML = '<b class="ok">Réussi !</b> ' + esc(KS.TECH[id] || k.name); pz.classList.add('ok'); sfx('quest'); KS.play(id, k.name); }
      else { msg.innerHTML = '<b class="ko">' + (res ? 'Ça, c’est ' + esc(KS.TECH[res.id] || res.id) : 'Geste non reconnu') + '</b> · ' + GDESC[gl]; pz.classList.remove('ok'); sfx('ui'); }
      setTimeout(() => { if (cv.isConnected && !pts) { q = fit(); pz.classList.remove('ok'); } }, 900); }; }

  /* ---------- Missions: the list, the steps, the rewards, and "Suivre au GPS" ---------- */
  function qTarget(id) { if (EXT.target) { const t = EXT.target(id); if (t !== undefined) return t; }
    const q = Q[id], st = qStep(id); if (A.region) return { travel: 'Aozora' };
    const npc = nid => { const n = NPCS.find(n => n.id === nid); return n ? { xy: [n.x, n.y], what: n.name } : null; };
    const foe = (f, what) => { let b = null, bd = 1e9; for (const e of enemies) if (!e.dead && f(e)) { const d = Math.hypot(e.x - H().x, e.y - H().y); if (d < bd) { bd = d; b = e; } } return b ? { xy: [b.x, b.y], what } : null; };
    if (st >= q.steps.length) return npc(q.giver);
    const T = { q1: () => npc('mei'), q2: () => foe(e => e.type === 'wolf', 'les loups') || npc('guard'), q3: () => npc(st ? 'hayato' : 'mei'), q4: () => npc('ren'),
      q5: () => st === 0 ? foe(e => e.type === 'bandit', 'le camp des bandits') : st === 1 ? foe(e => e.type === 'boss', 'Kurogane') : npc('mei') };
    return T[id] ? T[id]() : npc(q.giver); }
  function cTarget(c) { const near = (list, what) => { let b = null, bd = 1e9; for (const p of list) { const d = Math.hypot(p.x - H().x, p.y - H().y); if (d < bd) { bd = d; b = p; } } return b ? { xy: [b.x, b.y], what } : null; };
    if (c.k === 'hunt') return near(enemies.filter(e => !e.dead && e.type === 'wolf'), 'des loups');
    if (c.k === 'bandit') return near(enemies.filter(e => !e.dead && e.type === 'bandit'), 'des bandits');
    if (c.k === 'elite') return near(enemies.filter(e => !e.dead && e.elite), 'un Élite');
    if (c.k === 'herb') return near(herbs.filter(h => h.t <= 0), 'une herbe médicinale');
    return null; }
  function renderQuests(P) { const box = P.querySelector('#k-v2'); if (!box) return;
    const story = Object.keys(Q).filter(id => S.q[id]).sort((a, b) => (S.q[a] === 'done') - (S.q[b] === 'done') || (b === S.trackQ) - (a === S.trackQ));
    const act = story.filter(id => S.q[id] === 'active'), nAch = Object.keys(S.ach).length;
    if (qF === 'story' && !Q[qSel]) qSel = act[0] || story[0] || null;
    if (qF === 'contr' && !S.contracts[qSel]) qSel = S.contracts.length ? 0 : null;
    const chips = [['story', 'Histoire', act.length], ['contr', 'Contrats', S.contracts.length], ['ach', 'Succès', nAch + ' / ' + ACH.length]];
    let list = '', det = '';
    const giverN = id => { const g = EXT.giver && EXT.giver(id); if (g) return g; const n = NPCS.find(n => n.id === Q[id].giver); return n ? n.name : ''; };
    if (qF === 'story') { list = story.map(id => { const q = Q[id], dn = S.q[id] === 'done', st = qStep(id); return `<button class="q${id === qSel ? ' on' : ''}${dn ? ' dn' : ''}" data-q="${id}"><span class="tg">${dn ? 'Terminée' : id === S.trackQ ? 'Suivie' : 'En cours'}</span><b>${esc(q.title)}</b>${dn ? '' : `<small>Étape ${Math.min(st + 1, q.steps.length)} / ${q.steps.length}</small>`}</button>`; }).join('') || '<p class="help">Aucune mission pour le moment. Cherche les <b>!</b> dorés au-dessus des villageois.</p>';
      if (Q[qSel]) { const id = qSel, q = Q[id], st = qStep(id), dn = S.q[id] === 'done', rw = q.reward || {}, gv = giverN(id), saga = /^c\d+$/.test(id);
        const R = []; if (rw.xp) R.push(['gold', fmt(rw.xp) + ' XP']); if (rw.ryo) R.push(['gold', fmt(rw.ryo) + ' ryō']); if (rw.items) for (const k in rw.items) R.push(['', rw.items[k] + ' × ' + labOf(k)]);
        if (rw.gear !== undefined) R.push(['rar' + rw.gear, 'Équipement ' + RAR[rw.gear].n.toLowerCase()]); if (rw.skill && SK[rw.skill]) R.push(['gps', SK[rw.skill].name]); if (rw.rank) R.push(['red', rw.rank]);
        const steps = q.steps.map((s, i) => { const ok = dn || i < st, cur = !dn && i === st; return `<div class="step${ok ? ' ok' : cur ? ' cur' : ''}"><i></i><span>${esc(s.txt)}${s.n ? ` <b>${Math.min(s.n, s.cnt())} / ${s.n}</b>` : ''}</span></div>`; }).join('') + (!dn && st >= q.steps.length && gv ? `<div class="step cur"><i></i><span>Retourne voir ${esc(gv)}</span></div>` : '');
        const t = dn ? null : qTarget(id), dist = t && t.xy ? Math.round(Math.hypot(t.xy[0] - H().x, t.xy[1] - H().y)) : 0;
        det = `<section class="card qdet"><div class="hd"><div class="kj">${saga ? '影' : '任'}</div><div><h3>${esc(q.title)}</h3>${gv ? `<div class="sub">Donnée par ${esc(gv)}</div>` : ''}</div></div>
          <div class="steps">${steps}</div>${R.length ? `<div class="lab">Récompenses</div><div class="rws">${R.map(([c, t]) => `<span class="rw ${c}">${esc(t)}</span>`).join('')}</div>` : ''}
          <div class="acts">${dn ? '<span class="sub">Mission accomplie</span>' : t && t.travel ? `<button class="b3" data-go="travel">Voyager vers ${esc(t.travel)}</button>` : t ? `<button class="b3" data-go="gps"><svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10 L6 1 L10 10 L6 7.5 Z" fill="#fff"/></svg>${S.trackQ === id && S.wp ? 'Suivie au GPS' : 'Suivre au GPS'} · ${dist} m</button><button class="b2" data-go="map">Voir sur la carte</button>` : '<span class="sub">Pas de repère pour cette étape</span>'}</div></section>`;
        box.dataset.t = ''; box._t = t; } }
    if (qF === 'contr') { list = S.contracts.map((c, i) => `<button class="q${i === qSel ? ' on' : ''}" data-q="${i}"><span class="tg">Contrat</span><b>${esc(c.t)}</b><small>${c.p} / ${c.n}</small></button>`).join('') || '<p class="help">Les contrats du village s’ouvrent après ta première mission.</p>';
      const c = S.contracts[qSel]; if (c) { const t = cTarget(c), dist = t ? Math.round(Math.hypot(t.xy[0] - H().x, t.xy[1] - H().y)) : 0;
        det = `<section class="card qdet"><div class="hd"><div class="kj">契</div><div><h3>${esc(c.t)}</h3><div class="sub">Contrat du village · se renouvelle sans fin</div></div></div>
          <div class="steps"><div class="step cur"><i></i><span>Progression <b>${c.p} / ${c.n}</b></span></div></div><div class="lab">Récompenses</div>
          <div class="rws"><span class="rw gold">${fmt(c.rw.ryo)} ryō</span><span class="rw gold">${fmt(c.rw.xp)} XP</span>${c.rw.gear >= 0 ? `<span class="rw rar${c.rw.gear}">Équipement ${c.rw.gear ? RAR[c.rw.gear].n.toLowerCase() + ' ou mieux' : ''}</span>` : ''}</div>
          <div class="acts">${t ? `<button class="b3" data-go="gps"><svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10 L6 1 L10 10 L6 7.5 Z" fill="#fff"/></svg>Aller vers ${esc(t.what)} · ${dist} m</button>` : '<span class="sub">Pas de repère : ce contrat se remplit partout</span>'}</div></section>`;
        box._t = t; } }
    box.innerHTML = v2head('Missions', '任務書', `<div class="chips">${chips.map(([k, n, c]) => `<button data-f="${k}" class="${qF === k ? 'on' : ''}">${n} <b>${c}</b></button>`).join('')}</div>`)
      + (qF === 'ach' ? `<div class="achg">${ACH.map(([id, n, d, , r]) => `<div class="ach${S.ach[id] ? ' ok' : ''}"><b>${S.ach[id] ? '✔ ' : ''}${esc(n)}</b><span>${esc(d)}</span><small>${r} 両</small></div>`).join('')}</div>`
        : `<div class="v2b qb"><div class="list">${list}</div>${det || '<section class="card qdet"><p class="help">Choisis une mission dans la liste.</p></section>'}</div>`);
    box.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { if (qF !== b.dataset.f) { qF = b.dataset.f; qSel = null; sfx('ui'); renderQuests(P); } });
    box.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { qSel = qF === 'contr' ? +b.dataset.q : b.dataset.q; renderQuests(P); });
    box.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const t = box._t, g = b.dataset.go; if (!t) return;
      if (g === 'travel') { closePanel(); if (window.KREG) KREG.open(); return; }
      if (!gpsTo(t.xy[0], t.xy[1])) { toast('GPS', 'Impossible de tracer un chemin jusque-là'); return; }
      if (qF === 'story') S.trackQ = qSel; sfx('quest'); refresh(); save();
      if (g === 'map') openPanel('map'); else { closePanel(); toast('Itinéraire tracé', 'Suis la ligne violette jusqu’à ' + (t.what || 'la destination')); } }); }

  /* ================= panels ================= */
  let panel = null;
  function iconCanvas(name, px) { const c = document.createElement('canvas'), d = Math.min(2, devicePixelRatio || 1); c.width = c.height = px * d; const q = c.getContext('2d'); q.scale(d, d); try { ICONS.draw(q, name === 'ramenBowl' ? 'ramen' : name, px); } catch (e) {} return c; }
  const V2 = { bag: renderBag, jutsu: renderJutsu, quests: renderQuests };
  function openPanel(kind) { panel = kind; sfx('ui'); if (window.KTOUCH) KTOUCH.show(false); const P = $('#k-panel'); P.style.setProperty('--pw', kind === 'map' || V2[kind] ? '920px' : '640px'); P.classList.toggle('v2p', !!V2[kind]); P.hidden = false; $('#k-dim').hidden = false; const VT = { bag: '忍具袋', jutsu: '巻物', quests: '任務書', shop: '道具屋', map: '青空地図', opts: '巻物' }; let h = ROD() + '<span class="vt">' + VT[kind] + '</span><button class="x" aria-label="Fermer">✕</button><div class="scr">';
    if (V2[kind]) h += '<div class="v2" id="k-v2"></div>';
    if (kind === 'shop') { h += `<h2><span class="seal">店</span>Boutique d’Aiko</h2><p>Tu as <b>${S.ryo} ryō</b>.${S.herbs ? ` <button class="kbtn alt" id="k-sellh">Vendre ${S.herbs} herbe${S.herbs > 1 ? 's' : ''} (${S.herbs * 6} 両)</button>` : ''}</p><div class="grid" id="k-shop"></div>`; }
    if (kind === 'map') { h += '<h2><span class="seal">地</span>Carte ' + (A.region ? '· ' + A.region.name : 'd’Aozora') + (window.KREG ? '<button class="kbtn" id="k-towrld" style="margin-left:auto;min-height:0;padding:5px 12px;font-size:13px">🗺 Carte du monde · voyager</button>' : '') + '</h2><div id="k-mapview"><canvas id="k-bigmap"></canvas><div class="mz"><button data-z="in" aria-label="Zoomer">+</button><button data-z="out" aria-label="Dézoomer">−</button><button data-z="fit" aria-label="Voir toute la carte">⤢</button><button data-z="me" aria-label="Centrer sur moi">◎</button><button data-z="clr" aria-label="Retirer la destination" class="clr">✕</button></div><div class="mtip">Touche la carte pour poser ta destination</div></div><p class="help">Le point rouge, c’est toi. Touche un endroit pour y poser ta destination : le chemin s’affiche en violet, sur la carte et au sol. Touche le repère pour le retirer. Glisse pour te déplacer, pince ou molette pour zoomer.</p>'; }
    if (kind === 'opts') { h += `<h2><span class="seal">巻</span>Menu</h2><div style="display:grid;gap:10px;max-width:340px"><button class="kbtn" data-o="resume">Reprendre</button><button class="kbtn alt" data-o="save">Sauvegarder</button>
        <button class="kbtn alt" data-o="sound">Son : ${S.sound ? 'activé' : 'coupé'}</button><button class="kbtn alt" data-o="quality">Qualité : ${({ high: 'haute', auto: 'auto', perf: 'performance' })[window.KMAP && KMAP.quality ? KMAP.quality() : 'high']}</button><button class="kbtn alt" data-o="look">Changer d’apparence</button><button class="kbtn alt" data-o="tuto">☝️ ${tt('replay')}</button>${NADS() ? '<button class="kbtn alt" data-o="adchoices">Choix publicitaires</button>' : ''}<button class="kbtn alt" data-o="reset">Recommencer une partie</button></div>
        <h2 style="margin-top:18px;font-size:18px">Commandes</h2><div class="help">Déplacement : ZQSD / WASD / flèches, ou maintenir le doigt · Tab ou clic : cibler un ennemi · T : techniques · Maj : course ninja · Espace : saut, double saut · E : parler · Dès le niveau 3, tu peux marcher sur l’eau (coûte un peu de chakra)<br>J : taijutsu · K : kunai · L : boule de feu · U : sphère de chakra · I : substitution · G : shunshin · P : dragon d’eau · H : multiclonage · O : Lame-tonnerre · Y : lame de vent · 1 2 3 : objets<br>B : sac · M : missions · N : carte · Échap : menu · Molette : zoom<br>Sur téléphone : joystick avec le pouce gauche, pincer à deux doigts pour zoomer, bouton 地 pour cacher la carte. Avec un katana, une hache, un marteau ou un fouet (boutique d’Aiko), glisse le doigt sur les ennemis pour trancher, plusieurs d’un seul geste pour un bonus.</div>`; }
    const TABS = [['bag', '袋', 'Sac'], ['jutsu', '術', 'Jutsus'], ['quests', '任', 'Missions'], ['map', '地', 'Carte'], ['opts', '巻', 'Menu']];
    if (kind !== 'shop') h = h.replace('<div class="scr">', '<div class="ptabs">' + TABS.map(([k, kj, n]) => `<button data-t="${k}" class="${k === kind ? 'on' : ''}"><b>${kj}</b>${n}</button>`).join('') + '</div><div class="scr">');
    P.innerHTML = h + '</div>'; P.querySelector('.x').onclick = closePanel; P.querySelectorAll('.ptabs button').forEach(b => b.onclick = () => { if (b.dataset.t !== kind) openPanel(b.dataset.t); });
    if (V2[kind]) V2[kind](P);
    if (kind === 'shop') { const g = P.querySelector('#k-shop'); for (const k in PRICES) { const [pr, lab] = PRICES[k], el = document.createElement('div'); el.className = 'item'; el.appendChild(iconCanvas(k, 44)); const t = document.createElement('div'); t.innerHTML = `<b>${lab}</b>${pr} ryō · tu en as ${S.inv[k] || 0}`; el.appendChild(t);
        const b = document.createElement('button'); b.className = 'kbtn'; b.textContent = 'Acheter'; b.disabled = S.ryo < pr; b.onclick = () => { if (S.ryo < pr) return; S.ryo -= pr; S.inv[k] = (S.inv[k] || 0) + (k === 'kunai' ? 5 : 1); sfx('coin'); openPanel('shop'); refresh(); }; if (k === 'kunai') t.innerHTML = `<b>Kunai ×5</b>${pr * 5} ryō · tu en as ${S.inv.kunai || 0}`;
        if (k === 'kunai') { b.disabled = S.ryo < pr * 5; b.onclick = () => { if (S.ryo < pr * 5) return; S.ryo -= pr * 5; S.inv.kunai += 5; sfx('coin'); openPanel('shop'); refresh(); }; } el.appendChild(b); g.appendChild(el); } }
    if (kind === 'shop') { const g = P.querySelector('#k-shop'); for (const [w, pr0] of WSHOP) { const pr = pr0 + S.lvl * 10, el = document.createElement('div'); el.className = 'item'; el.appendChild(iconCanvas(WT[w].ic, 44)); const t = document.createElement('div');
        t.innerHTML = `<b>${WT[w].n} du village</b>${pr} ryō · arme · ${(window.KTOUCH && KTOUCH.enabled) ? 'glisse le doigt pour trancher' : 'touche J pour frapper'}`; el.appendChild(t);
        const b = document.createElement('button'); b.className = 'kbtn'; b.textContent = 'Acheter et équiper'; b.disabled = S.ryo < pr; b.onclick = () => { if (S.ryo < pr) return; S.ryo -= pr; const it = { id: Math.random().toString(36).slice(2, 9), slot: 'weapon', w, r: 0, lvl: S.lvl, st: { atk: Math.round(3 * (1 + S.lvl * .35) * WT[w].dmg) }, name: WT[w].n + ' du village' };
          if (S.eq.weapon) { if (S.bag.length < 30) S.bag.push(S.eq.weapon); else S.ryo += itemValue(S.eq.weapon); } S.eq.weapon = it; sfx('coin2'); openPanel('shop'); refresh(); weaponHint(true); }; el.appendChild(b); g.appendChild(el); } }
    if (kind === 'shop' && P.querySelector('#k-sellh')) P.querySelector('#k-sellh').onclick = () => { S.ryo += S.herbs * 6; S.herbs = 0; sfx('coin'); openPanel('shop'); refresh(); };
    if (kind === 'map') { P.classList.add('mapP'); const tw = P.querySelector('#k-towrld'); if (tw) tap(tw, () => { closePanel(); KREG.open(); }); drawBigMap(P.querySelector('#k-bigmap')); mapView(P.querySelector('#k-mapview')); } else P.classList.remove('mapP');
    if (kind === 'opts') P.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const o = b.dataset.o;
      if (o === 'resume') closePanel(); if (o === 'save') { save(); toastMini('Partie sauvegardée'); } if (o === 'quality' && window.KMAP) { const order = ['high', 'auto', 'perf'], q = order[(order.indexOf(KMAP.quality()) + 1) % 3]; KMAP.setQuality(q); openPanel('opts'); }
      if (o === 'adchoices') adsReady().then(() => nads('consentForm'));
      if (o === 'sound') { S.sound = !S.sound; window.KAMB && KAMB.setMuted(!S.sound); openPanel('opts'); }
      if (o === 'tuto') { closePanel(); S.tutoDone = false; save(); setTimeout(tuStart, 300); }
      if (o === 'look') { closePanel(); showCreator(true); } if (o === 'reset') { if (confirm('Effacer ta progression et recommencer ?')) { store.set('kunai-save', null); location.reload(); } } });
  }
  function closePanel() { panel = null; $('#k-panel').hidden = true; $('#k-dim').hidden = true; if (window.KTOUCH) KTOUCH.show(true); }
  function drawBigMap(c) { const m = A.mapArt, W = 1000, H = Math.round(W * m.height / m.width), RS = 2; c.width = W * RS; c.height = H * RS; c.style.width = W + 'px'; c.style.height = H + 'px'; const q = c.getContext('2d'), k = W / (m.width / A.mapPPM); q.setTransform(RS, 0, 0, RS, 0, 0); q.imageSmoothingQuality = 'high'; q.drawImage(m, 0, 0, W, H);
    const P = (x, y) => [(x - A.L.x0) * k, (y - A.L.y0) * k];
    const label = (txt, x, y, big) => { q.font = (big ? '400 21px' : '700 14px') + (big ? ' "Potta One",sans-serif' : ' "M PLUS Rounded 1c",sans-serif'); q.textAlign = 'center'; q.lineJoin = 'round'; q.lineWidth = big ? 6 : 4.5; q.strokeStyle = 'rgba(247,241,222,.95)'; q.strokeText(txt, x, y); q.fillStyle = big ? '#7a2a18' : '#2a2230'; q.fillText(txt, x, y); };
    if (!A.region) for (const [lab, x, y] of [['Porte d’Aozora', 0, 140], ['Résidence du Gardien', 0, -46], ['Académie', -61, -48], ['Temple', 38, 18], ['Arène', -121, -2], ['Forêt aux loups', -100, 150], ['Camp des bandits', -128, -88], ['Falaise des Gardiens', 0, -103]]) { const [px, py] = P(x, y); label(lab, px, py, true); }
    for (const n of NPCS) { const [x, y] = P(n.x, n.y), mk = marker(n); q.fillStyle = mk ? '#e0b04a' : '#f7f1de'; q.strokeStyle = '#2a2230'; q.lineWidth = 2.5; q.beginPath(); q.arc(x, y, mk ? 9 : 6, 0, TAU); q.fill(); q.stroke();
      if (mk) { q.fillStyle = '#7a2a18'; q.font = '400 13px "Potta One",sans-serif'; q.textAlign = 'center'; q.fillText(mk, x, y + 5); } q.textAlign = 'left'; q.font = '800 13px "M PLUS Rounded 1c",sans-serif'; q.lineWidth = 4; q.strokeStyle = 'rgba(247,241,222,.95)'; q.strokeText(n.name, x + 12, y + 5); q.fillStyle = '#2a2230'; q.fillText(n.name, x + 12, y + 5); }
    if (wpHere() && !GPS.path) gpsRoute(true); drawRoute(q, k, A.L, 8); c._k = k;
    const [hx, hy] = P(A.hero.x, A.hero.y); q.fillStyle = '#e2483a'; q.strokeStyle = '#fff'; q.lineWidth = 3; q.beginPath(); q.arc(hx, hy, 9, 0, TAU); q.fill(); q.stroke(); q.strokeStyle = '#2a2230'; q.lineWidth = 1.5; q.beginPath(); q.arc(hx, hy, 11, 0, TAU); q.stroke(); q.textAlign = 'start'; c._me = [hx, hy]; }
  // the big map: fits the screen, then drag to pan, pinch / wheel / buttons to zoom (phones and desktop alike)
  function mapView(v) { const c = v.querySelector('canvas'), W = parseFloat(c.style.width), H = parseFloat(c.style.height); let z = 1, x = 0, y = 0, fit = 1; const pts = new Map(); let pinch = null;
    const clamp = () => { const vw = v.clientWidth, vh = v.clientHeight, sw = W * z, sh = H * z; x = sw <= vw ? (vw - sw) / 2 : Math.min(0, Math.max(vw - sw, x)); y = sh <= vh ? (vh - sh) / 2 : Math.min(0, Math.max(vh - sh, y)); c.style.transform = `translate(${x}px,${y}px) scale(${z})`; };
    const zoomAt = (nz, px, py) => { nz = Math.max(fit, Math.min(fit * 6, nz)); x = px - (px - x) * nz / z; y = py - (py - y) * nz / z; z = nz; clamp(); };
    const doFit = () => { fit = Math.min(v.clientWidth / W, v.clientHeight / H); z = fit; clamp(); };
    const center = (zz) => { const [mx, my] = c._me || [W / 2, H / 2]; z = Math.max(fit, zz || z); x = v.clientWidth / 2 - mx * z; y = v.clientHeight / 2 - my * z; clamp(); };
    requestAnimationFrame(doFit); new ResizeObserver(() => { const was = z <= fit * 1.001; fit = Math.min(v.clientWidth / W, v.clientHeight / H); if (was) z = fit; clamp(); }).observe(v);
    const rel = e => { const r = v.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    let down = null; const sync = () => { v.classList.toggle('haswp', !!wpHere()); };
    v.addEventListener('pointerdown', e => { if (e.target.closest('.mz')) return; v.setPointerCapture(e.pointerId); pts.set(e.pointerId, rel(e)); pinch = null; down = pts.size === 1 ? { p: rel(e), moved: false } : null; });
    v.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; const p = rel(e), o = pts.get(e.pointerId); pts.set(e.pointerId, p);
      if (down && Math.hypot(p[0] - down.p[0], p[1] - down.p[1]) > 8) down.moved = true;
      if (pts.size === 1) { x += p[0] - o[0]; y += p[1] - o[1]; clamp(); return; }
      const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      if (pinch) { x += mx - pinch.mx; y += my - pinch.my; zoomAt(z * d / pinch.d, mx, my); } pinch = { d, mx, my }; });
    const up = e => { const was = pts.has(e.pointerId); pts.delete(e.pointerId); pinch = null; if (!was || !down || down.moved || pts.size || e.type !== 'pointerup') { if (!pts.size) down = null; return; }
      const [px, py] = rel(e), mx = (px - x) / z, my = (py - y) / z, k = c._k, wx = mx / k + A.L.x0, wy = my / k + A.L.y0, wp = wpHere(); down = null;
      if (wp && Math.hypot(((wp.x - A.L.x0) * k - mx) * z, ((wp.y - A.L.y0) * k - my) * z + 14) < 26) { S.wp = null; GPS.path = null; sfx('ui'); }
      else { S.wp = { r: regId(), x: wx, y: wy }; gpsRoute(true); if (!GPS.path) { S.wp = null; toastMini('Impossible d’aller là'); } else { const e2 = GPS.path[GPS.path.length - 1]; S.wp.x = e2[0]; S.wp.y = e2[1]; GPS.key = S.wp.x + ',' + S.wp.y; sfx('quest'); } }
      save(); drawBigMap(c); sync(); }; v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
    v.addEventListener('wheel', e => { e.preventDefault(); const [px, py] = rel(e); zoomAt(z * Math.exp(-e.deltaY * .0015), px, py); }, { passive: false });
    v.addEventListener('dblclick', e => { const [px, py] = rel(e); zoomAt(z * 2, px, py); });
    v.querySelectorAll('.mz button').forEach(b => tap(b, () => { const k = b.dataset.z, cx = v.clientWidth / 2, cy = v.clientHeight / 2; if (k === 'in') zoomAt(z * 1.6, cx, cy); else if (k === 'out') zoomAt(z / 1.6, cx, cy); else if (k === 'fit') doFit(); else if (k === 'clr') { S.wp = null; GPS.path = null; save(); drawBigMap(c); sync(); } else center(fit * 2.5); })); sync(); }

  /* ================= GPS: a waypoint set on the big map, and the road to it ================= */
  const GPS = { path: null, key: '', t: 0, fail: false };
  const regId = () => A.region ? A.region.id : 'konoha', wpHere = () => S.wp && S.wp.r === regId() ? S.wp : null;
  // A* on the 1 m grid of the map, cells tested lazily with the engine's own collision
  function findPath(sx, sy, tx, ty) { const L = A.L, W = L.w, Hh = L.h, x0 = L.x0, y0 = L.y0, N = W * Hh, cell = new Int8Array(N);
    const ok = (i, j) => { if (i < 1 || j < 1 || i >= W - 1 || j >= Hh - 1) return false; const k = j * W + i; if (!cell[k]) cell[k] = A.blocked(x0 + i + .5, y0 + j + .5) ? 2 : 1; return cell[k] === 1; };
    const near = (x, y) => { const i0 = Math.floor(x - x0), j0 = Math.floor(y - y0); for (let r = 0; r <= 8; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) if (Math.max(Math.abs(a), Math.abs(b)) === r && ok(i0 + a, j0 + b)) return [i0 + a, j0 + b]; return null; };
    const s0 = near(sx, sy), t0 = near(tx, ty); if (!s0 || !t0) return null; const si = s0[1] * W + s0[0], ti = t0[1] * W + t0[0];
    const g = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N), hk = [], hv = [];
    const hEst = k => { const dx = Math.abs(k % W - t0[0]), dy = Math.abs(((k / W) | 0) - t0[1]); return Math.max(dx, dy) + .414 * Math.min(dx, dy); };
    const push = (k, f) => { let i = hk.length; hk.push(k); hv.push(f); while (i) { const p = (i - 1) >> 1; if (hv[p] <= f) break; hk[i] = hk[p]; hv[i] = hv[p]; i = p; } hk[i] = k; hv[i] = f; };
    const pop = () => { const top = hk[0], lk = hk.pop(), lv = hv.pop(); if (hk.length) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= hk.length) break; if (c + 1 < hk.length && hv[c + 1] < hv[c]) c++; if (hv[c] >= lv) break; hk[i] = hk[c]; hv[i] = hv[c]; i = c; } hk[i] = lk; hv[i] = lv; } return top; };
    g[si] = 0; push(si, hEst(si)); let n = 0, found = false;
    while (hk.length && n++ < 90000) { const k = pop(); if (shut[k]) continue; shut[k] = 1; if (k === ti) { found = true; break; } const i = k % W, j = (k / W) | 0;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { if (!a && !b) continue; const ni = i + a, nj = j + b; if (!ok(ni, nj)) continue; if (a && b && (!ok(i + a, j) || !ok(i, j + b))) continue;
        const nk = nj * W + ni, ng = g[k] + (a && b ? 1.414 : 1); if (ng < g[nk]) { g[nk] = ng; from[nk] = k; push(nk, ng + hEst(nk)); } } }
    if (!found) return null; const raw = []; for (let k = ti; k !== -1; k = from[k]) raw.push(k); raw.reverse();
    // string pulling: keep a point only when the straight line from the last kept one is no longer clear
    const pt = k => [x0 + k % W + .5, y0 + ((k / W) | 0) + .5], fr = (x, y) => ok(Math.floor(x - x0), Math.floor(y - y0));
    const clear = (a, b) => { const [ax, ay] = pt(a), [bx, by] = pt(b), d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d * 2); for (let q = 1; q < n; q++) { const x = ax + (bx - ax) * q / n, y = ay + (by - ay) * q / n; if (!fr(x, y) || !fr(x + .4, y) || !fr(x - .4, y) || !fr(x, y + .4) || !fr(x, y - .4)) return false; } return true; };
    const out = [pt(raw[0])]; let a = 0; for (let q = 2; q < raw.length; q++) if (!clear(raw[a], raw[q])) { a = q - 1; out.push(pt(raw[a])); } out.push(pt(raw[raw.length - 1])); return out; }
  function gpsRoute(force) { const wp = wpHere(), h = H(); if (!wp) { GPS.path = null; return; } const key = wp.x + ',' + wp.y, now = performance.now() / 1000;
    if (!force && GPS.path && GPS.key === key) { // follow the hero: drop what is behind, re-plan when off the road
      const P = GPS.path; let best = 0, bd = 1e9; for (let i = 0; i < Math.min(P.length - 1, 30); i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((h.x - ax) * dx + (h.y - ay) * dy) / L2)), d = Math.hypot(ax + dx * u - h.x, ay + dy * u - h.y); if (d < bd) { bd = d; best = i; } }
      if (best > 0) P.splice(0, best); P[0] = [h.x, h.y]; if (bd < 8 || now - GPS.t < 3) return; }
    if (!force && GPS.fail && GPS.key === key && now - GPS.t < 3) return;
    GPS.t = now; GPS.key = key; const P = findPath(h.x, h.y, wp.x, wp.y); GPS.fail = !P; GPS.path = P ? (P[0] = [h.x, h.y], P) : null; }
  function gpsTick() { const wp = wpHere(), h = H(), el = gpsEl(); if (!wp || !started || panel || h.dead) { el.hidden = true; return; }
    const d = Math.hypot(wp.x - h.x, wp.y - h.y); if (d < 3.5) { S.wp = null; GPS.path = null; el.hidden = true; toast('Destination atteinte', 'Le repère est retiré de ta carte'); sfx('quest'); save(); return; }
    gpsRoute(false); const P = GPS.path, nx = P && P[1] ? P[1] : [wp.x, wp.y], a = A.toS(h.x, h.y), b = A.toS(nx[0], nx[1]); let len = 0; if (P) for (let i = 0; i < P.length - 1; i++) len += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); else len = d;
    el.hidden = false; el.querySelector('i').style.transform = `rotate(${Math.atan2(b[1] - a[1], b[0] - a[0])}rad)`; el.querySelector('b').textContent = Math.round(len) + ' m'; }
  let gpsDom = null; function gpsEl() { if (!gpsDom) { gpsDom = document.createElement('div'); gpsDom.id = 'k-gps'; gpsDom.hidden = true; gpsDom.innerHTML = '<i>➤</i><b></b><button aria-label="Retirer la destination">✕</button>'; document.body.appendChild(gpsDom); tap(gpsDom.querySelector('button'), () => { S.wp = null; GPS.path = null; gpsDom.hidden = true; save(); }); } return gpsDom; }
  // in the world: glowing chevrons on the ground ahead of the hero, a light pillar on the destination
  function drawGps(g, t) { const wp = wpHere(); if (!wp || !started) return; const P = GPS.path;
    if (P) { let walked = 0, next = 2.6 + (t * 2.4) % 2.6, shown = 0; for (let i = 0; i < P.length - 1 && shown < 14; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], sl = Math.hypot(bx - ax, by - ay) || 1e-3;
        while (next <= walked + sl && shown < 14) { const u = (next - walked) / sl, x = ax + (bx - ax) * u, y = ay + (by - ay) * u, p = A.toS(x, y), q = A.toS(x + (bx - ax) / sl * .3, y + (by - ay) / sl * .3), an = Math.atan2(q[1] - p[1], q[0] - p[0]);
          g.save(); g.globalAlpha = Math.min(1, (14 - shown) / 5) * .9; g.translate(p[0], p[1]); g.rotate(an); g.scale(1.5, 1.5); g.beginPath(); g.moveTo(-7, -9); g.lineTo(5, 0); g.lineTo(-7, 9); g.lineTo(-3, 0); g.closePath(); g.fillStyle = '#c47bff'; g.strokeStyle = '#2a1340'; g.lineWidth = 2.5; g.stroke(); g.fill(); g.restore(); next += 2.6; shown++; }
        walked += sl; } }
    const p = A.toS(wp.x, wp.y), pu = .75 + Math.sin(t * 3) * .25; g.save(); const gr = g.createLinearGradient(0, p[1] - 260, 0, p[1]); gr.addColorStop(0, 'rgba(196,123,255,0)'); gr.addColorStop(1, 'rgba(196,123,255,' + (.55 * pu) + ')'); g.fillStyle = gr; g.fillRect(p[0] - 9, p[1] - 260, 18, 260);
    g.beginPath(); g.ellipse(p[0], p[1], 22 * pu + 8, (22 * pu + 8) * .45, 0, 0, TAU); g.strokeStyle = 'rgba(196,123,255,.9)'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(p[0], p[1] - 34); g.lineTo(p[0] + 9, p[1] - 22); g.lineTo(p[0], p[1] - 10); g.lineTo(p[0] - 9, p[1] - 22); g.closePath(); g.fillStyle = '#c47bff'; g.strokeStyle = '#2a1340'; g.lineWidth = 2.5; g.stroke(); g.fill(); g.restore(); }
  // the road on a map canvas (minimap or big map)
  function drawRoute(q, k, L, lw) { const wp = wpHere(); if (!wp) return; const P = GPS.path, X = x => (x - L.x0) * k, Y = y => (y - L.y0) * k; q.save(); q.lineJoin = q.lineCap = 'round';
    if (P) { for (const [w, c] of [[lw + 3, '#2a1340'], [lw, '#c47bff']]) { q.lineWidth = w; q.strokeStyle = c; q.beginPath(); P.forEach(([x, y], i) => i ? q.lineTo(X(x), Y(y)) : q.moveTo(X(x), Y(y))); q.stroke(); } }
    const x = X(wp.x), y = Y(wp.y), r = lw * 1.8 + 2; q.fillStyle = '#c47bff'; q.strokeStyle = '#2a1340'; q.lineWidth = 2; q.beginPath(); q.moveTo(x, y); q.bezierCurveTo(x - r * 1.4, y - r * 1.4, x - r, y - r * 2.6, x, y - r * 2.6); q.bezierCurveTo(x + r, y - r * 2.6, x + r * 1.4, y - r * 1.4, x, y); q.fill(); q.stroke(); q.fillStyle = '#fff'; q.beginPath(); q.arc(x, y - r * 1.75, r * .4, 0, TAU); q.fill(); q.restore(); }
  /* ================= HUD ================= */
  const slotEls = {};
  function buildBar() { const bar = $('#k-bar'); bar.innerHTML = ROD();
    const mk = (id, icon, key, cls) => { const b = document.createElement('button'); b.className = 'slot ' + (cls || ''); b.title = id; if (icon) b.appendChild(iconCanvas(icon, 56)); b.insertAdjacentHTML('beforeend', `<span class="key">${key}</span><span class="cnt"></span><i class="cd"></i>`);
      b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); A.unlockAudio && A.unlockAudio(); if (id === 'jump') A.jump(); else if (id === 'sprint') { A.toggleSprint(); b.classList.toggle('on', A.sprintOn()); } else if (SK[id]) useSkill(id); else useItem(id); }); bar.appendChild(b); slotEls[id] = b; return b; };
    for (const id in SK) mk(id, SK[id].icon, SK[id].key.toUpperCase(), id !== 'fist' && id !== 'kunai' ? 'tech' : ''); bar.insertAdjacentHTML('beforeend', '<i class="sep"></i>');
    for (const id in ITEMUSE) mk(id, id, ITEMUSE[id].key); bar.insertAdjacentHTML('beforeend', '<i class="sep"></i>');
    const sp = mk('sprint', null, '⇧', 'sprintS'); sp.insertAdjacentHTML('afterbegin', '<span style="position:absolute;inset:0;display:grid;place-items:center">疾</span>');
    const j = mk('jump', null, '␣', 'jumpS'); j.insertAdjacentHTML('afterbegin', '<span style="position:absolute;inset:0;display:grid;place-items:center">跳</span>'); }
  // touch screens: techniques are drawn in the pad (seals.js); a straight line is the flash step, along the stroke
  function sealPad() { if (!window.KSEAL || !document.body.classList.contains('touch')) return;
    KSEAL.makePad({ active: () => started && !panel && !dlg && !creatorOpen && !H().dead, visible: () => started && !panel && !creatorOpen && !(A.hero && A.hero.dead > 0),
      skills: () => Object.keys(KSEAL.GLYPH).filter(id => SK[id] && !(SK[id].lock && SK[id].lock())).map(id => { const cdMax = SK[id].cd * (1 - (S.rk[id] - 1) * .08); return { id, ready: !(cds[id] > 0) && S.ck >= SK[id].ck, cd: cds[id] > 0 ? Math.min(1, cds[id] / cdMax) : 0 }; }),
      icon: id => iconCanvas(SK[id].icon, 28), fail: m => m && toastMini(m),
      cast: (id, dir) => { const k = SK[id]; if (k.lock && k.lock()) { toastMini('🔒 ' + k.hint); return false; } let yaw = null;
        if (dir) { const h = H(), o = A.toS(h.x, h.y), ex = A.toS(h.x + 1, h.y), ey = A.toS(h.x, h.y + 1), a = ex[0] - o[0], b = ey[0] - o[0], c = ex[1] - o[1], d = ey[1] - o[1], det = a * d - b * c;
          if (Math.abs(det) > 1e-6) { const wx = (d * dir[0] - b * dir[1]) / det, wy = (-c * dir[0] + a * dir[1]) / det; yaw = Math.atan2(wx, wy) * 180 / Math.PI; } }
        return !!useSkill(id, yaw); } }); }
  function refresh() { if (!A) return; $('#k-name').textContent = S.name; $('#k-lvl').textContent = S.rank; $('#k-lvs').textContent = S.lvl; $('#k-ryo').textContent = S.ryo; const tre = $('#k-track .in');
    const bar = (id, v, m, txt) => { const e = $(id); e.querySelector('i').style.width = clamp(v / m, 0, 1) * 100 + '%'; const b = e.querySelector('b'); if (b) b.textContent = txt; };
    bar('#k-hp', S.hp, maxHp(), Math.ceil(S.hp) + ' / ' + maxHp()); bar('#k-ck', S.ck, maxCk(), Math.floor(S.ck) + ' / ' + maxCk()); bar('#k-xp', S.xp, xpNeed());
    for (const id in SK) { const el = slotEls[id]; if (!el) continue; el.classList.toggle('locked', !!(SK[id].lock && SK[id].lock())); el.querySelector('.cnt').textContent = SK[id].item ? S.inv[SK[id].item] || 0 : ''; }
    for (const id in ITEMUSE) { const el = slotEls[id]; if (el) { el.querySelector('.cnt').textContent = S.inv[id] || 0; el.style.opacity = S.inv[id] ? 1 : .5; } }
    // mission tracker
    const act = Object.keys(Q).filter(id => S.q[id] === 'active').sort((a, b) => (b === S.trackQ) - (a === S.trackQ)), tr = $('#k-track'), box = tr.querySelector('.in'); let html;
    if (objective) html = '<h4>' + objective[0] + '</h4><p>' + objective[1] + '</p>';
    else if (!act.length) { html = S.done ? '<h4>Chûnin d’Aozora</h4><p>Toutes les missions sont accomplies. Explore et entraîne-toi librement !</p>' : '<h4>Missions</h4><p>Cherche les <b style="color:#b8322a">!</b> dorés au-dessus des villageois.</p>'; }
    else html = act.slice(0, 1).map(id => { const q = Q[id], st = qStep(id), s = q.steps[Math.min(st, q.steps.length - 1)]; return `<h4>${q.title}</h4><p>${st >= q.steps.length ? 'Retourne voir ' + (NPCS.find(n => n.id === q.giver) || {}).name : s.txt + (s.n ? ' — ' + Math.min(s.n, s.cnt()) + '/' + s.n : '')}</p>`; }).join('');
      if (!objective && S.contracts.length) html += S.contracts.slice(0, 2).map(c => `<p style="margin-top:6px"><b style="color:#2a6ac0">◆</b> ${c.t} — ${c.p}/${c.n}</p>`).join('');
    if (box.dataset.h !== html) { box.dataset.h = html; box.innerHTML = html; }
  }
  let toastT = 0; function toast(h, p) { const t = $('#k-toast'); t.querySelector('h3').textContent = h; t.querySelector('p').textContent = p || ''; t.classList.add('on'); toastT = 3.6; }
  function toastMini(p) { addText(A.hero.x, A.hero.y, p, '#fff4dc', 1.1); }

  /* ================= combat ================= */
  const H = () => A.hero;
  const ACT = { attack: { d: .42, hit: .2 }, kick: { d: .5, hit: .28 }, throw: { d: .4, hit: .22 }, seal: { d: .5 }, dash: { d: .4 }, cast: { d: .45, hit: .15 }, hurt: { d: .35 }, subst: { d: .01 } };
  function useSkill(id, yawTo) { if (tu && tu.step === 'fist' && id === 'fist' && !tu.hit) tu.hit = 1; const k = SK[id], h = H(); if (!started || dlg || panel || h.dead) return; if (k.lock && k.lock()) { toastMini('🔒 ' + k.hint); return; } if ((cds[id] || 0) > 0) return; if (h.act && h.act !== 'hurt') return;
    if (S.ck < k.ck) { toastMini('Pas assez de chakra'); return; } if (k.item && !(S.inv[k.item] > 0)) { toastMini('Plus de kunai'); return; }
    S.ck -= k.ck; if (k.item) S.inv[k.item]--; cds[id] = k.cd * (1 - (S.rk[id] - 1) * .08); if (yawTo != null) h.yaw = yawTo; else faceTarget(); if (window.KSEAL && KSEAL.SEQ[id]) KSEAL.play(id, k.name);
    if (id === 'dash') { const r = h.yaw * Math.PI / 180; fx('leafSwirl', h.x, h.y, .5, .9); sfx('throw'); h.inv = .3; for (let d = 7; d > 0; d -= .5) { const nx = h.x + Math.sin(r) * d, ny = h.y + Math.cos(r) * d; if (!A.blocked(nx, ny)) { h.x = nx; h.y = ny; break; } } fx('leafSwirl', h.x, h.y, .5, .9); refresh(); return true; }
    if (id === 'subst') { const r = h.yaw * Math.PI / 180; fx('smoke', h.x, h.y, .6, 1.1); sfx('smoke'); h.inv = .7; for (let d = 5; d > 0; d -= .5) { const nx = h.x - Math.sin(r) * d, ny = h.y - Math.cos(r) * d; if (!A.blocked(nx, ny)) { h.x = nx; h.y = ny; break; } } fxs.push({ k: 'log', x: h.x + Math.sin(r) * 3, y: h.y + Math.cos(r) * 3, t: 0, d: 1.2 }); refresh(); return true; }
    h.combo = id === 'fist' ? ((h.lastHitT || 0) > 0 ? (h.combo || 0) + 1 : 0) : 0; h.act = id === 'fist' && h.combo % 3 === 2 ? 'kick' : k.act; h.actT = 0; h.didHit = false; h.skill = id; h.lastHitT = .9;
    if (h.act === 'attack' || h.act === 'kick') sfx('swing'); if (h.act === 'throw') sfx('throw'); refresh(); return true; }
  function useItem(id) { if (!started || H().dead) return; const it = ITEMUSE[id]; if (!it || !(S.inv[id] > 0)) return; S.inv[id]--; it.use(); sfx('coin2'); refresh(); }
  function fx(k, x, y, d, s, z) { fxs.push({ k, x, y, t: 0, d: d || .5, s: s || 1, z: z || .5 }); }
  function addText(x, y, s, c, sz) { texts.push({ x: x + (rnd() - .5) * .6, y, s, c, t: 0, sz: sz || 1 }); }
  const rkOf = id => S.rk[id === 'kick' ? 'fist' : id] || 1;
  const dmgOf = id => Math.round(({ fist: 9 + S.lvl * 3, kick: 14 + S.lvl * 4, kunai: 13 + S.lvl * 2, fire: 34 + S.lvl * 6, sphere: 60 + S.lvl * 9, chidori: 72 + S.lvl * 11, water: 40 + S.lvl * 7, wind: 34 + S.lvl * 7, clone: 26 + S.lvl * 5 })[id] * (1 + gear().atk / 100) * (1 + (rkOf(id) - 1) * .2));
  function hitEnemy(e, dmg, fromX, fromY, kb) { if (e.dead) return; const crit = rnd() < .12 + gear().crit / 100; if (crit) dmg = Math.round(dmg * 1.7);
    if (e.pvp) dmg = Math.max(1, Math.round(dmg * .25));
    if (e.remote) { e.hp = Math.max(1, e.hp - dmg); if (EXT.net) EXT.net.send(e.pvp ? { t: 'pvp', to: e.peer.id, dmg, x: +fromX.toFixed(2), y: +fromY.toFixed(2) } : { t: 'hit', nid: e.nid, dmg, x: +fromX.toFixed(2), y: +fromY.toFixed(2), kb: kb || 1.4 }); }
    else { e.hp -= dmg; if (EXT.net && EXT.net.role === 'host') (e.contrib || (e.contrib = new Set())).add(EXT.net.id); }
    combo.n++; combo.t = 2.4; if (combo.n > S.st.maxCombo) { S.st.maxCombo = combo.n; } progress('combo', combo.n, true); showCombo(); hitstop = crit ? .09 : .045; if (!target || target.dead) target = e; e.hurtT = e.T.boss ? .15 : .32; e.state = 'chase'; e.show = 4;
    if (!e.remote) { const d = Math.hypot(e.x - fromX, e.y - fromY) || 1, k = (kb || 1.4) * (e.T.boss ? .3 : 1); A.move(e, (e.x - fromX) / d * k, (e.y - fromY) / d * k); }
    addText(e.x, e.y, (crit ? '✦' : '') + dmg, crit ? '#ffd23a' : '#fff', crit ? 1.35 : 1.1); fx('hit', e.x, e.y, .3, 1.2, .6); sfx('hit'); A.punch(.06, .12);
    if (!e.remote && e.hp <= 0) netKill(e); }
  // the host decides a death: every player who hit the enemy gets the XP, the quest progress and his own loot
  function netKill(e) { if (EXT.net && EXT.net.role === 'host' && !e.saga) { const c = e.contrib ? [...e.contrib] : []; EXT.net.send({ t: 'kill', nid: e.nid, c }); kill(e, !c.includes(EXT.net.id)); } else kill(e); }
  function kill(e, noReward) { e.dead = e.T.boss ? 150 : 32; e.hp = 0; fx('smoke', e.x, e.y, .7, 1.4); sfx('smoke'); if (noReward) { if (target === e) target = null; if (e.once) e.dead = 1e9; return; } gainXp(Math.round(e.xp * (1 + Math.min(.5, combo.n * .02)))); if (target === e) target = null;
    if (e.elite) { S.st.elites++; progress('elite'); } progress(((e.T && e.T.base) || e.type) === 'wolf' ? 'hunt' : ((e.T && e.T.base) || e.type) === 'bandit' ? 'bandit' : 'boss');
    const gch = e.T.boss ? 1 : e.elite ? .75 : ((e.T && e.T.base) || e.type) === 'bandit' ? .2 : .1; if (rnd() < gch) drops.push({ x: e.x + (rnd() - .5), y: e.y + (rnd() - .5), ryo: 0, t: 0, gear: genItem(e.lvl, e.T.boss ? 2 : e.elite ? 1 : 0) }); const ry = Math.round(e.T.ryo[0] + rnd() * (e.T.ryo[1] - e.T.ryo[0]));
    drops.push({ x: e.x, y: e.y, ryo: ry, t: 0, item: rnd() < (e.T.boss ? 1 : .18) ? (rnd() < .5 ? 'pillHp' : 'kunai') : null });
    S.kills[e.type] = (S.kills[e.type] || 0) + 1; if (e.once) e.dead = 1e9; for (const h of EXT.hooks.kill) h(e); checkAch(); if (((e.T && e.T.base) || e.type) === 'wolf' && S.q.q2 === 'active') S.qp.wolves = (S.qp.wolves || 0) + 1; if (((e.T && e.T.base) || e.type) === 'bandit' && S.q.q5 === 'active') S.qp.bandits = (S.qp.bandits || 0) + 1; if (e.type === 'boss' && S.q.q5 === 'active') S.qp.boss = true; refresh(); }
  /* ================= shared enemies (net.js): in each region one player (the host) runs them, the others mirror his snapshots ================= */
  const aim = (e, h) => { let b = h.dead ? null : { x: h.x, y: h.y, z: h.z || 0, peer: null }, bd = b ? Math.hypot(h.x - e.x, h.y - e.y) : 1e9;
    if (EXT.net && EXT.net.role === 'host' && !e.saga) for (const p of EXT.peers) { if (p.dead) continue; const d = Math.hypot(p.x - e.x, p.y - e.y); if (d < bd) { bd = d; b = { x: p.x, y: p.y, z: p.z || 0, peer: p }; } }
    return b || { x: h.x, y: h.y, z: h.z || 0, peer: null }; };
  const hurtTg = (tg, dmg, x, y) => { if (tg.peer) { if (EXT.net) EXT.net.send({ t: 'dmg', to: tg.peer.id, dmg, x: +x.toFixed(2), y: +y.toFixed(2) }); } else hurtHero(dmg, x, y); };
  const netShot = s => { if (EXT.net && EXT.net.role === 'host') EXT.net.send({ t: 'shot', k: s.k, x: +s.x.toFixed(2), y: +s.y.toFixed(2), vx: +s.vx.toFixed(2), vy: +s.vy.toFixed(2), life: s.life, dmg: s.dmg, r: s.r || 0 }); };
  let pvpOn = false; const pvpE = new Map();
  function syncPvp() { const want = new Set();
    if (pvpOn && EXT.net) for (const p of EXT.peers) if (p.pvp && !p.dead) { want.add(p.id); let e = pvpE.get(p.id);
      if (!e) { e = { nid: 'p' + p.id, pvp: true, remote: true, peer: p, type: 'player', T: { name: p.name, lvl: p.lvl || 1, xp: 0, ryo: [0, 0], range: 1.9, aggro: 0 }, x: p.x, y: p.y, home: [p.x, p.y], wander: [p.x, p.y], hp: 1e9, max: 1e9, lvl: p.lvl || 1, xpv: 0, yaw: 0, t: 0, anim: 'idle', state: 'idle', hurtT: 0, show: 0, dead: 0, cd: 0, cd2: 0 }; pvpE.set(p.id, e); enemies.push(e); }
      e.peer = p; e.tx = e.x = p.x; e.ty = e.y = p.y; e.hp = Math.max(1, p.hpp || 100); e.max = 100; e.lvl = p.lvl || 1; }
    for (const [id, e] of pvpE) if (!want.has(id)) { pvpE.delete(id); const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1); if (target === e) target = null; } }
  const NETAPI = {
    snap: () => { const o = []; for (const e of enemies) if (!e.saga && !e.remote && e.dead < 1e8) o.push([e.nid, e.type, +e.x.toFixed(2), +e.y.toFixed(2), e.yaw | 0, e.anim || 'idle', Math.max(0, Math.round(e.hp)), e.max, e.lvl, e.elite ? 1 : 0, e.dead ? 1 : 0, e.state === 'chase' ? 1 : 0, +e.home[0].toFixed(1), +e.home[1].toFixed(1)]); return o; },
    apply: L => { if (!Array.isArray(L)) return; const seen = new Set();
      for (const a of L) { if (!Array.isArray(a)) continue; const [nid, type, x, y, yaw, anim, hp, max, lvl, el, dead, ch, hx, hy] = a; if (!ETYPE[type]) continue; seen.add(nid); let e = enemies.find(q => q.remote && q.nid === nid);
        if (!e) { e = spawn(type, x, y); e.nid = nid; e.remote = true; }
        e.tx = x; e.ty = y; e.yaw = yaw; e.netAnim = anim; e.max = max; e.hp = e.hurtT > 0 ? Math.min(e.hp, hp) : hp; e.home = [hx, hy];
        if (e.lvl !== lvl || e.elite !== !!el) { const T = e.T, dl = Math.max(0, lvl - T.lvl - (el ? 1 : 0)); e.lvl = lvl; e.elite = !!el; e.xp = Math.round(T.xp * (1 + .3 * dl) * (el ? 3 : 1)); e.dmg = Math.round(T.dmg * (1 + .16 * dl) * (el ? 1.45 : 1)); }
        e.state = ch ? 'chase' : 'idle'; if (dead && !e.dead) e.dead = 1; else if (!dead && e.dead) { e.dead = 0; e.x = x; e.y = y; } }
      for (let i = enemies.length - 1; i >= 0; i--) { const e = enemies[i]; if (e.remote && !e.pvp && !seen.has(e.nid)) { if (target === e) target = null; enemies.splice(i, 1); } } },
    // guest: the local enemies go (the host's replace them); host or solo again: the mirrored ones come alive here
    role: r => { if (r === 'guest') { for (let i = enemies.length - 1; i >= 0; i--) { const e = enemies[i]; if (!e.saga && !e.remote) enemies.splice(i, 1); } target = null; }
      else for (const e of enemies) if (e.remote && !e.pvp) { e.remote = false; if (e.tx !== undefined) { e.x = e.tx; e.y = e.ty; } e.wander = [e.x, e.y]; e.state = 'idle'; e.contrib = null; if (e.dead) e.dead = 20; } },
    hit: m => { const e = enemies.find(q => !q.remote && q.nid === m.nid); if (!e || e.dead) return; (e.contrib || (e.contrib = new Set())).add(m.from); e.hp -= m.dmg; e.hurtT = e.T.boss ? .15 : .32; e.state = 'chase'; e.show = 4;
      const d = Math.hypot(e.x - m.x, e.y - m.y) || 1, k = (m.kb || 1.4) * (e.T.boss ? .3 : 1); A.move(e, (e.x - m.x) / d * k, (e.y - m.y) / d * k); addText(e.x, e.y, '' + m.dmg, '#9fd4ff', 1); fx('hit', e.x, e.y, .3, 1.2, .6); if (e.hp <= 0) netKill(e); },
    kill: m => { const e = enemies.find(q => q.remote && q.nid === m.nid); if (!e || (e.dead && e.dead !== 1)) return; kill(e, !(m.c || []).includes(EXT.net && EXT.net.id)); },
    dmg: m => hurtHero(m.dmg, m.x, m.y),
    pvp: m => { if (!pvpOn || H().dead) return; hurtHero(m.dmg, m.x, m.y); if (S.hp <= 0 && EXT.net) EXT.net.send({ t: 'ko', by: m.from }); },
    setPvp: on => { pvpOn = !!on; if (!pvpOn) syncPvp(); toast(pvpOn ? 'PvP activé' : 'PvP désactivé', pvpOn ? 'Tu peux te battre contre les joueurs qui ont aussi activé le PvP' : 'Les autres joueurs ne peuvent plus t’attaquer'); return pvpOn; },
    pvp_on: () => pvpOn,
    shot: m => shots.push({ k: m.k === 'fireball' ? 'fireball' : 'kunai', x: m.x, y: m.y, vx: m.vx, vy: m.vy, life: m.life, dmg: m.dmg, r: m.r || undefined, from: 'enemy' }) };
  function hurtHero(dmg, fromX, fromY) { const h = H(); if (h.inv > 0 || h.dead || h.z > 2.2) return; dmg = Math.max(1, Math.round(dmg * 100 / (100 + gear().def))); if (noDeath) dmg = Math.min(dmg, Math.max(0, S.hp - 1)); S.hp -= dmg; combo.n = 0; showCombo(); h.inv = .75; h.act = 'hurt'; h.actT = 0; sfx('hurt'); A.punch(0, .2); addText(h.x, h.y, '-' + dmg, '#ff6a5a', 1.2); fx('hit', h.x, h.y, .3, 1, .8);
    const d = Math.hypot(h.x - fromX, h.y - fromY) || 1; A.move(h, (h.x - fromX) / d * 1.2, (h.y - fromY) / d * 1.2);
    if (S.hp <= 0) { S.hp = 0; const offer = !!NADS() && S.ryo >= 50; h.dead = offer ? 5 : 2.5; keepRyo = false; $('#k-keepryo').hidden = !offer; $('#k-dead').hidden = false; } refresh(); }

  // a tap that works for the first finger (click) and for a second finger (pointerup, never followed by a click)
  function tap(el, fn) { el.addEventListener('click', e => { e.stopPropagation(); fn(e); }); el.addEventListener('pointerup', e => { if (!e.isPrimary) { e.stopPropagation(); fn(e); } }); el.addEventListener('pointerdown', e => e.stopPropagation()); }
  /* ================= finger slashes (touch + melee weapon) ================= */
  const meleeW = () => { const w = S.eq && S.eq.weapon && S.eq.weapon.w; return w && w !== 'kunai' ? WT[w] : null; };
  const SL = { on: false, pts: [], cut: new Set(), last: new Map(), swingT: 0 }; let slC = null, slG = null, slRaf = 0;
  function slashOn() { return started && !panel && !dlg && !creatorOpen && !H().dead && !!meleeW(); }
  // a touch that lands on (or right next to) an enemy in reach is a slash even inside the joystick area
  function slashWants(x, y) { if (!slashOn()) return false; const h = H(), W8 = meleeW(); for (const e of enemies) { if (e.dead || Math.hypot(e.x - h.x, e.y - h.y) > W8.reach + 1) continue;
      const [cx, cy0, z] = A.toClient(e.x, e.y); if (Math.hypot(x - cx, y - (cy0 - 46 * z)) < 70 * z * (e.T.boss ? 1.5 : 1)) return true; } return false; }
  function slashStart(x, y) { SL.on = true; SL.cut.clear(); SL.pts.push({ x, y, t: performance.now() }); drawSlash(); }
  function slashMove(x, y) { if (!SL.on) return; const now = performance.now(), p0 = SL.pts[SL.pts.length - 1]; SL.pts.push({ x, y, t: now }); if (!p0) return;
    const dt = Math.max(1, now - p0.t), len = Math.hypot(x - p0.x, y - p0.y), sp = len / dt * 1000, W8 = meleeW(); if (!W8 || sp < 650 || len < 4) return;
    if (now - SL.swingT > 150) { SL.swingT = now; sfx('swing'); }
    const h = H(); for (const e of enemies) { if (e.dead) continue; const d = Math.hypot(e.x - h.x, e.y - h.y); if (d > W8.reach) continue;
      const [cx, cy0, z] = A.toClient(e.x, e.y), cy = cy0 - 46 * z - (e.z || 0) * A.CP * A.PM * z, rr = 34 * z * (W8.wide ? 1.35 : 1) * (e.T.boss ? 1.5 : 1);
      // distance from the enemy's body to the finger's segment
      const vx = x - p0.x, vy = y - p0.y, u = Math.max(0, Math.min(1, ((cx - p0.x) * vx + (cy - p0.y) * vy) / (vx * vx + vy * vy || 1))), dd = Math.hypot(p0.x + vx * u - cx, p0.y + vy * u - cy);
      if (dd > rr || now - (SL.last.get(e) || 0) < W8.cd * 1000) continue;
      SL.last.set(e, now); SL.cut.add(e); h.yaw = yawOf(e.x - h.x, e.y - h.y);
      if (d > 1.6) A.move(h, (e.x - h.x) / d * Math.min(1.3, d - 1.4), (e.y - h.y) / d * Math.min(1.3, d - 1.4));   // short lunge toward the target
      if (!h.act || h.act === 'attack') { h.act = 'attack'; h.actT = 0; h.didHit = true; h.skill = 'fist'; }
      hitEnemy(e, Math.round(dmgOf('fist') * W8.dmg * (sp > 1900 ? 1.25 : 1)), h.x, h.y, W8.kb); if (W8.heavy) A.punch(.16, .28); } }
  function slashEnd() { SL.on = false; const n = SL.cut.size; SL.cut.clear();
    if (n >= 2) { const h = H(), bonus = n >= 3 ? n * 12 : 6; gainXp(bonus); addText(h.x, h.y, (n >= 3 ? 'Coupe ×' + n + ' !' : 'Double coupe') + ' +' + bonus + ' XP', '#ffd23a', 1.3); if (n >= 3) { hitstop = .14; sfx('lvl'); } } }
  function drawSlash() { if (!slC) { slC = document.createElement('canvas'); slC.id = 'k-slash'; document.body.appendChild(slC); slG = slC.getContext('2d'); }
    if (slRaf) return; const step = () => { slRaf = 0; const d = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight; if (slC.width !== Math.round(w * d) || slC.height !== Math.round(h * d)) { slC.width = Math.round(w * d); slC.height = Math.round(h * d); }
      const g = slG, now = performance.now(), W8 = meleeW() || WT.katana; g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h); while (SL.pts.length && now - SL.pts[0].t > 200) SL.pts.shift();
      const P = SL.pts; if (P.length > 1) { g.lineCap = 'round'; g.lineJoin = 'round'; g.globalCompositeOperation = 'lighter';
        for (let i = 1; i < P.length; i++) { const a = 1 - (now - P[i].t) / 200, k = i / (P.length - 1), wd = W8.w * k * a + 1; if (a <= 0) continue;
          g.strokeStyle = W8.col; g.globalAlpha = .45 * a; g.lineWidth = wd * 2.4; g.beginPath(); g.moveTo(P[i - 1].x, P[i - 1].y); g.lineTo(P[i].x, P[i].y); g.stroke();
          g.strokeStyle = '#ffffff'; g.globalAlpha = .95 * a; g.lineWidth = wd; g.beginPath(); g.moveTo(P[i - 1].x, P[i - 1].y); g.lineTo(P[i].x, P[i].y); g.stroke(); }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      if (SL.on || P.length) slRaf = requestAnimationFrame(step); }; slRaf = requestAnimationFrame(step); }
  let hintShown = false;
  function weaponHint(force) { if (tu) { setTimeout(() => weaponHint(force), 2000); return; } const w = meleeW(); if (!w || !(window.KTOUCH && KTOUCH.enabled)) return; if (hintShown && !force) return; hintShown = true; toast(w.n + ' en main', 'Glisse le doigt sur l’ennemi pour trancher. Plusieurs ennemis d’un seul geste = bonus.'); }

  /* ================= update ================= */
  let noDeath = false, objective = null, hudOn = true;
  let started = false, saveT = 0, roofCheckT = 0, target = null, hitstop = 0, lastSup = null, lastPos = null;
  const combo = { n: 0, t: 0 };
  // targeting: Tab cycles through the closest enemies, a click/tap on one selects it; skills turn the hero to face it
  function cycleTarget() { const h = H(), list = enemies.filter(e => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) < 22).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
    if (!list.length) { target = null; toastMini('Aucun ennemi proche'); return; } const i = list.indexOf(target); target = list[(i + 1) % Math.min(list.length, 5)]; sfx('ui'); updTarget(); }
  function faceTarget() { const h = H(); if (target && !target.dead && Math.hypot(target.x - h.x, target.y - h.y) < 24) h.yaw = yawOf(target.x - h.x, target.y - h.y); }
  function pickAt(wx, wy) { let best = null, bd = 2.2; for (const e of enemies) { if (e.dead) continue; const d = Math.hypot(e.x - wx, (e.y - wy) * 1.4); if (d < bd) { bd = d; best = e; } } if (best) { target = best; sfx('ui'); updTarget(); return true; } return false; }
  function updTarget() { const el = $('#k-tgt'); if (!el) return; if (!target || target.dead) { el.hidden = true; return; } el.hidden = false; el.querySelector('.tn').textContent = (target.elite ? '★ ' : '') + target.T.name + ' · niv. ' + target.lvl;
    el.querySelector('.kbar i').style.width = Math.max(0, target.hp / target.max * 100) + '%'; el.querySelector('.kbar b').textContent = Math.max(0, Math.ceil(target.hp)) + ' / ' + target.max; }
  function showCombo() { const el = $('#k-combo'); if (!el) return; if (combo.n < 3) { el.classList.remove('on'); return; } el.querySelector('b').textContent = combo.n; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('on', 'pop');
    el.querySelector('small').textContent = combo.n >= 30 ? 'TEMPÊTE !' : combo.n >= 15 ? 'DÉCHAÎNÉ !' : combo.n >= 8 ? 'SUPERBE !' : 'COMBO'; }
  function update(dt, t) { if (!A) return; const h = H();
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('#k-toast').classList.remove('on'); }
    if (dlg && dlg.typing) { dlg.shown = Math.min(dlg.full.length, dlg.shown + dt * 55); const tx = $('#k-dlg .txt'); tx.textContent = dlg.full.slice(0, Math.floor(dlg.shown)); tx.classList.toggle('done', dlg.shown >= dlg.full.length); if (dlg.shown >= dlg.full.length) dlg.typing = false; }
    if (!started || panel || dlg || creatorOpen) return;      // menus and dialogues pause the world
    if (h.dead) { h.dead -= dt; if (h.dead <= 0) { h.dead = 0; $('#k-dead').hidden = true; S.hp = maxHp() * .6; S.ck = maxCk() * .5; const lost = keepRyo ? 0 : Math.floor(S.ryo * .1); keepRyo = false; S.ryo -= lost; const r = NPCS.find(n => n.id === 'ren'); h.x = r.x; h.y = r.y + 2.5; h.z = 0; A.snap(); toast('Soigné par Ren', lost ? 'Tu as perdu ' + lost + ' ryō' : ''); refresh(); } return; }
    // regen
    S.ck = Math.min(maxCk(), S.ck + dt * (2.2 + S.lvl * .3)); if (S.regen > 0) { S.regen -= dt; S.hp = Math.min(maxHp(), S.hp + dt * 9); }
    const inCombat = enemies.some(e => !e.dead && e.state === 'chase'); if (!inCombat) S.hp = Math.min(maxHp(), S.hp + dt * 1.5);
    if (combo.t > 0) { combo.t -= dt; if (combo.t <= 0) { combo.n = 0; showCombo(); } }
    if (target && (target.dead || Math.hypot(target.x - h.x, target.y - h.y) > 30)) target = null; updTarget();
    if (h.sup && h.sup !== lastSup && h.sup.house && !h.air) { S.st.roofs++; progress('roof'); checkAch(); } lastSup = h.air ? lastSup : h.sup;
    if (lastPos && A.onWater()) { S.st.water += Math.hypot(h.x - lastPos[0], h.y - lastPos[1]); if (Math.random() < dt) checkAch(); } lastPos = [h.x, h.y];
    for (const hb of herbs) { if (hb.t > 0) { hb.t -= dt; continue; } if (h.z < 1 && Math.hypot(hb.x - h.x, hb.y - h.y) < 1.3) { hb.t = 140; S.herbs++; S.st.herbs++; sfx('coin2'); addText(h.x, h.y, '+1 herbe', '#9aff7a'); progress('herb'); checkAch(); } }
    for (const sc of secrets) { if (S.scrolls.includes(sc.id)) continue; if (Math.hypot(sc.x - h.x, sc.y - h.y) < 1.5 && Math.abs(h.z - sc.z) < 1.6) { S.scrolls.push(sc.id); S.sp++; S.perm.atk = (S.perm.atk || 0) + 2; S.perm.hp = (S.perm.hp || 0) + 10; sfx('lvl'); fx('leafSwirl', h.x, h.y, 1, 1.4);
        toast('Rouleau secret ' + S.scrolls.length + ' / ' + secrets.length, '+1 point de technique · +2 attaque · +10 vie'); gainXp(150 + S.lvl * 20); checkAch(); } }
    for (const k in cds) cds[k] = Math.max(0, cds[k] - dt); h.inv = Math.max(0, (h.inv || 0) - dt); h.lastHitT = Math.max(0, (h.lastHitT || 0) - dt);
    if (h.chid) { const c = h.chid; c.t -= dt; for (let k = 0; k < 4; k++) A.move(h, c.dx * 7.5 * dt, c.dy * 7.5 * dt); if (Math.random() < .6) fx('lightning', h.x, h.y, .25, 1.1, .5);
      for (const e of enemies) if (!e.dead && !c.hit.has(e) && Math.hypot(e.x - h.x, e.y - h.y) < 2.2) { c.hit.add(e); hitEnemy(e, dmgOf('chidori'), h.x - c.dx, h.y - c.dy, 4.5); A.punch(.14, .3); } if (c.t <= 0) h.chid = null; }
    // hero action
    if (h.act) { h.actT += dt; const a = ACT[h.act]; if (a.hit && !h.didHit && h.actT >= a.hit) { h.didHit = true; const r = h.yaw * Math.PI / 180, fx_ = Math.sin(r), fy = Math.cos(r);
        if (h.act === 'attack' || h.act === 'kick') { const sk = h.act === 'kick' ? 'kick' : 'fist'; for (const e of enemies) { if (e.dead) continue; const ex = e.x - h.x, ey = e.y - h.y, d = Math.hypot(ex, ey); if (d < 2.6 && (ex * fx_ + ey * fy) / (d || 1) > .1) hitEnemy(e, dmgOf(sk), h.x, h.y, sk === 'kick' ? 2.6 : 1.2); } }
        if (h.act === 'throw') shots.push({ k: 'kunai', x: h.x + fx_ * .8, y: h.y + fy * .8, vx: fx_ * 32, vy: fy * 32, life: .65, dmg: dmgOf('kunai'), from: 'hero', z: h.z });
        if (h.act === 'cast' && h.skill === 'water') { shots.push({ k: 'water', x: h.x + fx_ * 1.2, y: h.y + fy * 1.2, vx: fx_ * 20, vy: fy * 20, life: 1.1, dmg: dmgOf('water'), r: 2, from: 'hero', z: h.z, pierce: new Set() }); sfx('fire'); }
        else if (h.act === 'cast' && h.skill === 'wind') { sfx('swing'); A.punch(.08, .15); fxs.push({ k: 'windSlash', x: h.x + fx_ * 3, y: h.y + fy * 3, t: 0, d: .4, s: 1.8, z: .6 }); for (const e of enemies) { if (e.dead) continue; const ex = e.x - h.x, ey = e.y - h.y, d = Math.hypot(ex, ey); if (d < 7.5 && (ex * fx_ + ey * fy) / (d || 1) > .45) hitEnemy(e, dmgOf('wind'), h.x, h.y, 3.5); } }
        else if (h.act === 'cast' && h.skill === 'clone') { sfx('smoke'); const list = enemies.filter(e => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) < 18).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
          for (let c = 0; c < 3; c++) { const a = (c - 1) * .9 + h.yaw * Math.PI / 180, x = h.x + Math.sin(a) * 1.4, y = h.y + Math.cos(a) * 1.4; fx('smoke', x, y, .5, .9); shots.push({ k: 'clone', x, y, vx: Math.sin(a) * 6, vy: Math.cos(a) * 6, life: 3.2, dmg: dmgOf('clone'), r: 1.2, from: 'hero', tgt: list.length ? list[c % list.length] : null }); } }
        else if (h.act === 'cast' && h.skill === 'chidori') { sfx('sphere'); h.chid = { t: .42, dx: fx_, dy: fy, hit: new Set() }; h.act = 'dash'; h.actT = 0; }
        else if (h.act === 'cast') { if (h.skill === 'fire') { shots.push({ k: 'fireball', x: h.x + fx_ * 1.2, y: h.y + fy * 1.2, vx: fx_ * 17, vy: fy * 17, life: 1.1, dmg: dmgOf('fire'), r: 2.3, from: 'hero', z: h.z }); sfx('fire'); }
          else { sfx('sphere'); A.punch(.12, .25); fx('chakraSphere', h.x + fx_ * 1.4, h.y + fy * 1.4, .5, 1.3, .6); for (const e of enemies) { if (e.dead) continue; const d = Math.hypot(e.x - h.x - fx_ * 1.4, e.y - h.y - fy * 1.4); if (d < 3) hitEnemy(e, dmgOf('sphere'), h.x, h.y, 5); } } } }
      if (h.actT >= a.d) { const was = h.act; h.act = null; if (was === 'seal') { h.act = 'cast'; h.actT = 0; h.didHit = false; } } }
    // quest NPC interaction
    let near = null, nd = 3; for (const n of NPCS) { const d = Math.hypot(n.x - h.x, n.y - h.y); if (d < nd && h.z < 1) { nd = d; near = n; } } nearNpc = near;
    $('#k-talk').hidden = (!near && !prompt) || !!dlg || !!panel; const kE = window.KTOUCH && KTOUCH.enabled ? '' : ' (E)'; if (near) $('#k-talk').textContent = 'Parler à ' + near.name.split(' ').pop() + kE; else if (prompt) $('#k-talk').textContent = prompt.txt + kE;
    for (const n of NPCS) { const ex = h.x - n.x, ey = h.y - n.y; if (Math.hypot(ex, ey) < 7) n.yaw = yawOf(ex, ey); n.t += dt; }
    // roof of the Gardien
    if (S.q.q3 === 'active' && !S.qp.roof && (roofCheckT -= dt) < 0) { roofCheckT = .25; if (Math.hypot(h.x, h.y + 78) < 18 && h.z > 14) { S.qp.roof = true; sfx('quest'); toast('Objectif atteint', 'Tu es sur le toit du Gardien ! Retourne voir Hayato.'); refresh(); } }
    // enemies
    syncPvp();
    for (const e of enemies) { e.t += dt;
      if (e.remote) { e.show = Math.max(0, e.show - dt); e.hurtT = Math.max(0, e.hurtT - dt); if (!e.dead && e.tx !== undefined) { const ddx = e.tx - e.x, ddy = e.ty - e.y; if (Math.hypot(ddx, ddy) > 8) { e.x = e.tx; e.y = e.ty; } else { const k = Math.min(1, dt * 10); e.x += ddx * k; e.y += ddy * k; } } e.anim = e.hurtT > 0 ? 'hurt' : e.netAnim || 'idle'; continue; }
      if (e.dead) { e.dead -= dt; if (e.dead <= 0) { e.dead = 0; roll(e); e.contrib = null; e.x = e.home[0]; e.y = e.home[1]; e.state = 'idle'; fx('smoke', e.x, e.y, .5, 1); } continue; }
      e.show = Math.max(0, e.show - dt); e.hurtT = Math.max(0, e.hurtT - dt); e.cd = Math.max(0, e.cd - dt); e.cd2 = Math.max(0, e.cd2 - dt);
      const tg = aim(e, h), ex = tg.x - e.x, ey = tg.y - e.y, d = Math.hypot(ex, ey) || .01, dh = Math.hypot(e.x - e.home[0], e.y - e.home[1]);
      if (e.state === 'idle' && d < e.T.aggro && tg.z < 3) e.state = 'chase'; if (e.state === 'chase' && (d > e.T.aggro * 2.4 || dh > 32)) e.state = 'home';
      if (e.act) { e.actT += dt; const a = ACT[e.act]; if (a.hit && !e.didHit && e.actT >= a.hit) { e.didHit = true;
          if (e.act === 'attack' || e.act === 'kick') { if (d < e.T.range + .7) hurtTg(tg, e.dmg + (e.act === 'kick' ? 6 : 0), e.x, e.y); }
          if (e.act === 'throw') shots.push({ k: 'kunai', x: e.x, y: e.y, vx: ex / d * 24, vy: ey / d * 24, life: .7, dmg: Math.round(e.dmg * .8), from: 'enemy' }), netShot(shots[shots.length - 1]);
          if (e.act === 'cast') { shots.push({ k: 'fireball', x: e.x, y: e.y, vx: ex / d * 13, vy: ey / d * 13, life: 1.3, dmg: e.dmg + 10, r: 1.6, from: 'enemy' }), netShot(shots[shots.length - 1]); sfx('fire'); } }
        if (e.actT >= a.d) { const was = e.act; e.act = null; if (was === 'seal') { e.act = 'cast'; e.actT = 0; e.didHit = false; } } }
      if (e.hurtT > 0) { e.anim = 'hurt'; continue; }
      if (e.act) { e.anim = e.act; continue; }
      if (e.state === 'chase') { e.yaw = yawOf(ex, ey);
        if (((e.T && e.T.base) || e.type) === 'wolf') { if (d > e.T.range) { A.move(e, ex / d * e.T.sp * dt, ey / d * e.T.sp * dt); e.anim = 'run'; } else { e.anim = 'attack'; if (e.cd <= 0) { e.cd = 1.15; e.bite = .32; } }
          if (e.bite > 0) { e.bite -= dt; if (e.bite <= 0) { sfx('bite'); if (d < e.T.range + .6) hurtTg(tg, e.dmg, e.x, e.y); } } }
        else { if (((e.T && e.T.base) || e.type) === 'bandit' && d > 4 && d < 9 && e.cd2 <= 0) { e.cd2 = 3.5; e.act = 'throw'; e.actT = 0; e.didHit = false; continue; }
          if ((e.type === 'boss' || e.T.caster) && d > 3 && d < 12 && e.cd2 <= 0) { e.cd2 = 4.2; e.act = 'seal'; e.actT = 0; e.didHit = false; continue; }
          if (d > e.T.range) { A.move(e, ex / d * e.T.sp * dt, ey / d * e.T.sp * dt); e.anim = 'run'; } else { e.anim = 'idle'; if (e.cd <= 0) { e.cd = e.T.boss ? .9 : 1.3; e.act = rnd() < .3 ? 'kick' : 'attack'; e.actT = 0; e.didHit = false; sfx('swing'); } } } }
      else if (e.state === 'home') { const hx = e.home[0] - e.x, hy = e.home[1] - e.y, hd = Math.hypot(hx, hy); e.hp = Math.min(e.max, e.hp + dt * e.max * .2); if (hd > .6) { e.yaw = yawOf(hx, hy); A.move(e, hx / hd * e.T.sp * .7 * dt, hy / hd * e.T.sp * .7 * dt); e.anim = 'run'; } else { e.state = 'idle'; } }
      else { e.wt -= dt; const wx = e.wander[0] - e.x, wy = e.wander[1] - e.y, wd = Math.hypot(wx, wy);
        if (e.wt <= 0) { e.wt = 3 + rnd() * 4; e.wander = [e.home[0] + (rnd() - .5) * 10, e.home[1] + (rnd() - .5) * 10]; }
        if (wd > .5 && e.wt < 2.5) { e.yaw = yawOf(wx, wy); A.move(e, wx / wd * 1.8 * dt, wy / wd * 1.8 * dt); e.anim = ((e.T && e.T.base) || e.type) === 'wolf' ? 'run' : 'walk'; } else e.anim = 'idle'; } }
    // projectiles
    for (let i = shots.length - 1; i >= 0; i--) { const s = shots[i]; if (s.k === 'clone') { const tg = s.tgt && !s.tgt.dead ? s.tgt : null; if (tg) { const dx = tg.x - s.x, dy = tg.y - s.y, d = Math.hypot(dx, dy) || 1; s.vx += (dx / d * 14 - s.vx) * Math.min(1, dt * 6); s.vy += (dy / d * 14 - s.vy) * Math.min(1, dt * 6); } else { s.vx *= .95; s.vy *= .95; } }
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; let hit = false;
      if (s.from === 'hero') { for (const e of enemies) { if (!e.dead && Math.hypot(e.x - s.x, e.y - s.y) < (s.r || 1.1)) { if (s.pierce) { if (!s.pierce.has(e)) { s.pierce.add(e); hitEnemy(e, s.dmg, s.x - s.vx * .2, s.y - s.vy * .2, 3); } continue; } hitEnemy(e, s.dmg, s.x - s.vx * .05, s.y - s.vy * .05, s.k === 'fireball' ? 3 : s.k === 'clone' ? 2 : 1); hit = true; if (s.k !== 'fireball') break; } } }
      else if (Math.hypot(h.x - s.x, h.y - s.y) < (s.r || 1)) { hurtHero(s.dmg, s.x - s.vx * .05, s.y - s.vy * .05); hit = true; }
      if (hit || s.life <= 0 || A.blocked(s.x, s.y)) { if (s.k === 'fireball' || s.k === 'clone') fx('smoke', s.x, s.y, .5, s.k === 'clone' ? 1 : 1.4); if (s.k === 'water') fx('hit', s.x, s.y, .4, 1.6); shots.splice(i, 1); } }
    for (let i = fxs.length - 1; i >= 0; i--) { fxs[i].t += dt; if (fxs[i].t >= fxs[i].d) fxs.splice(i, 1); }
    for (let i = texts.length - 1; i >= 0; i--) { texts[i].t += dt; if (texts[i].t > 1.1) texts.splice(i, 1); }
    for (let i = drops.length - 1; i >= 0; i--) { const D = drops[i]; D.t += dt; if (D.gear && D.t > .5 && Math.hypot(D.x - h.x, D.y - h.y) < 1.8) { giveItem(D.gear); sfx('coin'); drops.splice(i, 1); refresh(); continue; } if (D.gear) continue; if (D.t > .4 && Math.hypot(D.x - h.x, D.y - h.y) < 1.6) { S.ryo += D.ryo; addText(h.x, h.y, '+' + D.ryo + ' 両', '#ffe08a'); if (D.item) { S.inv[D.item] = (S.inv[D.item] || 0) + (D.item === 'kunai' ? 3 : 1); addText(h.x, h.y, '+ ' + ICONS.LABELS[D.item], '#fff4dc'); } sfx('coin'); drops.splice(i, 1); refresh(); } else if (D.t > 40) drops.splice(i, 1); }
    // HUD cooldowns
    for (const id in SK) { const el = slotEls[id]; if (el) { const c = cds[id] || 0, lowCk = S.ck < SK[id].ck; el.querySelector('.cd').style.setProperty('--p', (c > 0 ? c / SK[id].cd : lowCk ? 1 : 0) * 100); } }
    if (Math.random() < dt * 2) { refresh(); if (window.KAMB) $('#k-wl').textContent = (window.KSTREET ? (KSTREET.night() > .5 ? '☾ ' : '') + KSTREET.clock() + '  ·  ' : '') + ({ clear: KSTREET && KSTREET.night() > .5 ? '' : '☀ ', cloudy: '☁ ', rain: '☂ ', storm: '⚡ ' })[KAMB.weather.state] + KAMB.label(); }
    if ((saveT += dt) > 8) { saveT = 0; save(); }
  }
  const yawOf = (dx, dy) => ((Math.round(Math.atan2(dx, dy) * 180 / Math.PI / 45) * 45) % 360 + 360) % 360;
  let nearNpc = null;

  /* ================= drawing (called by the map inside its sorted pass) ================= */
  const wbank = {}, WBMAX = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (window.matchMedia && matchMedia('(pointer:coarse)').matches) || (window.KTOUCH && KTOUCH.enabled) || /[?&](lowmem|touch=1)/.test(location.search) ? 40 : 96;
  function wolfFrames(anim, yaw, T) { const cre = (T && T.cre) || {}, kind = (T && T.draw) || 'wolf', px = A.heroPx() * 120 / 185, k = (T ? T.name : '') + anim + yaw + px; if (!wbank[k]) { const ks = Object.keys(wbank); if (ks.length >= WBMAX) { let o = ks[0]; for (const q of ks) if (wbank[q].t < wbank[o].t) o = q; delete wbank[o]; } wbank[k] = CREATURE.bake(kind, anim, { idle: 8, run: 10, attack: 8, hurt: 6 }[anim] || 8, px, yaw, cre, true); if (A.bakeK) wbank[k].s = A.bakeK(); } const ws = wbank[k]; ws.t = performance.now(); if (ws.fill && ws.t - wFillT > 24 && ws.fill()) wFillT = performance.now(); return ws; }
  let wFillT = 0;
  function sortItems(Ls, vis) { for (const e of enemies) if (!e.dead && !e.pvp && vis(e.x, e.y)) Ls.push({ y: e.y, game: e, kind: 'enemy' });
    for (const n of NPCS) if (vis(n.x, n.y)) Ls.push({ y: n.y, game: n, kind: 'qnpc' });
    for (const pl of EXT.peers) if (vis(pl.x, pl.y)) Ls.push({ y: pl.y, game: pl, kind: 'peer' });
    for (const s of shots) Ls.push({ y: s.y, game: s, kind: 'shot' }); for (const f of fxs) Ls.push({ y: f.y + .1, game: f, kind: 'fx' }); for (const D of drops) Ls.push({ y: D.y - .1, game: D, kind: 'drop' });
    for (const hb of herbs) if (hb.t <= 0 && vis(hb.x, hb.y)) Ls.push({ y: hb.y, game: hb, kind: 'herb' });
    for (const sc of secrets) if (!S.scrolls.includes(sc.id) && vis(sc.x, sc.y)) Ls.push({ y: sc.y + (sc.ky || 0), game: sc, kind: 'secret' }); }
  function drawItem(g, it, t) { const e = it.game, p = A.toS(e.x, e.y), kk = A.kk(), z = A.zoom();
    // another player: his own look, his animation, his name (blue) and the bubble of his last message
    if (it.kind === 'peer') { const AD = { attack: .42, kick: .5, throw: .4, seal: .5, cast: .45, hurt: .35, dash: .3 }, anim = e.anim || 'idle', set = A.frames(e.lk, anim, (Math.round((e.yaw || 0) / 45) * 45 % 360 + 360) % 360);
      const age = t - (e.animT || 0), dur = { run: .55, ninjarun: .42, walk: .9, idle: 1.6 }[anim] || .5, u = AD[anim] ? Math.min(.999, age / AD[anim]) : anim === 'jump' ? Math.min(.999, age / .7) : (t / dur + (e.id % 7) * .13) % 1;
      const f = set[Math.floor(u * set.length) % set.length] || set[0], py = p[1] - (e.z || 0) * A.CP * A.PM;
      g.fillStyle = 'rgba(20,30,20,.3)'; g.beginPath(); g.ellipse(p[0], p[1], 13, 13 * A.SP * .8, 0, 0, TAU); g.fill();
      if (f) { const K2 = set.s || kk; g.drawImage(f, p[0] - set.ax * K2, py - set.ay * K2, f.width * K2, f.height * K2); }
      const top = py - 100; g.font = '800 10px system-ui'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.7)'; g.fillStyle = e.pvp ? '#ff7a6a' : '#9fd4ff'; const lab = (e.talk ? '🔊 ' : '') + (e.pvp ? '⚔ ' : '') + e.name + (e.lvl ? ' · ' + e.lvl : '');
      if (target && target.pvp && target.peer === e) { g.strokeStyle = '#ff4a3a'; g.lineWidth = 2.5; g.setLineDash([6, 4]); g.lineDashOffset = -t * 20; g.beginPath(); g.ellipse(p[0], p[1], 20, 20 * A.SP * .8, 0, 0, TAU); g.stroke(); g.setLineDash([]); g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.7)'; }
      g.strokeText(lab, p[0], top + 4); g.fillText(lab, p[0], top + 4);
      if (e.say && t - e.sayT < 6) { g.font = '700 11px system-ui'; const txt = e.say.length > 42 ? e.say.slice(0, 40) + '…' : e.say, w = Math.min(240, g.measureText(txt).width + 16), y = top - 14; g.globalAlpha = Math.min(1, (6 - (t - e.sayT)) * 2);
        g.fillStyle = 'rgba(246,235,211,.95)'; g.beginPath(); g.roundRect(p[0] - w / 2, y - 18, w, 20, 8); g.fill(); g.beginPath(); g.moveTo(p[0] - 5, y + 2); g.lineTo(p[0] + 5, y + 2); g.lineTo(p[0], y + 7); g.fill(); g.fillStyle = '#120E18'; g.fillText(txt, p[0], y - 4); g.globalAlpha = 1; }
      g.textAlign = 'start'; return; }
    if (it.kind === 'enemy' || it.kind === 'qnpc') { let set, anim = e.anim || 'idle';
      if (((e.T && e.T.base) || e.type) === 'wolf') { const a = anim === 'walk' ? 'run' : anim === 'kick' || anim === 'throw' ? 'attack' : anim; set = wolfFrames(['idle', 'run', 'attack', 'hurt'].includes(a) ? a : 'idle', e.yaw, e.T); }
      else set = A.frames(e.look || e.T.look, anim, e.yaw);
      const dur = { run: .55, walk: .9, idle: 1.6, hurt: .35 }[anim] || (ACT[anim] && ACT[anim].d) || .5, ph = ACT[anim] && e.actT !== undefined && e.act ? e.actT / ACT[anim].d : (e.t / dur) % 1, f = set[Math.floor(ph * set.length) % set.length] || set[0];
      g.fillStyle = 'rgba(20,30,20,.3)'; g.beginPath(); g.ellipse(p[0], p[1], 13, 13 * A.SP * .8, 0, 0, TAU); g.fill();
      if (e.hurtT > 0) g.filter = 'brightness(1.8)';
      if (f) { const sc = e.T && e.T.boss ? 1.12 : 1; const K2 = (set.s || kk) * sc; g.drawImage(f, p[0] - set.ax * K2, p[1] - set.ay * K2, f.width * K2, f.height * K2); }
      g.filter = 'none';
      const top = p[1] - (((e.T && e.T.base) || e.type) === 'wolf' ? 52 : 100) * (e.T && e.T.boss ? 1.1 : 1);
      if (it.kind === 'enemy' && e.elite) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(p[0], p[1] - 30, 4, p[0], p[1] - 30, 46); gr.addColorStop(0, 'rgba(255,200,60,.35)'); gr.addColorStop(1, 'rgba(255,160,20,0)'); g.fillStyle = gr; g.fillRect(p[0] - 50, p[1] - 80, 100, 100); g.restore(); }
      if (it.kind === 'enemy' && target === e) { g.strokeStyle = '#ff4a3a'; g.lineWidth = 2.5; g.setLineDash([6, 4]); g.lineDashOffset = -t * 20; g.beginPath(); g.ellipse(p[0], p[1], 20, 20 * A.SP * .8, 0, 0, TAU); g.stroke(); g.setLineDash([]); g.fillStyle = '#ff4a3a'; g.beginPath(); const ay = top - 22 + Math.sin(t * 6) * 3; g.moveTo(p[0] - 7, ay - 9); g.lineTo(p[0] + 7, ay - 9); g.lineTo(p[0], ay); g.closePath(); g.fill(); g.strokeStyle = '#2a2230'; g.lineWidth = 1.5; g.stroke(); }
      if (it.kind === 'enemy' && (e.show > 0 || target === e || e.elite || e.T.boss && e.state === 'chase')) { const w = e.T.boss ? 60 : 40; g.fillStyle = 'rgba(30,10,5,.75)'; g.fillRect(p[0] - w / 2 - 1, top - 1, w + 2, 6); g.fillStyle = '#e2483a'; g.fillRect(p[0] - w / 2, top, w * e.hp / e.max, 4);
        g.font = '700 9px system-ui'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 2.5; const lab = (e.elite ? '★ Élite · ' : '') + e.T.name + ' · ' + e.lvl; g.strokeText(lab, p[0], top - 3); g.fillText(lab, p[0], top - 3); }
      if (it.kind === 'qnpc') { g.font = '700 10px system-ui'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.65)'; g.fillStyle = '#fff4dc'; g.strokeText(e.name, p[0], top + 4); g.fillText(e.name, p[0], top + 4);
        const mk = marker(e); if (mk) { const bob = Math.sin(t * 4) * 3, y = top - 14 + bob; g.fillStyle = '#e0b04a'; g.strokeStyle = '#5a2e16'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], y, 9, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#7a2a18'; g.font = '900 14px serif'; g.fillText(mk, p[0], y + 5); } }
      g.textAlign = 'start'; return; }
    if (it.kind === 'shot' && e.k === 'clone') { const set = A.frames('hero', 'ninjarun', yawOf(e.vx, e.vy)), f = set[Math.floor((t / .42) % 1 * set.length) % set.length], K2 = set.s || kk; if (f) { g.globalAlpha = .82; g.drawImage(f, p[0] - set.ax * K2, p[1] - set.ay * K2, f.width * K2, f.height * K2); g.globalAlpha = 1; } return; }
    if (it.kind === 'shot' && e.k === 'water') { g.save(); g.translate(p[0], p[1] - 34); FX.draw(g, 'waterBullet', (t * 2) % 1, { size: 1.5, angle: Math.atan2(e.vy * A.SP, e.vx) }); g.restore(); return; }
    if (it.kind === 'shot') { g.save(); g.translate(p[0], p[1] - 38 - (e.z || 0) * A.CP * A.PM); if (e.k === 'kunai') FX.draw(g, 'kunai', 0, { size: .9, angle: Math.atan2(e.vy * A.SP, e.vx) }); else FX.draw(g, 'fireball', (t * 2) % 1, { size: .8 }); g.restore(); return; }
    if (it.kind === 'fx') { if (e.k === 'log') { g.save(); g.globalAlpha = 1 - e.t / e.d; g.translate(p[0], p[1] - 14); g.fillStyle = '#8a5a32'; g.strokeStyle = '#3a2414'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, 0, 18, 7, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#c9a06a'; g.beginPath(); g.ellipse(14, 0, 4, 6, 0, 0, TAU); g.fill(); g.restore(); return; }
      g.save(); g.translate(p[0], p[1] - (e.z || .3) * 60); FX.draw(g, e.k, e.t / e.d, { size: e.s || 1 }); g.restore(); return; }
    if (it.kind === 'drop' && e.gear) { const c = RAR[e.gear.r].c, b = Math.sin(t * 3 + e.x) * 3; if (e.gear.r >= 1) { const hgt = 40 + e.gear.r * 30, gr = g.createLinearGradient(0, p[1] - hgt, 0, p[1]); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, c); g.globalAlpha = .55; g.fillStyle = gr; g.fillRect(p[0] - 5, p[1] - hgt, 10, hgt); g.globalAlpha = 1; }
      g.save(); g.translate(p[0], p[1] - 10 + b); g.rotate(-.3); g.fillStyle = '#f2e6c4'; g.strokeStyle = '#2a2230'; g.lineWidth = 1.5; g.fillRect(-9, -4, 18, 8); g.strokeRect(-9, -4, 18, 8); g.fillStyle = c; g.fillRect(-11, -5.5, 4, 11); g.fillRect(7, -5.5, 4, 11); g.strokeRect(-11, -5.5, 4, 11); g.strokeRect(7, -5.5, 4, 11); g.restore(); return; }
    if (it.kind === 'herb') { if (e.t > 0) return; const sw = Math.sin(t * 2 + e.x) * .15; g.save(); g.translate(p[0], p[1]); g.rotate(sw); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .45; g.fillStyle = k % 2 ? '#5fbf4a' : '#8de06a'; g.strokeStyle = '#2a4a20'; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.cos(a) * 6, Math.sin(a) * 6 - 2, 6, 2.6, a, 0, TAU); g.fill(); g.stroke(); }
      g.fillStyle = '#f4f0a0'; g.beginPath(); g.arc(0, -8, 2.4, 0, TAU); g.fill(); g.restore(); const s2 = (Math.sin(t * 3 + e.y) + 1) / 2; g.fillStyle = `rgba(220,255,160,${.5 * s2})`; g.beginPath(); g.arc(p[0] + 5, p[1] - 14, 2 + s2 * 1.5, 0, TAU); g.fill(); return; }
    if (it.kind === 'secret') { const y = p[1] - e.z * A.CP * A.PM - 14 + Math.sin(t * 2.4 + e.x) * 4; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(p[0], y, 2, p[0], y, 30); gr.addColorStop(0, 'rgba(255,230,140,.7)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(p[0] - 30, y - 30, 60, 60); g.restore();
      g.save(); g.translate(p[0], y); g.rotate(Math.sin(t * 1.5) * .2); g.fillStyle = '#f6efd6'; g.strokeStyle = '#2a2230'; g.lineWidth = 1.6; g.fillRect(-10, -5, 20, 10); g.strokeRect(-10, -5, 20, 10); g.fillStyle = '#b8505c'; g.fillRect(-13, -7, 5, 14); g.fillRect(8, -7, 5, 14); g.strokeRect(-13, -7, 5, 14); g.strokeRect(8, -7, 5, 14); g.fillStyle = '#a82a20'; g.fillRect(-2, -5, 4, 10); g.restore(); return; }
    if (it.kind === 'drop') { const b = Math.abs(Math.sin(t * 3 + e.x)) * 4; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(p[0], p[1], 7, 3, 0, 0, TAU); g.fill(); g.fillStyle = '#e0b04a'; g.strokeStyle = '#7a4a10'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(p[0], p[1] - 6 - b, 6, 6, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#7a4a10'; g.fillRect(p[0] - 1.5, p[1] - 8 - b, 3, 4); }
  }
  function drawOverlay(g, t) { gpsTick(); drawGps(g, t); for (const T of texts) { const p = A.toS(T.x, T.y), a = 1 - Math.max(0, T.t - .7) / .4; g.globalAlpha = clamp(a, 0, 1); g.font = '900 ' + Math.round(15 * T.sz) + 'px "M PLUS Rounded 1c",system-ui'; g.textAlign = 'center'; g.lineWidth = 3.5; g.strokeStyle = 'rgba(30,10,5,.85)'; g.fillStyle = T.c;
      const y = p[1] - 96 - T.t * 40; g.strokeText(T.s, p[0], y); g.fillText(T.s, p[0], y); } g.globalAlpha = 1; g.textAlign = 'start';
    const h = H(); if (started && !h.dead) { const p = A.toS(h.x, h.y); g.font = '800 11px "M PLUS Rounded 1c",system-ui'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.6)'; g.fillStyle = '#fff4dc'; const y = p[1] - 100 - h.z * A.CP * A.PM; g.strokeText(S.name, p[0], y); g.fillText(S.name, p[0], y); g.textAlign = 'start';
      if (h.act === 'seal' || h.act === 'cast') { g.save(); g.translate(p[0], p[1] - h.z * A.CP * A.PM); FX.draw(g, 'aura', (t * 1.2) % 1, { size: .9 }); g.restore(); } } }
  const marker = n => { const em = EXT.marker && EXT.marker(n); if (em) return em; if (A.region) return null; for (const id in Q) { const q = Q[id]; if (q.giver === n.id && !S.q[id] && (!q.need || q.need()) && canOffer(id)) return '!'; }
    if (n.id === 'mei' && ((S.q.q2 === 'active' && qStep('q2') >= 1) || (S.q.q5 === 'active' && qStep('q5') >= 2))) return '?'; if (n.id === 'mei' && S.q.q1 === 'active') return '?';
    if (n.id === 'hayato' && S.q.q3 === 'active' && S.qp.roof) return '?'; if (n.id === 'ren' && S.q.q4 === 'active') return '?'; return null; };
  const canOffer = id => id === 'q3' ? S.q.q2 === 'done' : id === 'q2' ? false : true;
  function miniMarks(q, k, L) { drawRoute(q, k, L, 2.2); if (EXT.marks) EXT.marks(q, k, L); for (const n of NPCS) { const mk = marker(n); if (!mk) continue; q.fillStyle = '#e0b04a'; q.strokeStyle = '#5a2e16'; q.lineWidth = 1.5; q.beginPath(); q.arc((n.x - L.x0) * k, (n.y - L.y0) * k, 4.5, 0, TAU); q.fill(); q.stroke(); }
    for (const e of enemies) if (!e.dead && e.state === 'chase') { q.fillStyle = '#c8281e'; q.fillRect((e.x - L.x0) * k - 1.5, (e.y - L.y0) * k - 1.5, 3, 3); } }

  /* ================= title, creator, start ================= */
  const OPT = [['hair', 'Cheveux', ['#2b2a3b', '#5a3a26', '#c9a04a', '#e6c24a', '#e48fb0', '#a8242c', '#c9ccd6', '#3a6fb0']], ['hairStyle', 'Coiffure', [['short', 'Courts'], ['spiky', 'En pics'], ['long', 'Longs'], ['messy', 'En bataille']]],
    ['eyes', 'Yeux', ['#1c6fe0', '#3fae5a', '#8a4b1f', '#c8322f', '#7a4ac0', '#2f8f8a', '#4a4f5c']], ['skin', 'Peau', ['#fde2cb', '#f6d1b0', '#e8b48c', '#c98d62', '#8f5d3c']],
    ['coat', 'Tenue', ['#2f90aa', '#c24d6e', '#2b3a52', '#e08a3a', '#5f7d45', '#e8e6dd', '#3a3442', '#7a3428']], ['coatLen', 'Manteau', [[1, 'Long'], [.5, 'Mi-long'], [0, 'Veste']]],
    ['acc', 'Accessoires', [['headband', 'Bandeau'], ['scarf', 'Écharpe'], ['vest', 'Gilet']]]];
  let creatorOpen = false, crEdit = false;
  let crDone = null, crReflect = false;
  function showCreator(edit, onDone, reflect) { crEdit = edit; crDone = onDone || null; crReflect = !!reflect; creatorOpen = true; const T = $('#k-title'); T.hidden = false; const L = S.look; if (reflect) T.style.background = 'radial-gradient(circle at 50% 45%,#2a4a5a,#0c1418)';
    T.innerHTML = `<div id="k-cr" class="paper kake">${ROD()}<span class="vt">忍者登録</span><h2>${reflect ? 'Ton reflet dans l’eau' : edit ? 'Change ton apparence' : 'Crée ton ninja'}</h2><canvas id="k-pv" width="520" height="600"></canvas><div id="k-opts"><label class="opt"><b>Nom</b><input id="k-nm" maxlength="16"></label></div>
      <div style="grid-column:1/-1;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap"><span class="help" style="margin-right:auto;align-self:center">${reflect ? 'Le reflet ondule tant que tu n’as pas choisi. Ton nom s’écrit au pinceau.' : 'Le personnage tourne sur lui-même : 8 directions.'}</span><button class="kbtn" id="k-go">${reflect ? 'C’est moi' : edit ? 'Valider' : 'Entrer dans Aozora'}</button></div></div>`;
    $('#k-nm').value = S.name; const box = $('#k-opts');
    OPT.forEach(([key, label, vals]) => { const o = document.createElement('div'); o.className = 'opt'; o.innerHTML = '<b>' + label + '</b>'; const sw = document.createElement('div'); sw.className = 'sw'; o.appendChild(sw); box.appendChild(o);
      const sync = () => [...sw.children].forEach((x, i) => { const vv = Array.isArray(vals[i]) ? vals[i][0] : vals[i]; x.setAttribute('aria-pressed', key === 'acc' ? !!L[vv] : L[key] === vv); });
      vals.forEach(v => { const b = document.createElement('button'); const [val, txt] = Array.isArray(v) ? v : [v, null]; if (txt) { b.className = 't'; b.textContent = txt; } else { b.style.background = val; b.title = val; }
        b.onclick = () => { if (key === 'acc') L[val] = !L[val]; else L[key] = val; sfx('ui'); sync(); }; sw.appendChild(b); }); sync(); });
    $('#k-go').onclick = () => { S.name = ($('#k-nm').value || 'Ninja').slice(0, 16); creatorOpen = false; T.hidden = true; T.style.background = ''; applyLook(); if (crDone) { const cb = crDone; crDone = null; cb(); return; } if (!edit) begin(true); else { refresh(); save(); } }; }
  function applyLook() { LOOKS.player = lookOf(S.look); A.clearBank(); portrait($('#k-por'), LOOKS.player, null); }
  function previewLoop(t) { if (!creatorOpen) return; const pv = $('#k-pv'); if (!pv) return; const q = pv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, 520, 600); q.fillStyle = 'rgba(40,70,30,.28)'; q.beginPath(); q.ellipse(260, 540, 130, 28, 0, 0, TAU); q.fill();
    if (crReflect) { q.fillStyle = '#2a5a6a'; q.fillRect(0, 0, 520, 600); for (let i = 0; i < 9; i++) { q.strokeStyle = 'rgba(200,235,245,' + (.12 + .04 * Math.sin(t * 2 + i)) + ')'; q.lineWidth = 2; q.beginPath(); q.ellipse(260, 330, 60 + i * 34 + Math.sin(t * 1.5 + i) * 6, (60 + i * 34) * .5, 0, 0, TAU); q.stroke(); } }
    q.save(); if (crReflect) { q.translate(260 + Math.sin(t * 3) * 3, 520); q.scale(2.5, 2.5); q.globalAlpha = .85; } else { q.translate(260, 540); q.scale(2.5, 2.5); } try { HERO.draw(q, { anim: 'idle', phase: (t / 1.6) % 1, yaw: (Math.floor(t / .9) * 45) % 360, look: lookOf(S.look) }); } catch (e) {} q.restore(); }
  function begin(fresh, keepPos) { started = true; if (NADS()) adsReady(); setTimeout(() => weaponHint(), 4500); $('#k-title').hidden = true; for (const id of ['#k-hud', '#k-top', '#k-track', '#k-bar', '#k-weather']) $(id).hidden = false; window.KAMB && KAMB.setMuted(!S.sound); A.onStart();
    const h = H(); if (!keepPos) { const here = A.region ? A.region.id : 'konoha'; if (!fresh && S.pos && (S.region || 'konoha') === here) { h.x = S.pos[0]; h.y = S.pos[1]; } else if (A.region) { h.x = A.region.spawn[0]; h.y = A.region.spawn[1]; h.yaw = 180; } else { h.x = 0; h.y = A.R0 + 9; h.yaw = 180; } h.z = 0; A.snap(); } refresh();
    if (fresh && !keepPos) setTimeout(() => toast('Kunai Gaiden', 'Parle au gardien de la porte (touche E)'), 600);
    else { const today = new Date().toDateString(); if (S.daily.last !== today) { const y = new Date(Date.now() - 864e5).toDateString(); S.daily.streak = S.daily.last === y ? S.daily.streak + 1 : 1; S.daily.last = today;
      const ry = 40 * Math.min(7, S.daily.streak) + S.lvl * 10; S.ryo += ry; setTimeout(() => { toast('Récompense du jour · série ' + S.daily.streak, ry + ' ryō' + (S.daily.streak % 3 === 0 ? ' + un équipement rare' : '')); if (S.daily.streak % 3 === 0) giveItem(genItem(S.lvl, 1)); refresh(); }, 900); } }
    fillContracts(); save(); tuArm(); }
  function showEnd() { setTimeout(() => { openPanel('quests'); const P = $('#k-panel'); P.querySelector('.scr').insertAdjacentHTML('afterbegin', '<div style="text-align:center;margin-bottom:12px"><div style="font:900 54px serif;color:#b8322a">青空</div><h2 style="justify-content:center">Félicitations, Chûnin ' + S.name + ' !</h2><p>Tu as terminé l’histoire de Kunai Gaiden. Le village est à toi : continue à explorer, à chasser et à t’entraîner.</p></div>'); }, 400); }

  let traveling = false;
  function travel(id) { if (!started) return; save(); S.region = id; S.pos = null; store.set('kunai-save', S); traveling = true; setTimeout(() => location.reload(), 120); }
  function save() { if (!started || traveling) return; S.region = A.region ? A.region.id : 'konoha'; const ps = A.pos ? A.pos() : [H().x, H().y]; S.pos = [Math.round(ps[0] * 10) / 10, Math.round(ps[1] * 10) / 10]; store.set('kunai-save', S); }

  /* ================= placement ================= */
  function place() { const free = (x, y, r) => { for (let a = 0; a < 6; a += .7) if (A.blocked(x + Math.cos(a) * r, y + Math.sin(a) * r)) return false; return !A.blocked(x, y); };
    const near = (x, y) => { for (let r = 0; r < 30; r += .7) for (let a = 0; a < TAU; a += .5) { const X = x + Math.cos(a) * r, Y = y + Math.sin(a) * r; if (free(X, Y, .9)) return [X, Y]; } return [x, y]; };
    const npc = (id, name, look, x, y) => { const [X, Y] = near(x, y); NPCS.push({ id, name, look, x: X, y: Y, yaw: 0, t: rnd() * 3, anim: 'idle' }); };
    if (A.region) { const RG = A.region, pk = (test, n, minD) => { const out = []; let tries = 0; while (out.length < n && tries++ < 5000) { const x = A.L.x0 + 4 + rnd() * (A.L.w - 8), y = A.L.y0 + 4 + rnd() * (A.L.h - 8); if (!test(x, y) || !free(x, y, 1.2)) continue; if (out.some(p => Math.hypot(p[0] - x, p[1] - y) < minD)) continue; out.push([x, y]); } return out; };
      for (const n of RG.npcs || []) { npc(n[0], n[1], n[2], n[3], n[4]); NPCS[NPCS.length - 1].lines = n[5]; }
      for (const [t, n, x0, y0, x1, y1] of RG.enemies || []) for (const [x, y] of pk((x, y) => x > x0 && x < x1 && y > y0 && y < y1, n, 6)) spawn(t, x, y);
      for (const [x, y] of pk((x, y) => { const c = A.cls(x, y); return c === 0 || c === 4; }, 30, 9)) herbs.push({ x, y, t: 0 });
      A.B.filter(b => b.build && !b.shared && b.col).map(b => ({ b, h: A.support(b.x, b.y - 1, 99).h })).filter(o => o.h > 5).sort((a, b) => b.h - a.h).slice(0, 6).forEach((o, i) => secrets.push({ id: RG.id + 's' + i, x: o.b.x, y: o.b.y - 1, z: o.h + .3, ky: (o.b.anchor || 0) + .1 }));
      for (const h of EXT.hooks.place) h(A.region); fillContracts(); return; }
    npc('guard', 'Gardien Daisuke', 'jonin', 7, A.R0 - 9);
    npc('mei', 'Secrétaire Mei', 'kunoichi', 4, -53);
    npc('hayato', 'Sensei Hayato', 'jonin', -50, -18);
    npc('genzo', 'Vieux Genzo', 'villager', -6, 40);
    npc('aiko', 'Marchande Aiko', 'merchant', 8, 70);
    npc('ren', 'Médecin Ren', 'medic', 38, 49);
    // enemies: wolves in the southern forests (outside the wall), bandits and their chief in the north-west
    const pick = (test, n, minD) => { const out = []; let tries = 0; while (out.length < n && tries++ < 4000) { const x = A.L.x0 + 4 + rnd() * (A.L.w - 8), y = A.L.y0 + 4 + rnd() * (A.L.h - 8); if (!test(x, y) || !free(x, y, 1.2)) continue; if (out.some(p => Math.hypot(p[0] - x, p[1] - y) < minD)) continue; out.push([x, y]); } return out; };
    for (const [x, y] of pick((x, y) => Math.hypot(x, y) > A.R0 + 5 && y > 70, 12, 7)) spawn('wolf', x, y);
    for (const [x, y] of pick((x, y) => x < -95 && y < -45 && Math.hypot(x, y) > 112, 7, 6)) spawn('bandit', x, y);
    const bp = pick((x, y) => x < -110 && y < -70, 1, 0)[0] || [-125, -80]; spawn('boss', bp[0], bp[1]);
    for (const [x, y] of pick((x, y) => { const c = A.cls(x, y); return c === 0 || c === 4; }, 46, 9)) herbs.push({ x, y, t: 0 });
    // secret scrolls: on the highest roofs, the Gardien residence, the arena wall, a few tree tops
    const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(77), tops = A.B.filter(b => b.house && !b.shared).map(b => ({ b, h: A.support(b.x, b.y - b.house.d / 2, 99).h })).filter(o => o.h > 6).sort((a, b) => b.h - a.h);
    const spots = [[0, -78, A.support(0, -78, 99).h, 30]];
    for (let i = 0; i < tops.length && spots.length < 9; i += Math.max(1, Math.floor(tops.length / 9))) { const o = tops[i]; spots.push([o.b.x, o.b.y - o.b.house.d / 2, o.h, o.b.anchor + o.b.house.d / 2 + .1]); }
    const tr = A.B.filter(b => b.variant && b.top > 6 && Math.hypot(b.x, b.y) < A.R0 - 10); for (let i = 0; i < 3 && tr.length; i++) { const b = tr[(R() * tr.length) | 0]; spots.push([b.x, b.y, b.top, (b.anchor || 0) + .1]); }
    spots.forEach(([x, y, z, ky], i) => secrets.push({ id: 's' + i, x, y, z: z + .3, ky }));
    fillContracts(); }

  /* ================= keys ================= */
  function onKey(e) { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName || '')) return false; const k = e.key.toLowerCase(); if (!A || !A.isReady()) return false; if (window.KINTRO && KINTRO.active() && (k === 'escape' || !started || KINTRO.grab())) return false;   // the intro reads these itself
    if (dlg) { if (k === 'e' || k === ' ' || k === 'enter') { advance(); return true; } if (k === 'escape') { closeDlg(); return true; } return true; }
    if (panel) { if (k === 'escape' || k === 'b' || k === 'm' || k === 'n') { closePanel(); return true; } return true; }
    if (!started) return true;
    if (k === 'escape') { openPanel('opts'); return true; } if (k === 'b') { openPanel('bag'); return true; } if (k === 'm') { openPanel('quests'); return true; } if (k === 'n') { openPanel('map'); return true; }
    if (k === 'e' && nearNpc) { openDlg(nearNpc); return true; } if (k === 'e' && prompt) { prompt.fn(); return true; }
    if (k === 'tab') { cycleTarget(); return true; } if (k === 't') { openPanel('jutsu'); return true; }
    for (const id in SK) if (SK[id].key === k) { useSkill(id); return true; } for (const id in ITEMUSE) if (ITEMUSE[id].key === k) { useItem(id); return true; }
    return false; }

  /* ================= init ================= */
  function init(api) { A = api; buildDom(); buildBar(); setTimeout(sealPad, 0);
    const sv = store.get('kunai-save'); if (sv && sv.v === 1) { S = Object.assign(NEW(), sv); S.inv = Object.assign(NEW().inv, sv.inv); S.skills = Object.assign(NEW().skills, sv.skills); S.rk = Object.assign(NEW().rk, sv.rk);
      // older saves: every ninja now starts with a katana (any other weapon goes to the bag)
      if (sv.tutoDone == null) S.tutoDone = true;   // saves from before the first-run tutorial
      S.rank = ({ Novice: 'Genin', 'Éclaireur': 'Chûnin', 'Maître du Ciel': 'Jōnin' })[S.rank] || S.rank;   // test builds of 22/11 renamed the ranks: back to the originals
      if (!sv.gotKatana) { S.eq = Object.assign({}, sv.eq); if (S.eq.weapon && S.eq.weapon.w !== 'katana') S.bag.push(S.eq.weapon); if (!S.eq.weapon || S.eq.weapon.w !== 'katana') S.eq.weapon = { id: 'katana0', slot: 'weapon', w: 'katana', r: 0, lvl: 1, st: { atk: 3 }, name: 'Katana de genin' }; S.gotKatana = true; } }
    LOOKS.player = lookOf(S.look);
    document.querySelectorAll('#k-top [data-p]').forEach(b => tap(b, () => openPanel(b.dataset.p)));
    tap($('#k-talk'), () => { if (nearNpc) openDlg(nearNpc); else if (prompt) prompt.fn(); });
    $('#k-dlg').addEventListener('click', advance); $('#k-dim').addEventListener('click', closePanel);
    $('#k-new').onclick = () => { if (A.region) { store.set('kunai-save', null); try { sessionStorage.setItem('nsr-new', '1'); } catch (e) {} location.reload(); return; } S = NEW(); store.set('kunai-save', null); if (window.KINTRO) { $('#k-title').hidden = true; KINTRO.start(); } else showCreator(false); };
    if (sv) { const c = $('#k-cont'); c.hidden = false; c.textContent = 'Continuer (' + sv.name + ', niv. ' + sv.lvl + ')'; c.onclick = () => { applyLook(); begin(false); }; }
    $('#k-max').onclick = () => { if (sv && !confirm('Remplacer ta partie actuelle (' + sv.name + ', niv. ' + sv.lvl + ') par le compte niveau max ?')) return;
      S = MAXSAVE(); if (sv && sv.look) { S.look = sv.look; S.name = sv.name; } S.hp = maxHp(); S.ck = maxCk(); store.set('kunai-save', S); if (A.region) { location.reload(); return; } LOOKS.player = lookOf(S.look); applyLook(); begin(false); setTimeout(() => toast('Compte niveau max', 'Niveau ' + MAXL + ' · toutes les techniques · équipement légendaire'), 600); };
    $('#k-new').disabled = true; $('#k-cont').disabled = true; $('#k-max').disabled = true;
    addEventListener('keydown', e => { if (onKey(e)) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    const pl = t => { previewLoop(t / 1000); requestAnimationFrame(pl); }; requestAnimationFrame(pl); }
  function onReady() { place(); $('#k-new').disabled = false; $('#k-max').disabled = false; $('#k-cont').disabled = false; $('#k-tload').textContent = (A.region ? A.region.name : 'Aozora') + ' est prêt.'; try { if (sessionStorage.getItem('nsr-new')) { sessionStorage.removeItem('nsr-new'); setTimeout(() => $('#k-new').click(), 300); } } catch (e) {} portrait($('#k-por'), LOOKS.player, null); }
  const blockInput = () => !started || !!dlg || !!panel || creatorOpen || (A && A.hero.dead > 0) || (A && A.hero.act && A.hero.act !== 'hurt' && A.hero.act !== 'throw');
  const canWaterWalk = () => started && S.lvl >= 3 && S.ck > 1, drainCk = n => { S.ck = Math.max(0, S.ck - n); }, inCombat = () => enemies.some(e => !e.dead && e.state === 'chase');
  let waterHint = 0; const sinkHint = () => { if (performance.now() - waterHint > 6000) { waterHint = performance.now(); toastMini(S.lvl < 3 ? 'Marcher sur l’eau : niveau 3' : 'Plus assez de chakra'); } };
  const timeScale = dt => { if (hitstop > 0) { hitstop -= dt; return .06; } return 1; }, speedMul = () => 1 + gear().spd / 100;
  let prompt = null; const setPrompt = p => { prompt = p; };
  const say = (name, look, lines, onClose) => { openDlg({ name, look, id: '_' }, lines); if (dlg) dlg.onClose = onClose; };
  function openChest(id) { const today = new Date().toDateString(); S.chests = S.chests || {}; if (S.chests[id] === today) { toastMini('Coffre vide — reviens demain'); return; } S.chests[id] = today; sfx('coin');
    const ry = 8 + S.lvl * 5 + ((rnd() * 20) | 0); S.ryo += ry; addText(H().x, H().y, '+' + ry + ' 両', '#ffe08a'); const x = rnd();
    if (x < .3) { S.herbs += 2; addText(H().x, H().y, '+2 herbes', '#9aff7a'); } else if (x < .55) { const k = rnd() < .5 ? 'pillHp' : 'pillCk'; S.inv[k]++; addText(H().x, H().y, '+ ' + ICONS.LABELS[k], '#fff4dc'); } else if (x < .72) giveItem(genItem(S.lvl, 0));
    S.st.chests = (S.st.chests || 0) + 1; refresh(); save(); }

  /* ================= first-run tutorial: run, jump, strike (3 real gestures; no damage meanwhile) =================
     Starts on the map once the intro is over; "Passer" (top right) ends it; Menu > "Revoir le tutoriel" plays it again. */
  const TUL = /^fr/i.test(navigator.language || 'fr') ? 0 : 1;
  const TUT = { run: ['Glisse à gauche pour courir', 'Slide on the left to run'], runK: ['ZQSD ou flèches pour courir', 'WASD or arrows to run'],
    jump: ['Touche 跳 pour sauter', 'Tap 跳 to jump'], jumpK: ['Espace pour sauter', 'Space to jump'],
    fist: ['Touche ce bouton pour frapper', 'Tap this button to strike'], fistK: ['J pour frapper', 'J to strike'],
    skip: ['Passer', 'Skip'], replay: ['Revoir le tutoriel', 'Replay the tutorial'], bravo: ['Bien joué !', 'Well done!'], bravoP: ['Parle au gardien de la porte', 'Talk to the gate guard'] };
  const tt = k => TUT[k][TUL];
  let tu = null, tuWatch = 0;
  function tuArm() { clearInterval(tuWatch); if (S.tutoDone) return; tuWatch = setInterval(() => { if (S.tutoDone || tu) return clearInterval(tuWatch);
    if (started && !(window.KINTRO && KINTRO.active()) && !panel && !dlg && !creatorOpen && A && !A.hero.dead) { clearInterval(tuWatch); tuStart(); } }, 400); }
  function tuStart() {
    if (tu || !started) return; const touch = document.body.classList.contains('touch');
    const el = document.createElement('div'); el.id = 'k-tu';
    el.innerHTML = `<style>#k-tu{position:fixed;inset:0;z-index:14;pointer-events:none}#k-tu .tv{position:absolute;inset:0}
      #k-tu .th{position:absolute;width:48px;height:56px}#k-tu .th i{display:block;font-style:normal;font-size:46px;line-height:1;filter:drop-shadow(0 4px 3px rgba(0,0,0,.6))}
      #k-tu .th.drag i{animation:ktuDrag 1.3s ease-in-out infinite}@keyframes ktuDrag{0%{transform:translate(0,0);opacity:1}70%{transform:translate(70px,-34px);opacity:1}100%{transform:translate(70px,-34px);opacity:.15}}
      #k-tu .th.tap i{animation:ktuTap .9s ease-in-out infinite}@keyframes ktuTap{0%,100%{transform:translateY(-4px)}45%{transform:translateY(8px) scale(.88)}}
      #k-tu .th.tap::before{content:'';position:absolute;left:2px;top:-20px;width:44px;height:44px;border-radius:50%;border:4px solid #f7f1de;animation:ktuRing .9s ease-out infinite}@keyframes ktuRing{0%,40%{transform:scale(.3);opacity:0}50%{opacity:1}100%{transform:scale(1.6);opacity:0}}
      #k-tu .tb{position:absolute;transform:translate(-50%,-100%);width:max-content;max-width:min(320px,80vw);padding:9px 16px;border-radius:12px;font:800 17px 'M PLUS Rounded 1c',system-ui,sans-serif;text-align:center;animation:ktuPop .35s cubic-bezier(.3,1.6,.5,1)}@keyframes ktuPop{from{opacity:0;transform:translate(-50%,-100%) scale(.6)}}
      #k-tu .ts{position:absolute;right:max(12px,env(safe-area-inset-right));top:120px;min-width:96px;min-height:46px;pointer-events:auto;touch-action:none;font-size:16px}</style>
      <div class="tv"></div><div class="th"><i>☝️</i></div><div class="tb paper"></div><button class="ts kbtn">${tt('skip')} ⏭</button>`;
    document.body.appendChild(el); tu = { el, step: '', touch, run: 0, last: null, prevNoDeath: noDeath, hit: 0 }; noDeath = true;
    el.querySelector('.ts').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); sfx('ui'); tuEnd(true); });
    tuGo('run'); requestAnimationFrame(tuLoop); }
  function tuGo(step) { if (!tu) return; tu.step = step; tu.hit = 0; tu.run = 0; tu.last = null; const b = tu.el.querySelector('.tb'); b.textContent = tt(tu.touch ? step : step + 'K'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    tu.el.querySelector('.th').className = 'th ' + (step === 'run' && tu.touch ? 'drag' : 'tap'); }
  function tuNext() { if (!tu) return; sfx('coin'); tu.step === 'run' ? tuGo('jump') : tu.step === 'jump' ? tuGo('fist') : tuEnd(false); }
  function tuEnd(skipped) { if (!tu) return; tu.el.remove(); noDeath = tu.prevNoDeath; tu = null; S.tutoDone = true; save(); if (!skipped) { sfx('quest'); toast(tt('bravo'), tt('bravoP')); } }
  function tuLoop() {
    if (!tu) return; requestAnimationFrame(tuLoop);
    const busy = !started || panel || dlg || creatorOpen || (window.KINTRO && KINTRO.active()); tu.el.style.display = busy ? 'none' : ''; if (busy) return;
    const h = H(), W = innerWidth, Hh = innerHeight;
    if (tu.step === 'run') { const v = window.KTOUCH && KTOUCH.vec(), d = tu.last ? Math.hypot(h.x - tu.last[0], h.y - tu.last[1]) : 0;   // only the player's own steps (not a teleport or a cutscene)
      if (!h.air && d < 1 && (!tu.touch || (v && v.len > 0))) tu.run += d; tu.last = [h.x, h.y]; if (tu.run > 4 && !tu.hit) { tu.hit = 1; setTimeout(tuNext, 250); } }
    if (tu.step === 'jump' && h.air && !tu.hit) { tu.hit = 1; setTimeout(tuNext, 600); }
    if (tu.step === 'fist' && tu.hit === 1) { tu.hit = 2; setTimeout(tuNext, 500); }
    // the hand, the bubble and the light on the spot to touch
    let x, y, r, bx, by;
    if (tu.step === 'run' && tu.touch) { x = W * 0.17; y = Hh * 0.66; r = Math.min(W * 0.16, 130); bx = Math.max(W * 0.22, 150); by = y - r - 6; }
    else { const sl = slotEls[tu.step === 'run' ? 'fist' : tu.step], rc = sl && sl.getBoundingClientRect(); if (!rc || !rc.width) { x = W / 2; y = Hh * 0.6; r = 60; } else { x = rc.left + rc.width / 2; y = rc.top + rc.height / 2; r = Math.max(rc.width, rc.height) * 0.75; }
      bx = Math.min(x, W - 175); by = y - r - 14; if (tu.step === 'run') { x = W / 2; y = Hh * 0.55; r = 90; bx = x; by = y - r; } }
    const hd = tu.el.querySelector('.th'); hd.style.left = (x - 22) + 'px'; hd.style.top = (y - 4) + 'px'; hd.style.display = tu.step === 'run' && !tu.touch ? 'none' : '';
    const b = tu.el.querySelector('.tb'); b.style.left = Math.max(170, Math.min(W - 170, bx)) + 'px'; b.style.top = Math.max(60, by) + 'px';
    // "Passer": top right, under the menu button and the mini-map (and its clock line)
    const mi = document.getElementById('mini'), mr = mi && mi.getBoundingClientRect(), mb = document.getElementById('k-menu'), br = mb && mb.getBoundingClientRect();
    tu.el.querySelector('.ts').style.top = Math.max(mr && mr.height && mr.top < Hh / 2 ? mr.bottom + 40 : 0, br && br.height ? br.bottom + 10 : 0, 60) + 'px';
    tu.el.querySelector('.tv').style.background = `radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, rgba(14,10,20,.5) ${r + 36}px)`;
  }
  const HUDS = ['#k-hud', '#k-top', '#k-track', '#k-bar', '#k-weather'];
  const intro = {
    begin: () => begin(true, true), showHud: on => { hudOn = on; for (const id of HUDS) $(id).hidden = !on; }, showBar: on => { $('#k-bar').hidden = !on; }, setNoDeath: v => { noDeath = v; }, setObjective: (h, p) => { objective = h ? [h, p] : null; refresh(); },
    creator: cb => showCreator(false, cb, true), toast, S: () => S, hp: () => S.hp / maxHp(), heal: () => { S.hp = maxHp(); S.ck = maxCk(); refresh(); },
    spawnBoss: (x, y) => { const T = { name: 'Kurogane', lvl: 9, hp: 99999, dmg: 9, sp: 6.8, xp: 0, ryo: [0, 0], range: 2, aggro: 30, look: 'rogue', boss: true }; const e = { type: 'boss', T, x, y, home: [x, y], hp: T.hp, max: T.hp, lvl: 9, dmg: T.dmg, xp: 0, yaw: 0, t: 0, state: 'chase', anim: 'idle', cd: 1, cd2: 3, act: null, actT: 0, hurtT: 0, dead: 0, wander: [x, y], wt: 0, show: 4, scripted: true }; enemies.push(e); return e; },
    removeEnemy: e => { const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1); if (target === e) target = null; }, save: () => save(), done: () => { S.introDone = true; save(); } };
  Object.assign(EXT, { netApi: NETAPI, Q, DLG, ETYPE, enemies, NPCS, S: () => S, qStep, kill, startQuest, finishQuest, spawn, toast, gainXp, refresh, save, sfx, fx, region: () => A.region, hero: () => A.hero,
    free: (x, y, r) => { for (let a = 0; a < 6; a += .7) if (A.blocked(x + Math.cos(a) * r, y + Math.sin(a) * r)) return false; return !A.blocked(x, y); },
    end: html => setTimeout(() => { openPanel('quests'); $('#k-panel .scr').insertAdjacentHTML('afterbegin', html); }, 400) });
  return { ext: EXT, travel, intro, init, onReady, update, sortItems, timeScale, setPrompt, say, openChest, speedMul, pickAt, slashOn, slashWants, tap, slashStart, slashMove, slashEnd, drawItem, drawOverlay, miniMarks, blockInput, canWaterWalk, drainCk, inCombat, sinkHint, isStarted: () => started, dbg: () => ({ enemies, NPCS, S, Q, openPanel, closePanel, openDlg, closeDlg, toast }) };
})();
