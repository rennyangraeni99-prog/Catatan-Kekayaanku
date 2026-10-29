import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  Search,
  HardDrive,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout } from '../services/firebaseAuth';
import {
  DriveFileItem,
  listDriveFiles,
  uploadToDrive,
  downloadDriveFileContent,
  deleteDriveFile,
} from '../services/googleDriveService';
import { Transaction } from '../types/finance';
import { exportToCSV, formatDateIndo } from '../utils/formatters';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onRestoreTransactions: (restored: Transaction[]) => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  selectedMonth: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onRestoreTransactions,
  currentUser,
  accessToken,
  onAuthSuccess,
  onLogout,
  selectedMonth,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File to delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // File to restore confirmation modal state
  const [fileToRestore, setFileToRestore] = useState<DriveFileItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch drive files when authenticated and modal is open
  const fetchFiles = async (token = accessToken, query = searchQuery) => {
    if (!token) return;
    setIsLoadingFiles(true);
    try {
      const files = await listDriveFiles(token, query);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengambil berkas dari Google Drive.' });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchFiles(accessToken, searchQuery);
    }
  }, [isOpen, accessToken]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
        fetchFiles(res.accessToken);
        setStatusMessage({ type: 'success', text: `Berhasil terhubung dengan Google Drive (${res.user.email})` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal masuk dengan akun Google.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onLogout();
    setDriveFiles([]);
    setStatusMessage({ type: 'success', text: 'Berhasil keluar dari akun Google.' });
  };

  const handleBackupJSON = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `catatan-kekayaanku-backup-${timestamp}.json`;
      const content = JSON.stringify(
        {
          appName: 'Catatan Kekayaanku',
          version: '2.0',
          backupDate: new Date().toISOString(),
          totalTransactions: transactions.length,
          transactions,
        },
        null,
        2
      );

      const uploaded = await uploadToDrive(accessToken, filename, content, 'application/json');
      setStatusMessage({
        type: 'success',
        text: `Cadangan data berhasil disimpan ke Google Drive (${uploaded.name})!`,
      });
      fetchFiles(accessToken);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mencadangkan data ke Google Drive.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackupCSV = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const filename = `catatan-kekayaan-laporan-${selectedMonth}.csv`;
      const csvContent = exportToCSV(transactions, selectedMonth);
      const uploaded = await uploadToDrive(accessToken, filename, csvContent, 'text/csv');
      setStatusMessage({
        type: 'success',
        text: `Berkas CSV laporan ${selectedMonth} berhasil disimpan di Google Drive (${uploaded.name})!`,
      });
      fetchFiles(accessToken);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah CSV ke Google Drive.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Execute restore after user confirmation
  const handleConfirmRestore = async () => {
    if (!fileToRestore || !accessToken) return;
    setIsRestoring(true);
    try {
      const content = await downloadDriveFileContent(accessToken, fileToRestore.id);
      let parsedTransactions: Transaction[] = [];

      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          parsedTransactions = parsed;
        } else if (parsed && Array.isArray(parsed.transactions)) {
          parsedTransactions = parsed.transactions;
        } else {
          throw new Error('Format berkas JSON cadangan tidak sesuai.');
        }
      } catch (jsonErr) {
        throw new Error('Gagal membaca isi JSON berkas cadangan.');
      }

      if (parsedTransactions.length === 0) {
        throw new Error('Berkas cadangan tidak memuat data transaksi valid.');
      }

      onRestoreTransactions(parsedTransactions);
      setStatusMessage({
        type: 'success',
        text: `Berhasil memulihkan ${parsedTransactions.length} transaksi dari berkas ${fileToRestore.name}!`,
      });
      setFileToRestore(null);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memulihkan data.' });
    } finally {
      setIsRestoring(false);
    }
  };

  // Execute destructive delete after user confirmation (MANDATORY REQUIREMENT)
  const handleConfirmDelete = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setStatusMessage({
        type: 'success',
        text: `Berkas "${fileToDelete.name}" telah dihapus dari Google Drive Anda.`,
      });
      setFileToDelete(null);
      fetchFiles(accessToken);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus berkas di Google Drive.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FF6A00] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Integrasi Google Drive
              </h3>
              <p className="text-[11px] text-white/80">
                Cadangkan data, sinkronisasi cloud, dan pulihkan riwayat transaksi
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Account Status Card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {currentUser && accessToken ? (
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-stone-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-[#FF6A00] flex items-center justify-center font-bold">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <span>{currentUser.displayName || 'Pengguna Google'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                      Terhubung
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-mono">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs font-bold text-stone-900">
                  Belum Terhubung ke Google Drive
                </div>
                <p className="text-[11px] text-stone-500">
                  Hubungkan akun Google Anda untuk mencadangkan dan memulihkan data keuangan secara aman di cloud.
                </p>
              </div>
            )}

            <div>
              {currentUser && accessToken ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-100 rounded-full transition shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-stone-500" />
                  <span>Keluar Akun</span>
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-full transition shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Backup Action Cards (only active if signed in) */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
              Cadangkan Data ke Google Drive
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Full Database JSON */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FF6A00] text-white shrink-0">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900">
                      Cadangan Lengkap (JSON)
                    </h5>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Simpan seluruh {transactions.length} transaksi untuk dicadangkan dan dipulihkan kembali kapan saja.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBackupJSON}
                  disabled={!accessToken || isUploading}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-[#FF6A00] hover:bg-[#FA5E00] disabled:bg-stone-300 text-white text-xs font-bold transition shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Menyimpan...' : 'Cadangkan ke Drive'}</span>
                </button>
              </div>

              {/* Card 2: Monthly Report CSV */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900">
                      Ekspor Laporan Bulanan (CSV)
                    </h5>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Simpan berkas lembar kerja spreadsheet untuk periode {selectedMonth} ke Google Drive.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBackupCSV}
                  disabled={!accessToken || isUploading}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white text-xs font-bold transition shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Menyimpan...' : 'Simpan CSV ke Drive'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drive Files List / Restore Manager */}
          {accessToken && (
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-[#FF6A00]" />
                  <span>Berkas Cadangan di Google Drive</span>
                </h4>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari berkas di Drive..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchFiles(accessToken, searchQuery)}
                      className="pl-8 pr-3 py-1 text-xs rounded-full bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#FF6A00]"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                  </div>
                  <button
                    onClick={() => fetchFiles(accessToken, searchQuery)}
                    disabled={isLoadingFiles}
                    title="Segarkan daftar berkas"
                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Files Table / List */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
                {isLoadingFiles ? (
                  <div className="py-10 text-center text-xs text-stone-400">
                    Memuat berkas dari Google Drive...
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="py-10 text-center text-xs text-stone-400">
                    Belum ada berkas cadangan di Google Drive. Klik tombol "Cadangkan ke Drive" di atas untuk membuat cadangan pertama.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
                    {driveFiles.map((file) => {
                      const isJson = file.name.endsWith('.json') || file.mimeType.includes('json');
                      const isCsv = file.name.endsWith('.csv') || file.mimeType.includes('csv');

                      return (
                        <div
                          key={file.id}
                          className="p-3 hover:bg-stone-50 flex items-center justify-between gap-3 text-xs transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isJson ? (
                              <FileJson className="w-4 h-4 text-[#FF6A00] shrink-0" />
                            ) : isCsv ? (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <HardDrive className="w-4 h-4 text-stone-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-stone-900 block truncate" title={file.name}>
                                {file.name}
                              </span>
                              <div className="text-[10px] text-stone-400 font-mono">
                                Diperbarui: {formatDateIndo(file.modifiedTime.slice(0, 10))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka di Google Drive"
                                className="p-1.5 text-stone-400 hover:text-[#FF6A00] hover:bg-stone-100 rounded-full transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {isJson && (
                              <button
                                onClick={() => setFileToRestore(file)}
                                title="Pulihkan data dari cadangan ini"
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>Pulihkan</span>
                              </button>
                            )}
                            <button
                              onClick={() => setFileToDelete(file)}
                              title="Hapus berkas dari Google Drive"
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Google Drive API v3 · Otentikasi Resmi Google</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-full transition"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Restoring Data */}
      {fileToRestore && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-amber-100 text-[#FF6A00] shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#2D2B2A]">
                  Pulihkan Data dari Google Drive?
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Anda akan memulihkan data dari berkas <strong>"{fileToRestore.name}"</strong>. Data transaksi yang ada saat ini akan digantikan oleh data dari berkas cadangan ini.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToRestore(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-full transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-md transition"
              >
                {isRestoring ? 'Memulihkan...' : 'Ya, Pulihkan Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY Confirmation Dialog for Destructive Delete in Google Drive */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 text-[#E05345] shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#2D2B2A]">
                  Hapus Berkas dari Google Drive?
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Apakah Anda yakin ingin menghapus berkas <strong>"{fileToDelete.name}"</strong> secara permanen dari Google Drive Anda? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-full transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-bold text-white bg-[#E05345] hover:bg-rose-700 rounded-full shadow-md transition"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus dari Drive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
