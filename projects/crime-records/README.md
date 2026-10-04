# Casebook

Casebook is a local, JSON-backed prototype for organizing fictional police case records. It includes a dashboard, searchable people, case, and officer directories, individual profiles with case histories or assignments, and forms for adding and updating records. People can also be archived without deleting their linked history.

## Run locally

Requires Node.js 18 or newer. From this folder, run:

```powershell
npm start
```

Open http://127.0.0.1:4174. Set the `PORT` environment variable to use a different port.

## Separate JSON collections

`data/suspects.json`, `data/cases.json`, and `data/officers.json` are independent collections. New people, cases, and officer profiles are saved to their corresponding JSON files. Portraits in the sample data are illustrative photos; new people records may use an HTTPS image URL or a local `/portraits/` path (put local image files in the `portraits` folder).

## Important limitations

This is a learning prototype, **not** an operational law-enforcement or criminal-records system. It has no sign-in, access controls, audit log, encryption at rest, retention controls, verified identity matching, backups, or legal/compliance review. Its sample records are fictional and its portrait photos are illustrative. The local-only server binds to `127.0.0.1`; it must not be exposed to a network. Do not enter real personal, investigative, or criminal-history information. A production system requires qualified legal, privacy, security, and records-management review, strict role-based access, verified data provenance, due-process safeguards, and a secure deployment architecture.

Case allegations and outcomes are deliberately kept distinct. A charge is not a finding of guilt; verify official sources and applicable disclosure, correction, retention, and expungement requirements before relying on or retaining any record.
