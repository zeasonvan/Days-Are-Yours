# Security policy

## Reporting

Open a private security advisory on GitHub, or contact the maintainer. Please do not file public issues for sensitive reports.

## Scope

DAYS runs inside the Harness renderer and keeps data in `localStorage`. Relevant risks:

- XSS through imported JSON strings rendered into React text nodes (React escapes by default; never use `dangerouslySetInnerHTML`).
- Data exfiltration — v1.0 performs no network calls; keep it that way unless explicitly documented.
- Time-capsule content should never be sent to a model by default.

## Non-goals

- Protecting data from other users of the same OS/browser profile.
- Encryption at rest (exported JSON is plain text).
