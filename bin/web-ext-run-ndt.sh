#!/usr/bin/env bash
set -eu
BASE_DIR="$(dirname "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )")"
exec yarn web-ext run --firefox "$("$BASE_DIR/bin/find-nightly.sh")" -s dist "$@"