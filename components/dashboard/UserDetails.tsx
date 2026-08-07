"use client";

import axios from "axios";
import {
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { moduleIcons } from "@/lib/module-icons";

export default function UserDetails({
  selected,
  modules,
  onRefresh,
}: {
  selected: any;
  modules: any[];
  onRefresh: () => void;
}) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [form, setForm] =
    useState<any>(null);

  const [showPicker, setShowPicker] =
    useState(false);

  useEffect(() => {
    setForm({
      ...selected,
      password: "",
    });

    setIsEditing(false);
    setShowPicker(false);
  }, [selected]);

  async function handleDelete() {
    if (!selected) return;

    const confirmed = confirm(
      "Delete this user?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `/api/users/${selected.id}`
      );
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSave() {
    try {
      await axios.put(
        `/api/users/${selected.id}`,
        form
      );

      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleAddModule(
    moduleId: string
  ) {
    try {
      await axios.post(
        `/api/users/${selected.id}/modules`,
        {
          module_id: moduleId,
        }
      );

      setForm({
        ...form,
        modules: [
          ...form.modules,
          moduleId,
        ],
      });

      setShowPicker(false);
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleRemoveModule(
    moduleId: string
  ) {
    try {
      await axios.delete(
        `/api/users/${selected.id}/modules`,
        {
          data: {
            module_id: moduleId,
          },
        }
      );

      setForm({
        ...form,
        modules:
          form.modules.filter(
            (id: string) =>
              id !== moduleId
          ),
      });

      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  if (!selected) {
    return (
      <div className="rounded-[40px] bg-white shadow-xl px-10 py-14">
        No user selected
      </div>
    );
  }

  const assignedModules =
    modules.filter((m) =>
      form?.modules?.includes(m.id)
    );

  const unassignedModules =
    modules.filter(
      (m) =>
        !form?.modules?.includes(m.id)
    );

  return (
    <div className="rounded-[40px] bg-white shadow-xl px-10 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold">
          User Details
        </h1>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-lg"
              >
                <Check size={18} />
              </button>

              <button
                onClick={() => {
                  setForm({
                    ...selected,
                    password: "",
                  });
                  setIsEditing(false);
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
                  setIsEditing(true)
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={
                  handleDelete
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <EditableField
          label="Username"
          value={form?.username}
          editing={isEditing}
          onChange={(value) =>
            setForm({
              ...form,
              username: value,
            })
          }
        />

        <div>
          <label className="text-sm text-gray-700 block mb-2">
            Role
          </label>

          {isEditing ? (
            <select
              value={form?.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role:
                    e.target.value,
                })
              }
              className="w-full border-b border-gray-300 pb-3 outline-none"
            >
              <option value="user">
                User
              </option>
              <option value="admin">
                Admin
              </option>
            </select>
          ) : (
            <div className="border-b border-gray-300 pb-3 font-medium">
              {form?.role}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <EditableField
          label="New Password"
          value={form?.password}
          editing={isEditing}
          password
          placeholder="Leave blank to keep current password"
          onChange={(value) =>
            setForm({
              ...form,
              password: value,
            })
          }
        />
      </div>

      <div className="mt-8">
        <label className="text-sm text-gray-700 block mb-2">
          Status
        </label>

        {isEditing ? (
          <select
            value={
              form?.is_active
                ? "true"
                : "false"
            }
            onChange={(e) =>
              setForm({
                ...form,
                is_active:
                  e.target
                    .value ===
                  "true",
              })
            }
            className="w-full border-b border-gray-300 pb-3 outline-none"
          >
            <option value="true">
              Active
            </option>
            <option value="false">
              Inactive
            </option>
          </select>
        ) : (
          <div className="border-b border-gray-300 pb-3 font-medium">
            {form?.is_active
              ? "Active"
              : "Inactive"}
          </div>
        )}
      </div>

      {/* Assigned Modules */}
      <div className="mt-10 relative">
        <div className="mb-4 flex items-center justify-between">
          <label className="font-medium text-gray-700">
            Assigned Modules
          </label>

          <button
            onClick={() =>
              setShowPicker(
                !showPicker
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white"
          >
            <Plus size={18} />
          </button>
        </div>

        {showPicker && (
          <div className="mb-4 rounded-2xl border bg-white p-3 shadow-lg">
            {unassignedModules.length ===
            0 ? (
              <div className="text-sm text-gray-500">
                No more modules
              </div>
            ) : (
              unassignedModules.map(
                (module) => (
                  <button
                    key={
                      module.id
                    }
                    onClick={() =>
                      handleAddModule(
                        module.id
                      )
                    }
                    className="block w-full rounded-xl px-3 py-2 text-left hover:bg-gray-50"
                  >
                    {
                      module.module_name
                    }
                  </button>
                )
              )
            )}
          </div>
        )}

        <div className="space-y-3">
          {assignedModules.map(
            (module) => {
              const Icon =
                moduleIcons[
                  module.icon
                ];

              return (
                <div
                  key={
                    module.id
                  }
                  className="flex items-center justify-between rounded-2xl border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {Icon && (
                      <Icon
                        size={18}
                      />
                    )}

                    <span className="font-medium">
                      {
                        module.module_name
                      }
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleRemoveModule(
                        module.id
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  editing,
  onChange,
  password = false,
  placeholder,
}: {
  label: string;
  value: string;
  editing?: boolean;
  password?: boolean;
  placeholder?: string;
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
          type={
            password
              ? "password"
              : "text"
          }
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) =>
            onChange?.(
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