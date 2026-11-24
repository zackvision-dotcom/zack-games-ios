#!/bin/bash
# Usage: bash play_release.sh flavor... : fetch the CI release AAB (branch aab-<flavor>), sign it with the local upload key
# (~/.zv-secrets, never in git), upload to the internal track and push the store listing.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; W="${TMPDIR:-/tmp}/zv-aab"; mkdir -p "$W"
source "$HOME/.zv-secrets/android-upload.env"
for f in "$@"; do
  echo "== $f"
  curl -sfL -o "$W/$f.aab" "https://raw.githubusercontent.com/zackvision-dotcom/zack-games-ios/aab-$f/$f.aab" || { echo "  no AAB"; continue; }
  jarsigner -sigalg SHA256withRSA -digestalg SHA-256 -keystore "$ANDROID_KEYSTORE" -storepass "$ANDROID_KEYSTORE_PASSWORD" \
    -keypass "$ANDROID_KEY_PASSWORD" -signedjar "$W/$f-signed.aab" "$W/$f.aab" "$ANDROID_KEY_ALIAS" >/dev/null 2>&1 || { echo "  sign failed"; continue; }
  python "$HERE/play_api.py" upload "$f" "$W/$f-signed.aab" internal 2>&1 | tail -2 | sed 's/^/  /'
  [ -f "$HERE/store/$f/listing.json" ] && python "$HERE/play_api.py" listing "$f" 2>&1 | tail -1 | sed 's/^/  listing /'
done
