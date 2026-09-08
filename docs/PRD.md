# PRD — Aplikasi Pencatatan Pengeluaran

**Status:** Draft v1.0
**Tanggal:** 7 September 2026
**Tipe Produk:** Personal Expense Tracker (Web App)

---

## 1. Ringkasan Produk

Aplikasi web untuk mencatat, mengelola, memfilter, dan menganalisis pengeluaran pribadi. Alur inti produk:

```
Catat pengeluaran → kategorikan → lihat ringkasan → filter → analisis → buat laporan
```

Produk ini **bukan** software akuntansi. UX harus terasa ringan, cepat, dan personal — seperti aplikasi produktivitas modern, bukan dashboard finance kompleks. Seluruh teks yang terlihat oleh pengguna menggunakan **Bahasa Indonesia**; kode, nama variabel, komponen, dan kolom database tetap Bahasa Inggris.

### Masalah yang Diselesaikan

Pengguna sering tidak tahu:

- Berapa total uang yang sudah dikeluarkan dalam periode tertentu
- Pengeluaran itu untuk apa saja
- Kategori mana yang paling banyak menghabiskan uang
- Bagaimana pola pengeluaran mereka dari waktu ke waktu

### Value Proposition

Mencatat pengeluaran harus memakan waktu **kurang dari 15 detik** dari klik "Tambah Pengeluaran" sampai tersimpan, dan pengguna langsung mendapat gambaran ringkasan yang akurat tanpa effort tambahan.

---

## 2. Target Pengguna

Individu yang ingin melacak pengeluaran pribadi harian/bulanan tanpa kerumitan software akuntansi — mahasiswa, pekerja, freelancer. Single-user per akun (tidak ada shared wallet / multi-user finance di MVP).

---

## 3. Tujuan & Success Metrics

| Tujuan              | Metrik                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Pencatatan cepat    | Tambah pengeluaran selesai dalam ≤ 4 langkah / ≤ 15 detik                                               |
| Insight instan      | Ringkasan (total, rata-rata, kategori terbesar) selalu akurat & real-time setelah setiap perubahan data |
| Filtering fleksibel | Filter periode, bulan, kategori dapat dikombinasikan dan tersimpan di URL                               |
| Kepercayaan data    | RLS aktif — user tidak pernah bisa melihat/mengubah data user lain                                      |
| Pelaporan           | User dapat generate laporan periode tertentu dan export ke PDF                                          |

---

## 4. Lingkup (Scope)

### 4.1 Termasuk di MVP

- Authentication (daftar, masuk, keluar, lupa/reset kata sandi)
- CRUD pengeluaran (tambah, ubah, hapus, lihat)
- Kategorisasi pengeluaran (9 kategori default)
- Pencarian pengeluaran berdasarkan deskripsi
- Filter: periode (preset + custom range), bulan/tahun, kategori — dapat dikombinasikan, berbasis URL search params
- Dashboard ringkasan (total, jumlah transaksi, rata-rata, kategori terbesar) mengikuti filter aktif
- Laporan dengan breakdown kategori, grafik (pie/donut + bar/line), dan export PDF
- Pengaturan profil dasar (nama, email) & ubah kata sandi
- Responsive (desktop sidebar, mobile bottom nav/drawer, tabel → card di mobile)
- Loading / empty / error state di semua halaman data

### 4.2 Eksplisit Di Luar Scope (Jangan Dibangun)

Budgeting, investasi, koneksi rekening bank, financial planning, recurring/subscription expenses, multi-user/shared wallet, AI financial advisor, cryptocurrency, accounting kompleks, income/pemasukan management, multi-currency (arsitektur harus tetap memungkinkan penambahan di masa depan, tapi tidak diimplementasikan sekarang).

---

## 5. Tech Stack

| Layer                 | Pilihan                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Bahasa                | TypeScript (strict, hindari `any`)                                                                               |
| Framework             | React + TanStack Start                                                                                           |
| Routing               | TanStack Router (file-based, search-params untuk filter, protected routes via loader)                            |
| Data fetching / cache | TanStack Query (query + mutation + invalidation)                                                                 |
| Form                  | TanStack Form + schema validation                                                                                |
| Tabel                 | TanStack Table (sorting, filtering, pagination)                                                                  |
| Backend / DB          | Supabase (PostgreSQL, Auth, RLS) — `@supabase/supabase-js`, `@supabase/ssr`                                      |
| Styling               | Tailwind CSS + shadcn/ui + Lucide Icons                                                                          |
| Chart                 | Recharts                                                                                                         |
| PDF Export            | Library PDF generation sisi client (mis. `@react-pdf/renderer` atau `jspdf` — dipilih saat implementasi Phase 5) |

Session authentication **wajib** cookie-based via `@supabase/ssr` — tidak ada implementasi auth custom, tidak ada service role key di client.

---

## 6. Arsitektur Informasi & Navigasi

**Desktop:** Sidebar tetap di kiri.

```
PENGELUARAN
Ringkasan
Pengeluaran
Laporan
────────────
Pengaturan
────────────
Nama Pengguna
Keluar
```

**Mobile:** Header atas + bottom navigation / drawer. Tabel pengeluaran berubah menjadi card list.

**Rute:**

```
/login
/register
/forgot-password
/reset-password

/_authenticated/dashboard      → Ringkasan
/_authenticated/pengeluaran    → Daftar & kelola pengeluaran
/_authenticated/laporan        → Laporan & grafik
/_authenticated/pengaturan     → Profil & keamanan
```

Semua rute di bawah `_authenticated` diproteksi via route loader: belum login → redirect `/login`; sudah login membuka `/login` atau `/register` → redirect `/dashboard`.

---

## 7. Spesifikasi Fitur

### 7.1 Authentication

| Halaman                                | Field                                                  | Aksi                                                                |
| -------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| `/login` — "Masuk"                     | Email, Kata Sandi                                      | Tombol "Masuk"; link "Lupa kata sandi?", "Belum punya akun? Daftar" |
| `/register` — "Buat Akun"              | Nama Lengkap, Email, Kata Sandi, Konfirmasi Kata Sandi | Tombol "Daftar"; link "Sudah punya akun? Masuk"                     |
| `/forgot-password` — "Lupa Kata Sandi" | Email                                                  | Tombol "Kirim Tautan Reset"                                         |
| `/reset-password`                      | Kata Sandi Baru, Konfirmasi Kata Sandi                 | Tombol "Ubah Kata Sandi"                                            |

Ditenagai penuh oleh Supabase Auth (email/password). Tidak ada penyimpanan password custom.

### 7.2 Ringkasan (`/dashboard`)

Judul "Ringkasan", subtitle "Pantau pengeluaran Anda dalam satu tempat."

**Summary cards** (mengikuti filter periode aktif — default: bulan ini):

- Total Pengeluaran (Rp)
- Jumlah Transaksi
- Rata-rata Pengeluaran
- Kategori Terbesar

Empty state jika belum ada data sama sekali (lihat §7.6). Skeleton loading saat fetch.

### 7.3 Pengeluaran (`/pengeluaran`)

Header "Pengeluaran" + tombol utama "Tambah Pengeluaran".

**Toolbar:** pencarian (placeholder "Cari pengeluaran..."), filter periode, filter bulan, filter kategori — semua bisa dikombinasikan, state tersimpan di URL search params (contoh: `?periode=bulan-ini`, `?bulan=2026-09&kategori=makanan`).

**Filter Periode:** Hari ini, Minggu ini, Bulan ini, Bulan lalu, Tahun ini, Periode khusus (menampilkan Tanggal mulai + Tanggal akhir saat dipilih).

**Filter Bulan:** dropdown bulan+tahun (mis. "September 2026").

**Filter Kategori:** dropdown "Semua Kategori" + 9 kategori: Makanan, Belanja, Transportasi, Tagihan, Hiburan, Kesehatan, Perjalanan, Pendidikan, Lainnya.

**Tabel (desktop, via TanStack Table):**

| Tanggal | Deskripsi | Kategori | Jumlah | Aksi |
| ------- | --------- | -------- | -----: | ---- |

Aksi per baris: Ubah, Hapus.

**Mobile:** card per transaksi menampilkan deskripsi, kategori, tanggal, jumlah, dan menu aksi (⋮).

### 7.4 Tambah / Ubah Pengeluaran

Modal atau drawer. Judul "Tambah Pengeluaran" (atau "Ubah Pengeluaran" saat edit, form sudah terisi data existing).

**Field:**

| Field     | Wajib                    | Default  | Contoh      |
| --------- | ------------------------ | -------- | ----------- |
| Jumlah    | Ya                       | —        | 35.000      |
| Deskripsi | Ya                       | —        | Makan siang |
| Kategori  | Ya (dropdown 9 kategori) | —        | Makanan     |
| Tanggal   | Ya                       | Hari ini | —           |
| Catatan   | Tidak                    | —        | —           |

**Validasi (TanStack Form + schema):**

- Jumlah harus lebih besar dari 0. → "Jumlah harus lebih besar dari 0."
- Deskripsi wajib diisi. → "Deskripsi wajib diisi."
- Kategori wajib dipilih. → "Silakan pilih kategori."
- Tanggal wajib diisi. → "Tanggal wajib diisi."

Tombol simpan: "Simpan Pengeluaran" (tambah) / "Simpan Perubahan" (ubah).

### 7.5 Hapus Pengeluaran

Konfirmasi dialog sebelum hapus:

> Hapus pengeluaran ini?
> Pengeluaran yang dihapus tidak dapat dikembalikan.

Tombol: "Batal", "Hapus". Boleh menggunakan optimistic update dengan rollback bila mutation gagal. Setelah sukses: toast "Pengeluaran berhasil dihapus."

### 7.6 Empty / Loading / Error State

**Empty state** (belum ada pengeluaran sama sekali):

> Judul: Belum ada pengeluaran
> Deskripsi: Mulai catat pengeluaran pertama Anda untuk melihat ringkasan keuangan.
> Tombol: Tambah Pengeluaran

**Loading:** skeleton di dashboard, expense list, laporan, chart, profil — tidak pernah halaman kosong saat loading.

**Error:**

> Gagal fetch: "Terjadi kesalahan saat mengambil data." + tombol "Coba Lagi"
> Gagal simpan: "Pengeluaran gagal disimpan. Silakan coba lagi."

Tidak pernah menampilkan raw database error ke user.

### 7.7 Laporan (`/laporan`)

Judul "Laporan Pengeluaran", subtitle "Lihat ringkasan pengeluaran berdasarkan periode yang Anda pilih."

**Filter:** Periode (Bulan ini, Bulan lalu, Tahun ini, Periode khusus), Kategori (Semua + 9 kategori).

**Summary:** Total Pengeluaran, Jumlah Transaksi, Rata-rata Pengeluaran, Kategori Terbesar.

**Grafik (Recharts, maksimal 2 visualisasi):**

- Pengeluaran berdasarkan kategori → donut/pie chart
- Pengeluaran berdasarkan waktu → bar chart atau line chart

**Breakdown kategori:** daftar kategori dengan nominal, bar proporsional, dan persentase.

**Generate Report:** tombol "Buat Laporan" → export PDF berisi nama pengguna, periode, total, jumlah transaksi, rata-rata, ringkasan per kategori, dan daftar transaksi lengkap (tanggal, deskripsi, kategori, jumlah).

### 7.8 Pengaturan (`/pengaturan`)

Sections:

- **Profil:** Nama, Email + tombol "Simpan Perubahan"
- **Keamanan:** aksi "Ubah Kata Sandi"
- **Akun:** aksi "Keluar"

Halaman tetap sederhana — tidak ada tab/section tambahan di luar tiga ini.

---

## 8. Model Data

```sql
profiles
---------
id UUID PRIMARY KEY REFERENCES auth.users(id)
full_name TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()

expenses
---------
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID NOT NULL REFERENCES auth.users(id)
amount NUMERIC(14,2) NOT NULL
description TEXT NOT NULL
category TEXT NOT NULL
expense_date DATE NOT NULL
notes TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

Index pada `user_id`, `expense_date`, `category`. Kategori disimpan sebagai TEXT dengan value set tetap di level aplikasi (9 kategori) — bukan enum DB, agar mudah ditambah di masa depan tanpa migration.

### Row Level Security

RLS **wajib aktif** di kedua tabel. Policy inti: `auth.uid() = user_id` (atau `= id` untuk profiles) untuk select/insert/update/delete. Database adalah security boundary — tidak boleh mengandalkan filtering di frontend.

---

## 9. Data Fetching & State

TanStack Query sebagai satu-satunya sumber kebenaran untuk data server (bukan local state). Struktur query layer:

```
lib/
├── queries/    (expenses.ts, dashboard.ts, reports.ts)
├── mutations/  (expenses.ts)
└── supabase/   (client.ts, server.ts)
```

Query key & flow contoh:

```
expenses
expenses-by-period
expense-summary
expense-category-summary
```

Setiap mutation (create/update/delete) memicu `invalidateQueries` pada query terkait sehingga dashboard & list otomatis ter-update. Delete boleh optimistic dengan rollback saat gagal; operasi lain tidak dipaksa optimistic.

---

## 10. Format & Lokalisasi

- **Currency:** IDR via utility `formatCurrency()` (reusable, tidak hardcode per komponen). Contoh: `Rp35.000`, `Rp1.250.000`. Arsitektur harus tetap terbuka untuk currency lain di masa depan.
- **Tanggal:** locale `id-ID`. Format panjang: `7 September 2026`. Format list/ringkas: `7 Sep 2026`. Perhatikan timezone agar tanggal transaksi tidak bergeser.

---

## 11. Non-Functional Requirements

**Security:** Supabase Auth, SSR-compatible cookie session, RLS aktif di semua tabel, typed database access (generated types dari Supabase), environment variables untuk kredensial, tidak ada service role key di client, tidak ada authorization logic yang hanya di frontend.

**Performance:** SSR/streaming bila bermanfaat, query caching dengan stale time sesuai konteks, lazy loading untuk bagian berat (chart, PDF export), hindari fetch berulang/data berlebih.

**Accessibility:** semua input berlabel, button punya accessible name, modal bisa ditutup dengan Escape, keyboard navigation berfungsi, focus state jelas, contrast cukup, error form mudah dipahami.

**Responsive:** Desktop (sidebar + content), Tablet (compact sidebar + content), Mobile (header + content + bottom nav). Tabel pengeluaran → card di mobile. Filter tetap nyaman digunakan di layar kecil.

**Type Safety:** TypeScript strict, hindari `any`, database types digenerate dari Supabase, typed queries & typed forms.

---

## 12. Environment Variables

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

Tanpa prefix `VITE_` — dipetakan lewat `envPrefix` di `vite.config.ts` agar tetap ter-bundle ke client tanpa memicu peringatan "public framework prefix" di Vercel.

(Disesuaikan dengan konvensi resmi TanStack Start bila berbeda.) `.env` tidak boleh di-commit.

---

## 13. Roadmap Implementasi

| Phase | Isi                                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| 1     | Setup: TanStack Start, TypeScript, Tailwind, shadcn/ui, Supabase, TanStack Router/Query/Form/Table, ESLint, Prettier |
| 2     | Supabase client, SSR auth, Login, Register, Logout, Forgot/Reset password, Protected routes                          |
| 3     | Database: profiles, expenses, migrations, RLS, index, generated types                                                |
| 4     | Dashboard, tambah/ubah/hapus pengeluaran, expense list, search, filtering                                            |
| 5     | Laporan, chart, category breakdown, report generation, PDF export                                                    |
| 6     | Polish: responsive, loading/empty/error state, accessibility, performance, UX refinement                             |

Setiap phase dikerjakan bertahap — tidak membangun seluruh aplikasi dalam satu langkah.

---

## 14. Acceptance Criteria

**Authentication:** User dapat daftar, login, logout, lupa password, reset password; protected route berfungsi.

**Pengeluaran:** User dapat tambah, ubah, hapus pengeluaran; memilih kategori; mencari pengeluaran.

**Filtering:** Filter periode, bulan, kategori berfungsi dan dapat dikombinasikan; state tersimpan di URL.

**Dashboard:** Total pengeluaran, jumlah transaksi, rata-rata, kategori terbesar — semua akurat mengikuti filter aktif.

**Laporan:** Report mengikuti filter aktif; breakdown kategori & grafik akurat; user dapat generate/export laporan (PDF).

**Security:** RLS aktif; user tidak dapat melihat data user lain; session aman; tidak ada secret key di client.

**UX:** Seluruh UI Bahasa Indonesia; responsive & mobile friendly; loading/empty/error state tersedia di semua halaman data; accessibility dasar diterapkan.

---

## 15. Batasan & Keputusan Terbuka

- Library PDF export spesifik akan ditentukan saat Phase 5 (kandidat: `@react-pdf/renderer`, `jspdf`).
- Tidak ada fitur di luar MVP (lihat §4.2) — permintaan penambahan fitur harus ditolak/dipisahkan ke roadmap berikutnya, bukan disisipkan ke scope ini.

---

## 16. Addendum — Anggaran & Hutang (di luar MVP awal, ditambahkan atas permintaan eksplisit)

Fitur ini melampaui batasan §4.2 (budgeting/income management awalnya dikecualikan), ditambahkan setelah MVP berjalan atas permintaan langsung pemilik produk.

**Halaman `/anggaran`** (nav baru, sejajar Pengeluaran & Laporan), dua tab:

**Tab Kantong Anggaran** — per bulan:

- Catat total Pemasukan bulan itu.
- Buat "kantong" (mis. Kebutuhan Sehari-hari, Tabungan) dengan alokasi berupa jumlah tetap atau persentase dari pemasukan.
- Form Tambah/Ubah Pengeluaran mendapat field baru "Kantong Anggaran (opsional)" — **berjalan bersamaan** dengan Kategori (kategori untuk breakdown laporan, kantong untuk kontrol budget). Field ini hanya muncul jika bulan pengeluaran tersebut punya kantong anggaran.
- Jika pengeluaran akan membuat kantong melebihi alokasinya, tampilkan warning inline non-blocking — pengeluaran tetap bisa disimpan.

**Tab Hutang** — model satu arah (uang yang harus dibayar user):

- Catat hutang: nama, jumlah total, jatuh tempo opsional.
- Catat cicilan/pembayaran sebagian, berulang, sampai sisa mencapai 0.
- Status "Belum Lunas" tetap tampil lintas bulan sampai lunas; setelah lunas berubah jadi badge "Lunas" (hijau), record tetap ada (tidak auto-terhapus).
- Pembayaran cicilan **ikut terhitung** ke "Total Pengeluaran" & "Jumlah Transaksi" di Ringkasan/Laporan bulan pembayaran itu terjadi (sebagai kategori sintetis "Cicilan Hutang" khusus untuk breakdown — tidak menambah 9 kategori pengeluaran resmi, dan tidak muncul di tabel/list Pengeluaran biasa).

**Skema tambahan:** `budgets` (1 per user per bulan), `budget_pockets`, `debts`, `debt_payments`, plus kolom `expenses.pocket_id` (nullable). Lihat [db/migrations/0002_budget_and_debt.sql](../db/migrations/0002_budget_and_debt.sql) — wajib dijalankan di Supabase SQL Editor sebelum fitur ini berfungsi.

---

## 17. Addendum — Tabungan & Wishlist

Tab ketiga di halaman `/anggaran`, terhubung ke mekanisme kantong anggaran yang sudah ada.

- **Kantong Tabungan**: kantong anggaran (di tab Kantong Anggaran maupun lewat tombol khusus di tab Tabungan) bisa ditandai sebagai "Kantong Tabungan" — jumlah/persentase dari pemasukan bulan itu yang dialokasikan ke sana **tidak** dipakai untuk pengeluaran (dikecualikan dari pilihan Kantong Anggaran saat Tambah Pengeluaran, tidak ada tracking terpakai/sisa).
- **Total Tabungan**: akumulasi dari SEMUA kantong tabungan lintas bulan (bukan reset tiap bulan seperti kantong biasa) — mencerminkan "sisihkan gaji 5jt untuk menabung sekian tiap bulan, terus bertambah".
- **Wishlist**: daftar barang yang diinginkan — nama, harga (opsional), link produk (opsional). Progress tiap item dibandingkan terhadap Total Tabungan (satu pool bersama, bukan dialokasikan per-item), dengan checkbox manual "sudah dibeli".

**Skema tambahan:** kolom `budget_pockets.is_savings`, tabel baru `wishlist_items`. Lihat [db/migrations/0003_savings_and_wishlist.sql](../db/migrations/0003_savings_and_wishlist.sql) — wajib dijalankan di Supabase SQL Editor sebelum fitur ini berfungsi.
