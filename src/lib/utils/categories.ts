import {
  Bus,
  Car,
  GraduationCap,
  HeartPulse,
  MoreHorizontal,
  Popcorn,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ExpenseCategory } from '#/types/expense'

interface CategoryMeta {
  icon: LucideIcon
  /** CSS var-backed chart color token, shared with dashboard + reports for a consistent legend. */
  chartVar: string
}

export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  Makanan: { icon: UtensilsCrossed, chartVar: 'var(--chart-1)' },
  Belanja: { icon: ShoppingBag, chartVar: 'var(--chart-2)' },
  Transportasi: { icon: Car, chartVar: 'var(--chart-3)' },
  Tagihan: { icon: Receipt, chartVar: 'var(--chart-4)' },
  Hiburan: { icon: Popcorn, chartVar: 'var(--chart-5)' },
  Kesehatan: { icon: HeartPulse, chartVar: 'var(--chart-6)' },
  Perjalanan: { icon: Bus, chartVar: 'var(--chart-7)' },
  Pendidikan: { icon: GraduationCap, chartVar: 'var(--chart-9)' },
  Lainnya: { icon: MoreHorizontal, chartVar: 'var(--chart-8)' },
}

const FALLBACK_META: CategoryMeta = {
  icon: MoreHorizontal,
  chartVar: 'var(--chart-8)',
}

/** Categories come from free-form DB text, so an unrecognized value falls back gracefully. */
function getMeta(category: string): CategoryMeta {
  return Object.hasOwn(CATEGORY_META, category)
    ? CATEGORY_META[category as ExpenseCategory]
    : FALLBACK_META
}

export function getCategoryIcon(category: string): LucideIcon {
  return getMeta(category).icon
}

export function getCategoryColor(category: string): string {
  return getMeta(category).chartVar
}
