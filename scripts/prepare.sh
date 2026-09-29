#!/usr/bin/env bash
# Creates or switches to a work branch, syncs it with the base branch, and reinstalls dependencies
# when the lockfile changed. Usage: scripts/prepare.sh [short-description] [-full]
set -euo pipefail

readonly DEFAULT_BRANCH="main"
readonly HANDLE="dadky"                 # empty when branch names carry no handle segment
readonly SYNC_STRATEGY="merge"   # merge | rebase

full_clean=false
description=""

for arg in "$@"; do
  case "$arg" in
    -full | --full) full_clean=true ;;
    *)
      if [[ -z "$description" ]]; then
        description="$arg"
      else
        echo "error: unexpected argument '$arg'" >&2
        exit 2
      fi
      ;;
  esac
done

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

# Untracked files do not block a branch switch; modified tracked files do.
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "error: uncommitted changes. Commit or stash them before preparing a branch." >&2
  git status --short --untracked-files=no >&2
  exit 1
fi

start_head="$(git rev-parse HEAD)"

if [[ "$full_clean" == true ]]; then
  echo "==> full clean: deleting this project's node_modules and build outputs"
  # The app root plus, in a monorepo, each workspace package — never a search of the whole tree, so a
  # source folder that happens to be called "build" or "out" is never touched.
  for base in "$repo_root" "$repo_root"/apps/* "$repo_root"/packages/*; do
    [[ -d "$base" ]] || continue
    if [[ -d "$base/node_modules" ]]; then
      # Unlink symlinks and Windows junctions first, without following them: pnpm links workspace and
      # `pnpm link` packages that way, and a recursive delete through a junction deletes its target.
      find "$base/node_modules" -type l -exec rm -f {} +
      rm -rf "$base/node_modules"
    fi
    for dir in .next dist build out .react-router .turbo .open-next .wrangler coverage \
      playwright-report test-results blob-report; do
      rm -rf "${base:?}/$dir"
    done
  done
fi

echo "==> fetching origin"
git fetch origin --prune

sync_with_base() {
  local branch="$1"
  if [[ "$SYNC_STRATEGY" == "rebase" ]]; then
    # Rebasing rewrites commits; only safe while nothing of this branch is on the remote.
    if git show-ref --verify --quiet "refs/remotes/origin/$branch" &&
      [[ -n "$(git rev-list "origin/$DEFAULT_BRANCH..origin/$branch")" ]]; then
      echo "warning: '$branch' has pushed commits — merging instead of rebasing" >&2
      git merge --no-edit "origin/$DEFAULT_BRANCH"
    else
      git rebase "origin/$DEFAULT_BRANCH"
    fi
  else
    git merge --no-edit "origin/$DEFAULT_BRANCH"
  fi
}

# Installs when the lockfile changed since the script started, or after a full clean.
install_if_needed() {
  if [[ "$full_clean" == true ]] || ! git diff --quiet "$start_head" HEAD -- pnpm-lock.yaml; then
    echo "==> pnpm-lock.yaml changed — installing dependencies"
    pnpm install --frozen-lockfile
  fi
  if ! git diff --quiet "$start_head" HEAD -- .node-version; then
    echo "warning: .node-version changed to $(cat .node-version) — switch Node (fnm use) before continuing" >&2
  fi
}

if [[ -z "$description" ]]; then
  current="$(git branch --show-current)"
  if [[ -z "$current" ]]; then
    echo "error: detached HEAD — pass a short description to create a branch." >&2
    exit 1
  fi
  if [[ "$current" == "$DEFAULT_BRANCH" ]]; then
    echo "==> fast-forwarding $DEFAULT_BRANCH"
    git merge --ff-only "origin/$DEFAULT_BRANCH"
  else
    echo "==> syncing '$current' with origin/$DEFAULT_BRANCH ($SYNC_STRATEGY)"
    sync_with_base "$current"
  fi
  install_if_needed
  echo "done: '$current' is up to date with origin/$DEFAULT_BRANCH"
  exit 0
fi

name="$description"
branch="$name"
[[ -n "$HANDLE" ]] && branch="$HANDLE/$name"

if git show-ref --verify --quiet "refs/heads/$branch"; then
  echo "==> switching to local branch '$branch'"
  git switch "$branch"
  sync_with_base "$branch"
elif git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
  echo "==> checking out '$branch' from origin"
  git switch --track "origin/$branch"
  sync_with_base "$branch"
else
  echo "==> creating '$branch' from origin/$DEFAULT_BRANCH"
  # --no-track: the new branch must not track the base branch, or a bare `git push` would target it.
  git switch --no-track --create "$branch" "origin/$DEFAULT_BRANCH"
fi

install_if_needed


echo "done: on '$branch'"
