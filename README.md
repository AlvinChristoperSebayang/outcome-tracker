# Pencatatan Pengeluaran

Aplikasi personal expense tracker — catat pengeluaran, kategorikan, lihat ringkasan, filter, dan buat laporan. Lihat [docs/PRD.md](docs/PRD.md) untuk spesifikasi produk lengkap.

**Stack:** TanStack Start, TanStack Router, TanStack Query, TanStack Form, TanStack Table, Supabase (Auth + Postgres + RLS), Tailwind CSS, shadcn/ui, Recharts, React PDF.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Buat project Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan isi file [db/migrations/0001_init.sql](db/migrations/0001_init.sql). Ini akan membuat tabel `profiles` dan `expenses`, mengaktifkan Row Level Security, index, dan trigger auto-create profile.
3. Di **Project Settings → API**, salin **Project URL** dan **anon/public key**.

### 3. Konfigurasi environment variables

Salin `.env.example` menjadi `.env` lalu isi dengan kredensial dari langkah sebelumnya:

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJxxxxxxxxxxxx
```

Variabel ini tidak memakai prefix `VITE_` — sengaja dipetakan lewat `envPrefix` di [vite.config.ts](vite.config.ts) supaya tetap ter-bundle ke client, tanpa memicu peringatan "public framework prefix" di dashboard Vercel (nilainya memang aman untuk publik — keamanan sebenarnya berasal dari Row Level Security).

### 4. (Opsional) Generate typed database types

Setelah project Supabase aktif, regenerate `src/types/database.types.ts` dari schema asli:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
npm run format   # prettier + eslint --fix
npm run check    # prettier --check
```

## Struktur Project

```
src/
├── routes/                  # file-based routes (TanStack Router)
│   ├── login.tsx, register.tsx, forgot-password.tsx, reset-password.tsx
│   └── _authenticated/      # protected routes: dashboard, pengeluaran, laporan, pengaturan
├── components/
│   ├── layout/               # Sidebar, MobileNav, AppShell
│   ├── dashboard/ expenses/ reports/ settings/ auth/ filters/
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── supabase/              # browser & server Supabase clients
│   ├── queries/ mutations/    # TanStack Query layer (single source of truth for data access)
│   ├── validations/           # zod schemas
│   └── utils/                 # currency, date, category, chart helpers
├── types/                    # Database types + domain types
└── db/migrations/             # SQL schema, RLS policies, indexes, triggers
```

## Keamanan

- Autentikasi via Supabase Auth, session cookie-based melalui `@supabase/ssr` (bukan implementasi custom).
- Row Level Security aktif di semua tabel — setiap user hanya bisa mengakses baris miliknya sendiri (`auth.uid() = user_id`).
- Tidak ada service role key di client; semua akses dari browser memakai anon key yang dibatasi RLS.
