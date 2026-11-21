export type TicketCategoryStatus = "Aktif" | "Nonaktif";

export type TicketBookingStatus = "LUNAS" | "MENUNGGU" | "BATAL";

export interface TicketCategory {
  id: number;
  badge: string;
  badge_bg: string;
  badge_color: string;
  title: string;
  price: number;
  kuota: number;
  status: TicketCategoryStatus;
}

export interface TicketCategoryFormValues {
  badge: string;
  badge_bg: string;
  badge_color: string;
  title: string;
  price: string | number;
  kuota: string | number;
  status: TicketCategoryStatus;
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
  status: TicketBookingStatus;
  checked_in: number;
  checked_in_at?: string | null;
}

export interface TicketStats {
  terjualHariIni: number;
  sudahCheckIn: number;
  pendapatanHariIni: number;
}