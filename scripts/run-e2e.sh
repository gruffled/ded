#!/bin/sh
set -eu

container_engine="${CONTAINER_ENGINE:-podman}"
app_image="${PROD_IMAGE:-daggerheart-designer}"
app_container="${E2E_CONTAINER:-daggerheart-designer-e2e-app}"
app_port="${E2E_PORT:-8081}"

cleanup() {
  "$container_engine" rm --force "$app_container" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM
cleanup

"$container_engine" run --detach \
  --name "$app_container" \
  --publish "$app_port:8080" \
  "$app_image" >/dev/null

"$container_engine" run --rm \
  --network host \
  --volume "$(pwd):/e2e:Z" \
  --workdir /e2e \
  docker.io/cypress/included:15.16.0 \
  --browser chrome \
  --config "baseUrl=http://127.0.0.1:$app_port"
