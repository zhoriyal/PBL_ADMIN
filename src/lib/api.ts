import { AUTH_TOKEN_COOKIE } from "./auth-constants";

/**
 * API Client untuk Admin Next.js
 */

export const OFFLINE_MOCK_TOKEN = 'offline-mock-token';

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL belum dikonfigurasi');
  }
  return baseUrl.replace(/\/+$/, '');
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
    res = await fetch(`${getApiBaseUrl()}${path}`, options);
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
    request<LoginResponse>('POST', '/api/auth/login', { username, password }),
  register: (data: { nama: string; email: string; password: string; role?: string }) => 
    request('POST', '/api/auth/register', data),
  logout: () => request('POST', '/api/auth/logout'),
  me: () => request('GET', '/api/auth/me'),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => request('GET', '/api/dashboard/summary'),
};

// ─── TIKET ───────────────────────────────────────────────────────────────────
export const tiketApi = {
  getCategories: () => request('GET', '/api/tiket/categories'),
  addCategory: (data: any) => request('POST', '/api/tiket/categories', data),
  updateCategory: (id: number | string, data: any) => request('PUT', `/api/tiket/categories/${id}`, data),
  deleteCategory: (id: number | string) => request('DELETE', `/api/tiket/categories/${id}`),

  getBookings: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/tiket/bookings?${q}`);
  },
  updateBookingStatus: (id: string, status: string) => 
    request('PUT', `/api/tiket/bookings/${encodeURIComponent(id)}/status`, { status }),
  checkIn: (id: string) => request('PUT', `/api/tiket/bookings/${encodeURIComponent(id)}/checkin`),
  getStats: () => request('GET', '/api/tiket/stats'),
};

// ─── KOLEKSI ──────────────────────────────────────────────────────────────────
export const koleksiApi = {
  getAll: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/koleksi?${q}`);
  },
  getStats: () => request('GET', '/api/koleksi/stats'),
  add: (data: any) => request('POST', '/api/koleksi', data),
  update: (id: number | string, data: any) => request('PUT', `/api/koleksi/${id}`, data),
  delete: (id: number | string) => request('DELETE', `/api/koleksi/${id}`),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  generateDescription: (data: { title: string; category: string }) =>
    request<{ description: string }>('POST', '/api/ai/generate-description', data),
};

// ─── ULASAN ───────────────────────────────────────────────────────────────────
export const ulasanApi = {
  getAll: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/ulasan?${q}`);
  },
  reply: (id: number | string, reply: string) => request('PUT', `/api/ulasan/${id}/reply`, { reply }),
  delete: (id: number | string) => request('DELETE', `/api/ulasan/${id}`),
};

// ─── INFORMASI ────────────────────────────────────────────────────────────────
export const informasiApi = {
  getPengumuman: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/informasi?${q}`);
  },
  addPengumuman: (data: any) => request('POST', '/api/informasi', data),
  updatePengumuman: (id: number | string, data: any) => request('PUT', `/api/informasi/${id}`, data),
  deletePengumuman: (id: number | string) => request('DELETE', `/api/informasi/${id}`),

  getFaq: () => request('GET', '/api/informasi/faq'),
  addFaq: (data: any) => request('POST', '/api/informasi/faq', data),
  updateFaq: (id: number | string, data: any) => request('PUT', `/api/informasi/faq/${id}`, data),
  deleteFaq: (id: number | string) => request('DELETE', `/api/informasi/faq/${id}`),

  getJamOperasional: () => request('GET', '/api/informasi/jam-operasional'),
  updateJamOperasional: (data: any) => request('PUT', '/api/informasi/jam-operasional', data),
};
