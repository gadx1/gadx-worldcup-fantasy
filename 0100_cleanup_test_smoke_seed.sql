-- TEMPORARY TEST CLEANUP — 0100_cleanup_test_smoke_seed.sql
--
-- Removes everything added by 0099_test_smoke_seed.sql, including the draw and
-- team_assignments that get created when you run the real draw against the test
-- teams in /admin. Run this BEFORE seeding the real Round of 16 (~July 3).
--
-- Safe by construction: only touches rows whose id/team_id starts with
-- 'team_test_' or 'test_'. Leaves the survivor tournament, its 8 players, and
-- scoring rules untouched.

PRAGMA foreign_keys = ON;

-- 1. Remove any assignments pointing at test teams (from a draw you ran).
DELETE FROM team_assignments
  WHERE team_id LIKE 'team_test_%';

-- 2. Remove the draw itself if it has no assignments left (the one created by
--    the test run). Locked draws for tournament_wc_survivor with zero
--    remaining assignments are safe to drop — they only existed to hold the
--    test assignments just deleted above.
DELETE FROM draws
  WHERE tournament_id = 'tournament_wc_survivor'
    AND id NOT IN (SELECT DISTINCT draw_id FROM team_assignments);

-- 3. Remove match events tied to the test fixtures (if any were recorded).
DELETE FROM match_events
  WHERE match_id LIKE 'test_r16_%';

-- 4. Remove the 8 test fixtures.
DELETE FROM matches
  WHERE id LIKE 'test_r16_%';

-- 5. Remove the 16 test teams.
DELETE FROM teams
  WHERE id LIKE 'team_test_%';

-- Verify cleanliness after running this file:
--   SELECT COUNT(*) FROM teams WHERE id LIKE 'team_test_%';           -- expect 0
--   SELECT COUNT(*) FROM matches WHERE id LIKE 'test_r16_%';          -- expect 0
--   SELECT COUNT(*) FROM team_assignments WHERE team_id LIKE 'team_test_%'; -- expect 0
