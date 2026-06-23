# Local Prototype Status

**Project:** GADX World Cup Draw  
**Phase:** Local Prototype  
**Status:** Functional local prototype completed through Milestone 2.10  
**Audience:** Developer / technical reviewer  
**Last updated:** 2026-06-23

---

## 1. Purpose

This document captures the exact state of the local prototype before the project moves into the Cloudflare backend phase.

The goal is to preserve a clear baseline:

- what currently works;
- where the logic lives;
- what is still mocked;
- what is persisted locally;
- what needs to be replaced by backend services later.

This document should be updated whenever the local prototype changes meaningfully.

---

## 2. Current Local Prototype Scope

The app currently runs as a Vite + React + TypeScript local application.

It supports the full core gameplay loop locally:

```text
Edit tournament
→ Edit players
→ Calculate eligible teams
→ Run draw
→ Re-draw
→ Save & lock draw
→ Edit match results
→ Recalculate leaderboard
→ Review match results and scoring breakdown
```

The app is not yet connected to Cloudflare, D1, a backend API, real authentication, or live sports data.

---

## 3. Completed Local Features

### 3.1 Tournament Setup

Implemented in:

```text
src/components/TournamentSetupPanel.tsx
```

Current capabilities:

- edit tournament name;
- edit round name;
- edit round start date;
- edit round end date;
- select results mode: manual or API-ready;
- reset tournament metadata;
- persist tournament metadata in `localStorage`;
- automatically recalculate eligible teams when tournament dates change.

Locking behavior:

- tournament setup is editable before draw lock;
- tournament setup becomes read-only after draw lock.

---

### 3.2 Player Setup

Implemented in:

```text
src/components/PlayerSetupPanel.tsx
```

Current capabilities:

- edit first name;
- edit last name;
- edit display name;
- select avatar ID;
- reset players;
- persist player configuration in `localStorage`.

Locking behavior:

- player setup is editable before draw lock;
- player setup becomes read-only after draw lock.

---

### 3.3 Eligible Teams

Implemented in:

```text
src/lib/eligibility.ts
src/components/EligibleTeamsPanel.tsx
```

Current eligibility rule:

A team is eligible if:

- the team is active;
- the team has a match inside the tournament round window;
- the match status belongs to the draw pool.

Current draw-pool statuses:

```text
scheduled
live
halftime
fulltime
```

Important design decision:

A completed match inside the selected round window remains part of the draw pool. Eligibility for the draw is not the same thing as live match status.

---

### 3.4 Draft Draw Workflow

Implemented in:

```text
src/lib/draw.ts
src/components/DrawControlPanel.tsx
```

Current draw flow:

```text
Run Draw
→ Preview temporary assignment
→ Re-draw if needed
→ Save & Lock Draw
```

Current behavior:

- draw can only run if eligible teams divide equally across players;
- re-draw replaces the temporary assignment;
- save and lock persists the final assignment;
- once locked, the draw cannot be changed unless using the development-only reset control;
- locked draw persists in `localStorage`.

Current product rule:

```text
Draft assignments are temporary.
Locked assignments are authoritative.
```

---

### 3.5 Scoring Engine

Implemented in:

```text
src/lib/scoring.ts
```

Current scoring rules:

| Event | Points |
|---|---:|
| Win | +3 |
| Draw | +1 |
| Loss | 0 |
| Goal scored | +1 |
| Clean sheet | +1 |

Not yet implemented but already represented in the model:

- qualification bonus;
- group winner bonus.

Current behavior:

- calculate points by team and match;
- aggregate team points;
- map assigned teams to players;
- calculate player standings;
- rank players by total points and match points.

---

### 3.6 Leaderboard

Implemented in:

```text
src/components/LeaderboardPanel.tsx
```

Current capabilities:

- display rank;
- display player;
- display assigned teams;
- display match points;
- display bonus points;
- display total points;
- automatically recalculate when match results change.

---

### 3.7 Manual Match Result Editing

Implemented in:

```text
src/components/MatchAdminPanel.tsx
```

Current capabilities:

- edit match status;
- edit home score;
- edit away score;
- reset match results;
- persist match results in `localStorage`;
- allow match editing even after the draw is locked.

Important product rule:

```text
A locked draw prevents changing tournament/player setup.
A locked draw does not prevent changing match results.
```

---

### 3.8 Match Results Display

Implemented in:

```text
src/components/MatchResultsPanel.tsx
```

Current capabilities:

- display match date in Dublin time;
- display match status;
- display home and away teams;
- display score;
- display team points;
- display points breakdown:
  - result points;
  - goal points;
  - clean sheet points.

---

## 4. Local Persistence

Implemented with:

```text
src/hooks/useLocalStorageState.ts
```

Current local storage keys:

```text
gadx-worldcup-draw:locked-assignments
gadx-worldcup-draw:matches
gadx-worldcup-draw:players
gadx-worldcup-draw:tournament
```

Current local persistence is useful for prototype validation only.

It is not the final production source of truth.

Target future source of truth:

```text
Cloudflare D1
```

---

## 5. Current Mock Data

Mock data currently lives in:

```text
src/data/
```

Important files:

```text
src/data/mockTournaments.ts
src/data/mockPlayers.ts
src/data/mockTeams.ts
src/data/mockMatches.ts
src/data/mockScoringRules.ts
src/data/mockUsers.ts
src/data/appSections.ts
```

These mocks should be treated as seed/reference data for the future backend phase.

---

## 6. Current Components

```text
src/components/AppFooter.tsx
src/components/AppHeader.tsx
src/components/AppNavigation.tsx
src/components/DrawControlPanel.tsx
src/components/EligibleTeamsPanel.tsx
src/components/FeatureSections.tsx
src/components/LeaderboardPanel.tsx
src/components/MatchAdminPanel.tsx
src/components/MatchResultsPanel.tsx
src/components/MetricCard.tsx
src/components/PlayerSetupPanel.tsx
src/components/TournamentSetupPanel.tsx
```

---

## 7. Current Business Logic Files

```text
src/lib/draw.ts
src/lib/eligibility.ts
src/lib/scoring.ts
```

These files should remain framework-light and portable so that the same logic can later be reused or mirrored in Worker/API code.

---

## 8. Current Application Orchestration

The main orchestration layer is:

```text
src/App.tsx
```

Current responsibilities:

- load local tournament state;
- load local players state;
- load local match state;
- load locked draw state;
- calculate eligible teams;
- calculate draw readiness;
- calculate standings;
- pass derived data into UI components;
- handle local update/reset functions.

As the project grows, `App.tsx` should eventually be replaced by real routing and page-level containers.

---

## 9. Known Local Prototype Limitations

The local prototype does not yet support:

- real routes/pages;
- real authentication;
- real admin/viewer separation;
- real user invitations;
- multiple tournaments;
- backend persistence;
- Cloudflare Worker API;
- Cloudflare D1;
- Cloudflare Access;
- live sports API;
- official full World Cup 2026 team list;
- official full fixture list;
- tests;
- CI/CD;
- PWA installability;
- production deployment.

---

## 10. Recommended Local Hardening Before Backend

Before starting the backend phase, recommended cleanup items:

1. Add a development-only “Reset All Local Data” control.
2. Add empty states for:
   - no active assignments;
   - no eligible teams;
   - no completed matches.
3. Add basic tests for:
   - eligibility;
   - draw readiness;
   - fair draw;
   - scoring.
4. Add route-like organization or real routing.
5. Add a `docs/` folder with architecture notes.
6. Review naming consistency:
   - Tournament, not Scenario;
   - Draw, Draft Draw, Locked Draw;
   - Viewer, not Player User unless needed.

---

## 11. Local Validation Commands

Run local development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Check repository status:

```bash
git status
```

---

## 12. Suggested Commit for This Document

```text
Document local prototype status
```
