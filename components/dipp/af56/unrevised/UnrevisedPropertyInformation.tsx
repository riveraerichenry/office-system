"use client";

type Props = {
  payor: string;
  receiptDate: string;
  owner: string;
  barangay: string;
  classification: string;

  barangays: any[];
  classifications: any[];

  onPayorChange: (value: string) => void;
  onReceiptDateChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onBarangayChange: (value: string) => void;
  onClassificationChange: (value: string) => void;
};

export default function UnrevisedPropertyInformation({
  payor,
  receiptDate,
  owner,
  barangay,
  classification,

  barangays,
  classifications,

  onPayorChange,
  onReceiptDateChange,
  onOwnerChange,
  onBarangayChange,
  onClassificationChange,
}: Props) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">

      <div className="border-b bg-slate-50 px-6 py-4">

        <h2 className="text-lg font-bold text-slate-800">
          Unrevised Property Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          General information for this collection.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-5 p-6">

        {/* Payor */}

        <div>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Payor
          </label>

          <input
            value={payor}
            onChange={(e) =>
              onPayorChange(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />

        </div>

        {/* Receipt Date */}

        <div>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Receipt Date
          </label>

          <input
            type="date"
            value={receiptDate}
            onChange={(e) =>
              onReceiptDateChange(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />

        </div>

        {/* Owner */}

        <div>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Owner
          </label>

          <input
            value={owner}
            onChange={(e) =>
              onOwnerChange(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />

        </div>

        {/* Barangay */}

        <div>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Barangay
          </label>

          <select
            value={barangay}
            onChange={(e) =>
              onBarangayChange(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">
              -- Select Barangay --
            </option>

            {barangays.map((b: any, index: number) => (
              <option
                key={index}
                value={b.barangay_name}
              >
                {b.barangay_name}
              </option>
            ))}
          </select>

        </div>

        {/* Classification */}

        <div>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Classification
          </label>

          <select
            value={classification}
            onChange={(e) =>
              onClassificationChange(
                e.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">
              -- Select Classification --
            </option>

            {classifications.map(
              (c: any, index: number) => (
                <option
                  key={index}
                  value={c.classification_name}
                >
                  {c.classification_name}
                </option>
              )
            )}
          </select>

        </div>

      </div>

    </div>
  );
}