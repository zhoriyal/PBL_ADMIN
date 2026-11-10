"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <main
          style={{
            alignItems: "center",
            background: "#f8fafc",
            color: "#0f172a",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div>
            <h1>Terjadi kesalahan</h1>
            <p>Aplikasi tidak dapat dimuat. Silakan coba lagi.</p>
            <button onClick={reset} type="button">
              Coba lagi
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
