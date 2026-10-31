import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Transaction } from './types/finance';
import { UserProfile, DEFAULT_GUEST_PROFILE } from './types/user';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { calculateMonthlySummary } from './utils/formatters';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { Header } from './components/Header';
import { HeroWealthSection } from './components/HeroWealthSection';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { MonthlyReportView } from './components/MonthlyReportView';
import { StatisticsChartsView } from './components/StatisticsChartsView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { UserAccountModal } from './components/UserAccountModal';
import { CheckCircle2, RotateCcw, Coins, Cloud, Users } from 'lucide-react';

const USERS_STORAGE_KEY = 'catatan_kekayaanku_users_v2';
const ACTIVE_USER_ID_KEY = 'catatan_kekayaanku_active_uid_v2';

export default function App() {
  // Registered profiles list
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load users list', e);
    }
    return [DEFAULT_GUEST_PROFILE];
  });

  // Active user ID
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_USER_ID_KEY);
      if (savedId) return savedId;
    } catch (e) {
      console.error('Failed to load active user ID', e);
    }
    return DEFAULT_GUEST_PROFILE.id;
  });

  // Active user profile object
  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || users[0] || DEFAULT_GUEST_PROFILE;
  }, [users, activeUserId]);

  // Load transactions for currently active user
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const storageKey = `catatan_kekayaanku_trx_${activeUserId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      // If default guest user and no previous data, load sample data
      if (activeUserId === DEFAULT_GUEST_PROFILE.id) {
        return INITIAL_TRANSACTIONS;
      }
    } catch (e) {
      console.error('Failed to load user transactions', e);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'transaksi' | 'laporan' | 'statistik'>('transaksi');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Google Drive & Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Persist users list
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users list', e);
    }
  }, [users]);

  // Persist active user ID
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_USER_ID_KEY, activeUserId);
    } catch (e) {
      console.error('Failed to save active user id', e);
    }
  }, [activeUserId]);

  // Persist current transactions to the active user's storage key
  useEffect(() => {
    try {
      const storageKey = `catatan_kekayaanku_trx_${activeUserId}`;
      localStorage.setItem(storageKey, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save user transactions', e);
    }
  }, [transactions, activeUserId]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);

        // Auto-register or update Google User Profile
        setUsers((prev) => {
          const exists = prev.find((u) => u.id === user.uid);
          if (exists) {
            return prev.map((u) =>
              u.id === user.uid
                ? {
                    ...u,
                    name: user.displayName || u.name,
                    email: user.email || u.email,
                    photoURL: user.photoURL || u.photoURL,
                    lastActive: new Date().toISOString(),
                  }
                : u
            );
          } else {
            const newProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Pengguna Google',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              isGoogle: true,
              roleDescription: 'Akun Google Cloud',
              lastActive: new Date().toISOString(),
            };
            return [...prev, newProfile];
          }
        });

        // Switch to this user if not already
        setActiveUserId(user.uid);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // When switching user, reload transactions for that user
  const handleSwitchUser = useCallback((newUserId: string) => {
    setActiveUserId(newUserId);
    try {
      const storageKey = `catatan_kekayaanku_trx_${newUserId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTransactions(parsed);
          showToast(`Beralih ke akun "${users.find((u) => u.id === newUserId)?.name || newUserId}"`);
          return;
        }
      }
      if (newUserId === DEFAULT_GUEST_PROFILE.id) {
        setTransactions(INITIAL_TRANSACTIONS);
      } else {
        setTransactions([]);
      }
      showToast(`Beralih ke akun "${users.find((u) => u.id === newUserId)?.name || newUserId}"`);
    } catch (e) {
      console.error('Error switching user', e);
    }
  }, [users]);

  // Handle adding a new Google User (prompts Google account selector)
  const handleAddNewGoogleUser = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);

        const newProfile: UserProfile = {
          id: res.user.uid,
          name: res.user.displayName || res.user.email?.split('@')[0] || 'Pengguna Google',
          email: res.user.email || '',
          photoURL: res.user.photoURL || undefined,
          isGoogle: true,
          roleDescription: 'Akun Google Cloud',
          lastActive: new Date().toISOString(),
        };

        setUsers((prev) => {
          const exists = prev.find((u) => u.id === res.user.uid);
          if (exists) {
            return prev.map((u) => (u.id === res.user.uid ? newProfile : u));
          }
          return [...prev, newProfile];
        });

        handleSwitchUser(res.user.uid);
        setIsUserModalOpen(false);
        showToast(`Berhasil masuk sebagai ${newProfile.name} (${newProfile.email})!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal masuk akun Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Create custom local profile
  const handleCreateLocalUser = (name: string, roleDescription: string) => {
    const newId = `user_local_${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@lokal.app`,
      isGoogle: false,
      roleDescription,
      lastActive: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newProfile]);
    setActiveUserId(newId);
    setTransactions([]);
    showToast(`Profil baru "${name}" berhasil dibuat dan diaktifkan.`);
  };

  // Delete profile (supports deleting any profile, including active and last one)
  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const targetName = targetUser?.name || 'Akun';

    // If it's a Google account, sign out Google session if currently signed in
    if (targetUser?.isGoogle && currentUser?.uid === userId) {
      try {
        await logout();
      } catch (e) {
        console.error('Error logging out during account deletion', e);
      }
      setCurrentUser(null);
      setAccessToken(null);
    }

    // Remove local storage transactions for this user
    try {
      localStorage.removeItem(`catatan_kekayaanku_trx_${userId}`);
    } catch (e) {
      console.error(e);
    }

    const remainingUsers = users.filter((u) => u.id !== userId);

    if (remainingUsers.length === 0) {
      // If the last remaining account is deleted, reset to a clean default guest profile
      const freshGuest: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        lastActive: new Date().toISOString(),
      };
      setUsers([freshGuest]);
      setActiveUserId(freshGuest.id);
      setTransactions([]);
      try {
        localStorage.removeItem(`catatan_kekayaanku_trx_${freshGuest.id}`);
      } catch (e) {
        console.error(e);
      }
      showToast(`Akun "${targetName}" berhasil dihapus. Profil telah direset ke Buku Kas Utama.`);
    } else {
      setUsers(remainingUsers);
      if (activeUserId === userId) {
        const nextUser = remainingUsers[0];
        handleSwitchUser(nextUser.id);
      }
      showToast(`Akun "${targetName}" berhasil dihapus beserta seluruh catatannya.`);
    }
  };

  // Sign out Google session
  const handleLogoutGoogle = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    showToast('Berhasil keluar dari sesi Google.');
  };

  // Count transactions for a given user ID
  const getUserTransactionCount = useCallback((userId: string): number => {
    if (userId === activeUserId) return transactions.length;
    try {
      const storageKey = `catatan_kekayaanku_trx_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.length;
      }
      if (userId === DEFAULT_GUEST_PROFILE.id) return INITIAL_TRANSACTIONS.length;
    } catch (e) {}
    return 0;
  }, [activeUserId, transactions.length]);

  // Derived available months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add('2026-10');
    monthsSet.add('2026-09');
    monthsSet.add('2026-08');
    transactions.forEach((t) => {
      if (t.bulan) monthsSet.add(t.bulan);
    });
    return Array.from(monthsSet).sort().reverse();
  }, [transactions]);

  const currentSummary = useMemo(() => {
    return calculateMonthlySummary(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const previousSummary = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    return calculateMonthlySummary(transactions, prevMonthStr);
  }, [transactions, selectedMonth]);

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (trx: Transaction) => {
    setEditingTransaction(trx);
    setIsFormOpen(true);
  };

  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    if (editId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editId
            ? { ...t, ...data }
            : t
        )
      );
      showToast('Transaksi berhasil diperbarui.');
    } else {
      const newTrx: Transaction = {
        ...data,
        id: `trx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTrx, ...prev]);
      if (newTrx.bulan && newTrx.bulan !== selectedMonth) {
        setSelectedMonth(newTrx.bulan);
      }
      showToast(`Transaksi baru dicatat di akun ${activeUser.name}!`);
    }
  };

  const handleDeletePrompt = (id: string) => {
    const trx = transactions.find((t) => t.id === id);
    if (trx) {
      setDeletingTransaction(trx);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingTransaction) {
      setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id));
      showToast('Transaksi telah dihapus.');
      setDeletingTransaction(null);
    }
  };

  const handleResetToDemo = () => {
    if (window.confirm(`Reset data catatan transaksi untuk akun "${activeUser.name}" ke contoh awal?`)) {
      setTransactions(INITIAL_TRANSACTIONS);
      setSelectedMonth('2026-10');
      showToast('Data berhasil dikembalikan ke contoh awal.');
    }
  };

  const handleRestoreTransactions = (restored: Transaction[]) => {
    setTransactions(restored);
    if (restored.length > 0 && restored[0].bulan) {
      setSelectedMonth(restored[0].bulan);
    }
    showToast(`Data transaksi berhasil dipulihkan (${restored.length} data) untuk akun ${activeUser.name}!`);
  };

  return (
    <div className="min-h-screen bg-[#F06553] p-2.5 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#2D2B2A] text-white text-xs font-bold rounded-full shadow-2xl border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Stylized Canvas Card */}
      <div className="w-full max-w-[1400px] bg-[#FFFBF5] rounded-3xl sm:rounded-[2.5rem] shadow-2xl border-4 border-white/60 p-4 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col gap-6 sm:gap-8 my-auto">
        {/* Floating Orange Capsule Top Bar with Multi-User & Google Drive Switcher */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewTransaction={handleOpenNewTransaction}
          onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
          onOpenUserModal={() => setIsUserModalOpen(true)}
          activeUser={activeUser}
          totalUsersCount={users.length}
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* User Scope Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-stone-100/80 rounded-2xl border border-stone-200/60 text-xs">
          <div className="flex items-center gap-2 text-stone-700 font-semibold">
            <Users className="w-4 h-4 text-[#FF6A00]" />
            <span>Sedang melihat pembukuan:</span>
            <span className="font-extrabold text-[#2D2B2A] bg-white px-2.5 py-0.5 rounded-full border border-stone-200 shadow-2xs">
              {activeUser.name}
            </span>
            <span className="text-stone-400">({activeUser.roleDescription || activeUser.email})</span>
          </div>

          <button
            onClick={() => setIsUserModalOpen(true)}
            className="text-[11px] font-bold text-[#FF6A00] hover:text-[#FA5E00] hover:underline flex items-center gap-1"
          >
            <span>Ganti Akun ({users.length} terdaftar)</span>
          </button>
        </div>

        {/* Hero Section */}
        {activeTab === 'transaksi' && (
          <HeroWealthSection
            onQuickSave={handleSaveTransaction}
            selectedMonth={selectedMonth}
          />
        )}

        {/* Monthly Summary KPI Banner */}
        <section aria-label="Ringkasan Finansial Bulanan">
          <MonthlySummaryCards
            currentSummary={currentSummary}
            previousSummary={previousSummary}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableMonths={availableMonths}
          />
        </section>

        {/* Dynamic Tab Body */}
        {activeTab === 'transaksi' && (
          <section aria-label="Daftar Catatan Transaksi">
            <TransactionTable
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeletePrompt}
              onOpenNewTransaction={handleOpenNewTransaction}
              onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </section>
        )}

        {activeTab === 'laporan' && (
          <section aria-label="Laporan Bulanan">
            <MonthlyReportView
              summary={currentSummary}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
              transactions={transactions}
            />
          </section>
        )}

        {activeTab === 'statistik' && (
          <section aria-label="Grafik Statistik Transaksi">
            <StatisticsChartsView
              transactions={transactions}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
            />
          </section>
        )}

        {/* Custom Footer */}
        <footer className="pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 no-print">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FF6A00]" />
            <span className="font-extrabold text-[#2D2B2A]">Catatan Kekayaanku</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Akun & Sinkronisasi Google Drive</span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 text-stone-600 hover:text-[#FF6A00] transition"
              title="Kelola akun pengguna"
            >
              <Users className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Kelola Akun ({users.length})</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="flex items-center gap-1.5 text-stone-600 hover:text-[#FF6A00] transition"
              title="Buka cadangan Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Drive</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetToDemo}
              className="flex items-center gap-1.5 text-stone-600 hover:text-[#FF6A00] transition"
              title="Kembalikan data ke contoh awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Akun</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Multi-User Account Switcher Modal */}
      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onAddNewGoogleUser={handleAddNewGoogleUser}
        onCreateLocalUser={handleCreateLocalUser}
        onDeleteUser={handleDeleteUser}
        onLogoutGoogle={handleLogoutGoogle}
        isLoggingIn={isLoggingIn}
        getUserTransactionCount={getUserTransactionCount}
      />

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        transactions={transactions}
        onRestoreTransactions={handleRestoreTransactions}
        currentUser={currentUser}
        accessToken={accessToken}
        onAuthSuccess={(user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
        }}
        onLogout={() => {
          setCurrentUser(null);
          setAccessToken(null);
        }}
        selectedMonth={selectedMonth}
      />

      {/* Transaction Create / Edit Modal */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultMonth={selectedMonth}
      />

      {/* Delete Transaction Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        transaction={deletingTransaction}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTransaction(null)}
      />
    </div>
  );
}
