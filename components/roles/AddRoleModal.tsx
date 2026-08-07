"use client";

import { useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddRoleModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    role_name: "",
    description: "",
    is_active: true,
  });

  async function saveRole() {
    try {
      await axios.post("/api/roles", form);

      setForm({
        role_name: "",
        description: "",
        is_active: true,
      });

      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to create role.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: .95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .95 }}
            className="w-full max-w-xl rounded-[36px] bg-white p-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold">
                Add Role
              </h2>

              <button onClick={onClose}>
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Role Name
                </label>

                <input
                  value={form.role_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role_name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">

                <div>
                  <h3 className="font-semibold">
                    Active
                  </h3>

                  <p className="text-sm text-gray-500">
                    Allow users to use this role.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_active: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button
                onClick={onClose}
                className="rounded-xl border px-6 py-3"
              >
                Cancel
              </button>

              <button
                onClick={saveRole}
                className="rounded-xl bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 px-8 py-3 font-bold text-white"
              >
                Save Role
              </button>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}