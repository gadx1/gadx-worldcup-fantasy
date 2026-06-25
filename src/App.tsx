import { useState } from 'react'
import { AdminGuidePanel } from './components/AdminGuidePanel'
import { ApiStatusPanel } from './components/ApiStatusPanel'
import { AppFooter } from './components/AppFooter'
import { AppHeader } from './components/AppHeader'
import { AppNavigation } from './components/AppNavigation'
import { DataSourcePanel } from './components/DataSourcePanel'
import { DrawControlPanel } from './components/DrawControlPanel'
import { EligibleTeamsPanel } from './components/EligibleTeamsPanel'
import { FeatureSections } from './components/FeatureSections'
import { LeaderboardPanel } from './components/LeaderboardPanel'
import { MatchAdminPanel } from './components/MatchAdminPanel'
import { MatchResultsPanel } from './components/MatchResultsPanel'
import { MetricCard } from './components/MetricCard'
import { PlayerSetupPanel } from './components/PlayerSetupPanel'
import { TournamentSetupPanel } from './components/TournamentSetupPanel'
import { adminSections, viewerSections } from './data/appSections'
import { mockMatches } from './data/mockMatches'
import { mockPlayers } from './data/mockPlayers'
import { mockScoringRules } from './data/mockScoringRules'
import { mockTeams } from './data/mockTeams'
import { mockTournaments } from './data/mockTournaments'
import { useBackendDraw } from './hooks/useBackendDraw'
import { useBackendGameData } from './hooks/useBackendGameData'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import {
  deleteLockedDraw,
  saveLockedDraw,
  updateMatch,
  updatePlayer,
  updateTournament,
} from './lib/apiClient'
import { getDrawReadiness, runFairDraw } from './lib/draw'
import { getEligibleTeams, getIneligibleTeams } from './lib/eligibility'
import { calculateStandings } from './lib/scoring'
import type { Match, Player, TeamAssignment, Tournament } from './types/domain'

const activeTournamentId = 'tournament_dublin_friends'
const activeUserId = 'user_admin'

const localStorageKeys = {
  lockedAssignments: 'gadx-worldcup-draw:locked-assignments',
  matches: 'gadx-worldcup-draw:matches',
  players: 'gadx-worldcup-draw:players',
  tournament: 'gadx-worldcup-draw:tournament',
}

function getIsAdminMode() {
  const searchParams = new URLSearchParams(window.location.search)
  const normalizedPathname = window.location.pathname.replace(/\/+$/, '')

  return (
    normalizedPathname === '/manage' ||
    normalizedPathname.startsWith('/manage/') ||
    searchParams.get('mode') === 'admin'
  )
}

function App() {
  const isAdminMode = getIsAdminMode()

  const backendGameData = useBackendGameData(activeTournamentId)
  const backendDraw = useBackendDraw(activeTournamentId)
  const isBackendDataReady = backendGameData.isBackendDataReady
  const isBackendDrawReady = backendDraw.status === 'ready'

  const [localTournament, setLocalTournament, resetLocalTournament] =
    useLocalStorageState<Tournament>(localStorageKeys.tournament, mockTournaments[0])

  const [localPlayers, setLocalPlayers, resetPlayers] = useLocalStorageState<Player[]>(
    localStorageKeys.players,
    mockPlayers,
  )

  const [localMatches, setLocalMatches, resetMatches] = useLocalStorageState<Match[]>(
    localStorageKeys.matches,
    mockMatches,
  )

  const activeTournament = backendGameData.data.tournament ?? localTournament
  const players = isBackendDataReady ? backendGameData.data.players : localPlayers
  const matches = isBackendDataReady ? backendGameData.data.matches : localMatches
  const teams = isBackendDataReady ? backendGameData.data.teams : mockTeams
  const scoringRules =
    isBackendDataReady && backendGameData.data.scoringRules
      ? backendGameData.data.scoringRules
      : mockScoringRules

  const tournamentPlayers = players.filter((player) => player.tournamentId === activeTournament.id)
  const eligibleTeams = getEligibleTeams(teams, matches, activeTournament)
  const ineligibleTeams = getIneligibleTeams(teams, matches, activeTournament)
  const drawReadiness = getDrawReadiness(tournamentPlayers, eligibleTeams)

  const [draftAssignments, setDraftAssignments] = useState<TeamAssignment[]>([])
  const [localLockedAssignments, setLocalLockedAssignments, resetLocalLockedAssignments] =
    useLocalStorageState<TeamAssignment[]>(localStorageKeys.lockedAssignments, [])

  const lockedAssignments =
    isBackendDataReady && isBackendDrawReady ? backendDraw.assignments : localLockedAssignments

  const isDrawLocked = lockedAssignments.length > 0

  const activeAssignments =
    lockedAssignments.length > 0
      ? lockedAssignments
      : draftAssignments.length > 0
        ? draftAssignments
        : []

  const standings = calculateStandings(
    tournamentPlayers,
    activeAssignments,
    matches,
    scoringRules,
    activeTournament.id,
  )

  const completedMatchCount = matches.filter((match) => match.status === 'fulltime').length

  function handleRunDraw() {
    if (!isAdminMode || !drawReadiness.canRunDraw) {
      return
    }

    const assignments = runFairDraw(tournamentPlayers, eligibleTeams)
    setDraftAssignments(assignments)
  }

  async function handleSaveAndLockDraw() {
    if (!isAdminMode || draftAssignments.length === 0 || lockedAssignments.length > 0) {
      return
    }

    if (isBackendDataReady && isBackendDrawReady) {
      await saveLockedDraw(activeTournament.id, {
        createdByUserId: activeUserId,
        assignments: draftAssignments.map((assignment) => ({
          playerId: assignment.playerId,
          teamId: assignment.teamId,
        })),
      })

      await backendDraw.reload()
      setDraftAssignments([])
      return
    }

    setLocalLockedAssignments(draftAssignments)
    setDraftAssignments([])
  }

  async function handleResetLockedDraw() {
    if (!isAdminMode) {
      return
    }

    if (isBackendDataReady && isBackendDrawReady) {
      await deleteLockedDraw(activeTournament.id)
      await backendDraw.reload()
      setDraftAssignments([])
      return
    }

    resetLocalLockedAssignments()
    setDraftAssignments([])
  }

  async function handleUpdateTournament(updates: Partial<Tournament>) {
    if (!isAdminMode || isDrawLocked) {
      return
    }

    if (isBackendDataReady) {
      await updateTournament(activeTournament.id, {
        name: updates.name,
        roundName: updates.roundName,
        roundStartDate: updates.roundStartDate,
        roundEndDate: updates.roundEndDate,
        resultsMode: updates.resultsMode,
      })
      await backendGameData.reload()
      setDraftAssignments([])
      return
    }

    setLocalTournament((currentTournament) => ({
      ...currentTournament,
      ...updates,
      updatedAt: new Date().toISOString(),
    }))

    setDraftAssignments([])
  }

  function handleResetTournament() {
    if (!isAdminMode || isDrawLocked || isBackendDataReady) {
      return
    }

    resetLocalTournament()
    setDraftAssignments([])
  }

  async function handleUpdatePlayer(playerId: string, updates: Partial<Player>) {
    if (!isAdminMode || isDrawLocked) {
      return
    }

    if (isBackendDataReady) {
      await updatePlayer(playerId, {
        firstName: updates.firstName,
        lastName: updates.lastName,
        displayName: updates.displayName,
        avatarId: updates.avatarId,
      })
      await backendGameData.reload()
      setDraftAssignments([])
      return
    }

    setLocalPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === playerId
          ? {
              ...player,
              ...updates,
            }
          : player,
      ),
    )

    setDraftAssignments([])
  }

  function handleResetPlayers() {
    if (!isAdminMode || isDrawLocked || isBackendDataReady) {
      return
    }

    resetPlayers()
    setDraftAssignments([])
  }

  async function handleUpdateMatch(matchId: string, updates: Partial<Match>) {
    if (!isAdminMode) {
      return
    }

    if (isBackendDataReady) {
      await updateMatch(matchId, {
        status: updates.status,
        homeScore: updates.homeScore,
        awayScore: updates.awayScore,
      })
      await backendGameData.reload()
      return
    }

    setLocalMatches((currentMatches) =>
      currentMatches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              ...updates,
            }
          : match,
      ),
    )
  }

  function handleResetMatches() {
    if (!isAdminMode || isBackendDataReady) {
      return
    }

    resetMatches()
  }

  return (
    <main className="min-h-screen px-6 py-6 text-slate-950 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <AppHeader milestone="Version 5.7" />
        <AppNavigation />

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Tournament" value={activeTournament.name} />
          <MetricCard label="Players" value={`${drawReadiness.playerCount} / 6`} />
          <MetricCard label="Eligible Teams" value={drawReadiness.eligibleTeamCount} />
          <MetricCard label="Completed Matches" value={completedMatchCount} />
        </section>

        <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                Access Mode
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {isAdminMode ? 'Admin controls enabled.' : 'Public viewer mode enabled.'}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {isAdminMode
                  ? 'You are using the protected admin route. Tournament setup, player setup, match admin, draw controls, and the admin guide are available.'
                  : 'This is the public read-only view. Tournament setup, player setup, match admin, and draw controls are hidden.'}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                isAdminMode ? 'bg-slate-950 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isAdminMode ? 'Admin' : 'Public Viewer'}
            </span>
          </div>
        </article>

        {backendGameData.status === 'error' && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Backend game data is not available yet, so the app is temporarily using local fallback
            data. Start the Worker with <code>npm run worker:dev</code>. Error:{' '}
            {backendGameData.errorMessage}
          </div>
        )}

        {backendDraw.status === 'error' && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Backend draw data is not available yet, so the app is temporarily using local fallback
            draw state. Start the Worker with <code>npm run worker:dev</code>. Error:{' '}
            {backendDraw.errorMessage}
          </div>
        )}

        {isAdminMode && <ApiStatusPanel />}

        {isAdminMode && <DataSourcePanel />}

        {isAdminMode && <AdminGuidePanel />}

        {!isDrawLocked && !isAdminMode && (
          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
              Draw Pending
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-amber-950">
              The tournament draw has not been locked yet.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">
              Once the admin runs and locks the draw, player team assignments will appear in the
              leaderboard and remain visible after refresh.
            </p>
          </article>
        )}

        {isAdminMode && (
          <>
            <TournamentSetupPanel
              tournament={activeTournament}
              isLocked={isDrawLocked}
              isReadOnly={false}
              statusLabel={undefined}
              readOnlyReason={undefined}
              onUpdateTournament={handleUpdateTournament}
              onResetTournament={handleResetTournament}
            />

            <PlayerSetupPanel
              players={tournamentPlayers}
              isLocked={isDrawLocked}
              isReadOnly={false}
              statusLabel={undefined}
              readOnlyReason={undefined}
              onUpdatePlayer={handleUpdatePlayer}
            />

            {!isDrawLocked && !isBackendDataReady && (
              <div className="-mt-4 flex justify-end">
                <button
                  className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800"
                  onClick={handleResetPlayers}
                  type="button"
                >
                  Reset Players
                </button>
              </div>
            )}

            <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <EligibleTeamsPanel
                eligibleTeams={eligibleTeams}
                ineligibleTeams={ineligibleTeams}
                drawReadiness={drawReadiness}
              />

              <DrawControlPanel
                players={tournamentPlayers}
                teams={teams}
                draftAssignments={draftAssignments}
                lockedAssignments={lockedAssignments}
                drawReadiness={drawReadiness}
                onRunDraw={handleRunDraw}
                onSaveAndLock={handleSaveAndLockDraw}
                onResetLockedDraw={handleResetLockedDraw}
              />
            </section>
          </>
        )}

        <LeaderboardPanel
          players={tournamentPlayers}
          teams={teams}
          assignments={activeAssignments}
          standings={standings}
        />

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

        <MatchResultsPanel matches={matches} teams={teams} scoringRules={scoringRules} />

        {isAdminMode && (
          <FeatureSections adminSections={adminSections} viewerSections={viewerSections} />
        )}

        <AppFooter />
      </section>
    </main>
  )
}

export default App