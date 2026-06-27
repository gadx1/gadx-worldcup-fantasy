import { useCallback, useEffect, useState } from 'react'
import { fetchTournaments } from '../lib/apiClient'
import type { Tournament } from '../types/domain'

type TournamentListStatus = 'loading' | 'ready' | 'error'

export type TournamentSummary = Pick<
  Tournament,
  'id' | 'name' | 'roundName' | 'status' | 'roundStartDate' | 'roundEndDate'
>

type UseTournamentListResult = {
  tournaments: TournamentSummary[]
  status: TournamentListStatus
  errorMessage: string | null
  reload: () => Promise<void>
}

function mapSummary(apiTournament: {
  id: string
  name: string
  roundName: string
  status: string
  roundStartDate: string
  roundEndDate: string
}): TournamentSummary {
  return {
    id: apiTournament.id,
    name: apiTournament.name,
    roundName: apiTournament.roundName,
    status: apiTournament.status as Tournament['status'],
    roundStartDate: apiTournament.roundStartDate,
    roundEndDate: apiTournament.roundEndDate,
  }
}

/**
 * Loads the list of available tournaments so the admin can switch between them.
 * The list is sorted by start date ascending so the earliest round shows first.
 */
export function useTournamentList(): UseTournamentListResult {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [status, setStatus] = useState<TournamentListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetchTournaments()
      const summaries = response.tournaments
        .map(mapSummary)
        .sort((a, b) => a.roundStartDate.localeCompare(b.roundStartDate))

      setTournaments(summaries)
      setStatus('ready')
      setErrorMessage(null)
    } catch (error) {
      setTournaments([])
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    fetchTournaments()
      .then((response) => {
        if (!isMounted) {
          return
        }

        const summaries = response.tournaments
          .map(mapSummary)
          .sort((a, b) => a.roundStartDate.localeCompare(b.roundStartDate))

        setTournaments(summaries)
        setStatus('ready')
        setErrorMessage(null)
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }

        setTournaments([])
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    tournaments,
    status,
    errorMessage,
    reload: load,
  }
}
