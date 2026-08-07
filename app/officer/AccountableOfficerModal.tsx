"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Formik, Form, Field } from "formik";
import {
  User,
  Briefcase,
  Building2,
} from "lucide-react";

type Props = {
  open: boolean;
  onSuccess: () => void;
};

export default function AccountableOfficerModal({
  open,
  onSuccess,
}: Props) {
  async function handleSubmit(
    values: any
  ) {
    try {
      await axios.post(
        "/api/accountable-officer",
        values
      );

      onSuccess();
    } catch (error) {
      console.log(error);
    }
  }

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
            className="w-full max-w-5xl rounded-[40px] bg-white px-12 py-12 shadow-2xl"
          >
            <div className="mb-10">
              <h1
                className="text-5xl font-extrabold"
                style={{
                  textShadow:
                    "2px 2px 0 rgba(0,0,0,0.15)",
                }}
              >
                Accountable Officer Setup
              </h1>

              <p className="mt-3 text-gray-500">
                Before continuing, please complete your accountable officer profile.
              </p>
            </div>

            <Formik
              initialValues={{
                first_name: "",
                middle_name: "",
                last_name: "",
                suffix: "",
                position: "",
                office: "",
                designation: "",
              }}
              onSubmit={async (
                values,
                { setSubmitting }
              ) => {
                await handleSubmit(
                  values
                );
                setSubmitting(false);
              }}
            >
              {({
                isSubmitting,
              }) => (
                <Form className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <InputField
                      name="first_name"
                      label="First Name"
                      icon={
                        <User size={18} />
                      }
                    />

                    <InputField
                      name="middle_name"
                      label="Middle Name"
                      icon={
                        <User size={18} />
                      }
                    />

                    <InputField
                      name="last_name"
                      label="Last Name"
                      icon={
                        <User size={18} />
                      }
                    />

                    <InputField
                      name="suffix"
                      label="Suffix"
                      icon={
                        <User size={18} />
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <InputField
                      name="position"
                      label="Position"
                      icon={
                        <Briefcase size={18} />
                      }
                    />

                    <InputField
                      name="office"
                      label="Office"
                      icon={
                        <Building2 size={18} />
                      }
                    />
                    <InputField
                      name="designation"
                      label="Designation"
                      icon={
                        <Building2 size={18} />
                      }
                    />
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
                      : "SAVE PROFILE"}
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

function InputField({
  name,
  label,
  icon,
}: {
  name: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-700">
        {label}
      </label>

      <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
        <div className="text-gray-400">
          {icon}
        </div>

        <Field
          name={name}
          className="w-full outline-none"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
}