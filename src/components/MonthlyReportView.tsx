import React from 'react';
import {
  Printer,
  Download,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Coins,
} from 'lucide-react';
import { MonthlySummary, Transaction } from '../types/finance';
import {
  formatBulanIndo,
  formatDateIndo,
  formatRupiah,
  exportToCSV,
  downloadCSV,
} from '../utils/formatters';

interface MonthlyReportViewProps {
  summary: MonthlySummary;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  transactions: Transaction[];
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  summary,
  selectedMonth,
  onMonthChange,
  availableMonths,
  transactions,
}) => {
  const monthTransactions = transactions.filter((t) => t.bulan === selectedMonth);

  let healthBadge = {
    title: 'Arus Kas Sehat & Terkendali',
    desc: 'Pemasukan Anda mencukupi dan menyisakan tabungan positif untuk memperbesar kekayaan.',
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    icon: ShieldCheck,
  };

  if (summary.totalPemasukan === 0 && summary.totalPengeluaran > 0) {
    healthBadge = {
      title: 'Hanya Pengeluaran (Defisit)',
      desc: 'Tidak ada catatan pemasukan pada bulan ini.',
      color: 'text-[#E05345] bg-rose-50 border-rose-200',
      icon: AlertTriangle,
    };
  } else if (summary.saldoBersih < 0) {
    healthBadge = {
      title: 'Defisit Finansial (Cash Drain)',
      desc: 'Pengeluaran bulan ini melebihi total pemasukan yang diterima.',
      color: 'text-[#E05345] bg-rose-50 border-rose-200',
      icon: Flame,
    };
  } else if (summary.savingRate >= 30) {
    healthBadge = {
      title: 'Pertumbuhan Kekayaan Eksponensial (Super Saver)',
      desc: `Luar biasa! Anda berhasil menyisihkan ${summary.savingRate.toFixed(1)}% dari seluruh pendapatan untuk tabungan & investasi!`,
      color: 'text-amber-900 bg-amber-50 border-amber-300',
      icon: ShieldCheck,
    };
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportMonthCSV = () => {
    const csvContent = exportToCSV(monthTransactions, selectedMonth);
    downloadCSV(csvContent, `laporan-kekayaan-${selectedMonth}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200/90 shadow-xs no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-[#FF6A00] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs text-stone-500 font-bold">Laporan Periode:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm font-extrabold bg-stone-100 border border-stone-200 rounded-full text-[#2D2B2A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatBulanIndo(m)}
              </option>
            ))}
            {!availableMonths.includes(selectedMonth) && (
              <option value={selectedMonth}>{formatBulanIndo(selectedMonth)}</option>
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMonthCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-full transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Unduh CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#FA5E00] rounded-full transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white/95 rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF6A00]">
                Catatan Kekayaanku · Laporan Bulanan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2D2B2A]">
              Laporan Keuangan: {formatBulanIndo(selectedMonth)}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Dicetak pada {formatDateIndo(new Date().toISOString().slice(0, 10))} · Sistem Pembukuan Catatan Kekayaanku
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-stone-400">Status Saldo Bersih</span>
            <div className={`text-xl sm:text-2xl font-extrabold font-mono tabular-nums ${summary.saldoBersih >= 0 ? 'text-emerald-600' : 'text-[#E05345]'}`}>
              {summary.saldoBersih >= 0 ? 'SURPLUS ' : 'DEFISIT '}
              {formatRupiah(summary.saldoBersih)}
            </div>
          </div>
        </div>

        {/* Health Evaluation Banner */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${healthBadge.color}`}>
          <healthBadge.icon className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-extrabold">{healthBadge.title}</h4>
            <p className="text-xs opacity-90 mt-0.5">{healthBadge.desc}</p>
          </div>
        </div>

        {/* Statement of Income & Expense Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>Pemasukan ({summary.jumlahPemasukan} Trx)</span>
              </div>
              <span className="font-mono font-extrabold text-emerald-600 text-sm tabular-nums">
                {formatRupiah(summary.totalPemasukan)}
              </span>
            </div>

            {summary.breakdownJenisPemasukan.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4">Belum ada catatan pemasukan bulan ini.</p>
            ) : (
              <div className="space-y-3">
                {summary.breakdownJenisPemasukan.map((item) => (
                  <div key={item.jenis} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-800 font-bold">{item.jenis}</span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        {formatRupiah(item.total)}{' '}
                        <span className="text-stone-400 font-normal">({item.persentase}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(3, item.persentase))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-1.5 text-[#E05345] font-extrabold text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>Pengeluaran ({summary.jumlahPengeluaran} Trx)</span>
              </div>
              <span className="font-mono font-extrabold text-[#E05345] text-sm tabular-nums">
                {formatRupiah(summary.totalPengeluaran)}
              </span>
            </div>

            {summary.breakdownJenisPengeluaran.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4">Belum ada catatan pengeluaran bulan ini.</p>
            ) : (
              <div className="space-y-3">
                {summary.breakdownJenisPengeluaran.map((item) => (
                  <div key={item.jenis} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-800 font-bold">{item.jenis}</span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        {formatRupiah(item.total)}{' '}
                        <span className="text-stone-400 font-normal">({item.persentase}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E05345] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(3, item.persentase))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown by Kategori */}
        <div className="pt-6 border-t border-stone-200">
          <h3 className="text-sm font-extrabold text-[#2D2B2A] mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#FF6A00]" />
            <span>Alokasi Belanja Berdasarkan Kategori</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.breakdownKategoriPengeluaran.map((kat) => (
              <div
                key={kat.kategori}
                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-stone-800 truncate" title={kat.kategori}>
                    {kat.kategori}
                  </span>
                  <span className="font-extrabold text-[#FF6A00] font-mono tabular-nums bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {kat.persentase}%
                  </span>
                </div>
                <div className="text-sm font-extrabold text-stone-900 font-mono tabular-nums">
                  {formatRupiah(kat.total)}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  {kat.count} transaksi tercatat
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Highlights: Largest Income & Largest Expense */}
        <div className="pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.pemasukanTerbesar && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800">
                Pemasukan Tertinggi Bulan Ini
              </span>
              <div className="text-lg font-extrabold text-emerald-700 font-mono tabular-nums mt-0.5">
                {formatRupiah(summary.pemasukanTerbesar.jumlah)}
              </div>
              <div className="text-xs text-stone-800 mt-1 font-bold">
                {summary.pemasukanTerbesar.jenis}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {summary.pemasukanTerbesar.catatan || 'Tanpa catatan'} · {formatDateIndo(summary.pemasukanTerbesar.tanggal)}
              </div>
            </div>
          )}

          {summary.pengeluaranTerbesar && (
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200">
              <span className="text-xs font-bold text-[#E05345]">
                Pengeluaran Tertinggi Bulan Ini
              </span>
              <div className="text-lg font-extrabold text-[#E05345] font-mono tabular-nums mt-0.5">
                {formatRupiah(summary.pengeluaranTerbesar.jumlah)}
              </div>
              <div className="text-xs text-stone-800 mt-1 font-bold">
                {summary.pengeluaranTerbesar.jenis}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {summary.pengeluaranTerbesar.catatan || 'Tanpa catatan'} · {formatDateIndo(summary.pengeluaranTerbesar.tanggal)}
              </div>
            </div>
          )}
        </div>

        {/* Executive Summary Notes */}
        <div className="pt-6 border-t border-stone-200 bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 text-xs text-stone-700 space-y-1.5">
          <div className="font-extrabold text-[#2D2B2A] flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#FF6A00]" />
            <span>Rangkuman Evaluasi Kekayaan:</span>
          </div>
          <p>
            Pada periode <strong>{formatBulanIndo(selectedMonth)}</strong>, akumulasi pemasukan tercatat{' '}
            <strong>{formatRupiah(summary.totalPemasukan)}</strong> dan total pengeluaran sebesar{' '}
            <strong>{formatRupiah(summary.totalPengeluaran)}</strong>.
          </p>
          <p>
            Arus kas bersih sebesar{' '}
            <strong>{formatRupiah(summary.saldoBersih)}</strong> berhasil disisihkan dengan rasio tabungan{' '}
            <strong>{summary.savingRate.toFixed(1)}%</strong> dan rata-rata pengeluaran harian{' '}
            <strong>{formatRupiah(summary.rataRataPengeluaranHarian)}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
