"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import RolePicker from "./RolePicker";

type Props = {
  selected: any;
  roles: any[];
  onRefresh: () => void;
};

export default function UserDetails({
  selected,
  roles,
  onRefresh,
}: Props) {
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    password: "",
    is_active: true,
    roles: [] as string[],
  });

  useEffect(() => {
    if (!selected) return;

    setForm({
      username: selected.username,
      full_name: selected.full_name,
      password: "",
      is_active: selected.is_active,
      roles: selected.roles?.map((r: any) => r.id) || [],
    });
  }, [selected]);

  async function saveUser() {
    if (!selected) return;

    try {
      await axios.put(`/api/users/${selected.id}`, form);
      alert("User updated successfully.");
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save user.");
    }
  }

  async function deleteUser() {
    if (!selected) return;

    if (!confirm("Delete this user?")) return;

    try {
      await axios.delete(`/api/users/${selected.id}`);
      alert("User deleted.");
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  }

  if (!selected) {
    return (
      <div className="flex min-h-[760px] items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl">
            👤
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            No User Selected
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Select a user from the list to manage their account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

      <div className="border-b border-gray-200 p-8">
        <div className="flex items-center gap-6">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-semibold text-white">
            {form.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="flex-1">

            <h2 className="text-2xl font-semibold text-gray-900">
              {form.full_name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              @{form.username}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">

              <span
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  form.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {form.is_active ? "Active" : "Inactive"}
              </span>

              {selected.roles?.map((role: any) => (
                <span
                  key={role.id}
                  className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {role.role_name}
                </span>
              ))}

            </div>

          </div>

        </div>
      </div>

      <div className="space-y-6 p-8">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Username
          </label>

          <input
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>

          <input
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            New Password
          </label>

          <input
            type="password"
            value={form.password}
            placeholder="Leave blank to keep the current password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-5">

          <div>
            <h3 className="font-medium text-gray-900">
              Active User
            </h3>

            <p className="text-sm text-gray-500">
              Allow this user to sign in.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                is_active: !form.is_active,
              })
            }
            className={`relative h-7 w-14 rounded-full transition ${
              form.is_active
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                form.is_active
                  ? "left-7"
                  : "left-0.5"
              }`}
            />
          </button>

        </div>

        <RolePicker
          roles={roles}
          selectedRoles={form.roles}
          onChange={(ids) =>
            setForm({
              ...form,
              roles: ids,
            })
          }
        />

      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 px-8 py-6">

        <button
          onClick={deleteUser}
          className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete User
        </button>

        <button
          onClick={saveUser}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}