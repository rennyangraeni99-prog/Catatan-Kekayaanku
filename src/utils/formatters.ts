import { BULAN_NAMES, MonthlySummary, Transaction } from '../types/finance';

/**
 * Format angka ke format mata uang Rupiah
 * Contoh: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absAmount);
  return `${isNegative ? '- Rp ' : 'Rp '}${formatted}`;
}

/**
 * Format string tanggal YYYY-MM-DD ke format Indonesia
 * Contoh: "2026-10-28" -> "28 Oktober 2026"
 */
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = BULAN_NAMES[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

/**
 * Format YYYY-MM ke nama bulan Indonesia
 * Contoh: "2026-10" -> "Oktober 2026"
 */
export function formatBulanIndo(yearMonth: string): string {
  if (!yearMonth) return '';
  const parts = yearMonth.split('-');
  if (parts.length !== 2) return yearMonth;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = BULAN_NAMES[monthIdx] || parts[1];
  return `${monthName} ${year}`;
}

/**
 * Ambil kode bulan "YYYY-MM" dari string tanggal "YYYY-MM-DD"
 */
export function getBulanFromTanggal(tanggal: string): string {
  if (!tanggal) return '';
  return tanggal.substring(0, 7);
}

/**
 * Hitung ringkasan laporan bulanan dari daftar transaksi
 */
export function calculateMonthlySummary(transactions: Transaction[], selectedMonth: string): MonthlySummary {
  const filtered = transactions.filter(t => t.bulan === selectedMonth);
  
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let jumlahPemasukan = 0;
  let jumlahPengeluaran = 0;
  
  let pengeluaranTerbesar: { jenis: string; jumlah: number; catatan: string; tanggal: string } | undefined;
  let pemasukanTerbesar: { jenis: string; jumlah: number; catatan: string; tanggal: string } | undefined;

  const kategoriPengeluaranMap: Record<string, { total: number; count: number }> = {};
  const jenisPengeluaranMap: Record<string, { total: number; count: number }> = {};
  const jenisPemasukanMap: Record<string, { total: number; count: number }> = {};

  filtered.forEach(t => {
    if (t.tipe === 'pemasukan') {
      totalPemasukan += t.jumlah;
      jumlahPemasukan += 1;
      
      const jenis = t.jenisPemasukan || 'Pemasukan Lainnya';
      if (!jenisPemasukanMap[jenis]) {
        jenisPemasukanMap[jenis] = { total: 0, count: 0 };
      }
      jenisPemasukanMap[jenis].total += t.jumlah;
      jenisPemasukanMap[jenis].count += 1;

      if (!pemasukanTerbesar || t.jumlah > pemasukanTerbesar.jumlah) {
        pemasukanTerbesar = {
          jenis,
          jumlah: t.jumlah,
          catatan: t.catatan,
          tanggal: t.tanggal
        };
      }
    } else {
      totalPengeluaran += t.jumlah;
      jumlahPengeluaran += 1;

      const jenis = t.jenisPengeluaran || 'Pengeluaran Lainnya';
      if (!jenisPengeluaranMap[jenis]) {
        jenisPengeluaranMap[jenis] = { total: 0, count: 0 };
      }
      jenisPengeluaranMap[jenis].total += t.jumlah;
      jenisPengeluaranMap[jenis].count += 1;

      const kat = t.kategori || 'Umum';
      if (!kategoriPengeluaranMap[kat]) {
        kategoriPengeluaranMap[kat] = { total: 0, count: 0 };
      }
      kategoriPengeluaranMap[kat].total += t.jumlah;
      kategoriPengeluaranMap[kat].count += 1;

      if (!pengeluaranTerbesar || t.jumlah > pengeluaranTerbesar.jumlah) {
        pengeluaranTerbesar = {
          jenis,
          jumlah: t.jumlah,
          catatan: t.catatan,
          tanggal: t.tanggal
        };
      }
    }
  });

  const saldoBersih = totalPemasukan - totalPengeluaran;
  const savingRate = totalPemasukan > 0 ? (saldoBersih / totalPemasukan) * 100 : 0;

  // Rata-rata pengeluaran harian
  const daysInMonth = 30; // standard approximation or based on dates
  const rataRataPengeluaranHarian = totalPengeluaran > 0 ? Math.round(totalPengeluaran / daysInMonth) : 0;

  const breakdownKategoriPengeluaran = Object.entries(kategoriPengeluaranMap)
    .map(([kategori, val]) => ({
      kategori,
      total: val.total,
      count: val.count,
      persentase: totalPengeluaran > 0 ? Math.round((val.total / totalPengeluaran) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  const breakdownJenisPengeluaran = Object.entries(jenisPengeluaranMap)
    .map(([jenis, val]) => ({
      jenis,
      total: val.total,
      count: val.count,
      persentase: totalPengeluaran > 0 ? Math.round((val.total / totalPengeluaran) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  const breakdownJenisPemasukan = Object.entries(jenisPemasukanMap)
    .map(([jenis, val]) => ({
      jenis,
      total: val.total,
      count: val.count,
      persentase: totalPemasukan > 0 ? Math.round((val.total / totalPemasukan) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  return {
    bulan: selectedMonth,
    namaBulan: formatBulanIndo(selectedMonth),
    totalPemasukan,
    totalPengeluaran,
    saldoBersih,
    savingRate,
    totalTransaksi: filtered.length,
    jumlahPemasukan,
    jumlahPengeluaran,
    rataRataPengeluaranHarian,
    pengeluaranTerbesar,
    pemasukanTerbesar,
    breakdownKategoriPengeluaran,
    breakdownJenisPengeluaran,
    breakdownJenisPemasukan
  };
}

/**
 * Generate CSV data string for download
 */
export function exportToCSV(transactions: Transaction[], selectedMonth?: string): string {
  const data = selectedMonth ? transactions.filter(t => t.bulan === selectedMonth) : transactions;
  
  const headers = ['ID', 'Bulan', 'Tanggal', 'Tipe', 'Jenis Transaksi', 'Kategori', 'Jumlah (IDR)', 'Catatan'];
  
  const rows = data.map(t => {
    const jenis = t.tipe === 'pemasukan' ? (t.jenisPemasukan || '-') : (t.jenisPengeluaran || '-');
    const tipeLabel = t.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
    const cleanCatatan = `"${(t.catatan || '').replace(/"/g, '""')}"`;
    return [
      t.id,
      t.bulan,
      t.tanggal,
      tipeLabel,
      `"${jenis}"`,
      `"${t.kategori}"`,
      t.jumlah,
      cleanCatatan
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download string as CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
