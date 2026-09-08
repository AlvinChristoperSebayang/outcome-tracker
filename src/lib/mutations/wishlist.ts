import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import type { WishlistItemInput } from '#/lib/validations/wishlist'
import type { WishlistItemRow } from '#/types/savings'

async function createWishlistItem(input: WishlistItemInput): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Wishlist gagal disimpan. Silakan coba lagi.')

  const { error } = await supabase.from('wishlist_items').insert({
    user_id: user.id,
    name: input.name,
    product_url: input.productUrl || null,
    target_amount: input.targetAmount ?? null,
  })

  if (error) throw new Error('Wishlist gagal disimpan. Silakan coba lagi.')
}

async function updateWishlistItem(
  id: string,
  input: WishlistItemInput,
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('wishlist_items')
    .update({
      name: input.name,
      product_url: input.productUrl || null,
      target_amount: input.targetAmount ?? null,
    })
    .eq('id', id)

  if (error) throw new Error('Wishlist gagal disimpan. Silakan coba lagi.')
}

async function toggleAchieved(id: string, isAchieved: boolean): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('wishlist_items')
    .update({ is_achieved: isAchieved })
    .eq('id', id)

  if (error) throw new Error('Wishlist gagal diperbarui. Silakan coba lagi.')
}

async function deleteWishlistItem(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
  if (error) throw new Error('Wishlist gagal dihapus. Silakan coba lagi.')
}

function useInvalidateWishlistQueries() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['wishlist'] })
}

export function useCreateWishlistItem() {
  const invalidate = useInvalidateWishlistQueries()
  return useMutation({ mutationFn: createWishlistItem, onSuccess: invalidate })
}

export function useUpdateWishlistItem() {
  const invalidate = useInvalidateWishlistQueries()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WishlistItemInput }) =>
      updateWishlistItem(id, input),
    onSuccess: invalidate,
  })
}

export function useToggleWishlistAchieved() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateWishlistQueries()
  return useMutation({
    mutationFn: ({ id, isAchieved }: { id: string; isAchieved: boolean }) =>
      toggleAchieved(id, isAchieved),
    onMutate: async ({ id, isAchieved }) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] })
      const previous = queryClient.getQueryData<Array<WishlistItemRow>>([
        'wishlist',
      ])
      queryClient.setQueryData<Array<WishlistItemRow>>(['wishlist'], (old) =>
        old?.map((item) =>
          item.id === id ? { ...item, is_achieved: isAchieved } : item,
        ),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(['wishlist'], context.previous)
    },
    onSettled: invalidate,
  })
}

export function useDeleteWishlistItem() {
  const invalidate = useInvalidateWishlistQueries()
  return useMutation({ mutationFn: deleteWishlistItem, onSuccess: invalidate })
}
