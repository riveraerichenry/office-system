"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import RolePicker from "./RolePicker";

type Props = {
  open: boolean;
  onClose: () => void;
  roles: any[];
  onSuccess: () => void;
  user?: any;
};

export default function AddUserModal({
  open,
  onClose,
  roles,
  onSuccess,
  user,
}: Props) {
  const isEdit = !!user;

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    password: "",
    is_active: true,
    roles: [] as string[],
  });

  useEffect(() => {
    if (!open) return;

    if (user) {
      setForm({
        username: user.username,
        full_name: user.full_name,
        password: "",
        is_active: user.is_active,
        roles:
          user.roles?.map(
            (r: any) => r.id
          ) || [],
      });
    } else {
      setForm({
        username: "",
        full_name: "",
        password: "",
        is_active: true,
        roles: [],
      });
    }
  }, [open, user]);

  async function handleSubmit() {
    try {
      if (isEdit) {
        await axios.put(
          `/api/users/${user.id}`,
          form
        );
      } else {
        await axios.post(
          "/api/users",
          form
        );
      }

      onClose();
      onSuccess();
    } catch (err) {
      console.log(err);
      alert("Failed to save user.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              flex
              w-full
              max-w-3xl
              max-h-[90vh]
              flex-col
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-2xl
            "
          >

            {/* Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-8 py-6">

              <div>

                <h1 className="text-2xl font-semibold text-gray-900">
                  {isEdit
                    ? "Edit User"
                    : "Create User"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Create and manage user accounts.
                </p>

              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-8">

              {/* Username */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Username
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5">

                  <User
                    size={18}
                    className="text-gray-400"
                  />

                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        username:
                          e.target.value,
                      })
                    }
                    placeholder="Username"
                    className="w-full text-sm outline-none"
                  />

                </div>

              </div>

              {/* Full Name */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      full_name:
                        e.target.value,
                    })
                  }
                  placeholder="Full name"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-2.5
                    text-sm
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    focus:outline-none
                  "
                />

              </div>

                           {/* Password */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                  <Lock
                    size={18}
                    className="text-gray-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password:
                          e.target.value,
                      })
                    }
                    placeholder={
                      isEdit
                        ? "Leave blank to keep current password"
                        : "Password"
                    }
                    className="w-full text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Status */}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-5">

                <div>

                  <h3 className="font-medium text-gray-900">
                    Active User
                  </h3>

                  <p className="text-sm text-gray-500">
                    Allow this user to sign in to the system.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      is_active:
                        !form.is_active,
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

              {/* Roles */}

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

            {/* Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-8 py-5">

              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="
                  rounded-lg
                  bg-blue-600
                  px-6
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                {isEdit
                  ? "Save Changes"
                  : "Create User"}
              </button>

            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}