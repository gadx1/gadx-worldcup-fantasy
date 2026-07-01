import type { Match, Player, ScoringRules, TeamAssignment } from '../types/domain'

/**
 * Survivor scoring.
 *
 * Each player owns several teams (2 in the World Cup Survivor tournament). A
 * player's score is the sum of the real points their teams earn in knockout
 * matches, counting only matches that kick off on or after the tournament's
 * cutoff date (assignment date). A player is "alive" while at least one of
 * their teams is still in the tournament, and "eliminated" once every team they
 * own has lost a knockout match.
 */

export type TeamSurvivalState = 'alive' | 'eliminated'

// A player's overall state. 'pending' means no teams have been assigned yet
// (before the draw), so they are neither alive nor out.
export type PlayerSurvivalState = 'pending' | 'alive' | 'eliminated'

export interface TeamSurvivorScore {
  teamId: string
  points: number
  matchesCounted: number
  state: TeamSurvivalState
  eliminatedInRound?: string
  lastRoundReached?: string
}

export interface SurvivorStanding {
  tournamentId: string
  playerId: string
  totalPoints: number
  teamScores: TeamSurvivorScore[]
  aliveTeamCount: number
  state: PlayerSurvivalState
  rank: number
  lastCalculatedAt: string
}

/**
 * Points a single team earns from one finished knockout match, using the same
 * rules as before (win/draw/loss + per-goal + clean sheet). Returns 0 for
 * matches the team is not in, matches that are not finished, or matches that
 * kick off before the cutoff.
 */
export function calculateTeamMatchPoints(
  teamId: string,
  match: Match,
  scoringRules: ScoringRules,
  cutoffUtc: string,
): number {
  const isInMatch = match.homeTeamId === teamId || match.awayTeamId === teamId
  if (!isInMatch) {
    return 0
  }

  if (match.status !== 'fulltime') {
    return 0
  }

  // Only matches on/after the cutoff count toward survivor points.
  if (match.kickoffUtc < cutoffUtc) {
    return 0
  }

  const isHome = match.homeTeamId === teamId
  const teamScore = isHome ? match.homeScore : match.awayScore
  const opponentScore = isHome ? match.awayScore : match.homeScore

  const resultPoints =
    teamScore > opponentScore
      ? scoringRules.winPoints
      : teamScore === opponentScore
        ? scoringRules.drawPoints
        : scoringRules.lossPoints

  const goalPoints = teamScore * scoringRules.goalPoints
  const cleanSheetPoints = opponentScore === 0 ? scoringRules.cleanSheetPoints : 0

  return resultPoints + goalPoints + cleanSheetPoints
}

/**
 * Whether a finished knockout match eliminated the given team. In a
 * single-elimination bracket, a team that does not win a finished knockout
 * match is out. Draws in the knockout stage are decided by extra time/penalties
 * in reality; for manual scoring we treat the recorded winner as advancing, and
 * a recorded draw (equal scores) as NOT an elimination here — the admin records
 * the decisive result. Losing (fewer goals) is the elimination signal.
 */
function isEliminatingResult(teamId: string, match: Match): boolean {
  if (match.status !== 'fulltime') {
    return false
  }
  const isHome = match.homeTeamId === teamId
  const teamScore = isHome ? match.homeScore : match.awayScore
  const opponentScore = isHome ? match.awayScore : match.homeScore
  return teamScore < opponentScore
}

/**
 * Compute a survivor score for one team across all its knockout matches from
 * the cutoff onward.
 */
export function calculateTeamSurvivorScore(
  teamId: string,
  matches: Match[],
  scoringRules: ScoringRules,
  cutoffUtc: string,
): TeamSurvivorScore {
  const teamMatches = matches
    .filter(
      (match) =>
        (match.homeTeamId === teamId || match.awayTeamId === teamId) &&
        match.kickoffUtc >= cutoffUtc,
    )
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))

  let points = 0
  let matchesCounted = 0
  let state: TeamSurvivalState = 'alive'
  let eliminatedInRound: string | undefined
  let lastRoundReached: string | undefined

  for (const match of teamMatches) {
    if (match.status !== 'fulltime') {
      continue
    }

    points += calculateTeamMatchPoints(teamId, match, scoringRules, cutoffUtc)
    matchesCounted += 1
    lastRoundReached = match.roundName

    if (isEliminatingResult(teamId, match)) {
      state = 'eliminated'
      eliminatedInRound = match.roundName
      break
    }
  }

  return {
    teamId,
    points,
    matchesCounted,
    state,
    eliminatedInRound,
    lastRoundReached,
  }
}

/**
 * Compute the full survivor leaderboard: one standing per player, sorted by
 * total points (desc), then by number of teams still alive (desc) as a
 * tie-breaker. Alive players are ranked above eliminated players on equal
 * points because a live team can still earn more.
 */
export function calculateSurvivorStandings(
  players: Player[],
  assignments: TeamAssignment[],
  matches: Match[],
  scoringRules: ScoringRules,
  tournamentId: string,
  cutoffUtc: string,
): SurvivorStanding[] {
  const now = new Date().toISOString()

  const standings = players.map((player) => {
    const teamIds = assignments
      .filter((assignment) => assignment.playerId === player.id)
      .map((assignment) => assignment.teamId)

    const teamScores = teamIds.map((teamId) =>
      calculateTeamSurvivorScore(teamId, matches, scoringRules, cutoffUtc),
    )

    const totalPoints = teamScores.reduce((sum, team) => sum + team.points, 0)
    const aliveTeamCount = teamScores.filter((team) => team.state === 'alive').length
    const state: PlayerSurvivalState =
      teamScores.length === 0 ? 'pending' : aliveTeamCount > 0 ? 'alive' : 'eliminated'

    return {
      tournamentId,
      playerId: player.id,
      totalPoints,
      teamScores,
      aliveTeamCount,
      state,
      rank: 0,
      lastCalculatedAt: now,
    }
  })

  return standings
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      if (b.aliveTeamCount !== a.aliveTeamCount) {
        return b.aliveTeamCount - a.aliveTeamCount
      }
      return 0
    })
    .map((standing, index) => ({ ...standing, rank: index + 1 }))
}
