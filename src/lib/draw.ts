import type { Player, Team, TeamAssignment } from '../types/domain'

export type DrawReadiness = {
  canRunDraw: boolean
  playerCount: number
  eligibleTeamCount: number
  teamsPerPlayer: number
  reason?: string
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

export function getDrawReadiness(players: Player[], eligibleTeams: Team[]): DrawReadiness {
  const playerCount = players.length
  const eligibleTeamCount = eligibleTeams.length

  if (playerCount === 0) {
    return {
      canRunDraw: false,
      playerCount,
      eligibleTeamCount,
      teamsPerPlayer: 0,
      reason: 'Add players before running the draw.',
    }
  }

  if (eligibleTeamCount === 0) {
    return {
      canRunDraw: false,
      playerCount,
      eligibleTeamCount,
      teamsPerPlayer: 0,
      reason: 'No eligible teams are available for the selected tournament window.',
    }
  }

  if (eligibleTeamCount < playerCount) {
    return {
      canRunDraw: false,
      playerCount,
      eligibleTeamCount,
      teamsPerPlayer: 0,
      reason: 'There must be at least one eligible team per player.',
    }
  }

  return {
    canRunDraw: true,
    playerCount,
    eligibleTeamCount,
    teamsPerPlayer: 1,
  }
}

export function runFairDraw(players: Player[], eligibleTeams: Team[]): TeamAssignment[] {
  const readiness = getDrawReadiness(players, eligibleTeams)

  if (!readiness.canRunDraw) {
    return []
  }

  const shuffledTeams = shuffle(eligibleTeams).slice(0, players.length)
  const shuffledPlayers = shuffle(players)

  return shuffledPlayers.map((player, index) => ({
    drawId: `draft-${Date.now()}`,
    playerId: player.id,
    teamId: shuffledTeams[index].id,
    assignedAt: new Date().toISOString(),
  }))
}

