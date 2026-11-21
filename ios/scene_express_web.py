"""Packs the Scène Express web app (Vite build of the Webmaster) for the iOS shell.
WKWebView loads the page from a local file, and ES module scripts are not fetched from file:// URLs,
so the JS and CSS bundles are inlined into one index.html (no import() in the bundle, so this is safe).
Usage: python ios/scene_express_web.py [path/to/dist]"""
import io, os, re, sys, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
DIST = sys.argv[1] if len(sys.argv) > 1 else r'C:\Users\admin\Documents\ZVisionAI\app-artistes\mvp\app\dist'
OUT = os.path.join(HERE, 'SceneExpress', 'Web')
html = io.open(os.path.join(DIST, 'index.html'), encoding='utf-8').read()
def js(m):
    code = io.open(os.path.join(DIST, m.group(1)), encoding='utf-8').read().replace('</script', '<\\/script')
    return '<script type="module">' + code + '</script>'
def css(m):
    return '<style>' + io.open(os.path.join(DIST, m.group(1)), encoding='utf-8').read() + '</style>'
html, nj = re.subn(r'<script type="module" crossorigin src="\./([^"]+)"></script>', js, html)
html, nc = re.subn(r'<link rel="stylesheet" crossorigin href="\./([^"]+)">', css, html)
assert nj == 1 and nc == 1, (nj, nc)
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
for name in os.listdir(DIST):   # other static files (images, manifest…) keep their relative paths
    p = os.path.join(DIST, name)
    if name in ('index.html', 'assets'): continue
    (shutil.copytree if os.path.isdir(p) else shutil.copy)(p, os.path.join(OUT, name))
io.open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8', newline='\n').write(html)
print('SceneExpress/Web/index.html', len(html.encode()) // 1024, 'KB')
