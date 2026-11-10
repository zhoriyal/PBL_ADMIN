import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File gambar tidak ditemukan" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 4.5 MB" },
        { status: 413 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("BLOB_READ_WRITE_TOKEN belum dikonfigurasi");
      return NextResponse.json(
        { success: false, message: "Konfigurasi penyimpanan file belum tersedia" },
        { status: 500 }
      );
    }

    const blob = await put(`koleksi/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token,
    });

    return NextResponse.json({
      success: true,
      message: "Upload berhasil via Vercel Blob",
      url: blob.url,
    });
  } catch (error: unknown) {
    console.error("Gagal mengunggah file ke Vercel Blob:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengunggah file" },
      { status: 500 }
    );
  }
}
