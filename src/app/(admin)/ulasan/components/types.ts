export interface Review {
  id: number;
  nama: string;
  avatar_initial?: string | null;
  avatar_color?: string | null;
  category: string;
  rating: number;
  comment: string;
  reply?: string | null;
  reply_date?: string | null;
  created_at: string;
}

export interface ReviewStats {
  averageRating: number;
  total: number;
}