const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'

export type ApiHealthResponse = {
  ok: boolean
  service: string
  environment: string
  version: string
  database: {
    ok: boolean
  }
  timestamp: string
}

export type ApiTableCount = {
  table_name: string
  row_count: number
}

export type ApiDebugCountsResponse = {
  ok: boolean
  counts: ApiTableCount[]
}

export type ApiTournament = {
  id: string
  name: string
  roundName: string
  roundStartDate: string
  roundEndDate: string
  status: string
  resultsMode: string
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export type ApiPlayer = {
  id: string
  tournamentId: string
  firstName: string
  lastName: string
  displayName: string
  avatarId: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type ApiMatch = {
  id: string
  tournamentId: string
  roundName: string
  homeTeamId: string
  homeTeamName: string
  homeTeamFlagEmoji: string
  awayTeamId: string
  awayTeamName: string
  awayTeamFlagEmoji: string
  kickoffUtc: string
  status: string
  homeScore: number
  awayScore: number
  createdAt: string
  updatedAt: string
}

export type ApiTeam = {
  id: string
  countryName: string
  countryCode: string
  fifaCode: string
  flagEmoji: string
  confederation: string
  tournamentStatus: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ApiScoringRules = {
  id: string
  tournamentId: string
  winPoints: number
  drawPoints: number
  lossPoints: number
  goalPoints: number
  cleanSheetPoints: number
  qualificationBonusPoints: number
  groupWinnerBonusPoints: number
  createdAt: string
  updatedAt: string
}

export type ApiTournamentsResponse = {
  ok: boolean
  tournaments: ApiTournament[]
}

export type ApiTournamentResponse = {
  ok: boolean
  tournament: ApiTournament
}

export type ApiPlayersResponse = {
  ok: boolean
  players: ApiPlayer[]
}

export type ApiPlayerResponse = {
  ok: boolean
  player: ApiPlayer
}

export type ApiMatchesResponse = {
  ok: boolean
  matches: ApiMatch[]
}

export type ApiMatchResponse = {
  ok: boolean
  match: ApiMatch
}

export type ApiTeamsResponse = {
  ok: boolean
  teams: ApiTeam[]
}

export type ApiScoringRulesResponse = {
  ok: boolean
  scoringRules: ApiScoringRules | null
}

export type UpdateTournamentPayload = {
  name?: string
  roundName?: string
  roundStartDate?: string
  roundEndDate?: string
  resultsMode?: string
}

export type UpdatePlayerPayload = {
  firstName?: string
  lastName?: string
  displayName?: string
  avatarId?: string
}

export type UpdateMatchPayload = {
  status?: string
  homeScore?: number
  awayScore?: number
}

async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<TResponse>
}

async function apiPatch<TResponse>(path: string, body: Record<string, unknown>): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<TResponse>
}

export function fetchApiHealth() {
  return apiGet<ApiHealthResponse>('/api/health')
}

export function fetchDebugCounts() {
  return apiGet<ApiDebugCountsResponse>('/api/debug/counts')
}

export function fetchTournaments() {
  return apiGet<ApiTournamentsResponse>('/api/tournaments')
}

export function fetchTournamentById(tournamentId: string) {
  return apiGet<ApiTournamentResponse>(`/api/tournaments/${tournamentId}`)
}

export function fetchPlayersByTournamentId(tournamentId: string) {
  return apiGet<ApiPlayersResponse>(`/api/tournaments/${tournamentId}/players`)
}

export function fetchMatchesByTournamentId(tournamentId: string) {
  return apiGet<ApiMatchesResponse>(`/api/tournaments/${tournamentId}/matches`)
}

export function fetchTeams() {
  return apiGet<ApiTeamsResponse>('/api/teams')
}

export function fetchScoringRulesByTournamentId(tournamentId: string) {
  return apiGet<ApiScoringRulesResponse>(`/api/tournaments/${tournamentId}/scoring-rules`)
}

export function updateTournament(tournamentId: string, payload: UpdateTournamentPayload) {
  return apiPatch<ApiTournamentResponse>(`/api/tournaments/${tournamentId}`, payload)
}

export function updatePlayer(playerId: string, payload: UpdatePlayerPayload) {
  return apiPatch<ApiPlayerResponse>(`/api/players/${playerId}`, payload)
}

export function updateMatch(matchId: string, payload: UpdateMatchPayload) {
  return apiPatch<ApiMatchResponse>(`/api/matches/${matchId}`, payload)
}