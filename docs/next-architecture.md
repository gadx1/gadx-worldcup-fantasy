# Next Architecture

**Project:** GADX World Cup Draw  
**Purpose:** Define the target architecture for moving from local prototype to private Cloudflare-backed application.  
**Audience:** Developer / technical reviewer  
**Last updated:** 2026-06-23

---

## 1. Objective

The current app is a functional local prototype using React, TypeScript, Tailwind CSS, mock data, and `localStorage`.

The next architecture moves the app toward a private production-ready setup:

```text
Cloudflare Pages
Cloudflare Access
Cloudflare Workers
Cloudflare D1
GitHub
```

The goal is to replace local persistence with backend persistence while preserving the current product behavior.

---

## 2. Target Architecture

```text
User Browser / iPhone PWA
        |
        v
Cloudflare Access
        |
        v
Cloudflare Pages Frontend
        |
        v
Cloudflare Worker API
        |
        v
Cloudflare D1 Database
        |
        v
Optional Football Data Provider
```

---

## 3. Target Responsibilities

### 3.1 Cloudflare Pages

Responsibilities:

- host the React frontend;
- deploy automatically from GitHub;
- serve the app from a private subdomain;
- support preview deployments later.

Target domain:

```text
gadx-worldcup.gadielanalytics.com
```

Alternative domains:

```text
worldcup.gadielanalytics.com
fantasy.gadielanalytics.com
```

---

### 3.2 Cloudflare Access

Responsibilities:

- protect the app URL;
- allow access only to approved emails;
- authenticate users using email OTP;
- pass identity headers to the Worker/API layer.

Access answers:

```text
Can this person reach the app?
```

It does not replace application-level authorization.

---

### 3.3 Cloudflare Workers

Responsibilities:

- expose API routes;
- read Cloudflare Access identity headers;
- resolve users;
- enforce admin/viewer authorization;
- read/write D1;
- validate requests;
- execute draw operations server-side;
- execute scoring recalculations;
- expose future sync endpoints;
- hide external API keys from the frontend.

---

### 3.4 Cloudflare D1

Responsibilities:

- store users;
- store tournaments;
- store player setup;
- store teams;
- store matches;
- store match events;
- store draws;
- store team assignments;
- store scoring rules;
- store standings or derived snapshots;
- store audit logs.

D1 becomes the source of truth.

---

### 3.5 GitHub

Responsibilities:

- source control;
- commit history;
- pull requests later;
- deployment trigger;
- CI/CD later;
- release tags later.

---

## 4. Migration Principle

The migration should not rewrite the product at once.

Recommended approach:

```text
Step 1: Keep current UI and local logic.
Step 2: Add Worker API.
Step 3: Add D1 schema.
Step 4: Seed backend with current mock data.
Step 5: Replace local reads with API reads.
Step 6: Replace local writes with API writes.
Step 7: Keep localStorage only for non-authoritative UI preferences.
```

The app should remain usable after each milestone.

---

## 5. Recommended Backend Project Structure

Recommended future structure:

```text
gadx-worldcup-fantasy/
  src/
    components/
    data/
    hooks/
    lib/
    pages/
    types/
  worker/
    src/
      index.ts
      routes/
        health.ts
        me.ts
        tournaments.ts
        players.ts
        teams.ts
        matches.ts
        draws.ts
        standings.ts
      middleware/
        auth.ts
        errors.ts
      services/
        tournaments.ts
        players.ts
        teams.ts
        matches.ts
        draws.ts
        scoring.ts
      db/
        client.ts
        schema.ts
      utils/
    migrations/
      0001_initial_schema.sql
      0002_seed_reference_data.sql
    wrangler.toml
  docs/
    local-prototype-status.md
    next-architecture.md
  README.md
```

Alternative later: monorepo with `apps/web`, `workers/api`, and `packages/shared`. For now, a simple `worker/` folder is enough.

---

## 6. API Surface Draft

### 6.1 Health

```text
GET /api/health
```

Purpose:

- validate Worker is running;
- validate environment;
- later validate D1 binding.

Example response:

```json
{
  "ok": true,
  "service": "gadx-worldcup-api",
  "version": "0.1.0"
}
```

---

### 6.2 Current User

```text
GET /api/me
```

Purpose:

- read authenticated user identity;
- return application role;
- return accessible tournaments.

Future response:

```json
{
  "id": "user_admin",
  "email": "admin@example.com",
  "displayName": "GADX Admin",
  "globalRole": "admin",
  "status": "active"
}
```

---

### 6.3 Tournaments

```text
GET /api/tournaments
POST /api/tournaments
GET /api/tournaments/:id
PATCH /api/tournaments/:id
```

Admin can create/update tournaments.

Viewer can only read tournaments where they have access.

---

### 6.4 Players

```text
GET /api/tournaments/:id/players
POST /api/tournaments/:id/players
PATCH /api/tournaments/:id/players/:playerId
```

Admin only for create/update.

Viewer read-only.

---

### 6.5 Teams

```text
GET /api/teams
GET /api/tournaments/:id/eligible-teams
POST /api/tournaments/:id/recalculate-eligible-teams
```

Admin can manage recalculation.

Viewer can read eligible/assigned team context.

---

### 6.6 Draws

```text
GET /api/tournaments/:id/draw
POST /api/tournaments/:id/draw/preview
POST /api/tournaments/:id/draw/lock
POST /api/tournaments/:id/draw/reset
```

Recommended production design:

- preview draw should generate a draft assignment server-side;
- lock draw should persist final assignment;
- after lock, reset should be admin-only and probably development-only or require explicit confirmation.

---

### 6.7 Matches

```text
GET /api/tournaments/:id/matches
PATCH /api/matches/:matchId
POST /api/tournaments/:id/matches/reset
```

Admin can edit scores manually.

Viewer can read match results.

---

### 6.8 Standings

```text
GET /api/tournaments/:id/standings
POST /api/tournaments/:id/recalculate-standings
```

Standings can be computed on read or materialized in D1.

Initial recommendation:

```text
Compute from source data in API response.
```

Later, materialize snapshots if needed.

---

## 7. D1 Schema Draft

Initial tables:

```text
users
tournaments
tournament_users
players
teams
matches
match_events
draws
team_assignments
scoring_rules
audit_log
```

Optional later:

```text
standings_snapshots
access_requests
provider_sync_log
```

---

## 8. Authorization Model

### 8.1 Roles

Target roles:

```text
admin
viewer
```

Potential future statuses:

```text
pending
blocked
```

### 8.2 Access Rules

Admin can:

- create tournaments;
- edit tournament metadata;
- edit players;
- preview draw;
- re-draw;
- lock draw;
- reset local/development draw;
- edit matches;
- invite viewers;
- manage scoring rules.

Viewer can:

- read assigned tournaments;
- read assigned teams;
- read leaderboard;
- read match results;
- read tournament progress.

Viewer cannot:

- create tournaments;
- edit tournament metadata;
- edit players;
- run draw;
- lock draw;
- reset draw;
- edit match results;
- manage users.

---

## 9. Data Migration from Local Prototype

### 9.1 Current Source Files

Seedable prototype data currently exists in:

```text
src/data/mockTournaments.ts
src/data/mockPlayers.ts
src/data/mockTeams.ts
src/data/mockMatches.ts
src/data/mockScoringRules.ts
src/data/mockUsers.ts
```

### 9.2 Migration Strategy

Use mock files as source references for D1 seed scripts.

Target seed order:

1. users;
2. tournaments;
3. tournament_users;
4. players;
5. teams;
6. matches;
7. scoring_rules;
8. draws and assignments only if needed for a demo tournament.

---

## 10. LocalStorage Migration Strategy

Current local storage should be gradually retired.

### 10.1 Keep Temporarily

Can remain for:

- temporary draft UI state;
- last selected tournament;
- collapsed UI sections;
- local dev reset helpers.

### 10.2 Remove as Source of Truth

Must be replaced by D1:

- tournament metadata;
- players;
- matches;
- locked draw assignments;
- scoring rules;
- users;
- access permissions.

---

## 11. Cloudflare Worker Milestones

### Milestone 3.0 — Worker Skeleton

Deliverables:

- install Wrangler;
- create `worker/` folder;
- create `/api/health`;
- run Worker locally;
- document local Worker command.

Suggested commit:

```text
Add Cloudflare Worker skeleton
```

---

### Milestone 3.1 — D1 Schema and Migrations

Deliverables:

- create D1 database;
- create migration folder;
- create initial SQL schema;
- apply migrations locally;
- apply migrations remotely later.

Suggested commit:

```text
Add D1 schema migrations
```

---

### Milestone 3.2 — Seed Data

Deliverables:

- seed users;
- seed tournament;
- seed players;
- seed teams;
- seed matches;
- seed scoring rules.

Suggested commit:

```text
Seed D1 with prototype data
```

---

### Milestone 3.3 — API Reads

Deliverables:

- frontend fetches tournament from API;
- frontend fetches players from API;
- frontend fetches matches from API;
- frontend fetches teams from API.

Suggested commit:

```text
Read tournament data from API
```

---

### Milestone 3.4 — API Writes

Deliverables:

- save tournament edits through API;
- save player edits through API;
- save match edits through API;
- save/lock draw through API.

Suggested commit:

```text
Write tournament data through API
```

---

## 12. Future Live Results Architecture

The current app supports manual results.

Future API-based results should use:

```text
Cloudflare Cron Trigger
→ Worker sync job
→ football data provider
→ D1 match updates
→ scoring recalculation
```

Recommended provider abstraction:

```ts
interface ResultsProvider {
  syncFixtures(): Promise<void>
  syncLiveMatches(): Promise<void>
  syncMatchEvents(matchId: string): Promise<void>
  syncStandings(): Promise<void>
}
```

Recommended modes:

```text
manual
api-ready
api-live
```

The app should always allow manual override.

---

## 13. Deployment Strategy

### 13.1 Frontend

Deploy with:

```text
Cloudflare Pages
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

### 13.2 Worker

Deploy with Wrangler:

```bash
npx wrangler deploy
```

### 13.3 Database

Use D1 migrations:

```bash
npx wrangler d1 migrations apply <database_name> --local
npx wrangler d1 migrations apply <database_name> --remote
```

### 13.4 Secrets

Use Worker secrets for external API keys:

```bash
npx wrangler secret put FOOTBALL_API_KEY
```

Never expose API keys in frontend code.

---

## 14. Risks and Decisions to Revisit

### 14.1 Authentication

Initial recommendation:

```text
Cloudflare Access + approved emails + OTP
```

Revisit if:

- access requests need to be fully self-service;
- user management must happen entirely inside the app;
- custom magic links become necessary.

### 14.2 Real-Time Scores

Initial recommendation:

```text
Manual results first.
API-ready architecture second.
Near-real-time polling later.
```

Revisit provider choice closer to real tournament usage.

### 14.3 Multiple Tournaments

The current prototype uses one tournament.

Backend schema must support multiple tournaments from the start.

### 14.4 Draw Immutability

Product rule:

```text
Once a draw is locked, it cannot be changed for that tournament.
```

Any reset/unlock operation should be admin-only and audited.

---

## 15. Recommended Immediate Next Step

Proceed with:

```text
Milestone 3.0 — Cloudflare Worker Skeleton
```

Before doing so, confirm:

1. Cloudflare account access is ready.
2. Wrangler can be installed locally.
3. The intended production subdomain is selected.
4. D1 database name is selected.

Recommended D1 database name:

```text
gadx_worldcup_draw
```

Recommended Worker name:

```text
gadx-worldcup-api
```

Recommended Pages project name:

```text
gadx-worldcup-draw
```

---

## 16. Suggested Commit for This Document

```text
Document next architecture
```
