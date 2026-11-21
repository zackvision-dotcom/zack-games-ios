"""Silk Hop: turns the ChatGPT sticker sheets (cream background) into game sprites with a transparent background.
The cream around the stickers is removed by a flood fill from the image border (the white sticker outline stops it),
then each sheet is cut on its grid and every sticker is trimmed. Output: Documents/SilkHop/src/sprites/*.png
Usage: python cut.py"""
import os
from collections import deque
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'gen')
OUT = os.path.join(os.path.expanduser('~'), 'Documents', 'SilkHop', 'src', 'sprites'); os.makedirs(OUT, exist_ok=True)

def clear_bg(path, tol=34):
    im = Image.open(path).convert('RGBA'); W, H = im.size; px = im.load()
    # background colour = the most common colour of the border
    border = [px[x, 0] for x in range(W)] + [px[x, H - 1] for x in range(W)] + [px[0, y] for y in range(H)] + [px[W - 1, y] for y in range(H)]
    bg = max(set(b[:3] for b in border), key=lambda c: sum(1 for b in border if abs(b[0] - c[0]) + abs(b[1] - c[1]) + abs(b[2] - c[2]) < 12))
    near = lambda c: abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) < tol
    seen = bytearray(W * H); q = deque()
    for x in range(W): q.extend([(x, 0), (x, H - 1)])
    for y in range(H): q.extend([(0, y), (W - 1, y)])
    while q:
        x, y = q.popleft(); i = y * W + x
        if seen[i]: continue
        seen[i] = 1
        if not near(px[x, y]): continue
        px[x, y] = (0, 0, 0, 0)
        if x > 0: q.append((x - 1, y))
        if x < W - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < H - 1: q.append((x, y + 1))
    # soften the cut edge by one pixel
    a = im.getchannel('A').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    im.putalpha(a)
    return im

def cut(im, cols, rows, names, maxside):
    W, H = im.size; A = im.getchannel('A').point(lambda v: 255 if v > 40 else 0)
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            if i >= len(names) or not names[i]: continue
            box = (round(c * W / cols), round(r * H / rows), round((c + 1) * W / cols), round((r + 1) * H / rows))
            bb = A.crop(box).getbbox()
            if not bb: print('empty', names[i]); continue
            cell = im.crop(box).crop(bb); k = min(1, maxside / max(cell.size))
            cell = cell.resize((max(1, round(cell.width * k)), max(1, round(cell.height * k))), Image.LANCZOS)
            cell.save(os.path.join(OUT, names[i] + '.png')); print(names[i], cell.size)

if __name__ == '__main__':
    cut(clear_bg(os.path.join(GEN, 'H_minaposes.png')), 3, 2, ['mina', 'mina_happy', 'mina_scared', 'mina_fly', 'mina_spin', 'mina_wave'], 256)
    cut(clear_bg(os.path.join(GEN, 'E_objets.png')), 4, 4, ['anchor_leaf', 'anchor_twig', 'anchor_peg', 'gnat', 'dew', 'flower_closed', 'flower_open', 'raindrop',
        'cat_sleep', 'cat_awake', 'cocoon', 'nest', 'ui_gift', 'ui_settings', 'ui_shop', 'ui_nest'], 256)
    cut(clear_bg(os.path.join(GEN, 'F_papi.png')), 2, 2, ['papi_0', 'papi_1', 'papi_2', 'papi_3'], 256)
    cut(clear_bg(os.path.join(GEN, 'G_hats.png')), 5, 2, ['hat_%d' % i for i in range(10)], 160)
    # logo: transparent version for the title screen
    lg = clear_bg(os.path.join(GEN, 'C_logo.png')); bb = lg.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox(); lg = lg.crop(bb); lg.thumbnail((900, 900)); lg.save(os.path.join(OUT, 'logo.png')); print('logo', lg.size)
    # background: the full garden is the first screen (ground at the bottom); its upper part, made seamless, repeats above
    bg = Image.open(os.path.join(GEN, 'D_potager.png')).convert('RGB'); W, H = bg.size
    bg.resize((540, round(H * 540 / W)), Image.LANCZOS).save(os.path.join(OUT, 'bg_garden_base.png'))
    top = bg.crop((0, 0, W, int(H * 0.56))); h = top.height; band = int(h * 0.18)
    tile = top.crop((0, 0, W, h - band)).copy()
    # cross-fade the bottom band into the top so the tile repeats without a seam
    for y in range(band):
        k = y / band
        row_a = top.crop((0, h - band + y, W, h - band + y + 1)); row_b = top.crop((0, y, W, y + 1))
        tile.paste(Image.blend(row_a, row_b, k), (0, y))
    tile.resize((540, round(tile.height * 540 / W)), Image.LANCZOS).save(os.path.join(OUT, 'bg_garden.png')); print('bg_garden', tile.size)
    # title background: the icon art, which already tells the game
    Image.open(os.path.join(GEN, 'B_icon.png')).convert('RGB').resize((720, 720), Image.LANCZOS).save(os.path.join(OUT, 'title_bg.png'))
