"""Builds the single-file web game embedded in each iOS app: ios/<App>/Web/index.html.
   python build.py            -> both games
   python build.py kunai      -> Kunai Gaiden only (inlines every script of games/kunai-gaiden/src)
   python build.py braise     -> Braise only (the original page + the touch controls)"""
import io, os, re, sys, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__))
def out(app): d = os.path.join(ROOT, 'ios', app, 'Web'); os.makedirs(d, exist_ok=True); return os.path.join(d, 'index.html')

def kunai():
    src = os.path.join(ROOT, 'games', 'kunai-gaiden', 'src')
    s = io.open(os.path.join(src, 'konoha-full.html'), encoding='utf-8').read()
    for f in re.findall(r'<script src="([^"]+)"></script>', s):
        s = s.replace(f'<script src="{f}"></script>', '<script>' + io.open(os.path.join(src, f), encoding='utf-8').read() + '</script>')
    # the painted logo (art/kunai-gaiden) on the title screen, embedded as a data URI
    import base64
    logo = base64.b64encode(open(os.path.join(ROOT, 'games', 'kunai-gaiden', 'logo.webp'), 'rb').read()).decode()
    h1 = '<h1>Kunai Gaiden<em>Le village d’Aozora</em></h1>'; assert h1 in s
    s = s.replace(h1, f'<h1><img class="k-logo" src="data:image/webp;base64,{logo}" alt="Kunai Gaiden"><em>Le village d’Aozora</em></h1>')
    s = s.replace('</head>', '<style>#k-title h1 .k-logo{display:block;width:min(460px,72vw);height:auto;margin:0 auto -4px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))}</style></head>', 1)
    io.open(out('KunaiGaiden'), 'w', encoding='utf-8', newline='\n').write(s); print('Kunai Gaiden', len(s.encode()) // 1024, 'kB')

def braise():
    """Braise (ère I), the original game from braise-etincelle-zack.publybordeaux.chatgpt.site: index + art + i18n + fonts.
    In the app the 29 translations are bundled in locales.js (a page loaded from the app cannot fetch() its own files)."""
    import json, shutil
    src = os.path.join(ROOT, 'games', 'braise-v1'); web = os.path.dirname(out('Braise'))
    shutil.rmtree(web, ignore_errors=True); os.makedirs(web)
    s = io.open(os.path.join(src, 'ere1', 'index.html'), encoding='utf-8').read()
    i = s.find("<script>(function(){function c(){var b=a.contentDocument")   # the hosting site's Cloudflare beacon
    if i >= 0: s = s[:i] + s[s.find('</script>', i) + 9:]
    s = s.replace('BRAISE · Ère I — développement', 'Braise · L’Étincelle').replace(' Version de développement.', '')
    s = s.replace('"../', '"').replace('<script src="i18n.js" defer></script>', '<script src="locales.js"></script><script src="i18n.js" defer></script>')
    # the painted logo (art/braise) instead of the plain "Braise" title
    h1 = '<h1>Braise</h1>'; assert h1 in s
    s = s.replace(h1, '<h1><img src="logo.webp" alt="Braise · Étincelle" style="display:block;height:min(26vh,180px);width:auto;max-width:62vw;margin:0 auto;filter:drop-shadow(0 4px 14px rgba(0,0,0,.85))"></h1>')
    shutil.copy(os.path.join(src, 'logo.webp'), web)
    s = s.replace('</head>', '<style>@media (max-height:560px),(pointer:coarse){#title .keys{display:none}}</style></head>', 1)
    # touch controls (touch.js): the game script exposes the few actions the keyboard/right click give on a computer
    boot = 'setTimeout(boot,30);\n})();'; assert s.count(boot) == 1
    # the eight eras + Mode Deus (eras.js), inside the game's closure so it can wrap the engine's functions
    eras = io.open(os.path.join(src, 'eras.js'), encoding='utf-8').read()
    s = s.replace(boot, eras + chr(10) + boot, 1)
    # AdMob (ads.js, iOS app only: does nothing without the native "ads" handler), also inside the closure
    s = s.replace(boot, io.open(os.path.join(src, 'ads.js'), encoding='utf-8').read() + chr(10) + boot, 1)
    assert s.count('<script src="art.js"></script>') == 1
    s = s.replace('<script src="art.js"></script>', '<script src="art.js"></script><script src="eras-art.js"></script>')
    s = s.replace(boot, "window.BRAISE_TOUCH={autoAct,attackNearest,dropSlot,toggleCraft:()=>{openTab=openTab?null:'tools';renderRecipes();},"
                  "cancel:()=>{placing=null;P.target=null;},state:()=>({mode,paused,dead:P.dead,placing:!!placing,items:P.items.filter(Boolean).map(s=>s.id+':'+s.n).join(' ')}),"
                  "zoom:f=>{userZoom=clamp(userZoom*f,.7,1.45);}};\n"
                  # staging for App Store screenshots and trailers only (tools/shots.mjs opens the page with ?shots=1, the BETA IA
                  # player with ?beta=ia; the app never does either)
                  "if(/[?&](shots=1|beta=ia)/.test(location.search))window.BRAISE_DEV={P:()=>P,mobs:()=>mobs,statics:()=>statics,fires:()=>fires,W2S,sfx,"
                  "mode:()=>mode,paused:()=>paused,day:()=>dayNum(),frac:()=>dayFrac(),placing:()=>placing,time:f=>{gameTime=DAY_LEN*(dayNum()-1+f);lastDay=dayNum();dayBanner=null;},"
                  "give:(id,n)=>{addItem(id,n||1,P.x,P.y);invDirty=true;},fire:(dx,dy)=>mk('campfire',P.x+(dx||70),P.y+(dy||10),{fuel:85,max:90}),"
                  "hyenas:(n,r)=>{r=r||260;for(let i=0;i<n;i++){const a=i/n*6.28+.4,h={x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r*.65};const m=newHyena(h);if(m){m.x=h.x;m.y=h.y;mobs.push(m);}}},"
                  "craft:t=>{openTab=t;renderRecipes();},zoom:z=>{userZoom=z;}};\n" + boot + '\n</script>\n<script src="touch.js"></script>\n<script>', 1)
    shutil.copy(os.path.join(src, 'touch.js'), web)
    # BETA IA (simulated player for in-game captures, ?beta=ia only, never in the app): the shared core first, the scenes last
    head = '<head><meta charset="utf-8">'; assert s.count(head) == 1 and s.count('</body>') == 1
    s = s.replace(head, head + '<script src="beta.js"></script>', 1).replace('</body>', '<script src="beta-game.js"></script></body>', 1)
    for f in ('beta.js', 'beta-game.js'): shutil.copy(os.path.join(src, f), web)
    io.open(os.path.join(web, 'index.html'), 'w', encoding='utf-8', newline='\n').write(s)
    shutil.copy(os.path.join(src, 'ere1', 'art.js'), web); shutil.copy(os.path.join(src, 'i18n.css'), web)
    # the eras' own art (heirs, fauna, flora, places, ground) and the canonical landmarks of the lineage (ref/landmarks.js),
    # bundled after art.js; landmarks.js expects the ink helpers as globals, so it gets them from BRAISE_ART.K
    parts = [io.open(os.path.join(src, 'eras', 'heirs-kit.js'), encoding='utf-8').read()]
    for f in sorted(os.listdir(os.path.join(src, 'eras'))):
        if f.startswith('era') and f.endswith('-art.js'): parts.append(io.open(os.path.join(src, 'eras', f), encoding='utf-8').read())
    lm = io.open(os.path.join(src, 'ref', 'landmarks.js'), encoding='utf-8').read()
    parts.append('(function(){const {TAU,INK,ell,ink,fillInk,poly,smoothPath,blobPts,line,curve,inkLine,inkCurve,lineageMark,mulberry,vnoise,lerp}=BRAISE_ART.K;const burningTree=function(){};' + chr(10) + lm + chr(10) + '})();')
    io.open(os.path.join(web, 'eras-art.js'), 'w', encoding='utf-8', newline=chr(10)).write(chr(10).join(parts))
    shutil.copytree(os.path.join(src, 'fonts'), os.path.join(web, 'fonts'))
    i18n = io.open(os.path.join(src, 'i18n.js'), encoding='utf-8').read()
    a = "const response=await fetch(new URL('locales/'+code+'.json',root));if(!response.ok)throw Error('Locale unavailable');cache[code]=await response.json();"
    assert a in i18n; i18n = i18n.replace(a, "if(!(window.BRAISE_LOCALES&&BRAISE_LOCALES[code]))throw Error('Locale unavailable');cache[code]=BRAISE_LOCALES[code];")
    io.open(os.path.join(web, 'i18n.js'), 'w', encoding='utf-8', newline='\n').write(i18n)
    loc = {}
    for f in os.listdir(os.path.join(src, 'locales')):
        try: loc[f[:-5]] = json.load(io.open(os.path.join(src, 'locales', f), encoding='utf-8'))
        except Exception: pass   # 'fr' is the source language: no file
    io.open(os.path.join(web, 'locales.js'), 'w', encoding='utf-8').write('window.BRAISE_LOCALES=' + json.dumps(loc, ensure_ascii=False) + ';')
    print('Braise', len(s.encode()) // 1024, 'kB +', len(loc), 'langues')

which = sys.argv[1:] or ['kunai', 'braise']
if 'kunai' in which: kunai()
if 'braise' in which: braise()
