# GADX World Cup Draw

**Private fantasy tournament app by GADX.**

A local-first React/TypeScript prototype for creating private football tournaments, assigning national teams through a fair draw, editing match results manually, and calculating player leaderboards.

---

## 1. Project Status

**Current phase:** Local Prototype  
**Current milestone:** Milestone 2.11 — Local Prototype Hardening  
**Repository:** `gadx-worldcup-fantasy`  
**GitHub account:** `gadx1`  
**Visibility:** Private  
**Primary brand:** GADX  
**Target future hosting:** Cloudflare Pages  
**Target future private access:** Cloudflare Access  
**Target future database:** Cloudflare D1

The project currently runs locally on a MacBook using Vite, React, TypeScript, and Tailwind CSS. It already supports a complete local game flow using mock data and browser `localStorage`.

---

## 2. Product Summary

GADX World Cup Draw is a private fantasy tournament app for a small group of invited players.

The admin creates a tournament, configures up to six players, calculates eligible national teams, runs a random draw, previews the assignment, re-draws if needed, and finally saves and locks the draw.

Once the draw is locked, player and tournament setup become read-only. Match results can still be edited manually, and the leaderboard recalculates automatically.

The app is designed to evolve into a private Cloudflare-hosted PWA with admin/viewer access, persistent backend storage, and eventually API-based match result updates.

---

## 3. Current Functional Capabilities

The local prototype currently supports:

- Editable tournament setup.
- Editable player setup.
- Tournament metadata persisted in `localStorage`.
- Player configuration persisted in `localStorage`.
- Match results persisted in `localStorage`.
- Locked draw persisted in `localStorage`.
- Eligible team calculation based on tournament round window and match participation.
- Fair random draw.
- Re-draw before saving.
- Save and lock draw.
- Locked draw prevents player/tournament edits.
- Manual match result editing.
- Automatic leaderboard recalculation.
- Match result panel with points breakdown.
- Admin-oriented UI panels.
- Viewer-mode concept panel.
- GADX-branded shell.
- Tailwind-based responsive UI.
- Production build passing successfully.

---

## 4. Current User Flow

### 4.1 Admin Local Prototype Flow

1. Open the app locally.
2. Configure tournament metadata.
3. Configure players.
4. Review eligible teams.
5. Run draw.
6. Re-draw if the assignment is not acceptable.
7. Save and lock draw.
8. Edit match results manually.
9. Review leaderboard.
10. Review match result scoring breakdown.
11. Reset local draw/results/players/tournament during development if needed.

### 4.2 Future Viewer Flow

The viewer flow is not implemented yet as real authorization, but the target behavior is:

1. Viewer enters the private app URL.
2. Viewer authenticates using approved email.
3. Viewer sees only tournaments where they participate.
4. Viewer can view assigned teams, leaderboard, match results, and rules.
5. Viewer cannot create tournaments, edit players, run draws, or edit results.

---

## 5. Tech Stack

### 5.1 Current Local Prototype

- **Frontend:** React
- **Language:** TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Local persistence:** Browser `localStorage`
- **Package manager:** npm
- **Version control:** Git
- **Remote repository:** GitHub
- **Editor:** Visual Studio Code
- **Development machine:** MacBook

### 5.2 Planned Cloud Architecture

- **Frontend hosting:** Cloudflare Pages
- **API layer:** Cloudflare Workers
- **Database:** Cloudflare D1
- **Private access:** Cloudflare Access with email OTP
- **Scheduled sync jobs:** Cloudflare Workers Cron Triggers
- **Future result provider:** API-Football, Sportmonks, football-data.org, or equivalent provider, to be confirmed later
- **Future PWA support:** manifest, app icons, service worker

---

## 6. Architecture Direction

### 6.1 Current Local Layer

```text
React UI
  -> Mock data
  -> Local business logic
  -> localStorage persistence
```

### 6.2 Next Backend Layer

```text
React UI
  -> Cloudflare Worker API
  -> Cloudflare D1
```

### 6.3 Future Private Production Layer

```text
User Browser / iPhone PWA
  -> Cloudflare Access
  -> Cloudflare Pages
  -> Cloudflare Worker API
  -> Cloudflare D1
  -> Optional football data provider
```

---

## 7. Project Structure

```text
gadx-worldcup-fantasy/
  public/
  src/
    components/
      AppFooter.tsx
      AppHeader.tsx
      AppNavigation.tsx
      DrawControlPanel.tsx
      EligibleTeamsPanel.tsx
      FeatureSections.tsx
      LeaderboardPanel.tsx
      MatchAdminPanel.tsx
      MatchResultsPanel.tsx
      MetricCard.tsx
      PlayerSetupPanel.tsx
      TournamentSetupPanel.tsx
    data/
      appSections.ts
      mockDraw.ts
      mockMatches.ts
      mockPlayers.ts
      mockScoringRules.ts
      mockStandings.ts
      mockTeams.ts
      mockTournaments.ts
      mockUsers.ts
    features/
    hooks/
      useLocalStorageState.ts
    lib/
      draw.ts
      eligibility.ts
      scoring.ts
    pages/
    types/
      domain.ts
    App.css
    App.tsx
    index.css
    main.tsx
  package.json
  vite.config.ts
  tsconfig.json
  README.md
```

---

## 8. Domain Model

The current domain model is defined in:

```text
src/types/domain.ts
```

Main domain types:

- `AppUser`
- `Tournament`
- `TournamentUser`
- `Player`
- `Team`
- `Match`
- `MatchEvent`
- `EligibleTeam`
- `Draw`
- `TeamAssignment`
- `ScoringRules`
- `Standing`
- `AppSection`

Key enum-like types:

- `GlobalRole`
- `UserStatus`
- `TournamentStatus`
- `ResultsMode`
- `TeamTournamentStatus`
- `MatchStatus`
- `DrawStatus`

---

## 9. Current Business Logic

### 9.1 Eligibility Engine

Located in:

```text
src/lib/eligibility.ts
```

Current rule:

A team is eligible if:

- the team is active;
- the team has a match inside the selected tournament round window;
- the match has a status belonging to the draw pool.

Current draw-pool statuses:

```text
scheduled
live
halftime
fulltime
```

This is intentional. A team that already played inside the selected window should still belong to that round's draw pool.

### 9.2 Draw Engine

Located in:

```text
src/lib/draw.ts
```

Current behavior:

- validates whether the draw can run;
- checks that eligible teams divide equally across players;
- shuffles teams;
- assigns the same number of teams to each player;
- returns `TeamAssignment[]`.

Current product rule:

```text
Run Draw -> creates temporary draft assignments.
Re-draw -> replaces temporary draft assignments.
Save & Lock Draw -> persists final assignment.
Locked draw -> cannot be changed.
```

### 9.3 Scoring Engine

Located in:

```text
src/lib/scoring.ts
```

Current scoring rules:

- Win: +3
- Draw: +1
- Loss: 0
- Each goal scored: +1
- Clean sheet: +1
- Qualification bonus: present in model but not yet implemented
- Group winner bonus: present in model but not yet implemented

Current behavior:

- calculates points per team per match;
- aggregates team points;
- maps assigned teams to players;
- calculates standings;
- ranks players by total points and match points.

---

## 10. Local Persistence

Current local storage keys:

```text
gadx-worldcup-draw:locked-assignments
gadx-worldcup-draw:matches
gadx-worldcup-draw:players
gadx-worldcup-draw:tournament
```

The reusable hook is:

```text
src/hooks/useLocalStorageState.ts
```

This is temporary local persistence. It is not the final production storage model.

The future source of truth should be:

```text
Cloudflare D1
```

---

## 11. Security Model

### 11.1 Current Local Prototype

There is no real authentication yet.

The current local prototype is intended for local development and product validation only.

### 11.2 Target Security Model

Future production should use two layers:

#### Layer 1 — Cloudflare Access

Controls who can reach the app.

Recommended authentication method:

```text
Email OTP / One-Time PIN
```

Access should be limited to approved emails only.

#### Layer 2 — Application RBAC

Controls what authenticated users can do inside the app.

Target roles:

```text
admin
viewer
pending
blocked
```

Admin can:

- create tournaments;
- edit tournament setup;
- edit players;
- run draw;
- save and lock draw;
- invite viewers;
- edit results;
- reset data;
- manage scoring rules.

Viewer can:

- view assigned tournaments;
- view assigned teams;
- view leaderboard;
- view match results;
- view tournament progress;
- view rules/credits.

Viewer cannot:

- create tournaments;
- edit players;
- edit tournament metadata;
- run or reset draw;
- edit match results;
- manage users.

---

## 12. Design Direction

Current design direction:

- Clean private tournament dashboard.
- Football-inspired but not officially FIFA-branded.
- GADX brand, not Gadiel Analytics brand.
- Minimal, functional, and readable.
- Light background with dark admin panels.
- Emerald/green football accents.
- Rounded dashboard cards.
- Responsive layout.
- Mobile-friendly foundation.

Avoid:

- official FIFA logos;
- official World Cup marks;
- overloaded gaming UI;
- casino-style visuals;
- heavy animation;
- unnecessary branding complexity.

---

## 13. Current Components

### 13.1 Layout Components

- `AppHeader`
- `AppNavigation`
- `AppFooter`
- `MetricCard`

### 13.2 Admin/Workflow Components

- `TournamentSetupPanel`
- `PlayerSetupPanel`
- `DrawControlPanel`
- `MatchAdminPanel`

### 13.3 Results/Viewer Components

- `EligibleTeamsPanel`
- `LeaderboardPanel`
- `MatchResultsPanel`
- `FeatureSections`

---

## 14. Development Commands

### Install dependencies

```bash
npm install
```

### Run local development server

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

### Build for production

```bash
npm run build
```

### Preview production build locally

```bash
npm run preview
```

### Check Git status

```bash
git status
```

### Commit changes

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 15. Completed Milestones

| Milestone | Commit |
|---|---|
| Repository + Local App Foundation | `Initialize React TypeScript app` |
| GADX App Shell + Tailwind | `Add GADX app shell` |
| Domain Model + Mock Data | `Add domain model and mock data` |
| Eligible Teams + Fair Draw | `Calculate eligible teams and fair draw` |
| Component Refactor | `Refactor app shell into components` |
| Scoring Engine + Leaderboard | `Add scoring engine and leaderboard` |
| Stable Draw Snapshot | `Add stable draw snapshot` |
| Match Results Panel | `Add match results panel` |
| Draft Draw Workflow | `Add draft draw workflow` |
| Persist Locked Draw Locally | `Persist locked draw locally` |
| Local Player Setup | `Add local player setup` |
| Local Tournament Setup | `Add local tournament setup` |
| Manual Match Result Editing | `Add manual match editing` |

---

## 16. Recommended Next Milestones

### Milestone 2.11 — Local Prototype Hardening

Recommended tasks:

- create this README;
- document local prototype state;
- improve empty states;
- review naming consistency;
- add technical notes for backend phase;
- optionally add a local reset-all development utility.

Suggested commit:

```text
Document local prototype status
```

### Milestone 3.0 — Cloudflare Worker Skeleton

Recommended tasks:

- install Wrangler;
- create Worker folder;
- create basic API routes;
- create `/api/health`;
- configure local Worker development;
- prepare future D1 binding.

Suggested commit:

```text
Add Cloudflare Worker skeleton
```

### Milestone 3.1 — D1 Schema and Migrations

Recommended tasks:

- create D1 database;
- create initial SQL migrations;
- create schema for users, tournaments, players, teams, matches, draws, assignments, standings;
- seed admin user;
- seed mock tournament data.

Suggested commit:

```text
Add D1 schema migrations
```

### Milestone 3.2 — Replace Local Reads with API Reads

Recommended tasks:

- add API client;
- fetch tournament data from Worker;
- fetch players from Worker;
- fetch matches from Worker;
- fetch assignments from Worker;
- keep localStorage only for temporary UI state.

Suggested commit:

```text
Read tournament data from API
```

### Milestone 4.0 — Cloudflare Access

Recommended tasks:

- protect app with Cloudflare Access;
- configure approved emails;
- read Access identity headers in Worker;
- resolve authenticated user;
- enforce admin/viewer roles.

Suggested commit:

```text
Add private access foundation
```

---

## 17. Production Deployment Direction

Target production architecture:

```text
Cloudflare Pages
  hosts React frontend

Cloudflare Access
  protects the app URL

Cloudflare Workers
  exposes API routes

Cloudflare D1
  stores application data

GitHub
  source control and deployment trigger
```

Target production URL:

```text
gadx-worldcup.gadielanalytics.com
```

Alternative URLs:

```text
worldcup.gadielanalytics.com
fantasy.gadielanalytics.com
```

Recommended visible product brand:

```text
GADX World Cup Draw
```

---

## 18. Important Product Decisions

1. The app uses **Tournament**, not Scenario.
2. The brand is **GADX**, not Gadiel Analytics.
3. The app is private, not public.
4. The admin is the only user who can create/edit tournaments.
5. Viewers can only see tournaments where they participate.
6. The draw flow supports preview before saving.
7. Once the draw is saved and locked, tournament setup and player setup cannot be changed.
8. Match results remain editable after the draw is locked.
9. Leaderboard recalculates from current match results.
10. Local storage is temporary and will be replaced by Cloudflare D1 for production.
11. Official FIFA branding and logos should be avoided.
12. National flags and country names are acceptable for the prototype.

---

## 19. Known Current Limitations

The current prototype does not yet include:

- real authentication;
- real viewer access;
- multiple tournaments at the same time;
- backend persistence;
- Cloudflare deployment;
- Cloudflare D1;
- Cloudflare Worker API;
- API-based live scores;
- PWA manifest/service worker;
- routing/pages;
- formal tests;
- CI/CD workflow;
- audit log UI;
- real invite flow;
- real approved user management;
- official list of all 48 teams;
- final World Cup fixture data;
- production authorization enforcement.

---

## 20. Recommended Immediate Next Step

After this README commit, the recommended path is:

```text
Milestone 2.11 — Local Prototype Hardening
-> Milestone 3.0 — Cloudflare Worker Skeleton
-> Milestone 3.1 — D1 Schema and Migrations
```

The project should move to Cloudflare only after the current local prototype is documented and stable.

---

## 21. Suggested Commit for This README

```text
Document local prototype status
```
