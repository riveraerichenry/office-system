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
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddCheckRegistrationModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const currentYear =
    new Date().getFullYear();

  const [fundSources, setFundSources] =
    useState<any[]>([]);

  const [banks, setBanks] =
    useState<any[]>([]);

  const [bankAccounts, setBankAccounts] =
    useState<any[]>([]);

  const [form, setForm] =
  useState({
    fiscal_year:
      currentYear,
    reg_date: new Date()
      .toISOString()
      .split("T")[0],
    fund_source_id: "",
    bank_id: "",
    bank_account_id: "",
    beginning_check: "",
    ending_check: "",
    remarks: "",
    status: "ACTIVE",
    last_ref_no: "",
  });

  useEffect(() => {
    if (open) {
      fetchDropdowns();
    }
  }, [open]);

  useEffect(() => {
    if (form.bank_id) {
      fetchAccounts();
    }
  }, [form.bank_id]);

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
        fsRes.data.data ||
          []
      );

      setBanks(
        banksRes.data.data ||
          []
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchAccounts() {
  try {
    const res =
      await axios.get(
        `/api/bank-accounts?bank_id=${form.bank_id}`
      );

    setBankAccounts(
      res.data.data || []
    );
  } catch (error) {
    console.log(error);
  }
}

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

  console.log(form);

  try {
    await axios.post(
      "/api/check-registrations",
      form
    );

    onSuccess();
    onClose();
  } catch (error: any) {
    console.log(
      error.response?.data
    );

    alert(
      error.response?.data
        ?.error ||
        "Save failed"
    );
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
                Check Registration
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
                  type="number"
                  value={
                    form.fiscal_year
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fiscal_year:
                        Number(
                          e
                            .target
                            .value
                        ),
                    })
                  }
                  placeholder="Fiscal Year"
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />

                <input
                    type="date"
                    value={form.reg_date}
                    onChange={(e) =>
                        setForm({
                        ...form,
                        reg_date:
                            e.target.value,
                        })
                    }
                    className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                    />
              </div>

              <select
                className="w-full border-b border-gray-300 bg-transparent py-3"
                onChange={(e) =>
                  setForm({
                    ...form,
                    fund_source_id:
                      e.target
                        .value,
                  })
                }
              >
                <option>
                  Select Fund Source
                </option>

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
                      {
                        f.fund_name
                      }
                    </option>
                  )
                )}
              </select>

              <select
                value={form.bank_id}
                className="w-full border-b border-gray-300 bg-transparent py-3"
                onChange={(e) =>
                    setForm({
                    ...form,
                    bank_id:
                        e.target.value,
                    bank_account_id:
                        "",
                    })
                }
                >
                <option value="">
                    Select Bank
                </option>

                {banks.map((bank) => (
                    <option
                    key={bank.id}
                    value={bank.id}
                    >
                    {bank.bank_name}
                    </option>
                ))}
                </select>

              <select
                className="w-full border-b border-gray-300 bg-transparent py-3"
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_account_id:
                      e.target
                        .value,
                  })
                }
              >
                <option>
                  Select Account
                </option>

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
                  placeholder="Beginning Check"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      beginning_check:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />

                <input
                  placeholder="Ending Check"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ending_check:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />

                <input
                  readOnly
                  value={
                    noOfChecks
                  }
                  placeholder="No of Checks"
                  className="w-full border-b border-gray-300 bg-gray-100 py-3 outline-none"
                />
              </div>

              <textarea
                rows={4}
                placeholder="Remarks"
                onChange={(e) =>
                  setForm({
                    ...form,
                    remarks:
                      e.target
                        .value,
                  })
                }
                className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none"
              />

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-4 font-bold text-white"
              >
                SAVE CHECK REGISTRATION
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}