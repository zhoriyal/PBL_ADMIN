export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  status: "AKTIF" | "ARSIP";
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface JamOperasional {
  hari: string;
  jam: string;
  telepon: string;
}
