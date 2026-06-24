import { useCallback, useEffect, useState } from 'react'
import {
  fetchMatchesByTournamentId,
  fetchPlayersByTournamentId,
  fetchScoringRulesByTournamentId,
  fetchTeams,
  fetchTournamentById,
} from '../lib/apiClient'
import type { Match, Player, ScoringRules, Team, Tournament } from '../types/domain'

type BackendGameDataStatus = 'loading' | 'ready' | 'error'

type BackendGameData = {
  matches: Match[]
  players: Player[]
  scoringRules: ScoringRules | null
  teams: Team[]
  tournament: Tournament | null
}

type UseBackendGameDataResult = {
  data: BackendGameData
  errorMessage: string | null
  isBackendDataReady: boolean
  reload: () => Promise<void>
  status: BackendGameDataStatus
}

function mapApiTournament(apiTournament: {
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
}): Tournament {
  return {
    id: apiTournament.id,
    brand: 'GADX',
    name: apiTournament.name,
    roundName: apiTournament.roundName,
    roundStartDate: apiTournament.roundStartDate,
    roundEndDate: apiTournament.roundEndDate,
    status: apiTournament.status as Tournament['status'],
    resultsMode: apiTournament.resultsMode as Tournament['resultsMode'],
    createdByUserId: apiTournament.createdByUserId,
    createdAt: apiTournament.createdAt,
    updatedAt: apiTournament.updatedAt,
  }
}

function mapApiPlayer(apiPlayer: {
  id: string
  tournamentId: string
  firstName: string
  lastName: string
  displayName: string
  avatarId: string
}): Player {
  return {
    id: apiPlayer.id,
    tournamentId: apiPlayer.tournamentId,
    firstName: apiPlayer.firstName,
    lastName: apiPlayer.lastName,
    displayName: apiPlayer.displayName,
    avatarId: apiPlayer.avatarId,
  }
}

function mapApiMatch(apiMatch: {
  id: string
  roundName: string
  homeTeamId: string
  awayTeamId: string
  kickoffUtc: string
  status: string
  homeScore: number
  awayScore: number
}): Match {
  return {
    id: apiMatch.id,
    roundName: apiMatch.roundName,
    homeTeamId: apiMatch.homeTeamId,
    awayTeamId: apiMatch.awayTeamId,
    kickoffUtc: apiMatch.kickoffUtc,
    status: apiMatch.status as Match['status'],
    homeScore: apiMatch.homeScore,
    awayScore: apiMatch.awayScore,
  }
}

function mapApiTeam(apiTeam: {
  id: string
  countryName: string
  countryCode: string
  flagEmoji: string
  tournamentStatus: string
  qualificationStatus?: string
  isActive?: boolean
}): Team {
  return {
    id: apiTeam.id,
    countryName: apiTeam.countryName,
    countryCode: apiTeam.countryCode,
    flagEmoji: apiTeam.flagEmoji,
    tournamentStatus: (apiTeam.isActive ? 'active' : apiTeam.tournamentStatus) as Team['tournamentStatus'],
    qualificationStatus: (apiTeam.qualificationStatus ?? 'qualified') as Team['qualificationStatus'],
  }
}

function mapApiScoringRules(apiScoringRules: {
  tournamentId: string
  winPoints: number
  drawPoints: number
  lossPoints: number
  goalPoints: number
  cleanSheetPoints: number
  qualificationBonusPoints: number
  groupWinnerBonusPoints: number
}): ScoringRules {
  return {
    tournamentId: apiScoringRules.tournamentId,
    winPoints: apiScoringRules.winPoints,
    drawPoints: apiScoringRules.drawPoints,
    lossPoints: apiScoringRules.lossPoints,
    goalPoints: apiScoringRules.goalPoints,
    cleanSheetPoints: apiScoringRules.cleanSheetPoints,
    qualificationBonus: apiScoringRules.qualificationBonusPoints,
    groupWinnerBonus: apiScoringRules.groupWinnerBonusPoints,
  }
}

export function useBackendGameData(tournamentId: string): UseBackendGameDataResult {
  const [status, setStatus] = useState<BackendGameDataStatus>('loading')
  const [data, setData] = useState<BackendGameData>({
    matches: [],
    players: [],
    scoringRules: null,
    teams: [],
    tournament: null,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadBackendGameData = useCallback(async () => {
    try {
      const [
        tournamentResponse,
        playersResponse,
        matchesResponse,
        teamsResponse,
        scoringRulesResponse,
      ] = await Promise.all([
        fetchTournamentById(tournamentId),
        fetchPlayersByTournamentId(tournamentId),
        fetchMatchesByTournamentId(tournamentId),
        fetchTeams(),
        fetchScoringRulesByTournamentId(tournamentId),
      ])

      setData({
        tournament: mapApiTournament(tournamentResponse.tournament),
        players: playersResponse.players.map(mapApiPlayer),
        matches: matchesResponse.matches.map(mapApiMatch),
        teams: teamsResponse.teams.map(mapApiTeam),
        scoringRules: scoringRulesResponse.scoringRules
          ? mapApiScoringRules(scoringRulesResponse.scoringRules)
          : null,
      })

      setStatus('ready')
      setErrorMessage(null)
    } catch (error) {
      setData({
        matches: [],
        players: [],
        scoringRules: null,
        teams: [],
        tournament: null,
      })
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
    }
  }, [tournamentId])

  useEffect(() => {
    let isMounted = true

    async function loadWhenMounted() {
      try {
        const [
          tournamentResponse,
          playersResponse,
          matchesResponse,
          teamsResponse,
          scoringRulesResponse,
        ] = await Promise.all([
          fetchTournamentById(tournamentId),
          fetchPlayersByTournamentId(tournamentId),
          fetchMatchesByTournamentId(tournamentId),
          fetchTeams(),
          fetchScoringRulesByTournamentId(tournamentId),
        ])

        if (!isMounted) {
          return
        }

        setData({
          tournament: mapApiTournament(tournamentResponse.tournament),
          players: playersResponse.players.map(mapApiPlayer),
          matches: matchesResponse.matches.map(mapApiMatch),
          teams: teamsResponse.teams.map(mapApiTeam),
          scoringRules: scoringRulesResponse.scoringRules
            ? mapApiScoringRules(scoringRulesResponse.scoringRules)
            : null,
        })

        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setData({
          matches: [],
          players: [],
          scoringRules: null,
          teams: [],
          tournament: null,
        })
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadWhenMounted()

    return () => {
      isMounted = false
    }
  }, [tournamentId])

  return {
    data,
    errorMessage,
    isBackendDataReady:
      status === 'ready' &&
      data.tournament !== null &&
      data.players.length > 0 &&
      data.matches.length > 0 &&
      data.teams.length > 0 &&
      data.scoringRules !== null,
    reload: loadBackendGameData,
    status,
  }
}