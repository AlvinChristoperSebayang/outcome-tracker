import { AlertCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'

export function ErrorState({
  message = 'Terjadi kesalahan saat mengambil data.',
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <p className="max-w-sm text-sm text-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Coba Lagi
      </Button>
    </div>
  )
}
