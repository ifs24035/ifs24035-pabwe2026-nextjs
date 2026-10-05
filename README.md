# ifs24035-pabwe2026-nextjs

**Aplikasi Postingan (Delcom Post)** — tugas praktikum mata kuliah *Pengembangan Aplikasi Berbasis Web* (PABWE).

Aplikasi ini memanfaatkan endpoint publik [Delcom Open API](https://open-api.delcom.org/docs/1.0/api-posts)
sebagai sumber data, dibangun dengan **Next.js (App Router) + TypeScript + Tailwind CSS v4**,
state management **Redux Toolkit**, notifikasi **SweetAlert2**, ikon **Tabler Icons**,
tipografi **Google Font (Plus Jakarta Sans)**, serta pengujian **Vitest + Testing Library**
dengan **cakupan kode (coverage) 100%**.

---

## 1. Teknologi

| Kategori | Teknologi |
| --- | --- |
| Runtime & package manager | [Bun](https://bun.com) 1.4.x |
| Framework | Next.js 16 (App Router, Turbopack) |
| Bahasa | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| State management | Redux Toolkit + React Redux |
| Ikon | `@tabler/icons-react` |
| Dialog | SweetAlert2 |
| Font | Google Font — Plus Jakarta Sans (`next/font/google`) |
| Testing | Vitest + jsdom + `@testing-library/react` + `@vitest/coverage-v8` |
| Linter | ESLint 9 (`eslint-config-next`) |

---

## 2. Menjalankan Proyek

```bash
# 1. Pasang dependensi
bun install

# 2. Jalankan mode pengembangan (Turbopack, port dibaca dari APP_PORT)
bun run dev

# 3. Buka http://localhost:3000
```

Perintah lain:

| Perintah | Kegunaan |
| --- | --- |
| `bun run dev` | Menjalankan dev server (port dari `APP_PORT` di `.env`) |
| `bun run build` | Build produksi |
| `bun run start` | Menjalankan hasil build produksi |
| `bun run test` | Menjalankan seluruh pengujian beserta laporan coverage |
| `bun run test:coverage` | Sama dengan `bun run test` (vitest run --coverage) |
| `bun run test:watch` | Mode watch untuk pengembangan test |
| `bun run lint` | Memeriksa kualitas kode dengan ESLint |

### Variabel lingkungan

`.env`

```dotenv
NEXT_PUBLIC_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3000
```

`.env.example` memuat nilai contoh untuk backend lokal (`http://localhost:8000/api/v1`).
`src/server.ts` membaca `APP_PORT` secara dinamis (dari environment, lalu dari berkas `.env`,
dengan cadangan `3000`) sebelum menyalakan Next.js.

---

## 3. Struktur Proyek

```
src/
├── app/                                   # Next.js App Router
│   ├── layout.tsx                         # Root layout: font, globals.css, Providers
│   ├── globals.css                        # Tailwind v4 + style dasar
│   ├── not-found.tsx                      # Halaman 404
│   ├── auth/
│   │   ├── layout.tsx                     # Membungkus AuthLayout
│   │   ├── login/page.tsx                 # Merender LoginPage
│   │   └── register/page.tsx              # Merender RegisterPage
│   └── (dashboard)/                       # Route group terproteksi
│       ├── layout.tsx                     # Membungkus PostLayout (route guarding)
│       ├── page.tsx                       # Linimasa postingan (HomePage)
│       ├── posts/[postId]/page.tsx        # Rincian postingan (DetailPage)
│       ├── users/page.tsx                 # Direktori pengguna (UsersPage)
│       └── profile/page.tsx               # Profil akun (ProfilePage)
├── components/Providers.tsx               # Client Component pembungkus <Provider store>
├── features/
│   ├── auth/
│   │   ├── api/authApi.ts                 # POST /auth/login, /auth/register, /auth/logout
│   │   ├── states/{action,reducer}.ts     # isAuthLogin, isAuthRegister, isAuthLogout
│   │   ├── layouts/AuthLayout.tsx         # Shell autentikasi
│   │   └── pages/{LoginPage,RegisterPage}.tsx
│   ├── users/
│   │   ├── api/userApi.ts                 # /users, /users/me, foto, kata sandi
│   │   ├── states/{action,reducer}.ts     # users, user, profile, isProfile, isChangeProfile*
│   │   └── pages/{UsersPage,ProfilePage}.tsx
│   └── posts/
│       ├── api/postApi.ts                 # 10 fungsi endpoint postingan
│       ├── states/{action,reducer}.ts     # 19 slice state postingan
│       ├── components/{Navbar,Sidebar}Component.tsx
│       ├── modals/{Add,Change,ChangeCover}Modal.tsx
│       ├── layouts/PostLayout.tsx         # Navbar + Sidebar + route guard
│       └── pages/{HomePage,DetailPage}.tsx
├── helpers/
│   ├── apiHelper.ts                       # Wrapper fetch + bearer token + localStorage
│   └── toolsHelper.ts                     # SweetAlert2 & formatDate
├── hooks/
│   ├── useInput.ts                        # Two-way data binding input form
│   └── redux.ts                           # useAppDispatch & useAppSelector bertipe
├── lib/config.ts                          # DELCOM_BASEURL & APP_PORT
├── types/{index,action}.ts                # Post, PostAuthor, PostComment, User, ApiResult
├── store.ts                               # configureStore + RootState + AppDispatch
├── server.ts                              # Launcher Next.js dengan port dinamis
├── setupTests.ts                          # Konfigurasi lingkungan pengujian
└── test-utils.tsx                         # renderWithProviders + createMockStore
```

---

## 4. Rute Aplikasi

| Rute | Layout | Halaman |
| --- | --- | --- |
| `/auth/login` | AuthLayout | Login pengguna |
| `/auth/register` | AuthLayout | Registrasi pengguna baru |
| `/` | PostLayout | Linimasa semua postingan / postingan saya |
| `/?is_me=1` | PostLayout | Tab khusus postingan milik pengguna aktif |
| `/posts/[postId]` | PostLayout | Rincian postingan, like, dan komentar |
| `/users` | PostLayout | Daftar seluruh pengguna (dengan pencarian) |
| `/profile` | PostLayout | Ubah profil, foto, dan kata sandi |

Rute di dalam route group `(dashboard)` dilindungi oleh `PostLayout`: token dibaca dari
`localStorage`; bila tidak ada, pengguna diarahkan ke `/auth/login`.

---

## 5. Endpoint Delcom Open API yang Digunakan

Base URL: `https://open-api.delcom.org/api/v1`

**Autentikasi**

- `POST /auth/register` — mendaftarkan akun baru
- `POST /auth/login` — memperoleh access token
- `POST /auth/logout` — mencabut access token

**Pengguna**

- `GET /users` — daftar seluruh pengguna
- `GET /users/me` — profil pengguna aktif
- `PUT /users/me` — perbarui nama & email
- `POST /users/me/photo` — unggah foto profil (`multipart/form-data`)
- `PUT /users/password` — ubah kata sandi

**Postingan**

- `GET /posts` dan `GET /posts?is_me=1` — semua postingan / postingan sendiri
- `GET /posts/:id` — rincian postingan
- `POST /posts` — tambah postingan
- `PUT /posts/:id` — ubah deskripsi
- `POST /posts/:id/cover` — unggah/ganti cover (`multipart/form-data`)
- `DELETE /posts/:id` — hapus postingan
- `POST /posts/:id/likes` — beri/batalkan suka (`{ "like": 1 | 0 }`)
- `POST /posts/:id/comments` — tambah komentar
- `DELETE /posts/:id/comments` — hapus komentar sendiri
- `DELETE /posts` — hapus seluruh postingan milik pengguna aktif

---

## 6. Pengujian & Cakupan Kode

```bash
bun run test:coverage
```

Konfigurasi pada `vitest.config.mts`: lingkungan `jsdom`, plugin React, setup
`src/setupTests.ts`, serta ambang batas **100%** untuk *statements, branches, functions,
dan lines*. Hasil terakhir:

```
Test Files  26 passed (26)
Tests      290 passed (290)
All files   | 100 | 100 | 100 | 100 |
```

Laporan HTML dapat dibuka pada `coverage/lcov-report/index.html`.

Cakupan pengujian meliputi helper (`apiHelper`, `toolsHelper`), hook (`useInput`), seluruh
API caller, action creator, reducer, komponen, modal, layout, halaman, sampai konfigurasi
store (`src/store.test.ts`).

### 6.1 Mengatasi galat `EPERM ... vitest-coverage-*.lock`

Vitest menyimpan berkas *lock* laporan cakupan di folder Temp sistem (`os.tmpdir()`).
Pada lingkungan yang membatasi penulisan ke folder tersebut, perintah berhenti **sebelum
satu pun test berjalan**:

```
Error: EPERM: operation not permitted, open 'C:\Users\...\AppData\Local\Temp\vitest-coverage-<hash>.lock'
 Test Files 0 passed (0)
```

`vitest.config.mts` karena itu mengalihkan folder sementara Vitest ke `./.vitest-tmp`
**di dalam proyek**. Folder tersebut dibuat otomatis saat konfigurasi dimuat dan sudah
tercantum pada `.gitignore`, sehingga pengujian tidak lagi bergantung pada izin folder
Temp sistem.

Bila galat serupa muncul pada proyek lain, dua langkah berikut menyelesaikannya:

1. Jalankan perintah dari **terminal biasa** (PowerShell, Windows Terminal, atau Terminal
   VS Code) — bukan dari terminal yang dibatasi sandbox/kebijakan keamanan.
2. Periksa apakah folder Temp dapat ditulis, lalu bersihkan sisa lock:

```powershell
# uji cepat: apakah folder Temp mengizinkan pembuatan berkas eksklusif?
node -e "const fs=require('fs'),os=require('os'),p=require('path').join(os.tmpdir(),'probe.lock');try{fs.writeFileSync(p,'x',{flag:'wx'});console.log('Temp OK');fs.unlinkSync(p)}catch(e){console.log('Temp DIBLOKIR:',e.code)}"

# bersihkan sisa berkas lock bila ada
Remove-Item "$env:TEMP\vitest-coverage-*.lock" -Force -ErrorAction SilentlyContinue
```

Sebagai jalan pintas tanpa mengubah konfigurasi, folder sementara dapat diarahkan manual:

```powershell
$env:TEMP = "$PWD\.vitest-tmp"; $env:TMP = $env:TEMP; $env:TMPDIR = $env:TEMP
bun run test:coverage
```

---

## 7. Catatan Implementasi

- **Route guarding** dilakukan di `PostLayout` (memverifikasi token dan memuat profil) dan
  di `AuthLayout` (mengalihkan pengguna yang sudah masuk ke dashboard).
- **Umpan balik aksi** memakai SweetAlert2 lewat `toolsHelper`, sementara status mutasi
  (`isPostAdd`, `isPostChanged`, `isPostLiked`, dan seterusnya) disimpan di Redux sebagai
  pemicu pemuatan ulang data.
- **Filter pencarian** pada linimasa berjalan langsung (*live search*) terhadap deskripsi
  dan nama pembuat tanpa permintaan jaringan tambahan.
- Aturan ESLint `react-hooks/set-state-in-effect` diturunkan menjadi *warning* pada
  `eslint.config.mjs`, karena arsitektur pemuatan data berbasis Redux thunk di dalam
  `useEffect` sengaja mengikuti pola modul latihan. `bun run lint` selesai dengan
  **0 error**.
