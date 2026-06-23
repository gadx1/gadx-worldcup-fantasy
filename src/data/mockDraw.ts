import type { Draw, TeamAssignment } from '../types/domain'

export const mockDraw: Draw = {
  id: 'draw-dublin-friends-001',
  tournamentId: 'tournament-dublin-friends',
  status: 'locked',
  teamsPerPlayer: 1,
  randomSeed: 'local-seed-001',
  createdAt: '2026-06-23T20:30:00.000Z',
  lockedAt: '2026-06-23T20:31:00.000Z',
}

export const mockTeamAssignments: TeamAssignment[] = [
  {
    drawId: 'draw-dublin-friends-001',
    playerId: 'player-001',
    teamId: 'mexico',
    assignedAt: '2026-06-23T20:31:00.000Z',
  },
  {
    drawId: 'draw-dublin-friends-001',
    playerId: 'player-002',
    teamId: 'canada',
    assignedAt: '2026-06-23T20:31:00.000Z',
  },
  {
    drawId: 'draw-dublin-friends-001',
    playerId: 'player-003',
    teamId: 'argentina',
    assignedAt: '2026-06-23T20:31:00.000Z',
  },
  {
    drawId: 'draw-dublin-friends-001',
    playerId: 'player-004',
    teamId: 'japan',
    assignedAt: '2026-06-23T20:31:00.000Z',
  },
  {
    drawId: 'draw-dublin-friends-001',
    playerId: 'player-005',
    teamId: 'brazil',
    assignedAt: '2026-06-23T20:31:00.000Z',
  },
  {
    drawId: 'draw-dublin-friends-001',
    playerId: 'player-006',
    teamId: 'uruguay',
    assignedAt: '2026-06-23T20:31:00.000Z',
  },
]