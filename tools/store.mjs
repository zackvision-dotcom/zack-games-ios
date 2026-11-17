// App Store material: staged gameplay scenes recorded as short video rushes (mp4 1920x886, 30 fps, no sound)
// and still frames for the marketing screenshots. Headless Chrome over the DevTools protocol.
// Needs the local server on :8796 serving this folder.   node tools/store.mjs [kunai|braise] [scene...]
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), PORT = +(process.env.CDP_PORT || 9335), OUT_W = 1920, OUT_H = 886;
let W = 1920, H = 886, DSF = 1;   // CSS viewport; Kunai is shot at a real iPhone size (960x443 @2x), same 1920x886 pixels
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const realSleep = ms => new Promise(r => setTimeout(r, ms)); let sleep = realSleep;
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'store-'))}`, '--hide-scrollbars', '--mute-audio', '--no-first-run', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });

let ws, id = 0; const pending = new Map(), handlers = new Map();
const cmd = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + method)); } }, 90000); });
const js = async expr => { const r = await cmd('Runtime.evaluate', { expression: '{' + expr + '\n}', awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '')); return r.result.value; };
async function connect() {
  for (let i = 0; i < 50; i++) { try { const t = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = t.find(x => x.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch (e) {} await sleep(200); }
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } else if (m.method && handlers.has(m.method)) handlers.get(m.method)(m.params); });
  await cmd('Page.enable'); await cmd('Runtime.enable');
  // a manual clock: during a rush the game advances exactly 1/30 s per captured frame (smooth 30 fps whatever the capture speed)
  await cmd('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const realNow = performance.now.bind(performance), rAF = window.requestAnimationFrame.bind(window); let manual = false, vt = 0, cbs = [];
    window.__vt = { on() { vt = realNow(); manual = true; }, off() { manual = false; const c = cbs; cbs = []; for (const f of c) rAF(f); }, step(ms) { vt += ms; const c = cbs; cbs = []; for (const f of c) { try { f(vt); } catch (e) { console.error(e); } } } };
    performance.now = () => manual ? vt : realNow();
    window.requestAnimationFrame = f => { if (manual) { cbs.push(f); return 1; } return rAF(t => f(manual ? vt : t)); }; })();` });
  await cmd('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await cmd('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }] });
}
const open = async url => { await cmd('Page.navigate', { url }); await sleep(1500); };
const until = async (expr, ms = 60000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await js(expr).catch(() => false)) return true; await sleep(300); } throw new Error('timeout: ' + expr); };

// a still frame (PNG, 1920x886) for the marketing screenshots
async function still(dir, name) { const r = await cmd('Page.captureScreenshot', { format: 'png' }); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, name + '.png'), Buffer.from(r.data, 'base64')); console.log('   still', name); }
// a video rush: screencast frames with their timestamps -> constant 30 fps mp4
let vframes = 0;
const gsleep = async ms => { const target = vframes + Math.round(ms * 30 / 1000); while (vframes < target) await realSleep(15); };
async function rush(dir, name, seconds, action) {
  const tmp = mkdtempSync(join(tmpdir(), 'rush-')); const n = Math.round(seconds * 30);
  await js('__vt.on(); 1'); vframes = 0; sleep = gsleep;   // the scene's own waits now count game time
  const act = action ? action().catch(e => console.error('   action', e.message)) : null;
  for (let i = 0; i < n; i++) { await js('__vt.step(1000 / 30); 1'); const r = await cmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    writeFileSync(join(tmp, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(r.data, 'base64')); vframes++; }
  vframes = 1e9; await act; sleep = realSleep; await js('__vt.off(); 1');
  mkdirSync(dir, { recursive: true });
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', '30', '-i', join(tmp, 'f%05d.jpg'), '-vf', `scale=${OUT_W}:${OUT_H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-r', '30', '-movflags', '+faststart', join(dir, name + '.mp4')]);
  rmSync(tmp, { recursive: true, force: true }); console.log('   rush', name, n, 'frames');
}

/* ========================= Kunai Gaiden ========================= */
// draw a sign in the seal pad with a moving finger (the ink trail shows on screen), letters as in seals.js
const SIGN = { V: [[0, 0], [50, 100], [100, 0]], Z: [[0, 0], [100, 0], [0, 100], [100, 100]], L: [[0, 0], [0, 100], [70, 100]], W: [[0, 0], [25, 100], [50, 30], [75, 100], [100, 0]],
  M: [[0, 100], [0, 0], [50, 70], [100, 0], [100, 100]], O: Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 2 - i / 24 * Math.PI * 2; return [50 + 50 * Math.cos(a), 50 + 50 * Math.sin(a)]; }) };
const drawSign = (k, ms = 520) => js(`(async () => { const pad = document.getElementById('k-sealpad'); const r = pad.getBoundingClientRect(); const P = ${JSON.stringify(SIGN[k])};
  const m = 26, sx = (r.width - 2 * m) / 100, sy = (r.height - 2 * m - 10) / 100, pt = ([x, y]) => [r.left + m + x * sx, r.top + m + y * sy];
  const pts = []; for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < 8; j++) { const u = j / 8; pts.push(pt([P[i][0] + (P[i + 1][0] - P[i][0]) * u, P[i][1] + (P[i + 1][1] - P[i][1]) * u])); } pts.push(pt(P[P.length - 1]));
  const ev = (type, [x, y]) => pad.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true }));
  ev('pointerdown', pts[0]); for (const p of pts.slice(1)) { await new Promise(r => setTimeout(r, ${ms} / pts.length)); ev('pointermove', p); } ev('pointerup', pts[pts.length - 1]); return true; })()`);
const key = (k, ms = 80) => js(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'})); setTimeout(()=>dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'})),${ms}); 1`);
const KURL = 'http://localhost:8796/ios/KunaiGaiden/Web/index.html?touch=1';
async function kunaiBoot(tod = 10) {
  await open(KURL); await js(`localStorage.clear(); localStorage.setItem('kunai-time','${tod}')`); await open(KURL);
  await until("document.querySelector('#k-new') && !document.querySelector('#k-new').disabled");
  await js("window.confirm=()=>true; setTimeout(()=>document.querySelector('#k-max').click(),10); 1"); await sleep(5000);
  await js(`localStorage.setItem('kunai-time','${tod}')`);
  await until("document.querySelector('#k-cont') && !document.querySelector('#k-cont').disabled"); await js("document.querySelector('#k-cont').click()");
  await until('window.KGAME && KGAME.isStarted && KGAME.isStarted()'); await sleep(3000);
  await js(`KSTREET.tod=${tod}; KAMB.setWeather('clear'); Object.assign(KAMB.weather, {rain:0,dark:0,clouds:.1})`);
}
const setWeather = s => js(`KAMB.setWeather('${s}'); for (const k of ['rain','dark','wind','clouds']) KAMB.weather[k]=KAMB.weather.target[k]; 1`);
const place = (x, y) => js(`const h=__k.hero; h.x=${x}; h.y=${y}; __k.snap(); 1`);
const ring = (types, n, rx = 4.5, ry = 3.2) => js(`const h=__k.hero, E=KGAME.ext; const T=${JSON.stringify(types)}; for(let i=0;i<${n};i++){const a=i/${n}*6.28; E.spawn(T[i%T.length],h.x+Math.cos(a)*${rx},h.y+Math.sin(a)*${ry});} 1`);
const panel = p => js(`KGAME.dbg().openPanel('${p}'); 1`), closePanel = () => js('KGAME.dbg().closePanel(); 1');
const KS = {
  'probe': async (R, S) => { for (const [x, y] of [[0, 178], [0, 190], [10, 120], [-20, 90], [30, 60], [2, 40], [-40, 140]]) { await place(x, y); await sleep(1800); await still(join(ROOT, 'appstore', 'probe'), `p_${x}_${y}`); } },
  'combat-z': async (R, S) => { await place(0, 180); await setWeather('clear'); await ring(['bandit', 'wolf'], 6); await sleep(1200);
    await rush(R, '01-combat-z', 6, async () => { await sleep(600); await drawSign('Z'); await sleep(1800); await key('j'); await sleep(400); await key('j'); }); await sleep(300); await still(S, 'combat-z'); },
  'combat-v': async (R, S) => { await sleep(4000); await place(-4, 186); await ring(['wolf'], 5, 4, 3); await sleep(900);
    await rush(R, '02-combat-v-feu', 5, async () => { await sleep(400); await drawSign('V'); await sleep(700); await still(S, 'combat-v'); }); },
  'combat-o': async (R) => { await sleep(4000); await place(4, 182); await ring(['bandit'], 4, 3.5, 2.6); await sleep(900);
    await rush(R, '03-combat-o-sphere', 5, async () => { await sleep(400); await drawSign('O', 700); }); },
  'village-jour': async (R, S) => { await js('KSTREET.tod=16.5'); await setWeather('clear'); await place(-20, 90); await sleep(2500);
    await still(S, 'village-jour');
    await rush(R, '04-village-course', 7, async () => { await js("dispatchEvent(new KeyboardEvent('keydown',{key:'d'}))"); for (let i = 0; i < 5; i++) { await sleep(1000); await key(' '); } await js("dispatchEvent(new KeyboardEvent('keyup',{key:'d'}))"); }); },
  'village-large': async (R, S) => { await js('KSTREET.tod=11'); await place(30, 60); await sleep(2500); await rush(R, '05-village-large', 5); await still(S, 'village-large'); },
  'nuit-orage': async (R, S) => { await place(-40, 140); await setWeather('storm'); await rush(R, '06-jour-nuit-orage', 7, async () => { for (let i = 0; i < 40; i++) { await js(`KSTREET.tod=${17 + i * .14}`); await sleep(150); } });
    await ring(['wolf'], 5, 5, 3.5); await sleep(1200); await rush(R, '07-combat-orage', 6, async () => { await sleep(500); await drawSign('Z'); await sleep(1500); await key('j'); await sleep(300); await key('j'); }); await still(S, 'nuit-orage'); await setWeather('clear'); },
  'boss': async (R, S) => { await js('KSTREET.tod=18.6'); await setWeather('cloudy'); await place(0, 184); await js('KGAME.ext.spawn("boss", __k.hero.x + 4, __k.hero.y - 1); 1'); await sleep(1500);
    await rush(R, '08-boss-kurogane', 8, async () => { for (let i = 0; i < 4; i++) { await key('j'); await sleep(350); } await drawSign('V'); await sleep(900); for (let i = 0; i < 3; i++) { await key('j'); await sleep(350); } await drawSign('Z'); });
    await still(S, 'boss'); },
  'sac': async (R, S) => { await js('KSTREET.tod=12'); await setWeather('clear'); await panel('bag'); await sleep(1200); await still(S, 'sac'); await rush(R, '09-sac-butin', 4); await closePanel(); },
  'jutsus': async (R, S) => { await panel('jutsu'); await sleep(1200); await still(S, 'jutsus'); await closePanel(); },
  'carte': async (R, S) => { await panel('map'); await sleep(1500); await still(S, 'carte'); await rush(R, '10-carte-gps', 4); await closePanel(); },
  'missions': async (R, S) => { await panel('quests'); await sleep(1200); await still(S, 'missions'); await closePanel(); },
  'dialogue': async (R, S) => { await place(2, 40); await sleep(800); await js("const N=KGAME.dbg().NPCS; const n=N.find(n=>/mei/i.test(n.id||n.name))||N[0]; KGAME.dbg().openDlg(n); 1"); await sleep(1500); await still(S, 'dialogue'); await rush(R, '11-dialogue', 4); await js('KGAME.dbg().closeDlg(); 1'); },
};
async function kunai(only) {
  const R = join(ROOT, 'appstore', 'rushes', 'kunai-gaiden'), S = join(ROOT, 'appstore', 'stills', 'kunai-gaiden'); console.log('Kunai Gaiden');
  await kunaiBoot(10);
  for (const [k, f] of Object.entries(KS)) if (only.length ? only.includes(k) : k !== 'probe') { console.log(' ', k); try { await f(R, S); } catch (e) { console.error('  ', k, 'FAILED', e.message); } }
}

/* ========================= Braise ========================= */
const BURL = 'http://localhost:8796/ios/Braise/Web/index.html?touch=1&shots=1';
const D = expr => js(`BRAISE_DEV.${expr}; 1`), T = expr => js(`BRAISE_TOUCH.${expr}; 1`);
async function braiseBoot() {
  await open(BURL); await js('localStorage.clear()'); await open(BURL); await sleep(2500);
  await js("[...document.querySelectorAll('button')].find(b=>/réveiller/i.test(b.textContent)).click()"); await sleep(4500);
}
const BS = {
  'reveil': async (R, S) => { await open(BURL); await js('localStorage.clear()'); await open(BURL); await sleep(2500); await still(S, 'titre');
    await rush(R, '01-reveil-aube', 7, async () => { await sleep(300); await js("[...document.querySelectorAll('button')].find(b=>/réveiller/i.test(b.textContent)).click()"); }); await still(S, 'reveil'); },
  'recolte': async (R, S) => { await rush(R, '02-recolte', 9, async () => { for (let i = 0; i < 4; i++) { await T('autoAct()'); await sleep(2100); } }); await still(S, 'recolte'); },
  'atelier': async (R, S) => { await D("give('twigs',8)"); await D("give('flint',4)"); await D("give('grass',8)"); await D("give('log',4)"); await D("give('rocks',6)");
    await D("craft('tools')"); await sleep(800); await still(S, 'atelier'); await rush(R, '03-atelier', 4); await D('craft(null)'); },
  'premier-feu': async (R, S) => { await D('time(.6)'); await sleep(600); await rush(R, '04-premier-feu', 6, async () => { await sleep(1200); await D('fire(80,10)'); }); await still(S, 'premier-feu'); },
  'savane': async (R, S) => { await D('time(.3)'); await D('zoom(.8)'); await sleep(600); await rush(R, '05-savane-exploration', 8, async () => {
    for (const [fx, fy] of [[.8, .35], [.75, .6], [.3, .7]]) { await js(`const c=document.getElementById('c'),r=c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('pointerdown',{clientX:r.left+r.width*${fx},clientY:r.top+r.height*${fy},button:0,pointerType:'touch',bubbles:true})); 1`); await sleep(2600); } });
    await still(S, 'savane'); await D('zoom(1)'); },
  'coucher-nuit': async (R, S) => { await D('fire(70,10)'); await rush(R, '06-coucher-puis-nuit', 8, async () => { for (let i = 0; i < 60; i++) { await D(`time(${.5 + i * .006})`); await sleep(120); } }); await still(S, 'coucher'); },
  'hyenes': async (R, S) => { await D('time(.82)'); await D('fire(60,0)'); await D('hyenas(5,175)'); await sleep(700); await still(S, 'hyenes');
    await rush(R, '07-nuit-hyenes-feu', 8, async () => { await sleep(2500); await T('attackNearest()'); await sleep(2500); await T('attackNearest()'); }); },
};
async function braise(only) {
  const R = join(ROOT, 'appstore', 'rushes', 'braise'), S = join(ROOT, 'appstore', 'stills', 'braise'); console.log('Braise');
  await braiseBoot();
  for (const [k, f] of Object.entries(BS)) if (!only.length || only.includes(k)) { console.log(' ', k); try { await f(R, S); } catch (e) { console.error('  ', k, 'FAILED', e.message); } }
}

try { const [which, ...only] = process.argv.slice(2); if (which === 'kunai') { W = 960; H = 443; DSF = 2; } await connect(); if (!which || which === 'kunai') await kunai(only); if (!which || which === 'braise') await braise(only); }
catch (e) { console.error('ERROR', e.message); process.exitCode = 1; }
finally { try { ws.close(); } catch (e) {} chrome.kill(); }
