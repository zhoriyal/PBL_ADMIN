import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-slate-600">
          Alamat yang Anda buka mungkin sudah dipindahkan atau tidak tersedia.
        </p>
        <Link
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
          href="/"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
