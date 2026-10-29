import React from 'react';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Calendar, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { formatBulanIndo, formatRupiah } from '../utils/formatters';
import { MonthlySummary } from '../types/finance';

interface MonthlySummaryCardsProps {
  currentSummary: MonthlySummary;
  previousSummary?: MonthlySummary;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  currentSummary,
  previousSummary,
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  const incomeChange = previousSummary && previousSummary.totalPemasukan > 0
    ? ((currentSummary.totalPemasukan - previousSummary.totalPemasukan) / previousSummary.totalPemasukan) * 100
    : null;

  const expenseChange = previousSummary && previousSummary.totalPengeluaran > 0
    ? ((currentSummary.totalPengeluaran - previousSummary.totalPengeluaran) / previousSummary.totalPengeluaran) * 100
    : null;

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    onMonthChange(prevStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    onMonthChange(nextStr);
  };

  const isSurplus = currentSummary.saldoBersih >= 0;

  return (
    <div className="space-y-4">
      {/* Month Navigator Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-[#FF6A00] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Periode Pembukuan:</span>
            <span className="text-sm font-extrabold text-[#2D2B2A]">
              {formatBulanIndo(selectedMonth)}
            </span>
          </div>
          <span className="text-xs text-stone-300">·</span>
          <span className="text-xs font-mono tabular-nums text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
            {currentSummary.totalTransaksi} transaksi
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
            <button
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-full transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold bg-transparent text-stone-800 border-none focus:ring-0 cursor-pointer"
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
            <button
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-full transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pemasukan */}
        <div className="bg-white/95 p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#FF6A00]/40 transition">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-700">Total Pemasukan</span>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {currentSummary.jumlahPemasukan} trx
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-emerald-600 font-mono tabular-nums">
            {formatRupiah(currentSummary.totalPemasukan)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>vs Bulan Lalu</span>
            {incomeChange !== null ? (
              <span className={`font-mono tabular-nums font-bold ${incomeChange >= 0 ? 'text-emerald-600' : 'text-stone-600'}`}>
                {incomeChange >= 0 ? `+${incomeChange.toFixed(1)}%` : `${incomeChange.toFixed(1)}%`}
              </span>
            ) : (
              <span className="text-stone-400">Data awal</span>
            )}
          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="bg-white/95 p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#FF6A00]/40 transition">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-700">Total Pengeluaran</span>
            <span className="flex items-center text-[#E05345] font-bold bg-rose-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {currentSummary.jumlahPengeluaran} trx
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[#E05345] font-mono tabular-nums">
            {formatRupiah(currentSummary.totalPengeluaran)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>vs Bulan Lalu</span>
            {expenseChange !== null ? (
              <span className={`font-mono tabular-nums font-bold ${expenseChange > 0 ? 'text-[#E05345]' : 'text-emerald-600'}`}>
                {expenseChange >= 0 ? `+${expenseChange.toFixed(1)}%` : `${expenseChange.toFixed(1)}%`}
              </span>
            ) : (
              <span className="text-stone-400">Data awal</span>
            )}
          </div>
        </div>

        {/* Card 3: Saldo Bersih Bulanan */}
        <div className="bg-white/95 p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#FF6A00]/40 transition">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-700">Saldo Bersih (Net)</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSurplus ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
              {isSurplus ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <div className={`text-2xl font-extrabold tracking-tight font-mono tabular-nums ${isSurplus ? 'text-[#2D2B2A]' : 'text-[#E05345]'}`}>
            {formatRupiah(currentSummary.saldoBersih)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Arus Kekayaan</span>
            <span className="text-stone-800 font-semibold">
              {isSurplus ? 'Pertumbuhan Positif' : 'Perlu Efisiensi'}
            </span>
          </div>
        </div>

        {/* Card 4: Rasio Tabungan & Rata-rata */}
        <div className="bg-white/95 p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#FF6A00]/40 transition">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-700">Rasio Tabungan</span>
            <PiggyBank className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#FF6A00] font-mono tabular-nums">
              {currentSummary.savingRate.toFixed(1)}%
            </span>
            <span className="text-xs text-stone-500 font-medium">disimpan</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Rata-rata/hari</span>
            <span className="font-mono tabular-nums font-bold text-stone-800">
              {formatRupiah(currentSummary.rataRataPengeluaranHarian)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
