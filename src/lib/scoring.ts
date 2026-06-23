import type { Match, Player, ScoringRules, Standing, TeamAssignment } from '../types/domain'

export interface TeamScore {
  teamId: string
  matchPoints: number
  bonusPoints: number
  totalPoints: number
}

function calculateTeamMatchScore(teamId: string, match: Match, scoringRules: ScoringRules) {
  const isHomeTeam = match.homeTeamId === teamId
  const isAwayTeam = match.awayTeamId === teamId

  if (!isHomeTeam && !isAwayTeam) {
    return 0
  }

  if (match.status !== 'fulltime') {
    return 0
  }

  const teamScore = isHomeTeam ? match.homeScore : match.awayScore
  const opponentScore = isHomeTeam ? match.awayScore : match.homeScore

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

export function calculateTeamScores(
  teamIds: string[],
  matches: Match[],
  scoringRules: ScoringRules,
): TeamScore[] {
  return teamIds.map((teamId) => {
    const matchPoints = matches.reduce((total, match) => {
      return total + calculateTeamMatchScore(teamId, match, scoringRules)
    }, 0)

    return {
      teamId,
      matchPoints,
      bonusPoints: 0,
      totalPoints: matchPoints,
    }
  })
}

export function calculateStandings(
  players: Player[],
  assignments: TeamAssignment[],
  matches: Match[],
  scoringRules: ScoringRules,
  tournamentId: string,
): Standing[] {
  const assignedTeamIds = assignments.map((assignment) => assignment.teamId)
  const teamScores = calculateTeamScores(assignedTeamIds, matches, scoringRules)

  const standingsWithoutRanks = players.map((player) => {
    const playerTeamIds = assignments
      .filter((assignment) => assignment.playerId === player.id)
      .map((assignment) => assignment.teamId)

    const playerScores = teamScores.filter((teamScore) => playerTeamIds.includes(teamScore.teamId))

    const matchPoints = playerScores.reduce((total, teamScore) => total + teamScore.matchPoints, 0)
    const bonusPoints = playerScores.reduce((total, teamScore) => total + teamScore.bonusPoints, 0)
    const totalPoints = matchPoints + bonusPoints

    return {
      tournamentId,
      playerId: player.id,
      matchPoints,
      bonusPoints,
      totalPoints,
      rank: 0,
      lastCalculatedAt: new Date().toISOString(),
    }
  })

  return standingsWithoutRanks
    .sort((a, b) => b.totalPoints - a.totalPoints || b.matchPoints - a.matchPoints)
    .map((standing, index) => ({
      ...standing,
      rank: index + 1,
    }))
}