"""App Store marketing screenshots: real gameplay (appstore/stills/<game>/*.png, 1920x886, from tools/store.mjs)
framed on the game's concept art, with one short headline each.
   python tools/frames.py  ->  appstore/screens/<game>/NN-name.jpg (2868x1320, iPhone 6.9") and appstore/screens-6.3/<game>/ (2622x1206)"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FONTS = os.path.join(ROOT, 'tools', 'fonts')
W, H = 2868, 1320

STYLE = {
    'kunai-gaiden': dict(font='PottaOne-Regular.ttf', var=None, size=104, ink=(246, 222, 150), accent=(232, 74, 46), stroke=(22, 14, 26), border=(232, 196, 110), tint=(18, 16, 40)),
    'braise': dict(font='GrenzeGotisch[wght].ttf', var=900, size=124, ink=(242, 228, 196), accent=(255, 150, 54), stroke=(26, 14, 8), border=(214, 128, 52), tint=(30, 14, 6)),
}
# (still, headline with *accent* words, background art)
SCREENS = {
    'kunai-gaiden': [
        ('combat-v', 'HERO', '05_combat'),
        ('combat-z', 'Trace une lettre, *lance ta technique*', '05_combat'),
        ('village-jour', 'Un *village vivant* à explorer', '03_village'),
        ('orage-nuit', 'Jour, nuit… et *orages*', '05_combat'),
        ('boss', 'Affronte *Kurogane* le déserteur', '05_combat'),
        ('dialogue', 'Des missions, des *visages attachants*', '04_personnages'),
        ('sac', 'Butin rare, épique, *légendaire*', '03_village'),
        ('carte', 'Une carte et un *GPS* pour te guider', '03_village'),
    ],
    'braise': [
        ('hyenes', 'HERO', '05_nuit'),
        ('savane', 'Explore une *savane* peinte à la main', '03_savane'),
        ('premier-feu', 'Allume ton *premier feu*', '01_icone_app_store'),
        ('hyenes', 'Survis à la *nuit*', '05_nuit'),
        ('atelier', 'Fabrique tes *outils*', '04_personnages'),
        ('recolte', 'Récolte, chasse, *survis*', '03_savane'),
        ('titre', 'Joue dans *30 langues*', '03_savane'),
    ],
}
TAGLINE = {'kunai-gaiden': 'Dessine. Frappe. *Deviens légende.*', 'braise': 'Un feu. *Une lignée.*'}

def font(st, size):
    f = ImageFont.truetype(os.path.join(FONTS, st['font']), size)
    if st['var']:
        try: f.set_variation_by_axes([st['var']])
        except Exception: pass
    return f

def cover(img, w, h):
    s = max(w / img.width, h / img.height); img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x, y = (img.width - w) // 2, (img.height - h) // 2; return img.crop((x, y, x + w, y + h))

def background(game, art, st, blur=22, dark=.42):
    a = Image.open(os.path.join(ROOT, 'art', game, art + '.png')).convert('RGB')
    a = cover(a, W, H).filter(ImageFilter.GaussianBlur(blur)); a = ImageEnhance.Brightness(a).enhance(dark)
    tint = Image.new('RGB', (W, H), st['tint']); a = Image.blend(a, tint, .25)
    v = Image.new('L', (W, H), 0); ImageDraw.Draw(v).ellipse((-W * .2, -H * .35, W * 1.2, H * 1.35), fill=255)
    return Image.composite(a, Image.new('RGB', (W, H), (0, 0, 0)), v.filter(ImageFilter.GaussianBlur(220)))

def headline(img, text, st, cx, cy, size, max_w):
    d = ImageDraw.Draw(img)
    while True:
        f = font(st, size); parts = [(p, i % 2 == 1) for i, p in enumerate(text.split('*')) if p]
        widths = [d.textlength(p, font=f) for p, _ in parts]
        if sum(widths) <= max_w or size < 50: break
        size -= 4
    x = cx - sum(widths) / 2
    for (p, acc), w in zip(parts, widths):
        d.text((x, cy), p, font=f, fill=st['accent'] if acc else st['ink'], anchor='lm', stroke_width=max(4, size // 18), stroke_fill=st['stroke']); x += w

def framed(shot, w, st, radius=38, border=8):
    h = round(shot.height * w / shot.width); s = shot.resize((w, h), Image.LANCZOS)
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius, fill=255)
    out = Image.new('RGBA', (w + 2 * border, h + 2 * border), (0, 0, 0, 0)); od = ImageDraw.Draw(out)
    od.rounded_rectangle((0, 0, out.width - 1, out.height - 1), radius + border, fill=st['border'] + (255,))
    inner = Image.new('RGBA', (w, h)); inner.paste(s.convert('RGBA'), (0, 0), m); out.alpha_composite(inner, (border, border))
    return out

def drop(canvas, layer, x, y, blur=40, alpha=170, dy=24):
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); a = layer.getchannel('A').point(lambda v: alpha if v else 0)
    sh.paste(Image.new('RGBA', layer.size, (0, 0, 0, 255)), (x, y + dy), a); canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    canvas.alpha_composite(layer, (x, y))

def build(game):
    st = STYLE[game]; out = os.path.join(ROOT, 'appstore', 'screens', game); out63 = os.path.join(ROOT, 'appstore', 'screens-6.3', game)
    os.makedirs(out, exist_ok=True); os.makedirs(out63, exist_ok=True)
    for n, (still, text, art) in enumerate(SCREENS[game], 1):
        shot = Image.open(os.path.join(ROOT, 'appstore', 'stills', game, still + '.png')).convert('RGB')
        if text == 'HERO':   # first screen: the art almost unblurred, the logo, the promise, and the game itself
            c = background(game, art, st, blur=3, dark=.62).convert('RGBA')
            logo = Image.open(os.path.join(ROOT, 'art', game, '02_logo_transparent.png')).convert('RGBA')
            lw = 1060; logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
            drop(c, logo, 90, 250, blur=30, alpha=200, dy=10)
            headline(c, TAGLINE[game], st, 90 + lw // 2, 250 + logo.height + 110, 92, 1100)
            f = framed(shot, 1560, st); drop(c, f, W - f.width - 90, (H - f.height) // 2 + 10)
        else:
            c = background(game, art, st).convert('RGBA')
            headline(c, text, st, W // 2, 132, st['size'], W - 260)
            f = framed(shot, 2180, st); drop(c, f, (W - f.width) // 2, 248)
        name = f'{n:02d}-{still}'
        img = c.convert('RGB'); img.save(os.path.join(out, name + '.jpg'), quality=93)
        img.resize((2622, 1206), Image.LANCZOS).save(os.path.join(out63, name + '.jpg'), quality=93)
        print(game, name)

if __name__ == '__main__':
    import sys
    for g in (sys.argv[1:] or SCREENS): build(g)
