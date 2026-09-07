import {
  FileBarChart,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/pengeluaran', label: 'Pengeluaran', icon: Receipt },
  { to: '/anggaran', label: 'Anggaran', icon: PiggyBank },
  { to: '/laporan', label: 'Laporan', icon: FileBarChart },
] as const

export const SETTINGS_ITEM = {
  to: '/pengaturan',
  label: 'Pengaturan',
  icon: Settings,
} as const
