# Contributing

Thanks for helping. DAYS is a small, dependency-free client plugin.

## Development

```bash
git clone <repo>
cd days
node tests/check.mjs
```

Then install as a local bundle in a DSH profile:

```
plugin_manager install_bundle target=/absolute/path/to/days
```

Refresh the Harness window to see changes — client bundles are loaded per page load.

## Rules

1. All date, holiday, leave and balance logic lives in the pure engine section and must have tests in `tests/check.mjs`.
2. Views do not touch `localStorage` directly; go through `patch*` / `commit`.
3. Surfaces and text use `--dsw-alias-*` tokens; brand colors are decoration only.
4. Do not import Harness client packages; draw controls locally.
5. Never fabricate a feature: no placeholder buttons, no fake data, no "AI says it worked".
6. Keep `HOLIDAY_DATA` sourced from official notices; mark predicted years explicitly.

## Commit style

`feat:`, `fix:`, `docs:`, `test:`, `chore:` — one concern per commit.
