# Privacy

LifeOS is local-first.

- **Stored locally**: profile (name, birth date, sex, retirement settings), countdowns, leave records, goals, time-capsule letters, achievements and settings — all in the browser's `localStorage` under `lifeos/store`.
- **Never transmitted**: LifeOS v1.0 makes no network requests. There is no analytics, no crash reporting, no remote sync.
- **Not given to the model**: no Host Tool is registered, so no model can read these values. If agent tools are added later, capsule bodies and personal letters will stay out of any model context by default.
- **Export/import** is manual: you choose the file, it stays on your machine.
- **Deleting**: "Reset local data" clears `lifeos/store`. The legacy `countdown/store/v1` payload is left untouched so the old plugin can still be used.
- **Backups**: the exporter writes a plain JSON file. Treat it like a diary — it is not encrypted.

If you use a shared browser profile, anyone with access to it can read this data through developer tools. Use a separate profile for sensitive entries.
