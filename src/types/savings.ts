import type { Database } from './database.types'

export type WishlistItemRow =
  Database['public']['Tables']['wishlist_items']['Row']

export interface SavingsContribution {
  month: string
  amount: number
}

export interface SavingsSummary {
  total: number
  contributions: Array<SavingsContribution>
}
