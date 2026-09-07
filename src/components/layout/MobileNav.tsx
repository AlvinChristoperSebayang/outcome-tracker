import { Link } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import { NAV_ITEMS, SETTINGS_ITEM } from './nav-items'

const items = [...NAV_ITEMS, SETTINGS_ITEM]

export function MobileNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground"
          activeProps={{
            className:
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-primary',
          }}
        >
          <item.icon className={cn('h-5 w-5')} aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
