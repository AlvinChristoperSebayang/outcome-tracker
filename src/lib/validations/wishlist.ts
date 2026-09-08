import { z } from 'zod'

export const wishlistItemSchema = z.object({
  name: z.string().min(1, 'Nama barang wajib diisi.'),
  productUrl: z.union([z.url('Link tidak valid.'), z.literal('')]),
  targetAmount: z.number().gt(0, 'Harga harus lebih besar dari 0.').optional(),
})

export type WishlistItemInput = z.infer<typeof wishlistItemSchema>
