import { getFieldErrorMessage } from '#/lib/utils/form'

export function FieldError({ errors }: { errors: Array<unknown> }) {
  const message = getFieldErrorMessage(errors)
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}
