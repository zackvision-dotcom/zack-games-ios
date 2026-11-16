"""Kunai Gaiden: turns the copied village of the old fangame into an original game.
Run once on src/ (idempotent: every replacement checks it still applies). Then grep for leftovers (see the end)."""
import io, os, re, sys
SRC = os.path.join(os.path.dirname(__file__), 'src')
def rd(f): return io.open(os.path.join(SRC, f), encoding='utf-8').read()
def wr(f, s): io.open(os.path.join(SRC, f), 'w', encoding='utf-8', newline='\n').write(s)
def sub(f, a, b, need=True):
    s = rd(f)
    if a not in s:
        if need and b not in s: sys.exit(f'missing in {f}: {a[:70]}')
        return
    wr(f, s.replace(a, b))

# 1. the headband plate: a kunai point instead of the leaf spiral
sub('hero.js', "g.strokeStyle = '#3d454c'; g.lineWidth = 1.3; g.beginPath(); for (let a2 = 0; a2 < 9; a2 += .3) { const rr = .5 + a2 * .55; g.lineTo(Math.cos(a2 + 2) * rr, Math.sin(a2 + 2) * rr * .8); } g.stroke(); g.restore(); }",
    "g.strokeStyle = '#3d454c'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-4.5, 0); g.lineTo(0, -2.4); g.lineTo(4.5, 0); g.lineTo(0, 2.4); g.closePath(); g.moveTo(-6.5, 0); g.lineTo(6.5, 0); g.stroke(); g.restore(); }")
# 2. no characters of the anime among the looks
s = rd('looks.js'); s = '\n'.join(l for l in s.split('\n') if 'canon: true' not in l and 'canon characters of the wider world' not in l); wr('looks.js', s)
# 3. the cliff above the village: plain rock, no carved faces
sub('konoha-more.js', "const carvedFace = kind => tex('hokage' + kind, 512, 600, (g, W, H) => { const r = rng(kind * 31 + 5); g.drawImage(rockTex(), 0, 0, W, H);",
    "const carvedFace = kind => tex('cliff' + kind, 512, 600, (g, W, H) => { const r = rng(kind * 31 + 5); g.drawImage(rockTex(), 0, 0, W, H); return;   // Kunai Gaiden: a bare cliff")
# 4. the Guardian's residence: blue-green instead of the red-orange of the anime, and its own emblem
s = rd('konoha-hokage3d.js'); s = s.replace("'火'", "'守'")
for a, b in [('#e0532f', '#2f7d8a'), ('#d2382a', '#1f5f6a'), ('#c8342a', '#25707c'), ('#7a3a22', '#1e4650'), ('#5a2216', '#163a42'), ('#3a1a10', '#0f2a30')]: s = s.replace(a, b)
wr('konoha-hokage3d.js', s)
# 5. the village gate: other characters on the doors
sub('konoha-gate.js', "door('あ', 21)", "door('風', 21)"); sub('konoha-gate.js', "door('ん', 22)", "door('刃', 22)")
sub('konoha-props.js', "text: ['火影', '一楽', '学校']", "text: ['守護', '茶屋', '学校']")

# 6. names, everywhere in the texts
NAMES = [('Naruto Shadow Raisen', 'Kunai Gaiden'), ('Village caché de Konoha', 'village d’Aozora'), ('village caché de Konoha', 'village d’Aozora'),
    ('木ノ葉隠れの里', '青空の里'), ('木ノ葉', '青空'), ('火影', '守護'), ('Konoha', 'Aozora'), ('Hokage', 'Gardien'), ('HOKAGE', 'GARDIEN'),
    ('Katon : boule de feu', 'Boule de feu'), ('Suiton : dragon d’eau', 'Dragon d’eau'), ('Fūton : lame de vent', 'Lame de vent'),
    ('Shunshin : pas éclair', 'Pas éclair'), ('Shunshin', 'Pas éclair'), ('Chidori', 'Lame-tonnerre'), ('Kakashi', 'ton ancien maître'),
    ('Fangame non officiel · gratuit · non commercial', 'Kunai Gaiden · un jeu original'), ('Fangame non commercial. ', '')]
for f in os.listdir(SRC):
    if not f.endswith(('.js', '.html')): continue
    s = o = rd(f)
    for a, b in NAMES: s = s.replace(a, b)
    if s != o: wr(f, s)
sub('konoha-full.html', '<title>Kunai Gaiden</title>', '<title>Kunai Gaiden</title>')

# leftovers: anything of the anime still in the code (comments included)
BAD = r"naruto|konoha|hokage|uchiha|uzumaki|kakashi|sasuke|akatsuki|ichiraku|sharingan|rasengan|chidori|katon|suiton|jiraiya|tsunade|hiruzen|minato|gaara|木ノ葉|火影"
for f in sorted(os.listdir(SRC)):
    if not f.endswith(('.js', '.html')): continue
    for i, line in enumerate(rd(f).split('\n'), 1):
        for m in re.finditer(BAD, line, re.I):
            ctx = line[max(0, m.start() - 40):m.end() + 40].strip()
            print(f'{f}:{i}: {ctx}')

# 7. techniques of the old saga chapters: learned by level instead
LV = {'dash': 5, 'water': 7, 'clone': 9, 'chidori': 11, 'wind': 13}
s = rd('game.js')
s = s.replace("    // learned along the story (saga.js): each one is a chapter's reward\n", "    // learned by level (Kunai Gaiden)\n")
for k, h in [('dash', 'Chapitre 2 — Tanzaku-gai'), ('water', 'Chapitre 3 — Pays des Vagues'), ('clone', 'Chapitre 6 — Takigakure'), ('chidori', 'Chapitre 7 — Vallée de la Fin'), ('wind', 'Chapitre 9 — Sunagakure')]:
    s = s.replace("hint: '" + h + "'", "hint: 'Niveau " + str(LV[k]) + "'")
a = "let extra = ''; if (S.lvl >= 4 && !S.skills.sphere) { S.skills.sphere = true; extra = ' · Technique : Sphère de chakra (U)'; }"
if a in s:
    s = s.replace(a, a + " for (const [id, lv] of [['dash', 5], ['water', 7], ['clone', 9], ['chidori', 11], ['wind', 13]]) if (S.lvl >= lv && !S.skills[id]) { S.skills[id] = true; extra += ' · Technique : ' + SK[id].name + ' (' + SK[id].key.toUpperCase() + ')'; }")
s = s.replace("une technique de feu : Katon, la boule de feu.", "une technique de feu : la boule de feu.")
wr('game.js', s)
# 8. the other regions' room styles (and their lines about the anime's characters) are not part of this game
s = rd('interiors.js'); i = s.find('  const STYLES = {\n')
if i >= 0 and '    kiri: {' in s:
    j = s.find('\n  };', i); s = s[:i] + '  const STYLES = {\n' + s[j + 1:]
    wr('interiors.js', s)
# 9. comments naming the anime's characters
s = rd('konoha-more.js'); s = re.sub(r'  // (Hashirama|Tobirama|Hiruzen|Minato|Tsunade|ton ancien maître|Naruto)[^\n]*', '', s); wr('konoha-more.js', s)
s = rd('hero.js'); s = s.replace("// Gaara: short, thick, spiky red hair", "// short, thick, spiky hair").replace("(the Raikage A)", "").replace("(Killer B)", "").replace("(Fū)", "").replace("the old Tsuchikage: ", "")
s = s.replace("'naruto' | 'sasuke' | 'kakashi' | 'sakura'", "…").replace("crest ('uchiha'), ", ""); wr('hero.js', s)
# 10. internal names of hair styles and marks taken from the anime: neutral names
s = rd('hero.js')
for a, b in [('naruto:', 'fox:'), ('sasuke:', 'crow:'), ('kakashi:', 'silver:'), ('gaara:', 'ember:'), ('jiraiya:', 'mane:'), ("'kakashi'", "'silver'"), ("'uchiha'", "'fan'"),
             ("(Gaara's 愛), Tsunade's diamond", "(a kanji), a diamond"), ("kurō's war paint", "war paint")]: s = s.replace(a, b)
wr('hero.js', s)
# 11. App Store build: no "MMORPG" label, no cheat button on the title screen
sub('game.js', 'MMORPG 2D · Le village d’Aozora', 'Le village d’Aozora')
s = rd('konoha-full.html')
if '#k-max{display:none' not in s: s = s.replace('</head>', '<style>#k-max{display:none!important}</style></head>', 1); wr('konoha-full.html', s)
# 12. French elision before "Aozora"
for f in os.listdir(SRC):
    if not f.endswith(('.js', '.html')): continue
    s = o = rd(f)
    for a, b in [(' de Aozora', ' d’Aozora'), ("'de Aozora", "'d’Aozora"), ('De Aozora', 'D’Aozora'), (' que Aozora', ' qu’Aozora'), (' le Aozora', ' l’Aozora')]: s = s.replace(a, b)
    if s != o: wr(f, s)
