"""Google Play phone screenshots from the App Store ones (zack-store-media/media/<flavor>/screens, 1320x2868 = 2.17:1).
Play refuses a long side more than twice the short side: the shot is centred on a 1434x2868 canvas (exactly 2:1) whose
sides are a blurred, darkened stretch of the same shot, so nothing of the game is cropped."""
import glob, json, os
from PIL import Image, ImageFilter, ImageEnhance
HERE = os.path.dirname(os.path.abspath(__file__)); MEDIA = os.path.join(HERE, '..', '..', 'zack-store-media', 'media')
for g in json.load(open(os.path.join(HERE, 'games.json'), encoding='utf-8')):
    f = g['flavor']; src = sorted(glob.glob(os.path.join(MEDIA, f, 'screens', '*.*')))
    if not src: print('NO SCREENS', f); continue
    out = os.path.join(HERE, 'store', f, 'screens'); os.makedirs(out, exist_ok=True)
    for i, p in enumerate(src[:8], 1):
        im = Image.open(p).convert('RGB'); w, h = im.size
        if max(w, h) <= 2 * min(w, h): im.save(os.path.join(out, f'{i:02d}.jpg'), quality=90); continue
        W, H = (h // 2 + (h % 2), h) if h > w else (w, w // 2 + (w % 2))
        bg = ImageEnhance.Brightness(im.resize((W, H)).filter(ImageFilter.GaussianBlur(40))).enhance(0.6)
        bg.paste(im, ((W - w) // 2, (H - h) // 2)); bg.save(os.path.join(out, f'{i:02d}.jpg'), quality=90)
    print(f, len(src[:8]), Image.open(os.path.join(out, '01.jpg')).size)
