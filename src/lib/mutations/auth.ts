import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  sendPasswordResetEmail,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '#/lib/auth'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  ProfileInput,
} from '#/lib/validations/auth'

export function useSignIn() {
  return useMutation({ mutationFn: (data: LoginInput) => signIn({ data }) })
}

export function useSignUp() {
  return useMutation({ mutationFn: (data: RegisterInput) => signUp({ data }) })
}

export function useSendPasswordResetEmail() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => sendPasswordResetEmail({ data }),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => updatePassword({ data }),
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

async function updateProfile(input: ProfileInput) {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Profil gagal disimpan. Silakan coba lagi.')

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: input.fullName })
    .eq('id', user.id)

  if (error) throw new Error('Profil gagal disimpan. Silakan coba lagi.')
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
    },
  })
}
