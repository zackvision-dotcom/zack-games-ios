"""Pocket Dungeon Dash: turns the ChatGPT sheets (cream background) into game sprites with a transparent background.
The cream around the stickers is removed by a flood fill from the image border (the white sticker outline stops it),
then each sheet is cut on its grid and every sticker is trimmed. Output: Documents/SilkHop/src/sprites/*.png
Usage: python cut.py"""
import os
from collections import deque
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'gen')
OUT = os.path.join(os.path.expanduser('~'), 'Documents', 'DungeonDash', 'src', 'sprites'); os.makedirs(OUT, exist_ok=True)

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
            cell = im.crop(box).crop(bb)
            # drop thin slivers of a neighbour on the cell edges: trim edge rows/columns with very few pixels, then cut a gap
            a = cell.getchannel('A').point(lambda v: 1 if v > 40 else 0); w, h = cell.size; px = a.load()
            rp = [sum(px[x, y] for x in range(w)) for y in range(h)]; cp = [sum(px[x, y] for y in range(h)) for x in range(w)]
            def span(v, lim):
                lo, hi = 0, len(v) - 1
                while lo < hi and v[lo] < lim: lo += 1
                while hi > lo and v[hi] < lim: hi -= 1
                return lo, hi
            # a sliver is a band separated from the figure by an empty gap: find the largest run of non-empty rows
            def main_run(v):
                best, cur, start, bs = 0, 0, 0, (0, len(v) - 1)
                for i, c in enumerate(v + [0]):
                    if c > 0: cur += 1
                    else:
                        if cur > best: best, bs = cur, (i - cur, i - 1)
                        cur = 0
                return bs
            y0, y1 = main_run(rp); x0, x1 = main_run(cp)
            cell = cell.crop((x0, y0, x1 + 1, y1 + 1)); k = min(1, maxside / max(cell.size))
            cell = cell.resize((max(1, round(cell.width * k)), max(1, round(cell.height * k))), Image.LANCZOS)
            cell.save(os.path.join(OUT, names[i] + '.png')); print(names[i], cell.size)

import sys
if __name__ == '__main__':
    have = lambda f: os.path.exists(os.path.join(GEN, f))
    sheet = clear_bg(os.path.join(GEN, 'A_heros.png')); W, H = sheet.size
    cut(sheet.crop((0, 0, W, H // 2)), 5, 1, ['h_knight', '' if have('H_archer.png') else 'h_archer', 'h_mage', 'h_rogue', 'h_cook'], 512)
    cut(sheet.crop((0, H // 2, W, H)), 4, 1, ['gus_0', 'gus_1', 'gus_2', 'gus_3'], 512)
    if have('H_archer.png'): cut(clear_bg(os.path.join(GEN, 'H_archer.png')), 1, 1, ['h_archer'], 512)
    if have('E_monstres.png'): cut(clear_bg(os.path.join(GEN, 'E_monstres.png')), 4, 2, ['e_slime', 'e_shroom', 'e_bat', 'e_skel', 'e_ghost', 'e_bigslime', 'e_boss_shroom', 'e_pop'], 768)
    if have('F_objets.png'): cut(clear_bg(os.path.join(GEN, 'F_objets.png')), 4, 4, ['p_arrow', 'p_fire', 'p_enemy', 'p_star', 'coin', 'gem', 'chest', 'fountain',
        'card', 'heart', 'potion', 'shield', 'ui_gift', 'ui_settings', 'ui_shop', 'trophy'], 512)
    if have('G_tenues.png'):  # planche reçue en 4 + 3 : chevalière de base, dorée, pirate, glace / pyjama (outfit_2, pack de démarrage), comptoir, mur ; glace = outfit_3 (Passe d'hiver)
        g = clear_bg(os.path.join(GEN, 'G_tenues.png')); W, H = g.size
        cut(g.crop((0, 0, W, H // 2)), 4, 1, ['', 'outfit_0', 'outfit_1', 'outfit_3'], 512)
        cut(g.crop((0, H // 2, W, H)), 3, 1, ['outfit_2', 'tavern_bar', 'tavern_wall'], 720)
    if have('C_logo.png'):
        lg = clear_bg(os.path.join(GEN, 'C_logo.png')); bb = lg.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox(); lg = lg.crop(bb); lg.thumbnail((900, 900)); lg.save(os.path.join(OUT, 'logo.png')); print('logo', lg.size)
    if have('D_salle.png'): Image.open(os.path.join(GEN, 'D_salle.png')).convert('RGB').resize((720, 1080), Image.LANCZOS).save(os.path.join(OUT, 'bg_room.png')); print('bg_room')
    Image.open(os.path.join(GEN, 'B_icon.png')).convert('RGB').resize((720, 720), Image.LANCZOS).save(os.path.join(OUT, 'title_bg.png'))
