"""Copies a game's App Store media from the Agent testeur's folder into media/<suffix>/, in Apple's formats.
Usage: python stage.py <GameFolder> <suffix>     e.g. python stage.py CrumbleCrew crumblecrew
  captures-jeu/<Game>/appstore/captures/*.png -> media/<suffix>/screens/*.jpg (RGB, quality 90)
  captures-jeu/<Game>/appstore/apercu-*.mp4    -> media/<suffix>/previews/<n>.mp4 (H.264 High 4.0, video range, 30 fps,
                                                  5 Mbps, AAC stereo 48 kHz 256 kbps), sorted by name, 3 at most."""
import os, shutil, subprocess, sys
from PIL import Image

game, suffix = sys.argv[1], sys.argv[2]
src = os.path.join(r'C:\Users\admin\captures-jeu', game, 'appstore')
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media', suffix)
for sub in ('screens', 'previews'):
    shutil.rmtree(os.path.join(dst, sub), ignore_errors=True)
    os.makedirs(os.path.join(dst, sub))
for f in sorted(os.listdir(os.path.join(src, 'captures'))):
    if f.lower().endswith(('.png', '.jpg')):
        im = Image.open(os.path.join(src, 'captures', f)).convert('RGB')
        assert im.size == (1320, 2868), (f, im.size)
        im.save(os.path.join(dst, 'screens', os.path.splitext(f)[0] + '.jpg'), quality=90)
        print('screen', f)
vids = sorted(f for f in os.listdir(src) if f.startswith('apercu-') and f.endswith('.mp4'))[:3]
for i, f in enumerate(vids, 1):
    out = os.path.join(dst, 'previews', f'{i}.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(src, f),
                    '-vf', 'scale=886:1920:out_range=tv,format=yuv420p,fps=30', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0',
                    '-b:v', '5M', '-maxrate', '8M', '-bufsize', '10M', '-color_range', 'tv', '-colorspace', 'bt709',
                    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-af', 'loudnorm=I=-16:TP=-1.5', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
                    '-movflags', '+faststart', out], check=True)
    print('preview', f, '->', os.path.basename(out), os.path.getsize(out) // 1024, 'KB')
