import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '#/types/database.types'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

/** Singleton Supabase client for the browser. Session is cookie-backed so it stays in sync with SSR. */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_PUBLISHABLE_KEY,
    )
  }
  return browserClient
}
