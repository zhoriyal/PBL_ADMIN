export type KoleksiStatus = "DIPAMERKAN" | "RESTORASI" | "SIMPAN";

export interface KoleksiItem {
  id: number;
  kode: string;
  nama: string;
  sub_deskripsi: string;
  deskripsi_lengkap?: string | null;
  kategori: string;
  tahun: string;
  lokasi: string;
  status: KoleksiStatus;
  image_url?: string | null;
}

export interface KoleksiFormValues {
  kode: string;
  nama: string;
  sub_deskripsi: string;
  deskripsi_lengkap: string;
  kategori: string;
  tahun: string;
  lokasi: string;
  status: KoleksiStatus;
  image_url: string;
}