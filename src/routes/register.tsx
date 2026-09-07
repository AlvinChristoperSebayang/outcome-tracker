import { useState } from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { AuthCard } from '#/components/auth/AuthCard'
import { FieldError } from '#/components/FieldError'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { getCurrentUser } from '#/lib/auth'
import { useSignUp } from '#/lib/mutations/auth'
import { registerBaseSchema } from '#/lib/validations/auth'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) throw redirect({ to: '/dashboard' })
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const signUp = useSignUp()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      if (value.password !== value.confirmPassword) {
        setFormError('Konfirmasi kata sandi tidak cocok.')
        return
      }
      try {
        const result = await signUp.mutateAsync(value)
        if (result.success) {
          toast.success('Pendaftaran berhasil. Silakan masuk.')
          navigate({ to: '/dashboard' })
        } else {
          setFormError(result.message)
        }
      } catch {
        setFormError('Pendaftaran gagal. Silakan coba lagi.')
      }
    },
  })

  return (
    <AuthCard
      title="Buat Akun"
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Masuk
          </Link>
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
          name="fullName"
          validators={{ onSubmit: registerBaseSchema.shape.fullName }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Nama Lengkap</Label>
              <Input
                id={field.name}
                autoComplete="name"
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
          name="email"
          validators={{ onSubmit: registerBaseSchema.shape.email }}
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
          validators={{ onSubmit: registerBaseSchema.shape.password }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Kata Sandi</Label>
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
          validators={{ onSubmit: registerBaseSchema.shape.confirmPassword }}
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

        <Button type="submit" className="w-full" disabled={signUp.isPending}>
          Daftar
        </Button>
      </form>
    </AuthCard>
  )
}
