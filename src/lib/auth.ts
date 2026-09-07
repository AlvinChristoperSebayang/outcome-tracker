import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import {
  getRequestHost,
  getRequestProtocol,
} from '@tanstack/react-start/server'
import { getSupabaseServerClient } from '#/lib/supabase/server'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '#/lib/validations/auth'
import type { AuthError } from '@supabase/supabase-js'

export interface SessionUser {
  id: string
  email: string
  fullName: string | null
}

function getOrigin(): string {
  return `${getRequestProtocol()}://${getRequestHost()}`
}

/** Maps known Supabase Auth error codes to an honest, user-facing message. */
function getEmailErrorMessage(error: AuthError, fallback: string): string {
  if (error.code === 'over_email_send_rate_limit') {
    return 'Terlalu banyak percobaan dalam waktu singkat. Silakan coba lagi dalam beberapa menit.'
  }
  return fallback
}

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    const supabase = getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()

    return {
      id: user.id,
      email: user.email ?? '',
      fullName: profile?.full_name ?? null,
    }
  },
)

export const signIn = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return {
        success: false as const,
        message: 'Email atau kata sandi salah.',
      }
    }
    return { success: true as const }
  })

export const signUp = createServerFn({ method: 'POST' })
  .validator(registerSchema)
  .handler(async ({ data: input }) => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName },
        emailRedirectTo: `${getOrigin()}/login`,
      },
    })

    if (error) {
      const message =
        error.code === 'user_already_exists'
          ? 'Email ini sudah terdaftar.'
          : getEmailErrorMessage(error, 'Pendaftaran gagal. Silakan coba lagi.')
      return { success: false as const, message }
    }

    // When email confirmation is required, Supabase silently "succeeds" a signUp
    // for an email that already belongs to an existing, unconfirmed account —
    // returning a user with an empty identities array instead of an error (this
    // avoids leaking which emails are registered).
    if (data.user?.identities?.length === 0) {
      return { success: false as const, message: 'Email ini sudah terdaftar.' }
    }

    // No session means the account needs email confirmation before it can log in.
    return { success: true as const, needsConfirmation: !data.session }
  })

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  await supabase.auth.signOut()
})

export const sendPasswordResetEmail = createServerFn({ method: 'POST' })
  .validator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${getOrigin()}/reset-password`,
    })

    if (error) {
      return {
        success: false as const,
        message: getEmailErrorMessage(
          error,
          'Gagal mengirim tautan reset. Silakan coba lagi.',
        ),
      }
    }
    return { success: true as const }
  })

export const exchangeAuthCode = createServerFn({ method: 'POST' })
  .validator(z.object({ code: z.string().min(1) }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(data.code)
    return { success: !error }
  })

export const updatePassword = createServerFn({ method: 'POST' })
  .validator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      return {
        success: false as const,
        message: 'Gagal mengubah kata sandi. Silakan minta tautan reset baru.',
      }
    }
    return { success: true as const }
  })
