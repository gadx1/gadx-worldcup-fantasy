-- Migration 0003 — Two real-world tournaments (timezone-corrected).
--
-- The admin tests on US-night World Cup fixtures while sitting in Prague
-- (CEST = UTC+2), so the calendar day a match "belongs to" locally differs
-- from its UTC date. This migration sets the kickoff_utc values and each
-- tournament's eligibility window so that, viewed from Prague, every match
-- lands in the intended tournament and the eligibility engine selects exactly
-- the right 12 teams per tournament.
--
--   Tournament 1  (id: tournament_friday_26)
--     The six US-night games of June 25 ET, which appear on Friday June 26 in
--     Prague. All PLAYED (fulltime) with real scores:
--       Ecuador 2-1 Germany, Ivory Coast 2-0 Curacao, Japan 1-1 Sweden,
--       Netherlands 3-1 Tunisia, Turkey 3-2 USA, Paraguay 0-0 Australia.
--
--   Tournament 2  (id: tournament_saturday_27)
--     The six June 27 group-stage-finale games, all 'scheduled' (no result):
--       Panama-England, Croatia-Ghana, Colombia-Portugal,
--       DR Congo-Uzbekistan, Jordan-Argentina, Algeria-Austria.
--
-- Eligibility windows (UTC, non-overlapping):
--   T1: 2026-06-25T00:00:00Z .. 2026-06-26T06:00:00Z  (kickoffs 20:00Z..02:00Z)
--   T2: 2026-06-27T00:00:00Z .. 2026-06-28T06:00:00Z  (kickoffs 21:00Z..02:00Z)
--
-- The original prototype tournament from migration 0002 is left intact.
-- Players: the same six friends are registered in BOTH tournaments.

-- Foreign keys must be ON so that deleting a tournament cascades to its child
-- rows (players, matches, draws, assignments, etc.).
PRAGMA foreign_keys = ON;

-- ===========================================================================
-- 0. CLEANUP — remove the two tournaments and everything under them.
--    Deleting the tournament row cascades (ON DELETE CASCADE) to players,
--    matches, match_events, scoring_rules, draws, team_assignments and
--    tournament_users for that tournament, so a single delete clears all stale
--    data from any earlier version of this seed. We deliberately do NOT touch
--    the `teams` table here: teams are shared reference data and are referenced
--    by matches in the original prototype tournament, so deleting/replacing a
--    team row could break those references. New teams are added with
--    INSERT OR IGNORE below, which never deletes an existing row.
-- ===========================================================================
DELETE FROM tournaments
  WHERE id IN ('tournament_friday_26', 'tournament_saturday_27');

-- ===========================================================================
-- 1. TEAMS — every nation that plays in either tournament.
--    INSERT OR IGNORE: add any team that does not already exist, and leave
--    existing teams (and their references) untouched.
-- ===========================================================================
INSERT OR IGNORE INTO teams (
  id, country_name, country_code, fifa_code, flag_emoji, confederation,
  tournament_status, is_active, created_at, updated_at
)
VALUES
  -- Tournament 1 nations (US-night June 25 / Prague June 26)
  ('team_ecuador',      'Ecuador',      'EC',     'ECU', '🇪🇨', 'CONMEBOL', 'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_germany',      'Germany',      'DE',     'GER', '🇩🇪', 'UEFA',     'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_ivory_coast',  'Ivory Coast',  'CI',     'CIV', '🇨🇮', 'CAF',      'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_curacao',      'Curacao',      'CW',     'CUW', '🇨🇼', 'CONCACAF', 'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_japan',        'Japan',        'JP',     'JPN', '🇯🇵', 'AFC',      'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_sweden',       'Sweden',       'SE',     'SWE', '🇸🇪', 'UEFA',     'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_netherlands',  'Netherlands',  'NL',     'NED', '🇳🇱', 'UEFA',     'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_tunisia',      'Tunisia',      'TN',     'TUN', '🇹🇳', 'CAF',      'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_turkey',       'Turkey',       'TR',     'TUR', '🇹🇷', 'UEFA',     'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_united_states','United States','US',     'USA', '🇺🇸', 'CONCACAF', 'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_paraguay',     'Paraguay',     'PY',     'PAR', '🇵🇾', 'CONMEBOL', 'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('team_australia',    'Australia',    'AU',     'AUS', '🇦🇺', 'AFC',      'qualified', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  -- Tournament 2 nations (June 27 finale)
  ('team_panama',       'Panama',       'PA',     'PAN', '🇵🇦', 'CONCACAF', 'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_england',      'England',      'GB-ENG', 'ENG', '🏴',  'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_croatia',      'Croatia',      'HR',     'CRO', '🇭🇷', 'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_ghana',        'Ghana',        'GH',     'GHA', '🇬🇭', 'CAF',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_colombia',     'Colombia',     'CO',     'COL', '🇨🇴', 'CONMEBOL', 'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_portugal',     'Portugal',     'PT',     'POR', '🇵🇹', 'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_congo_dr',     'DR Congo',     'CD',     'COD', '🇨🇩', 'CAF',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_uzbekistan',   'Uzbekistan',   'UZ',     'UZB', '🇺🇿', 'AFC',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_jordan',       'Jordan',       'JO',     'JOR', '🇯🇴', 'AFC',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_argentina',    'Argentina',    'AR',     'ARG', '🇦🇷', 'CONMEBOL', 'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_algeria',      'Algeria',      'DZ',     'ALG', '🇩🇿', 'CAF',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_austria',      'Austria',      'AT',     'AUT', '🇦🇹', 'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 2. TOURNAMENTS  (eligibility windows in UTC, non-overlapping)
-- ===========================================================================
INSERT OR REPLACE INTO tournaments (
  id, name, round_name, round_start_date, round_end_date,
  status, results_mode, created_by_user_id, created_at, updated_at
)
VALUES
  (
    'tournament_friday_26',
    'Friday 26 — Group Stage',
    'Matchday 3 — Friday',
    '2026-06-25T00:00:00.000Z',
    '2026-06-26T06:00:00.000Z',
    'active', 'manual', 'user_admin',
    '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'
  ),
  (
    'tournament_saturday_27',
    'Saturday 27 — Group Stage Finale',
    'Matchday 3 — Saturday',
    '2026-06-27T00:00:00.000Z',
    '2026-06-28T06:00:00.000Z',
    'active', 'manual', 'user_admin',
    '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'
  );

-- ===========================================================================
-- 3. TOURNAMENT-USERS — admin linked to both tournaments
-- ===========================================================================
INSERT OR REPLACE INTO tournament_users (
  id, tournament_id, user_id, role, status, created_at, updated_at
)
VALUES
  ('tu_admin_fri26', 'tournament_friday_26',   'user_admin', 'admin', 'active', '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('tu_admin_sat27', 'tournament_saturday_27', 'user_admin', 'admin', 'active', '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 4. PLAYERS — the same six friends in BOTH tournaments.
-- ===========================================================================
INSERT OR REPLACE INTO players (
  id, tournament_id, first_name, last_name, display_name, avatar_id,
  sort_order, created_at, updated_at
)
VALUES
  -- Friday roster
  ('fri26_player_01', 'tournament_friday_26', 'Gadiel', 'Guadarrama', 'Gadiel', 'avatar-01', 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_player_02', 'tournament_friday_26', 'Andrew', 'Player',     'Andrew', 'avatar-02', 2, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_player_03', 'tournament_friday_26', 'Tina',   'Player',     'Tina',   'avatar-03', 3, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_player_04', 'tournament_friday_26', 'Pat',    'Player',     'Pat',    'avatar-04', 4, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_player_05', 'tournament_friday_26', 'Meena',  'Player',     'Meena',  'avatar-05', 5, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_player_06', 'tournament_friday_26', 'Corm',   'Player',     'Corm',   'avatar-06', 6, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  -- Saturday roster (same humans)
  ('sat27_player_01', 'tournament_saturday_27', 'Gadiel', 'Guadarrama', 'Gadiel', 'avatar-01', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_02', 'tournament_saturday_27', 'Andrew', 'Player',     'Andrew', 'avatar-02', 2, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_03', 'tournament_saturday_27', 'Tina',   'Player',     'Tina',   'avatar-03', 3, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_04', 'tournament_saturday_27', 'Pat',    'Player',     'Pat',    'avatar-04', 4, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_05', 'tournament_saturday_27', 'Meena',  'Player',     'Meena',  'avatar-05', 5, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_06', 'tournament_saturday_27', 'Corm',   'Player',     'Corm',   'avatar-06', 6, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 5. SCORING RULES — one row per tournament
-- ===========================================================================
INSERT OR REPLACE INTO scoring_rules (
  id, tournament_id, win_points, draw_points, loss_points, goal_points,
  clean_sheet_points, qualification_bonus_points, group_winner_bonus_points,
  created_at, updated_at
)
VALUES
  ('scoring_fri26', 'tournament_friday_26',   3, 1, 0, 1, 1, 0, 0, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('scoring_sat27', 'tournament_saturday_27', 3, 1, 0, 1, 1, 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 6. MATCHES
-- ===========================================================================
-- Tournament 1 — six US-night June 25 games (Prague-Friday), real results.
INSERT OR REPLACE INTO matches (
  id, tournament_id, round_name, home_team_id, away_team_id,
  kickoff_utc, status, home_score, away_score, created_at, updated_at
)
VALUES
  ('fri26_ecuador_germany',  'tournament_friday_26', 'Group E — MD3', 'team_ecuador',     'team_germany',      '2026-06-25T20:00:00.000Z', 'fulltime', 2, 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_ivory_curacao',    'tournament_friday_26', 'Group E — MD3', 'team_ivory_coast', 'team_curacao',      '2026-06-25T20:00:00.000Z', 'fulltime', 2, 0, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_japan_sweden',     'tournament_friday_26', 'Group F — MD3', 'team_japan',       'team_sweden',       '2026-06-25T23:00:00.000Z', 'fulltime', 1, 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_netherlands_tun',  'tournament_friday_26', 'Group F — MD3', 'team_netherlands', 'team_tunisia',      '2026-06-25T23:00:00.000Z', 'fulltime', 3, 1, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_turkey_usa',       'tournament_friday_26', 'Group D — MD3', 'team_turkey',      'team_united_states','2026-06-26T02:00:00.000Z', 'fulltime', 3, 2, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),
  ('fri26_paraguay_aus',     'tournament_friday_26', 'Group D — MD3', 'team_paraguay',    'team_australia',    '2026-06-26T02:00:00.000Z', 'fulltime', 0, 0, '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z');

-- Tournament 2 — six June 27 finale games, scheduled (no result yet).
INSERT OR REPLACE INTO matches (
  id, tournament_id, round_name, home_team_id, away_team_id,
  kickoff_utc, status, home_score, away_score, created_at, updated_at
)
VALUES
  ('sat27_panama_england',     'tournament_saturday_27', 'Group L — MD3', 'team_panama',   'team_england',    '2026-06-27T21:00:00.000Z', 'scheduled', 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_croatia_ghana',      'tournament_saturday_27', 'Group L — MD3', 'team_croatia',  'team_ghana',      '2026-06-27T21:00:00.000Z', 'scheduled', 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_colombia_portugal',  'tournament_saturday_27', 'Group K — MD3', 'team_colombia', 'team_portugal',   '2026-06-27T23:30:00.000Z', 'scheduled', 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_congo_uzbekistan',   'tournament_saturday_27', 'Group K — MD3', 'team_congo_dr', 'team_uzbekistan', '2026-06-27T23:30:00.000Z', 'scheduled', 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_jordan_argentina',   'tournament_saturday_27', 'Group J — MD3', 'team_jordan',   'team_argentina',  '2026-06-28T02:00:00.000Z', 'scheduled', 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_algeria_austria',    'tournament_saturday_27', 'Group J — MD3', 'team_algeria',  'team_austria',    '2026-06-28T02:00:00.000Z', 'scheduled', 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');
