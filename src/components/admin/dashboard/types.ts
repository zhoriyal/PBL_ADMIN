export interface Transaction {
  id: string;
  name: string;
  tickets: number;
  total: number;
  status: "LUNAS" | "PENDING" | "BATAL" | "MENUNGGU";
  date: string;
}

export interface Review {
  id: string | number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface WeeklyData {
  day: string;
  val: number;
}
