import vinanceLogo from '#/assets/vinance-logo.png'

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center">
          <img src={vinanceLogo} alt="Vinance" className="h-9 w-auto" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>

        {footer ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
