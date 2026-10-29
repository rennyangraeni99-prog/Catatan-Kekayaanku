import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.tipe === 'pemasukan';
  const jenis = isIncome ? transaction.jenisPemasukan : transaction.jenisPengeluaran;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-rose-100 text-[#E05345] shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#2D2B2A]">
                Hapus Catatan Transaksi?
              </h3>
              <p className="text-xs text-stone-500">
                Tindakan ini akan menghapus catatan berikut secara permanen dari Catatan Kekayaanku:
              </p>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-stone-500">Tanggal:</span>
              <span className="font-bold text-stone-900">{formatDateIndo(transaction.tanggal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Jenis:</span>
              <span className="font-bold text-stone-900">{jenis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Kategori:</span>
              <span className="text-stone-800">{transaction.kategori}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-1 mt-1 font-bold">
              <span className="text-stone-500 font-sans">Jumlah:</span>
              <span className={isIncome ? 'text-emerald-600' : 'text-[#E05345]'}>
                {isIncome ? '+ ' : '- '}
                {formatRupiah(transaction.jumlah)}
              </span>
            </div>
            {transaction.catatan && (
              <div className="text-stone-500 italic font-sans pt-0.5">
                "{transaction.catatan}"
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#E05345] hover:bg-rose-700 rounded-full shadow-md transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
