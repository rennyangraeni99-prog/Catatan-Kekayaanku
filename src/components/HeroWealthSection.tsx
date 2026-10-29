import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Coins, Plus, Calendar, Tag, Check, Sparkles } from 'lucide-react';
import { WealthIllustration } from './WealthIllustration';
import { Transaction, TransactionType, JENIS_PENGELUARAN_OPTIONS, JENIS_PEMASUKAN_OPTIONS, KATEGORI_OPTIONS } from '../types/finance';
import { formatBulanIndo, formatRupiah, getBulanFromTanggal } from '../utils/formatters';

interface HeroWealthSectionProps {
  onQuickSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  selectedMonth: string;
}

export const HeroWealthSection: React.FC<HeroWealthSectionProps> = ({
  onQuickSave,
  selectedMonth,
}) => {
  const [tipe, setTipe] = useState<TransactionType>('pengeluaran');
  const [tanggal, setTanggal] = useState<string>('2026-10-28');
  const [jenis, setJenis] = useState<string>(JENIS_PENGELUARAN_OPTIONS[0]);
  const [kategori, setKategori] = useState<string>(KATEGORI_OPTIONS[0]);
  const [jumlah, setJumlah] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [successAnim, setSuccessAnim] = useState<boolean>(false);

  const handleTipeChange = (newTipe: TransactionType) => {
    setTipe(newTipe);
    if (newTipe === 'pemasukan') {
      setJenis(JENIS_PEMASUKAN_OPTIONS[0]);
    } else {
      setJenis(JENIS_PENGELUARAN_OPTIONS[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(jumlah);
    if (!num || num <= 0) return;

    onQuickSave({
      bulan: getBulanFromTanggal(tanggal) || selectedMonth,
      tanggal,
      tipe,
      jenisPemasukan: tipe === 'pemasukan' ? jenis : undefined,
      jenisPengeluaran: tipe === 'pengeluaran' ? jenis : undefined,
      kategori,
      jumlah: num,
      catatan: catatan.trim() || `${jenis} (${formatBulanIndo(getBulanFromTanggal(tanggal))})`,
    });

    setJumlah('');
    setCatatan('');
    setSuccessAnim(true);
    setTimeout(() => setSuccessAnim(false), 2500);
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-8">
      {/* Background Organic Sand Blobs (matching reference image) */}
      <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#FCEFD7]/80 pointer-events-none -z-10 blur-2xl" />
      <div className="absolute top-1/2 -right-16 w-96 h-96 rounded-full bg-[#FCEFD7]/70 pointer-events-none -z-10 blur-3xl" />
      <div className="absolute -bottom-10 left-1/3 w-64 h-64 rounded-full bg-[#FFF3DF] pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading, Prose & Pill Form (matching "Login For Join" in reference) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#FF6A00]" />
              <span>Sistem Manajemen Finansial Pribadi & Usaha</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2D2B2A] leading-tight">
              Bangun Asetmu <br />
              <span className="text-[#FF6A00]">Catatan Kekayaanku</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-lg">
              Catat setiap rupiah arus kas masuk dan belanja keluar secara tertib.
              Kawal rasio tabungan bulanan, evaluasi pengeluaran, dan wujudkan stabilitas kekayaan jangka panjang.
            </p>
          </div>

          {/* Quick Transaction Entry Box - Styled like "Login For Join" in reference */}
          <div className="pt-2 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold text-[#2D2B2A] tracking-wide uppercase">
                Catat Transaksi Cepat
              </h3>
              {successAnim && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Berhasil dicatat!
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Type Switcher Pills */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-full">
                <button
                  type="button"
                  onClick={() => handleTipeChange('pengeluaran')}
                  className={`py-1.5 px-3 text-xs font-bold rounded-full transition ${
                    tipe === 'pengeluaran'
                      ? 'bg-[#E05345] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Pengeluaran
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTipeChange('pemasukan')}
                  className={`py-1.5 px-3 text-xs font-bold rounded-full transition ${
                    tipe === 'pemasukan'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Pemasukan
                  </span>
                </button>
              </div>

              {/* Tanggal & Jenis in Pills */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-full bg-white border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-mono shadow-xs"
                />
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-full bg-white border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs truncate"
                >
                  {tipe === 'pemasukan'
                    ? JENIS_PEMASUKAN_OPTIONS.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))
                    : JENIS_PENGELUARAN_OPTIONS.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                </select>
              </div>

              {/* Kategori & Catatan */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-full bg-white border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs truncate"
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Catatan / keterangan..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-full bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
                />
              </div>

              {/* Jumlah Nominal Pill */}
              <div className="relative">
                <span className="absolute left-4 top-2 text-xs font-bold text-stone-500 font-mono">
                  Rp
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Jumlah nominal transaksi"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 text-xs font-semibold font-mono rounded-full bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-xs"
                />
                {jumlah && !isNaN(Number(jumlah)) && (
                  <span className="absolute right-4 top-2 text-xs font-bold font-mono text-[#FF6A00]">
                    {formatRupiah(Number(jumlah))}
                  </span>
                )}
              </div>

              {/* Submit Pill Button (Dark charcoal #2D2B2A as seen in reference image) */}
              <button
                type="submit"
                className="w-full py-2.5 px-6 rounded-full bg-[#2D2B2A] hover:bg-black active:scale-[0.99] text-white text-xs font-bold tracking-wide transition shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Simpan Transaksi Sekarang</span>
              </button>
            </form>

            {/* Social / Contact line matching reference bottom left */}
            <div className="flex items-center gap-3 pt-3 text-[11px] text-stone-500">
              <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-[10px]">f</span>
              <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-[10px]">in</span>
              <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-[10px]">X</span>
              <span className="font-semibold text-stone-700">@catatankekayaanku</span>
              <span className="text-stone-300">·</span>
              <span>Bulan aktif: {formatBulanIndo(selectedMonth)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stylized Vector Illustration with Grid & Accents */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <WealthIllustration />
          {/* Caption & Carousel Dots matching bottom right of reference */}
          <div className="text-center space-y-2 mt-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E05345]" />
              <span className="w-2 h-2 rounded-full bg-[#2D2B2A]" />
              <span className="w-2 h-2 rounded-full bg-[#E05345]" />
            </div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Disiplin pencatatan harian adalah fondasi utama portofolio kekayaan yang bertumbuh secara berkelanjutan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
