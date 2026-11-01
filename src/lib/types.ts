export type Role = "ADMIN" | "SUPERADMIN" | "STAFF" | "USER";

export interface User {
  id: number | string;
  nama: string;
  email: string;
  username?: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    nama: string;
    username?: string;
    email?: string;
    role?: Role;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: Role;
}

