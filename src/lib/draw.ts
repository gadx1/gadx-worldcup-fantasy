import type { Player, Team, TeamAssignment } from '../types/domain'

export interface DrawReadiness {
  canRunDraw: boolean
  playerCount: number
  eligibleTeamCount: number
  teamsPerPlayer: number
  reason?: string
}

export function getDrawReadiness(players: Player[], eligibleTeams: Team[]): DrawReadiness {
  if (players.length === 0) {
    return {
      canRunDraw: false,
      playerCount: 0,
      eligibleTeamCount: eligibleTeams.length,
      teamsPerPlayer: 0,
      reason: 'At least one player is required to run the draw.',
    }
  }

  if (eligibleTeams.length === 0) {
    return {
      canRunDraw: false,
      playerCount: players.length,
      eligibleTeamCount: 0,
      teamsPerPlayer: 0,
      reason: 'At least one eligible team is required to run the draw.',
    }
  }

  if (eligibleTeams.length % players.length !== 0) {
    return {
      canRunDraw: false,
      playerCount: players.length,
      eligibleTeamCount: eligibleTeams.length,
      teamsPerPlayer: 0,
      reason: 'Eligible teams must divide equally across all players.',
    }
  }

  return {
    canRunDraw: true,
    playerCount: players.length,
    eligibleTeamCount: eligibleTeams.length,
    teamsPerPlayer: eligibleTeams.length / players.length,
  }
}

function shuffleTeams(teams: Team[]) {
  const shuffledTeams = [...teams]

  for (let currentIndex = shuffledTeams.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    const currentTeam = shuffledTeams[currentIndex]
    const randomTeam = shuffledTeams[randomIndex]

    shuffledTeams[currentIndex] = randomTeam
    shuffledTeams[randomIndex] = currentTeam
  }

  return shuffledTeams
}

export function runFairDraw(players: Player[], eligibleTeams: Team[]): TeamAssignment[] {
  const readiness = getDrawReadiness(players, eligibleTeams)

  if (!readiness.canRunDraw) {
    throw new Error(readiness.reason)
  }

  const shuffledTeams = shuffleTeams(eligibleTeams)
  const assignedAt = new Date().toISOString()
  const drawId = `local-draw-${Date.now()}`
  const assignments: TeamAssignment[] = []

  players.forEach((player, playerIndex) => {
    const startIndex = playerIndex * readiness.teamsPerPlayer
    const endIndex = startIndex + readiness.teamsPerPlayer
    const playerTeams = shuffledTeams.slice(startIndex, endIndex)

    playerTeams.forEach((team) => {
      assignments.push({
        drawId,
        playerId: player.id,
        teamId: team.id,
        assignedAt,
      })
    })
  })

  return assignments
}