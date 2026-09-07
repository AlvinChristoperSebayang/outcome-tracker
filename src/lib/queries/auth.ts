import { queryOptions } from '@tanstack/react-query'
import { getCurrentUser } from '#/lib/auth'

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: ['current-user'],
    queryFn: () => getCurrentUser(),
    staleTime: 60_000,
  })
}
