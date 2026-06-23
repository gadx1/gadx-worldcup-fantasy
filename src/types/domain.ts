export type GlobalRole = 'admin' | 'viewer'

export type UserStatus = 'invited' | 'active' | 'blocked'

export type TournamentStatus = 'draft' | 'active' | 'completed' | 'archived'

export type ResultsMode = 'manual' | 'api'

export type TeamTournamentStatus = 'active' | 'eliminated' | 'unknown'

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'fulltime'
  | 'postponed'
  | 'cancelled'

export type DrawStatus = 'draft' | 'locked' | 'reset'

export interface AppUser {
  id: string
  email: string
  displayName: string
  globalRole: GlobalRole
  status: UserStatus
}

export interface Tournament {
  id: string
  name: string
  brand: 'GADX'
  status: TournamentStatus
  roundName: string
  roundStartDate: string
  roundEndDate: string
  resultsMode: ResultsMode
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export interface TournamentUser {
  tournamentId: string
  userId: string
  role: GlobalRole
  playerId?: string
  accessStatus: 'invited' | 'active' | 'revoked'
}

export interface Player {
  id: string
  tournamentId: string
  firstName: string
  lastName: string
  displayName: string
  avatarId: string
}

export interface Team {
  id: string
  countryName: string
  countryCode: string
  flagEmoji: string
  flagPath?: string
  groupName?: string
  qualificationStatus: 'qualified' | 'pending' | 'unknown'
  tournamentStatus: TeamTournamentStatus
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  kickoffUtc: string
  roundName: string
  status: MatchStatus
  homeScore: number
  awayScore: number
}

export interface MatchEvent {
  id: string
  matchId: string
  eventType: 'goal' | 'card' | 'halftime' | 'fulltime' | 'penalty' | 'other'
  teamId?: string
  minute?: number
  description: string
}

export interface EligibleTeam {
  tournamentId: string
  teamId: string
  isEligible: boolean
  exclusionReason?: string
  manuallyExcluded: boolean
  calculatedAt: string
}

export interface Draw {
  id: string
  tournamentId: string
  status: DrawStatus
  teamsPerPlayer: number
  randomSeed?: string
  createdAt: string
  lockedAt?: string
}

export interface TeamAssignment {
  drawId: string
  playerId: string
  teamId: string
  assignedAt: string
}

export interface ScoringRules {
  tournamentId: string
  winPoints: number
  drawPoints: number
  lossPoints: number
  goalPoints: number
  cleanSheetPoints: number
  qualificationBonus: number
  groupWinnerBonus: number
}

export interface Standing {
  tournamentId: string
  playerId: string
  matchPoints: number
  bonusPoints: number
  totalPoints: number
  rank: number
  lastCalculatedAt: string
}

export interface AppSection {
  title: string
  description: string
  access: 'admin' | 'viewer' | 'shared'
}