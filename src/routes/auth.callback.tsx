import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { exchangeAuthCode } from '#/lib/auth'

export const Route = createFileRoute('/auth/callback')({
  validateSearch: z.object({ code: z.string().optional() }),
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: async ({ deps }) => {
    if (!deps.code) throw redirect({ to: '/login' })

    const result = await exchangeAuthCode({ data: { code: deps.code } })
    throw redirect({ to: result.success ? '/dashboard' : '/login' })
  },
})
