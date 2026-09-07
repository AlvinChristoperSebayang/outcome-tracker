import { useState } from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { AuthCard } from '#/components/auth/AuthCard'
import { FieldError } from '#/components/FieldError'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { getCurrentUser } from '#/lib/auth'
import { useSignIn } from '#/lib/mutations/auth'
import { loginSchema } from '#/lib/validations/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) throw redirect({ to: '/dashboard' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const signIn = useSignIn()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const result = await signIn.mutateAsync(value)
      if (result.success) {
        navigate({ to: '/dashboard' })
      } else {
        setFormError(result.message)
      }
    },
  })

  return (
    <AuthCard
      title="Masuk"
      footer={
        <>
          <Link to="/forgot-password" className="text-primary hover:underline">
            Lupa kata sandi?
          </Link>
          <div className="mt-2">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </div>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="email"
          validators={{ onSubmit: loginSchema.shape.email }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                type="email"
                autoComplete="email"
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
          name="password"
          validators={{ onSubmit: loginSchema.shape.password }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Kata Sandi</Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="current-password"
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

        <Button type="submit" className="w-full" disabled={signIn.isPending}>
          Masuk
        </Button>
      </form>
    </AuthCard>
  )
}
