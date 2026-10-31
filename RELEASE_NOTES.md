# Hope & Fear — Release Notes

## v0.3.0 — 2026-10-31

Daggerheart Designer now builds characters as well as encounters.

- **Character Builder:** create characters with class, subclass, ancestry (including Mixed Ancestry), community, traits, equipment, Experiences and domain cards. Save them in the browser, export and import JSON, and print a two-page character sheet and class guide.
- **Level Up (levels 2–10):** tier achievements, the advancement options with their slots, trait marking, upgraded subclass cards, multiclassing, a new domain card each level and optional card exchange. Stats, trait scores, Experiences and the printed sheet all reflect level-ups.
- **Equipment by tier:** weapons and armor from all four tiers, limited to the character's tier.
- **SRD-accurate data:** classes, subclasses, ancestries, communities, domain cards (levels 1–10), weapons and armor are generated from the SRD PDF by new extractor scripts instead of being typed by hand. Checking against the SRD corrected about half of the earlier level-1 domain card text, several subclass features and the weapon lists.
- **Encounter Builder:** filter adversaries by type and page through long lists; party size and level inputs can be cleared while typing; search no longer fails on adversaries with no type.
- **Printing:** the character sheet prints on exactly two pages.
- **Accessibility:** character builder form labels are now linked to their inputs.
- **Deployment:** the production image listens on an unprivileged port (8080); nginx returns 404 for missing data files and caches built assets; the release workflow runs lint, tests and the build before publishing and no longer tags pre-releases as `latest`.
- **Testing:** 92 JavaScript tests, 32 Python extractor/data tests, and Cypress browser smoke tests in CI.

Known limitations:

- Domain cards are listed together; the active loadout limit and vault are not tracked.
- Multiclassing lets you choose one class feature from the new class; the SRD says you gain "its class feature".
- Advancement slot counts are transcribed from the official character sheet because the SRD text does not list them.
- Changing class after levelling resets the character to level 1.

## v0.2.0 — 2026-10-06

- Imported 264 SRD 2.0 adversaries and 47 environments.
- Added SRD 2.0 Battle Point rules, Horde metadata, and grouped minion handling.
- Added active environment scene context without affecting Battle Point budgets.
- Added extractor and bundled-data regression tests.
- Switched the documented container workflow to Podman-first commands.
- 37 JavaScript tests passing, plus Python extractor/data regression coverage.

## v0.1.0

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

This work includes material from the **Daggerheart System Reference Document 2.0**
by Critical Role LLC ([daggerheart.com/srd](https://daggerheart.com/srd)), used
under the [Darrington Press Community Gaming License](https://darringtonpress.com/license).

Daggerheart is © Darrington Press, LLC. This project is an unofficial, fan-made
tool and is not affiliated with, endorsed, or sponsored by Darrington Press.

## What's next

Tracked in [Issues](https://github.com/gruffled/ded/issues) — feedback and PRs
welcome.
