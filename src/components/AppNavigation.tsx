interface NavItem {
  label: string
  href: string
}

interface AppNavigationProps {
  isAdminMode: boolean
}

const alwaysVisible: NavItem[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Standings', href: '#standings' },
  { label: 'Bracket', href: '#bracket' },
  { label: 'Rules', href: '#rules' },
]

const adminOnly: NavItem[] = [
  { label: 'Draw', href: '#draw-control' },
  { label: 'Results', href: '#match-admin' },
]

/**
 * Anchor navigation to the sections that actually exist on this single-page
 * survivor app. Admin-only sections (Draw, Results) only appear in the menu
 * when the visitor is in admin mode, since they aren't rendered otherwise.
 */
export function AppNavigation({ isAdminMode }: AppNavigationProps) {
  const items = isAdminMode
    ? [alwaysVisible[0], adminOnly[0], alwaysVisible[1], alwaysVisible[2], adminOnly[1], alwaysVisible[3]]
    : alwaysVisible

  return (
    <nav className="flex flex-wrap gap-3 rounded-2xl border border-slate-900/10 bg-white/60 p-3 shadow-sm">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
