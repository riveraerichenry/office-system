"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useEffect,
  useState,
} from "react";
import axios from "axios";

type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditCheckRegistrationModal({
  open,
  selected,
  onClose,
  onSuccess,
}: Props) {
  const [fundSources, setFundSources] =
    useState<any[]>([]);

  const [banks, setBanks] =
    useState<any[]>([]);

  const [bankAccounts, setBankAccounts] =
    useState<any[]>([]);

  const [form, setForm] =
    useState<any>(null);

  useEffect(() => {
    if (open && selected) {
      setForm(selected);
      fetchDropdowns();
    }
  }, [open, selected]);

  useEffect(() => {
    if (form?.bank_id) {
      fetchAccounts(
        form.bank_id
      );
    }
  }, [form?.bank_id]);

  async function fetchDropdowns() {
    try {
      const [
        fsRes,
        banksRes,
      ] = await Promise.all([
        axios.get(
          "/api/fund-sources"
        ),
        axios.get(
          "/api/banks"
        ),
      ]);

      setFundSources(
        fsRes.data.data || []
      );

      setBanks(
        banksRes.data.data || []
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchAccounts(
    bankId: string
  ) {
    try {
      const res =
        await axios.get(
          `/api/bank-accounts?bank_id=${bankId}`
        );

      setBankAccounts(
        res.data.data || []
      );
    } catch (error) {
      console.log(error);
    }
  }

  if (!form) return null;

  const noOfChecks =
    form.beginning_check &&
    form.ending_check
      ? Number(
          form.ending_check
        ) -
          Number(
            form.beginning_check
          ) +
          1
      : 0;

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await axios.put(
        `/api/check-registrations/${selected.id}`,
        form
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
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
            className="w-[950px] rounded-[40px] bg-[#f7f7f7] px-10 py-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                Edit Check Registration
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
              <input
                readOnly
                value={
                  form.book_no
                }
                className="w-full border-b border-gray-300 bg-gray-100 py-3"
              />

              <div className="grid grid-cols-2 gap-6">
                <input
                  type="number"
                  value={
                    form.fiscal_year
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fiscal_year:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  }
                  className="w-full border-b bg-transparent py-3"
                />

                <input
                  type="date"
                  value={
                    form.reg_date?.slice(
                      0,
                      10
                    )
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reg_date:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b bg-transparent py-3"
                />
              </div>

              <select
                value={
                  form.fund_source_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    fund_source_id:
                      e.target
                        .value,
                  })
                }
                className="w-full border-b py-3"
              >
                {fundSources.map(
                  (f) => (
                    <option
                      key={
                        f.id
                      }
                      value={
                        f.id
                      }
                    >
                      {f.fund_name ||
                        f.fund_source}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  form.bank_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_id:
                      e.target
                        .value,
                    bank_account_id:
                      "",
                  })
                }
                className="w-full border-b py-3"
              >
                {banks.map(
                  (bank) => (
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

              <select
                value={
                  form.bank_account_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_account_id:
                      e.target
                        .value,
                  })
                }
                className="w-full border-b py-3"
              >
                {bankAccounts.map(
                  (acc) => (
                    <option
                      key={
                        acc.id
                      }
                      value={
                        acc.id
                      }
                    >
                      {
                        acc.account_number
                      }{" "}
                      -
                      {" "}
                      {
                        acc.account_name
                      }
                    </option>
                  )
                )}
              </select>

              <div className="grid grid-cols-3 gap-6">
                <input
                  value={
                    form.beginning_check
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      beginning_check:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b py-3"
                />

                <input
                  value={
                    form.ending_check
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ending_check:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b py-3"
                />

                <input
                  readOnly
                  value={
                    noOfChecks
                  }
                  className="w-full border-b bg-gray-100 py-3"
                />
              </div>

              <textarea
                rows={4}
                value={
                  form.remarks ||
                  ""
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    remarks:
                      e.target
                        .value,
                  })
                }
                className="w-full rounded-2xl border bg-white p-4"
              />

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-4 font-bold text-white"
              >
                UPDATE CHECK REGISTRATION
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}