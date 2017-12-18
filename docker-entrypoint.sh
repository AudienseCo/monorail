#!/usr/bin/env bash
set -e

# fills in the value of a variable from a file and exports it
file_env() {
	local var="$1"
	local fileVar="/app/config/${var}_SECRET"

	if [ -r "${fileVar}" ]; then
		val="$(< "${fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

if [ "$1" = 'node' ]; then
    file_env 'secret'
    file_env 'token'
else
    echo "Not running node code, exiting..."
    exit 1
fi

exec "$@"
