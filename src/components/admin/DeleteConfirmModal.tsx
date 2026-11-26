"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  description?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = "Yakin Anda Ingin Menghapus?",
  itemName,
  description = "Data yang sudah dihapus tidak dapat dikembalikan lagi.",
  loading = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2D24]/45 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#E2DDD5] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#224229] via-[#C9A84C] to-red-600" />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 shadow-sm">
              <AlertTriangle size={22} />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              aria-label="Tutup"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#FAF8F5] hover:text-slate-700 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          <h3 id="delete-modal-title" className="mt-4 text-base font-extrabold text-[#1E2922]">
            {title}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[#6B726A]">
            {description}
          </p>

          {itemName && (
            <div className="mt-3 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3.5 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A8443]">
                Item yang akan dihapus
              </p>
              <p className="mt-0.5 truncate text-xs font-bold text-[#1E2922]">
                {itemName}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-4 py-2.5 text-xs font-semibold text-[#2C322B] transition hover:bg-[#EFECE6] disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={14} />
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
