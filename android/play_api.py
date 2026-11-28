"""Google Play Developer API helper (service account play-publisher@zack-vision-jeux, key kept OUTSIDE the repo in
~/.zv-secrets/play-publisher.json). Usage:
  python play_api.py check <package>                     -> opens and discards an edit (proves the access)
  python play_api.py upload <flavor> <signed.aab> [track] -> uploads the bundle and puts it on the track (default internal)
  python play_api.py listing <flavor>                    -> pushes android/store/<flavor>/listing.json, icon and screenshots
                                                            (store/<flavor>/screens-<lang>/ per language, else screens/)
  python play_api.py promote <flavor> <versionCode>      -> puts that bundle on the production track (completed, 100 %)
"""
import json, os, sys
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

KEY = os.path.join(os.path.expanduser('~'), '.zv-secrets', 'play-publisher.json')
HERE = os.path.dirname(os.path.abspath(__file__))
API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications'
UP = 'https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications'


def session():
    cred = service_account.Credentials.from_service_account_file(KEY, scopes=['https://www.googleapis.com/auth/androidpublisher'])
    cred.refresh(Request())
    s = requests.Session(); s.headers['Authorization'] = 'Bearer ' + cred.token
    return s


def ok(r):
    if r.status_code >= 300:
        raise RuntimeError(f'{r.request.method} {r.url.split("?")[0]} -> {r.status_code} {r.text[:1500]}')
    return r.json() if r.content else {}


def edit(s, pkg):
    return ok(s.post(f'{API}/{pkg}/edits'))['id']


def main():
    cmd = sys.argv[1]; s = session()
    if cmd == 'check':
        pkg = sys.argv[2]; e = edit(s, pkg)
        print('edit ok', pkg); ok(s.delete(f'{API}/{pkg}/edits/{e}'))
    elif cmd == 'upload':
        f, aab = sys.argv[2], sys.argv[3]; track = sys.argv[4] if len(sys.argv) > 4 else 'internal'
        pkg = 'com.zvisionclub.' + f; e = edit(s, pkg)
        with open(aab, 'rb') as fh:
            b = ok(s.post(f'{UP}/{pkg}/edits/{e}/bundles?uploadType=media', data=fh, headers={'Content-Type': 'application/octet-stream'}, timeout=600))
        vc = b['versionCode']; print('bundle', vc)
        ok(s.put(f'{API}/{pkg}/edits/{e}/tracks/{track}', json={'track': track, 'releases': [{'versionCodes': [str(vc)], 'status': 'completed' if track in ('internal', 'production') else 'draft'}]}))
        print('commit', ok(s.post(f'{API}/{pkg}/edits/{e}:commit')).get('id'))
    elif cmd == 'listing':
        f = sys.argv[2]; pkg = 'com.zvisionclub.' + f; d = os.path.join(HERE, 'store', f); e = edit(s, pkg)
        lst = json.load(open(os.path.join(d, 'listing.json'), encoding='utf-8'))
        for lang, x in lst.items():
            sd = 'screens-' + lang if os.path.isdir(os.path.join(d, 'screens-' + lang)) else 'screens'   # per-language shots when present
            ok(s.put(f'{API}/{pkg}/edits/{e}/listings/{lang}', json={'language': lang, **x})); print('listing', lang)
            for kind, files in (('icon', ['icon-512.png']), ('featureGraphic', [x for x in ('feature.png', 'feature-1024x500.jpg') if os.path.exists(os.path.join(d, x))][:1]),
                                ('phoneScreenshots', sorted(os.listdir(os.path.join(d, sd))) if os.path.isdir(os.path.join(d, sd)) else [])):
                if not files: continue
                ok(s.delete(f'{API}/{pkg}/edits/{e}/listings/{lang}/{kind}'))
                for fn in files:
                    p = os.path.join(d, fn) if kind != 'phoneScreenshots' else os.path.join(d, sd, fn)
                    ct = 'image/png' if p.endswith('.png') else 'image/jpeg'
                    with open(p, 'rb') as fh:
                        ok(s.post(f'{UP}/{pkg}/edits/{e}/listings/{lang}/{kind}?uploadType=media', data=fh, headers={'Content-Type': ct}))
                print(' ', kind, len(files))
        print('commit', ok(s.post(f'{API}/{pkg}/edits/{e}:commit')).get('id'))
    elif cmd == 'promote':
        f, vc = sys.argv[2], sys.argv[3]; pkg = 'com.zvisionclub.' + f; e = edit(s, pkg)
        ok(s.put(f'{API}/{pkg}/edits/{e}/tracks/production', json={'track': 'production', 'releases': [{'versionCodes': [str(vc)], 'status': 'completed'}]}))
        print('production', vc, 'commit', ok(s.post(f'{API}/{pkg}/edits/{e}:commit')).get('id'))
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
