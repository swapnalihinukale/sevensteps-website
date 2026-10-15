#!/bin/bash
set -euo pipefail

# Keep tool state and dependencies local while retaining the user's real home
# for read-only CLI discovery. Never copy or rewrite Codex authentication.
design_project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
design_runtime="$design_project_root/.design-tooling/runtime"
design_state="$design_project_root/.design-tooling/state"
design_node="$design_runtime/node_modules/node/bin/node"

if [[ ! -x "$design_node" ]]; then
  echo "Task-local Node is missing. Follow .design-tooling/README.md." >&2
  exit 1
fi
mkdir -p "$design_state/tmp"
chmod 700 "$design_state" "$design_state/tmp"

exec /usr/bin/env -i \
  HOME="${HOME:?The real user home must be available}" \
  PATH="$design_runtime/node_modules/.bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" \
  TMPDIR="$design_state/tmp/" \
  LANG=en_US.UTF-8 \
  OD_DATA_DIR="$design_state/data" \
  OD_BIND_HOST=127.0.0.1 \
  OPEN_DESIGN_VELA_TELEMETRY=0 \
  "$design_node" "$design_project_root/scripts/design-tooling.mjs" "$@"
