-- TEMPORARY TEST SEED — 0099_test_smoke_seed.sql
--
-- Purpose: end-to-end smoke test of M1–M7 BEFORE the real Round-of-16 teams are
-- known (~July 3). Seeds 16 clearly-fake "Test XX" teams and 8 Round-of-16
-- fixtures ('scheduled', no result) into tournament_wc_survivor, so you can:
--   1. Run the draw for real in /admin (8 players x 2 teams = 16).
--   2. Save & lock it, refresh, confirm it persists.
--   3. Record a couple of results in MatchAdminPanel and watch the leaderboard
--      and bracket update (points, live/eliminated dot, bracket columns).
--   4. Exercise the sync path via POST /api/admin/sync-now (it will simply
--      find no matching feed names for "Test XX" teams and report 0 updates —
--      that's fine, it proves the endpoint runs cleanly end-to-end).
--
-- ⚠️ THIS IS TEST DATA. Run 0100_cleanup_test_smoke_seed.sql to remove it
-- before seeding the real Round of 16 (~July 3). Team ids are prefixed
-- `team_test_` and match/draw ids `test_` so cleanup is unambiguous and safe.

PRAGMA foreign_keys = ON;

-- 1. Sixteen obviously-fake teams.
INSERT OR IGNORE INTO teams (
  id, country_name, country_code, fifa_code, flag_emoji, confederation,
  tournament_status, is_active, created_at, updated_at
)
VALUES
  ('team_test_01','Test Alpha','T1','TA1','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_02','Test Bravo','T2','TA2','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_03','Test Charlie','T3','TA3','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_04','Test Delta','T4','TA4','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_05','Test Echo','T5','TA5','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_06','Test Foxtrot','T6','TA6','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_07','Test Golf','T7','TA7','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_08','Test Hotel','T8','TA8','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_09','Test India','T9','TA9','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_10','Test Juliet','T10','TA10','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_11','Test Kilo','T11','TA11','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_12','Test Lima','T12','TA12','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_13','Test Mike','T13','TA13','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_14','Test November','T14','TA14','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_15','Test Oscar','T15','TA15','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('team_test_16','Test Papa','T16','TA16','🧪','TEST','qualified',1,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z');

-- 2. Eight Round-of-16 fixtures, all 'scheduled' (no result — you fill these
--    in manually via /admin to test scoring/elimination/leaderboard/bracket).
INSERT INTO matches (
  id, tournament_id, round_name, home_team_id, away_team_id,
  kickoff_utc, status, home_score, away_score, created_at, updated_at
)
VALUES
  ('test_r16_01','tournament_wc_survivor','Round of 16','team_test_01','team_test_02','2026-07-04T18:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('test_r16_02','tournament_wc_survivor','Round of 16','team_test_03','team_test_04','2026-07-04T21:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('test_r16_03','tournament_wc_survivor','Round of 16','team_test_05','team_test_06','2026-07-05T18:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('test_r16_04','tournament_wc_survivor','Round of 16','team_test_07','team_test_08','2026-07-05T21:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('test_r16_05','tournament_wc_survivor','Round of 16','team_test_09','team_test_10','2026-07-06T18:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('test_r16_06','tournament_wc_survivor','Round of 16','team_test_11','team_test_12','2026-07-06T21:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('test_r16_07','tournament_wc_survivor','Round of 16','team_test_13','team_test_14','2026-07-07T18:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z'),
  ('test_r16_08','tournament_wc_survivor','Round of 16','team_test_15','team_test_16','2026-07-07T21:00:00.000Z','scheduled',0,0,'2026-07-01T00:00:00.000Z','2026-07-01T00:00:00.000Z');
