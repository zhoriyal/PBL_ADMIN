This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Admin route protection

The admin routes (`/dashboard`, `/ulasan`, `/tiket`, `/pengaturan`, `/informasi`, and `/koleksi`, including their subroutes) require an authentication token. Requests without a token are redirected to `/login`; `/login` and `/register` remain public. A successful login stores the token for both the API client and the Next.js request guard, and logout clears both.

The admin layout validates the token with the backend `/auth/me` endpoint and only allows `ADMIN`, `SUPERADMIN`, or `STAFF` roles. The image upload endpoint performs the same check and returns `401` when the session is missing, invalid, or not an admin session. This frontend guard complements, but does not replace, authorization on backend API routes.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Folder aplikasi Next.js adalah `PBL_ADMIN/` (menggunakan App Router di `src/app`). Dari root workspace, jalankan perintah berikut; pilih atau buat project saat diminta:

```powershell
Set-Location .\PBL_ADMIN
npx vercel login
npx vercel link
```

Di pengaturan project Vercel, pastikan **Root Directory** adalah `PBL_ADMIN` bila project dibuat dari root repository. Sebelum deploy, atur `NEXT_PUBLIC_API_URL` ke URL backend publik beserta `/api` (contoh `https://api.example.com/api`) dan `API_URL` ke URL backend yang sama. Tambahkan keduanya untuk environment Production di **Project Settings → Environment Variables**. Jangan masukkan kredensial backend ke `NEXT_PUBLIC_*`.

Buat Vercel Blob Store di dashboard Vercel lalu hubungkan ke project ini. Integrasi tersebut menambahkan `BLOB_READ_WRITE_TOKEN` ke environment project; periksa bahwa variabel tersedia untuk Production (dan Preview bila diperlukan) sebelum menguji endpoint upload admin. Jangan menyalin token ke source control atau membagikannya di log.

Deploy preview dan production:

```powershell
npx vercel
npx vercel --prod
```

Vercel akan menampilkan URL publik project dengan akhiran `.vercel.app`. Masukkan origin tersebut tanpa path ke `CORS_ORIGINS` di backend, misalnya `https://nama-project.vercel.app`, lalu redeploy/restart backend.

Project tidak memerlukan `vercel.json`; Vercel mendeteksi Next.js dari `package.json` dan konfigurasi Next. Jangan mendaftarkan domain Vercel sebagai webhook Midtrans: URL notifikasi harus menuju backend Express yang dapat dijangkau publik.
