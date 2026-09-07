import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useSignOut } from '#/lib/mutations/auth'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import type { SessionUser } from '#/lib/auth'

export function AppShell({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const signOutMutation = useSignOut()

  function handleLogout() {
    signOutMutation.mutate(undefined, {
      onSuccess: () => navigate({ to: '/login' }),
      onError: () => toast.error('Gagal keluar. Silakan coba lagi.'),
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        loggingOut={signOutMutation.isPending}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
