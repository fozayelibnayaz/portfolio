#!/usr/bin/env bash
set -euo pipefail

# Backwards-compatible alias. The safe deploy flow lives in deploy.sh.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy.sh" "$@"
