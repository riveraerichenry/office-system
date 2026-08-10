"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CalendarDays } from "lucide-react";

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
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------
  // Current Date & Time
  // ---------------------------------------------

  const [currentDateTime, setCurrentDateTime] =
    useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------------
  // Form
  // ---------------------------------------------

  const [form, setForm] = useState({
    accountable_form_id: "",
    fiscal_year: new Date().getFullYear(),
    series: "",
    beginning_or: "",
    ending_or: "",
    received_date: new Date()
      .toISOString()
      .split("T")[0],
    supplier: "",
    remarks: "",
  });

  // ---------------------------------------------
  // Reset Form
  // ---------------------------------------------

  function resetForm() {
    const today = new Date();

    setForm({
      accountable_form_id: "",
      fiscal_year: today.getFullYear(),
      series: "",
      beginning_or: "",
      ending_or: "",
      received_date: today
        .toISOString()
        .split("T")[0],
      supplier: "",
      remarks: "",
    });
  }

  // ---------------------------------------------
  // Close
  // ---------------------------------------------

  function handleClose() {
    if (saving) return;

    resetForm();
    onClose();
  }

  // ---------------------------------------------
  // Change Field
  // ---------------------------------------------

  function change(key: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // ---------------------------------------------
  // Save
  // ---------------------------------------------

  async function save() {
    try {
      setSaving(true);

      await axios.post("/api/smi", form);

      await Swal.fire(
        "Success",
        "Booklet successfully registered.",
        "success"
      );

      resetForm();

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

  // ---------------------------------------------
  // Don't Render
  // ---------------------------------------------

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">

      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="border-b bg-slate-50 px-6 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Register Booklet
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Register a new accountable form booklet
              </p>
            </div>

            {/* Current Date & Time */}

            <div className="text-right">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current Date & Time
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {currentDateTime.toLocaleDateString(
                  "en-PH",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {currentDateTime.toLocaleTimeString(
                  "en-PH",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  }
                )}
              </p>

            </div>

          </div>

        </div>

        {/* ========================================= */}
        {/* FORM */}
        {/* ========================================= */}

        <div className="grid grid-cols-2 gap-5 p-6">

          {/* Accountable Form */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Accountable Form
            </label>

            <select
              value={form.accountable_form_id}
              disabled={saving}
              onChange={(e) =>
                change(
                  "accountable_form_id",
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-100
                disabled:bg-slate-50
                disabled:text-slate-400
              "
            >
              <option value="">
                Select Form
              </option>

              {forms.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.form_code} - {item.form_name}
                </option>
              ))}
            </select>

          </div>

          {/* Fiscal Year */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fiscal Year
            </label>

            <input
              type="number"
              value={form.fiscal_year}
              disabled={saving}
              onChange={(e) =>
                change(
                  "fiscal_year",
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-100
                disabled:bg-slate-50
                disabled:text-slate-400
              "
            />

          </div>

          {/* Series */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Series
            </label>

            <input
              type="text"
              value={form.series}
              disabled={saving}
              onChange={(e) =>
                change(
                  "series",
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-100
                disabled:bg-slate-50
                disabled:text-slate-400
              "
            />

          </div>

          {/* ========================================= */}
          {/* RECEIVED DATE */}
          {/* ========================================= */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Received Date
            </label>

            <div className="flex items-center justify-end gap-3">

              <p className="text-lg font-semibold text-slate-800">

                {form.received_date
                  ? new Date(
                      `${form.received_date}T00:00:00`
                    ).toLocaleDateString(
                      "en-PH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      }
                    )
                  : "Select date"}

              </p>

              <div className="relative">

                <input
                  type="date"
                  value={form.received_date}
                  disabled={saving}
                  onChange={(e) =>
                    change(
                      "received_date",
                      e.target.value
                    )
                  }
                  className="
                    absolute
                    inset-0
                    z-10
                    h-full
                    w-full
                    cursor-pointer
                    opacity-0
                  "
                />

                <button
                  type="button"
                  disabled={saving}
                  className="
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    p-2
                    text-slate-700
                    hover:bg-slate-100
                    disabled:opacity-50
                  "
                >
                  <CalendarDays size={18} />
                </button>

              </div>

            </div>

          </div>

          {/* Beginning OR */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Beginning OR
              </label>

              <input
                type="number"
                min="1"
                value={form.beginning_or}
                disabled={saving}
                onChange={(e) => {
                  const beginning = e.target.value;

                  if (beginning === "") {
                    setForm((prev) => ({
                      ...prev,
                      beginning_or: "",
                      ending_or: "",
                    }));

                    return;
                  }

                  const beginningNumber = Number(beginning);

                  const endingNumber =
                    beginningNumber + 50 - 1;

                  setForm((prev) => ({
                    ...prev,
                    beginning_or: beginning,
                    ending_or: endingNumber.toString(),
                  }));
                }}
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-100
                  disabled:bg-slate-50
                  disabled:text-slate-400
                "
                placeholder="Beginning OR number"
              />
            </div>

          {/* Ending OR */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ending OR
              </label>

              <input
                type="number"
                value={form.ending_or}
                disabled
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-slate-50
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                "
                placeholder="Automatically calculated"
              />

              <p className="mt-1 text-xs text-slate-400">
                Automatically calculated for 50 ORs per booklet
              </p>
            </div>

          {/* Supplier

          <div className="col-span-2">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Supplier
            </label>

            <input
              type="text"
              value={form.supplier}
              disabled={saving}
              onChange={(e) =>
                change(
                  "supplier",
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-100
                disabled:bg-slate-50
                disabled:text-slate-400
              "
            />

          </div> */}

          {/* Remarks */}

          <div className="col-span-2">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Remarks
            </label>

            <textarea
              rows={4}
              value={form.remarks}
              disabled={saving}
              onChange={(e) =>
                change(
                  "remarks",
                  e.target.value
                )
              }
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-100
                disabled:bg-slate-50
                disabled:text-slate-400
              "
            />

          </div>

        </div>

        {/* ========================================= */}
        {/* FOOTER */}
        {/* ========================================= */}

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">

          <button
            type="button"
            disabled={saving}
            onClick={handleClose}
            className="
              rounded-lg
              border
              border-slate-300
              bg-white
              px-5
              py-2
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-100
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="
              rounded-lg
              bg-slate-800
              px-5
              py-2
              text-sm
              font-medium
              text-white
              hover:bg-slate-900
              disabled:opacity-50
            "
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
}