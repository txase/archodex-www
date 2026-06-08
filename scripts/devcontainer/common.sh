#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/.devcontainer/compose.yaml"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-archodex-www-dev}"
DEVCONTAINER_SERVICE="${DEVCONTAINER_SERVICE:-web}"
ASTRO_DEV_URL="${ASTRO_DEV_URL:-http://127.0.0.1:4321/}"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-${REPO_ROOT}}"

export COMPOSE_PROJECT_NAME
export WORKSPACE_ROOT

compose() {
  docker compose -f "${COMPOSE_FILE}" "$@"
}

load_project_env() {
  if [[ -f "${REPO_ROOT}/.vscode/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${REPO_ROOT}/.vscode/.env"
    set +a
  fi

  export PUBLIC_ARCHODEX_DOMAIN="${PUBLIC_ARCHODEX_DOMAIN:-localhost}"
  export PUBLIC_POSTHOG_PROJECT_API_KEY="${PUBLIC_POSTHOG_PROJECT_API_KEY:-}"
}

container_id() {
  compose ps -q "${DEVCONTAINER_SERVICE}"
}

container_running() {
  local id
  id="$(container_id)"
  [[ -n "${id}" ]] || return 1
  [[ "$(docker inspect -f '{{.State.Running}}' "${id}" 2>/dev/null)" == "true" ]]
}

url_ready() {
  curl -fsS --max-time 2 "${ASTRO_DEV_URL}" >/dev/null
}
