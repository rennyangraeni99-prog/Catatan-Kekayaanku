export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface Transaction {
  id: string;
  bulan: string; // Format: "YYYY-MM", misal "2026-10"
  tanggal: string; // Format: "YYYY-MM-DD", misal "2026-10-28"
  tipe: TransactionType;
  jenisPemasukan?: string; // e.g. "Gaji Pokok", "Usaha & Bisnis", "Freelance", "Investasi", "Bonus / THR", "Lainnya"
  jenisPengeluaran?: string; // e.g. "Kebutuhan Pokok", "Makanan & Minuman", "Tagihan & Utilitas", "Transportasi", dll
  kategori: string; // e.g. "Primer (Wajib)", "Sekunder", "Tersier / Gaya Hidup", "Tabungan & Investasi", "Darurat", "Sosial & Amal"
  jumlah: number; // Rupiah amount
  catatan: string; // Notes / description
  createdAt: string;
}

export interface MonthlySummary {
  bulan: string; // "YYYY-MM"
  namaBulan: string; // "Oktober 2026"
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoBersih: number; // Pemasukan - Pengeluaran
  savingRate: number; // (Pemasukan - Pengeluaran) / Pemasukan * 100
  totalTransaksi: number;
  jumlahPemasukan: number;
  jumlahPengeluaran: number;
  rataRataPengeluaranHarian: number;
  pengeluaranTerbesar?: { jenis: string; jumlah: number; catatan: string; tanggal: string };
  pemasukanTerbesar?: { jenis: string; jumlah: number; catatan: string; tanggal: string };
  breakdownKategoriPengeluaran: Array<{ kategori: string; total: number; persentase: number; count: number }>;
  breakdownJenisPengeluaran: Array<{ jenis: string; total: number; persentase: number; count: number }>;
  breakdownJenisPemasukan: Array<{ jenis: string; total: number; persentase: number; count: number }>;
}

export const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const JENIS_PEMASUKAN_OPTIONS = [
  'Gaji Pokok Bulanan',
  'Bonus & Tunjangan / THR',
  'Hasil Usaha & Penjualan',
  'Freelance & Proyek Lepas',
  'Hasil Investasi & Dividen',
  'Pendapatan Sewa Properti',
  'Hadiah / Hibah / Warisan',
  'Pengembalian Dana / Cashback',
  'Pemasukan Lainnya'
];

export const JENIS_PENGELUARAN_OPTIONS = [
  'Kebutuhan Pokok & Sembako',
  'Makanan & Minuman Harian',
  'Tempat Tinggal (Sewa / KPR)',
  'Tagihan Listrik, Air & Internet',
  'Transportasi & Bahan Bakar',
  'Pendidikan, Buku & Kursus',
  'Kesehatan, Medis & Asuransi',
  'Hiburan, Rekreasi & Liburan',
  'Belanja Pakaian & Pribadi',
  'Investasi & Tabungan Rutin',
  'Cicilan Hutang & Kewajiban',
  'Sedekah, Zakat & Donasi',
  'Perawatan Rumah & Kendaraan',
  'Pengeluaran Lainnya'
];

export const KATEGORI_OPTIONS = [
  'Kebutuhan Wajib (Primer)',
  'Kebutuhan Sekunder',
  'Gaya Hidup & Keinginan',
  'Tabungan & Investasi',
  'Dana Darurat',
  'Sosial & Keluarga',
  'Operasional Bisnis / Usaha'
];
