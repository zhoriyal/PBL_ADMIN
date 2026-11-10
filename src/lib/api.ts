import { AUTH_TOKEN_COOKIE } from "./auth-constants";

/**
 * API Client untuk Admin Next.js
 * Terhubung ke backend Express.js di http://localhost:3001
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const OFFLINE_MOCK_TOKEN = 'offline-mock-token';

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

async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
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
    res = await fetch(`${BASE_URL}${path}`, options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiNetworkError();
    }
    throw error;
  }

  let data: T & { message?: string };
  try {
    data = await res.json() as T & { message?: string };
  } catch {
    throw new Error('Respons backend tidak valid');
  }

  if (!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    id?: number | string;
    nama?: string;
    username?: string;
    email?: string;
    role?: 'ADMIN' | 'SUPERADMIN' | 'STAFF' | 'USER';
  };
}

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>('POST', '/auth/login', { username, password }),
  register: (data: { nama: string; email: string; password: string; role?: string }) => 
    request('POST', '/auth/register', data),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => request('GET', '/dashboard/summary'),
};

// ─── TIKET ───────────────────────────────────────────────────────────────────
export const tiketApi = {
  getCategories: () => request('GET', '/tiket/categories'),
  addCategory: (data: any) => request('POST', '/tiket/categories', data),
  updateCategory: (id: number | string, data: any) => request('PUT', `/tiket/categories/${id}`, data),
  deleteCategory: (id: number | string) => request('DELETE', `/tiket/categories/${id}`),

  getBookings: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/tiket/bookings?${q}`);
  },
  updateBookingStatus: (id: string, status: string) => 
    request('PUT', `/tiket/bookings/${encodeURIComponent(id)}/status`, { status }),
  checkIn: (id: string) => request('PUT', `/tiket/bookings/${encodeURIComponent(id)}/checkin`),
  getStats: () => request('GET', '/tiket/stats'),
};

// ─── KOLEKSI ──────────────────────────────────────────────────────────────────
export const koleksiApi = {
  getAll: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/koleksi?${q}`);
  },
  getStats: () => request('GET', '/koleksi/stats'),
  add: (data: any) => request('POST', '/koleksi', data),
  update: (id: number | string, data: any) => request('PUT', `/koleksi/${id}`, data),
  delete: (id: number | string) => request('DELETE', `/koleksi/${id}`),
};

// ─── ULASAN ───────────────────────────────────────────────────────────────────
export const ulasanApi = {
  getAll: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/ulasan?${q}`);
  },
  reply: (id: number | string, reply: string) => request('POST', `/ulasan/${id}/reply`, { reply }),
  delete: (id: number | string) => request('DELETE', `/ulasan/${id}`),
};

// ─── INFORMASI ────────────────────────────────────────────────────────────────
export const informasiApi = {
  getPengumuman: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/informasi?${q}`);
  },
  addPengumuman: (data: any) => request('POST', '/informasi', data),
  updatePengumuman: (id: number | string, data: any) => request('PUT', `/informasi/${id}`, data),
  deletePengumuman: (id: number | string) => request('DELETE', `/informasi/${id}`),

  getFaq: () => request('GET', '/informasi/faq'),
  addFaq: (data: any) => request('POST', '/informasi/faq', data),
  updateFaq: (id: number | string, data: any) => request('PUT', `/informasi/faq/${id}`, data),
  deleteFaq: (id: number | string) => request('DELETE', `/informasi/faq/${id}`),

  getJamOperasional: () => request('GET', '/informasi/jam-operasional'),
  updateJamOperasional: (data: any) => request('PUT', '/informasi/jam-operasional', data),
};
