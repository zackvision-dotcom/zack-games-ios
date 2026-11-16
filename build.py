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
    io.open(os.path.join(web, 'index.html'), 'w', encoding='utf-8', newline='\n').write(s)
    shutil.copy(os.path.join(src, 'ere1', 'art.js'), web); shutil.copy(os.path.join(src, 'i18n.css'), web)
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
