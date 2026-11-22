"""Pushes App Store listing data to App Store Connect with the official API (no submission, ever).

For each game folder in media/<suffix>/ (bundle id com.zvisionclub.<suffix>):
  - texts from fiches.json (fr-FR and en-US): description, keywords, promotional text, support URL on the 1.0 version,
    subtitle and privacy policy URL on the app info (en-US app info localization created with the app name);
  - screenshots media/<suffix>/screens/*.jpg|png -> 6.9" set (APP_IPHONE_67) of both locales (the set is emptied first);
  - previews media/<suffix>/previews/*.mp4 -> IPHONE_67 preview set of both locales (emptied first).
Usage: python asc_sync.py [suffix ...]   (default: every folder in media/; set ONLY_TEXT=1 to skip media)
Env: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH (the .p8 file).
It never creates a review submission and never touches the build, the price or the in-app purchases."""
import hashlib, json, os, sys, time
import jwt, requests

API = 'https://api.appstoreconnect.apple.com/v1'
HERE = os.path.dirname(os.path.abspath(__file__))
SUPPORT = 'https://zackvision-dotcom.github.io/zack-games-ios/support.html'
PRIVACY = 'https://zackvision-dotcom.github.io/zack-games-ios/privacy.html'
LOCALES = ['fr-FR', 'en-US']
_tok = [None, 0]


def token():
    if time.time() > _tok[1] - 60:
        now = int(time.time())
        key = open(os.environ['ASC_KEY_PATH']).read()
        _tok[0] = jwt.encode({'iss': os.environ['ASC_ISSUER_ID'], 'iat': now, 'exp': now + 1100, 'aud': 'appstoreconnect-v1'},
                             key, algorithm='ES256', headers={'kid': os.environ['ASC_KEY_ID'], 'typ': 'JWT'})
        _tok[1] = now + 1100
    return _tok[0]


def call(method, path, body=None, ok=(200, 201, 204)):
    url = path if path.startswith('http') else API + path
    for attempt in range(4):
        r = requests.request(method, url, json=body, headers={'Authorization': 'Bearer ' + token()}, timeout=120)
        if r.status_code in ok:
            return r.json() if r.content else {}
        if r.status_code in (429, 500, 502, 503) and attempt < 3:
            time.sleep(5 * (attempt + 1)); continue
        raise RuntimeError(f'{method} {path} -> {r.status_code} {r.text[:600]}')


def upload(ops, data):
    for op in ops:
        chunk = data[op['offset']:op['offset'] + op['length']]
        h = {x['name']: x['value'] for x in op.get('requestHeaders', [])}
        r = requests.request(op['method'], op['url'], data=chunk, headers=h, timeout=300)
        if r.status_code >= 300:
            raise RuntimeError(f'upload chunk -> {r.status_code} {r.text[:300]}')


def find_app(suffix):
    d = call('GET', f'/apps?filter[bundleId]=com.zvisionclub.{suffix}')['data']
    if not d:
        raise RuntimeError('no app for ' + suffix)
    return d[0]


def edit_version(app_id):
    vs = call('GET', f'/apps/{app_id}/appStoreVersions?filter[platform]=IOS&limit=10')['data']
    editable = [v for v in vs if v['attributes']['appStoreState'] in ('PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY')]
    if not editable:
        raise RuntimeError('no editable version: ' + ', '.join(v['attributes']['appStoreState'] for v in vs))
    return editable[0]


def version_locs(ver_id, fiche):
    locs = {l['attributes']['locale']: l for l in call('GET', f'/appStoreVersions/{ver_id}/appStoreVersionLocalizations?limit=50')['data']}
    out = {}
    for loc in LOCALES:
        f = fiche.get(loc)
        attrs = {'supportUrl': SUPPORT}
        if f:
            attrs.update(description=f['description'], keywords=f['keywords'], promotionalText=f['promotionalText'])
        if loc in locs:
            call('PATCH', f"/appStoreVersionLocalizations/{locs[loc]['id']}", {'data': {'type': 'appStoreVersionLocalizations', 'id': locs[loc]['id'], 'attributes': attrs}})
            out[loc] = locs[loc]['id']
        else:
            r = call('POST', '/appStoreVersionLocalizations', {'data': {'type': 'appStoreVersionLocalizations', 'attributes': dict(attrs, locale=loc),
                     'relationships': {'appStoreVersion': {'data': {'type': 'appStoreVersions', 'id': ver_id}}}}})
            out[loc] = r['data']['id']
        print('  version text', loc, 'ok')
    return out


def app_info(app, fiche):
    infos = call('GET', f"/apps/{app['id']}/appInfos")['data']
    info = next((i for i in infos if i['attributes'].get('appStoreState') not in ('READY_FOR_SALE', 'READY_FOR_DISTRIBUTION')), infos[0])
    locs = {l['attributes']['locale']: l for l in call('GET', f"/appInfos/{info['id']}/appInfoLocalizations?limit=50")['data']}
    name = next(iter(locs.values()))['attributes']['name'] if locs else app['attributes']['name']
    for loc in LOCALES:
        attrs = {'privacyPolicyUrl': PRIVACY}
        if fiche.get(loc):
            attrs['subtitle'] = fiche[loc]['subtitle']
        if loc in locs:
            call('PATCH', f"/appInfoLocalizations/{locs[loc]['id']}", {'data': {'type': 'appInfoLocalizations', 'id': locs[loc]['id'], 'attributes': attrs}})
        else:
            call('POST', '/appInfoLocalizations', {'data': {'type': 'appInfoLocalizations', 'attributes': dict(attrs, locale=loc, name=name),
                 'relationships': {'appInfo': {'data': {'type': 'appInfos', 'id': info['id']}}}}})
        print('  app info', loc, 'ok')


def media_set(kind, loc_id, display):
    rel, typ, attr = ('appScreenshotSets', 'appScreenshotSets', 'screenshotDisplayType') if kind == 'shot' else ('appPreviewSets', 'appPreviewSets', 'previewType')
    sets = call('GET', f'/appStoreVersionLocalizations/{loc_id}/{rel}?limit=50')['data']
    s = next((x for x in sets if x['attributes'][attr] == display), None)
    if not s:
        s = call('POST', f'/{typ}', {'data': {'type': typ, 'attributes': {attr: display},
                 'relationships': {'appStoreVersionLocalization': {'data': {'type': 'appStoreVersionLocalizations', 'id': loc_id}}}}})['data']
    child = 'appScreenshots' if kind == 'shot' else 'appPreviews'
    for old in call('GET', f"/{typ}/{s['id']}/{child}?limit=50")['data']:
        call('DELETE', f"/{child}/{old['id']}")
    return s['id']


def put_file(kind, set_id, path):
    data = open(path, 'rb').read()
    name = os.path.basename(path)
    if kind == 'shot':
        typ, rel, attrs = 'appScreenshots', 'appScreenshotSet', {'fileName': name, 'fileSize': len(data)}
        set_type = 'appScreenshotSets'
    else:
        typ, rel, attrs = 'appPreviews', 'appPreviewSet', {'fileName': name, 'fileSize': len(data), 'mimeType': 'video/quicktime' if name.endswith('.mov') else 'video/mp4'}
        set_type = 'appPreviewSets'
    r = call('POST', f'/{typ}', {'data': {'type': typ, 'attributes': attrs, 'relationships': {rel: {'data': {'type': set_type, 'id': set_id}}}}})['data']
    ops = r['attributes']['uploadOperations']
    print('    ops', len(ops), [(o['offset'], o['length']) for o in ops][:3])
    upload(ops, data)
    call('PATCH', f"/{typ}/{r['id']}", {'data': {'type': typ, 'id': r['id'], 'attributes': {'uploaded': True, 'sourceFileChecksum': hashlib.md5(data).hexdigest()}}})
    print('   ', kind, name, len(data) // 1024, 'KB')


def sync(suffix, fiches):
    print('==', suffix)
    app = find_app(suffix)
    ver = edit_version(app['id'])
    fiche = fiches.get(suffix, {})
    locs = version_locs(ver['id'], fiche)
    app_info(app, fiche)
    if os.environ.get('ONLY_TEXT'):
        return
    base = os.path.join(HERE, 'media', suffix)
    shots = sorted(os.path.join(base, 'screens', f) for f in os.listdir(os.path.join(base, 'screens'))) if os.path.isdir(os.path.join(base, 'screens')) else []
    previews = sorted(os.path.join(base, 'previews', f) for f in os.listdir(os.path.join(base, 'previews'))) if os.path.isdir(os.path.join(base, 'previews')) else []
    for loc, loc_id in locs.items():
        if shots:
            sid = media_set('shot', loc_id, 'APP_IPHONE_67')
            for p in shots[:10]:
                put_file('shot', sid, p)
        if previews and os.environ.get('PREVIEWS'):
            pid = media_set('preview', loc_id, 'IPHONE_67')
            for p in previews[:3]:
                put_file('preview', pid, p)
        print('  media', loc, len(shots), 'screens,', len(previews), 'previews')


def check(suffix):
    app = find_app(suffix); ver = edit_version(app['id'])
    for l in call('GET', f"/appStoreVersions/{ver['id']}/appStoreVersionLocalizations?limit=50")['data']:
        sets = call('GET', f"/appStoreVersionLocalizations/{l['id']}/appScreenshotSets?include=appScreenshots&limit=50")
        prev = call('GET', f"/appStoreVersionLocalizations/{l['id']}/appPreviewSets?include=appPreviews&limit=50")
        st = [s['attributes'].get('assetDeliveryState', {}).get('state') for s in sets.get('included', [])]
        pv = [{k: v for k, v in s['attributes'].items() if k not in ('uploadOperations',)} for s in prev.get('included', [])]
        a = l['attributes']
        print(f"CHECK {suffix} {a['locale']} desc={len(a.get('description') or '')} kw={len(a.get('keywords') or '')} screens={st} previews={pv}")


GROUP = 'IPHONE_DYNAMIC_ISLAND_LARGE_PROFILE'   # iPhone 6.9"/6.7" (Dynamic Island, large)


def previews_v2(suffix):
    """App previews with the asset library API (the old appPreviews flow ends in ASSET_FAILED)."""
    print('== previews', suffix)
    base = os.path.join(HERE, 'media', suffix, 'previews')
    files = sorted(os.path.join(base, f) for f in os.listdir(base))[:3] if os.path.isdir(base) else []
    if not files:
        print('  no preview files'); return
    app = find_app(suffix)
    lib = call('GET', f"/apps/{app['id']}/assetLibrary")['data']['id']
    vids = []
    for n, path in enumerate(files, 1):
        data = open(path, 'rb').read()
        r = call('POST', '/appAssetLibraryVideos', {'data': {'type': 'appAssetLibraryVideos', 'attributes': {
            'fileName': os.path.basename(path), 'fileSize': len(data), 'category': 'APP_SCREENSHOTS_AND_PREVIEWS',
            'previewFrameTimeCode': '00:00:05:00', 'referenceName': f'{suffix} preview {n} {int(time.time())}'},
            'relationships': {'assetLibrary': {'data': {'type': 'appAssetLibraries', 'id': lib}}}}})['data']
        upload(r['attributes']['uploadOperations'], data)
        call('PATCH', f"/appAssetLibraryVideos/{r['id']}", {'data': {'type': 'appAssetLibraryVideos', 'id': r['id'], 'attributes': {'uploaded': True}}})
        print('  uploaded', os.path.basename(path), len(data) // 1024, 'KB ->', r['id'])
        vids.append(r['id'])
    ok = []
    for vid in vids:
        for _ in range(60):
            a = call('GET', f'/appAssetLibraryVideos/{vid}')['data']['attributes']
            if a['state'] not in ('AWAITING_UPLOAD', 'UPLOAD_COMPLETE'):
                break
            time.sleep(10)
        print('  video', vid, a['state'], json.dumps(a.get('stateDetails'))[:400], 'spec', a.get('specId'))
        if a['state'] == 'PREPARE_FOR_SUBMISSION':
            ok.append(vid)
    if not ok:
        return
    ver = edit_version(app['id'])
    for l in call('GET', f"/appStoreVersions/{ver['id']}/appStoreVersionLocalizations?limit=50")['data']:
        for old in call('GET', f"/appStoreVersionLocalizations/{l['id']}/placements?limit=50").get('data', []):
            at = old['attributes']
            if at.get('placementType') == 'APP_PREVIEW' and at.get('placementGroup') == GROUP:
                call('DELETE', f"/appAssetLibraryPlacements/{old['id']}")
        for vid in ok:
            p = call('POST', '/appAssetLibraryPlacements', {'data': {'type': 'appAssetLibraryPlacements',
                'attributes': {'placementType': 'APP_PREVIEW', 'placementGroup': GROUP},
                'relationships': {'video': {'data': {'type': 'appAssetLibraryVideos', 'id': vid}},
                                  'appStoreVersionLocalization': {'data': {'type': 'appStoreVersionLocalizations', 'id': l['id']}}}}})['data']
            print('  placement', l['attributes']['locale'], p['attributes'].get('state'))


if __name__ == '__main__':
    fiches = json.load(open(os.path.join(HERE, 'fiches-appstore.json'), encoding='utf-8'))
    if os.environ.get('PREVIEWS2'):
        bad = []
        for g in sys.argv[1:]:
            try:
                previews_v2(g)
            except Exception as e:
                print('  FAILED', g, e); bad.append(g)
        sys.exit(1 if bad else 0)
    if os.environ.get('REFDATA'):
        r = call('GET', '/appAssetLibraryRefData')
        s = json.dumps(r)
        print('REFDATA', len(s))
        print(s[:12000])
        sys.exit(0)
    if os.environ.get('LOOTBOX'):
        # games whose card packs are random and can be bought with a currency sold for money: declare it (age rating)
        for g in sys.argv[1:]:
            app = find_app(g)
            infos = call('GET', f"/apps/{app['id']}/appInfos?include=ageRatingDeclaration")['data']
            info = next((i for i in infos if i['attributes'].get('appStoreState') not in ('READY_FOR_SALE', 'READY_FOR_DISTRIBUTION')), infos[0])
            aid = info['relationships']['ageRatingDeclaration']['data']['id']
            r = call('PATCH', f'/ageRatingDeclarations/{aid}', {'data': {'type': 'ageRatingDeclarations', 'id': aid, 'attributes': {'lootBox': True}}})
            print('LOOTBOX', g, r['data']['attributes'].get('lootBox'))
        sys.exit(0)
    if os.environ.get('BUILDS'):
        for g in sys.argv[1:]:
            app = find_app(g)
            b = call('GET', f"/builds?filter[app]={app['id']}&sort=-uploadedDate&limit=2&include=buildBetaDetail")
            det = {x['id']: x['attributes'] for x in b.get('included', [])}
            for x in b['data']:
                d = det.get(x['relationships']['buildBetaDetail']['data']['id'], {})
                print(f"BUILD {g} v{x['attributes']['version']} {x['attributes']['processingState']} internal={d.get('internalBuildState')} uploaded={x['attributes']['uploadedDate'][:16]}")
        sys.exit(0)
    if os.environ.get('CHECK_ONLY'):
        for g in sys.argv[1:]:
            check(g)
        sys.exit(0)
    games = sys.argv[1:] or sorted(d for d in os.listdir(os.path.join(HERE, 'media')) if os.path.isdir(os.path.join(HERE, 'media', d)))
    failed = []
    for g in games:
        try:
            sync(g, fiches)
        except Exception as e:
            print('  FAILED', g, e); failed.append(g)
    for g in games:
        try:
            check(g)
        except Exception as e:
            print('  check failed', g, e)
    print('done; failed:', failed)
    sys.exit(1 if failed else 0)
