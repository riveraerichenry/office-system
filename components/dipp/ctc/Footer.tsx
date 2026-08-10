"use client";

type Props = {
  saving: boolean;
  total: number;
  onCancel: () => void;
  onProcess: () => void;
};

export default function Footer({
  saving,
  total,
  onCancel,
  onProcess,
}: Props) {
  return (
    <div className="border-t bg-white">
      <div className="flex items-center justify-between px-6 py-5">

        {/* =====================================
            LEFT — TOTAL
        ====================================== */}

        <div>
            <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="
              rounded-xl
              border
              border-slate-300
              bg-white
              px-8
              py-3
              font-medium
              text-slate-700
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>
          
        </div>

        {/* =====================================
            RIGHT — ACTIONS
        ====================================== */}

        <div className="flex items-center gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Community Tax
          </p>

          <h2 className="mt-1 text-3xl font-bold text-blue-700">
            ₱
            {Number(total).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>

          <button
            type="button"
            onClick={onProcess}
            disabled={saving}
            className="
              rounded-xl
              bg-blue-600
              px-8
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:bg-blue-400
            "
          >
            {saving ? "Processing..." : "Process & Print CTC"}
          </button>
        </div>

      </div>
    </div>
  );
}