PRAGMA foreign_keys = ON;

INSERT OR REPLACE INTO users (
  id,
  email,
  display_name,
  global_role,
  status,
  created_at,
  updated_at
)
VALUES (
  'user_admin',
  'admin@gadx.local',
  'GADX Admin',
  'admin',
  'active',
  '2026-06-23T00:00:00.000Z',
  '2026-06-23T00:00:00.000Z'
);

INSERT OR REPLACE INTO tournaments (
  id,
  name,
  round_name,
  round_start_date,
  round_end_date,
  status,
  results_mode,
  created_by_user_id,
  created_at,
  updated_at
)
VALUES (
  'tournament_dublin_friends',
  'Dublin Friends Tournament',
  'Group Stage Round 1',
  '2026-06-11T00:00:00.000Z',
  '2026-06-18T23:59:59.000Z',
  'draft',
  'manual',
  'user_admin',
  '2026-06-23T00:00:00.000Z',
  '2026-06-23T00:00:00.000Z'
);

INSERT OR REPLACE INTO tournament_users (
  id,
  tournament_id,
  user_id,
  role,
  status,
  created_at,
  updated_at
)
VALUES (
  'tournament_user_admin',
  'tournament_dublin_friends',
  'user_admin',
  'admin',
  'active',
  '2026-06-23T00:00:00.000Z',
  '2026-06-23T00:00:00.000Z'
);

INSERT OR REPLACE INTO players (
  id,
  tournament_id,
  first_name,
  last_name,
  display_name,
  avatar_id,
  sort_order,
  created_at,
  updated_at
)
VALUES
  (
    'player_01',
    'tournament_dublin_friends',
    'Gadiel',
    'Guadarrama',
    'Gadiel',
    'avatar-01',
    1,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  ),
  (
    'player_02',
    'tournament_dublin_friends',
    'Player',
    'Two',
    'Player Two',
    'avatar-02',
    2,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  ),
  (
    'player_03',
    'tournament_dublin_friends',
    'Player',
    'Three',
    'Player Three',
    'avatar-03',
    3,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  ),
  (
    'player_04',
    'tournament_dublin_friends',
    'Player',
    'Four',
    'Player Four',
    'avatar-04',
    4,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  ),
  (
    'player_05',
    'tournament_dublin_friends',
    'Player',
    'Five',
    'Player Five',
    'avatar-05',
    5,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  ),
  (
    'player_06',
    'tournament_dublin_friends',
    'Player',
    'Six',
    'Player Six',
    'avatar-06',
    6,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  );

INSERT OR REPLACE INTO teams (
  id,
  country_name,
  country_code,
  fifa_code,
  flag_emoji,
  confederation,
  tournament_status,
  is_active,
  created_at,
  updated_at
)
VALUES
  ('team_argentina', 'Argentina', 'AR', 'ARG', '🇦🇷', 'CONMEBOL', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_brazil', 'Brazil', 'BR', 'BRA', '🇧🇷', 'CONMEBOL', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_canada', 'Canada', 'CA', 'CAN', '🇨🇦', 'CONCACAF', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_england', 'England', 'GB-ENG', 'ENG', '🏴', 'UEFA', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_france', 'France', 'FR', 'FRA', '🇫🇷', 'UEFA', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_germany', 'Germany', 'DE', 'GER', '🇩🇪', 'UEFA', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_japan', 'Japan', 'JP', 'JPN', '🇯🇵', 'AFC', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_mexico', 'Mexico', 'MX', 'MEX', '🇲🇽', 'CONCACAF', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_portugal', 'Portugal', 'PT', 'POR', '🇵🇹', 'UEFA', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_spain', 'Spain', 'ES', 'ESP', '🇪🇸', 'UEFA', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_uruguay', 'Uruguay', 'UY', 'URU', '🇺🇾', 'CONMEBOL', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('team_united_states', 'United States', 'US', 'USA', '🇺🇸', 'CONCACAF', 'qualified', 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z');

INSERT OR REPLACE INTO matches (
  id,
  tournament_id,
  round_name,
  home_team_id,
  away_team_id,
  kickoff_utc,
  status,
  home_score,
  away_score,
  created_at,
  updated_at
)
VALUES
  (
    'match_mexico_canada',
    'tournament_dublin_friends',
    'Group Stage Round 1',
    'team_mexico',
    'team_canada',
    '2026-06-12T20:00:00.000Z',
    'fulltime',
    2,
    0,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  ),
  (
    'match_argentina_japan',
    'tournament_dublin_friends',
    'Group Stage Round 1',
    'team_argentina',
    'team_japan',
    '2026-06-13T20:00:00.000Z',
    'fulltime',
    1,
    1,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  ),
  (
    'match_brazil_uruguay',
    'tournament_dublin_friends',
    'Group Stage Round 1',
    'team_brazil',
    'team_uruguay',
    '2026-06-14T20:00:00.000Z',
    'scheduled',
    0,
    0,
    '2026-06-23T00:00:00.000Z',
    '2026-06-23T00:00:00.000Z'
  );

INSERT OR REPLACE INTO scoring_rules (
  id,
  tournament_id,
  win_points,
  draw_points,
  loss_points,
  goal_points,
  clean_sheet_points,
  qualification_bonus_points,
  group_winner_bonus_points,
  created_at,
  updated_at
)
VALUES (
  'scoring_rules_default',
  'tournament_dublin_friends',
  3,
  1,
  0,
  1,
  1,
  5,
  3,
  '2026-06-23T00:00:00.000Z',
  '2026-06-23T00:00:00.000Z'
);

INSERT OR REPLACE INTO audit_log (
  id,
  actor_user_id,
  tournament_id,
  action,
  entity_type,
  entity_id,
  metadata_json,
  created_at
)
VALUES (
  'audit_seed_001',
  'user_admin',
  'tournament_dublin_friends',
  'seed_prototype_data',
  'database',
  'gadx_worldcup_draw',
  '{"source":"0002_seed_prototype_data.sql"}',
  '2026-06-23T00:00:00.000Z'
);