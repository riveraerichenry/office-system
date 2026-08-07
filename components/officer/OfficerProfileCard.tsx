"use client";

import axios from "axios";
import {
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

export default function OfficerProfileCard({
  profile,
  onRefresh,
}: {
  profile: any;
  onRefresh: () => void;
}) {
  const [editing, setEditing] =
    useState(false);

  const [form, setForm] =
    useState<any>(null);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  async function save() {
    await axios.put(
      "/api/accountable-officer",
      form
    );

    setEditing(false);
    onRefresh();
  }

  return (
    <div className="rounded-[40px] bg-white px-10 py-12 shadow-xl">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold">
          Accountable Officer
        </h1>

        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white"
            >
              <Check size={18} />
            </button>

            <button
              onClick={() =>
                setEditing(false)
              }
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              setEditing(true)
            }
            className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white"
          >
            <Pencil size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {[
          "first_name",
          "middle_name",
          "last_name",
          "suffix",
          "position",
          "office",
          "designation",
        ].map((key) => (
          <Field
            key={key}
            label={key
              .replace("_", " ")
              .replace(
                /\b\w/g,
                (c) =>
                  c.toUpperCase()
              )}
            value={form?.[key]}
            editing={editing}
            onChange={(v: string) =>
              setForm({
                ...form,
                [key]: v,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
}: any) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-500">
        {label}
      </label>

      {editing ? (
        <input
          value={value || ""}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="w-full border-b border-gray-300 pb-3 outline-none"
        />
      ) : (
        <div className="border-b border-gray-300 pb-3 font-medium">
          {value || "-"}
        </div>
      )}
    </div>
  );
}