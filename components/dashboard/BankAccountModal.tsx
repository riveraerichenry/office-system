"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useState,
} from "react";
import axios from "axios";

export default function AddBankAccountModal({
  open,
  onClose,
  onSuccess,
  banks,
}: any) {
  const [form, setForm] =
    useState({
      sequence_code: "",
      bank_id: "",
      account_number: "",
      account_name: "",
      remarks: "",
      account_status:
        "ACTIVE",
      deposit_label: "",
    });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await axios.post(
      "/api/bank-accounts",
      form
    );

    onSuccess();
    onClose();
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
            className="w-[800px] rounded-[40px] bg-[#f7f7f7] px-10 py-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                Add Bank Account
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
                  placeholder="Sequence Code"
                  className="w-full border-b bg-transparent py-3"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sequence_code:
                        e.target
                          .value,
                    })
                  }
                />

                <select
                  className="w-full border-b bg-transparent py-3"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bank_id:
                        e.target
                          .value,
                    })
                  }
                >
                  <option>
                    Select Bank
                  </option>

                  {banks.map(
                    (bank: any) => (
                      <option
                        key={
                          bank.id
                        }
                        value={
                          bank.id
                        }
                      >
                        {
                          bank.bank_name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <input
                placeholder="Account Number"
                className="w-full border-b bg-transparent py-3"
                onChange={(e) =>
                  setForm({
                    ...form,
                    account_number:
                      e.target.value,
                  })
                }
              />

              <input
                placeholder="Account Name"
                className="w-full border-b bg-transparent py-3"
                onChange={(e) =>
                  setForm({
                    ...form,
                    account_name:
                      e.target.value,
                  })
                }
              />

              <textarea
                rows={3}
                placeholder="Remarks"
                className="w-full rounded-2xl border bg-white p-4"
                onChange={(e) =>
                  setForm({
                    ...form,
                    remarks:
                      e.target.value,
                  })
                }
              />

              <input
                placeholder="Deposit Label"
                className="w-full border-b bg-transparent py-3"
                onChange={(e) =>
                  setForm({
                    ...form,
                    deposit_label:
                      e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-4 font-bold text-white"
              >
                SAVE ACCOUNT
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}