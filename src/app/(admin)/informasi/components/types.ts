export type AnnouncementStatus = "AKTIF" | "ARSIP";

export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  status: AnnouncementStatus;
}

export interface AnnouncementFormValues {
  title: string;
  description: string;
  category: string;
  date: string;
  status: AnnouncementStatus;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface FaqFormValues {
  question: string;
  answer: string;
}

export interface JamOperasional {
  hari: string;
  jam: string;
  telepon: string;
}