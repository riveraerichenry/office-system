"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useState,
} from "react";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddBankModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] =
    useState({
      bank_code: "",
      bank_name: "",
      seq_no: 1,
      remarks: "",
    });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await axios.post(
        "/api/banks",
        form
      );

      alert("Bank added");

      onSuccess();
      onClose();

      setForm({
        bank_code: "",
        bank_name: "",
        seq_no: 1,
        remarks: "",
      });
    } catch (error) {
      console.log(error);
      alert("Failed to save");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            className="w-[720px] rounded-[40px] bg-[#f7f7f7] px-10 py-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                Add Bank
              </h2>

              <button
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <input
                  placeholder="Bank Code"
                  value={
                    form.bank_code
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bank_code:
                        e.target.value,
                    })
                  }
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />

                <input
                  type="number"
                  placeholder="Sequence No"
                  value={
                    form.seq_no
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seq_no:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />
              </div>

              <input
                placeholder="Bank Name"
                value={
                  form.bank_name
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_name:
                      e.target.value,
                  })
                }
                className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
              />

              <textarea
                rows={4}
                placeholder="Remarks"
                value={
                  form.remarks
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    remarks:
                      e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
              />

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-4 font-bold text-white"
              >
                SAVE BANK
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}