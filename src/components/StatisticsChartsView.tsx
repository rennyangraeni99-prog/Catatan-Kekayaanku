import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Layers, Coins } from 'lucide-react';
import { Transaction } from '../types/finance';
import {
  formatBulanIndo,
  formatRupiah,
  calculateMonthlySummary,
} from '../utils/formatters';

interface StatisticsChartsViewProps {
  transactions: Transaction[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

// Warm cohesive palette inspired by the reference illustration
const PALETTE = [
  '#FF6A00', // Bright Orange
  '#E05345', // Coral Red
  '#0D9488', // Teal Green
  '#2D2B2A', // Charcoal Slate
  '#F59E0B', // Warm Amber
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#EC4899', // Pink
];

export const StatisticsChartsView: React.FC<StatisticsChartsViewProps> = ({
  transactions,
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  const [activeExpenseCategory, setActiveExpenseCategory] = useState<string | null>(null);
  const [activeIncomeCategory, setActiveIncomeCategory] = useState<string | null>(null);

  const currentSummary = useMemo(() => {
    return calculateMonthlySummary(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const monthlyTrends = useMemo(() => {
    const sortedMonths = [...availableMonths].sort().slice(-6);
    return sortedMonths.map((m) => calculateMonthlySummary(transactions, m));
  }, [transactions, availableMonths]);

  const maxBarValue = useMemo(() => {
    const allTotals = monthlyTrends.flatMap((m) => [m.totalPemasukan, m.totalPengeluaran]);
    const max = Math.max(...allTotals, 1000000);
    return Math.ceil(max * 1.15);
  }, [monthlyTrends]);

  const dailyExpenses = useMemo(() => {
    const daysMap: Record<number, number> = {};
    for (let i = 1; i <= 31; i++) daysMap[i] = 0;

    transactions
      .filter((t) => t.bulan === selectedMonth && t.tipe === 'pengeluaran')
      .forEach((t) => {
        const day = parseInt(t.tanggal.split('-')[2], 10);
        if (day) daysMap[day] = (daysMap[day] || 0) + t.jumlah;
      });

    return Object.entries(daysMap).map(([day, total]) => ({
      day: parseInt(day, 10),
      total,
    }));
  }, [transactions, selectedMonth]);

  const maxDailyExpense = useMemo(() => {
    const max = Math.max(...dailyExpenses.map((d) => d.total), 500000);
    return max * 1.1;
  }, [dailyExpenses]);

  // 50/30/20 Rule Analysis
  const budgetRuleAnalysis = useMemo(() => {
    const totalExp = currentSummary.totalPengeluaran;
    if (totalExp === 0) return null;

    let kebutuhan = 0;
    let keinginan = 0;
    let tabungan = 0;

    transactions
      .filter((t) => t.bulan === selectedMonth && t.tipe === 'pengeluaran')
      .forEach((t) => {
        const kat = (t.kategori || '').toLowerCase();
        if (kat.includes('primer') || kat.includes('wajib') || kat.includes('darurat')) {
          kebutuhan += t.jumlah;
        } else if (kat.includes('gaya hidup') || kat.includes('keinginan') || kat.includes('sekunder')) {
          keinginan += t.jumlah;
        } else if (kat.includes('tabungan') || kat.includes('investasi')) {
          tabungan += t.jumlah;
        } else {
          kebutuhan += t.jumlah;
        }
      });

    return {
      kebutuhan: {
        total: kebutuhan,
        actualPct: Math.round((kebutuhan / totalExp) * 100),
        targetPct: 50,
      },
      keinginan: {
        total: keinginan,
        actualPct: Math.round((keinginan / totalExp) * 100),
        targetPct: 30,
      },
      tabungan: {
        total: tabungan,
        actualPct: Math.round((tabungan / totalExp) * 100),
        targetPct: 20,
      },
    };
  }, [transactions, selectedMonth, currentSummary]);

  const renderDonutSlices = (
    data: Array<{ label: string; total: number; persentase: number }>,
    activeLabel: string | null,
    onHover: (label: string | null) => void
  ) => {
    const total = data.reduce((sum, d) => sum + d.total, 0);
    if (total === 0) {
      return (
        <circle cx="100" cy="100" r="70" fill="none" stroke="#FCEFD7" strokeWidth="28" />
      );
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return data.map((item, idx) => {
      const sliceRatio = item.total / total;
      const strokeDash = sliceRatio * circumference;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += sliceRatio;

      const color = PALETTE[idx % PALETTE.length];
      const isSelected = activeLabel === item.label;

      return (
        <circle
          key={item.label}
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={isSelected ? 32 : 26}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-200 cursor-pointer"
          onMouseEnter={() => onHover(item.label)}
          onMouseLeave={() => onHover(null)}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-[#FF6A00] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs text-stone-500 font-bold">Periode Analisis:</span>
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

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-stone-700">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#E05345] inline-block" />
            <span className="text-stone-700">Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Monthly Cash Flow Trend (Grouped Bar Chart) */}
      <div className="bg-white/95 rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-sm space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#2D2B2A] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF6A00]" />
            <span>Perbandingan Arus Kas Bulanan (Multi-Bulan)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Pantau pertumbuhan pendapatan dan kontrol pengeluaran antar bulan
          </p>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-4">
          <div className="h-64 sm:h-72 w-full flex items-end gap-4 sm:gap-8 pt-6 pb-2 px-2 border-b border-stone-200">
            {monthlyTrends.map((trend) => {
              const incomeHeight = Math.max(4, (trend.totalPemasukan / maxBarValue) * 100);
              const expenseHeight = Math.max(4, (trend.totalPengeluaran / maxBarValue) * 100);
              const isSelected = trend.bulan === selectedMonth;

              return (
                <div
                  key={trend.bulan}
                  onClick={() => onMonthChange(trend.bulan)}
                  className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer p-1.5 rounded-2xl transition ${
                    isSelected ? 'bg-amber-50/80 ring-2 ring-[#FF6A00]' : 'hover:bg-stone-50'
                  }`}
                >
                  {/* Tooltip on hover */}
                  <div className="text-[11px] font-mono tabular-nums opacity-0 group-hover:opacity-100 transition-opacity bg-[#2D2B2A] text-white px-3 py-1.5 rounded-xl shadow-lg text-center mb-2 pointer-events-none whitespace-nowrap z-10">
                    <div className="text-emerald-400 font-bold">+{formatRupiah(trend.totalPemasukan)}</div>
                    <div className="text-[#FFA89E] font-bold">-{formatRupiah(trend.totalPengeluaran)}</div>
                    <div className="text-stone-300 border-t border-stone-600 mt-0.5 pt-0.5 text-[10px]">
                      Net: {formatRupiah(trend.saldoBersih)}
                    </div>
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-2 sm:gap-3 h-48">
                    {/* Income Bar */}
                    <div className="w-1/2 max-w-[28px] h-full flex items-end">
                      <div
                        className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all duration-300 shadow-xs"
                        style={{ height: `${incomeHeight}%` }}
                      />
                    </div>
                    {/* Expense Bar */}
                    <div className="w-1/2 max-w-[28px] h-full flex items-end">
                      <div
                        className="w-full bg-[#E05345] hover:bg-[#D64539] rounded-t-lg transition-all duration-300 shadow-xs"
                        style={{ height: `${expenseHeight}%` }}
                      />
                    </div>
                  </div>

                  {/* X Axis Label */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs block ${
                        isSelected ? 'font-extrabold text-[#FF6A00]' : 'text-stone-600 font-semibold'
                      }`}
                    >
                      {formatBulanIndo(trend.bulan).split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {trend.bulan.split('-')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Category & Type Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Pengeluaran per Kategori */}
        <div className="bg-white/95 rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2D2B2A] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#E05345]" />
                <span>Distribusi Kategori Pengeluaran</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Bulan {formatBulanIndo(selectedMonth)}
              </p>
            </div>
            <span className="text-xs font-mono font-extrabold text-[#E05345] tabular-nums">
              {formatRupiah(currentSummary.totalPengeluaran)}
            </span>
          </div>

          {currentSummary.breakdownKategoriPengeluaran.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Belum ada data pengeluaran pada bulan ini.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              {/* SVG Donut */}
              <div className="relative w-44 h-44 shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
                  {renderDonutSlices(
                    currentSummary.breakdownKategoriPengeluaran.map((k) => ({
                      label: k.kategori,
                      total: k.total,
                      persentase: k.persentase,
                    })),
                    activeExpenseCategory,
                    setActiveExpenseCategory
                  )}
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Belanja</span>
                  <span className="text-xs font-extrabold text-[#2D2B2A] font-mono tabular-nums leading-tight">
                    {formatRupiah(currentSummary.totalPengeluaran)}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
                {currentSummary.breakdownKategoriPengeluaran.map((item, idx) => {
                  const color = PALETTE[idx % PALETTE.length];
                  const isHovered = activeExpenseCategory === item.kategori;

                  return (
                    <div
                      key={item.kategori}
                      onMouseEnter={() => setActiveExpenseCategory(item.kategori)}
                      onMouseLeave={() => setActiveExpenseCategory(null)}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                        isHovered ? 'bg-amber-50 font-bold shadow-xs' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-stone-800 truncate" title={item.kategori}>
                          {item.kategori}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums ml-2">
                        <span className="font-bold text-stone-900">
                          {formatRupiah(item.total)}
                        </span>
                        <span className="text-[#FF6A00] font-bold text-[11px] w-8 text-right">
                          {item.persentase}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Donut Chart: Sumber Pemasukan */}
        <div className="bg-white/95 rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2D2B2A] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Distribusi Sumber Pemasukan</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Bulan {formatBulanIndo(selectedMonth)}
              </p>
            </div>
            <span className="text-xs font-mono font-extrabold text-emerald-600 tabular-nums">
              {formatRupiah(currentSummary.totalPemasukan)}
            </span>
          </div>

          {currentSummary.breakdownJenisPemasukan.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Belum ada data pemasukan pada bulan ini.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              {/* SVG Donut */}
              <div className="relative w-44 h-44 shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
                  {renderDonutSlices(
                    currentSummary.breakdownJenisPemasukan.map((k) => ({
                      label: k.jenis,
                      total: k.total,
                      persentase: k.persentase,
                    })),
                    activeIncomeCategory,
                    setActiveIncomeCategory
                  )}
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Masuk</span>
                  <span className="text-xs font-extrabold text-emerald-700 font-mono tabular-nums leading-tight">
                    {formatRupiah(currentSummary.totalPemasukan)}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
                {currentSummary.breakdownJenisPemasukan.map((item, idx) => {
                  const color = PALETTE[idx % PALETTE.length];
                  const isHovered = activeIncomeCategory === item.jenis;

                  return (
                    <div
                      key={item.jenis}
                      onMouseEnter={() => setActiveIncomeCategory(item.jenis)}
                      onMouseLeave={() => setActiveIncomeCategory(null)}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                        isHovered ? 'bg-amber-50 font-bold shadow-xs' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-stone-800 truncate" title={item.jenis}>
                          {item.jenis}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums ml-2">
                        <span className="font-bold text-stone-900">
                          {formatRupiah(item.total)}
                        </span>
                        <span className="text-emerald-600 font-bold text-[11px] w-8 text-right">
                          {item.persentase}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Daily Expense Timeline */}
      <div className="bg-white/95 rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-sm space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#2D2B2A] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF6A00]" />
            <span>Tren Pengeluaran Harian (Tanggal 1–31 {formatBulanIndo(selectedMonth)})</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Mendeteksi tanggal pengeluaran tertinggi sepanjang bulan berjalan
          </p>
        </div>

        <div className="pt-2">
          <div className="h-44 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-stone-200 overflow-x-auto">
            {dailyExpenses.map((d) => {
              const heightPct = Math.max(3, (d.total / maxDailyExpense) * 100);
              const hasExpense = d.total > 0;

              return (
                <div
                  key={d.day}
                  className="flex-1 min-w-[14px] flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip */}
                  {hasExpense && (
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2D2B2A] text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow pointer-events-none whitespace-nowrap z-20">
                      Tgl {d.day}: {formatRupiah(d.total)}
                    </div>
                  )}

                  {/* Day Bar */}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      hasExpense ? 'bg-[#FF6A00] hover:bg-[#E05345]' : 'bg-stone-200/60'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />

                  {/* Day Label */}
                  <span className="text-[10px] font-mono text-stone-400 mt-2 block font-semibold">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 50/30/20 Rule Analysis */}
      {budgetRuleAnalysis && (
        <div className="bg-white/95 rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#2D2B2A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FF6A00]" />
                <span>Analisis Kaidah Anggaran 50/30/20</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Kaidah alokasi kekayaan: 50% Kebutuhan Pokok, 30% Keinginan, 20% Tabungan/Investasi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* 50% Kebutuhan */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-[#2D2B2A]">Kebutuhan Pokok (50%)</span>
                <span className="font-mono text-stone-500 font-bold">Target: 50%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-stone-900 tabular-nums">
                  {budgetRuleAnalysis.kebutuhan.actualPct}%
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {formatRupiah(budgetRuleAnalysis.kebutuhan.total)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    budgetRuleAnalysis.kebutuhan.actualPct <= 55 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetRuleAnalysis.kebutuhan.actualPct)}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500">
                {budgetRuleAnalysis.kebutuhan.actualPct <= 55
                  ? 'Ideal: Alokasi kebutuhan primer dalam batas sehat.'
                  : 'Perhatian: Porsi kebutuhan primer melebihi 50%.'}
              </p>
            </div>

            {/* 30% Keinginan */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-[#2D2B2A]">Gaya Hidup & Keinginan (30%)</span>
                <span className="font-mono text-stone-500 font-bold">Target: 30%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-stone-900 tabular-nums">
                  {budgetRuleAnalysis.keinginan.actualPct}%
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {formatRupiah(budgetRuleAnalysis.keinginan.total)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    budgetRuleAnalysis.keinginan.actualPct <= 35 ? 'bg-emerald-500' : 'bg-[#E05345]'
                  }`}
                  style={{ width: `${Math.min(100, budgetRuleAnalysis.keinginan.actualPct)}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500">
                {budgetRuleAnalysis.keinginan.actualPct <= 35
                  ? 'Terkendali: Belanja gaya hidup tidak mengganggu target aset.'
                  : 'Waspada: Belanja gaya hidup dan hiburan melebihi porsi 30%.'}
              </p>
            </div>

            {/* 20% Tabungan */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-[#2D2B2A]">Tabungan & Investasi (20%)</span>
                <span className="font-mono text-stone-500 font-bold">Target: 20%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-[#FF6A00] tabular-nums">
                  {budgetRuleAnalysis.tabungan.actualPct}%
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {formatRupiah(budgetRuleAnalysis.tabungan.total)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6A00] rounded-full"
                  style={{ width: `${Math.min(100, budgetRuleAnalysis.tabungan.actualPct)}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500">
                {budgetRuleAnalysis.tabungan.actualPct >= 20
                  ? 'Sangat Baik: Anda disiplin memenuhi kuota tabungan minimal 20%.'
                  : 'Tingkatkan: Upayakan alokasikan lebih banyak ke investasi.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
