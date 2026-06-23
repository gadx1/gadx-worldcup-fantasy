import type { Match, Team, Tournament } from '../types/domain'

const drawPoolMatchStatuses: Match['status'][] = ['scheduled', 'live', 'halftime', 'fulltime']

function isDateWithinTournamentWindow(dateIso: string, tournament: Tournament) {
  const date = new Date(dateIso).getTime()
  const startDate = new Date(tournament.roundStartDate).getTime()
  const endDate = new Date(tournament.roundEndDate).getTime()

  return date >= startDate && date <= endDate
}

function teamHasMatchInsideWindow(teamId: string, matches: Match[], tournament: Tournament) {
  return matches.some((match) => {
    const teamIsInMatch = match.homeTeamId === teamId || match.awayTeamId === teamId
    const matchStatusBelongsToDrawPool = drawPoolMatchStatuses.includes(match.status)
    const matchIsInsideWindow = isDateWithinTournamentWindow(match.kickoffUtc, tournament)

    return teamIsInMatch && matchStatusBelongsToDrawPool && matchIsInsideWindow
  })
}

export function getEligibleTeams(teams: Team[], matches: Match[], tournament: Tournament) {
  return teams.filter((team) => {
    const teamIsActive = team.tournamentStatus === 'active'
    const teamHasEligibleMatch = teamHasMatchInsideWindow(team.id, matches, tournament)

    return teamIsActive && teamHasEligibleMatch
  })
}

export function getIneligibleTeams(teams: Team[], matches: Match[], tournament: Tournament) {
  const eligibleTeamIds = new Set(getEligibleTeams(teams, matches, tournament).map((team) => team.id))

  return teams.filter((team) => !eligibleTeamIds.has(team.id))
}