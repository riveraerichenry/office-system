"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import IconPicker from "../ui/IconPicker";

interface Module {
  id: string;
  module_name: string;
  icon: string;
  path: string;
  description?: string;
  sort_order?: number;
  background_color?: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  module: Module | null;
};

const COLORS = [
  { name: "Blue", value: "#4F6BFF" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Green", value: "#22C55E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#A855F7" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Slate", value: "#64748B" },
  { name: "Gray", value: "#6B7280" },
];

const defaultForm = {
  module_name: "",
  icon: "",
  path: "",
  description: "",
  sort_order: 1,
  background_color: "#4F6BFF",
};

export default function AddModuleModal({
  open,
  onClose,
  module,
}: Props) {


  const isEdit = !!module;

  const [form, setForm] =
    useState(defaultForm);

  useEffect(() => {
  if (!open) return;

  if (module) {
    setForm({
      module_name: module.module_name,
      icon: module.icon,
      path: module.path,
      description: module.description ?? "",
      sort_order: module.sort_order ?? 1,
      background_color:
        module.background_color ?? "#4F6BFF",
    });
  } else {
    setForm(defaultForm);
  }
}, [module, open]);




  async function handleDelete() {
  if (!module) return;

  const confirmed = confirm(
    `Delete "${module.module_name}"?`
  );

  if (!confirmed) return;

  try {
    await axios.delete(
      `/api/modules/${module.id}`
    );

    alert("Module deleted.");

    onClose();
  } catch (error) {
    console.error(error);

    alert("Unable to delete module.");
  }
}

  async function handleSubmit(
  e: React.FormEvent
) {
  e.preventDefault();

  try {
    if (isEdit) {
      await axios.put(
        `/api/modules/${module!.id}`,
        form
      );

      alert("Module updated successfully.");
    } else {
      await axios.post(
        "/api/modules",
        form
      );

      alert("Module added successfully.");
    }

    onClose();
  } catch (error) {
    console.error(error);

    alert(
      isEdit
        ? "Failed to update module."
        : "Failed to save module."
    );
  }
}

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-[720px] rounded-[40px] bg-[#f7f7f7] px-10 py-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                {isEdit ? "Edit Module" : "Add Module"}
              </h2>

              <button
                onClick={onClose}
                className="text-2xl"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Module Name */}
              <input
                placeholder="Module Name"
                value={form.module_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    module_name: e.target.value,
                  })
                }
                className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
              />

              {/* Icon + Sort */}
              <div className="grid grid-cols-2 gap-6">
                <IconPicker
                  value={form.icon}
                  onChange={(icon) =>
                    setForm({
                      ...form,
                      icon,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Sort Order"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sort_order: Number(e.target.value),
                    })
                  }
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />
              </div>

              {/* Path */}
              <input
                placeholder="/dashboard/users"
                value={form.path}
                onChange={(e) =>
                  setForm({
                    ...form,
                    path: e.target.value,
                  })
                }
                className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
              />

              {/* Description */}
              <textarea
                rows={4}
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
              />

              {/* Color */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Preset Color
                  </label>

                  <select
                    value={form.background_color}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        background_color: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none"
                  >
                    {COLORS.map((color) => (
                      <option
                        key={color.value}
                        value={color.value}
                      >
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Custom Color
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border bg-white p-2">
                    <input
                      type="color"
                      value={form.background_color}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          background_color: e.target.value,
                        })
                      }
                      className="h-10 w-14 cursor-pointer border-0 bg-transparent"
                    />

                    <span className="font-mono">
                      {form.background_color}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Preview
                </label>

                <div className="flex items-center gap-4">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl text-white shadow-lg"
                    style={{
                      backgroundColor:
                        form.background_color,
                    }}
                  >
                    ★
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {form.module_name ||
                        "Module Name"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {form.description ||
                        "Module description"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">

  {isEdit ? (
    <button
      type="button"
      onClick={handleDelete}
      className="
        rounded-full
        bg-red-500
        px-6
        py-3
        font-semibold
        text-white
        transition
        hover:bg-red-600
      "
    >
      Delete
    </button>
  ) : (
    <div />
  )}

  <div className="flex gap-3">

    <button
      type="button"
      onClick={onClose}
      className="
        rounded-full
        border
        border-gray-300
        px-6
        py-3
        font-semibold
        hover:bg-gray-100
      "
    >
      Cancel
    </button>

    <button
      type="submit"
      className="
        rounded-full
        bg-gradient-to-r
        from-cyan-400
        to-fuchsia-500
        px-8
        py-3
        font-bold
        text-white
      "
    >
      {isEdit
        ? "Update Module"
        : "Save Module"}
    </button>

  </div>

</div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}