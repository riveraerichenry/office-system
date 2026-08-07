"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;

  width?: string;

  loading?: boolean;

  children: ReactNode;

  onClose: () => void;
  onSave: () => void;

  saveText?: string;
};

export default function FormDialog({
  open,
  title,
  subtitle,

  width = "max-w-4xl",

  loading = false,

  children,

  onClose,
  onSave,

  saveText = "Save",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

      <div
        className={`w-full ${width} overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >

        {/* Header */}

        <div className="flex items-start justify-between border-b px-6 py-5">

          <div>

            <h2 className="text-xl font-semibold text-slate-800">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={18} />
          </button>

        </div>

        {/* Body */}

        <div className="max-h-[70vh] overflow-y-auto p-6">

          {children}

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border px-5 py-2 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : saveText}
          </button>

        </div>

      </div>

    </div>
  );
}