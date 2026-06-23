PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  global_role TEXT NOT NULL CHECK (global_role IN ('admin', 'viewer')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  round_name TEXT NOT NULL,
  round_start_date TEXT NOT NULL,
  round_end_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  results_mode TEXT NOT NULL CHECK (results_mode IN ('manual', 'api')),
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS tournament_users (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE (tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL UNIQUE,
  fifa_code TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  confederation TEXT NOT NULL,
  tournament_status TEXT NOT NULL CHECK (
    tournament_status IN ('qualified', 'pending', 'eliminated', 'not_qualified')
  ),
  is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  round_name TEXT NOT NULL,
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  kickoff_utc TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('scheduled', 'live', 'halftime', 'fulltime', 'postponed', 'cancelled')
  ),
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id) REFERENCES teams (id),
  FOREIGN KEY (away_team_id) REFERENCES teams (id)
);

CREATE TABLE IF NOT EXISTS match_events (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('goal', 'own_goal', 'yellow_card', 'red_card', 'penalty_scored', 'penalty_missed')
  ),
  minute INTEGER NOT NULL,
  player_name TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams (id)
);

CREATE TABLE IF NOT EXISTS scoring_rules (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  win_points INTEGER NOT NULL,
  draw_points INTEGER NOT NULL,
  loss_points INTEGER NOT NULL,
  goal_points INTEGER NOT NULL,
  clean_sheet_points INTEGER NOT NULL,
  qualification_bonus_points INTEGER NOT NULL,
  group_winner_bonus_points INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS draws (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'locked')),
  created_by_user_id TEXT NOT NULL,
  locked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS team_assignments (
  id TEXT PRIMARY KEY,
  draw_id TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  FOREIGN KEY (draw_id) REFERENCES draws (id) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams (id),
  UNIQUE (draw_id, team_id),
  UNIQUE (draw_id, player_id, team_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  tournament_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (actor_user_id) REFERENCES users (id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tournament_users_tournament_id
  ON tournament_users (tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournament_users_user_id
  ON tournament_users (user_id);

CREATE INDEX IF NOT EXISTS idx_players_tournament_id
  ON players (tournament_id);

CREATE INDEX IF NOT EXISTS idx_matches_tournament_id
  ON matches (tournament_id);

CREATE INDEX IF NOT EXISTS idx_matches_kickoff_utc
  ON matches (kickoff_utc);

CREATE INDEX IF NOT EXISTS idx_match_events_match_id
  ON match_events (match_id);

CREATE INDEX IF NOT EXISTS idx_scoring_rules_tournament_id
  ON scoring_rules (tournament_id);

CREATE INDEX IF NOT EXISTS idx_draws_tournament_id
  ON draws (tournament_id);

CREATE INDEX IF NOT EXISTS idx_team_assignments_draw_id
  ON team_assignments (draw_id);

CREATE INDEX IF NOT EXISTS idx_team_assignments_tournament_id
  ON team_assignments (tournament_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_tournament_id
  ON audit_log (tournament_id);