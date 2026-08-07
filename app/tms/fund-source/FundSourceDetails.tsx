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

export default function FundSourceDetails({
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

  async function handleDelete() {
    if (!selected) return;

    const confirmed = confirm(
      "Delete this fund source?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `/api/fund-sources/${selected.id}`
      );

      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSave() {
    try {
      await axios.put(
        `/api/fund-sources/${selected.id}`,
        form
      );

      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  if (!selected) {
    return (
      <div className="rounded-[40px] bg-white shadow-xl px-10 py-14">
        No fund source selected
      </div>
    );
  }

  return (
    <div className="rounded-[40px] bg-white shadow-xl px-10 py-12">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <h1
          className="text-4xl font-extrabold"
          style={{
            textShadow:
              "2px 2px 0 rgba(0,0,0,0.15)",
          }}
        >
          Fund Details
        </h1>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-full
                  bg-gradient-to-r
                  from-emerald-400
                  to-green-600
                  text-white shadow-lg
                "
              >
                <Check size={18} />
              </button>

              <button
                onClick={() => {
                  setForm(selected);
                  setIsEditing(false);
                }}
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-full
                  bg-gray-200
                "
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  setIsEditing(true)
                }
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-full
                  bg-gradient-to-r
                  from-amber-400
                  to-orange-500
                  text-white shadow-lg
                "
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={
                  handleDelete
                }
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-full
                  bg-gradient-to-r
                  from-rose-500
                  to-red-600
                  text-white shadow-lg
                "
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <EditableField
          label="Fund Code"
          value={
            form?.fund_code
          }
          editing={isEditing}
          onChange={(value) =>
            setForm({
              ...form,
              fund_code: value,
            })
          }
        />

        <EditableField
          label="Acronym"
          value={
            form?.acronym
          }
          editing={isEditing}
          onChange={(value) =>
            setForm({
              ...form,
              acronym: value,
            })
          }
        />

        <EditableField
          label="Sequence No"
          value={
            form?.seq_no
          }
          editing={isEditing}
          onChange={(value) =>
            setForm({
              ...form,
              seq_no: value,
            })
          }
        />
      </div>

      <div className="mt-8">
        <EditableField
          label="Fund Name"
          value={
            form?.fund_name
          }
          editing={isEditing}
          onChange={(value) =>
            setForm({
              ...form,
              fund_name:
                value,
            })
          }
        />
      </div>

      <div className="mt-8">
        <label className="text-sm text-gray-700 block mb-3">
          Remarks
        </label>

        {isEditing ? (
          <textarea
            rows={6}
            value={
              form?.remarks || ""
            }
            onChange={(e) =>
              setForm({
                ...form,
                remarks:
                  e.target.value,
              })
            }
            className="
              w-full rounded-3xl
              border border-gray-300
              p-5 outline-none
              resize-none
            "
          />
        ) : (
          <div className="min-h-[220px] rounded-3xl border border-gray-300 p-5">
            {form?.remarks ||
              "-"}
          </div>
        )}
      </div>
    </div>
  );
}

function EditableField({
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
      <label className="text-sm text-gray-700 block mb-2">
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
          className="
            w-full
            border-b border-gray-300
            pb-3
            font-medium
            bg-transparent
            outline-none
          "
        />
      ) : (
        <div className="border-b border-gray-300 pb-3 font-medium">
          {value || "-"}
        </div>
      )}
    </div>
  );
}