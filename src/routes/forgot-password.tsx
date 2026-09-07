import { useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { CheckCircle2 } from 'lucide-react'
import { AuthCard } from '#/components/auth/AuthCard'
import { FieldError } from '#/components/FieldError'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { getCurrentUser } from '#/lib/auth'
import { useSendPasswordResetEmail } from '#/lib/mutations/auth'
import { forgotPasswordSchema } from '#/lib/validations/auth'

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) throw redirect({ to: '/dashboard' })
  },
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const sendResetEmail = useSendPasswordResetEmail()
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const result = await sendResetEmail.mutateAsync(value)
      if (result.success) {
        setSent(true)
      } else {
        setFormError(result.message)
      }
    },
  })

  return (
    <AuthCard
      title="Lupa Kata Sandi"
      description="Masukkan email yang terhubung dengan akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi."
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Kembali ke halaman masuk
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Tautan reset kata sandi telah dikirim. Silakan periksa kotak masuk
            email Anda.
          </p>
        </div>
      ) : (
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
            validators={{ onSubmit: forgotPasswordSchema.shape.email }}
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

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={sendResetEmail.isPending}
          >
            Kirim Tautan Reset
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
