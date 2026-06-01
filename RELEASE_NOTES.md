# Hope & Fear — v0.1.0

First public release of the Encounter Designer for Daggerheart: a web-based
tool for building balanced encounters for the Daggerheart tabletop RPG.

## Highlights

- 🎲 Encounter builder with automatic battle point calculations
- 📚 Searchable adversary library with tier and attribute filters
- ⚖️ Difficulty scaling (easy / hard modes, damage boosts)
- 📊 Real-time budget tracking with visual progress bars
- 🧪 32 passing tests (Vitest + Testing Library)
- 🐳 Docker-first workflow; production image runs rootless on Nginx
- 🛡️ Built on Chainguard low-CVE base images
- 🚀 CI on every push and PR via GitHub Actions

## Run it

### From GHCR (no clone required)

```sh
docker run --rm -p 8080:80 ghcr.io/gruffled/ded:v0.1.0
# → http://localhost:8080
```

Multi-arch images are published for `linux/amd64` and `linux/arm64`.

### From source

```sh
git clone https://github.com/gruffled/ded.git
cd ded
make dev   # → http://localhost:5173
```

Without Docker:

```sh
npm install && npm run dev
```

## Known limitations

- Encounter state is not persisted between sessions
- Adversary data is bundled; no in-app editor for custom adversaries
- Single-user only; no sharing or export

## Acknowledgements

This work includes material from the **Daggerheart System Reference Document 1.0**
by Darrington Press LLC ([daggerheart.com/srd](https://daggerheart.com/srd)), used
under the [Darrington Press Community Gaming License](https://darringtonpress.com/license).

Daggerheart is © Darrington Press, LLC. This project is an unofficial, fan-made
tool and is not affiliated with, endorsed, or sponsored by Darrington Press.

## What's next

Tracked in [Issues](https://github.com/gruffled/ded/issues) — feedback and PRs
welcome.
