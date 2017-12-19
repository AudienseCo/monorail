#!/usr/bin/env sh
set -e

# fills in the value of a variable from a file and exports it
file_env() {
	local var="$1"
	local fileVar="/app/config/${var}_SECRET"

	if [ -r "${fileVar}" ]; then
		val="$(cat "${fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

if [ "$1" = 'node' ]; then
    file_env 'GH_SECRET'
    file_env 'GH_TOKEN'
else
    echo "Not running node code, exiting..."
    exit 1
fi

exec "$@"
