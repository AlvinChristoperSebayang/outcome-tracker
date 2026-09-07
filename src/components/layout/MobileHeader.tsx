import { LogOut } from 'lucide-react'
import vinanceLogo from '#/assets/vinance-logo.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import type { SessionUser } from '#/lib/auth'

export function MobileHeader({
  user,
  onLogout,
}: {
  user: SessionUser
  onLogout: () => void
}) {
  const initial = (user.fullName || user.email || '?').charAt(0).toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <img src={vinanceLogo} alt="Vinance" className="h-6 w-auto" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Menu akun"
            className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="truncate">
            {user.fullName || user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onLogout} className="text-destructive">
            <LogOut className="h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
