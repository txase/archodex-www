# Archodex.com website source code

The archodex.com website is a static site forked from the [AstroWind template](https://github.com/arthelokyo/astrowind).
It is built using [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/). The static assets are
hosted from a CDN.

## Development

The website can be run in development mode using the following commands:

```bash
npm install
npm run dev
```

There is a Visual Studio Code task named `Astro dev server` that can also be used to start the server.

### Devcontainer workflow

The shared development environment runs Astro in Docker using `node:lts`. It publishes the dev server at
<http://localhost:4321> and keeps Linux `node_modules` in a Docker volume so they do not conflict with host
dependencies.

Start or repair the devcontainer:

```bash
./scripts/devcontainer/start
```

Force a restart:

```bash
./scripts/devcontainer/start --restart
```

Run project commands inside the devcontainer:

```bash
./scripts/devcontainer/exec npm run check
```

Watch the Astro dev-server output:

```bash
./scripts/devcontainer/logs
```

Stop the devcontainer without deleting it or its volumes:

```bash
./scripts/devcontainer/stop
```

The Visual Studio Code tasks `Devcontainer: start Astro dev server`, `Devcontainer: show Astro logs`, and
`Devcontainer: stop` expose the same commands. Git workflows stay on the host instead of passing Git credentials into
the container.
