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

export type ApiTournamentsResponse = {
  ok: boolean
  tournaments: ApiTournament[]
}

export type ApiTournamentResponse = {
  ok: boolean
  tournament: ApiTournament
}

async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`)

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