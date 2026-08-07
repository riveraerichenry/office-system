"use client";

import axios from "axios";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { Formik, Form, Field } from "formik";

type Props = {
  open: boolean;
  onClose: () => void;
  modules: any[];
  onSuccess: () => void;
};

export default function AddUserModal({
  open,
  onClose,
  modules,
  onSuccess,
}: Props) {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            className="w-full max-w-4xl rounded-[40px] bg-white shadow-xl px-10 py-12"
          >
            <div className="mb-10 flex items-start justify-between">
              <div>
                <h1
                  className="text-5xl font-extrabold"
                  style={{
                    textShadow:
                      "2px 2px 0 rgba(0,0,0,0.15)",
                  }}
                >
                  Add User
                </h1>

                <p className="mt-2 text-gray-500">
                  Create user account
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <Formik
              initialValues={{
                username: "",
                password: "",
                role: "user",
                modules: [] as string[],
              }}
              onSubmit={async (
                values,
                { resetForm }
              ) => {
                try {
                  await axios.post(
                    "/api/users",
                    values
                  );

                  resetForm();
                  onClose();
                  onSuccess();
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              {({
                values,
                setFieldValue,
                isSubmitting,
              }) => (
                <Form className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Username */}
                    <div>
                      <label className="text-sm text-gray-700 block mb-2">
                        Username
                      </label>

                      <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                        <User
                          size={18}
                          className="text-gray-400"
                        />

                        <Field
                          name="username"
                          placeholder="Type username"
                          className="w-full outline-none"
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="text-sm text-gray-700 block mb-2">
                        Role
                      </label>

                      <Field
                        as="select"
                        name="role"
                        className="w-full border-b border-gray-300 pb-3 outline-none bg-transparent"
                      >
                        <option value="user">
                          User
                        </option>
                        <option value="admin">
                          Admin
                        </option>
                      </Field>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm text-gray-700 block mb-2">
                      Password
                    </label>

                    <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                      <Lock
                        size={18}
                        className="text-gray-400"
                      />

                      <Field
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        placeholder="Type password"
                        className="w-full outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword ? (
                          <EyeOff
                            size={18}
                          />
                        ) : (
                          <Eye
                            size={18}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Modules */}
                  <div>
                    <label className="text-sm text-gray-700 block mb-4">
                      Assign Modules
                    </label>

                    <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto">
                      {modules.map(
                        (module) => {
                          const checked =
                            values.modules.includes(
                              module.id
                            );

                          return (
                            <button
                              key={
                                module.id
                              }
                              type="button"
                              onClick={() => {
                                if (
                                  checked
                                ) {
                                  setFieldValue(
                                    "modules",
                                    values.modules.filter(
                                      (
                                        id
                                      ) =>
                                        id !==
                                        module.id
                                    )
                                  );
                                } else {
                                  setFieldValue(
                                    "modules",
                                    [
                                      ...values.modules,
                                      module.id,
                                    ]
                                  );
                                }
                              }}
                              className={`
                                rounded-2xl
                                px-4 py-4
                                text-left
                                font-medium
                                transition
                                ${
                                  checked
                                    ? `
                                      bg-gradient-to-r
                                      from-cyan-400
                                      via-purple-400
                                      to-fuchsia-500
                                      text-white
                                      shadow-lg
                                    `
                                    : `
                                      bg-gray-100
                                      hover:bg-gray-200
                                    `
                                }
                              `}
                            >
                              {
                                module.module_name
                              }
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting
                    }
                    className="
                      w-full py-4 rounded-full
                      text-white font-bold tracking-wide
                      bg-gradient-to-r
                      from-cyan-400
                      via-purple-400
                      to-fuchsia-500
                      shadow-lg
                    "
                  >
                    {isSubmitting
                      ? "SAVING..."
                      : "SAVE USER"}
                  </button>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}