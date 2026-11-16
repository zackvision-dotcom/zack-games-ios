/* Kunai Online — ambience: procedural feudal-Japan music (koto, shakuhachi, taiko), wind and rain beds,
   footsteps per surface, thunder, and the weather (clear → clouds → rain → storm with lightning).
   Everything is synthesized with WebAudio; nothing is downloaded. */
window.KAMB = (() => {
  let ac = null, master, music, sfxG, amb, windG, windF, rainG, unlocked = false, muted = false;
  const NOTES = { B3: 246.94, E4: 329.63, B4: 493.88, E5: 659.25, D3: 146.83, A3: 220, D4: 293.66, Eb4: 311.13, G4: 392, A4: 440, Bb4: 466.16, D5: 587.33, Eb5: 622.25, G5: 783.99, A5: 880, Bb5: 932.33 };
  const SCALE = ['D4', 'Eb4', 'G4', 'A4', 'Bb4', 'D5', 'Eb5', 'G5', 'A5'];   // miyako-bushi (In scale) on D
  function noiseBuf(sec) { const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function loop(buf, filterType, freq, q, out) { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; const f = ac.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q || .7; const gg = ac.createGain(); gg.gain.value = 0; s.connect(f); f.connect(gg); gg.connect(out); s.start(); return { g: gg, f }; }
  function init() { if (ac) return true; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    master = ac.createGain(); master.gain.value = muted ? 0 : .9; master.connect(ac.destination);
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(master);
    // a small room reverb for the instruments
    const rev = ac.createConvolver(), L = ac.sampleRate * 2.2, ir = ac.createBuffer(2, L, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 3.2); } rev.buffer = ir;
    const revG = ac.createGain(); revG.gain.value = .32; rev.connect(revG); revG.connect(comp);
    music = ac.createGain(); music.gain.value = .55; music.connect(comp); music.connect(rev);
    sfxG = ac.createGain(); sfxG.gain.value = .9; sfxG.connect(comp);
    amb = ac.createGain(); amb.gain.value = .8; amb.connect(comp);
    const nb = noiseBuf(4); const w = loop(nb, 'bandpass', 420, .6, amb); windG = w.g; windF = w.f; const r = loop(nb, 'highpass', 2600, .4, amb); rainG = r.g;
    const r2 = loop(noiseBuf(3), 'lowpass', 900, .5, amb); rainLow = r2.g;
    return true; }
  let rainLow = null;
  const unlock = () => { if (!init()) return; if (ac.state === 'suspended') ac.resume(); unlocked = true; };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, unlock, { passive: true }));

  /* ---------- instruments ---------- */
  const ksCache = {};
  function kotoBuf(f) { const key = Math.round(f); if (ksCache[key]) return ksCache[key]; const sr = ac.sampleRate, N = Math.round(sr / f), len = sr * 2.2, b = ac.createBuffer(1, len, sr), d = b.getChannelData(0), ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = (Math.random() * 2 - 1) * (i < N * .5 ? 1 : .6); let p = 0;
    for (let i = 0; i < len; i++) { const nx = (p + 1) % N, v = ring[p]; d[i] = v; ring[p] = (v + ring[nx]) * .4975; p = nx; } return (ksCache[key] = b); }
  let detune = 0;   // 0..1: the festival music goes sour when the lanterns turn black
  function koto(t, note, vel) { const s = ac.createBufferSource(); s.buffer = kotoBuf(NOTES[note]); if (detune) s.playbackRate.value = 1 + (Math.random() - .5) * detune * .12 - detune * .05; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3200; const g = ac.createGain(); g.gain.value = (vel || .5) * .55; s.connect(f); f.connect(g); g.connect(music); s.start(t); s.stop(t + 2.2); }
  function flute(t, note, dur, vel) { const f0 = NOTES[note], o = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f0; o2.frequency.value = f0 * 2; lfo.frequency.value = 5.2; lg.gain.value = f0 * .006; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    const g2 = ac.createGain(); g2.gain.value = .12; o2.connect(g2); g2.connect(lp); o.connect(lp); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(g); g.connect(music);
    const v = (vel || .5) * .16; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .28); g.gain.setValueAtTime(v, t + dur - .35); g.gain.linearRampToValueAtTime(0, t + dur);
    // pitch bend into the note (meri) and breath noise
    o.frequency.setValueAtTime(f0 * .97, t); o.frequency.linearRampToValueAtTime(f0, t + .22);
    const br = ac.createBufferSource(); br.buffer = noiseBuf(dur + .1); const bf = ac.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = f0 * 2.5; bf.Q.value = 2; const bg = ac.createGain(); bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(v * .35, t + .1); bg.gain.linearRampToValueAtTime(v * .08, t + .5); bg.gain.linearRampToValueAtTime(0, t + dur);
    br.connect(bf); bf.connect(bg); bg.connect(music);
    for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur + .05); } br.start(t); br.stop(t + dur + .1); }
  function taiko(t, vel, high) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(high ? 190 : 78, t); o.frequency.exponentialRampToValueAtTime(high ? 120 : 42, t + .35);
    g.gain.setValueAtTime((vel || .7) * (high ? .3 : .85), t); g.gain.exponentialRampToValueAtTime(.001, t + (high ? .18 : .6)); o.connect(g); g.connect(music); o.start(t); o.stop(t + .7);
    const n = ac.createBufferSource(); n.buffer = noiseBuf(.15); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = high ? 2500 : 380; const ng = ac.createGain(); ng.gain.setValueAtTime((vel || .7) * .35, t); ng.gain.exponentialRampToValueAtTime(.001, t + .12); n.connect(f); f.connect(ng); ng.connect(music); n.start(t); }

  /* ---------- the score: calm exploration ↔ combat drums ---------- */
  let nextT = 0, step16 = 0, mode = 'explore', wantMode = 'explore', melIdx = 4, fluteCD = 0, quiet = 0, forced = null, thIdx = 0, thWait = 0;
  const YO = ['D4', 'E4', 'G4', 'A4', 'B4', 'D5', 'E5'];
  const THEME = [['A4', 4], ['Bb4', 2], ['A4', 2], ['G4', 4], ['Eb4', 2], ['D4', 6], ['G4', 4], ['A4', 2], ['Bb4', 2], ['D5', 6], ['Bb4', 2], ['A4', 4], ['G4', 4], ['A4', 10]];   // Sayo's theme (original)
  function schedule() { if (!unlocked || muted) return; const now = ac.currentTime; if (nextT < now) nextT = now + .1;
    while (nextT < now + .25) { const bpm = mode === 'combat' ? 112 : mode === 'festival' ? 124 : mode === 'theme' ? 64 : 70, dt = 60 / bpm / 4, s = step16 % 64;
      if (mode === 'silence') { }
      else if (mode === 'theme') { if (thWait <= 0) { const [n, d] = THEME[thIdx % THEME.length]; koto(nextT, n, .5); if (d >= 4) flute(nextT, n, dt * d * .95, .42); thWait = d; thIdx++; if (thIdx % THEME.length === 0) thWait += 8; } thWait--; if (s % 16 === 0) koto(nextT, 'D3', .3); }
      else if (mode === 'festival') { if (s % 2 === 0 && Math.random() < .8) { melIdx = Math.max(0, Math.min(YO.length - 1, melIdx + [-1, -1, 1, 1, 2, -2, 0][(Math.random() * 7) | 0])); koto(nextT, YO[melIdx], .32 + Math.random() * .2); }
        if (s % 4 === 2) taiko(nextT, .3, true); if (s % 8 === 0) taiko(nextT, .45); if (s % 16 === 0) { koto(nextT, 'D3', .4); koto(nextT + dt, 'A3', .3); }
        if (s === 0 && Math.random() < .7) { let tt = nextT; for (let i = 0; i < 4; i++) { const n = YO[2 + ((Math.random() * 5) | 0)], d = dt * 4; flute(tt, n, d * .9, .35); tt += d; } } }
      else if (mode === 'explore') {
        if (s % 4 === 0 && Math.random() < (quiet > 0 ? .25 : .55)) { melIdx = Math.max(0, Math.min(SCALE.length - 1, melIdx + [-2, -1, -1, 1, 1, 2, 0][(Math.random() * 7) | 0])); koto(nextT, SCALE[melIdx], .35 + Math.random() * .3); if (Math.random() < .25) koto(nextT + dt * 2, SCALE[Math.max(0, melIdx - 1)], .25); }
        if (s === 0 || s === 32) { koto(nextT, 'D3', .45); koto(nextT + dt, 'A3', .3); koto(nextT + dt * 2, 'D4', .28); }
        if (s === 16 && Math.random() < .4) taiko(nextT, .25);
        if (s === 0 && --fluteCD <= 0 && Math.random() < .6) { fluteCD = 2; let tt = nextT + dt * 4; for (let i = 0; i < 3; i++) { const n = SCALE[3 + ((Math.random() * 5) | 0)], d = dt * (8 + ((Math.random() * 3) | 0) * 4); flute(tt, n, d, .5); tt += d + dt * 2; } }
      } else {
        if ([0, 6, 8, 14].includes(s % 16)) taiko(nextT, s % 16 === 0 ? .95 : .65); if (s % 2 === 0) taiko(nextT, .22, true);
        if (s % 4 === 0) koto(nextT, ['D3', 'A3', 'Eb4', 'A3'][(s / 4) % 4], .5); if (s % 32 === 24) { koto(nextT, 'D5', .5); koto(nextT + dt, 'Eb5', .45); koto(nextT + dt * 2, 'D5', .4); }
      }
      nextT += dt; step16++;
      const want = forced || wantMode; if ((forced && mode !== forced) || (step16 % 16 === 0 && mode !== want)) { mode = want; step16 = 0; thIdx = 0; thWait = 0; } } }
  setInterval(schedule, 60);

  /* ---------- one-shot effects ---------- */
  function burst(t, dur, type, freq, q, vol, out) { const n = ac.createBufferSource(); n.buffer = noiseBuf(dur + .05); const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1; const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); n.connect(f); f.connect(g); g.connect(out || sfxG); n.start(t); n.stop(t + dur + .05); }
  function step(surface, run) { if (!unlocked || muted) return; const t = ac.currentTime, v = run ? 1 : .7;
    if (surface === 'water') { burst(t, .22, 'bandpass', 1300 + Math.random() * 500, 1.2, .22 * v); burst(t + .03, .3, 'lowpass', 500, .7, .12 * v); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(500 + Math.random() * 300, t); o.frequency.exponentialRampToValueAtTime(1400, t + .08); g.gain.setValueAtTime(.04, t); g.gain.exponentialRampToValueAtTime(.001, t + .1); o.connect(g); g.connect(sfxG); o.start(t); o.stop(t + .12); }
    else if (surface === 'stone') { burst(t, .05, 'highpass', 2500, .8, .2 * v); burst(t, .08, 'bandpass', 900, 2, .1 * v); }
    else if (surface === 'wood') { burst(t, .07, 'bandpass', 550, 3, .25 * v); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 170; g.gain.setValueAtTime(.08 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .09); o.connect(g); g.connect(sfxG); o.start(t); o.stop(t + .1); }
    else if (surface === 'dirt') burst(t, .09, 'bandpass', 1000 + Math.random() * 300, .9, .16 * v);
    else burst(t, .12, 'bandpass', 2200 + Math.random() * 700, .6, .09 * v);                        // grass: a soft swish
  }
  function thunder(dist) { if (!unlocked || muted) return; const t = ac.currentTime + dist; burst(t, .25, 'lowpass', 1800, .7, .5); const n = ac.createBufferSource(); n.buffer = noiseBuf(4); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(90, t + 3.5);
    const g = ac.createGain(); g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.9 / (1 + dist), t + .12); g.gain.exponentialRampToValueAtTime(.001, t + 3.8); n.connect(f); f.connect(g); g.connect(amb); n.start(t); n.stop(t + 4); }
  const ctx = () => (unlocked ? ac : null), out = () => sfxG;

  /* ---------- weather ---------- */
  const W = { state: 'clear', t: 0, dur: 70, rain: 0, dark: 0, wind: 1, flash: 0, clouds: 0, target: { rain: 0, dark: 0, wind: 1, clouds: .1 } };
  const STATES = { clear: { rain: 0, dark: 0, wind: 1, clouds: .1, dur: [80, 160], next: () => Math.random() < .7 ? 'cloudy' : 'clear' },
    cloudy: { rain: 0, dark: .12, wind: 1.5, clouds: .7, dur: [35, 70], next: () => Math.random() < .65 ? 'rain' : 'clear' },
    rain: { rain: .65, dark: .24, wind: 1.9, clouds: .9, dur: [40, 90], next: () => Math.random() < .35 ? 'storm' : 'cloudy' },
    storm: { rain: 1, dark: .42, wind: 3.1, clouds: 1, dur: [30, 60], next: () => 'rain' } };
  // a region can restrict the weather to its own climate (Amegakure: rain and storms only); the first state applies at once
  let climate = null;
  function setClimate(c) { climate = c && c.length ? c : null; if (!climate) return; setWeather(climate[0]); for (const key of ['rain', 'dark', 'wind', 'clouds']) W[key] = W.target[key]; }
  function setWeather(s) { W.state = s; W.t = 0; const S = STATES[s]; W.dur = S.dur[0] + Math.random() * (S.dur[1] - S.dur[0]); W.target = S; }
  const drops = [], splashes = [];
  function update(dt, o) { // o: { wind (local gust value), trees (visible count), combat, onWater }
    W.t += dt; if (W.t > W.dur) { const n = STATES[W.state].next(); setWeather(climate && !climate.includes(n) ? climate[(Math.random() * climate.length) | 0] : n); }
    const k = Math.min(1, dt * .12); for (const key of ['rain', 'dark', 'wind', 'clouds']) W[key] += (W.target[key] - W[key]) * k;
    W.flash = Math.max(0, W.flash - dt * 3.2);
    if (W.state === 'storm' && W.rain > .7 && Math.random() < dt * .09) { W.flash = 1; W.flash2 = Math.random() < .5; thunder(.3 + Math.random() * 2); }
    if (window.KGROUND) KGROUND.windAmp = W.wind;
    wantMode = o.combat ? 'combat' : 'explore'; quiet = Math.max(W.rain, (o.night || 0) * .6);
    if (!unlocked || muted) return; const t = ac.currentTime;
    // wind you hear follows the gusts that bend the trees you see
    const gust = Math.max(0, (o.wind || 0) + .6) * W.wind, treesK = Math.min(1, (o.trees || 0) / 18) * .7 + .3;
    windG.gain.setTargetAtTime(Math.min(.55, .035 * gust * treesK + .015 * W.wind), t, .25); windF.frequency.setTargetAtTime(300 + gust * 160, t, .4);
    rainG.gain.setTargetAtTime(W.rain * .16, t, .5); rainLow.gain.setTargetAtTime(W.rain * .12, t, .5);
    music.gain.setTargetAtTime(.55 * (1 - W.rain * .35), t, 1); }
  function drawWeather(g, w, h, dpr, t, camDX) {
    if (W.dark > .01) { g.fillStyle = `rgba(22,30,52,${W.dark})`; g.fillRect(0, 0, w, h); }
    // rain streaks (screen space), slanted by the wind, plus splashes on the ground
    const want = Math.round(W.rain * 420 * (w * h) / (1280 * 720)); while (drops.length < want) drops.push({ x: Math.random() * w, y: Math.random() * h, v: .8 + Math.random() * .5, l: 12 + Math.random() * 16 }); drops.length = Math.min(drops.length, want);
    if (drops.length) { const sl = .22 + W.wind * .12; g.strokeStyle = 'rgba(205,220,240,.55)'; g.lineWidth = 1.1 * dpr; g.beginPath();
      for (const d of drops) { d.y += d.v * 22 * dpr; d.x += d.v * 22 * sl * dpr - (camDX || 0); if (d.y > h) { d.y = -20; d.x = Math.random() * w * 1.2 - w * .1; if (Math.random() < .5) splashes.push({ x: Math.random() * w, y: Math.random() * h, t: 0 }); } if (d.x > w) d.x -= w; if (d.x < 0) d.x += w;
        g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * sl * dpr, d.y - d.l * dpr); } g.stroke(); }
    for (let i = splashes.length - 1; i >= 0; i--) { const s = splashes[i]; s.t += .05; if (s.t > 1) { splashes.splice(i, 1); continue; } g.strokeStyle = `rgba(220,235,250,${.5 * (1 - s.t)})`; g.lineWidth = dpr; g.beginPath(); g.ellipse(s.x, s.y, (2 + s.t * 7) * dpr, (1 + s.t * 3) * dpr, 0, 0, 6.3); g.stroke(); }
    if (W.flash > 0) { g.fillStyle = `rgba(235,240,255,${W.flash * (W.flash2 ? .55 : .35)})`; g.fillRect(0, 0, w, h); } }
  // drifting cloud shadows on the world (world space, called by the map before the weather overlay)
  function drawClouds(g, vx0, vy0, vw, vh, t, PM) { if (W.clouds < .05) return; g.save(); g.globalAlpha = W.clouds * .22; const sp = 2.2 * W.wind;
    for (let i = 0; i < 9; i++) { const R = (40 + (i * 37) % 50) * PM, x = ((i * 913 + t * sp * PM) % (vw + 2 * R)) + vx0 - R, y = vy0 + ((i * 577) % 100) / 100 * vh, gr = g.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, 'rgba(20,30,40,1)'); gr.addColorStop(1, 'rgba(20,30,40,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); } g.restore(); }
  setWeather('clear'); W.t = 50;
  // cinematic cues
  function hit(v) { if (!unlocked || muted) return; const t = ac.currentTime; taiko(t, v || 1.2); burst(t, .9, 'lowpass', 200, .7, .5, music); }
  function heart() { if (!unlocked || muted) return; const t = ac.currentTime; for (const [d, v] of [[0, .9], [.22, .6]]) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(62, t + d); o.frequency.exponentialRampToValueAtTime(38, t + d + .18); g.gain.setValueAtTime(v * .6, t + d); g.gain.exponentialRampToValueAtTime(.001, t + d + .25); o.connect(g); g.connect(sfxG); o.start(t + d); o.stop(t + d + .3); } }
  function swell(sec) { if (!unlocked || muted) return; const t = ac.currentTime; for (const f of [146.83, 220, 293.66, 440]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(200, t); lp.frequency.exponentialRampToValueAtTime(3000, t + sec);
      g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.05, t + sec); g.gain.exponentialRampToValueAtTime(.001, t + sec + 1.5); o.connect(lp); lp.connect(g); g.connect(music); o.start(t); o.stop(t + sec + 1.6); } }
  const score = m => { forced = m; }, setDetune = v => { detune = v; }, mix = (amb0, music0) => { if (!ac) return; const t = ac.currentTime; if (amb0 !== undefined) amb.gain.setTargetAtTime(amb0, t, .3); if (music0 !== undefined) music.gain.setTargetAtTime(music0, t, .3); };
  return { hit, heart, swell, score, setDetune, mix, update, drawWeather, drawClouds, step, thunder, ctx, out, setMuted: m => { muted = m; if (master) master.gain.value = m ? 0 : .9; }, weather: W, setWeather, setClimate, label: () => ({ clear: 'Ciel dégagé', cloudy: 'Nuageux', rain: 'Pluie', storm: 'Orage' })[W.state] };
})();
