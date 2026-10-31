export interface UserProfile {
  id: string; // Firebase UID or local user ID
  name: string;
  email: string;
  photoURL?: string;
  isGoogle: boolean;
  roleDescription?: string; // e.g. "Akun Pribadi", "Akun Bisnis / Toko", "Keuangan Keluarga"
  role?: 'super_admin' | 'user';
  lastActive: string;
}

export const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Buku Kas Utama',
  email: 'lokal@catatankekayaan.app',
  isGoogle: false,
  roleDescription: 'Akun Lokal (Offline)',
  lastActive: new Date().toISOString(),
};
