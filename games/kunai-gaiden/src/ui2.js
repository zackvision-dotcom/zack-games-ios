/* Kunai Gaiden — interface « Encre & Chakra » (see the mock-up).
   Restyles the HUD built by game.js and adds: one menu button, the pouch (consumables), the low-life
   vignette and the chat (swipe up from the bottom centre on phones, Enter on a keyboard).
   The chat is local for now: there is no game server yet, so only your own messages and the
   game's system messages appear in it. */
(() => {
  const C = { ink: '#120E18', washi: '#F6EBD3', red: '#E0472F', ck: '#4DA8FF', hp: '#F0573F', gold: '#E8B54A', gps: '#C47BFF' };
  const CSS = `
  :root{--ink2:rgba(18,14,24,.66);--line:rgba(246,235,211,.22)}
  html body #kg .rod, html body #kg .vt{display:none!important}
  /* ---------- player: portrait, bars, no frame ---------- */
  html body #k-hud{left:0!important;top:0!important;padding:12px 60px 26px 14px!important;gap:10px!important;background:radial-gradient(ellipse 100% 100% at 0 0,rgba(12,9,16,.72),rgba(12,9,16,0) 72%)!important;border:0!important;box-shadow:none!important;border-radius:0!important}
  html body #k-hud #k-por{width:48px!important;height:48px!important;border-radius:50%!important;box-shadow:0 0 0 2px ${C.gold},0 0 0 4px rgba(18,14,24,.8)!important;background:radial-gradient(circle at 40% 35%,#3a6f86,#1b2d3a)!important;border:0!important}
  html body #k-hud .lvseal{left:40px!important;top:44px!important;right:auto!important;bottom:auto!important;min-width:20px;height:20px;border-radius:10px!important;background:${C.red}!important;box-shadow:0 0 0 2px ${C.ink}!important;border:0!important;font:900 11px 'M PLUS Rounded 1c',sans-serif!important;color:#fff!important;display:grid;place-items:center;padding:0 4px;transform:none!important;width:auto!important}
  html body #k-hud .nm{color:${C.washi}!important;font:800 14px 'M PLUS Rounded 1c',sans-serif!important;text-shadow:0 1px 2px #000;margin-bottom:4px!important}
  html body #k-hud .nm small{color:${C.gold}!important;font:700 10px 'M PLUS Rounded 1c',sans-serif!important;letter-spacing:.06em;text-transform:uppercase;background:none!important;border:0!important;padding:0 0 0 6px!important;box-shadow:none!important}
  html body #k-hud .brow{margin:0 0 4px!important;gap:0!important}
  html body #k-hud .kj{display:none!important}
  html body #k-hud .kbar{width:150px!important;height:6px!important;border-radius:3px!important;background:rgba(255,255,255,.14)!important;border:0!important;box-shadow:none!important;overflow:hidden}
  html body #k-hud .kbar b{display:none!important}
  html body #k-hp i{background:linear-gradient(90deg,${C.hp},#ff8a6a)!important;border-radius:3px}
  html body #k-ck{height:5px!important}html body #k-ck i{background:linear-gradient(90deg,#2f86ff,#7cc4ff)!important;border-radius:3px}
  html body #k-xp{height:3px!important}html body #k-xp i{background:${C.gold}!important}
  /* ---------- top right: one menu button, round minimap ---------- */
  html body #k-top>button,html body #k-top .ryo{display:none!important}
  html body #k-top{top:0!important;right:0!important;padding:12px 14px 40px 60px;background:radial-gradient(ellipse 100% 100% at 100% 0,rgba(12,9,16,.6),rgba(12,9,16,0) 70%);pointer-events:none}
  #k-menu{position:fixed;top:12px;right:122px;width:44px;height:44px;border-radius:50%;border:0;padding:0;z-index:6;display:grid;place-items:center;cursor:pointer;background:var(--ink2);box-shadow:inset 0 0 0 1.5px var(--line),0 4px 14px rgba(0,0,0,.35)}
  #k-menu[hidden]{display:none}
  html body #mini{top:12px!important;right:14px!important;bottom:auto!important;left:auto!important;width:96px!important;height:96px!important;border-radius:50%!important;border:0!important;box-shadow:0 0 0 2px rgba(246,235,211,.55),0 0 0 4px rgba(18,14,24,.7),0 6px 16px rgba(0,0,0,.4)!important}
  html body #mt{display:none!important}
  html body .zoom{top:150px!important;right:14px!important;bottom:auto!important;flex-direction:row!important;gap:4px!important}
  html body .zoom button{width:30px!important;height:26px!important;border-radius:8px!important;background:var(--ink2)!important;color:${C.washi}!important;border:0!important;box-shadow:inset 0 0 0 1px var(--line)!important;font:800 14px 'M PLUS Rounded 1c',sans-serif!important}
  html body.touch .zoom{display:none!important}
  html body #k-weather{top:112px!important;right:14px!important;left:auto!important;transform:none!important;width:auto!important;text-align:right;white-space:nowrap;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;font:800 9px 'M PLUS Rounded 1c',sans-serif!important;color:${C.washi}!important;text-shadow:0 1px 2px #000;min-width:0!important}
  html body #zone{top:124px!important;bottom:auto!important;left:auto!important;right:14px!important;transform:none!important;background:none!important;color:${C.washi}!important;border:0!important;box-shadow:none!important;padding:0!important;font:800 9px 'M PLUS Rounded 1c',sans-serif!important;text-shadow:0 1px 2px #000;white-space:nowrap}
  html body.compact #zone{top:100px!important;right:8px!important;left:auto!important;transform:none!important;font-size:9px!important;padding:0!important}
  /* ---------- quest tracker + GPS: top centre ---------- */
  html body #k-track{display:block!important;left:50%!important;right:auto!important;top:12px!important;transform:translateX(-50%);width:auto!important;max-width:40vw;padding:6px 14px!important;border-radius:999px!important;background:var(--ink2)!important;border:0!important;box-shadow:inset 0 0 0 1px rgba(246,235,211,.18)!important;color:${C.washi}!important;font:700 12px 'M PLUS Rounded 1c',sans-serif!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  html body #k-track *{color:inherit!important;font-size:12px!important;margin:0!important;background:none!important;border:0!important;padding:0!important;display:inline!important}
  html body #k-track b,html body #k-track h4,html body #k-track strong{font-weight:800!important}
  html body #k-track br{display:none!important}
  html body #k-track .in>p{margin-left:8px!important;color:#CBBFAE!important;font-weight:600!important}html body #k-track .in>p~p{display:none!important}
  html body:has(#k-tgt:not([hidden])) #k-track{display:none!important}
  html body #k-track[hidden]{display:none!important}
  html body #k-gps{top:48px!important}
  /* ---------- target, combo, toast ---------- */
  html body #k-tgt{top:12px!important;min-width:250px!important;padding:7px 12px 9px!important;border-radius:12px!important;background:rgba(18,14,24,.72)!important;border:0!important;box-shadow:inset 0 0 0 1px rgba(224,71,47,.55)!important;color:${C.washi}!important}
  html body #k-tgt .tn{color:${C.washi}!important;font:800 12px 'M PLUS Rounded 1c',sans-serif!important;margin-bottom:5px}
  html body #k-tgt .kbar{height:8px!important;border-radius:4px!important;background:rgba(255,255,255,.14)!important;border:0!important;box-shadow:none!important;overflow:hidden}html body #k-tgt .kbar i{background:linear-gradient(90deg,${C.red},#ff7a5c)!important}html body #k-tgt .kbar b{display:none!important}
  html body #k-combo{right:236px!important;top:30%!important;transform:rotate(-6deg)}
  html body #k-combo b{font:400 44px 'Potta One',serif!important;color:#FFD36A!important;text-shadow:0 3px 0 #7a2a10,0 0 18px rgba(255,170,40,.55)!important;-webkit-text-stroke:0!important}
  html body #k-combo small{font:900 12px 'M PLUS Rounded 1c',sans-serif!important;letter-spacing:.2em;color:${C.washi}!important}
  html body #k-toast{top:62px!important;padding:8px 20px!important;border-radius:14px!important;background:rgba(18,14,24,.84)!important;border:0!important;box-shadow:inset 0 0 0 1px rgba(232,181,74,.45),0 8px 24px rgba(0,0,0,.4)!important;max-width:min(420px,60vw)!important}
  html body #k-toast h3{font:400 16px 'Potta One',serif!important;color:${C.gold}!important;margin:0 0 2px!important;background:none!important;text-shadow:none!important;padding:0!important}
  html body #k-toast h3::before,html body #k-toast h3::after{display:none!important}
  html body #k-toast p{color:${C.washi}!important;font:600 12px 'M PLUS Rounded 1c',sans-serif!important;margin:0!important}
  html body #k-talk{background:${C.red}!important;border:0!important;border-radius:22px!important;box-shadow:0 3px 0 #8e2414,0 6px 16px rgba(0,0,0,.4)!important;font:800 13px 'M PLUS Rounded 1c',sans-serif!important;color:#fff!important;text-shadow:none!important}
  /* ---------- touch gamepad, as in the mock-up ---------- */
  html body.touch #k-bar .slot{background:var(--ink2)!important;border:0!important;box-shadow:inset 0 0 0 1.5px rgba(246,235,211,.28),0 4px 14px rgba(0,0,0,.35)!important}
  html body.touch #k-bar .slot canvas{opacity:.92}
  html body.touch #k-bar .slot[title=fist]{right:14px!important;bottom:14px!important;width:74px!important;height:74px!important;background:radial-gradient(circle at 40% 35%,#ff6a50,#B8301E)!important;box-shadow:inset 0 0 0 2px rgba(255,220,200,.5),0 6px 18px rgba(184,48,30,.5)!important}
  html body.touch #k-bar .slot[title=jump]{right:98px!important;bottom:8px!important;width:50px!important;height:50px!important}
  html body.touch #k-bar .slot[title=sprint]{right:18px!important;bottom:100px!important;width:46px!important;height:46px!important}
  html body.touch #k-bar .slot[title=kunai]{right:90px!important;bottom:70px!important;width:46px!important;height:46px!important}
  html body.touch #k-bar .slot[title=pillHp],html body.touch #k-bar .slot[title=pillCk],html body.touch #k-bar .slot[title=ramen]{opacity:0;pointer-events:none;transform:scale(.4);transition:all .16s;width:40px!important;height:40px!important;right:144px!important;bottom:64px!important}
  html body.touch.pouch #k-bar .slot[title=pillHp]{opacity:1;pointer-events:auto;transform:none;right:144px!important;bottom:112px!important}
  html body.touch.pouch #k-bar .slot[title=pillCk]{opacity:1;pointer-events:auto;transform:none;right:190px!important;bottom:96px!important}
  html body.touch.pouch #k-bar .slot[title=ramen]{opacity:1;pointer-events:auto;transform:none;right:196px!important;bottom:50px!important}
  #k-pouch{position:absolute;right:144px;bottom:64px;width:40px;height:40px;border-radius:50%;border:0;padding:0;display:none;place-items:center;cursor:pointer;background:var(--ink2);box-shadow:inset 0 0 0 1.5px rgba(246,235,211,.28),0 4px 14px rgba(0,0,0,.35)}
  html body.touch #k-pouch{display:grid}html body.touch.pouch #k-pouch{box-shadow:inset 0 0 0 2px ${C.gold},0 4px 14px rgba(0,0,0,.35)}
  #k-pouch i{position:absolute;right:-3px;top:-3px;min-width:14px;height:14px;border-radius:7px;background:#2f86ff;font:900 9px 'M PLUS Rounded 1c',sans-serif;color:#fff;display:grid;place-items:center;font-style:normal}
  #k-pouch.low i{background:${C.hp}}
  html body.touch #k-bar{right:0!important;bottom:0!important;width:250px!important;height:170px!important;background:radial-gradient(ellipse 80% 90% at 85% 100%,rgba(12,9,16,.5),rgba(12,9,16,0) 72%)!important}
  /* desktop bar: glass */
  html body:not(.touch) #k-bar{background:rgba(18,14,24,.7)!important;border:0!important;box-shadow:inset 0 0 0 1px var(--line),0 8px 24px rgba(0,0,0,.4)!important;border-radius:16px!important}
  html body:not(.touch) #k-bar .slot{background:#221B2B!important;border:0!important;box-shadow:inset 0 0 0 1.5px rgba(246,235,211,.18)!important;border-radius:12px!important}
  html body:not(.touch) #k-bar .sep{background:var(--line)!important}
  /* ---------- low life ---------- */
  #k-vig{position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;transition:opacity .4s;box-shadow:inset 0 0 110px rgba(170,12,12,.55)}
  /* ---------- menus: dark ink, tabs on the side ---------- */
  html body #k-panel{background:radial-gradient(ellipse 80% 120% at 30% 0,#2a2033,#120E18 70%)!important;color:${C.washi}!important;border:0!important;box-shadow:0 0 0 1px var(--line),0 20px 60px rgba(0,0,0,.6)!important;border-radius:16px!important;padding:12px 14px 12px 0!important;display:grid!important;grid-template-columns:76px minmax(0,1fr);grid-template-rows:minmax(0,1fr);column-gap:14px}
  html body #k-panel[hidden]{display:none!important}
  html body #k-panel .ptabs{display:flex!important;flex-direction:column;gap:6px;margin:0!important;grid-column:1;grid-row:1;padding-top:4px;align-items:center;background:none}
  html body #k-panel .ptabs button{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;flex:none!important;width:58px;min-height:54px!important;border:0!important;border-radius:12px!important;background:none!important;color:#A79CAF!important;font:800 9px 'M PLUS Rounded 1c',sans-serif!important;flex-direction:column;gap:2px!important;box-shadow:none!important}
  html body #k-panel .ptabs button b{font:400 18px 'Potta One',serif!important;color:inherit!important}
  html body #k-panel .ptabs button.on{background:rgba(224,71,47,.16)!important;color:${C.washi}!important;box-shadow:inset 3px 0 0 ${C.red}!important}
  html body #k-panel .scr{grid-column:2;grid-row:1;color:${C.washi};padding-right:44px}
  html body #k-panel .x{position:absolute!important;right:10px!important;top:10px!important;width:40px!important;height:40px!important;border-radius:50%!important;background:rgba(246,235,211,.1)!important;color:${C.washi}!important;border:0!important;box-shadow:none!important;font:900 16px sans-serif!important;z-index:4}
  html body #k-panel h2{color:${C.washi}!important;font:400 20px 'Potta One',serif!important}
  html body #k-panel h2 .seal{background:${C.red}!important;color:#fff!important;border:0!important;box-shadow:none!important;border-radius:8px!important}
  html body #k-panel h3,html body #k-panel h4{color:${C.washi}!important}
  html body #k-panel .help,html body #k-panel p{color:#CBBFAE!important}
  html body #k-panel .item,html body #k-panel .quest{background:rgba(246,235,211,.05)!important;border:0!important;box-shadow:inset 0 0 0 1px rgba(246,235,211,.1)!important;color:${C.washi}!important;border-radius:12px!important}
  html body #k-panel .quest{box-shadow:inset 3px 0 0 ${C.gold},inset 0 0 0 1px rgba(246,235,211,.1)!important}
  html body #k-panel .eqs{background:rgba(246,235,211,.05)!important;border:0!important;box-shadow:inset 0 0 0 1.5px rgba(246,235,211,.12)!important;color:#CBBFAE!important;border-radius:12px!important}
  html body #k-panel .eqs>b{color:#9F94A8!important;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
  html body #k-panel .eqs.full:has(.rar3){box-shadow:inset 0 0 0 2px #F0A020,0 0 12px rgba(240,160,32,.25)!important}html body #k-panel .eqs.full:has(.rar2){box-shadow:inset 0 0 0 2px #B26BFF!important}html body #k-panel .eqs.full:has(.rar1){box-shadow:inset 0 0 0 2px #4DA8FF!important}
  html body #k-mapview .mz button{background:rgba(18,14,24,.75)!important;color:#F6EBD3!important;border:0!important;box-shadow:inset 0 0 0 1.5px rgba(246,235,211,.3)!important}
  html body #k-panel .item canvas{border-radius:10px;background:#221B2B}
  html body #k-panel .stats b{color:#BFB2A0!important}html body #k-panel .stats span{color:${C.washi}!important}
  html body #k-panel .kbtn{background:${C.red}!important;border:0!important;border-radius:10px!important;box-shadow:0 3px 0 #8e2414!important;text-shadow:none!important;color:#fff!important}
  html body #k-panel .kbtn.alt{background:rgba(246,235,211,.12)!important;box-shadow:none!important;color:${C.washi}!important}
  html body #k-panel #k-mapview{border:0!important;box-shadow:inset 0 0 0 1px var(--line)}
  html body #k-dim{background:rgba(6,4,10,.55)!important;backdrop-filter:blur(3px)}
  @media (min-width:761px) and (min-height:521px){html body #k-panel{min-height:min(520px,calc(100vh - 80px))}}
  html body.compact #k-panel{grid-template-columns:68px minmax(0,1fr);column-gap:10px;padding:8px 8px 8px 0!important}
  html body.compact #k-panel .ptabs button{width:54px;min-height:46px!important}
  /* ---------- compact phones ---------- */
  html body.compact #k-hud #k-por{width:40px!important;height:40px!important}html body.compact #k-hud .lvseal{left:32px!important;top:36px!important}
  html body.compact #k-hud .kbar{width:120px!important}
  html body.compact #mini{width:78px!important;height:78px!important;top:8px!important;right:8px!important}
  html body.compact #k-menu{top:8px;right:96px;width:40px;height:40px}
  html body.compact #k-weather{top:88px!important;right:8px!important}
  html body.compact #k-track{top:8px!important}
  html body.compact #k-gps{top:40px!important}
  html body.compact #k-tgt{top:8px!important}
  /* ---------- chat ---------- */
  #k-chath{position:fixed;left:38%;bottom:0;transform:translateX(-50%);width:min(200px,24vw);height:40px;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;padding-bottom:6px;box-sizing:border-box;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none}
  #k-chath .last{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 11px 'M PLUS Rounded 1c',sans-serif;color:rgba(246,235,211,.78);text-shadow:0 1px 2px #000}
  #k-chath .row{display:flex;align-items:center;gap:6px}#k-chath .row s{width:44px;height:4px;border-radius:2px;background:rgba(246,235,211,.55)}
  #k-chath .row span{font:800 9px 'M PLUS Rounded 1c',sans-serif;color:rgba(246,235,211,.65);letter-spacing:.08em}
  #k-chath .row i{display:none;min-width:16px;height:16px;border-radius:8px;background:${C.red};font:900 9px 'M PLUS Rounded 1c',sans-serif;color:#fff;place-items:center;font-style:normal;padding:0 4px;box-sizing:border-box}
  #k-chath .row i.on{display:grid}
  /* iPhone / Android: the bottom edge belongs to the system (home gesture), so the handle sits above it; swipe up starting on it, or just tap */
  html body.touch #k-chath{bottom:max(26px,calc(env(safe-area-inset-bottom,0px) + 16px));height:44px;padding-bottom:4px}
  html body.touch #k-chath .row{padding:4px 12px;border-radius:999px;background:rgba(18,14,24,.55);box-shadow:inset 0 0 0 1px rgba(246,235,211,.18)}
  html body:not(.touch) #k-chath{left:14px;transform:none;width:300px;align-items:flex-start;bottom:8px}
  html body:not(.touch) #k-chath .row span::after{content:' · Entrée'}
  #k-chat{position:fixed;inset:0;z-index:30;display:none;font-family:'M PLUS Rounded 1c',sans-serif;color:${C.washi}}
  body.chat #k-chat{display:block}body.chat #k-chath{display:none}
  #k-chat .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,9,16,.82),rgba(12,9,16,.5) 45%,rgba(12,9,16,.15))}
  #k-chat .tabs{position:absolute;left:14px;top:10px;display:flex;gap:6px}
  #k-chat .tabs button{border:0;cursor:pointer;padding:5px 11px;border-radius:999px;font:800 11px 'M PLUS Rounded 1c',sans-serif;background:rgba(246,235,211,.1);color:#D8CBB6}
  #k-chat .tabs button.on{background:${C.red};color:#fff}
  #k-chat .x{position:absolute;right:12px;top:8px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(246,235,211,.12);color:${C.washi};font:900 16px sans-serif;cursor:pointer}
  #k-chat .feed{position:absolute;left:14px;top:46px;width:min(470px,60vw);bottom:66px;overflow-y:auto;display:flex;flex-direction:column;justify-content:flex-end;gap:3px;overscroll-behavior:contain;touch-action:pan-y}
  #k-chat .m{font:600 12px/1.45 'M PLUS Rounded 1c',sans-serif;text-shadow:0 1px 2px rgba(0,0,0,.8);overflow-wrap:anywhere}
  #k-chat .m b{font-weight:800;margin-right:5px}
  #k-chat .m.sys{color:#d6c7f0}#k-chat .m.sys b{color:${C.gps}}
  #k-chat .bar{position:absolute;left:0;right:0;bottom:0;height:44px;display:flex;align-items:center;gap:8px;padding:0 10px;box-sizing:border-box;background:rgba(18,14,24,.95);box-shadow:0 -1px 0 rgba(246,235,211,.15)}
  #k-chat .bar label{font:800 11px 'M PLUS Rounded 1c',sans-serif;color:${C.red};white-space:nowrap}
  #k-chat .bar input{flex:1;min-width:0;height:30px;border-radius:15px;border:0;padding:0 12px;background:rgba(246,235,211,.12);color:${C.washi};font:600 14px 'M PLUS Rounded 1c',sans-serif;outline:none;box-shadow:inset 0 0 0 2px ${C.ck}}
  #k-chat .bar button{height:32px;padding:0 14px;border-radius:16px;border:0;background:${C.red};color:#fff;font:800 12px 'M PLUS Rounded 1c',sans-serif;cursor:pointer}
  #k-chat .note{position:absolute;left:14px;bottom:48px;font:700 10px 'M PLUS Rounded 1c',sans-serif;color:#9F94A8}
  /* ---------- menus v2: Sac, Jutsus, Missions ---------- */
  html body #k-panel.v2p{height:min(560px,calc(100vh - 70px))}
  html body #k-panel.v2p .vt{display:none!important}
  html body #k-panel.v2p .scr{overflow:hidden!important;max-height:none!important;display:flex;flex-direction:column;padding:0!important;min-height:0}
  #k-panel .v2{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;font-family:'M PLUS Rounded 1c',sans-serif;color:${C.washi}}
  #k-panel .v2 button{font-family:'M PLUS Rounded 1c',sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}
  #k-panel .v2h{display:flex;align-items:center;gap:10px;min-height:40px;padding-right:52px;flex:none;flex-wrap:wrap}
  html body #k-panel .v2h h2{margin:0!important;font-size:20px!important;white-space:nowrap}
  #k-panel .v2h h2 small{font:400 14px 'Potta One',serif!important;color:rgba(246,235,211,.35)}
  #k-panel .v2 .pill{margin-left:auto;padding:4px 12px;border-radius:999px;font:800 12px 'M PLUS Rounded 1c',sans-serif!important;white-space:nowrap}
  #k-panel .v2 .pill.gold{background:rgba(232,181,74,.14);color:${C.gold}}
  #k-panel .v2 .chips{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  #k-panel .v2 .chips button{border:0;border-radius:999px;padding:6px 12px;min-height:30px;background:rgba(246,235,211,.1);color:#D8CBB6;font:800 11px 'M PLUS Rounded 1c',sans-serif!important}
  #k-panel .v2 .chips button b{color:${C.gold};font-size:11px!important}
  #k-panel .v2 .chips button.on{background:${C.washi};color:${C.ink}}#k-panel .v2 .chips button.on b{color:${C.red}}
  #k-panel .v2 .chips .cnt{margin-left:auto;font:700 11px 'M PLUS Rounded 1c',sans-serif!important;color:#9F94A8}
  #k-panel .v2b{flex:1;min-height:0;display:flex;gap:12px}
  #k-panel .v2 .card{border-radius:14px;background:rgba(246,235,211,.05);box-shadow:inset 0 0 0 1px rgba(246,235,211,.08);padding:12px;box-sizing:border-box;min-height:0;overflow:auto;overscroll-behavior:contain}
  #k-panel .v2 .lab{font:800 10px 'M PLUS Rounded 1c',sans-serif!important;letter-spacing:.12em;text-transform:uppercase;color:${C.gold}}
  #k-panel .v2 .lab.ck{color:#7cc4ff}
  html body #k-panel .v2 .sub{font:700 11px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0!important}
  html body #k-panel .v2 .dsc{margin:0;font:600 12px/1.5 'M PLUS Rounded 1c',sans-serif!important;color:#D8CBB6!important}
  #k-panel .v2 hr{border:0;height:1px;background:rgba(246,235,211,.12);margin:2px 0;width:100%}
  #k-panel .v2 .acts{margin-top:auto;display:flex;gap:6px;flex-wrap:wrap;padding-top:6px}
  #k-panel .v2 .acts button{height:42px;border:0;border-radius:10px;padding:0 14px;font:800 13px 'M PLUS Rounded 1c',sans-serif!important;display:flex;align-items:center;justify-content:center;gap:8px}
  #k-panel .v2 .b1{flex:1;background:${C.red};color:#fff;box-shadow:0 3px 0 #8e2414}
  #k-panel .v2 .b1:disabled{background:rgba(246,235,211,.1);color:#9F94A8;box-shadow:none;cursor:default}
  #k-panel .v2 .b2{background:rgba(246,235,211,.12);color:${C.washi}}
  #k-panel .v2 .b3{flex:1;background:#7b3fd1;color:#fff;box-shadow:0 3px 0 #3f1d73}
  #k-panel .v2 button:active{transform:translateY(1px)}
  /* Sac */
  #k-panel .eqc{width:206px;flex:none;display:flex;flex-direction:column;gap:10px}
  #k-panel .fig{position:relative;height:196px;flex:none}
  #k-panel .fig::before{content:'';position:absolute;left:50%;top:6px;transform:translateX(-50%);width:96px;height:180px;border-radius:48px;background:radial-gradient(ellipse at 50% 35%,rgba(77,168,255,.25),rgba(77,168,255,0) 70%)}
  #k-panel .fig canvas{position:absolute;left:50%;top:0;transform:translateX(-50%);width:100px;height:170px}
  #k-panel .eqslot{position:absolute;width:48px;height:48px;border:0;border-radius:11px;background:#221B2B;display:grid;place-items:center;box-shadow:inset 0 0 0 2px var(--r);padding:0}
  #k-panel .eqslot.empty canvas{opacity:.3}
  #k-panel .eqslot small{position:absolute;left:-8px;right:-8px;bottom:-14px;text-align:center;font:700 9px 'M PLUS Rounded 1c',sans-serif!important;color:#9F94A8}
  #k-panel .eqslot.l{left:0}#k-panel .eqslot.r{right:0}#k-panel .eqslot.t{top:2px}#k-panel .eqslot.m{top:72px}#k-panel .eqslot.c{left:50%;margin-left:-24px}#k-panel .eqslot.b{top:134px}
  #k-panel .eqslot.sel,#k-panel .bi.sel{box-shadow:inset 0 0 0 2px var(--r),0 0 0 3px ${C.washi}}
  #k-panel .sts{display:grid;grid-template-columns:1fr 1fr;gap:5px 10px}
  #k-panel .sts span{display:flex;justify-content:space-between;gap:4px;white-space:nowrap;font:700 11px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0}
  #k-panel .sts b{color:${C.washi};font-size:11px!important}
  #k-panel .inv{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;min-height:0}
  #k-panel .igrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:8px;overflow:auto;min-height:0;padding:3px;align-content:start;overscroll-behavior:contain}
  #k-panel .bi{position:relative;aspect-ratio:1;border:0;border-radius:11px;background:#221B2B;display:grid;place-items:center;box-shadow:inset 0 0 0 2px var(--r);padding:0}
  #k-panel .bi span{position:absolute;right:5px;bottom:2px;font:900 11px 'M PLUS Rounded 1c',sans-serif!important;color:${C.washi};text-shadow:0 1px 2px #000}
  html body #k-panel .inv .help{margin:0!important;font-size:11px!important;color:#9F94A8!important}
  #k-panel .det{width:206px;flex:none;display:flex;flex-direction:column;gap:6px;background:linear-gradient(180deg,color-mix(in srgb,var(--r) 18%,transparent),rgba(246,235,211,.04) 45%);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--r) 55%,transparent)}
  #k-panel .det .rk{font:800 10px 'M PLUS Rounded 1c',sans-serif!important;letter-spacing:.12em;text-transform:uppercase;color:#BFB2A0}
  html body #k-panel .det h3{margin:0!important;font:400 17px/1.15 'Potta One',serif!important}
  #k-panel .det .st{display:flex;justify-content:space-between;align-items:baseline;font:700 12px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0}
  #k-panel .det .st b{font-size:12px!important;color:${C.washi}}#k-panel .det .st b.up{color:#7fe08a}#k-panel .det .st b.nil{color:#6f6578}
  #k-panel .det small{font:700 11px 'M PLUS Rounded 1c',sans-serif!important}#k-panel .det small.up{color:#7fe08a}#k-panel .det small.dn{color:#ff8a72}
  /* Jutsus */
  #k-panel .v2 .list{width:250px;flex:none;display:flex;flex-direction:column;gap:5px;overflow:auto;min-height:0;padding:2px;overscroll-behavior:contain}
  #k-panel .j{display:flex;align-items:center;gap:10px;min-height:48px;padding:6px 10px;border:0;border-radius:12px;background:rgba(246,235,211,.05);color:${C.washi};text-align:left;flex:none}
  #k-panel .j.on{background:rgba(77,168,255,.14);box-shadow:inset 0 0 0 1.5px ${C.ck}}#k-panel .j.lk{opacity:.55}
  #k-panel .j .g{width:34px;height:34px;flex:none;border-radius:9px;background:#221B2B;display:grid;place-items:center;font:400 18px 'Potta One',serif!important;color:${C.washi}}
  #k-panel .j.on .g{color:#7cc4ff}
  #k-panel .j .nm{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
  #k-panel .j .nm b{font:800 12px/1.25 'M PLUS Rounded 1c',sans-serif!important}
  #k-panel .j .nm small{font:700 10px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #k-panel .pips{display:flex;gap:3px}#k-panel .pips i{width:14px;height:4px;border-radius:2px;background:rgba(246,235,211,.18)}#k-panel .pips i.on{background:${C.gold}}
  #k-panel .j .ck{font:800 11px 'M PLUS Rounded 1c',sans-serif!important;color:#7cc4ff}
  #k-panel .jdet{flex:1;min-width:0;display:flex;gap:14px}
  #k-panel .jdet .col{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
  #k-panel .jdet .t{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
  html body #k-panel .jdet .t h3{margin:0!important;font:400 20px 'Potta One',serif!important}
  #k-panel .jdet .t span{font:700 11px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0}
  #k-panel .nums{display:flex;gap:6px 14px;flex-wrap:wrap}
  #k-panel .nums span{font:700 11px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0}#k-panel .nums b{color:${C.washi};font-size:11px!important}#k-panel .nums b.ck{color:#7cc4ff}
  #k-panel .jdet .lock{font:700 12px 'M PLUS Rounded 1c',sans-serif!important;color:${C.gold}}
  #k-panel .seals{display:flex;gap:6px;flex-wrap:wrap}
  #k-panel .sg{display:flex;flex-direction:column;align-items:center;gap:1px;width:62px}
  #k-panel .sg canvas{width:56px;height:56px}
  #k-panel .sg b{font:400 14px 'Potta One',serif!important;color:${C.washi};line-height:1.1}
  #k-panel .sg span{font:700 9px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0}
  #k-panel .pad{width:190px;flex:none;display:flex;flex-direction:column;gap:6px}
  #k-panel .pz{position:relative;flex:1;min-height:150px;border-radius:12px;background:radial-gradient(ellipse at 50% 60%,rgba(40,110,210,.22),rgba(18,14,24,.6));box-shadow:inset 0 0 0 1px rgba(77,168,255,.35);overflow:hidden;transition:box-shadow .2s}
  #k-panel .pz.on{box-shadow:inset 0 0 0 2px ${C.ck}}#k-panel .pz.ok{box-shadow:inset 0 0 0 2px #7fe08a,0 0 18px rgba(127,224,138,.35)}
  #k-panel .pz canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;z-index:1}
  #k-panel .pz .gh{position:absolute;inset:0;display:grid;place-items:center;font:400 110px 'Potta One',serif!important;color:rgba(124,196,255,.16);pointer-events:none}
  #k-panel .pz.nogl{display:grid;place-items:center;padding:12px;text-align:center}
  html body #k-panel .pad .sub{text-align:center}
  #k-panel .pad b.ok{color:#7fe08a}#k-panel .pad b.ko{color:#ff8a72}
  /* Missions */
  #k-panel .q{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border:0;border-radius:12px;background:rgba(246,235,211,.05);color:${C.washi};text-align:left;flex:none}
  #k-panel .q.on{background:rgba(232,181,74,.12);box-shadow:inset 0 0 0 1.5px ${C.gold}}#k-panel .q.dn{opacity:.6}
  #k-panel .q .tg{font:800 9px 'M PLUS Rounded 1c',sans-serif!important;letter-spacing:.12em;text-transform:uppercase;color:#BFB2A0}
  #k-panel .q.on .tg{color:${C.gold}}#k-panel .q.dn .tg{color:#7fe08a}
  #k-panel .q b{font:800 12px/1.3 'M PLUS Rounded 1c',sans-serif!important}
  #k-panel .q small{font:700 10px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0}
  #k-panel .qdet{flex:1;min-width:0;display:flex;flex-direction:column;gap:9px}
  #k-panel .qdet .hd{display:flex;align-items:center;gap:10px}
  #k-panel .qdet .kj{width:40px;height:40px;flex:none;border-radius:50%;background:#B8301E;display:grid;place-items:center;font:400 20px 'Potta One',serif!important;color:#fff;box-shadow:0 0 0 2px ${C.gold}}
  html body #k-panel .qdet h3{margin:0!important;font:400 17px/1.2 'Potta One',serif!important}
  #k-panel .steps{display:flex;flex-direction:column;gap:6px}
  #k-panel .step{display:flex;gap:8px;align-items:flex-start;font:600 12px/1.4 'M PLUS Rounded 1c',sans-serif!important;opacity:.5}
  #k-panel .step span{font-size:12px!important}#k-panel .step b{color:${C.gold};font-size:12px!important}
  #k-panel .step i{width:16px;height:16px;flex:none;border-radius:5px;margin-top:1px;box-shadow:inset 0 0 0 2px rgba(246,235,211,.4)}
  #k-panel .step.cur{opacity:1}#k-panel .step.cur i{box-shadow:inset 0 0 0 2px ${C.gold}}
  #k-panel .step.ok{opacity:1}#k-panel .step.ok span{color:#BFB2A0;text-decoration:line-through}
  #k-panel .step.ok i{background:#7fe08a url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2 5l2 2 4-4' fill='none' stroke='%23120E18' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") center/10px no-repeat;box-shadow:none}
  #k-panel .rws{display:flex;gap:6px;flex-wrap:wrap}
  #k-panel .rw{padding:4px 10px;border-radius:999px;background:rgba(246,235,211,.08);font:800 11px 'M PLUS Rounded 1c',sans-serif!important;color:${C.washi}}
  #k-panel .rw.gold{color:${C.gold}}#k-panel .rw.gps{color:${C.gps}}#k-panel .rw.red{color:#ff8a72}
  #k-panel .rw.rar0{color:#A8A29A}#k-panel .rw.rar1{color:#4DA8FF}#k-panel .rw.rar2{color:#B26BFF}#k-panel .rw.rar3{color:#F0A020}
  #k-panel .achg{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;align-content:start;overscroll-behavior:contain}
  #k-panel .ach{display:flex;flex-direction:column;gap:2px;padding:9px 11px;border-radius:12px;background:rgba(246,235,211,.05);opacity:.55}
  #k-panel .ach.ok{opacity:1;box-shadow:inset 0 0 0 1.5px rgba(232,181,74,.6)}
  #k-panel .ach b{font:800 12px 'M PLUS Rounded 1c',sans-serif!important}#k-panel .ach span{font:600 11px 'M PLUS Rounded 1c',sans-serif!important;color:#CBBFAE}#k-panel .ach small{font:800 10px 'M PLUS Rounded 1c',sans-serif!important;color:${C.gold}}
  /* small screens: tighter columns */
  html body.compact #k-panel.v2p{height:auto}
  body.compact #k-panel .v2{gap:6px}
  body.compact #k-panel .v2h{min-height:34px}
  html body.compact #k-panel .v2h h2{font-size:17px!important}
  body.compact #k-panel .v2b{gap:8px}
  body.compact #k-panel .v2 .card{padding:9px}
  body.compact #k-panel .eqc{width:188px;gap:8px}
  body.compact #k-panel .fig{height:180px}body.compact #k-panel .eqslot{width:44px;height:44px}body.compact #k-panel .eqslot.m{top:64px}body.compact #k-panel .eqslot.c{margin-left:-22px}body.compact #k-panel .eqslot.b{top:120px}
  body.compact #k-panel .fig canvas{width:90px;height:153px}
  body.compact #k-panel .det{width:180px}
  body.compact #k-panel .v2 .list{width:210px}
  body.compact #k-panel .pad{width:160px}
  body.compact #k-panel .v2 .acts button{height:38px;font-size:12px!important}
  @media (max-width:700px){#k-panel .v2b{flex-direction:column;overflow:auto}#k-panel .eqc,#k-panel .det,#k-panel .v2 .list,#k-panel .pad{width:auto}#k-panel .v2 .list{max-height:40%}#k-panel .jdet{flex-direction:column}#k-panel .pz{min-height:180px}}
  #k-panel .eqslot canvas{width:28px!important;height:28px!important;background:none!important}#k-panel .bi canvas{width:30px!important;height:30px!important;background:none!important}#k-panel .j .g canvas{width:22px!important;height:22px!important}
  #k-panel .v2 .eqslot,#k-panel .v2 .bi{min-width:0;min-height:0;font-size:0}
  #k-panel .det .acts{flex-wrap:nowrap}#k-panel .det .acts .b2{flex-direction:column;gap:0;padding:0 10px;line-height:1.1}#k-panel .det .acts .b2 small{font:700 9px 'M PLUS Rounded 1c',sans-serif!important;color:#BFB2A0}
  body.compact #k-panel .sg{width:50px}body.compact #k-panel .sg canvas{width:46px;height:46px}body.compact #k-panel .seals{gap:3px}
  body:has(#k-panel:not([hidden])) #k-seals{z-index:40!important}
  `;
  const $ = s => document.querySelector(s);
  function boot() {
    if (!window.KGAME || !$('#kg')) return setTimeout(boot, 200);
    const st = document.createElement('style'); st.id = 'ui2-css'; st.textContent = CSS; document.head.appendChild(st);
    const svg = (p, w) => `<svg width="${w || 20}" height="${w || 20}" viewBox="0 0 20 20" fill="none" stroke="${C.washi}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    // one menu button
    const mb = document.createElement('button'); mb.id = 'k-menu'; mb.hidden = true; mb.setAttribute('aria-label', 'Menu'); mb.innerHTML = svg('<path d="M3 5h14M3 10h14M3 15h14"/>'); document.body.appendChild(mb);
    const open = () => { const d = KGAME.dbg(); d.openPanel('bag'); };
    mb.addEventListener('click', e => { e.stopPropagation(); open(); });
    // the pouch: one button for the three consumables
    const bar = $('#k-bar'), pb = document.createElement('button'); pb.id = 'k-pouch'; pb.setAttribute('aria-label', 'Sacoche : soins, chakra, ramen'); pb.innerHTML = svg('<path d="M4 7 h12 l-1 10 H5 Z"/><path d="M7 7 V5 a3 3 0 0 1 6 0 V7"/>') + '<i>0</i>'; bar.appendChild(pb);
    pb.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); document.body.classList.toggle('pouch'); });
    for (const id of ['pillHp', 'pillCk', 'ramen']) { const s = bar.querySelector(`.slot[title=${id}]`); if (s) s.addEventListener('pointerdown', () => setTimeout(() => document.body.classList.remove('pouch'), 120)); }
    // low-life vignette
    const vig = document.createElement('div'); vig.id = 'k-vig'; document.body.appendChild(vig);
    setInterval(() => { const hud = $('#k-hud'), on = hud && !hud.hidden; mb.hidden = !on; const wr = parseFloat(($('#k-hp i') || {}).style?.width), w = isNaN(wr) ? 100 : wr; vig.style.opacity = on && w < 30 ? (1 - w / 30) * .9 + .1 : 0;
      try { const S = KGAME.dbg().S, n = (S.inv.pillHp || 0) + (S.inv.pillCk || 0) + (S.inv.ramen || 0); pb.querySelector('i').textContent = n > 99 ? '99+' : n; pb.classList.toggle('low', w < 35); } catch (e) {} }, 250);
    chat();
  }

  /* ================= chat ================= */
  function chat() {
    const h = document.createElement('div'); h.id = 'k-chath'; h.setAttribute('role', 'button'); h.setAttribute('aria-label', 'Ouvrir le chat (glisse vers le haut)'); h.hidden = true;
    h.innerHTML = '<div class="last"></div><div class="row"><s></s><span>CHAT</span><i></i></div>'; document.body.appendChild(h);
    const p = document.createElement('div'); p.id = 'k-chat';
    p.innerHTML = `<div class="shade"></div><div class="tabs"><button class="on" data-c="reg">Région</button><button data-c="team">Équipe</button><button data-c="vil">Village</button><button data-c="pm">Privé</button></div>
      <button class="x" aria-label="Fermer le chat">✕</button><div class="feed" aria-live="polite"></div><div class="note"></div>
      <form class="bar"><label for="k-chat-in">Région ›</label><input id="k-chat-in" autocomplete="off" autocapitalize="sentences" enterkeyhint="send" maxlength="140" placeholder="Écris un message…"><button type="submit">Envoyer</button></form>`;
    document.body.appendChild(p);
    const feed = p.querySelector('.feed'), inp = p.querySelector('input'), last = h.querySelector('.last'), badge = h.querySelector('.row i'), note = p.querySelector('.note');
    const LOG = { reg: [], team: [], vil: [], pm: [] }; let tab = 'reg', unread = 0;
    const NOTE = { reg: 'Pour l’instant le jeu n’a pas de serveur : tu vois tes messages et ceux du jeu.', team: 'Équipe : arrive avec le multijoueur.', vil: 'Village : arrive avec le multijoueur.', pm: 'Messages privés : arrivent avec le multijoueur.' };
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const render = () => { feed.innerHTML = LOG[tab].map(m => `<div class="m${m.sys ? ' sys' : ''}"><b style="color:${m.col}">${esc(m.who)}</b>${esc(m.txt)}</div>`).join(''); feed.scrollTop = feed.scrollHeight; note.textContent = NOTE[tab]; };
    const push = (c, m) => { LOG[c].push(m); if (LOG[c].length > 80) LOG[c].shift(); if (c === 'reg') { last.innerHTML = `<b style="color:${m.col}">${esc(m.who)}</b> ${esc(m.txt)}`; if (!document.body.classList.contains('chat')) { unread++; badge.textContent = unread; badge.classList.add('on'); } } if (c === tab) render(); };
    // the game's own announcements land in the chat as system messages
    const t = document.querySelector('#k-toast'); let lastSys = '';
    if (t) new MutationObserver(() => { const a = t.querySelector('h3').textContent, b = t.querySelector('p').textContent, s = a + (b ? ' — ' + b : ''); if (a && s !== lastSys) { lastSys = s; push('reg', { who: 'Système', txt: s, col: C.gps, sys: true }); } }).observe(t, { subtree: true, characterData: true, childList: true });
    push('reg', { who: 'Système', txt: 'Bienvenue ! Glisse du bas de l’écran vers le haut (ou Entrée) pour écrire.', col: C.gps, sys: true }); unread = 0; badge.classList.remove('on');
    const openChat = () => { document.body.classList.add('chat'); unread = 0; badge.classList.remove('on'); render(); inp.focus({ preventScroll: true }); place(); };
    const closeChat = () => { document.body.classList.remove('chat'); inp.blur(); };
    // keep the input bar above the phone keyboard
    const place = () => { const vv = window.visualViewport, bar = p.querySelector('.bar'); if (!vv) return; const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop); bar.style.bottom = kb + 'px'; feed.style.bottom = (kb + 66) + 'px'; note.style.bottom = (kb + 48) + 'px'; };
    if (window.visualViewport) { visualViewport.addEventListener('resize', place); visualViewport.addEventListener('scroll', place); }
    // swipe up from the bottom centre (a tap works too)
    let sy = null; h.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); sy = e.clientY; try { h.setPointerCapture(e.pointerId); } catch (er) {} });
    h.addEventListener('pointerup', e => { if (sy === null) return; const dy = e.clientY - sy; sy = null; if (dy < -24 || Math.abs(dy) < 8) openChat(); });
    h.addEventListener('pointercancel', () => { sy = null; });
    // swipe down on the feed closes it
    let fy = null; p.querySelector('.shade').addEventListener('pointerdown', e => { fy = e.clientY; }); p.addEventListener('pointerup', e => { if (fy !== null && e.clientY - fy > 60) closeChat(); fy = null; });
    p.querySelector('.x').addEventListener('click', closeChat);
    p.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.c; p.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); p.querySelector('label').textContent = b.textContent + ' ›'; render(); inp.focus(); }));
    p.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); if (!v) { closeChat(); return; } if (window.KCHAT && KCHAT.onSend && KCHAT.onSend(tab, v)) { inp.value = ''; return; } let who = 'Toi', rank = ''; try { const S = KGAME.dbg().S; who = S.name; rank = S.rank; } catch (er) {} push(tab, { who: who + (rank ? ' [' + rank + ']' : ''), txt: v, col: C.gold }); inp.value = ''; if (tab === 'reg') { try { KGAME.ext.toast && 0; } catch (er) {} } });
    // keyboard: Enter opens, Escape closes; typing never moves the hero
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); closeChat(); } });
    inp.addEventListener('keyup', e => e.stopPropagation());
    addEventListener('keydown', e => { if (e.key === 'Enter' && !document.body.classList.contains('chat') && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || '') && $('#k-hud') && !$('#k-hud').hidden && !$('#k-dlg:not([hidden])') && !$('#k-panel:not([hidden])')) { e.preventDefault(); e.stopImmediatePropagation(); openChat(); } }, true);
    setInterval(() => { const hud = $('#k-hud'); h.hidden = !(hud && !hud.hidden) || !!$('#k-panel:not([hidden])'); }, 300);
    // for net.js: post into a channel, change a channel's note, show who is online on the handle
    window.KCHAT = { onSend: null, push: (c, m) => push(c, Object.assign({ col: m.sys ? C.gps : '#9fd4ff' }, m)), note: (c, txt) => { NOTE[c] = txt; if (c === tab) note.textContent = txt; },
      status: txt => { h.querySelector('.row span').textContent = txt ? 'CHAT · ' + txt : 'CHAT'; }, me: C.gold };
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
})();
