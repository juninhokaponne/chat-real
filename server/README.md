# Chat Real - Server

This folder contains a minimal NestJS backend for authentication used in the Chat Real project. It implements email/password signup/signin and Google OAuth using JWTs.

Quick start

1. Install dependencies

```bash
cd server
npm install
```

2. Create an `.env` file based on `.env.example` and set values.

3. Start the server

```bash
npm run start:dev
```

Run tests

```bash
npm test
```

Additional notes

- Session and refresh token security:
	- Refresh tokens are signed JWTs with a unique `jti` claim. The server stores only a SHA256 hash of the `jti` in the database to reduce risk if the DB is compromised.
	- Refresh tokens are rotated on use: the old `jti` is removed and a new refresh JWT is issued.
	- Endpoints provided:
		- `POST /auth/revoke-all` — revoke all refresh sessions for a user (logout everywhere).
		- `GET /auth/sessions/:userId` — list active sessions (owner only).
		- `POST /auth/revoke-session` — revoke a single session by `{ userId, jti }` (owner only).

## Google OAuth setup

Generate credentials at Google Cloud Console and set the `OAUTH_GOOGLE_CLIENT_ID`, `OAUTH_GOOGLE_CLIENT_SECRET`, and `OAUTH_GOOGLE_CALLBACK` environment variables. Do not commit these to the repo.

## Smoke tests

- PowerShell smoke test: `server\smoke.ps1`.
- Node smoke test: `node server/smoke_node.js`.

## CI

A GitHub Actions workflow at `.github/workflows/ci.yml` runs the test suite on push and PRs.
