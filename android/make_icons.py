"""Android launcher icons for every game of games.json, from the iOS icon (ios/<Game>/Assets.xcassets/AppIcon.appiconset/icon-1024.png).
Writes android/res/<flavor>/mipmap-*/ic_launcher.png (legacy), an adaptive icon (the artwork inset on its own edge colour,
so the launcher mask never cuts the drawing) and android/store/<flavor>/icon-512.png for the Play Store listing."""
import json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SIZES = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
ADAPTIVE = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
"""

for g in json.load(open(os.path.join(HERE, 'games.json'), encoding='utf-8')):
    f, web = g['flavor'], g['web']
    src = os.path.join(HERE, '..', 'ios', web, 'Assets.xcassets', 'AppIcon.appiconset', 'icon-1024.png')
    if not os.path.exists(src):
        print('MISSING', src); continue
    im = Image.open(src).convert('RGB')
    edge = im.resize((1, 1), Image.LANCZOS, box=(0, 0, 1024, 40)).getpixel((0, 0))
    res = os.path.join(HERE, 'res', f)
    for d, px in SIZES.items():
        out = os.path.join(res, 'mipmap-' + d); os.makedirs(out, exist_ok=True)
        im.resize((px, px), Image.LANCZOS).save(os.path.join(out, 'ic_launcher.png'))
        fg = Image.new('RGBA', (px * 108 // 48, px * 108 // 48), (0, 0, 0, 0))   # 108dp canvas, artwork on the 72dp safe zone
        art = im.resize((px * 72 // 48, px * 72 // 48), Image.LANCZOS)
        fg.paste(art, ((fg.width - art.width) // 2, (fg.height - art.height) // 2))
        fg.save(os.path.join(out, 'ic_launcher_foreground.png'))
    os.makedirs(os.path.join(res, 'mipmap-anydpi-v26'), exist_ok=True)
    open(os.path.join(res, 'mipmap-anydpi-v26', 'ic_launcher.xml'), 'w', encoding='utf-8').write(ADAPTIVE)
    os.makedirs(os.path.join(res, 'values'), exist_ok=True)
    open(os.path.join(res, 'values', 'ic_launcher.xml'), 'w', encoding='utf-8').write(
        '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#%02X%02X%02X</color>\n</resources>\n' % edge)
    st = os.path.join(HERE, 'store', f); os.makedirs(st, exist_ok=True)
    im.resize((512, 512), Image.LANCZOS).save(os.path.join(st, 'icon-512.png'))
    print(f, 'ok', edge)
