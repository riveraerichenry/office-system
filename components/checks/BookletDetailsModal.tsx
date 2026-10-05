
"use client";

import { X } from "lucide-react";
import type { Booklet } from "./BookletTable";
import BookletDetails from "./BookletDetails";

interface Props {
  booklet: Booklet | null;
  onClose: () => void;
}

export default function BookletDetailsModal({ booklet, onClose }: Props) {
  if (!booklet) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-gray-50 shadow-xl">
        <div className="flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Booklet Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <BookletDetails booklet={booklet} />
        </div>
      </div>
    </div>
  );
}
