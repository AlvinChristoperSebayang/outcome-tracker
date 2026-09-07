import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import vinanceLogo from '#/assets/vinance-logo.png'
import { cn } from '#/lib/utils'
import { NAV_ITEMS, SETTINGS_ITEM } from './nav-items'
import type { SessionUser } from '#/lib/auth'

const linkBaseClass =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
const linkActiveClass = 'bg-accent text-accent-foreground'

export function Sidebar({
  user,
  onLogout,
  loggingOut,
}: {
  user: SessionUser
  onLogout: () => void
  loggingOut: boolean
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <img src={vinanceLogo} alt="Vinance" className="h-7 w-auto" />
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-3 py-4"
        aria-label="Navigasi utama"
      >
        <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground">
          PENGELUARAN
        </p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={linkBaseClass}
            activeProps={{ className: cn(linkBaseClass, linkActiveClass) }}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}

        <div className="my-3 border-t border-border" />

        <Link
          to={SETTINGS_ITEM.to}
          className={linkBaseClass}
          activeProps={{ className: cn(linkBaseClass, linkActiveClass) }}
        >
          <SETTINGS_ITEM.icon className="h-4 w-4" aria-hidden="true" />
          {SETTINGS_ITEM.label}
        </Link>
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 truncate px-3 text-sm font-medium text-sidebar-foreground">
          {user.fullName || user.email}
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
