"""Clockpaw Squad: turns the ChatGPT sheets (cream background) into game sprites with a transparent background.
The cream around the stickers is removed by a flood fill from the image border (the white sticker outline stops it),
then each sheet is cut on its grid and every sticker is trimmed. Output: Documents/SilkHop/src/sprites/*.png
Usage: python cut.py"""
import os
from collections import deque
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'gen')
OUT = os.path.join(os.path.expanduser('~'), 'Documents', 'ClockpawSquad', 'src', 'sprites'); os.makedirs(OUT, exist_ok=True)

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

if __name__ == '__main__':
    # team sheet: 3 heroes on the top half, Maitre Tic x4 on the bottom half
    team = clear_bg(os.path.join(GEN, 'A_equipe.png')); W, H = team.size
    cut(team.crop((0, 0, W, H // 2)), 3, 1, ['h_cat', 'h_rabbit', 'h_turtle'], 256)
    cut(team.crop((0, H // 2, W, H)), 4, 1, ['tic_0', 'tic_1', 'tic_2', 'tic_3'], 256)
    cut(clear_bg(os.path.join(GEN, 'E_robots.png')), 4, 2, ['r_basic', 'r_shooter', 'r_heavy', 'r_spring', 'r_miniboss', 'r_boss_cuckoo', 'r_ko', 'fx_bolt'], 256)
    cut(clear_bg(os.path.join(GEN, 'F_objets.png')), 4, 4, ['t_floor', 't_wall', 't_window', 't_gear', 't_crate', 'cog_star', 'key_gold', 'bolt',
        'toolbox', 'ui_rewind', 'ui_hint', 'ui_gift', 'ui_settings', 'ui_shop', 'fx_ko', 'fx_spring'], 256)
    cut(clear_bg(os.path.join(GEN, 'G_costumes.png')), 5, 2, ['h_owl', 'h_hamster', 'costume_0', 'costume_1', 'costume_2', 'costume_3', 'costume_4', 'costume_5', 'costume_6', 'costume_7'], 256)
    lg = clear_bg(os.path.join(GEN, 'C_logo.png')); bb = lg.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox(); lg = lg.crop(bb); lg.thumbnail((900, 900)); lg.save(os.path.join(OUT, 'logo.png')); print('logo', lg.size)
    Image.open(os.path.join(GEN, 'D_salle.png')).convert('RGB').resize((540, 960), Image.LANCZOS).save(os.path.join(OUT, 'bg_room.png')); print('bg_room')
    Image.open(os.path.join(GEN, 'B_icon.png')).convert('RGB').resize((720, 720), Image.LANCZOS).save(os.path.join(OUT, 'title_bg.png'))
