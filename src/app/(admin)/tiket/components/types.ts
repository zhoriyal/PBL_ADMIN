export interface TicketCategory {
  id: number;
  badge: string;
  badge_bg: string;
  badge_color: string;
  title: string;
  price: number;
  kuota: number;
  status: "Aktif" | "Nonaktif";
}

export interface TicketBooking {
  id: string;
  nama: string;
  email: string;
  phone?: string;
  kategori_dewasa: number;
  kategori_pelajar: number;
  kategori_wna: number;
  total_tiket: number;
  total_biaya: number;
  sesi: string;
  visit_date: string;
  payment_method: string;
  status: "LUNAS" | "MENUNGGU" | "BATAL";
  checked_in: number;
}
