import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Expose SUPABASE_* vars to the browser bundle without the "VITE_" prefix
  // (Supabase's URL + publishable key are safe to expose — RLS is the real boundary).
  envPrefix: ['VITE_', 'SUPABASE_'],
  plugins: [devtools(), nitro(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
