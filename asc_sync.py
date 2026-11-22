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
PRIVACY = 'https://zackvision.fr/jeux/confidentialite/'
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
        raise RuntimeError(f'{method} {path} -> {r.status_code} {r.text[:2500]}')


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
    for loc, l in locs.items():   # every other store language gets the same privacy URL
        if loc not in LOCALES:
            call('PATCH', f"/appInfoLocalizations/{l['id']}", {'data': {'type': 'appInfoLocalizations', 'id': l['id'], 'attributes': {'privacyPolicyUrl': PRIVACY}}})


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
    if os.environ.get('COPYRIGHT'):
        for g in sys.argv[1:]:
            ver = edit_version(find_app(g)['id'])
            call('PATCH', f"/appStoreVersions/{ver['id']}", {'data': {'type': 'appStoreVersions', 'id': ver['id'], 'attributes': {'copyright': os.environ['COPYRIGHT']}}})
            print('COPYRIGHT', g, 'ok')
        sys.exit(0)
    if os.environ.get('IAPDESC'):
        # iapdesc.json: {productId: {locale: description}}  (descriptions only, names and prices untouched)
        data = json.load(open(os.path.join(HERE, 'iapdesc.json'), encoding='utf-8'))
        apps = {}
        for pid, locs in data.items():
            g = pid.split('.')[2]
            if g not in apps:
                apps[g] = {i['attributes']['productId']: i['id'] for i in call('GET', f"/apps/{find_app(g)['id']}/inAppPurchasesV2?limit=50")['data']}
            iid = apps[g][pid]
            for l in call("GET", f"https://api.appstoreconnect.apple.com/v2/inAppPurchases/{iid}/inAppPurchaseLocalizations?limit=50")['data']:
                d = locs.get(l['attributes']['locale'])
                if d:
                    assert len(d) <= 55, d
                    call('PATCH', f"/inAppPurchaseLocalizations/{l['id']}", {'data': {'type': 'inAppPurchaseLocalizations', 'id': l['id'], 'attributes': {'description': d}}})
                    print('IAPDESC', pid, l['attributes']['locale'], d)
        sys.exit(0)
    if os.environ.get('CANCELSUB'):
        # cancel the app's review submission still waiting (to resubmit it with its first in-app purchases), never deletes anything
        for g in sys.argv[1:]:
            app = find_app(g)
            for x in call('GET', f"/reviewSubmissions?filter[app]={app['id']}&filter[platform]=IOS&limit=10")['data']:
                st = x['attributes'].get('state')
                if st in ('WAITING_FOR_REVIEW', 'READY_FOR_REVIEW'):
                    r = call('PATCH', f"/reviewSubmissions/{x['id']}", {'data': {'type': 'reviewSubmissions', 'id': x['id'], 'attributes': {'canceled': True}}})
                    print('CANCELSUB', g, st, '->', r['data']['attributes'].get('state'))
                else:
                    print('CANCELSUB', g, 'keep', st)
        sys.exit(0)
    if os.environ.get('SUBMIT'):
        # App Review submission, ONLY on Zack's written go in the Developer session ("Oui soumet", 22/11/2026 for Gull Street + Silk Hop)
        import re as _re
        for g in sys.argv[1:]:
            app = find_app(g); ver = edit_version(app['id'])
            if not app['attributes'].get('contentRightsDeclaration'):
                call('PATCH', f"/apps/{app['id']}", {'data': {'type': 'apps', 'id': app['id'], 'attributes': {'contentRightsDeclaration': 'DOES_NOT_USE_THIRD_PARTY_CONTENT'}}}); print('SUBMIT', g, 'content rights: no third-party content')
            subs = call('GET', f"/reviewSubmissions?filter[app]={app['id']}&filter[platform]=IOS&limit=10")['data']
            sub = next((x for x in subs if x['attributes'].get('state') == 'READY_FOR_REVIEW'), None)
            if not sub:
                sub = call('POST', '/reviewSubmissions', {'data': {'type': 'reviewSubmissions', 'attributes': {'platform': 'IOS'}, 'relationships': {'app': {'data': {'type': 'apps', 'id': app['id']}}}}})['data']
            items = call('GET', f"/reviewSubmissions/{sub['id']}/items?limit=20&include=appStoreVersion")['data']
            if not any(((it.get('relationships') or {}).get('appStoreVersion') or {}).get('data') for it in items):
                try:
                    call('POST', '/reviewSubmissionItems', {'data': {'type': 'reviewSubmissionItems', 'relationships': {'reviewSubmission': {'data': {'type': 'reviewSubmissions', 'id': sub['id']}}, 'appStoreVersion': {'data': {'type': 'appStoreVersions', 'id': ver['id']}}}}})
                    print('SUBMIT', g, 'version item added')
                except Exception as e:
                    msg = str(e); print('SUBMIT', g, 'ITEM ERR', ' | '.join(_re.findall(r'"(?:code|detail|title)" : "([^"]+)"', msg))[:2500]); continue
            for iap in ([] if os.environ.get('DRAFT_ONLY') and not os.environ.get('WITH_IAP') else call('GET', f"/apps/{app['id']}/inAppPurchasesV2?limit=50")['data']):
                a = iap['attributes']
                if a['state'] != 'READY_TO_SUBMIT':
                    print('SUBMIT', g, 'iap', a['productId'].split('.')[-1], a['state'], 'skipped'); continue
                try:
                    call('POST', '/inAppPurchaseSubmissions', {'data': {'type': 'inAppPurchaseSubmissions', 'relationships': {'inAppPurchaseV2': {'data': {'type': 'inAppPurchases', 'id': iap['id']}}}}})
                    print('SUBMIT', g, 'iap', a['productId'].split('.')[-1], 'queued')
                except Exception as e:
                    print('SUBMIT', g, 'iap', a['productId'].split('.')[-1], 'ERR', ' | '.join(_re.findall(r'"(?:code|detail)" : "([^"]+)"', str(e)))[:600])
            if os.environ.get('DRAFT_ONLY'):
                print('SUBMIT', g, 'draft only, items:', [ (it.get('relationships') or {}).keys() and it['id'] for it in call('GET', f"/reviewSubmissions/{sub['id']}/items?limit=30")['data']]); continue
            try:
                r = call('PATCH', f"/reviewSubmissions/{sub['id']}", {'data': {'type': 'reviewSubmissions', 'id': sub['id'], 'attributes': {'submitted': True}}})
                print('SUBMIT', g, 'submission', r['data']['attributes'].get('state'))
            except Exception as e:
                print('SUBMIT', g, 'SUBMIT ERR', ' | '.join(_re.findall(r'"(?:code|detail)" : "([^"]+)"', str(e)))[:2500])
            v = call('GET', f"/appStoreVersions/{ver['id']}")['data']['attributes']
            print('SUBMIT', g, 'version', v.get('versionString'), v.get('appStoreState'))
        sys.exit(0)
    if os.environ.get('ADSRATING'):
        # age rating: the app shows ads (AdMob), never submits
        for g in sys.argv[1:]:
            infos = call('GET', f"/apps/{find_app(g)['id']}/appInfos?include=ageRatingDeclaration")['data']
            info = next((i for i in infos if i['attributes'].get('appStoreState') not in ('READY_FOR_SALE', 'READY_FOR_DISTRIBUTION')), infos[0])
            aid = info['relationships']['ageRatingDeclaration']['data']['id']
            r = call('PATCH', f'/ageRatingDeclarations/{aid}', {'data': {'type': 'ageRatingDeclarations', 'id': aid, 'attributes': {'advertising': True}}})
            print('ADSRATING', g, r['data']['attributes'].get('advertising'), 'lootBox', r['data']['attributes'].get('lootBox'))
        sys.exit(0)
    if os.environ.get('LOOTBOX_OFF'):
        for g in sys.argv[1:]:
            infos = call('GET', f"/apps/{find_app(g)['id']}/appInfos?include=ageRatingDeclaration")['data']
            info = next((i for i in infos if i['attributes'].get('appStoreState') not in ('READY_FOR_SALE', 'READY_FOR_DISTRIBUTION')), infos[0])
            aid = info['relationships']['ageRatingDeclaration']['data']['id']
            r = call('PATCH', f'/ageRatingDeclarations/{aid}', {'data': {'type': 'ageRatingDeclarations', 'id': aid, 'attributes': {'lootBox': False}}})
            print('LOOTBOX_OFF', g, r['data']['attributes'].get('lootBox'))
        sys.exit(0)
    if os.environ.get('SETKW'):
        # setkw.json: {suffix: {locale: keywords}}; other locales untouched
        data = json.load(open(os.path.join(HERE, 'setkw.json'), encoding='utf-8'))
        for g, locs in data.items():
            ver = edit_version(find_app(g)['id'])
            for l in call('GET', f"/appStoreVersions/{ver['id']}/appStoreVersionLocalizations?limit=50")['data']:
                kw = locs.get(l['attributes']['locale'])
                if kw:
                    assert len(kw) <= 100, kw
                    call('PATCH', f"/appStoreVersionLocalizations/{l['id']}", {'data': {'type': 'appStoreVersionLocalizations', 'id': l['id'], 'attributes': {'keywords': kw}}})
                    print('SETKW', g, l['attributes']['locale'], kw)
        sys.exit(0)
    if os.environ.get('RMKW'):
        word = os.environ['RMKW'].lower()
        for g in sys.argv[1:]:
            ver = edit_version(find_app(g)['id'])
            for l in call('GET', f"/appStoreVersions/{ver['id']}/appStoreVersionLocalizations?limit=50")['data']:
                kws = [k for k in (l['attributes'].get('keywords') or '').split(',') if k]
                new = [k for k in kws if k.strip().lower() not in (word, 'アニメ', '动漫', '動漫', '애니메이션', 'аниме')]
                if new != kws:
                    call('PATCH', f"/appStoreVersionLocalizations/{l['id']}", {'data': {'type': 'appStoreVersionLocalizations', 'id': l['id'], 'attributes': {'keywords': ','.join(new)}}})
                print('RMKW', g, l['attributes']['locale'], len(kws) - len(new), 'removed')
        sys.exit(0)
    if os.environ.get('ADDKW'):
        # Zack's explicit choice (22/11, warned about guideline 2.3.7): add one keyword to every store language of an app
        word = os.environ['ADDKW']
        for g in sys.argv[1:]:
            ver = edit_version(find_app(g)['id'])
            for l in call('GET', f"/appStoreVersions/{ver['id']}/appStoreVersionLocalizations?limit=50")['data']:
                kws = [k for k in (l['attributes'].get('keywords') or '').split(',') if k]
                if word in kws:
                    print('ADDKW', g, l['attributes']['locale'], 'already'); continue
                kws.insert(1, word)
                while len(','.join(kws)) > 100:
                    kws.pop()
                call('PATCH', f"/appStoreVersionLocalizations/{l['id']}", {'data': {'type': 'appStoreVersionLocalizations', 'id': l['id'], 'attributes': {'keywords': ','.join(kws)}}})
                print('ADDKW', g, l['attributes']['locale'], ','.join(kws))
        sys.exit(0)
    if os.environ.get('SETBUILD'):
        # attach build SETBUILD (e.g. 1009, release ADS_TEST=0) to the version being edited, then print the S1 checklist; never submits
        want = os.environ['SETBUILD']
        for g in sys.argv[1:]:
            app = find_app(g); ver = edit_version(app['id'])
            bs = call('GET', f"/builds?filter[app]={app['id']}&filter[version]={want}&limit=5")['data']
            if not bs:
                print('SETBUILD', g, 'build', want, 'not found'); continue
            b = bs[0]
            call('PATCH', f"/appStoreVersions/{ver['id']}/relationships/build", {'data': {'type': 'builds', 'id': b['id']}})
            cur = call('GET', f"/appStoreVersions/{ver['id']}/build")['data']
            print('SETBUILD', g, 'version', ver['attributes'].get('versionString'), ver['attributes'].get('appStoreState'), '-> build', cur['attributes']['version'], cur['attributes'].get('processingState'))
            rd = call('GET', f"/appStoreVersions/{ver['id']}/appStoreReviewDetail", ok=(200, 404)).get('data')
            if rd:
                n = rd['attributes'].get('notes') or ''
                att = call('GET', f"/appStoreReviewDetails/{rd['id']}/appStoreReviewAttachments?limit=50")['data']
                print('  notes', len(n), 'chars, UMP/ATT sentence:', 'App Tracking Transparency prompt' in n, '| attachments', [x['attributes'].get('fileName') for x in att])
            info = call('GET', f"/apps/{app['id']}/appInfos")['data']
            for i in info:
                ar = call('GET', f"/appInfos/{i['id']}/ageRatingDeclaration", ok=(200, 404)).get('data')
                if ar: print('  appInfo', i['attributes'].get('appStoreState') or i['attributes'].get('state'), 'lootBox', ar['attributes'].get('lootBox'), 'advertising', ar['attributes'].get('advertising'))
                for l in call('GET', f"/appInfos/{i['id']}/appInfoLocalizations?limit=50")['data']:
                    print('  privacy', l['attributes']['locale'], l['attributes'].get('privacyPolicyUrl'))
        sys.exit(0)
    if os.environ.get('ATTACH'):
        # App Review attachment: media/review/<suffix>.mp4 (Zack's iPhone screen recording) on the review details; never submits
        for g in sys.argv[1:]:
            path = os.path.join(HERE, 'media', 'review', g + '.mp4')
            ver = edit_version(find_app(g)['id'])
            rd = call('GET', f"/appStoreVersions/{ver['id']}/appStoreReviewDetail", ok=(200, 404)).get('data')
            if not rd:
                print('ATTACH', g, 'no review details: run review first'); continue
            name = 'gameplay-' + g + '.mp4'
            for old in call('GET', f"/appStoreReviewDetails/{rd['id']}/appStoreReviewAttachments?limit=50")['data']:
                if old['attributes'].get('fileName') == name:
                    call('DELETE', f"/appStoreReviewAttachments/{old['id']}"); print('ATTACH', g, 'replaced the previous', name)
            data = open(path, 'rb').read()
            r = call('POST', '/appStoreReviewAttachments', {'data': {'type': 'appStoreReviewAttachments', 'attributes': {'fileName': name, 'fileSize': len(data)},
                     'relationships': {'appStoreReviewDetail': {'data': {'type': 'appStoreReviewDetails', 'id': rd['id']}}}}})['data']
            upload(r['attributes']['uploadOperations'], data)
            call('PATCH', f"/appStoreReviewAttachments/{r['id']}", {'data': {'type': 'appStoreReviewAttachments', 'id': r['id'],
                 'attributes': {'uploaded': True, 'sourceFileChecksum': hashlib.md5(data).hexdigest()}}})
            st = call('GET', f"/appStoreReviewAttachments/{r['id']}")['data']['attributes'].get('assetDeliveryState')
            print('ATTACH', g, name, len(data) // 1024, 'KB', st)
        sys.exit(0)
    if os.environ.get('REVIEW'):
        # App Review contact: same as Kunai Gaiden (Zack's OK, 22/11); never submits anything
        src = edit_version(find_app('kunaigaiden')['id'])
        rd = call('GET', f"/appStoreVersions/{src['id']}/appStoreReviewDetail", ok=(200, 404)).get('data')
        keys = ('contactFirstName', 'contactLastName', 'contactPhone', 'contactEmail')
        contact = {k: rd['attributes'].get(k) for k in keys} if rd else None
        if not contact or not all(contact.values()):
            print('REVIEW no complete contact on Kunai Gaiden'); sys.exit(1)
        for g in sys.argv[1:]:
            ver = edit_version(find_app(g)['id'])
            cur = call('GET', f"/appStoreVersions/{ver['id']}/appStoreReviewDetail", ok=(200, 404)).get('data')
            notes_all = json.load(open(os.path.join(HERE, 'review-notes.json'), encoding='utf-8')) if os.path.exists(os.path.join(HERE, 'review-notes.json')) else {}
            attrs = dict(contact, demoAccountRequired=False, notes=notes_all.get(g) or notes_all.get('_default') or "No account needed.")
            if cur:
                call('PATCH', f"/appStoreReviewDetails/{cur['id']}", {'data': {'type': 'appStoreReviewDetails', 'id': cur['id'], 'attributes': attrs}})
            else:
                call('POST', '/appStoreReviewDetails', {'data': {'type': 'appStoreReviewDetails', 'attributes': attrs,
                     'relationships': {'appStoreVersion': {'data': {'type': 'appStoreVersions', 'id': ver['id']}}}}})
            print('REVIEW', g, 'ok')
        sys.exit(0)
    if os.environ.get('IAPSTATE'):
        for g in sys.argv[1:]:
            app = find_app(g)
            for iap in call('GET', f"/apps/{app['id']}/inAppPurchasesV2?limit=50")['data']:
                a = iap['attributes']
                print('IAPSTATE', g, a['productId'].split('.')[-1], a['state'])
        sys.exit(0)
    if os.environ.get('IAPSHOT'):
        # App Review screenshot of every in-app purchase: media/<suffix>/iap-review.jpg (the shop screen)
        for g in sys.argv[1:]:
            app = find_app(g)
            path = os.path.join(HERE, 'media', g, 'iap-review.jpg')
            for iap in call('GET', f"/apps/{app['id']}/inAppPurchasesV2?limit=50")['data']:
                pid = iap['attributes']['productId']
                cur = call('GET', f"/inAppPurchases/{iap['id']}/appStoreReviewScreenshot", ok=(200, 404))
                if cur.get('data'):
                    st = (cur['data']['attributes'].get('assetDeliveryState') or {}).get('state')
                    if st == 'COMPLETE':
                        print('IAPSHOT', pid, 'already'); continue
                    call('DELETE', f"/inAppPurchaseAppStoreReviewScreenshots/{cur['data']['id']}")
                if not os.path.exists(path):
                    print('IAPSHOT', pid, 'MISSING file'); continue
                data = open(path, 'rb').read()
                r = call('POST', '/inAppPurchaseAppStoreReviewScreenshots', {'data': {'type': 'inAppPurchaseAppStoreReviewScreenshots',
                    'attributes': {'fileName': 'iap-review.jpg', 'fileSize': len(data)},
                    'relationships': {'inAppPurchaseV2': {'data': {'type': 'inAppPurchases', 'id': iap['id']}}}}})['data']
                upload(r['attributes']['uploadOperations'], data)
                call('PATCH', f"/inAppPurchaseAppStoreReviewScreenshots/{r['id']}", {'data': {'type': 'inAppPurchaseAppStoreReviewScreenshots', 'id': r['id'],
                    'attributes': {'uploaded': True, 'sourceFileChecksum': hashlib.md5(data).hexdigest()}}})
                print('IAPSHOT', pid, 'uploaded', iap['attributes'].get('state'))
        sys.exit(0)
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
        def walk(o, path=''):
            if isinstance(o, dict):
                if 'frameRates' in o or 'dimensions' in o:
                    print('SPEC', path, json.dumps(o)[:600])
                for k, v in o.items():
                    walk(v, path + '.' + k)
            elif isinstance(o, list):
                for i, v in enumerate(o):
                    walk(v, path + f'[{i}]')
        walk(r)
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
            if not os.environ.get('ONLY_TEXT'):
                previews_v2(g)
        except Exception as e:
            print('  FAILED', g, e); failed.append(g)
    for g in games:
        try:
            check(g)
        except Exception as e:
            print('  check failed', g, e)
    print('done; failed:', failed)
    sys.exit(1 if failed else 0)
