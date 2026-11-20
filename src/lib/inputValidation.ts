// Membuang angka dan karakter tidak wajar pada input berbasis huruf (nama, label, judul, lokasi)
export function sanitizeLettersOnly(value: string): string {
  return value.replace(/[^a-zA-Z\s.'-]/g, "");
}

// Membuang semua karakter selain digit angka 0-9 (nomor telepon, harga, kuota, kapasitas, tahun)
export function sanitizeDigitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidLettersOnly(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && /^[a-zA-Z\s.'-]+$/.test(trimmed);
}

export function isValidDigitsOnly(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && /^\d+$/.test(trimmed);
}