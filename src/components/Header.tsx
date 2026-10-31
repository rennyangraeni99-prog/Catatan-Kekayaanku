import React from 'react';
import { PlusCircle, BarChart3, FileText, ArrowLeftRight, Coins, Search, Cloud, Users, ChevronDown, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types/user';

interface HeaderProps {
  activeTab: 'transaksi' | 'laporan' | 'statistik';
  setActiveTab: (tab: 'transaksi' | 'laporan' | 'statistik') => void;
  onOpenNewTransaction: () => void;
  onOpenGoogleDrive: () => void;
  onOpenUserModal: () => void;
  onLogout?: () => void;
  activeUser: UserProfile;
  totalUsersCount: number;
  currentUser: User | null;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenGoogleDrive,
  onOpenUserModal,
  onLogout,
  activeUser,
  totalUsersCount,
  currentUser,
  searchQuery = '',
  onSearchChange,
}) => {
  return (
    <header className="w-full">
      {/* Floating Orange Capsule Header matching the reference image */}
      <div className="bg-[#FF6A00] bg-gradient-to-r from-[#FF6B00] via-[#FA5E00] to-[#F15300] rounded-2xl sm:rounded-full px-4 sm:px-8 py-3.5 shadow-md text-white flex flex-wrap items-center justify-between gap-4 transition-all">
        {/* Zone 1: Logo Wordmark "Catatan Kekayaanku" */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs text-white flex items-center justify-center font-black">
            <Coins className="w-5 h-5 text-amber-200" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
            Catatan Kekayaanku
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-3 order-3 sm:order-2">
          <button
            onClick={() => setActiveTab('transaksi')}
            className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'transaksi'
                ? 'bg-white text-[#FF6A00] shadow-sm'
                : 'text-white/90 hover:text-white hover:bg-white/15'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Daftar Transaksi</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'laporan'
                ? 'bg-white text-[#FF6A00] shadow-sm'
                : 'text-white/90 hover:text-white hover:bg-white/15'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan Bulanan</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('statistik')}
            className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'statistik'
                ? 'bg-white text-[#FF6A00] shadow-sm'
                : 'text-white/90 hover:text-white hover:bg-white/15'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Grafik Statistik</span>
            </span>
          </button>
        </nav>

        {/* Zone 3: Multi-User Switcher, Google Drive, Search & Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 order-2 sm:order-3">
          {onSearchChange && (
            <div className="relative hidden xl:block">
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-32 lg:w-36 pl-3 pr-8 py-1.5 text-xs rounded-full bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/80 shadow-inner"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          )}

          {/* User Account Switcher Button */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-full bg-white/20 hover:bg-white/30 text-white transition shadow-xs whitespace-nowrap shrink-0"
            title="Ganti atau Tambah Akun Pengguna"
          >
            {activeUser.photoURL ? (
              <img
                src={activeUser.photoURL}
                alt={activeUser.name}
                className="w-4 h-4 rounded-full border border-white shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Users className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            )}
            <span className="max-w-[80px] sm:max-w-[110px] truncate font-bold">
              {activeUser.name}
            </span>
            <span className="text-[10px] bg-white/30 px-1.5 py-0.2 rounded-full font-bold">
              {totalUsersCount}
            </span>
            <ChevronDown className="w-3 h-3 text-white/80" />
          </button>

          {/* Google Drive Button */}
          <button
            onClick={onOpenGoogleDrive}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-full transition shadow-xs whitespace-nowrap shrink-0 ${
              currentUser
                ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title="Kelola Cadangan di Google Drive"
          >
            <Cloud className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-600' : 'text-white'}`} />
            <span className="hidden sm:inline">Drive</span>
            {currentUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Logout Button if onLogout is provided */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-full bg-black/20 hover:bg-black/35 text-white/95 transition shadow-xs whitespace-nowrap shrink-0"
              title="Keluar dari akun dan kunci aplikasi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          )}

          {/* + Catat Action */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-[#FF6A00] bg-white hover:bg-amber-50 active:scale-95 rounded-full transition shadow-xs whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#FF6A00]" />
            <span>+ Catat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
