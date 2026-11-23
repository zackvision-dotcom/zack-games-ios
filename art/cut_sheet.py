"""Cuts a ChatGPT sticker sheet (objects on a flat cream background, with or without grid lines) into one PNG per object,
with a transparent background. It does not trust the grid: it removes long straight dark lines (the grid), floods the cream
from every border and every grid line, then keeps each blob of remaining pixels (blobs closer than GAP px are merged, so steam
or sparkles stay with their object). Objects are named in reading order (rows top to bottom, then left to right).

Usage: python cut_sheet.py sheet.png outdir name1,name2,...   ('-' as a name skips that object)
       python cut_sheet.py sheet.png outdir --list               (only prints the blobs found, to check the order)"""
import sys, os
from collections import deque
import numpy as np
from PIL import Image

GAP = 8           # px: blobs closer than this belong to the same object
MIN_AREA = 0.002  # of the sheet: smaller blobs are specks


def load(path):
    im = Image.open(path).convert('RGBA'); a = np.array(im).astype(np.int16); H, W = a.shape[:2]
    border = np.concatenate([a[0, :, :3], a[-1, :, :3], a[:, 0, :3], a[:, -1, :3]])
    bg = np.median(border, axis=0)
    # the most common light colour = the paper (the border may be a grid line)
    light = a[..., :3].reshape(-1, 3); light = light[light.sum(1) > 560]
    if len(light): bg = np.median(light[::97], axis=0)
    return im, a, bg


def grid_lines(a):
    """Mask of long straight dark runs (grid lines), horizontal and vertical."""
    H, W = a.shape[:2]; dark = a[..., :3].sum(2) < 260; m = np.zeros((H, W), bool)
    for y in range(H):
        row = dark[y]; x = 0
        while x < W:
            if row[x]:
                s = x
                while x < W and row[x]: x += 1
                if x - s > W * 0.22: m[y, s:x] = True
            else: x += 1
    for x in range(W):
        col = dark[:, x]; y = 0
        while y < H:
            if col[y]:
                s = y
                while y < H and col[y]: y += 1
                if y - s > H * 0.22: m[s:y, x] = True
            else: y += 1
    # thicken a little (anti-aliased edges of the lines)
    m2 = m.copy(); m2[1:] |= m[:-1]; m2[:-1] |= m[1:]; m2[:, 1:] |= m[:, :-1]; m2[:, :-1] |= m[:, 1:]
    return m2


def clear(a, bg, lines, tol=48):
    H, W = a.shape[:2]
    near = np.abs(a[..., :3] - bg).sum(2) < tol
    gone = lines.copy(); seen = lines.copy(); q = deque()
    ys, xs = np.nonzero(lines); q.extend(zip(ys.tolist(), xs.tolist()))
    for x in range(W): q.append((0, x)); q.append((H - 1, x))
    for y in range(H): q.append((y, 0)); q.append((y, W - 1))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx]:
                seen[ny, nx] = True
                if near[ny, nx]: gone[ny, nx] = True; q.append((ny, nx))
    return gone


def blobs(keep):
    H, W = keep.shape
    # merge nearby parts: work on a downscaled grid of GAP-sized cells
    c = GAP // 2; h, w = (H + c - 1) // c, (W + c - 1) // c
    small = np.zeros((h, w), bool)
    ys, xs = np.nonzero(keep); small[ys // c, xs // c] = True
    lab = np.zeros((h, w), int); n = 0
    for sy in range(h):
        for sx in range(w):
            if small[sy, sx] and not lab[sy, sx]:
                n += 1; q = deque([(sy, sx)]); lab[sy, sx] = n
                while q:
                    y, x = q.popleft()
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < h and 0 <= nx < w and small[ny, nx] and not lab[ny, nx]: lab[ny, nx] = n; q.append((ny, nx))
    out = []
    for i in range(1, n + 1):
        yy, xx = np.nonzero(lab == i)
        y0, y1, x0, x1 = yy.min() * c, min(H, (yy.max() + 1) * c), xx.min() * c, min(W, (xx.max() + 1) * c)
        area = keep[y0:y1, x0:x1].sum()
        if area > MIN_AREA * H * W: out.append((y0, y1, x0, x1, i))
    # reading order: group into rows by vertical centre
    out.sort(key=lambda b: (b[0] + b[1]) / 2)
    rows = []
    for b in out:
        cy = (b[0] + b[1]) / 2
        if rows and abs(cy - rows[-1][0]) < (b[1] - b[0]) * 0.5: rows[-1][1].append(b)
        else: rows.append([cy, [b]])
    return [b for _, r in rows for b in sorted(r, key=lambda b: b[2])], lab, c


def main():
    src, outdir = sys.argv[1], sys.argv[2]; names = sys.argv[3] if len(sys.argv) > 3 else '--list'
    im, a, bg = load(src); lines = grid_lines(a); gone = clear(a, bg, lines)
    rgba = np.array(im); rgba[gone] = (0, 0, 0, 0); keep = ~gone
    bl, lab, c = blobs(keep)
    if names == '--list':
        for k, (y0, y1, x0, x1, _) in enumerate(bl): print(k, 'x', x0, x1, 'y', y0, y1)
        return
    names = names.split(','); os.makedirs(outdir, exist_ok=True)
    if len(names) != len(bl): print('WARNING:', len(bl), 'objects found,', len(names), 'names given')
    for (y0, y1, x0, x1, i), nm in zip(bl, names):
        if nm == '-': continue
        crop = rgba[y0:y1, x0:x1].copy()
        own = np.kron(lab[y0 // c:(y1 + c - 1) // c, x0 // c:(x1 + c - 1) // c] == i, np.ones((c, c), bool))[:y1 - y0, :x1 - x0]
        crop[~own] = (0, 0, 0, 0)
        Image.fromarray(crop).save(os.path.join(outdir, nm + '.png'))
        print('saved', nm, x1 - x0, 'x', y1 - y0)


if __name__ == '__main__':
    main()
