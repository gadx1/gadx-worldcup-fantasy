import { useEffect, useState } from 'react'
import { fetchTournamentById } from '../lib/apiClient'
import type { Tournament } from '../types/domain'

type BackendTournamentStatus = 'loading' | 'ready' | 'error'

type UseBackendTournamentResult = {
  errorMessage: string | null
  isBackendTournament: boolean
  status: BackendTournamentStatus
  tournament: Tournament | null
}

function mapApiTournamentToTournament(apiTournament: {
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

export function useBackendTournament(tournamentId: string): UseBackendTournamentResult {
  const [status, setStatus] = useState<BackendTournamentStatus>('loading')
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTournament() {
      try {
        const response = await fetchTournamentById(tournamentId)

        if (!isMounted) {
          return
        }

        setTournament(mapApiTournamentToTournament(response.tournament))
        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setTournament(null)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadTournament()

    return () => {
      isMounted = false
    }
  }, [tournamentId])

  return {
    errorMessage,
    isBackendTournament: status === 'ready' && tournament !== null,
    status,
    tournament,
  }
}