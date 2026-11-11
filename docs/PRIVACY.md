# Privacy

DAYS is local-first.

- **Stored locally**: profile (name, birth date, sex, retirement settings), countdowns, leave records, goals, time-capsule letters, achievements and settings — all in the browser's `localStorage` under `lifeos/store`.
- **Weather (optional)**: if you set a city, DAYS sends that city's latitude/longitude to [Open-Meteo](https://open-meteo.com/) to read the current weather, and caches the answer locally for 30 minutes. With no city set, the app makes no network requests at all. There is no analytics, no crash reporting, no remote sync.
- **Not given to the model**: no Host Tool is registered, so no model can read these values. If agent tools are added later, capsule bodies and personal letters will stay out of any model context by default.
- **Export/import** is manual: you choose the file, it stays on your machine.
- **Deleting**: "Reset local data" clears `lifeos/store`; the weather cache lives under `days/weather-cache:v1` and is cleared with the city. The legacy `countdown/store/v1` payload is left untouched so the old plugin can still be used.
- **Backups**: the exporter writes a plain JSON file. Treat it like a diary — it is not encrypted.

If you use a shared browser profile, anyone with access to it can read this data through developer tools. Use a separate profile for sensitive entries.
