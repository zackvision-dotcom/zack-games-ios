// Checks a Braise era in a headless Chrome and screenshots its places.
// Needs a local server serving ios/Braise/Web on :8772. Usage: node tools/era-test.mjs <eraIndex> [outDir]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 9334, W = 852, H = 393, ERA = +(process.argv[2] || 1), OUT = process.argv[3] || join(tmpdir(), 'braise-era-test');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'era-'))}`, '--hide-scrollbars', '--mute-audio', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let ws, id = 0; const pending = new Map(), logs = [];
const cmd = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + method)); } }, 30000); });
const js = async expr => { const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '')); return r.result.value; };
async function shot(name) { const r = await cmd('Page.captureScreenshot', { format: 'png' }); mkdirSync(OUT, { recursive: true }); writeFileSync(join(OUT, name + '.png'), Buffer.from(r.data, 'base64')); console.log('shot', join(OUT, name + '.png')); }
async function connect() {
  for (let i = 0; i < 50; i++) { try { const t = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = t.find(x => x.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch (e) {} await sleep(200); }
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } else if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)); else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('ERR ' + m.params.args.map(a => a.value || a.description).join(' ')); });
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
}
try {
  await connect();
  await cmd('Page.navigate', { url: 'http://localhost:8772/index.html?touch=1' }); await sleep(2500);
  await js('localStorage.clear()'); await cmd('Page.navigate', { url: 'http://localhost:8772/index.html?touch=1' }); await sleep(3000);
  console.log(await js('JSON.stringify({t:document.title,art:typeof BRAISE_ART,eart:typeof BRAISE_ERA_ART,lm:typeof BraiseLandmarkSets,title:!!document.getElementById("title")})')); console.log(logs.join(' | '));
  const t0 = Date.now(); await js(`BRAISE_ERAS.deus(true); BRAISE_ERAS.start(${ERA}); 1`); console.log('start ms', Date.now() - t0);
  await sleep(4000);
  console.log(JSON.stringify(await js('({era:BRAISE_ERAS.era(),places:BRAISE_ERAS.places().map(p=>[p[0],Math.round(p[1]),Math.round(p[2])])})')));
  await shot('era' + ERA + '-0-camp');
  const places = await js('BRAISE_ERAS.places()');
  for (let i = 1; i < places.length; i++) { await js(`(()=>{const p=BRAISE_ERAS.places()[${i}];BRAISE_ERAS.teleport(p[1],p[2]);})()`); await sleep(2200); await shot('era' + ERA + '-' + i + '-' + places[i][0].replace(/[^a-zA-Zéèàù]+/g, '_')); }
  console.log(logs.length ? logs.join('\n') : 'no errors');
} catch (e) { console.error('ERROR', e.message); console.log(logs.join('\n')); process.exitCode = 1; }
finally { try { ws.close(); } catch (e) {} chrome.kill(); }
