import type { Player, Team, TeamAssignment } from '../types/domain'

/**
 * Survivor draw.
 *
 * Every player receives exactly `teamsPerPlayer` teams (2 in the World Cup
 * Survivor tournament), drawn together in a single shuffle. The number of
 * eligible teams must equal players * teamsPerPlayer so the pool divides evenly
 * with no leftovers (e.g. 16 knockout teams / 8 players = 2 each).
 */

export type SurvivorDrawReadiness = {
  canRunDraw: boolean
  playerCount: number
  eligibleTeamCount: number
  teamsPerPlayer: number
  reason?: string
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  // Fisher–Yates for an unbiased shuffle.
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function getSurvivorDrawReadiness(
  players: Player[],
  eligibleTeams: Team[],
  teamsPerPlayer = 2,
): SurvivorDrawReadiness {
  const playerCount = players.length
  const eligibleTeamCount = eligibleTeams.length
  const needed = playerCount * teamsPerPlayer

  if (playerCount === 0) {
    return {
      canRunDraw: false,
      playerCount,
      eligibleTeamCount,
      teamsPerPlayer,
      reason: 'Add players before running the draw.',
    }
  }

  if (eligibleTeamCount === 0) {
    return {
      canRunDraw: false,
      playerCount,
      eligibleTeamCount,
      teamsPerPlayer,
      reason: 'No eligible teams are available yet. The Round of 16 teams appear after the Round of 32 finishes.',
    }
  }

  if (eligibleTeamCount !== needed) {
    return {
      canRunDraw: false,
      playerCount,
      eligibleTeamCount,
      teamsPerPlayer,
      reason: `Need exactly ${needed} eligible teams (${playerCount} players × ${teamsPerPlayer}), but found ${eligibleTeamCount}.`,
    }
  }

  return {
    canRunDraw: true,
    playerCount,
    eligibleTeamCount,
    teamsPerPlayer,
  }
}

/**
 * Assign every player `teamsPerPlayer` teams in a single shuffle. Teams are
 * shuffled once and handed out in contiguous chunks, so each team is used
 * exactly once and every player gets the same count.
 */
export function runSurvivorDraw(
  players: Player[],
  eligibleTeams: Team[],
  teamsPerPlayer = 2,
): TeamAssignment[] {
  const readiness = getSurvivorDrawReadiness(players, eligibleTeams, teamsPerPlayer)
  if (!readiness.canRunDraw) {
    return []
  }

  const drawId = `draft-${Date.now()}`
  const assignedAt = new Date().toISOString()
  const shuffledPlayers = shuffle(players)
  const shuffledTeams = shuffle(eligibleTeams)

  const assignments: TeamAssignment[] = []

  shuffledPlayers.forEach((player, playerIndex) => {
    for (let slot = 0; slot < teamsPerPlayer; slot += 1) {
      const teamIndex = playerIndex * teamsPerPlayer + slot
      assignments.push({
        drawId,
        playerId: player.id,
        teamId: shuffledTeams[teamIndex].id,
        assignedAt,
      })
    }
  })

  return assignments
}
