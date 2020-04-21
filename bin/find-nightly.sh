#!/usr/bin/env bash

# No -u because we're about to check a potentially unset variable.
set -e

# First check the environment variable
if [[ ! -z "$WEB_EXT_BROWSER" ]]; then
    echo $WEB_EXT_BROWSER
    exit 0
fi

# Now set -u, we're done with unset variables.
set -u

BASE_DIR="$(dirname "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )")"
CONFIG_PATH="$BASE_DIR/.nightly-path"

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
    echo -n '> '
    read NIGHTLY_PATH
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
