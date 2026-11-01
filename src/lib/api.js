/**
 * API Client untuk Admin Next.js
 * Terhubung ke backend Express.js di http://localhost:3001
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) => request('POST', '/auth/login', { username, password }),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => request('GET', '/dashboard/summary'),
};

// ─── TIKET ───────────────────────────────────────────────────────────────────
export const tiketApi = {
  // Kategori
  getCategories: () => request('GET', '/tiket/categories'),
  addCategory: (data) => request('POST', '/tiket/categories', data),
  updateCategory: (id, data) => request('PUT', `/tiket/categories/${id}`, data),
  deleteCategory: (id) => request('DELETE', `/tiket/categories/${id}`),

  // Pemesanan
  getBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/tiket/bookings?${q}`);
  },
  updateBookingStatus: (id, status) => request('PUT', `/tiket/bookings/${encodeURIComponent(id)}/status`, { status }),
  checkIn: (id) => request('PUT', `/tiket/bookings/${encodeURIComponent(id)}/checkin`),
  getStats: () => request('GET', '/tiket/stats'),
};

// ─── KOLEKSI ──────────────────────────────────────────────────────────────────
export const koleksiApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/koleksi?${q}`);
  },
  getStats: () => request('GET', '/koleksi/stats'),
  add: (data) => request('POST', '/koleksi', data),
  update: (id, data) => request('PUT', `/koleksi/${id}`, data),
  delete: (id) => request('DELETE', `/koleksi/${id}`),
};

// ─── ULASAN ───────────────────────────────────────────────────────────────────
export const ulasanApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/ulasan?${q}`);
  },
  reply: (id, reply) => request('POST', `/ulasan/${id}/reply`, { reply }),
  delete: (id) => request('DELETE', `/ulasan/${id}`),
};

// ─── INFORMASI ────────────────────────────────────────────────────────────────
export const informasiApi = {
  // Pengumuman
  getPengumuman: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/informasi?${q}`);
  },
  addPengumuman: (data) => request('POST', '/informasi', data),
  updatePengumuman: (id, data) => request('PUT', `/informasi/${id}`, data),
  deletePengumuman: (id) => request('DELETE', `/informasi/${id}`),

  // FAQ
  getFaq: () => request('GET', '/informasi/faq'),
  addFaq: (data) => request('POST', '/informasi/faq', data),
  updateFaq: (id, data) => request('PUT', `/informasi/faq/${id}`, data),
  deleteFaq: (id) => request('DELETE', `/informasi/faq/${id}`),

  // Jam Operasional
  getJamOperasional: () => request('GET', '/informasi/jam-operasional'),
  updateJamOperasional: (data) => request('PUT', '/informasi/jam-operasional', data),
};
