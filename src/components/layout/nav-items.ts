import { FileBarChart, LayoutDashboard, Receipt, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/pengeluaran', label: 'Pengeluaran', icon: Receipt },
  { to: '/laporan', label: 'Laporan', icon: FileBarChart },
] as const

export const SETTINGS_ITEM = {
  to: '/pengaturan',
  label: 'Pengaturan',
  icon: Settings,
} as const
