import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File gambar tidak ditemukan" },
        { status: 400 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    // Jika token Vercel Blob tersedia, gunakan @vercel/blob
    if (token) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`koleksi/${Date.now()}-${file.name}`, file, {
          access: "public",
          token: token,
        });

        return NextResponse.json({
          success: true,
          message: "Upload berhasil via Vercel Blob",
          url: blob.url,
        });
      } catch (blobErr: any) {
        console.warn("[Vercel Blob Warn] Falling back to Data URI:", blobErr?.message);
      }
    }

    // Fallback lokal / development tanpa token: konversi ke Base64 Data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      message: "Upload berhasil (Data URL Fallback)",
      url: dataUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal mengunggah file" },
      { status: 500 }
    );
  }
}

