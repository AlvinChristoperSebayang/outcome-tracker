/** Extracts the first human-readable message from a TanStack Form field's error list. */
export function getFieldErrorMessage(
  errors: Array<unknown>,
): string | undefined {
  for (const error of errors) {
    if (typeof error === 'string' && error) return error
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message
      if (typeof message === 'string' && message) return message
    }
  }
  return undefined
}
