import type { ScoringRules } from '../types/domain'

export const mockScoringRules: ScoringRules = {
  tournamentId: 'tournament-dublin-friends',
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  goalPoints: 1,
  cleanSheetPoints: 1,
  qualificationBonus: 5,
  groupWinnerBonus: 3,
}