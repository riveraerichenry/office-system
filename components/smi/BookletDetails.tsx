"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import {
  Pencil,
  Archive,
  Printer,
  Package,
  Calendar,
  Hash,
  FileText,
  Save,
  X,
} from "lucide-react";

type Props = {
  open: boolean;
  booklet: any;
  onClose: () => void;
  onRefresh: () => void;
  onEdit: () => void;
};

export default function BookletDetails({
  open,
  booklet,
  onClose,
  onRefresh,
}: Props) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (booklet) {
      setForm(booklet);
      setEditing(false);
    }
  }, [booklet]);

  if (!open || !booklet) return null;

  async function saveBooklet() {
    try {
      await axios.put(`/api/smi/${booklet.id}`, form);

      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Booklet updated successfully.",
      });

      setEditing(false);

      onRefresh();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Unable to Save",
        text:
          err.response?.data?.message ??
          "Something went wrong.",
      });
    }
  }

  async function archiveBooklet() {
    const confirm = await Swal.fire({
      title: "Archive Booklet?",
      text: "This booklet will be archived.",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/api/smi/${booklet.id}`);

      Swal.fire(
        "Archived",
        "Booklet archived successfully.",
        "success"
      );

      onRefresh();

      onClose();

    } catch (err: any) {

      Swal.fire(
        "Error",
        err.response?.data?.message ??
          "Unable to archive.",
        "error"
      );

    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-[1050px] flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b bg-white px-6 py-4">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Booklet Details
            </h2>

            <p className="text-sm text-slate-500">
              Registered Accountable Form Booklet Information
            </p>

          </div>

          <div className="flex items-center gap-2">

            {!editing ? (

              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit
              </button>

            ) : (

              <>
                <button
                  onClick={saveBooklet}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <Save size={16} />
                  Save
                </button>

                <button
                  onClick={() => {
                    setEditing(false);
                    setForm(booklet);
                  }}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
                >
                  <X size={16} />
                  Cancel
                </button>
              </>

            )}

          

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
            >
              ✕
            </button>

          </div>

        </div>

        {/* Body */}

        <div className="flex-1 space-y-6 overflow-y-auto p-6">

          <div className="rounded-2xl border bg-white shadow-sm">

            <div className="flex items-center justify-between border-b p-6">

              <div>

                {editing ? (

                  <input
                    value={form.control_no ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        control_no: e.target.value,
                      })
                    }
                    className="w-72 rounded-lg border p-2 text-2xl font-bold"
                  />

                ) : (

                  <h2 className="text-2xl font-bold">
                    {form.control_no}
                  </h2>

                )}

                <p className="text-gray-500">
                  {form.form_code} • {form.form_name}
                </p>

              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  form.status === "AVAILABLE"
                    ? "bg-green-100 text-green-700"
                    : form.status === "ISSUED"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {form.status}
              </span>

            </div>

            <div className="grid grid-cols-2 gap-6 p-6">

              {/* Series */}

{editing ? (
  <InputField
    icon={<Hash size={18} />}
    label="Series"
    value={form.series}
    onChange={(v) =>
      setForm({
        ...form,
        series: v,
      })
    }
  />
) : (
  <Detail
    icon={<Hash size={18} />}
    label="Series"
    value={form.series}
  />
)}

{/* Receipt Count */}

{editing ? (
  <InputField
    icon={<FileText size={18} />}
    label="Receipt Count"
    type="number"
    value={form.receipt_count}
    onChange={(v) =>
      setForm({
        ...form,
        receipt_count: Number(v),
      })
    }
  />
) : (
  <Detail
    icon={<FileText size={18} />}
    label="Receipt Count"
    value={form.receipt_count}
  />
)}

{/* Beginning OR */}

{editing ? (
  <InputField
    icon={<Hash size={18} />}
    label="Beginning OR"
    type="number"
    value={form.beginning_or}
    onChange={(v) =>
      setForm({
        ...form,
        beginning_or: Number(v),
      })
    }
  />
) : (
  <Detail
    icon={<Hash size={18} />}
    label="Beginning OR"
    value={form.beginning_or}
  />
)}

{/* Ending OR */}

{editing ? (
  <InputField
    icon={<Hash size={18} />}
    label="Ending OR"
    type="number"
    value={form.ending_or}
    onChange={(v) =>
      setForm({
        ...form,
        ending_or: Number(v),
      })
    }
  />
) : (
  <Detail
    icon={<Hash size={18} />}
    label="Ending OR"
    value={form.ending_or}
  />
)}

{/* Current OR */}

{editing ? (
  <InputField
    icon={<Hash size={18} />}
    label="Current OR"
    type="number"
    value={form.current_or}
    onChange={(v) =>
      setForm({
        ...form,
        current_or: Number(v),
      })
    }
  />
) : (
  <Detail
    icon={<Hash size={18} />}
    label="Current OR"
    value={form.current_or}
  />
)}

{/* Supplier */}

{editing ? (
  <InputField
    icon={<Package size={18} />}
    label="Supplier"
    value={form.supplier}
    onChange={(v) =>
      setForm({
        ...form,
        supplier: v,
      })
    }
  />
) : (
  <Detail
    icon={<Package size={18} />}
    label="Supplier"
    value={form.supplier}
  />
)}

{/* Fiscal Year */}

{editing ? (
  <InputField
    icon={<Calendar size={18} />}
    label="Fiscal Year"
    type="number"
    value={form.fiscal_year}
    onChange={(v) =>
      setForm({
        ...form,
        fiscal_year: Number(v),
      })
    }
  />
) : (
  <Detail
    icon={<Calendar size={18} />}
    label="Fiscal Year"
    value={form.fiscal_year}
  />
)}

{/* Received Date */}

{editing ? (
  <InputField
    icon={<Calendar size={18} />}
    label="Received Date"
    type="date"
    value={form.received_date?.substring(0, 10)}
    onChange={(v) =>
      setForm({
        ...form,
        received_date: v,
      })
    }
  />
) : (
  <Detail
    icon={<Calendar size={18} />}
    label="Received Date"
    value={form.received_date}
  />
)}

</div>

{/* Remarks */}

<div className="border-t p-6">

  <h3 className="mb-3 font-semibold">
    Remarks
  </h3>

  {editing ? (

    <textarea
      rows={4}
      value={form.remarks ?? ""}
      onChange={(e) =>
        setForm({
          ...form,
          remarks: e.target.value,
        })
      }
      className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
    />

  ) : (

    <p className="text-gray-600">
      {form.remarks || "-"}
    </p>

  )}

</div>

</div>

</div>

</div>

</div>
);
}


function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-xs uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {value || "-"}
        </p>

      </div>

    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
        {icon}
      </div>

      <div className="flex-1">

        <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>

    </div>
  );
}