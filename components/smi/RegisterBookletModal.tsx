"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

type Props = {
  open: boolean;
  onClose: () => void;
  forms: any[];
  onSuccess: () => void;
};

export default function RegisterBookletModal({
  open,
  onClose,
  forms,
  onSuccess,
}: Props) {
  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      accountable_form_id: "",
      fiscal_year:
        new Date().getFullYear(),
      series: "",
      beginning_or: "",
      ending_or: "",
      received_date: "",
      supplier: "",
      remarks: "",
    });

  if (!open) return null;

  async function save() {
    try {
      setSaving(true);

      await axios.post(
        "/api/smi",
        form
      );

      Swal.fire(
        "Success",
        "Booklet successfully registered.",
        "success"
      );

      setForm({
        accountable_form_id: "",
        fiscal_year:
          new Date().getFullYear(),
        series: "",
        beginning_or: "",
        ending_or: "",
        received_date: "",
        supplier: "",
        remarks: "",
      });

      onSuccess();
      onClose();

    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message ??
          "Unable to register booklet.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function change(
    key: string,
    value: any
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">

        <div className="border-b px-6 py-4">

          <h2 className="text-xl font-semibold">
            Register Booklet
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-5 p-6">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Accountable Form
            </label>

            <select
              className="w-full rounded-lg border p-2"
              value={
                form.accountable_form_id
              }
              onChange={(e) =>
                change(
                  "accountable_form_id",
                  e.target.value
                )
              }
            >
              <option value="">
                Select Form
              </option>

              {forms.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.form_code} -{" "}
                  {item.form_name}
                </option>
              ))}
            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Fiscal Year
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-2"
              value={
                form.fiscal_year
              }
              onChange={(e) =>
                change(
                  "fiscal_year",
                  e.target.value
                )
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
                change(
                  "series",
                  e.target.value
                )
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
              value={
                form.received_date
              }
              onChange={(e) =>
                change(
                  "received_date",
                  e.target.value
                )
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
              value={
                form.beginning_or
              }
              onChange={(e) =>
                change(
                  "beginning_or",
                  e.target.value
                )
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
              value={
                form.ending_or
              }
              onChange={(e) =>
                change(
                  "ending_or",
                  e.target.value
                )
              }
            />

          </div>

          <div className="col-span-2">

            <label className="mb-2 block text-sm font-medium">
              Supplier
            </label>

            <input
              className="w-full rounded-lg border p-2"
              value={
                form.supplier
              }
              onChange={(e) =>
                change(
                  "supplier",
                  e.target.value
                )
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
              value={
                form.remarks
              }
              onChange={(e) =>
                change(
                  "remarks",
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={save}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
}