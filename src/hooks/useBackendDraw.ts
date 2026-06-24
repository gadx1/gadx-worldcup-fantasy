import { useCallback, useEffect, useState } from 'react'
import { fetchLockedDrawByTournamentId } from '../lib/apiClient'
import type { TeamAssignment } from '../types/domain'

type BackendDrawStatus = 'loading' | 'ready' | 'error'

type UseBackendDrawResult = {
  assignments: TeamAssignment[]
  errorMessage: string | null
  hasBackendDraw: boolean
  reload: () => Promise<void>
  status: BackendDrawStatus
}

function mapApiAssignment(apiAssignment: {
  drawId: string
  playerId: string
  teamId: string
  createdAt: string
}): TeamAssignment {
  return {
    drawId: apiAssignment.drawId,
    playerId: apiAssignment.playerId,
    teamId: apiAssignment.teamId,
    assignedAt: apiAssignment.createdAt,
  }
}

export function useBackendDraw(tournamentId: string): UseBackendDrawResult {
  const [status, setStatus] = useState<BackendDrawStatus>('loading')
  const [assignments, setAssignments] = useState<TeamAssignment[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadBackendDraw = useCallback(async () => {
    try {
      const response = await fetchLockedDrawByTournamentId(tournamentId)

      setAssignments(response.assignments.map(mapApiAssignment))
      setStatus('ready')
      setErrorMessage(null)
    } catch (error) {
      setAssignments([])
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
    }
  }, [tournamentId])

  useEffect(() => {
    let isMounted = true

    async function loadWhenMounted() {
      try {
        const response = await fetchLockedDrawByTournamentId(tournamentId)

        if (!isMounted) {
          return
        }

        setAssignments(response.assignments.map(mapApiAssignment))
        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setAssignments([])
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
    assignments,
    errorMessage,
    hasBackendDraw: status === 'ready' && assignments.length > 0,
    reload: loadBackendDraw,
    status,
  }
}