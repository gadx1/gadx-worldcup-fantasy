-- Migration 0003 — Two real-world tournaments for multi-tournament testing.
--
-- This migration sets up TWO tournaments that share the same six players, so
-- the admin can switch between them and save an independent draw for each:
--
--   Tournament 1  (id: tournament_friday_26)
--     Friday, June 26, 2026 group-stage fixtures, already PLAYED (fulltime,
--     real scores). Good for testing the leaderboard with real results.
--
--   Tournament 2  (id: tournament_saturday_27)
--     Saturday, June 27, 2026 group-stage finale, all 'scheduled' (no result).
--     Good for testing the draw + lock flow before any match is played.
--
-- The original prototype tournament (tournament_dublin_friends) from migration
-- 0002 is left intact; these two are added alongside it.
--
-- Players: the same six people are registered in BOTH tournaments (a player row
-- is per-tournament in this schema, so each tournament gets its own six rows
-- pointing at the same humans). Edit the names below to the real friends.
--
-- Kickoff times are UTC. US Eastern Daylight Time is UTC-4:
--   3:00pm ET = 19:00Z   5:00pm ET = 21:00Z
--   7:30pm ET = 23:30Z   8:00pm ET = 00:00Z(+1)   10:00pm ET = 02:00Z(+1)

PRAGMA foreign_keys = ON;

-- ===========================================================================
-- 1. TEAMS — every nation that plays on June 26 or June 27.
--    INSERT OR REPLACE keeps existing rows fresh and adds the new ones.
-- ===========================================================================
INSERT OR REPLACE INTO teams (
  id, country_name, country_code, fifa_code, flag_emoji, confederation,
  tournament_status, is_active, created_at, updated_at
)
VALUES
  -- June 26 nations
  ('team_egypt',        'Egypt',         'EG',     'EGY', '🇪🇬', 'CAF',      'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_iran',         'Iran',          'IR',     'IRN', '🇮🇷', 'AFC',      'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_belgium',      'Belgium',       'BE',     'BEL', '🇧🇪', 'UEFA',     'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_new_zealand',  'New Zealand',   'NZ',     'NZL', '🇳🇿', 'OFC',      'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_cape_verde',   'Cape Verde',    'CV',     'CPV', '🇨🇻', 'CAF',      'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_saudi_arabia', 'Saudi Arabia',  'SA',     'KSA', '🇸🇦', 'AFC',      'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_uruguay',      'Uruguay',       'UY',     'URU', '🇺🇾', 'CONMEBOL', 'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_spain',        'Spain',         'ES',     'ESP', '🇪🇸', 'UEFA',     'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_norway',       'Norway',        'NO',     'NOR', '🇳🇴', 'UEFA',     'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_france',       'France',        'FR',     'FRA', '🇫🇷', 'UEFA',     'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_senegal',      'Senegal',       'SN',     'SEN', '🇸🇳', 'CAF',      'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('team_iraq',         'Iraq',          'IQ',     'IRQ', '🇮🇶', 'AFC',      'qualified', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  -- June 27 nations
  ('team_panama',       'Panama',        'PA',     'PAN', '🇵🇦', 'CONCACAF', 'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_england',      'England',       'GB-ENG', 'ENG', '🏴',  'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_croatia',      'Croatia',       'HR',     'CRO', '🇭🇷', 'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_ghana',        'Ghana',         'GH',     'GHA', '🇬🇭', 'CAF',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_colombia',     'Colombia',      'CO',     'COL', '🇨🇴', 'CONMEBOL', 'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_portugal',     'Portugal',      'PT',     'POR', '🇵🇹', 'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_congo_dr',     'DR Congo',      'CD',     'COD', '🇨🇩', 'CAF',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_uzbekistan',   'Uzbekistan',    'UZ',     'UZB', '🇺🇿', 'AFC',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_jordan',       'Jordan',        'JO',     'JOR', '🇯🇴', 'AFC',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_argentina',    'Argentina',     'AR',     'ARG', '🇦🇷', 'CONMEBOL', 'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_algeria',      'Algeria',       'DZ',     'ALG', '🇩🇿', 'CAF',      'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('team_austria',      'Austria',       'AT',     'AUT', '🇦🇹', 'UEFA',     'qualified', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 2. TOURNAMENTS
-- ===========================================================================
INSERT OR REPLACE INTO tournaments (
  id, name, round_name, round_start_date, round_end_date,
  status, results_mode, created_by_user_id, created_at, updated_at
)
VALUES
  (
    'tournament_friday_26',
    'Friday 26 — Group Stage',
    'Matchday 3 — June 26',
    '2026-06-26T00:00:00.000Z',
    '2026-06-27T05:00:00.000Z',
    'active', 'manual', 'user_admin',
    '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'
  ),
  (
    'tournament_saturday_27',
    'Saturday 27 — Group Stage Finale',
    'Matchday 3 — June 27',
    '2026-06-27T00:00:00.000Z',
    '2026-06-28T05:00:00.000Z',
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
  ('tu_admin_fri26', 'tournament_friday_26',   'user_admin', 'admin', 'active', '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('tu_admin_sat27', 'tournament_saturday_27', 'user_admin', 'admin', 'active', '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 4. PLAYERS — the same six people registered in BOTH tournaments.
--    Replace the first_name / last_name / display_name values with the real
--    friends' names; keep the ids stable.
-- ===========================================================================
INSERT OR REPLACE INTO players (
  id, tournament_id, first_name, last_name, display_name, avatar_id,
  sort_order, created_at, updated_at
)
VALUES
  -- Friday 26 roster
  ('fri26_player_01', 'tournament_friday_26', 'Gadiel',  'Guadarrama', 'Gadiel',   'avatar-01', 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_player_02', 'tournament_friday_26', 'Andrew', 'Player',  'Andrew', 'avatar-02', 2, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_player_03', 'tournament_friday_26', 'Tina',   'Player',  'Tina', 'avatar-03', 3, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_player_04', 'tournament_friday_26', 'Pat',    'Player',  'Pat', 'avatar-04', 4, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_player_05', 'tournament_friday_26', 'Meena',  'Player',  'Meena', 'avatar-05', 5, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_player_06', 'tournament_friday_26', 'Corm',   'Player',  'Corm', 'avatar-06', 6, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  -- Saturday 27 roster (same humans)
  ('sat27_player_01', 'tournament_saturday_27', 'Gadiel', 'Guadarrama', 'Gadiel',   'avatar-01', 1, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_02', 'tournament_saturday_27', 'Andrew', 'Player',     'Andrew'  , 'avatar-02', 2, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_03', 'tournament_saturday_27', 'Tina',   'Player',     'Tina'    , 'avatar-03', 3, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_04', 'tournament_saturday_27', 'Pat',    'Player',     'Pat'     , 'avatar-04', 4, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_05', 'tournament_saturday_27', 'Meena',  'Player',     'Meena'   , 'avatar-05', 5, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z'),
  ('sat27_player_06', 'tournament_saturday_27', 'Corm',   'Player',     'Corm'    , 'avatar-06', 6, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 5. SCORING RULES — one row per tournament (same rules)
-- ===========================================================================
INSERT OR REPLACE INTO scoring_rules (
  id, tournament_id, win_points, draw_points, loss_points, goal_points,
  clean_sheet_points, qualification_bonus_points, group_winner_bonus_points,
  created_at, updated_at
)
VALUES
  ('scoring_fri26', 'tournament_friday_26',   3, 1, 0, 1, 1, 0, 0, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('scoring_sat27', 'tournament_saturday_27', 3, 1, 0, 1, 1, 0, 0, '2026-06-27T00:00:00.000Z', '2026-06-27T00:00:00.000Z');

-- ===========================================================================
-- 6. MATCHES
-- ===========================================================================
-- Tournament 1 — Friday June 26 (real results, status fulltime).
INSERT OR REPLACE INTO matches (
  id, tournament_id, round_name, home_team_id, away_team_id,
  kickoff_utc, status, home_score, away_score, created_at, updated_at
)
VALUES
  ('fri26_egypt_iran',         'tournament_friday_26', 'Group G — MD3', 'team_egypt',      'team_iran',         '2026-06-27T03:00:00.000Z', 'fulltime', 1, 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_belgium_nzl',        'tournament_friday_26', 'Group G — MD3', 'team_belgium',    'team_new_zealand',  '2026-06-27T03:00:00.000Z', 'fulltime', 5, 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_capeverde_ksa',      'tournament_friday_26', 'Group H — MD3', 'team_cape_verde', 'team_saudi_arabia', '2026-06-27T00:00:00.000Z', 'fulltime', 0, 0, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_uruguay_spain',      'tournament_friday_26', 'Group H — MD3', 'team_uruguay',    'team_spain',        '2026-06-27T00:00:00.000Z', 'fulltime', 0, 1, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_norway_france',      'tournament_friday_26', 'Group I — MD3', 'team_norway',     'team_france',       '2026-06-26T19:00:00.000Z', 'fulltime', 1, 4, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z'),
  ('fri26_senegal_iraq',       'tournament_friday_26', 'Group I — MD3', 'team_senegal',    'team_iraq',         '2026-06-26T19:00:00.000Z', 'fulltime', 5, 0, '2026-06-26T00:00:00.000Z', '2026-06-26T00:00:00.000Z');

-- Tournament 2 — Saturday June 27 (scheduled, no result yet).
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
