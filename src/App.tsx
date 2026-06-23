import { useState } from 'react'
import { AppFooter } from './components/AppFooter'
import { AppHeader } from './components/AppHeader'
import { AppNavigation } from './components/AppNavigation'
import { DrawControlPanel } from './components/DrawControlPanel'
import { EligibleTeamsPanel } from './components/EligibleTeamsPanel'
import { FeatureSections } from './components/FeatureSections'
import { LeaderboardPanel } from './components/LeaderboardPanel'
import { MatchResultsPanel } from './components/MatchResultsPanel'
import { MetricCard } from './components/MetricCard'
import { PlayerSetupPanel } from './components/PlayerSetupPanel'
import { adminSections, viewerSections } from './data/appSections'
import { mockMatches } from './data/mockMatches'
import { mockPlayers } from './data/mockPlayers'
import { mockScoringRules } from './data/mockScoringRules'
import { mockTeams } from './data/mockTeams'
import { mockTournaments } from './data/mockTournaments'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { getDrawReadiness, runFairDraw } from './lib/draw'
import { getEligibleTeams, getIneligibleTeams } from './lib/eligibility'
import { calculateStandings } from './lib/scoring'
import type { Player, TeamAssignment } from './types/domain'

const localStorageKeys = {
  lockedAssignments: 'gadx-worldcup-draw:locked-assignments',
  players: 'gadx-worldcup-draw:players',
}

function App() {
  const activeTournament = mockTournaments[0]
  const [players, setPlayers, resetPlayers] = useLocalStorageState<Player[]>(
    localStorageKeys.players,
    mockPlayers,
  )
  const tournamentPlayers = players.filter((player) => player.tournamentId === activeTournament.id)

  const eligibleTeams = getEligibleTeams(mockTeams, mockMatches, activeTournament)
  const ineligibleTeams = getIneligibleTeams(mockTeams, mockMatches, activeTournament)
  const drawReadiness = getDrawReadiness(tournamentPlayers, eligibleTeams)

  const [draftAssignments, setDraftAssignments] = useState<TeamAssignment[]>([])
  const [lockedAssignments, setLockedAssignments, resetLockedAssignments] = useLocalStorageState<
    TeamAssignment[]
  >(localStorageKeys.lockedAssignments, [])

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
    mockMatches,
    mockScoringRules,
    activeTournament.id,
  )

  const completedMatchCount = mockMatches.filter((match) => match.status === 'fulltime').length

  function handleRunDraw() {
    if (!drawReadiness.canRunDraw) {
      return
    }

    const assignments = runFairDraw(tournamentPlayers, eligibleTeams)
    setDraftAssignments(assignments)
  }

  function handleSaveAndLockDraw() {
    if (draftAssignments.length === 0 || lockedAssignments.length > 0) {
      return
    }

    setLockedAssignments(draftAssignments)
    setDraftAssignments([])
  }

  function handleResetLockedDraw() {
    resetLockedAssignments()
    setDraftAssignments([])
  }

  function handleUpdatePlayer(playerId: string, updates: Partial<Player>) {
    if (isDrawLocked) {
      return
    }

    setPlayers((currentPlayers) =>
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
    if (isDrawLocked) {
      return
    }

    resetPlayers()
    setDraftAssignments([])
  }

  return (
    <main className="min-h-screen px-6 py-6 text-slate-950 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <AppHeader milestone="Milestone 2.8" />
        <AppNavigation />

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Tournament" value={activeTournament.name} />
          <MetricCard label="Players" value={`${drawReadiness.playerCount} / 6`} />
          <MetricCard label="Eligible Teams" value={drawReadiness.eligibleTeamCount} />
          <MetricCard label="Completed Matches" value={completedMatchCount} />
        </section>

        <PlayerSetupPanel
          players={tournamentPlayers}
          isLocked={isDrawLocked}
          onUpdatePlayer={handleUpdatePlayer}
        />

        {!isDrawLocked && (
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
            teams={mockTeams}
            draftAssignments={draftAssignments}
            lockedAssignments={lockedAssignments}
            drawReadiness={drawReadiness}
            onRunDraw={handleRunDraw}
            onSaveAndLock={handleSaveAndLockDraw}
            onResetLockedDraw={handleResetLockedDraw}
          />
        </section>

        <LeaderboardPanel
          players={tournamentPlayers}
          teams={mockTeams}
          assignments={activeAssignments}
          standings={standings}
        />

        <MatchResultsPanel
          matches={mockMatches}
          teams={mockTeams}
          scoringRules={mockScoringRules}
        />

        <FeatureSections adminSections={adminSections} viewerSections={viewerSections} />

        <AppFooter />
      </section>
    </main>
  )
}

export default App