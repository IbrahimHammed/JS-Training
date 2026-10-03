# LIGHT Hospital

A small, local EMR starter for managing hospital operations. The app has a responsive dashboard, searchable records, add/edit forms, profile photos, CSV exports, and separate employee and patient sign-in. Each record type is stored separately under `data/`; uploaded photos are kept under `uploads/`.

## Run locally

Requires Node.js 18 or newer. From this folder, run:

```powershell
npm start
```

Then open http://localhost:4173. Use `PORT=4174 npm start` to choose another port.

On first start, the server creates an administrator account for `maya.chen@example.test` and prints a random one-time password to the terminal. Sign in using the Employee option, issue individual accounts from **Accounts & access**, and share each temporary password directly with that person. Employees and patients can change their own passwords after signing in. Accounts require passwords of at least 12 characters.

The administrator can create patient and employee accounts only for existing records with an email address. Patient accounts receive a read-only portal with their own linked records. Do not share one account between people.

## Data files

`patients.json`, `staff.json`, `appointments.json`, `consultations.json`, `investigations.json`, `prescriptions.json`, `wards.json`, and `payments.json` are independent JSON collections. The local server reads and writes them directly. Records in this starter are fictional examples.

This is a local prototype, not a production clinical system, and it cannot guarantee privacy. It hashes passwords and protects JSON APIs with expiring, HTTP-only sessions and role checks, but clinical JSON files are **not encrypted at rest**, sessions are held in memory, and the app has no HTTPS, MFA, audit trail, automated backups, or compliance certification. Keep it bound to localhost, use only fictional data, and do not enter real patient information until a qualified security review and production-grade safeguards are in place.
