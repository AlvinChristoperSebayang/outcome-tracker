import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { FieldError } from '#/components/FieldError'
import { ChangePasswordDialog } from '#/components/settings/ChangePasswordDialog'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useSignOut, useUpdateProfile } from '#/lib/mutations/auth'
import { currentUserQueryOptions } from '#/lib/queries/auth'
import { profileSchema } from '#/lib/validations/auth'

export const Route = createFileRoute('/_authenticated/pengaturan')({
  component: PengaturanPage,
})

function PengaturanPage() {
  const { user: initialUser } = Route.useRouteContext()
  const navigate = useNavigate()
  const userQuery = useQuery({
    ...currentUserQueryOptions(),
    initialData: initialUser,
  })
  const user = userQuery.data ?? initialUser

  const updateProfile = useUpdateProfile()
  const signOutMutation = useSignOut()
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  const form = useForm({
    defaultValues: { fullName: user.fullName ?? '' },
    onSubmit: async ({ value }) => {
      try {
        await updateProfile.mutateAsync(value)
        toast.success('Perubahan berhasil disimpan.')
      } catch {
        toast.error('Profil gagal disimpan. Silakan coba lagi.')
      }
    },
  })

  function handleLogout() {
    signOutMutation.mutate(undefined, {
      onSuccess: () => navigate({ to: '/login' }),
      onError: () => toast.error('Gagal keluar. Silakan coba lagi.'),
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent>
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
              validators={{
                onChange: profileSchema.shape.fullName,
                onSubmit: profileSchema.shape.fullName,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Nama</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled readOnly />
            </div>

            <Button type="submit" disabled={updateProfile.isPending}>
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keamanan</CardTitle>
          <CardDescription>Kelola kata sandi akun Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
            Ubah Kata Sandi
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={signOutMutation.isPending}
          >
            Keluar
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  )
}
