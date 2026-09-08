import { queryOptions } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import type { WishlistItemRow } from '#/types/savings'

export async function fetchWishlistItems(): Promise<Array<WishlistItemRow>> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('is_achieved', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error('Terjadi kesalahan saat mengambil data.')
  return data
}

export function wishlistQueryOptions() {
  return queryOptions({
    queryKey: ['wishlist'],
    queryFn: fetchWishlistItems,
    staleTime: 30_000,
  })
}
