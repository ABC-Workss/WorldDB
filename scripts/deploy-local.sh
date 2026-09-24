#!/usr/bin/env bash
set -Eeuo pipefail

port="${WORLDDB_PORT:-4174}"
deploy_id="${DEPLOY_ID:-manual-$(date +%s)}"

if [[ ! "$port" =~ ^[0-9]+$ ]] || ((port < 1 || port > 65535)); then
  echo "WORLDDB_PORT precisa ser uma porta valida." >&2
  exit 1
fi

if [[ ! "$deploy_id" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "DEPLOY_ID invalido." >&2
  exit 1
fi

for command_name in pm2 curl ss; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Dependencia ausente no servidor: $command_name" >&2
    exit 1
  fi
done

process_name="worlddb"
project_dir="$HOME/projetos/worlddb"
backup_dir="$project_dir/backup"
temp_dir="$project_dir/temp"
release_dir="$temp_dir/$deploy_id"
current_dist="$project_dir/dist"
previous_dist="$project_dir/dist.previous"
started_new_process=0

if [[ "$release_dir" != "$project_dir/temp/"* ]]; then
  echo "Diretorio temporario inesperado: $release_dir" >&2
  exit 1
fi

if [[ ! -d dist ]]; then
  echo "A pasta dist nao foi gerada." >&2
  exit 1
fi

if ! pm2 describe "$process_name" >/dev/null 2>&1 && ss -ltn | grep -Eq ":${port}[[:space:]]"; then
  echo "A porta $port ja esta em uso por outro processo." >&2
  exit 1
fi

mkdir -p "$project_dir" "$backup_dir" "$temp_dir"
rm -rf "$release_dir"
mkdir -p "$release_dir"
cp -a dist "$release_dir/dist"

if [[ -d "$current_dist" ]]; then
  cp -a "$current_dist" "$backup_dir/dist_$(date +%Y-%m-%d_%H-%M-%S)"
fi

rm -rf "$previous_dist"
if [[ -d "$current_dist" ]]; then
  mv "$current_dist" "$previous_dist"
fi
mv "$release_dir/dist" "$current_dist"

rollback() {
  echo "Falha na publicacao; restaurando a versao anterior." >&2
  rm -rf "$current_dist"
  if [[ -d "$previous_dist" ]]; then
    mv "$previous_dist" "$current_dist"
  fi

  if ((started_new_process == 1)); then
    pm2 delete "$process_name" >/dev/null 2>&1 || true
  elif pm2 describe "$process_name" >/dev/null 2>&1; then
    pm2 restart "$process_name" --update-env >/dev/null 2>&1 || true
  fi
}

if pm2 describe "$process_name" >/dev/null 2>&1; then
  if ! pm2 restart "$process_name" --update-env; then
    rollback
    exit 1
  fi
else
  started_new_process=1
  if ! pm2 serve "$current_dist" "$port" --name "$process_name" --spa; then
    rollback
    exit 1
  fi
fi

if ! curl --fail --silent --show-error "http://127.0.0.1:$port/" >/dev/null \
  || ! curl --fail --silent --show-error "http://127.0.0.1:$port/jogar" >/dev/null \
  || ! curl --fail --silent --show-error "http://127.0.0.1:$port/explorar" >/dev/null; then
  rollback
  exit 1
fi

rm -rf "$previous_dist" "$release_dir"
pm2 save
echo "WorldDB publicado com sucesso na porta $port."
