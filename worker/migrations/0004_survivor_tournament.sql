-- Migration 0004 — World Cup Survivor tournament.
--
-- Replaces the day-by-day tournament model with a single long-running survivor
-- tournament for the whole knockout stage (July 1 → July 19, 2026, the real
-- final date).
--
-- Rules of the game:
--   * 8 players: the six friends + two AI rivals (for fun).
--   * The 16 Round-of-16 teams are drawn 2 per player (8 × 2 = 16) once the
--     Round of 32 finishes (~July 3). Teams are NOT seeded here yet — they are
--     added when the real 16 are known.
--   * A player scores the real points their teams earn in knockout matches from
--     July 1 onward (3 win / 1 draw / +1 per goal / +1 clean sheet).
--   * A player is "alive" while at least one of their teams is still in; "out"
--     when all their teams have lost.
--
-- This migration is idempotent and FK-safe: it removes any previous survivor
-- tournament (cascading to its children) and recreates it fresh. It does not
-- touch the other tournaments.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- 0. Clean any prior survivor tournament (cascades to players, matches, draws,
--    assignments, scoring_rules, tournament_users).
-- ---------------------------------------------------------------------------
DELETE FROM tournaments WHERE id = 'tournament_wc_survivor';

-- ---------------------------------------------------------------------------
-- 1. The survivor tournament. Window spans the whole knockout stage.
-- ---------------------------------------------------------------------------
INSERT INTO tournaments (
  id, name, round_name, round_start_date, round_end_date,
  status, results_mode, created_by_user_id, created_at, updated_at
)
VALUES (
  'tournament_wc_survivor',
  'FIFA World Cup Survivor',
  'Knockout Stage',
  '2026-07-01T00:00:00.000Z',
  '2026-07-19T23:59:59.000Z',
  'active', 'manual', 'user_admin',
  '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'
);

-- ---------------------------------------------------------------------------
-- 2. Admin link.
-- ---------------------------------------------------------------------------
INSERT INTO tournament_users (
  id, tournament_id, user_id, role, status, created_at, updated_at
)
VALUES (
  'tu_admin_survivor', 'tournament_wc_survivor', 'user_admin', 'admin', 'active',
  '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'
);

-- ---------------------------------------------------------------------------
-- 3. Players: six friends + two AI rivals. Rename the AI players here if you
--    want different jokes (e.g. 'Skynet FC', 'HAL 9000', 'La Máquina').
-- ---------------------------------------------------------------------------
INSERT INTO players (
  id, tournament_id, first_name, last_name, display_name, avatar_id,
  sort_order, created_at, updated_at
)
VALUES
  ('surv_player_01', 'tournament_wc_survivor', 'Gadiel',  'Guadarrama', 'Gadiel',  'avatar-01', 1, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
  ('surv_player_02', 'tournament_wc_survivor', 'Andrew',  'Player',     'Andrew',  'avatar-02', 2, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
  ('surv_player_03', 'tournament_wc_survivor', 'Tina',    'Player',     'Tina',    'avatar-03', 3, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
  ('surv_player_04', 'tournament_wc_survivor', 'Pat',     'Player',     'Pat',     'avatar-04', 4, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
  ('surv_player_05', 'tournament_wc_survivor', 'Meena',   'Player',     'Meena',   'avatar-05', 5, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
  ('surv_player_06', 'tournament_wc_survivor', 'Corm',    'Player',     'Corm',    'avatar-06', 6, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
  ('surv_player_07', 'tournament_wc_survivor', 'ChatGPT', 'Bot',        '🤖 ChatGPT', 'avatar-07', 7, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
  ('surv_player_08', 'tournament_wc_survivor', 'Claude',  'Bot',        '🤖 Claude',  'avatar-08', 8, '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z');

-- ---------------------------------------------------------------------------
-- 4. Scoring rules (same as before): 3 win / 1 draw / 0 loss / +1 goal /
--    +1 clean sheet. No qualification/group bonuses in the knockout game.
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO scoring_rules (
  id, tournament_id, win_points, draw_points, loss_points, goal_points,
  clean_sheet_points, qualification_bonus_points, group_winner_bonus_points,
  created_at, updated_at
)
VALUES (
  'scoring_survivor', 'tournament_wc_survivor',
  3, 1, 0, 1, 1, 0, 0,
  '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'
);

-- Teams and the Round-of-16 fixtures are seeded in a later step once the real
-- 16 qualifiers are known (after the Round of 32 concludes ~July 3).
