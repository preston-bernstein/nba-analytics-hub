#!/bin/sh
# sh-allow: nostrict legacy script with no bats test yet; strict mode would change its error handling
# sh-allow: posix kept as #!/bin/sh: it runs where bash may be absent (container or appliance)
# Load the raw archive into Postgres. Run on the NAS as root (sudo).
# Usage: load.sh [endpoint ...]   (default: every folder under raw/)
# Reloads each endpoint inside one transaction, so a failed load changes nothing.
set -eu
BASE=${BASE:-/volume1/docker/nba-data}
DOCKER=${DOCKER:-/usr/local/bin/docker}
PG=${PG:-nba-postgres}
PSQL="$DOCKER exec -i $PG psql -v ON_ERROR_STOP=1 -U nba -d nba"
NODE="$DOCKER run --rm -v $BASE/ingest:/app:ro -v $BASE/archive:/data:ro -w /app node:22-alpine node load.mjs"

$PSQL -c 'create schema if not exists bdl;'
endpoints=${*:-$(ls "$BASE/archive/raw")}
for e in $endpoints; do
  {
    echo 'begin;'
    $NODE sql /data "$e"
    echo "truncate bdl.$e;"
    echo "copy bdl.$e (job_key, page_no, row_no, fetched_at, source_url, data) from stdin csv;"
    $NODE csv /data "$e"
    printf '\\.\n'
    echo 'commit;'
  } | $PSQL -q
  n=$($PSQL -tAc "select count(*) from bdl.$e")
  echo "$e: $n rows"
done
