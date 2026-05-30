#!/usr/bin/env bash
# Regenerate the ed25519 updater signing keypair.
# Run this once; then add the outputs as GitHub repository secrets.
#
# Usage: bash scripts/gen-updater-keys.sh
#
# Required GitHub repository secrets (Settings → Secrets → Actions):
#   TAURI_SIGNING_PRIVATE_KEY          ← the "Private:" base64 blob printed below
#   TAURI_SIGNING_PRIVATE_KEY_PASSWORD ← the password you entered when prompted
#
# The public key is already committed to src-tauri/tauri.conf.json under
# plugins.updater.pubkey.  If you regenerate the keypair you MUST update
# that value too — otherwise existing installs will reject future update packages.

set -euo pipefail

cd "$(dirname "$0")/.."

echo ""
echo "=== whisperium updater keypair generator ==="
echo ""
pnpm tauri signer generate
echo ""
echo "Next steps:"
echo "  1. Copy the 'Private:' value above."
echo "  2. Go to https://github.com/Satcomx00-x00/Whisperium/settings/secrets/actions"
echo "  3. Create secret  TAURI_SIGNING_PRIVATE_KEY  with that value."
echo "  4. Create secret  TAURI_SIGNING_PRIVATE_KEY_PASSWORD  with the password you chose."
echo "  5. Copy the 'Public:' value above into src-tauri/tauri.conf.json → plugins.updater.pubkey"
echo "     (only needed if you are rotating keys)."
echo ""
