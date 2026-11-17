"""OBSOLETE: the icons now come from art/<jeu>/01_icone_app_store.png (ChatGPT artwork). Running this script would overwrite them.
   App icons (1024 x 1024, opaque, no rounded corners: iOS rounds them) drawn with Pillow, supersampled 2x.
   python make_icons.py  ->  <App>/Assets.xcassets/AppIcon.appiconset/icon-1024.png + Contents.json"""
import json, math, os
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); S = 2048

def radial(size, inner, outer, cx=.5, cy=.5, r=.75):
    img = Image.new('RGB', (size, size)); px = img.load()
    for y in range(size):
        for x in range(size):
            d = min(1, math.hypot(x / size - cx, y / size - cy) / r)
            px[x, y] = tuple(int(inner[i] + (outer[i] - inner[i]) * d) for i in range(3))
    return img

def glow(base, xy, r, color, blur):
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0)); ImageDraw.Draw(layer).ellipse([xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r], fill=color)
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))

def kunai():
    img = radial(S // 4, (44, 30, 70), (12, 8, 22), .5, .42, .8).resize((S, S), Image.BICUBIC).convert('RGBA')
    glow(img, (S * .5, S * .44), S * .3, (224, 71, 47, 230), S * .02)          # the red sun
    glow(img, (S * .5, S * .44), S * .4, (255, 140, 60, 70), S * .08)
    d = ImageDraw.Draw(img)
    # a kunai, point up-right, crossing the sun
    a = math.radians(-45); ca, sa = math.cos(a), math.sin(a)
    def P(u, v): cx, cy = S * .5, S * .52; return (cx + u * ca - v * sa, cy + u * sa + v * ca)
    blade = [P(S * .36, 0), P(S * .02, S * .11), P(-S * .04, 0), P(S * .02, -S * .11)]
    d.polygon([(x + 18, y + 26) for x, y in blade], fill=(0, 0, 0, 120))
    d.polygon(blade, fill=(214, 222, 230)); d.polygon([P(S * .36, 0), P(S * .02, S * .11), P(-S * .04, 0)], fill=(150, 160, 172))
    d.line([P(S * .34, 0), P(-S * .02, 0)], fill=(245, 248, 252), width=10)
    for i in range(6):   # wrapped handle
        u = -S * .05 - i * S * .045; d.polygon([P(u, -S * .035), P(u - S * .04, -S * .035), P(u - S * .04, S * .035), P(u, S * .035)], fill=(150, 34, 30) if i % 2 else (190, 50, 40))
    ring = P(-S * .36, 0); d.ellipse([ring[0] - S * .06, ring[1] - S * .06, ring[0] + S * .06, ring[1] + S * .06], outline=(232, 181, 74), width=int(S * .022))
    return img

def braise():
    img = radial(S // 4, (90, 38, 16), (20, 10, 6), .5, .56, .78).resize((S, S), Image.BICUBIC).convert('RGBA')
    glow(img, (S * .5, S * .62), S * .36, (255, 120, 30, 120), S * .1)
    d = ImageDraw.Draw(img)
    def bez(p0, p1, p2, p3, n=30):
        return [((1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0], (1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1]) for t in [i/n for i in range(n+1)]]
    def flame(cx, by, w, h, col, lean=0.):
        tip = (cx + lean * w, by - h)
        right = bez((cx, by), (cx + w * .62, by - h * .05), (cx + w * .42, by - h * .55), tip)
        left = bez(tip, (cx - w * .38, by - h * .5), (cx - w * .62, by - h * .05), (cx, by))
        d.polygon(right + left, fill=col)
    # three nested flames rising from a glowing ember
    for x, w, h, lean in [(.36, .3, .42, -.25), (.64, .3, .44, .25)]: flame(S * x, S * .79, S * w, S * h, (200, 60, 22), lean)
    for w, h, col, lean in [(.56, .7, (216, 74, 26), .05), (.42, .54, (245, 138, 42), -.05), (.28, .38, (255, 194, 74), .06), (.14, .2, (255, 244, 192), 0)]:
        flame(S * .5, S * .8, S * w, S * h, col, lean)
    img2 = img.filter(ImageFilter.GaussianBlur(3)); img = Image.blend(img, img2, .25)
    d = ImageDraw.Draw(img)
    for x, w in [(.32, .2), (.5, .26), (.68, .2)]:   # logs
        d.rounded_rectangle([S * (x - w / 2), S * .78, S * (x + w / 2), S * .86], radius=int(S * .03), fill=(110, 62, 30), outline=(60, 30, 14), width=14)
    for i in range(14):   # sparks
        a = i * 2.4; r = S * (.2 + (i % 5) * .05); x = S * .5 + math.cos(a) * r * .8; y = S * .35 - abs(math.sin(a)) * r * .5
        glow(img, (x, y), S * .012, (255, 200, 90, 255), 4)
    return img

def save(app, img):
    d = os.path.join(HERE, app, 'Assets.xcassets', 'AppIcon.appiconset'); os.makedirs(d, exist_ok=True)
    img.convert('RGB').resize((1024, 1024), Image.LANCZOS).save(os.path.join(d, 'icon-1024.png'))
    json.dump({'images': [{'filename': 'icon-1024.png', 'idiom': 'universal', 'platform': 'ios', 'size': '1024x1024'}], 'info': {'author': 'xcode', 'version': 1}}, open(os.path.join(d, 'Contents.json'), 'w'), indent=2)
    json.dump({'info': {'author': 'xcode', 'version': 1}}, open(os.path.join(HERE, app, 'Assets.xcassets', 'Contents.json'), 'w'), indent=2)
    print(app, 'ok')

save('KunaiGaiden', kunai()); save('Braise', braise())
