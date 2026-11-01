"use client";

import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <LogOut size={22} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="mt-2 text-base font-bold text-slate-900">
          Konfirmasi Keluar
        </h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Apakah Anda yakin ingin keluar dari panel admin Museum Brawijaya? Sesi Anda saat ini akan diakhiri.
        </p>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95"
          >
            Ya, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
