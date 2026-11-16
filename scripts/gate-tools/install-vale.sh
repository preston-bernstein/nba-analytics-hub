#!/usr/bin/env bash
# Installs the pinned Vale for scripts/writing-validate.sh. Pack: writing, rule writing-one-gate.
#
#   install-vale.sh DEST_DIR
#
# The sha256 below comes from the official vale_3.27.0_checksums.txt of the release. To upgrade, change
# both values together and check the new checksum against that file.
set -euo pipefail

VALE_VERSION="3.27.0"
VALE_SHA256="c80d62f6bce87b81843ac5b512a26e63213927b957adba0a64fc594570da2000"
VALE_URL="https://github.com/vale-cli/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz"

TMP_DIR=""

log() { echo "install-vale: $*" >&2; }
die() {
  log "$*"
  exit "${2:-1}"
}

main() {
  local dest
  [ "$#" -eq 1 ] || die "usage: install-vale.sh DEST_DIR" 2
  dest="$1"
  command -v curl >/dev/null 2>&1 || die "missing tool: curl" 127
  command -v sha256sum >/dev/null 2>&1 || die "missing tool: sha256sum" 127

  TMP_DIR="$(mktemp -d)"
  trap 'rm -rf "$TMP_DIR"' EXIT

  curl --fail --silent --show-error --location --output "$TMP_DIR/vale.tar.gz" "$VALE_URL"
  echo "${VALE_SHA256}  $TMP_DIR/vale.tar.gz" | sha256sum --check --status || die "checksum mismatch for $VALE_URL"
  mkdir -p "$dest"
  tar -xzf "$TMP_DIR/vale.tar.gz" -C "$dest" vale
  log "installed vale ${VALE_VERSION} in $dest"
}

main "$@"
