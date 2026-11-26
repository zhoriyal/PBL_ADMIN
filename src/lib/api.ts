import { AUTH_TOKEN_COOKIE } from "./auth-constants";
import { Role } from "./types";

/**
 * API Client untuk Admin Next.js
 */

export const OFFLINE_MOCK_TOKEN = 'offline-mock-token';

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  let base = envUrl || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : '');
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL belum dikonfigurasi');
  }
  base = base.replace(/\/+$/, '');
  if (!base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
}

function normalizeApiPath(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/api/')) {
    return cleanPath.slice(4);
  }
  return cleanPath;
}

export class ApiNetworkError extends Error {
  constructor(message = 'Backend tidak dapat dijangkau') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_COOKIE);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_COOKIE, token);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax${secure}`;
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_COOKIE);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export interface GenericApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  statistics?: Record<string, unknown>;
  stats?: Record<string, unknown>;
  [key: string]: unknown;
}

function toQueryString(params: Record<string, unknown> = {}): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)]);
  return new URLSearchParams(entries).toString();
}

async function request<T = GenericApiResponse>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  let res: Response;
  try {
    const cleanPath = normalizeApiPath(path);
    res = await fetch(`${getApiBaseUrl()}${cleanPath}`, options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiNetworkError();
    }
    throw error;
  }

  let data: T & { message?: string };
  try {
    data = (await res.json()) as T & { message?: string };
  } catch {
    throw new Error('Respons backend tidak valid');
  }

  if (!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}

async function uploadRawFile<T extends { pathname: string }>(
  path: string,
  file: File,
  allowedTypes: ReadonlySet<string>,
  maxSize: number,
): Promise<T> {
  if (!allowedTypes.has(file.type)) {
    throw new Error('Format file tidak didukung');
  }
  if (file.size > maxSize) {
    throw new Error(`Ukuran file maksimal ${maxSize / (1024 * 1024)} MB`);
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error('Autentikasi diperlukan');
  }

  let response: Response;
  try {
    const cleanPath = normalizeApiPath(path);
    response = await fetch(`${getApiBaseUrl()}${cleanPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': file.type,
      },
      body: file,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiNetworkError();
    }
    throw error;
  }

  let result: {
    success: boolean;
    message?: string;
    data?: T;
  };
  try {
    result = await response.json();
  } catch {
    throw new Error('Respons backend tidak valid');
  }
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Gagal mengunggah file');
  }
  return result.data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    id?: number | string;
    nama?: string;
    username?: string;
    email?: string;
    role?: Role;
  };
}

export interface UserMeResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number | string;
    nama?: string;
    username?: string;
    email?: string;
    role?: Role;
  };
}

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>('POST', '/auth/login', { username, password }),
  register: (data: { nama: string; email: string; password: string; role?: string }) => 
    request<GenericApiResponse>('POST', '/auth/register', data),
  logout: () => request<GenericApiResponse>('POST', '/auth/logout'),
  me: () => request<UserMeResponse>('GET', '/auth/me'),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export type TransactionStatus = "LUNAS" | "PENDING" | "BATAL" | "MENUNGGU";

export interface DashboardSummaryData {
  terjualHariIni?: number;
  pendapatanHariIni?: number;
  totalKoleksi?: number;
  transactions?: Array<{
    id: string;
    name: string;
    tickets: number;
    total: number;
    status: TransactionStatus;
    date: string;
  }>;
  reviews?: Array<{
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  ulasanBelumDibalas?: number;
  weeklyData?: Array<{ day: string; val: number }>;
  notifications?: {
    pendingBookings?: Array<{ id: string; nama: string; total_tiket: number }>;
  };
}

export const dashboardApi = {
  getSummary: () => request<GenericApiResponse<DashboardSummaryData>>('GET', '/dashboard/summary'),
};

// ─── NOTIFIKASI ──────────────────────────────────────────────────────────────
export interface NotifikasiItem {
  id: number;
  type: 'BOOKING' | 'ULASAN' | string;
  title: string;
  message: string;
  link?: string | null;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export const notifikasiApi = {
  getAll: (limit = 30) =>
    request<GenericApiResponse<NotifikasiItem[]> & { unread?: number }>('GET', `/notifikasi?limit=${limit}`),
  markRead: (id: number | string) => request<GenericApiResponse>('PUT', `/notifikasi/${id}/read`),
  markAllRead: () => request<GenericApiResponse>('PUT', '/notifikasi/read-all'),
};

// ─── TIKET ───────────────────────────────────────────────────────────────────
export type TicketCategoryStatus = "Aktif" | "Nonaktif";
export type TicketBookingStatus = "LUNAS" | "MENUNGGU" | "BATAL";

export interface TiketCategoryItem {
  id: number;
  badge: string;
  badge_bg: string;
  badge_color: string;
  title: string;
  price: number;
  kuota: number;
  status: TicketCategoryStatus;
}

export interface TiketBookingItem {
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

export interface TiketStatsItem {
  terjualHariIni?: number;
  pendapatanHariIni?: number;
  sudahCheckIn?: number;
  totalTerjual?: number;
  totalPendapatan?: number;
  menunggu?: number;
}

export const tiketApi = {
  getCategories: <T = TiketCategoryItem[]>() => request<GenericApiResponse<T>>('GET', '/tiket/categories'),
  addCategory: (data: unknown) => request<GenericApiResponse<TiketCategoryItem>>('POST', '/tiket/categories', data),
  updateCategory: (id: number | string, data: unknown) => request<GenericApiResponse<TiketCategoryItem>>('PUT', `/tiket/categories/${id}`, data),
  deleteCategory: (id: number | string) => request<GenericApiResponse>('DELETE', `/tiket/categories/${id}`),

  getBookings: <T = TiketBookingItem[]>(params: Record<string, unknown> = {}) => {
    const q = toQueryString(params);
    return request<GenericApiResponse<T>>('GET', `/tiket/bookings?${q}`);
  },
  updateBookingStatus: (id: string, status: string) => 
    request<GenericApiResponse<TiketBookingItem>>('PUT', `/tiket/bookings/${encodeURIComponent(id)}/status`, { status }),
  checkIn: (id: string) => request<GenericApiResponse<TiketBookingItem>>('PUT', `/tiket/bookings/${encodeURIComponent(id)}/checkin`),
  getStats: () => request<GenericApiResponse<TiketStatsItem>>('GET', '/tiket/stats'),
};

// ─── KOLEKSI ──────────────────────────────────────────────────────────────────
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

export interface KoleksiStatsItem {
  total: number;
  dipamerkan: number;
  restorasi: number;
  disimpan: number;
  [key: string]: unknown;
}

export interface KoleksiResponse<T = KoleksiItem[]> extends GenericApiResponse<T> {
  stats?: KoleksiStatsItem;
}

export const koleksiApi = {
  getAll: <T = KoleksiItem[]>(params: Record<string, unknown> = {}) => {
    const q = toQueryString(params);
    return request<KoleksiResponse<T>>('GET', `/koleksi?${q}`);
  },
  getStats: () => request<GenericApiResponse<KoleksiStatsItem>>('GET', '/koleksi/stats'),
  add: (data: unknown) => request<GenericApiResponse<KoleksiItem>>('POST', '/koleksi', data),
  update: (id: number | string, data: unknown) => request<GenericApiResponse<KoleksiItem>>('PUT', `/koleksi/${id}`, data),
  delete: (id: number | string) => request<GenericApiResponse>('DELETE', `/koleksi/${id}`),
};

// ─── CLOUD STORAGE ───────────────────────────────────────────────────────────
export const storageApi = {
  uploadCollectionImage: (file: File) =>
    uploadRawFile<{ pathname: string; url: string }>(
      '/storage/uploads',
      file,
      new Set(['image/jpeg', 'image/png', 'image/webp']),
      4.5 * 1024 * 1024,
    ),
  uploadPrivateFile: (file: File) =>
    uploadRawFile<{ pathname: string }>(
      '/storage/private-uploads',
      file,
      new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
      10 * 1024 * 1024,
    ),
  createSecureUrl: (pathname: string) =>
    request<{
      success: boolean;
      data: { url: string; expiresIn: number };
    }>('POST', '/storage/secure-url', { pathname }),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  generateDescription: (data: { title: string; category: string }) =>
    request<{ description: string }>('POST', '/ai/generate-description', data),
};

// ─── ULASAN ───────────────────────────────────────────────────────────────────
export interface UlasanItem {
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

export interface UlasanStats {
  averageRating?: number;
  total?: number;
  overallTotal?: number;
  [key: string]: unknown;
}

export interface UlasanResponse<T = UlasanItem[]> extends GenericApiResponse<T> {
  stats?: UlasanStats;
}

export const ulasanApi = {
  getAll: <T = UlasanItem[]>(params: Record<string, unknown> = {}) => {
    const q = toQueryString(params);
    return request<UlasanResponse<T>>('GET', `/ulasan?${q}`);
  },
  reply: (id: number | string, reply: string) => request<GenericApiResponse>('PUT', `/ulasan/${id}/reply`, { reply }),
  delete: (id: number | string) => request<GenericApiResponse>('DELETE', `/ulasan/${id}`),
};

// ─── INFORMASI ────────────────────────────────────────────────────────────────
export type AnnouncementStatus = "AKTIF" | "ARSIP";

export interface PengumumanItem {
  id: number;
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

export interface JamOperasionalItem {
  id?: number;
  hari: string;
  jam: string;
  telepon: string;
}

export const informasiApi = {
  getPengumuman: <T = PengumumanItem[]>(params: Record<string, unknown> = {}) => {
    const q = toQueryString(params);
    return request<GenericApiResponse<T>>('GET', `/informasi/pengumuman?${q}`);
  },
  addPengumuman: (data: unknown) => request<GenericApiResponse<PengumumanItem>>('POST', '/informasi/pengumuman', data),
  updatePengumuman: (id: number | string, data: unknown) => request<GenericApiResponse<PengumumanItem>>('PUT', `/informasi/pengumuman/${id}`, data),
  deletePengumuman: (id: number | string) => request<GenericApiResponse>('DELETE', `/informasi/pengumuman/${id}`),

  getFaq: <T = FaqItem[]>() => request<GenericApiResponse<T>>('GET', '/informasi/faq'),
  addFaq: (data: unknown) => request<GenericApiResponse<FaqItem>>('POST', '/informasi/faq', data),
  updateFaq: (id: number | string, data: unknown) => request<GenericApiResponse<FaqItem>>('PUT', `/informasi/faq/${id}`, data),
  deleteFaq: (id: number | string) => request<GenericApiResponse>('DELETE', `/informasi/faq/${id}`),

  getJamOperasional: () => request<GenericApiResponse<JamOperasionalItem>>('GET', '/informasi/jam-operasional'),
  updateJamOperasional: (data: unknown) => request<GenericApiResponse<JamOperasionalItem>>('PUT', '/informasi/jam-operasional', data),
};
