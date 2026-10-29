import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, AlertCircle, Coins } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  JENIS_PEMASUKAN_OPTIONS,
  JENIS_PENGELUARAN_OPTIONS,
  KATEGORI_OPTIONS,
} from '../types/finance';
import { formatBulanIndo, formatRupiah, getBulanFromTanggal } from '../utils/formatters';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, editId?: string) => void;
  editingTransaction?: Transaction | null;
  defaultMonth?: string;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  defaultMonth,
}) => {
  const [tipe, setTipe] = useState<TransactionType>('pengeluaran');
  const [tanggal, setTanggal] = useState<string>('2026-10-28');
  const [bulan, setBulan] = useState<string>('2026-10');
  const [jenisPemasukan, setJenisPemasukan] = useState<string>(JENIS_PEMASUKAN_OPTIONS[0]);
  const [jenisPengeluaran, setJenisPengeluaran] = useState<string>(JENIS_PENGELUARAN_OPTIONS[0]);
  const [customJenis, setCustomJenis] = useState<string>('');
  const [isCustomJenis, setIsCustomJenis] = useState<boolean>(false);
  const [kategori, setKategori] = useState<string>(KATEGORI_OPTIONS[0]);
  const [customKategori, setCustomKategori] = useState<string>('');
  const [isCustomKategori, setIsCustomKategori] = useState<boolean>(false);
  const [jumlah, setJumlah] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setTipe(editingTransaction.tipe);
      setTanggal(editingTransaction.tanggal);
      setBulan(editingTransaction.bulan);
      setJumlah(editingTransaction.jumlah.toString());
      setCatatan(editingTransaction.catatan);

      if (editingTransaction.tipe === 'pemasukan') {
        const val = editingTransaction.jenisPemasukan || '';
        if (JENIS_PEMASUKAN_OPTIONS.includes(val)) {
          setJenisPemasukan(val);
          setIsCustomJenis(false);
        } else {
          setIsCustomJenis(true);
          setCustomJenis(val);
        }
      } else {
        const val = editingTransaction.jenisPengeluaran || '';
        if (JENIS_PENGELUARAN_OPTIONS.includes(val)) {
          setJenisPengeluaran(val);
          setIsCustomJenis(false);
        } else {
          setIsCustomJenis(true);
          setCustomJenis(val);
        }
      }

      if (KATEGORI_OPTIONS.includes(editingTransaction.kategori)) {
        setKategori(editingTransaction.kategori);
        setIsCustomKategori(false);
      } else {
        setIsCustomKategori(true);
        setCustomKategori(editingTransaction.kategori);
      }
    } else {
      const initialDate = defaultMonth ? `${defaultMonth}-15` : '2026-10-28';
      setTanggal(initialDate);
      setBulan(defaultMonth || '2026-10');
      setTipe('pengeluaran');
      setJenisPemasukan(JENIS_PEMASUKAN_OPTIONS[0]);
      setJenisPengeluaran(JENIS_PENGELUARAN_OPTIONS[0]);
      setCustomJenis('');
      setIsCustomJenis(false);
      setKategori(KATEGORI_OPTIONS[0]);
      setCustomKategori('');
      setIsCustomKategori(false);
      setJumlah('');
      setCatatan('');
      setError('');
    }
  }, [editingTransaction, isOpen, defaultMonth]);

  const handleDateChange = (newDate: string) => {
    setTanggal(newDate);
    const derivedBulan = getBulanFromTanggal(newDate);
    if (derivedBulan) {
      setBulan(derivedBulan);
    }
  };

  const handleQuickAdd = (addAmount: number) => {
    const current = parseInt(jumlah, 10) || 0;
    setJumlah((current + addAmount).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(jumlah);
    if (!numericAmount || numericAmount <= 0) {
      setError('Harap masukkan jumlah nominal yang valid dan lebih dari 0.');
      return;
    }

    if (!tanggal) {
      setError('Harap pilih tanggal transaksi.');
      return;
    }

    const finalJenis = isCustomJenis
      ? customJenis.trim()
      : tipe === 'pemasukan'
      ? jenisPemasukan
      : jenisPengeluaran;

    if (!finalJenis) {
      setError('Harap tentukan jenis transaksi.');
      return;
    }

    const finalKategori = isCustomKategori ? customKategori.trim() : kategori;
    if (!finalKategori) {
      setError('Harap tentukan kategori transaksi.');
      return;
    }

    onSave(
      {
        bulan: bulan || getBulanFromTanggal(tanggal),
        tanggal,
        tipe,
        jenisPemasukan: tipe === 'pemasukan' ? finalJenis : undefined,
        jenisPengeluaran: tipe === 'pengeluaran' ? finalJenis : undefined,
        kategori: finalKategori,
        jumlah: numericAmount,
        catatan: catatan.trim(),
      },
      editingTransaction?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FF6A00] text-white">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-200" />
            <div>
              <h3 className="text-base font-extrabold text-white">
                {editingTransaction ? 'Edit Catatan Transaksi' : 'Catat Transaksi Baru'}
              </h3>
              <p className="text-[11px] text-white/80">
                Catatan Kekayaanku · Kelola komponen finansial dengan rapi
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-2xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Tipe Transaksi: Segmented Tab */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Jenis Arus Kas (Tipe Transaksi)
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-full">
              <button
                type="button"
                onClick={() => setTipe('pengeluaran')}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-full transition ${
                  tipe === 'pengeluaran'
                    ? 'bg-[#E05345] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                onClick={() => setTipe('pemasukan')}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-full transition ${
                  tipe === 'pemasukan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Pemasukan</span>
              </button>
            </div>
          </div>

          {/* Tanggal & Bulan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-mono shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Bulan (Periode Buku)
              </label>
              <div className="px-4 py-2 text-xs sm:text-sm bg-stone-100 border border-stone-200 rounded-full text-stone-800 font-bold">
                {formatBulanIndo(bulan)}
                <span className="text-stone-400 font-mono text-xs ml-1.5">({bulan})</span>
              </div>
            </div>
          </div>

          {/* Jenis Pemasukan atau Jenis Pengeluaran */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                {tipe === 'pemasukan' ? 'Jenis Pemasukan' : 'Jenis Pengeluaran'}
              </label>
              <button
                type="button"
                onClick={() => setIsCustomJenis(!isCustomJenis)}
                className="text-xs text-[#FF6A00] hover:underline font-semibold"
              >
                {isCustomJenis ? 'Pilih dari daftar' : '+ Tulis Jenis Kustom'}
              </button>
            </div>

            {isCustomJenis ? (
              <input
                type="text"
                placeholder={tipe === 'pemasukan' ? 'Contoh: Dividen Saham, Royalti' : 'Contoh: Perawatan Kucing, Asuransi'}
                value={customJenis}
                onChange={(e) => setCustomJenis(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
              />
            ) : tipe === 'pemasukan' ? (
              <select
                value={jenisPemasukan}
                onChange={(e) => setJenisPemasukan(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
              >
                {JENIS_PEMASUKAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={jenisPengeluaran}
                onChange={(e) => setJenisPengeluaran(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
              >
                {JENIS_PENGELUARAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Kategori */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                Kategori
              </label>
              <button
                type="button"
                onClick={() => setIsCustomKategori(!isCustomKategori)}
                className="text-xs text-[#FF6A00] hover:underline font-semibold"
              >
                {isCustomKategori ? 'Pilih dari daftar' : '+ Tulis Kategori Kustom'}
              </button>
            </div>

            {isCustomKategori ? (
              <input
                type="text"
                placeholder="Contoh: Operasional Rumah, Proyek Khusus"
                value={customKategori}
                onChange={(e) => setCustomKategori(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
              />
            ) : (
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
              >
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Jumlah */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                Jumlah Nominal (Rupiah)
              </label>
              {jumlah && !isNaN(Number(jumlah)) && Number(jumlah) > 0 && (
                <span className="text-xs font-extrabold text-[#FF6A00] font-mono tabular-nums">
                  {formatRupiah(Number(jumlah))}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-xs font-bold text-stone-500 font-mono">
                Rp
              </span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="0"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-full pl-12 pr-4 py-2 text-sm sm:text-base font-bold font-mono bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-stone-400 font-bold mr-1">Cepat:</span>
              {[50000, 100000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="px-2.5 py-0.5 text-[11px] font-bold font-mono text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition"
                >
                  +{amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`}
                </button>
              ))}
              {jumlah && (
                <button
                  type="button"
                  onClick={() => setJumlah('')}
                  className="px-2 py-0.5 text-[11px] text-stone-400 hover:text-stone-700 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Catatan / Keterangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Belanja bahan makanan mingguan, pembayaran premi"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-[#2D2B2A] hover:bg-black rounded-full shadow-md transition"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>{editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
