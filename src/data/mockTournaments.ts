import type { Tournament } from '../types/domain'

export const mockTournaments: Tournament[] = [
  {
    id: 'tournament-dublin-friends',
    name: 'Dublin Friends Tournament',
    brand: 'GADX',
    status: 'draft',
    roundName: 'Round 1 Test Window',
    roundStartDate: '2026-06-25T00:00:00.000Z',
    roundEndDate: '2026-06-27T18:00:00.000Z',
    resultsMode: 'manual',
    createdByUserId: 'user-admin-gadx',
    createdAt: '2026-06-23T20:00:00.000Z',
    updatedAt: '2026-06-23T20:00:00.000Z',
  },
]