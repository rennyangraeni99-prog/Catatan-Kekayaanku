import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  PlusCircle,
  Coins,
  Cloud,
} from 'lucide-react';
import { Transaction, KATEGORI_OPTIONS } from '../types/finance';
import {
  formatBulanIndo,
  formatDateIndo,
  formatRupiah,
  exportToCSV,
  downloadCSV,
} from '../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenNewTransaction: () => void;
  onOpenGoogleDrive?: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenNewTransaction,
  onOpenGoogleDrive,
  selectedMonth,
  onMonthChange,
  availableMonths,
  searchQuery = '',
  onSearchChange,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterMonthScope, setFilterMonthScope] = useState<'selected' | 'all'>('selected');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  const effectiveSearch = searchQuery || localSearch;

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      // Month scope filter
      if (filterMonthScope === 'selected' && trx.bulan !== selectedMonth) {
        return false;
      }

      // Tipe filter
      if (filterTipe !== 'all' && trx.tipe !== filterTipe) {
        return false;
      }

      // Kategori filter
      if (filterKategori !== 'all' && trx.kategori !== filterKategori) {
        return false;
      }

      // Search query
      if (effectiveSearch.trim()) {
        const query = effectiveSearch.toLowerCase();
        const jenis = (trx.tipe === 'pemasukan' ? trx.jenisPemasukan : trx.jenisPengeluaran) || '';
        const matchCatatan = (trx.catatan || '').toLowerCase().includes(query);
        const matchJenis = jenis.toLowerCase().includes(query);
        const matchKategori = (trx.kategori || '').toLowerCase().includes(query);
        const matchTanggal = trx.tanggal.includes(query);
        const matchJumlah = trx.jumlah.toString().includes(query);

        if (!matchCatatan && !matchJenis && !matchKategori && !matchTanggal && !matchJumlah) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      }
      if (sortBy === 'amount_desc') {
        return b.jumlah - a.jumlah;
      }
      if (sortBy === 'amount_asc') {
        return a.jumlah - b.jumlah;
      }
      return 0;
    });
  }, [transactions, selectedMonth, filterMonthScope, filterTipe, filterKategori, effectiveSearch, sortBy]);

  // Aggregate stats of filtered results
  const summaryFiltered = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.tipe === 'pemasukan') income += t.jumlah;
      else expense += t.jumlah;
    });
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const csvContent = exportToCSV(
      filteredTransactions,
      filterMonthScope === 'selected' ? selectedMonth : undefined
    );
    const filename = `catatan-kekayaan-${filterMonthScope === 'selected' ? selectedMonth : 'semua'}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="bg-white/95 rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm">
      {/* Table Header & Controls Bar */}
      <div className="p-4 sm:p-6 border-b border-stone-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#2D2B2A]">
                Buku Catatan Keuangan
              </h2>
              <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {filterMonthScope === 'selected' ? formatBulanIndo(selectedMonth) : 'Semua Bulan'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Daftar seluruh transaksi pemasukan dan pengeluaran secara kronologis
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenGoogleDrive && (
              <button
                onClick={onOpenGoogleDrive}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-full transition shadow-xs"
                title="Cadangkan dan Kelola di Google Drive"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Drive</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-full transition shadow-xs"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#FA5E00] rounded-full transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari jenis, catatan, nominal..."
              value={effectiveSearch}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                setLocalSearch(e.target.value);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6A00]"
            />
            {effectiveSearch && (
              <button
                onClick={() => {
                  if (onSearchChange) onSearchChange('');
                  setLocalSearch('');
                }}
                className="absolute right-3 top-2 text-xs text-stone-400 hover:text-stone-600 font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Scope Periode Dropdown */}
          <div>
            <select
              value={filterMonthScope === 'selected' ? selectedMonth : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setFilterMonthScope('all');
                } else {
                  setFilterMonthScope('selected');
                  onMonthChange(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-full text-stone-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option value="all">Semua Periode</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Bulan {formatBulanIndo(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tipe Transaksi */}
          <div>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value as 'all' | 'pemasukan' | 'pengeluaran')}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-full text-stone-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option value="all">Semua Arus Kas</option>
              <option value="pemasukan">Hanya Pemasukan</option>
              <option value="pengeluaran">Hanya Pengeluaran</option>
            </select>
          </div>

          {/* Urutkan / Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-full text-stone-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option value="date_desc">Tanggal: Terbaru</option>
              <option value="date_asc">Tanggal: Terlama</option>
              <option value="amount_desc">Nominal: Terbesar</option>
              <option value="amount_asc">Nominal: Terkecil</option>
            </select>
          </div>
        </div>

        {/* Filter Kategori Quick Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-stone-400 font-bold mr-1">Kategori:</span>
          <button
            onClick={() => setFilterKategori('all')}
            className={`px-3 py-1 text-xs rounded-full font-bold transition ${
              filterKategori === 'all'
                ? 'bg-[#2D2B2A] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            Semua
          </button>
          {KATEGORI_OPTIONS.map((kat) => (
            <button
              key={kat}
              onClick={() => setFilterKategori(kat)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                filterKategori === kat
                  ? 'bg-[#2D2B2A] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100/70 border-b border-stone-200 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              <th className="py-3 px-4 whitespace-nowrap">Bulan</th>
              <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
              <th className="py-3 px-4 whitespace-nowrap">Jenis Transaksi</th>
              <th className="py-3 px-4 whitespace-nowrap">Kategori</th>
              <th className="py-3 px-4 whitespace-nowrap text-right">Jumlah (Rp)</th>
              <th className="py-3 px-4 min-w-[200px]">Catatan</th>
              <th className="py-3 px-4 whitespace-nowrap text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-stone-300" />
                    <p className="font-bold text-stone-700">Tidak ada transaksi yang cocok</p>
                    <p className="text-xs text-stone-400">
                      Coba sesuaikan filter atau tambahkan transaksi baru
                    </p>
                    <button
                      onClick={onOpenNewTransaction}
                      className="mt-2 px-4 py-2 text-xs font-bold text-white bg-[#FF6A00] rounded-full hover:bg-[#FA5E00] transition"
                    >
                      + Catat Transaksi Baru
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((trx) => {
                const isIncome = trx.tipe === 'pemasukan';
                const jenisLabel = isIncome ? (trx.jenisPemasukan || 'Pemasukan') : (trx.jenisPengeluaran || 'Pengeluaran');

                return (
                  <tr key={trx.id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Bulan */}
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-stone-800">
                      {formatBulanIndo(trx.bulan)}
                    </td>

                    {/* Tanggal */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums text-stone-600">
                      {formatDateIndo(trx.tanggal)}
                    </td>

                    {/* Jenis Transaksi */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isIncome ? (
                          <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" />
                            Masuk
                          </span>
                        ) : (
                          <span className="flex items-center text-[#E05345] bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <ArrowDownRight className="w-3 h-3 mr-0.5" />
                            Keluar
                          </span>
                        )}
                        <span className="font-bold text-[#2D2B2A]">{jenisLabel}</span>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                      <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        {trx.kategori}
                      </span>
                    </td>

                    {/* Jumlah */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold tabular-nums">
                      <span className={isIncome ? 'text-emerald-600' : 'text-[#E05345]'}>
                        {isIncome ? '+ ' : '- '}
                        {formatRupiah(trx.jumlah)}
                      </span>
                    </td>

                    {/* Catatan */}
                    <td className="py-3 px-4 text-stone-600 max-w-xs truncate" title={trx.catatan}>
                      {trx.catatan || <span className="text-stone-300 italic">Tanpa catatan</span>}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(trx)}
                          title="Edit transaksi"
                          className="p-1.5 text-stone-500 hover:text-[#FF6A00] hover:bg-stone-100 rounded-full transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(trx.id)}
                          title="Hapus transaksi"
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Filtered Summary Bar */}
      {filteredTransactions.length > 0 && (
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-stone-500">
            Menampilkan <span className="font-bold text-stone-900 font-mono tabular-nums">{summaryFiltered.count}</span> transaksi
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-stone-500 mr-1.5">Total Masuk:</span>
              <span className="font-extrabold text-emerald-600 font-mono tabular-nums">
                +{formatRupiah(summaryFiltered.income)}
              </span>
            </div>
            <div>
              <span className="text-stone-500 mr-1.5">Total Keluar:</span>
              <span className="font-extrabold text-[#E05345] font-mono tabular-nums">
                -{formatRupiah(summaryFiltered.expense)}
              </span>
            </div>
            <div>
              <span className="text-stone-500 mr-1.5">Selisih Bersih:</span>
              <span className={`font-extrabold font-mono tabular-nums ${summaryFiltered.balance >= 0 ? 'text-[#2D2B2A]' : 'text-[#E05345]'}`}>
                {formatRupiah(summaryFiltered.balance)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
