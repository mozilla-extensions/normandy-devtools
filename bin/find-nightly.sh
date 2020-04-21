#!/usr/bin/env bash

set -eu

BASE_DIR="$(dirname "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )")"
CONFIG_PATH="$BASE_DIR/.nightly-path"

# First check the environment variable
if [[ -v WEB_EXT_BROWSER ]]; then
    echo $WEB_EXT_BROWSER
    exit 0
fi

# Then check the file
if [[ -f "$CONFIG_PATH" ]]; then
    head -n 1 "$CONFIG_PATH"
    exit 0
fi

if which nightly > /dev/null; then
    which nightly
    exit 0
fi

(
    cat <<HERE
Couldn't automatically determine a path to Nightly. Do one of the following:

* Type the full path to an installation of Firefox Nightly and press enter.
  This will be stored in $CONFIG_PATH and remembered for the future.

* Press ctrl-c to exit this script and set the environment variable
  \$WEB_EXT_BROWSER to a path to Nightly. Then re-run this command.

* Press ctrl-c to exit this script and make a command 'nightly' available on
  your PATH. This will be used automatically.

HERE
) | fold >&2


while true; do
    read -p '> ' NIGHTLY_PATH
    if which "$NIGHTLY_PATH" > /dev/null; then
        if "$NIGHTLY_PATH" --version | grep 'Mozilla Firefox [0-9]\+\.0a1' > /dev/null; then
            echo $(which $NIGHTLY_PATH) > "$CONFIG_PATH"
            head -n 1 "$CONFIG_PATH"
            exit 0
        else
            echo -n "Executable at $NIGHTLY_PATH doesn't seem like Firefox Nightly. "
        fi
    else
        echo -n "No executable found at $NIGHTLY_PATH. "
    fi
    echo "Try again, or try another option"
done

exit 1