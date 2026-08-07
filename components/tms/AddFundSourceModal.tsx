"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddFundSourceModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] =
    useState({
      fund_code: "",
      acronym: "",
      seq_no: "",
      fund_name: "",
      remarks: "",
    });

  const [saving, setSaving] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setSaving(true);

      await axios.post(
        "/api/fund-sources",
        form
      );

      onSuccess();
      onClose();

      setForm({
        fund_code: "",
        acronym: "",
        seq_no: "",
        fund_name: "",
        remarks: "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
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
            transition={{
              duration: 0.25,
            }}
            className="w-full max-w-4xl rounded-[40px] bg-white shadow-xl px-10 py-12"
          >
            {/* Header */}
            <div className="mb-10 flex items-start justify-between">
              <div>
                <h1
                  className="text-5xl font-extrabold"
                  style={{
                    textShadow:
                      "2px 2px 0 rgba(0,0,0,0.15)",
                  }}
                >
                  Add Fund
                </h1>

                <p className="mt-2 text-gray-500">
                  Create new fund source
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <div className="grid grid-cols-3 gap-8">
                <Input
                  label="Fund Code"
                  value={
                    form.fund_code
                  }
                  onChange={(
                    value
                  ) =>
                    setForm({
                      ...form,
                      fund_code:
                        value,
                    })
                  }
                />

                <Input
                  label="Acronym"
                  value={
                    form.acronym
                  }
                  onChange={(
                    value
                  ) =>
                    setForm({
                      ...form,
                      acronym:
                        value,
                    })
                  }
                />

                <Input
                  label="Seq No"
                  value={
                    form.seq_no
                  }
                  onChange={(
                    value
                  ) =>
                    setForm({
                      ...form,
                      seq_no:
                        value,
                    })
                  }
                />
              </div>

              <Input
                label="Fund Name"
                value={
                  form.fund_name
                }
                onChange={(
                  value
                ) =>
                  setForm({
                    ...form,
                    fund_name:
                      value,
                  })
                }
              />

              <div>
                <label className="text-sm text-gray-700 block mb-3">
                  Remarks
                </label>

                <textarea
                  rows={5}
                  value={
                    form.remarks
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      remarks:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Enter remarks"
                  className="w-full rounded-3xl border border-gray-300 p-5 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="
                  w-full py-4 rounded-full
                  text-white font-bold tracking-wide
                  bg-gradient-to-r
                  from-cyan-400
                  via-purple-400
                  to-fuchsia-500
                  shadow-lg
                  hover:scale-[1.01]
                  transition-all
                "
              >
                {saving
                  ? "SAVING..."
                  : "SAVE FUND SOURCE"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 block mb-2">
        {label}
      </label>

      <div className="border-b border-gray-300 pb-3">
        <input
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="w-full outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}