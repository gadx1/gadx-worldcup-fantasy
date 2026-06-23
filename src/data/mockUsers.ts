import type { AppUser, TournamentUser } from '../types/domain'

export const mockUsers: AppUser[] = [
  {
    id: 'user-admin-gadx',
    email: 'admin@gadx.local',
    displayName: 'GADX Admin',
    globalRole: 'admin',
    status: 'active',
  },
  {
    id: 'user-viewer-001',
    email: 'viewer.one@example.com',
    displayName: 'Viewer One',
    globalRole: 'viewer',
    status: 'active',
  },
]

export const mockTournamentUsers: TournamentUser[] = [
  {
    tournamentId: 'tournament-dublin-friends',
    userId: 'user-admin-gadx',
    role: 'admin',
    accessStatus: 'active',
  },
  {
    tournamentId: 'tournament-dublin-friends',
    userId: 'user-viewer-001',
    role: 'viewer',
    playerId: 'player-001',
    accessStatus: 'active',
  },
]