"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold text-slate-900">Terjadi kesalahan</h1>
        <p className="mt-2 text-slate-600">
          Halaman tidak dapat dimuat. Silakan coba lagi.
        </p>
        <button
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
          onClick={reset}
          type="button"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
