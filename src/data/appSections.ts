import type { AppSection } from '../types/domain'

export const adminSections: AppSection[] = [
  {
    title: 'Create New Tournament',
    description:
      'Set up a private fantasy tournament, define the active round window, and prepare the player list.',
    access: 'admin',
  },
  {
    title: 'Manage Players',
    description:
      'Create up to six players, assign avatars, and link viewer emails when invitations are enabled.',
    access: 'admin',
  },
  {
    title: 'Eligible Teams',
    description:
      'Review active national teams, validate the round window, and confirm the pool before the draw.',
    access: 'admin',
  },
  {
    title: 'Run Draw',
    description:
      'Randomly assign teams equally across all players, lock the draw, and keep an audit trail.',
    access: 'admin',
  },
]

export const viewerSections: AppSection[] = [
  {
    title: 'My Teams',
    description: 'View the national teams assigned to your player profile in each tournament.',
    access: 'viewer',
  },
  {
    title: 'Leaderboard',
    description: 'Track player rankings, match points, bonus points, and total tournament score.',
    access: 'viewer',
  },
  {
    title: 'Match Results',
    description: 'Follow real match outcomes, goals, halftime updates, and full-time results.',
    access: 'viewer',
  },
  {
    title: 'Tournament Progress',
    description: 'See how the tournament advances from group stage to knockout rounds.',
    access: 'viewer',
  },
]