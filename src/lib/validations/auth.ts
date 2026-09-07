import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Email tidak valid.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerBaseSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi.'),
  email: z.email('Email tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
})

export const registerSchema = registerBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Konfirmasi kata sandi tidak cocok.', path: ['confirmPassword'] },
)

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.email('Email tidak valid.'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordBaseSchema = z.object({
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
})

export const resetPasswordSchema = resetPasswordBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Konfirmasi kata sandi tidak cocok.', path: ['confirmPassword'] },
)

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Nama wajib diisi.'),
})

export type ProfileInput = z.infer<typeof profileSchema>
