export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email wajib diisi.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "Format email tidak valid. Gunakan format nama@domain.com.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password wajib diisi.";
  }
  if (password.length < 8) {
    return "Password minimal terdiri dari 8 karakter.";
  }
  return null;
}

export function validateRegisterInput(data: {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.nama.trim()) {
    errors.nama = "Nama lengkap wajib diisi.";
  }

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passError = validatePassword(data.password);
  if (passError) {
    errors.password = passError;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Konfirmasi password tidak cocok dengan password.";
  }

  return errors;
}
