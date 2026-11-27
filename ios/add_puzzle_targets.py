"""Adds the 5 puzzle/utility web games to the iOS project (one target each, same shell as Tuck Still, no Firebase).
Copies each game's index.html into <Target>/Web, makes a temporary icon (replaced by the ChatGPT key art later)
and appends the target to project.yml (Google TEST AdMob ids until the real AdMob apps exist).
Re-run safe: an existing target is left as is in project.yml; Web/index.html is refreshed.
Usage: python add_puzzle_targets.py"""
import json, os, re, shutil
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); DOCS = os.path.abspath(os.path.join(HERE, '..', '..'))
JR = os.path.join(DOCS, 'ZVisionAI', 'jeux-reflexion')
GAMES = [  # target, display name, bundle suffix, source html, category, icon (bg, fg, glyph) or existing png
    ('MotsMeles', 'Mots Mêlés', 'motsmeles', os.path.join(DOCS, 'MotsMeles', 'index.html'), 'word-games', ('#ffcf8a', '#4a2c14', 'MOT')),
    ('Solitaire', 'Solitaire', 'solitaire', os.path.join(DOCS, 'Solitaire', 'index.html'), 'card-games', ('#1f6b47', '#fff8ee', 'A♠')),
    ('Logimages', 'Logimages', 'logimages', os.path.join(DOCS, 'Logimages', 'index.html'), 'puzzle-games', ('#b9c8ff', '#1f2a55', '▦')),
    ('SudokuZen', 'Sudoku Zen', 'sudokuzen', os.path.join(JR, 'sudoku-zen', 'index.html'), 'puzzle-games', os.path.join(JR, 'sudoku-zen', 'icone-512.png')),
    ('CompteurPoints', 'Compteur', 'compteurpoints', os.path.join(JR, 'compteur-points', 'index.html'), 'card-games', os.path.join(JR, 'compteur-points', 'icone-512.png')),
]
TEST = {'app': 'ca-app-pub-3940256099942544~1458002511', 'interstitial': 'ca-app-pub-3940256099942544/4411468910', 'rewarded': 'ca-app-pub-3940256099942544/1712485313'}
ids = json.load(open(os.path.join(DOCS, 'games-kit', 'admob-ids.json'), encoding='utf-8'))['apps']
yml_path = os.path.join(HERE, 'project.yml'); yml = open(yml_path, encoding='utf-8').read()

def icon(target, spec):
    d = os.path.join(HERE, target, 'Assets.xcassets', 'AppIcon.appiconset'); os.makedirs(d, exist_ok=True)
    out = os.path.join(d, 'icon-1024.png')
    if isinstance(spec, str):
        Image.open(spec).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(out)
    else:
        bg, fg, glyph = spec; im = Image.new('RGB', (1024, 1024), bg); dr = ImageDraw.Draw(im)
        try: f = ImageFont.truetype('seguisym.ttf' if '♠' in glyph or '▦' in glyph else 'arialbd.ttf', 420)
        except OSError: f = ImageFont.load_default()
        dr.text((512, 530), glyph, font=f, fill=fg, anchor='mm'); im.save(out)
    json.dump({'images': [{'filename': 'icon-1024.png', 'idiom': 'universal', 'platform': 'ios', 'size': '1024x1024'}], 'info': {'author': 'xcode', 'version': 1}}, open(os.path.join(d, 'Contents.json'), 'w'), indent=2)
    json.dump({'info': {'author': 'xcode', 'version': 1}}, open(os.path.join(HERE, target, 'Assets.xcassets', 'Contents.json'), 'w'), indent=2)

for target, name, suffix, src, cat, ic in GAMES:
    web = os.path.join(HERE, target, 'Web'); os.makedirs(web, exist_ok=True)
    shutil.copyfile(src, os.path.join(web, 'index.html'))
    if not os.path.exists(os.path.join(HERE, target, 'Assets.xcassets', 'AppIcon.appiconset', 'icon-1024.png')): icon(target, ic)
    if re.search(r'^  %s:$' % target, yml, re.M): continue
    a = ids.get(target, TEST)
    yml = yml.rstrip('\n') + f"""
  {target}:
    type: application
    platform: iOS
    sources:
      - path: Shared
      - path: Ads          # NativeAds.swift + InfoPlist.strings (ATT prompt, FR/EN)
      - path: {target}/Assets.xcassets
      - path: {target}/Web
        type: folder
    dependencies:
      - package: GoogleMobileAds
      - package: GoogleUserMessagingPlatform
    info:
      path: {target}/Info.plist
      properties:
        CFBundleDisplayName: {name}
        CFBundleShortVersionString: $(MARKETING_VERSION)
        CFBundleVersion: $(CURRENT_PROJECT_VERSION)
        LSRequiresIPhoneOS: true
        ITSAppUsesNonExemptEncryption: false
        UILaunchScreen: {{}}
        UIRequiresFullScreen: true
        UIStatusBarHidden: true
        UIViewControllerBasedStatusBarAppearance: false
        UISupportedInterfaceOrientations:
          - UIInterfaceOrientationPortrait
        UISupportedInterfaceOrientations~ipad:
          - UIInterfaceOrientationPortrait
        UIApplicationSceneManifest:
          UIApplicationSupportsMultipleScenes: false
        LSApplicationCategoryType: public.app-category.{cat}
        GADApplicationIdentifier: {a['app']}{'   # Google TEST app id until the AdMob app exists' if a is TEST else ''}
        GADUseTestAds: $(ADS_TEST)
        GADInterstitialUnit: {a['interstitial']}
        GADRewardedUnit: {a['rewarded']}
        NSUserTrackingUsageDescription: Your permission lets us show more relevant ads. The game stays fully playable without it.
        SKAdNetworkItems: *skadnetworks
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.zvisionclub.{suffix}
        PRODUCT_NAME: {target}
        OTHER_SWIFT_FLAGS: $(inherited) -DADS   # compiles the AdMob bridge in Shared/GameApp.swift
        TARGETED_DEVICE_FAMILY: "1"   # iPhone first; iPad layout comes later
"""
open(yml_path, 'w', encoding='utf-8', newline='\n').write(yml)
print('ok')
