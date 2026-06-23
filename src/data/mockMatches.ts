import type { Match } from '../types/domain'

export const mockMatches: Match[] = [
  {
    id: 'match-001',
    homeTeamId: 'mexico',
    awayTeamId: 'canada',
    kickoffUtc: '2026-06-25T19:00:00.000Z',
    roundName: 'Round 1 Test Window',
    status: 'scheduled',
    homeScore: 0,
    awayScore: 0,
  },
  {
    id: 'match-002',
    homeTeamId: 'argentina',
    awayTeamId: 'japan',
    kickoffUtc: '2026-06-26T19:00:00.000Z',
    roundName: 'Round 1 Test Window',
    status: 'scheduled',
    homeScore: 0,
    awayScore: 0,
  },
  {
    id: 'match-003',
    homeTeamId: 'brazil',
    awayTeamId: 'uruguay',
    kickoffUtc: '2026-06-27T17:00:00.000Z',
    roundName: 'Round 1 Test Window',
    status: 'scheduled',
    homeScore: 0,
    awayScore: 0,
  },
]