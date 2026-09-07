import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { AuthCard } from '#/components/auth/AuthCard'
import { FieldError } from '#/components/FieldError'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { exchangeAuthCode } from '#/lib/auth'
import { useUpdatePassword } from '#/lib/mutations/auth'
import { resetPasswordBaseSchema } from '#/lib/validations/auth'

export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({ code: z.string().optional() }),
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: async ({ deps }) => {
    if (!deps.code) return { valid: false }
    const result = await exchangeAuthCode({ data: { code: deps.code } })
    return { valid: result.success }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { valid } = Route.useLoaderData()
  const navigate = useNavigate()
  const updatePassword = useUpdatePassword()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      setFormError(null)
      if (value.password !== value.confirmPassword) {
        setFormError('Konfirmasi kata sandi tidak cocok.')
        return
      }
      const result = await updatePassword.mutateAsync(value)
      if (result.success) {
        navigate({ to: '/login' })
      } else {
        setFormError(result.message)
      }
    },
  })

  if (!valid) {
    return (
      <AuthCard title="Tautan Tidak Valid">
        <p className="text-sm text-muted-foreground">
          Tautan reset kata sandi tidak valid atau sudah kedaluwarsa. Silakan
          minta tautan baru.
        </p>
        <Link
          to="/forgot-password"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Minta tautan reset baru
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Ubah Kata Sandi">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="password"
          validators={{ onSubmit: resetPasswordBaseSchema.shape.password }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Kata Sandi Baru</Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onSubmit: resetPasswordBaseSchema.shape.confirmPassword,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Konfirmasi Kata Sandi</Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={updatePassword.isPending}
        >
          Ubah Kata Sandi
        </Button>
      </form>
    </AuthCard>
  )
}
