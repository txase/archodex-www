# Codex Project Guidance

This project uses a repo-owned devcontainer for Node and Astro commands.

- Start or repair the devcontainer with `./scripts/devcontainer/start`.
- Run project commands through `./scripts/devcontainer/exec`, for example `./scripts/devcontainer/exec npm run check`.
- Read the Astro dev-server output with `./scripts/devcontainer/logs`.
- Stop the devcontainer with `./scripts/devcontainer/stop`; this stops the service without deleting the container or
  volumes.
- Keep Git workflows on the host. Do not inject Git credentials into the devcontainer.
- Use the Codex Browser plugin against `http://localhost:4321` after the devcontainer is running.
