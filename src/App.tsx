import { useState } from 'react'
import { AppFooter } from './components/AppFooter'
import { AppHeader } from './components/AppHeader'
import { AppNavigation } from './components/AppNavigation'
import { MatchAdminPanel } from './components/MatchAdminPanel'
import { MetricCard } from './components/MetricCard'
import { SurvivorBracketPanel } from './components/SurvivorBracketPanel'
import { SurvivorLeaderboardPanel } from './components/SurvivorLeaderboardPanel'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useBackendDraw } from './hooks/useBackendDraw'
import { useBackendGameData } from './hooks/useBackendGameData'
import { deleteLockedDraw, saveLockedDraw, updateMatch } from './lib/apiClient'
import { getSurvivorDrawReadiness, runSurvivorDraw } from './lib/survivorDraw'
import { calculateSurvivorStandings } from './lib/survivorScoring'
import type { Match, TeamAssignment } from './types/domain'

const survivorTournamentId = 'tournament_wc_survivor'
const activeUserId = 'user_admin'
const teamsPerPlayer = 2

function App() {
  const adminAuthStatus = useAdminAuth()
  const isAdminMode = adminAuthStatus === 'admin'

  const backendGameData = useBackendGameData(survivorTournamentId)
  const backendDraw = useBackendDraw(survivorTournamentId)

  const [drawActionMessage, setDrawActionMessage] = useState<string | null>(null)
  const [isSavingDraw, setIsSavingDraw] = useState(false)
  const [draftAssignments, setDraftAssignments] = useState<TeamAssignment[]>([])

  const tournament = backendGameData.data.tournament
  const players = backendGameData.data.players
  const teams = backendGameData.data.teams
  const matches = backendGameData.data.matches
  const scoringRules = backendGameData.data.scoringRules

  // Teams eligible for the draw: the ones seeded into this tournament that are
  // still active/qualified (the 16 Round-of-16 teams once they are seeded).
  const eligibleTeams = teams.filter(
    (team) => team.tournamentStatus === 'active' || team.qualificationStatus === 'qualified',
  )

  const lockedAssignments = backendDraw.assignments
  const isDrawLocked = lockedAssignments.length > 0
  const activeAssignments = isDrawLocked ? lockedAssignments : draftAssignments

  const cutoffUtc = tournament?.roundStartDate ?? '2026-07-01T00:00:00.000Z'

  const standings =
    players.length > 0 && scoringRules
      ? calculateSurvivorStandings(
          players,
          activeAssignments,
          matches,
          scoringRules,
          survivorTournamentId,
          cutoffUtc,
        )
      : []

  const drawReadiness = getSurvivorDrawReadiness(players, eligibleTeams, teamsPerPlayer)

  const alivePlayers = standings.filter((standing) => standing.state === 'alive').length
  const completedMatches = matches.filter((match) => match.status === 'fulltime').length

  function handleRunDraw() {
    setDrawActionMessage(null)

    if (!isAdminMode) {
      setDrawActionMessage('Admin mode is required to run the draw.')
      return
    }

    if (isDrawLocked) {
      setDrawActionMessage('A draw is already locked. Reset it before running a new one.')
      return
    }

    if (!drawReadiness.canRunDraw) {
      setDrawActionMessage(drawReadiness.reason ?? 'The draw is not ready yet.')
      return
    }

    const assignments = runSurvivorDraw(players, eligibleTeams, teamsPerPlayer)
    if (assignments.length === 0) {
      setDrawActionMessage('The draw did not produce assignments. Check players and teams.')
      return
    }

    setDraftAssignments(assignments)
    setDrawActionMessage('Draft draw generated. Review it below, then save & lock when ready.')
  }

  async function handleSaveAndLockDraw() {
    setDrawActionMessage(null)

    if (!isAdminMode) {
      setDrawActionMessage('Admin mode is required to save the draw.')
      return
    }

    if (draftAssignments.length === 0) {
      setDrawActionMessage('Generate a draft draw before saving.')
      return
    }

    if (isDrawLocked) {
      setDrawActionMessage('A locked draw already exists. Reset it before saving a new one.')
      return
    }

    setIsSavingDraw(true)

    try {
      await saveLockedDraw(survivorTournamentId, {
        createdByUserId: activeUserId,
        assignments: draftAssignments.map((assignment) => ({
          playerId: assignment.playerId,
          teamId: assignment.teamId,
        })),
      })

      await backendDraw.reload()
      setDraftAssignments([])
      setDrawActionMessage('Draw saved and locked successfully.')
    } catch (error) {
      setDrawActionMessage(
        error instanceof Error
          ? `Could not save the draw: ${error.message}`
          : 'Could not save the draw because of an unknown error.',
      )
    } finally {
      setIsSavingDraw(false)
    }
  }

  async function handleResetLockedDraw() {
    setDrawActionMessage(null)

    if (!isAdminMode) {
      setDrawActionMessage('Admin mode is required to reset the draw.')
      return
    }

    try {
      await deleteLockedDraw(survivorTournamentId)
      await backendDraw.reload()
      setDraftAssignments([])
      setDrawActionMessage('Locked draw reset successfully.')
    } catch (error) {
      setDrawActionMessage(
        error instanceof Error
          ? `Could not reset the draw: ${error.message}`
          : 'Could not reset the draw because of an unknown error.',
      )
    }
  }

  async function handleUpdateMatch(matchId: string, updates: Partial<Match>) {
    if (!isAdminMode) {
      return
    }

    try {
      await updateMatch(matchId, {
        status: updates.status,
        homeScore: updates.homeScore,
        awayScore: updates.awayScore,
      })
      await backendGameData.reload()
    } catch (error) {
      setDrawActionMessage(
        error instanceof Error
          ? `Could not update the match: ${error.message}`
          : 'Could not update the match because of an unknown error.',
      )
    }
  }

  function handleResetMatches() {
    // Manual bulk reset is intentionally a no-op for the survivor tournament;
    // knockout results are edited individually via the admin panel.
  }

  if (adminAuthStatus === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-6 text-slate-950">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pitch-700)]">
          Loading…
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-6 text-slate-950 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <AppHeader milestone="World Cup Survivor" />
        <AppNavigation />

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Tournament" value={tournament?.name ?? 'World Cup Survivor'} />
          <MetricCard label="Players" value={players.length} />
          <MetricCard label="Still Alive" value={`${alivePlayers} / ${players.length}`} />
          <MetricCard label="Knockout Results" value={completedMatches} />
        </section>

        {backendGameData.status === 'error' && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Could not load the survivor tournament from the backend. Make sure the migration has run
            and the Worker is deployed. Error: {backendGameData.errorMessage}
          </div>
        )}

        <article className="rounded-3xl border border-[var(--pitch-900)]/10 bg-white/85 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--pitch-700)]">
                Access Mode
              </p>
              <h2 className="font-display mt-3 text-2xl font-bold uppercase tracking-tight text-[var(--ink-900)]">
                {isAdminMode ? 'Admin controls enabled' : 'Public viewer mode'}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-600)]">
                {isAdminMode
                  ? 'Run the draw, lock team assignments, and record knockout results below.'
                  : 'Read-only view of the survivor standings and bracket.'}
              </p>
            </div>
            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                isAdminMode ? 'bg-[var(--pitch-900)] text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isAdminMode ? 'Admin' : 'Public Viewer'}
            </span>
          </div>
        </article>

        {/* Draw controls (admin only) */}
        {isAdminMode && (
          <article className="rounded-3xl border border-[var(--pitch-900)]/10 bg-white/85 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--pitch-700)]">
              Draw Control
            </p>
            <div className="chalk-rule mt-3" />
            <h2 className="font-display mt-4 text-2xl font-bold uppercase tracking-tight text-[var(--ink-900)]">
              Assign teams to players
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-600)]">
              Each player receives {teamsPerPlayer} teams, drawn together. Needs exactly{' '}
              {players.length * teamsPerPlayer} eligible teams ({players.length} players ×{' '}
              {teamsPerPlayer}). Currently {eligibleTeams.length} eligible.
            </p>

            {drawActionMessage && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
                {drawActionMessage}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRunDraw}
                disabled={isDrawLocked}
                className="rounded-full bg-[var(--pitch-900)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--pitch-800)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Run Draw
              </button>
              <button
                type="button"
                onClick={isSavingDraw ? undefined : handleSaveAndLockDraw}
                disabled={draftAssignments.length === 0 || isDrawLocked || isSavingDraw}
                className="rounded-full bg-[var(--lime-400)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[var(--pitch-900)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSavingDraw ? 'Saving…' : 'Save & Lock'}
              </button>
              <button
                type="button"
                onClick={handleResetLockedDraw}
                disabled={!isDrawLocked}
                className="rounded-full border border-[var(--pitch-900)]/15 bg-white px-5 py-3 text-sm font-semibold text-[var(--ink-900)] shadow-sm transition hover:border-[var(--pitch-700)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset Draw
              </button>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--ink-600)]">
              {isDrawLocked
                ? 'Draw is locked.'
                : draftAssignments.length > 0
                  ? 'Draft ready — save to lock.'
                  : 'No draw yet.'}
            </p>
          </article>
        )}

        {/* Standings table */}
        <SurvivorLeaderboardPanel players={players} teams={teams} standings={standings} />

        {/* Bracket */}
        <SurvivorBracketPanel
          players={players}
          teams={teams}
          matches={matches}
          assignments={activeAssignments}
        />

        {/* Match admin (admin only) */}
        {isAdminMode && (
          <MatchAdminPanel
            matches={matches}
            teams={teams}
            isReadOnly={false}
            statusLabel={undefined}
            readOnlyReason={undefined}
            onUpdateMatch={handleUpdateMatch}
            onResetMatches={handleResetMatches}
          />
        )}

        <AppFooter />
      </section>
    </main>
  )
}

export default App
