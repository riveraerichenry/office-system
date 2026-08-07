"use client";

import axios from "axios";
import {
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

export default function BankDetails({
  selected,
  onRefresh,
}: {
  selected: any;
  onRefresh: () => void;
}) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [form, setForm] =
    useState<any>(null);

  useEffect(() => {
    setForm(selected);
    setIsEditing(false);
  }, [selected]);

  async function handleSave() {
    try {
      await axios.put(
        `/api/banks/${selected.id}`,
        form
      );

      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete() {
    if (
      !confirm("Delete bank?")
    )
      return;

    try {
      await axios.delete(
        `/api/banks/${selected.id}`
      );

      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  if (!selected) {
    return (
      <div className="rounded-[40px] bg-white shadow-xl px-10 py-12">
        No bank selected
      </div>
    );
  }

  return (
    <div className="rounded-[40px] bg-white shadow-xl px-10 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Bank Details
        </h1>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white"
              >
                <Check size={18} />
              </button>

              <button
                onClick={() => {
                  setForm(
                    selected
                  );
                  setIsEditing(
                    false
                  );
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  setIsEditing(
                    true
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white"
              >
                <Pencil
                  size={18}
                />
              </button>

              <button
                onClick={
                  handleDelete
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white"
              >
                <Trash2
                  size={18}
                />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Field
          label="Bank Code"
          value={
            form?.bank_code
          }
          editing={isEditing}
          onChange={(v) =>
            setForm({
              ...form,
              bank_code: v,
            })
          }
        />

        <Field
          label="Bank Name"
          value={
            form?.bank_name
          }
          editing={isEditing}
          onChange={(v) =>
            setForm({
              ...form,
              bank_name: v,
            })
          }
        />

        <Field
          label="Sequence No"
          value={
            form?.seq_no?.toString() ||
            ""
          }
          editing={isEditing}
          onChange={(v) =>
            setForm({
              ...form,
              seq_no:
                Number(v),
            })
          }
        />

        <Field
          label="Remarks"
          value={
            form?.remarks
          }
          editing={isEditing}
          onChange={(v) =>
            setForm({
              ...form,
              remarks: v,
            })
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="block mb-2 text-sm text-gray-500">
        {label}
      </label>

      {editing ? (
        <input
          value={value || ""}
          onChange={(e) =>
            onChange?.(
              e.target.value
            )
          }
          className="w-full border-b pb-3 outline-none"
        />
      ) : (
        <div className="border-b pb-3 font-medium">
          {value || "-"}
        </div>
      )}
    </div>
  );
}