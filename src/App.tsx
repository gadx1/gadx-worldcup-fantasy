import { AppFooter } from './components/AppFooter'
import { AppHeader } from './components/AppHeader'
import { AppNavigation } from './components/AppNavigation'
import { EligibleTeamsPanel } from './components/EligibleTeamsPanel'
import { FairDrawPreview } from './components/FairDrawPreview'
import { FeatureSections } from './components/FeatureSections'
import { MetricCard } from './components/MetricCard'
import { adminSections, viewerSections } from './data/appSections'
import { mockMatches } from './data/mockMatches'
import { mockPlayers } from './data/mockPlayers'
import { mockTeams } from './data/mockTeams'
import { mockTournaments } from './data/mockTournaments'
import { getDrawReadiness, runFairDraw } from './lib/draw'
import { getEligibleTeams, getIneligibleTeams } from './lib/eligibility'

function App() {
  const activeTournament = mockTournaments[0]
  const tournamentPlayers = mockPlayers.filter(
    (player) => player.tournamentId === activeTournament.id,
  )
  const eligibleTeams = getEligibleTeams(mockTeams, mockMatches, activeTournament)
  const ineligibleTeams = getIneligibleTeams(mockTeams, mockMatches, activeTournament)
  const drawReadiness = getDrawReadiness(tournamentPlayers, eligibleTeams)
  const demoAssignments = drawReadiness.canRunDraw
    ? runFairDraw(tournamentPlayers, eligibleTeams)
    : []
  const scheduledMatchCount = mockMatches.filter((match) => match.status === 'scheduled').length

  return (
    <main className="min-h-screen px-6 py-6 text-slate-950 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <AppHeader />
        <AppNavigation />

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Tournament" value={activeTournament.name} />
          <MetricCard label="Players" value={`${drawReadiness.playerCount} / 6`} />
          <MetricCard label="Eligible Teams" value={drawReadiness.eligibleTeamCount} />
          <MetricCard label="Scheduled Matches" value={scheduledMatchCount} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <EligibleTeamsPanel
            eligibleTeams={eligibleTeams}
            ineligibleTeams={ineligibleTeams}
            drawReadiness={drawReadiness}
          />

          <FairDrawPreview
            players={tournamentPlayers}
            teams={mockTeams}
            assignments={demoAssignments}
            drawReadiness={drawReadiness}
          />
        </section>

        <FeatureSections adminSections={adminSections} viewerSections={viewerSections} />

        <AppFooter />
      </section>
    </main>
  )
}

export default App