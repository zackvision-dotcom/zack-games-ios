// App Store screenshots (iPhone 6.9", landscape 2868 x 1320) taken in a headless Chrome driven over the DevTools protocol.
// Needs the local server on :8796 serving this folder. Usage: node tools/shots.mjs [kunai|braise]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), PORT = 9333, W = 1434, H = 660;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'shots-'))}`, '--hide-scrollbars', '--mute-audio', '--no-first-run', 'about:blank'], { stdio: 'ignore' });

let ws, id = 0; const pending = new Map();
const cmd = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + method + ' ' + JSON.stringify(params).slice(0, 120))); } }, 60000); });
const js = async expr => { const r = await cmd('Runtime.evaluate', { expression: '{' + expr + '\n}', awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '')); return r.result.value; };
async function shot(dir, name) { const r = await cmd('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false, optimizeForSpeed: true }); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, name + '.png'), Buffer.from(r.data, 'base64')); console.log('  ', name); }

async function connect() {
  for (let i = 0; i < 50; i++) { try { const t = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = t.find(x => x.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch (e) {} await sleep(200); }
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await cmd('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }] });
}
const open = async url => { await cmd('Page.navigate', { url }); await sleep(1500); };
const until = async (expr, ms = 60000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await js(expr).catch(() => false)) return true; await sleep(300); } throw new Error('timeout: ' + expr); };

async function kunai() {
  const out = join(ROOT, 'appstore', 'kunai-gaiden'); console.log('Kunai Gaiden');
  await open('http://localhost:8796/ios/KunaiGaiden/Web/index.html?touch=1');
  await js('localStorage.clear()'); await open('http://localhost:8796/ios/KunaiGaiden/Web/index.html?touch=1');
  await until("document.querySelector('#k-new') && !document.querySelector('#k-new').disabled");
  await sleep(4500); await shot(out, '1-titre');
  // a levelled hero, straight into the village (the cheat button is hidden in the app, its code still runs here)
  console.log('  max account'); await js("window.confirm=()=>true; setTimeout(()=>document.querySelector('#k-max').click(),10); 1"); await sleep(5000); console.log('  continue');
  await until("document.querySelector('#k-cont') && !document.querySelector('#k-cont').disabled"); await js("document.querySelector('#k-cont').click()");
  await until('window.KGAME && KGAME.isStarted && KGAME.isStarted()'); await sleep(3500);
  await js("const h=__k.hero; h.x=2; h.y=40; __k.snap()"); await sleep(3000); await shot(out, '2-village');
  // a fight at the gate: wolves and bandits around the hero, a technique in the air
  await js("const h=__k.hero; h.x=0; h.y=160; __k.snap(); const E=KGAME.ext; for(let i=0;i<7;i++){const a=i/7*6.28; E.spawn(i%2?'bandit':'wolf',h.x+Math.cos(a)*4.5,h.y+Math.sin(a)*3.2);}"); await sleep(1500);
  await js("for (const k of ['l','j']) { dispatchEvent(new KeyboardEvent('keydown',{key:k})); setTimeout(()=>dispatchEvent(new KeyboardEvent('keyup',{key:k})),80); }"); await sleep(450); await shot(out, '3-combat');
  await sleep(1500); await js("dispatchEvent(new KeyboardEvent('keydown',{key:'o'})); setTimeout(()=>dispatchEvent(new KeyboardEvent('keyup',{key:'o'})),80)"); await sleep(350); await shot(out, '4-technique');
  await js("KGAME.dbg().openPanel('jutsu')"); await sleep(1200); await shot(out, '5-jutsus');
  await js("KGAME.dbg().openPanel('bag')"); await sleep(1200); await shot(out, '6-sac');
  await js("KGAME.dbg().closePanel(); localStorage.clear()");
}

async function braise() {
  const out = join(ROOT, 'appstore', 'braise'); console.log('Braise');
  const url = 'http://localhost:8796/ios/Braise/Web/index.html';
  await open(url); await js('localStorage.clear()'); await open(url); await sleep(4500); await shot(out, '1-titre');
  await js("[...document.querySelectorAll('button')].find(b=>/réveiller/i.test(b.textContent)).click()"); await sleep(6000); await shot(out, '2-reveil');
  const tap = async (fx, fy) => { await js(`(() => { const c = document.getElementById('c'), r = c.getBoundingClientRect(), x = r.left + r.width * ${fx}, y = r.top + r.height * ${fy}; c.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, button: 0, pointerType: 'touch', bubbles: true })); })()`); };
  await tap(.75, .4); await sleep(4000); await shot(out, '3-savane');
  await tap(.25, .7); await sleep(4000); await shot(out, '4-exploration');
  await js("dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}))"); await sleep(2500); await shot(out, '5-recolte');
  await js("localStorage.clear()");
}

try { await connect(); const which = process.argv[2]; if (!which || which === 'kunai') await kunai(); if (!which || which === 'braise') await braise(); }
catch (e) { console.error('ERROR', e.message); process.exitCode = 1; }
finally { try { ws.close(); } catch (e) {} chrome.kill(); }
