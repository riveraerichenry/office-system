"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

type Props = {
  open: boolean;
  booklet: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditBookletModal({
  open,
  booklet,
  onClose,
  onSuccess,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fiscal_year: "",
    series: "",
    beginning_or: "",
    ending_or: "",
    received_date: "",
    supplier: "",
    remarks: "",
  });

  useEffect(() => {
    if (!booklet) return;

    setForm({
      fiscal_year: booklet.fiscal_year ?? "",
      series: booklet.series ?? "",
      beginning_or: booklet.beginning_or ?? "",
      ending_or: booklet.ending_or ?? "",
      received_date: booklet.received_date
        ? booklet.received_date.substring(0, 10)
        : "",
      supplier: booklet.supplier ?? "",
      remarks: booklet.remarks ?? "",
    });
  }, [booklet]);

  if (!open || !booklet) return null;

  function change(key: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function save() {
    try {
      setSaving(true);

      await axios.put(
        `/api/smi/booklets/${booklet.id}`,
        form
      );

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Booklet updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ??
          "Unable to update booklet.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">

        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Edit Booklet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Control No. {booklet.control_no}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 p-6">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Fiscal Year
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-2"
              value={form.fiscal_year}
              onChange={(e) =>
                change("fiscal_year", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Series
            </label>

            <input
              className="w-full rounded-lg border p-2"
              value={form.series}
              onChange={(e) =>
                change("series", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Beginning OR
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-2"
              value={form.beginning_or}
              onChange={(e) =>
                change("beginning_or", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Ending OR
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-2"
              value={form.ending_or}
              onChange={(e) =>
                change("ending_or", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Received Date
            </label>

            <input
              type="date"
              className="w-full rounded-lg border p-2"
              value={form.received_date}
              onChange={(e) =>
                change("received_date", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Supplier
            </label>

            <input
              className="w-full rounded-lg border p-2"
              value={form.supplier}
              onChange={(e) =>
                change("supplier", e.target.value)
              }
            />
          </div>

          <div className="col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Remarks
            </label>

            <textarea
              rows={4}
              className="w-full rounded-lg border p-2"
              value={form.remarks}
              onChange={(e) =>
                change("remarks", e.target.value)
              }
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border px-5 py-2 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Booklet"}
          </button>
        </div>

      </div>
    </div>
  );
}