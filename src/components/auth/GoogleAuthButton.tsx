import { useState } from 'react'
import { toast } from 'sonner'
import { GoogleIcon } from '#/components/auth/GoogleIcon'
import { Button } from '#/components/ui/button'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'

export function GoogleAuthButton({ label }: { label: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleClick() {
    setIsPending(true)
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      toast.error('Gagal masuk dengan Google. Silakan coba lagi.')
      setIsPending(false)
    }
    // On success the browser is redirected to Google, so no further state update here.
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={isPending}
    >
      <GoogleIcon className="h-4 w-4" />
      {label}
    </Button>
  )
}
