import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr'
import { createServerOnlyFn } from '@tanstack/react-start'
import {
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'
import type { Database } from '#/types/database.types'

/**
 * Server-only Supabase client, cookie-backed via TanStack Start's request/response
 * helpers. Never import this from client code — `createServerOnlyFn` strips it
 * from the client bundle so a stray import fails fast instead of leaking secrets.
 */
export const getSupabaseServerClient = createServerOnlyFn(() => {
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(getRequestHeader('Cookie') ?? '')
        },
        setAll(cookiesToSet) {
          const serialized = cookiesToSet.map(({ name, value, options }) =>
            serializeCookieHeader(name, value, options),
          )
          setResponseHeader('Set-Cookie', serialized)
        },
      },
    },
  )
})
