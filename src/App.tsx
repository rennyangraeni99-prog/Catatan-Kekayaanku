import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Transaction } from './types/finance';
import { UserProfile, DEFAULT_GUEST_PROFILE } from './types/user';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { calculateMonthlySummary } from './utils/formatters';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import {
  testConnection,
  isUserSuperAdmin,
  saveUserProfileToFirestore,
  fetchAllUsersForSuperAdmin,
  subscribeTransactions,
  saveTransaction,
  deleteTransaction,
  syncLocalTransactionsToFirestore,
} from './services/firestoreService';
import { Header } from './components/Header';
import { SuperAdminBanner } from './components/SuperAdminBanner';
import { HeroWealthSection } from './components/HeroWealthSection';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { MonthlyReportView } from './components/MonthlyReportView';
import { StatisticsChartsView } from './components/StatisticsChartsView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { UserAccountModal } from './components/UserAccountModal';
import { LoginPage } from './components/LoginPage';
import { CheckCircle2, RotateCcw, Coins, Cloud, Users, UploadCloud } from 'lucide-react';

const USERS_STORAGE_KEY = 'catatan_kekayaanku_users_v2';
const ACTIVE_USER_ID_KEY = 'catatan_kekayaanku_active_uid_v2';

export default function App() {
  // Registered profiles list (local cache)
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
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Super Admin & Privacy states
  const [viewAllUsers, setViewAllUsers] = useState<boolean>(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);

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
    }, 3500);
  };

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Determine if active session is Super Admin
  const isSuperAdmin = useMemo(() => {
    return isUserSuperAdmin(currentUser) || isUserSuperAdmin(activeUser);
  }, [currentUser, activeUser]);

  // Persist users list locally
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users list', e);
    }
  }, [users]);

  // Persist active user ID locally
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_USER_ID_KEY, activeUserId);
    } catch (e) {
      console.error('Failed to save active user id', e);
    }
  }, [activeUserId]);

  // Persist current transactions to active user's local cache
  useEffect(() => {
    try {
      const storageKey = `catatan_kekayaanku_trx_${activeUserId}`;
      localStorage.setItem(storageKey, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save user transactions', e);
    }
  }, [transactions, activeUserId]);

  // Fetch all registered users if Super Admin
  useEffect(() => {
    if (isSuperAdmin && currentUser) {
      fetchAllUsersForSuperAdmin()
        .then((list) => {
          if (list && list.length > 0) {
            setAllUsersList(list);
          }
        })
        .catch((err) => {
          console.warn('Super Admin users fetch note:', err);
        });
    }
  }, [isSuperAdmin, currentUser]);

  // Real-time Firestore synchronization for logged-in user
  useEffect(() => {
    if (!currentUser) return;

    // Save profile to Firestore
    const profile: UserProfile = {
      id: currentUser.uid,
      name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Pengguna',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || undefined,
      isGoogle: true,
      role: isSuperAdmin ? 'super_admin' : 'user',
      roleDescription: isSuperAdmin ? 'Super Administrator' : 'Pengguna Publik',
      lastActive: new Date().toISOString(),
    };
    saveUserProfileToFirestore(profile);

    // Subscribe to Firestore transactions
    const unsub = subscribeTransactions(
      currentUser.uid,
      isSuperAdmin,
      viewAllUsers,
      selectedUserFilter,
      (cloudTxs) => {
        setTransactions(cloudTxs);
      },
      (err) => {
        console.warn('Realtime subscription notice:', err);
      }
    );

    return () => unsub();
  }, [currentUser, isSuperAdmin, viewAllUsers, selectedUserFilter]);

  // Listen to Firebase Auth state
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = initAuth(
      (user, token) => {
        if (!isMounted) return;
        setCurrentUser(user);
        setAccessToken(token);
        setAuthLoading(false);
        setLoginError(null);

        if (user) {
          // Auto-register or update Google User Profile
          setUsers((prev) => {
            const exists = prev.find((u) => u.id === user.uid);
            const isSuper = isUserSuperAdmin(user);
            const userObj: UserProfile = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Pengguna Google',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              isGoogle: true,
              role: isSuper ? 'super_admin' : 'user',
              roleDescription: isSuper ? 'Super Administrator' : 'Pengguna Publik',
              lastActive: new Date().toISOString(),
            };

            if (exists) {
              return prev.map((u) => (u.id === user.uid ? userObj : u));
            }
            return [...prev, userObj];
          });

          // Switch to this user
          setActiveUserId(user.uid);
        }
      },
      () => {
        if (!isMounted) return;
        setCurrentUser(null);
        setAccessToken(null);
        setAuthLoading(false);
      }
    );

    // Fallback safety timeout so applet is never frozen on loading splash
    const timer = setTimeout(() => {
      if (isMounted) {
        setAuthLoading(false);
      }
    }, 1800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // When switching user, reload transactions for that user
  const handleSwitchUser = useCallback(
    (newUserId: string) => {
      setActiveUserId(newUserId);
      setViewAllUsers(false);
      setSelectedUserFilter('ALL');
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
    },
    [users]
  );

  // Handle adding a new Google User
  const handleAddNewGoogleUser = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);

        const isSuper = isUserSuperAdmin(res.user);
        const newProfile: UserProfile = {
          id: res.user.uid,
          name: res.user.displayName || res.user.email?.split('@')[0] || 'Pengguna Google',
          email: res.user.email || '',
          photoURL: res.user.photoURL || undefined,
          isGoogle: true,
          role: isSuper ? 'super_admin' : 'user',
          roleDescription: isSuper ? 'Super Administrator' : 'Pengguna Publik',
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
        showToast(
          isSuper
            ? `Selamat datang Super Administrator (${newProfile.email})!`
            : `Berhasil masuk sebagai ${newProfile.name} (${newProfile.email})! Data Anda tersimpan aman dan terisolasi.`
        );
      }
    } catch (err: any) {
      const msg =
        err?.code === 'auth/popup-closed-by-user'
          ? 'Jendela login Google ditutup sebelum selesai. Silakan coba lagi.'
          : err?.message || 'Gagal masuk akun Google.';
      setLoginError(msg);
      showToast(msg);
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

  // Delete profile
  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const targetName = targetUser?.name || 'Akun';

    if (targetUser?.isGoogle && currentUser?.uid === userId) {
      try {
        await logout();
      } catch (e) {
        console.error('Error logging out during account deletion', e);
      }
      setCurrentUser(null);
      setAccessToken(null);
    }

    try {
      localStorage.removeItem(`catatan_kekayaanku_trx_${userId}`);
    } catch (e) {
      console.error(e);
    }

    const remainingUsers = users.filter((u) => u.id !== userId);

    if (remainingUsers.length === 0) {
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

  // Sign out Google session and return user to mandatory LoginPage
  const handleLogoutGoogle = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setAccessToken(null);
    setViewAllUsers(false);
    setIsUserModalOpen(false);
    showToast('Berhasil keluar. Halaman kini terkunci.');
  };

  // Count transactions for a given user ID
  const getUserTransactionCount = useCallback(
    (userId: string): number => {
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
    },
    [activeUserId, transactions.length]
  );

  // Sync local data to Firestore if logged in
  const handleSyncToFirestore = async () => {
    if (!currentUser) {
      showToast('Silakan masuk dengan Google terlebih dahulu untuk menyinkronkan.');
      return;
    }
    const count = await syncLocalTransactionsToFirestore(transactions, activeUser);
    showToast(`Berhasil menyinkronkan ${count} transaksi ke Cloud Firestore!`);
  };

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

  // Aggregate values for Super Admin platform view
  const totalIncomeAll = useMemo(() => {
    return transactions.reduce((sum, t) => (t.tipe === 'pemasukan' ? sum + t.jumlah : sum), 0);
  }, [transactions]);

  const totalExpenseAll = useMemo(() => {
    return transactions.reduce((sum, t) => (t.tipe === 'pengeluaran' ? sum + t.jumlah : sum), 0);
  }, [transactions]);

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (trx: Transaction) => {
    setEditingTransaction(trx);
    setIsFormOpen(true);
  };

  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    if (editId) {
      const existing = transactions.find((t) => t.id === editId);
      const updated: Transaction = {
        ...existing,
        ...data,
        id: editId,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: existing?.userId || (currentUser ? currentUser.uid : activeUserId),
        userEmail: existing?.userEmail || activeUser.email,
        userName: existing?.userName || activeUser.name,
      };

      setTransactions((prev) => prev.map((t) => (t.id === editId ? updated : t)));

      if (currentUser) {
        try {
          await saveTransaction(updated, activeUser);
        } catch (e) {
          console.error('Failed to sync update to Firestore', e);
        }
      }
      showToast('Transaksi berhasil diperbarui.');
    } else {
      const newTrx: Transaction = {
        ...data,
        id: `trx-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userId: currentUser ? currentUser.uid : activeUserId,
        userEmail: activeUser.email,
        userName: activeUser.name,
      };

      setTransactions((prev) => [newTrx, ...prev]);
      if (newTrx.bulan && newTrx.bulan !== selectedMonth) {
        setSelectedMonth(newTrx.bulan);
      }

      if (currentUser) {
        try {
          await saveTransaction(newTrx, activeUser);
        } catch (e) {
          console.error('Failed to save to Firestore', e);
        }
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

  const handleConfirmDelete = async () => {
    if (deletingTransaction) {
      const idToDelete = deletingTransaction.id;
      setTransactions((prev) => prev.filter((t) => t.id !== idToDelete));

      if (currentUser) {
        try {
          await deleteTransaction(idToDelete);
        } catch (e) {
          console.error('Failed to delete from Firestore', e);
        }
      }

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

  // 1. Initial Authentication Check Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F06553] flex flex-col items-center justify-center p-4 selection:bg-[#FF6B00] selection:text-white">
        <div className="bg-[#FFFBF5] p-8 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full text-center border-4 border-white/70 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FA5E00] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Coins className="w-8 h-8 text-amber-200 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#2D2B2A] text-xl">Catatan Kekayaanku</h3>
            <p className="text-xs text-stone-500 font-medium">Memeriksa status akun & sesi login...</p>
          </div>
          <div className="w-7 h-7 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // 2. Mandatory Login Page Gate: User MUST log in before accessing the app
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#2D2B2A] text-white text-xs font-bold rounded-full shadow-2xl border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
        <LoginPage
          onLogin={handleAddNewGoogleUser}
          isLoggingIn={isLoggingIn}
          errorMessage={loginError}
        />
      </>
    );
  }

  // 3. Authenticated Dashboard
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
          onLogout={handleLogoutGoogle}
          activeUser={activeUser}
          totalUsersCount={users.length}
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Super Admin Control Panel or Regular User Privacy Banner */}
        <SuperAdminBanner
          isSuperAdmin={isSuperAdmin}
          currentUserEmail={currentUser?.email || (activeUser.isGoogle ? activeUser.email : null)}
          currentUserName={currentUser?.displayName || activeUser.name}
          viewAllUsers={viewAllUsers}
          onToggleViewAllUsers={setViewAllUsers}
          allUsersList={allUsersList.length > 0 ? allUsersList : users}
          selectedUserFilter={selectedUserFilter}
          onSelectUserFilter={setSelectedUserFilter}
          totalTransactionsCount={transactions.length}
          totalIncomeAll={totalIncomeAll}
          totalExpenseAll={totalExpenseAll}
        />

        {/* User Scope Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-stone-100/80 rounded-2xl border border-stone-200/60 text-xs">
          <div className="flex items-center gap-2 text-stone-700 font-semibold flex-wrap">
            <Users className="w-4 h-4 text-[#FF6A00]" />
            <span>Sedang melihat pembukuan:</span>
            <span className="font-extrabold text-[#2D2B2A] bg-white px-2.5 py-0.5 rounded-full border border-stone-200 shadow-2xs">
              {isSuperAdmin && viewAllUsers
                ? `Semua Pengguna Publik (${selectedUserFilter === 'ALL' ? 'Seluruh Data' : 'Terfilter'})`
                : activeUser.name}
            </span>
            <span className="text-stone-400">
              ({activeUser.roleDescription || activeUser.email})
            </span>
            {isSuperAdmin && (
              <span className="text-[10px] font-black text-amber-900 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-400">
                👑 Super Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={handleSyncToFirestore}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 transition"
                title="Sinkronkan catatan ke Cloud Firestore"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sinkron Cloud</span>
              </button>
            )}
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="text-[11px] font-bold text-[#FF6A00] hover:text-[#FA5E00] hover:underline flex items-center gap-1"
            >
              <span>Ganti Akun ({users.length} terdaftar)</span>
            </button>
          </div>
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
              viewAllUsers={isSuperAdmin && viewAllUsers}
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
          <section aria-label="Grafik Statistik Kekayaan">
            <StatisticsChartsView
              transactions={transactions}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
            />
          </section>
        )}

        {/* Reset Demo Data & Brand Footer */}
        <footer className="pt-4 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-bold text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <span className="font-semibold text-stone-700">Catatan Kekayaanku</span>
            <span>· Sistem Pembukuan Multi-Pengguna dengan Privasi Terisolasi & Super Admin Control</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition text-[11px] font-semibold border border-stone-200/80"
              title="Reset data ke contoh pembukuan bawaan"
            >
              <RotateCcw className="w-3 h-3 text-stone-400" />
              <span>Reset Contoh Data</span>
            </button>
            <span className="text-[11px] text-stone-400">Versi 2.4 (Cloud Multi-User)</span>
          </div>
        </footer>
      </div>

      {/* Transaction Add / Edit Modal */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultMonth={selectedMonth}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onCancel={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        transaction={deletingTransaction}
      />

      {/* Google Drive Backup & Sync Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        transactions={transactions}
        onRestoreTransactions={handleRestoreTransactions}
        currentUser={currentUser}
        accessToken={accessToken}
        onAuthSuccess={(user: User, token: string) => {
          setCurrentUser(user);
          setAccessToken(token);
          showToast(`Berhasil terhubung ke Google Drive (${user.email})!`);
        }}
        onLogout={handleLogoutGoogle}
        selectedMonth={selectedMonth}
      />

      {/* User Account Multi-User Modal with Delete Account Feature */}
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
    </div>
  );
}
