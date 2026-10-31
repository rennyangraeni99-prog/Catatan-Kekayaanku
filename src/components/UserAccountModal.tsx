import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Check,
  LogOut,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile } from '../types/user';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  activeUserId: string;
  onSwitchUser: (userId: string) => void;
  onAddNewGoogleUser: () => Promise<void>;
  onCreateLocalUser: (name: string, roleDescription: string) => void;
  onDeleteUser: (userId: string) => void;
  onLogoutGoogle: () => void;
  isLoggingIn: boolean;
  getUserTransactionCount: (userId: string) => number;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSwitchUser,
  onAddNewGoogleUser,
  onCreateLocalUser,
  onDeleteUser,
  onLogoutGoogle,
  isLoggingIn,
  getUserTransactionCount,
}) => {
  const [showAddLocalForm, setShowAddLocalForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Akun Pribadi');
  const [targetUserToDelete, setTargetUserToDelete] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const handleCreateLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    onCreateLocalUser(newUserName.trim(), newUserRole);
    setNewUserName('');
    setNewUserRole('Akun Pribadi');
    setShowAddLocalForm(false);
  };

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FF6A00] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Kelola Akun & Multi-Pengguna
              </h3>
              <p className="text-[11px] text-white/80">
                Pindah akun, tambah pengguna baru, atau hapus akun yang tidak terpakai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active User Highlight Banner */}
          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {activeUser.photoURL ? (
                  <img
                    src={activeUser.photoURL}
                    alt={activeUser.name}
                    className="w-12 h-12 rounded-full border-2 border-[#FF6A00]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#FF6A00] text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                      Akun Sedang Aktif
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-extrabold text-[#2D2B2A] truncate">
                    {activeUser.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {activeUser.email} · <span className="font-mono">{getUserTransactionCount(activeUser.id)} transaksi</span>
                  </p>
                </div>
              </div>

              {/* Action buttons on active banner */}
              <div className="flex items-center gap-1.5 shrink-0">
                {activeUser.isGoogle && (
                  <button
                    onClick={onLogoutGoogle}
                    title="Keluar dari sesi Google ini"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-100 rounded-full transition shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                )}
                <button
                  onClick={() => setTargetUserToDelete(activeUser)}
                  title="Hapus akun aktif ini beserta datanya"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-full transition shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Akun</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row: Add Google Account or Add Local Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button 1: Add/Switch Google Account */}
            <button
              onClick={async () => {
                await onAddNewGoogleUser();
              }}
              disabled={isLoggingIn}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border-2 border-dashed border-stone-300 hover:border-[#FF6A00] hover:bg-orange-50/40 text-stone-800 text-xs font-bold transition shadow-xs group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? 'Membuka Google...' : '+ Masuk Akun Google Lain'}</span>
            </button>

            {/* Button 2: Add Local Profile (e.g. Toko/Bisnis/Keluarga) */}
            <button
              onClick={() => setShowAddLocalForm(!showAddLocalForm)}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border-2 border-dashed border-stone-300 hover:border-[#FF6A00] hover:bg-orange-50/40 text-stone-800 text-xs font-bold transition shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-[#FF6A00]" />
              <span>{showAddLocalForm ? 'Tutup Formulir' : '+ Tambah Profil Baru'}</span>
            </button>
          </div>

          {/* Form to Add Local Profile */}
          {showAddLocalForm && (
            <form onSubmit={handleCreateLocalSubmit} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <h5 className="text-xs font-extrabold text-[#2D2B2A]">
                Buat Profil Pembukuan Baru
              </h5>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Nama Profil (Contoh: Usaha Kuliner, Keuangan Pribadi, Tabungan Rumah)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-full bg-white border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-full bg-white border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                >
                  <option value="Akun Pribadi">Akun Pribadi</option>
                  <option value="Akun Bisnis / Toko">Akun Bisnis / Toko</option>
                  <option value="Keuangan Keluarga">Keuangan Keluarga</option>
                  <option value="Tabungan Proyek / Impian">Tabungan Proyek / Impian</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddLocalForm(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#FA5E00] rounded-full transition shadow-xs"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          )}

          {/* Registered Users List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                Daftar Semua Akun ({users.length})
              </h4>
              <span className="text-[11px] text-stone-400">
                Klik akun untuk beralih atau ikon tempat sampah untuk menghapus
              </span>
            </div>

            <div className="space-y-2">
              {users.map((u) => {
                const isActive = u.id === activeUserId;
                const trxCount = getUserTransactionCount(u.id);

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-amber-50/70 border-[#FF6A00] ring-1 ring-[#FF6A00]'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    {/* User Info / Click to switch */}
                    <button
                      onClick={() => {
                        if (!isActive) {
                          onSwitchUser(u.id);
                          onClose();
                        }
                      }}
                      className="flex items-center gap-3 min-w-0 text-left flex-1"
                    >
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.name}
                          className="w-10 h-10 rounded-full border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 font-extrabold flex items-center justify-center shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#2D2B2A] truncate">
                            {u.name}
                          </span>
                          {u.isGoogle ? (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200">
                              Google
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.2 rounded-full">
                              Lokal
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {u.email} · <span className="font-mono">{trxCount} transaksi</span>
                        </p>
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSwitchUser(u.id);
                            onClose();
                          }}
                          className="px-3 py-1 text-xs font-bold text-[#FF6A00] bg-orange-50 hover:bg-orange-100 rounded-full transition"
                        >
                          Pilih
                        </button>
                      )}

                      {/* Delete button (available for all accounts) */}
                      <button
                        onClick={() => setTargetUserToDelete(u)}
                        title={`Hapus akun "${u.name}"`}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Setiap akun memiliki pembukuan mandiri terisolasi</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-full transition"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting a Profile */}
      {targetUserToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#FFFDF9] rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-[#2D2B2A]">
                Hapus Akun & Catatan?
              </h4>
              <p className="text-xs text-stone-600">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-stone-900">"{targetUserToDelete.name}"</span>?
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl text-[11px] text-rose-700 space-y-1">
              <p className="font-bold">Perhatian:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Total <strong>{getUserTransactionCount(targetUserToDelete.id)} data transaksi</strong> pada akun ini akan dihapus dari peramban.</li>
                {targetUserToDelete.id === activeUserId && (
                  <li>Akun ini sedang aktif; peramban akan otomatis dialihkan ke akun lain setelah dihapus.</li>
                )}
                {users.length === 1 && (
                  <li>Ini adalah satu-satunya akun; akun akan direset kembali bersih ke Buku Kas Utama default.</li>
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTargetUserToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-full transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const id = targetUserToDelete.id;
                  setTargetUserToDelete(null);
                  onDeleteUser(id);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#E05345] hover:bg-rose-700 rounded-full shadow-md transition"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
