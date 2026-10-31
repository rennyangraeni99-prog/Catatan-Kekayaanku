import React from 'react';
import { ShieldCheck, ShieldAlert, Users, Database, Eye, UserCheck, Lock, Sparkles, Filter } from 'lucide-react';
import { UserProfile } from '../types/user';
import { formatRupiah } from '../utils/formatters';

interface SuperAdminBannerProps {
  isSuperAdmin: boolean;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
  viewAllUsers: boolean;
  onToggleViewAllUsers: (val: boolean) => void;
  allUsersList: UserProfile[];
  selectedUserFilter: string;
  onSelectUserFilter: (userId: string) => void;
  totalTransactionsCount: number;
  totalIncomeAll: number;
  totalExpenseAll: number;
}

export const SuperAdminBanner: React.FC<SuperAdminBannerProps> = ({
  isSuperAdmin,
  currentUserEmail,
  currentUserName,
  viewAllUsers,
  onToggleViewAllUsers,
  allUsersList,
  selectedUserFilter,
  onSelectUserFilter,
  totalTransactionsCount,
  totalIncomeAll,
  totalExpenseAll,
}) => {
  // If Super Admin is logged in
  if (isSuperAdmin) {
    const netWealthAll = totalIncomeAll - totalExpenseAll;

    return (
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-5 shadow-xl border border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-md">
              <Sparkles className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Super Administrator
                </span>
                <span className="text-xs text-stone-400">
                  {currentUserEmail}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Panel Kontrol Privasi & Multi-User Platform
              </h2>
            </div>
          </div>

          {/* Toggle between Personal View and All Users View */}
          <div className="flex items-center bg-stone-950/70 p-1.5 rounded-xl border border-stone-800 shrink-0">
            <button
              onClick={() => onToggleViewAllUsers(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                !viewAllUsers
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buku Kas Pribadi</span>
            </button>
            <button
              onClick={() => onToggleViewAllUsers(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewAllUsers
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Semua Pengguna Publik</span>
            </button>
          </div>
        </div>

        {/* Global Inspection Bar when viewAllUsers is active */}
        {viewAllUsers ? (
          <div className="mt-4 pt-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/80 p-3.5 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <Filter className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">Filter Berdasarkan Akun Pengguna:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserFilter}
                  onChange={(e) => onSelectUserFilter(e.target.value)}
                  className="bg-stone-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="ALL">Semua Pengguna ({allUsersList.length} terdaftar)</option>
                  {allUsersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email || u.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Platform Aggregate Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-200">
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pengguna Terdaftar</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white mt-1">
                  {allUsersList.length} <span className="text-xs font-normal text-stone-400">akun</span>
                </div>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Total Transaksi</span>
                </div>
                <div className="text-base sm:text-lg font-black text-sky-300 mt-1">
                  {totalTransactionsCount} <span className="text-xs font-normal text-stone-400">data</span>
                </div>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Pemasukan Publik</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-emerald-400 mt-1 truncate">
                  {formatRupiah(totalIncomeAll)}
                </div>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Akumulasi Saldo Bersih</span>
                </div>
                <div className={`text-xs sm:text-sm font-black mt-1 truncate ${netWealthAll >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                  {formatRupiah(netWealthAll)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-xs text-stone-300 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Saat ini menampilkan catatan pribadi Anda. Pengguna publik lain tidak dapat melihat transaksi Anda.
            </span>
          </div>
        )}
      </div>
    );
  }

  // Regular logged-in public user
  if (currentUserEmail) {
    return (
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-slate-900 to-teal-950 text-white p-4 shadow-md border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Privasi Aman & Terenkripsi
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Masuk sebagai: <strong>{currentUserName || currentUserEmail}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Data keuangan Anda terisolasi secara pribadi di Cloud Firestore. Pengguna publik lain tidak dapat melihat atau mengakses catatan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest / Offline user
  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-950/80 via-stone-900 to-amber-950/90 text-white p-4 shadow-md border border-orange-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-400/30">
            <Lock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                Mode Publik & Multi-User
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Setiap pengguna memiliki buku kas tersendiri yang terisolasi. Masuk dengan akun Google untuk sinkronisasi otomatis ke cloud dan menjaga privasi data Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
