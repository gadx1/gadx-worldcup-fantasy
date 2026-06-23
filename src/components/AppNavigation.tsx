const navigationItems = ['Tournaments', 'Players', 'Teams', 'Draw', 'Leaderboard', 'Results', 'Rules']

export function AppNavigation() {
  return (
    <nav className="flex flex-wrap gap-3 rounded-2xl border border-slate-900/10 bg-white/60 p-3 shadow-sm">
      {navigationItems.map((item) => (
        <button
          key={item}
          className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800"
          type="button"
        >
          {item}
        </button>
      ))}
    </nav>
  )
}