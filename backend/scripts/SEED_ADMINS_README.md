# Seed Admin Users

Creates or updates **all** admin users (including master admin). Safe to run multiple times; existing admins are updated by email.

## Quick start

```bash
cd ScanBit-Backend
npm run seed:admins
```

Requires `MONGODB_URI` in `.env`. Admin list comes from one of the sources below (first that is set wins).

---

## 1. JSON file (recommended for multiple admins)

1. Copy the example file:
   ```bash
   cp scripts/seed-admins.example.json scripts/seed-admins.json
   ```
2. Edit `scripts/seed-admins.json` with real emails, names, and **strong** passwords.
3. Run:
   ```bash
   npm run seed:admins
   ```

**Format:** array of objects:

- `email` (required)
- `name` (optional; defaults to "Admin 1", "Admin 2", …)
- `password` (required) – must match User model: 8+ chars, one upper, one lower, one number, one special (`@$!%*?&`)
- `master` (optional, boolean) – `true` for master admin (full control; only one recommended)

**Example:**

```json
[
  { "email": "admin@scanbit.com", "name": "Master Admin", "password": "ChangeMe@123", "master": true },
  { "email": "support@scanbit.com", "name": "Support Admin", "password": "Support@456", "master": false }
]
```

`seed-admins.json` is in `.gitignore`; do not commit it.

---

## 2. Environment variable (CI / production)

Set `SEED_ADMINS` to a JSON array string:

```bash
export SEED_ADMINS='[{"email":"admin@scanbit.com","name":"Master Admin","password":"ChangeMe@123","master":true}]'
npm run seed:admins
```

Add env var `SEED_ADMINS` with the same JSON value (escape quotes as required), then run the seed command in a one-off or post-deploy step if desired.

---

## 3. Single master admin from env

If you only need one master admin, set:

- `MASTER_ADMIN_EMAIL` (required)
- `MASTER_ADMIN_PASSWORD` (optional; default `ChangeMe@123`)
- `MASTER_ADMIN_NAME` (optional; default `Master Admin`)

Then run `npm run seed:admins`. No file or `SEED_ADMINS` needed.

---

## Password rules

Passwords must satisfy the User model:

- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character: `@ $ ! % * ? &`

Example valid password: `Admin@123`.

---

## After seeding

- **Master admin** (`master: true`): full access; can manage other admins and plans.
- **Other admins** (`master: false`): admin role with `hasAdminAccess: true`; permissions can be refined via the admin API.

Log in at your frontend admin URL (e.g. `/admin/login`) with the seeded email and password.
