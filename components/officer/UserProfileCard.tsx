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

type Profile = {
  username: string;
  role: string;
  is_active: boolean;
  password?: string;
};

export default function UserProfileCard({
  profile,
  onRefresh,
}: {
  profile: Profile;
  onRefresh: () => void;
}) {
  const [editing, setEditing] =
    useState(false);

  const [form, setForm] =
    useState<Profile | null>(null);

  useEffect(() => {
    setForm({
      ...profile,
      password: "",
    });
  }, [profile]);

  async function save() {
    await axios.put(
      "/api/accountable-officer/user",
      form
    );

    setEditing(false);
    onRefresh();
  }

  return (
    <div className="rounded-[40px] bg-white px-10 py-12 shadow-xl">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold">
          User Details
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

      <div className="space-y-6">
        <Field
          label="Username"
          value={form?.username}
          editing={editing}
          onChange={(v: string) =>
            setForm((prev) =>
              prev
                ? {
                    ...prev,
                    username: v,
                  }
                : prev
            )
          }
        />

        <Field
          label="New Password"
          value={form?.password}
          editing={editing}
          password
          onChange={(v: string) =>
            setForm((prev) =>
              prev
                ? {
                    ...prev,
                    password: v,
                  }
                : prev
            )
          }
        />

        <Field
          label="Role"
          value={form?.role}
        />

        <Field
          label="Status"
          value={
            form?.is_active
              ? "Active"
              : "Inactive"
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  editing = false,
  onChange,
  password = false,
}: {
  label: string;
  value?: string;
  editing?: boolean;
  password?: boolean;
  onChange?: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-500">
        {label}
      </label>

      {editing &&
      onChange ? (
        <input
          type={
            password
              ? "password"
              : "text"
          }
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
          {password
            ? "••••••••"
            : value || "-"}
        </div>
      )}
    </div>
  );
}