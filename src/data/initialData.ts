import { Transaction } from '../types/finance';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // --- OKTOBER 2026 ---
  {
    id: 'trx-101',
    bulan: '2026-10',
    tanggal: '2026-10-01',
    tipe: 'pemasukan',
    jenisPemasukan: 'Gaji Pokok Bulanan',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 12500000,
    catatan: 'Gaji pokok bulanan Oktober 2026 via transfer bank',
    createdAt: '2026-10-01T08:00:00.000Z'
  },
  {
    id: 'trx-102',
    bulan: '2026-10',
    tanggal: '2026-10-02',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Tempat Tinggal (Sewa / KPR)',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 3200000,
    catatan: 'Pembayaran sewa tempat tinggal & iuran lingkungan bulanan',
    createdAt: '2026-10-02T09:15:00.000Z'
  },
  {
    id: 'trx-103',
    bulan: '2026-10',
    tanggal: '2026-10-03',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Tagihan Listrik, Air & Internet',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 850000,
    catatan: 'Listrik PLN pascabayar & WiFi Indihome fiber',
    createdAt: '2026-10-03T11:30:00.000Z'
  },
  {
    id: 'trx-104',
    bulan: '2026-10',
    tanggal: '2026-10-05',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Kebutuhan Pokok & Sembako',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 1450000,
    catatan: 'Belanja bulanan sembako, beras, minyak, dan bumbu dapur di supermarket',
    createdAt: '2026-10-05T14:20:00.000Z'
  },
  {
    id: 'trx-105',
    bulan: '2026-10',
    tanggal: '2026-10-08',
    tipe: 'pemasukan',
    jenisPemasukan: 'Freelance & Proyek Lepas',
    kategori: 'Operasional Bisnis / Usaha',
    jumlah: 3800000,
    catatan: 'Honor pembuatan landing page & desain UI dashboard klien',
    createdAt: '2026-10-08T16:45:00.000Z'
  },
  {
    id: 'trx-106',
    bulan: '2026-10',
    tanggal: '2026-10-10',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Investasi & Tabungan Rutin',
    kategori: 'Tabungan & Investasi',
    jumlah: 2500000,
    catatan: 'Alokasi Reksadana Pasar Uang & Saham IHSG rutin',
    createdAt: '2026-10-10T09:00:00.000Z'
  },
  {
    id: 'trx-107',
    bulan: '2026-10',
    tanggal: '2026-10-12',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Transportasi & Bahan Bakar',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 450000,
    catatan: 'Pengisian BBM Pertamax & saldo e-toll card',
    createdAt: '2026-10-12T08:30:00.000Z'
  },
  {
    id: 'trx-108',
    bulan: '2026-10',
    tanggal: '2026-10-14',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Makanan & Minuman Harian',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 320000,
    catatan: 'Makan siang catering harian dan kopi pagi',
    createdAt: '2026-10-14T12:00:00.000Z'
  },
  {
    id: 'trx-109',
    bulan: '2026-10',
    tanggal: '2026-10-16',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Kesehatan, Medis & Asuransi',
    kategori: 'Dana Darurat',
    jumlah: 650000,
    catatan: 'Pemeriksaan gigi rutin dan vitamin harian',
    createdAt: '2026-10-16T15:10:00.000Z'
  },
  {
    id: 'trx-110',
    bulan: '2026-10',
    tanggal: '2026-10-18',
    tipe: 'pemasukan',
    jenisPemasukan: 'Hasil Investasi & Dividen',
    kategori: 'Tabungan & Investasi',
    jumlah: 950000,
    catatan: 'Dividen kupon obligasi negara ORI & dividen saham',
    createdAt: '2026-10-18T10:00:00.000Z'
  },
  {
    id: 'trx-111',
    bulan: '2026-10',
    tanggal: '2026-10-20',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Sedekah, Zakat & Donasi',
    kategori: 'Sosial & Keluarga',
    jumlah: 500000,
    catatan: 'Infaq jumat & bantuan panti asuhan',
    createdAt: '2026-10-20T11:45:00.000Z'
  },
  {
    id: 'trx-112',
    bulan: '2026-10',
    tanggal: '2026-10-22',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Hiburan, Rekreasi & Liburan',
    kategori: 'Gaya Hidup & Keinginan',
    jumlah: 780000,
    catatan: 'Nonton bioskop & makan akhir pekan bersama keluarga',
    createdAt: '2026-10-22T19:30:00.000Z'
  },
  {
    id: 'trx-113',
    bulan: '2026-10',
    tanggal: '2026-10-25',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Pendidikan, Buku & Kursus',
    kategori: 'Kebutuhan Sekunder',
    jumlah: 350000,
    catatan: 'Langganan platform belajar pemrograman & buku manajemen keuangan',
    createdAt: '2026-10-25T14:00:00.000Z'
  },
  {
    id: 'trx-114',
    bulan: '2026-10',
    tanggal: '2026-10-27',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Makanan & Minuman Harian',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 280000,
    catatan: 'Belanja sayur & buah segar mingguan pasar modern',
    createdAt: '2026-10-27T08:15:00.000Z'
  },
  {
    id: 'trx-115',
    bulan: '2026-10',
    tanggal: '2026-10-28',
    tipe: 'pemasukan',
    jenisPemasukan: 'Bonus & Tunjangan / THR',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 2000000,
    catatan: 'Bonus performa kuartal 3 perusahaan',
    createdAt: '2026-10-28T16:00:00.000Z'
  },

  // --- SEPTEMBER 2026 ---
  {
    id: 'trx-201',
    bulan: '2026-09',
    tanggal: '2026-09-01',
    tipe: 'pemasukan',
    jenisPemasukan: 'Gaji Pokok Bulanan',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 12500000,
    catatan: 'Gaji pokok bulanan September 2026',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'trx-202',
    bulan: '2026-09',
    tanggal: '2026-09-02',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Tempat Tinggal (Sewa / KPR)',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 3200000,
    catatan: 'Sewa rumah bulanan September',
    createdAt: '2026-09-02T10:00:00.000Z'
  },
  {
    id: 'trx-203',
    bulan: '2026-09',
    tanggal: '2026-09-04',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Tagihan Listrik, Air & Internet',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 920000,
    catatan: 'Listrik & internet fiber bulanan',
    createdAt: '2026-09-04T12:00:00.000Z'
  },
  {
    id: 'trx-204',
    bulan: '2026-09',
    tanggal: '2026-09-07',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Kebutuhan Pokok & Sembako',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 1600000,
    catatan: 'Sembako dan kebutuhan dapur',
    createdAt: '2026-09-07T13:30:00.000Z'
  },
  {
    id: 'trx-205',
    bulan: '2026-09',
    tanggal: '2026-09-12',
    tipe: 'pemasukan',
    jenisPemasukan: 'Hasil Usaha & Penjualan',
    kategori: 'Operasional Bisnis / Usaha',
    jumlah: 4200000,
    catatan: 'Penjualan produk online store toko e-commerce',
    createdAt: '2026-09-12T17:00:00.000Z'
  },
  {
    id: 'trx-206',
    bulan: '2026-09',
    tanggal: '2026-09-15',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Investasi & Tabungan Rutin',
    kategori: 'Tabungan & Investasi',
    jumlah: 3000000,
    catatan: 'Investasi emas batangan & reksadana saham',
    createdAt: '2026-09-15T11:00:00.000Z'
  },
  {
    id: 'trx-207',
    bulan: '2026-09',
    tanggal: '2026-09-20',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Perawatan Rumah & Kendaraan',
    kategori: 'Kebutuhan Sekunder',
    jumlah: 850000,
    catatan: 'Servis rutin kendaraan bermotor ganti oli & filter',
    createdAt: '2026-09-20T10:15:00.000Z'
  },
  {
    id: 'trx-208',
    bulan: '2026-09',
    tanggal: '2026-09-25',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Belanja Pakaian & Pribadi',
    kategori: 'Gaya Hidup & Keinginan',
    jumlah: 750000,
    catatan: 'Sepatu kerja & kemeja baru promo tanggal kembar',
    createdAt: '2026-09-25T15:20:00.000Z'
  },

  // --- AGUSTUS 2026 ---
  {
    id: 'trx-301',
    bulan: '2026-08',
    tanggal: '2026-08-01',
    tipe: 'pemasukan',
    jenisPemasukan: 'Gaji Pokok Bulanan',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 12500000,
    catatan: 'Gaji pokok bulanan Agustus 2026',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'trx-302',
    bulan: '2026-08',
    tanggal: '2026-08-02',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Tempat Tinggal (Sewa / KPR)',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 3200000,
    catatan: 'Sewa bulanan Agustus',
    createdAt: '2026-08-02T09:00:00.000Z'
  },
  {
    id: 'trx-303',
    bulan: '2026-08',
    tanggal: '2026-08-10',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Kebutuhan Pokok & Sembako',
    kategori: 'Kebutuhan Wajib (Primer)',
    jumlah: 1800000,
    catatan: 'Belanja persediaan sembako & perlengkapan',
    createdAt: '2026-08-10T11:00:00.000Z'
  },
  {
    id: 'trx-304',
    bulan: '2026-08',
    tanggal: '2026-08-15',
    tipe: 'pemasukan',
    jenisPemasukan: 'Freelance & Proyek Lepas',
    kategori: 'Operasional Bisnis / Usaha',
    jumlah: 5000000,
    catatan: 'Proyek audit sistem dan konsultasi database',
    createdAt: '2026-08-15T16:00:00.000Z'
  },
  {
    id: 'trx-305',
    bulan: '2026-08',
    tanggal: '2026-08-20',
    tipe: 'pengeluaran',
    jenisPengeluaran: 'Investasi & Tabungan Rutin',
    kategori: 'Tabungan & Investasi',
    jumlah: 4000000,
    catatan: 'Simpanan deposito dan reksadana pendapatan tetap',
    createdAt: '2026-08-20T10:00:00.000Z'
  }
];
