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

export interface SessionUser {
  id: string
  email: string
  fullName: string | null
}

function getOrigin(): string {
  return `${getRequestProtocol()}://${getRequestHost()}`
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
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    })

    if (error) {
      const message =
        error.code === 'user_already_exists'
          ? 'Email ini sudah terdaftar.'
          : 'Pendaftaran gagal. Silakan coba lagi.'
      return { success: false as const, message }
    }
    return { success: true as const }
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
        message: 'Gagal mengirim tautan reset. Silakan coba lagi.',
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
