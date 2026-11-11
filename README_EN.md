# DAYS — Days Are Yours

**Make Every Day Count.**

![Version](https://img.shields.io/github/v/tag/zeasonvan/Days-Are-Yours) ![License](https://img.shields.io/github/license/zeasonvan/Days-Are-Yours)

![DAYS](assets/banner.svg)

DAYS (Days Are Yours) is a personal life assistant plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It keeps retirement countdowns, statutory holidays, leave planning, a month calendar, off-work and payday countdowns, small daily joys, a wishlist and time capsules in one side-panel.

Repository: **Days-Are-Yours** · Package: `@local/days` · Version: 1.5.3

All data stays in the browser (`localStorage`). No account, no API key, no telemetry. The optional weather bar sends the chosen city's coordinates to Open-Meteo; with no city set, the app never goes online.

## Features

- **Life clock** — retirement countdown using China's phased retirement rules (or a manual date), career progress, custom countdowns with yearly repeat.
- **Holiday hub** — real State Council holiday periods for 2025–2027 including make-up workdays, next-holiday card, yearly list, annual-leave balance, leave records, leave planner with longest/cheapest/best-value sort.
- **Calendar** — month grid with holiday, make-up and leave markers, day details, yearly holiday list.
- **Fun lab** — off-work and payday countdowns, playful daily indices, a daily quote, the Time Blob mascot with XP and achievements.
- **Me** — profile and retirement settings, work schedule, wishlist progress, time capsules that unlock on a date, language switch, JSON export/import/reset.
- **Data** — local-first, versioned, one-time migration from the legacy countdown plugin.

## Install

Install the folder as a local bundle for the current DSH profile (`plugin_manager install_bundle target=/absolute/path/to/days`), then refresh the Harness window.

> The storage key `lifeos/store` is intentionally unchanged by the LifeOS → DAYS rename, so upgrades keep existing data; JSON exported by 1.0 still imports.

## Test

```bash
node tests/check.mjs
```

## Docs

- [Technical audit](docs/TECHNICAL_AUDIT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Harness integration](docs/HARNESS_INTEGRATION.md)
- [Roadmap](docs/ROADMAP.md)

## License

[MIT](LICENSE)
