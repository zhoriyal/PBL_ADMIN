export interface KoleksiItem {
  id: number;
  kode: string;
  nama: string;
  sub_deskripsi: string;
  deskripsi_lengkap?: string;
  kategori: string;
  tahun: string;
  lokasi: string;
  status: "DIPAMERKAN" | "RESTORASI" | "SIMPAN";
  image_url?: string;
}
