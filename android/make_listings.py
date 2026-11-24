"""Google Play listings (fr-FR, en-US) for every game, from the App Store texts (zack-store-media/fiches-appstore.json).
Writes android/store/<flavor>/listing.json: title (<=30), shortDescription (<=80), fullDescription (<=4000).
Play rules: no "free"/"best"/"#1" claims or emoji in the title, no App Store / iPhone / Apple wording."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
FICHES = os.path.join(HERE, '..', '..', 'zack-store-media', 'fiches-appstore.json')
TITLES = {'gullstreet': 'Gull Street', 'silkhop': 'Silk Hop', 'braise': 'Braise', 'clockpawsquad': 'Clockpaw Squad',
          'dungeondash': 'Pocket Dungeon Dash', 'vanvoyage': 'Van Voyage: Road Trip', 'circuitcaper': 'Circuit Caper: Heist Puzzle',
          'crumblecrew': 'Crumble Crew: Idle Moles', 'pulsepost': 'Pulse Post', 'coralstack': 'Coral Stack',
          'lanternhold': 'Lantern Hold: Night Defense', 'tossbistro': 'Toss Bistro', 'nimbuscatch': 'Nimbus Catch',
          'jamline': 'Jam Line: Idle Jam Factory'}
IOS = [(r'\bApp Store\b', 'Google Play'), (r'\biPhone\b', 'téléphone'), (r'\bApple\b', 'Google')]


def clean(s, lang):
    for a, b in IOS:
        s = re.sub(a, b if lang == 'fr-FR' or b != 'téléphone' else 'phone', s)
    return s.strip()


def short(sub, promo, lim=80):
    s = sub if len(sub) >= 30 or not promo else promo
    if len(s) > lim:
        s = s[:lim].rsplit(' ', 1)[0].rstrip(',;:') + '…'
        s = s[:lim]
    return s


fiches = json.load(open(FICHES, encoding='utf-8'))
for g in json.load(open(os.path.join(HERE, 'games.json'), encoding='utf-8')):
    f = g['flavor']
    if f not in fiches:
        print('NO LISTING', f); continue
    out = {}
    for lang in ('fr-FR', 'en-US'):
        x = fiches[f].get(lang)
        if not x: continue
        out[lang] = {'title': TITLES[f][:30], 'shortDescription': clean(short(x.get('subtitle', ''), x.get('promotionalText', '')), lang),
                     'fullDescription': clean(x.get('description', ''), lang)[:4000]}
    os.makedirs(os.path.join(HERE, 'store', f), exist_ok=True)
    json.dump(out, open(os.path.join(HERE, 'store', f, 'listing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f, {l: (len(v['title']), len(v['shortDescription']), len(v['fullDescription'])) for l, v in out.items()})
