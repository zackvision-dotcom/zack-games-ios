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
    d = os.path.join(ROOT, 'games', 'braise')
    s = io.open(os.path.join(d, 'braise-artifact.html'), encoding='utf-8').read()
    t = io.open(os.path.join(d, 'touch-braise.js'), encoding='utf-8').read()
    s = s.replace('</body></html>', '<script>' + t + '</script>\n</body></html>', 1) if '</body></html>' in s else s + '<script>' + t + '</script>'
    io.open(out('Braise'), 'w', encoding='utf-8', newline='\n').write(s); print('Braise', len(s.encode()) // 1024, 'kB')

which = sys.argv[1:] or ['kunai', 'braise']
if 'kunai' in which: kunai()
if 'braise' in which: braise()
