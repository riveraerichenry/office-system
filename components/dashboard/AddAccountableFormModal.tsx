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

export default function AddAccountableFormModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const currentYear =
    new Date().getFullYear();

  const [forms, setForms] =
    useState<any[]>([]);

  const [form, setForm] =
    useState({
      fiscal_year:
        currentYear,
      accountable_form_id: "",
      series: "",
      beginning_or: "",
      ending_or: "",
      status: "AVAILABLE",
      remarks: "",
    });

  useEffect(() => {
    if (open) {
      fetchForms();
    }
  }, [open]);

  async function fetchForms() {
    try {
      const res =
        await axios.get(
          "/api/accountable-forms/master"
        );

      setForms(
        res.data.data || []
      );
    } catch (error) {
      console.log(error);
    }
  }

  const qty =
    form.beginning_or &&
    form.ending_or
      ? Number(
          form.ending_or
        ) -
          Number(
            form.beginning_or
          ) +
          1
      : 0;

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await axios.post(
        "/api/accountable-form-inventory",
        form
      );

      onSuccess();
      onClose();

      setForm({
        fiscal_year:
          currentYear,
        accountable_form_id:
          "",
        series: "",
        beginning_or: "",
        ending_or: "",
        status:
          "AVAILABLE",
        remarks: "",
      });
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
                Add Accountable Form
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
                className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
              />

              <select
                value={
                  form.accountable_form_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    accountable_form_id:
                      e.target
                        .value,
                  })
                }
                className="w-full border-b border-gray-300 bg-transparent py-3"
              >
                <option value="">
                  Select AF
                </option>

                {forms.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.af_code
                      }{" "}
                      -{" "}
                      {
                        item.form_name
                      }
                    </option>
                  )
                )}
              </select>

              <input
                placeholder="Series"
                value={
                  form.series
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    series:
                      e.target
                        .value,
                  })
                }
                className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
              />

              <div className="grid grid-cols-3 gap-6">
                <input
                  placeholder="Beginning OR"
                  value={
                    form.beginning_or
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      beginning_or:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />

                <input
                  placeholder="Ending OR"
                  value={
                    form.ending_or
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ending_or:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b border-gray-300 bg-transparent py-3 outline-none"
                />

                <input
                  readOnly
                  value={qty}
                  className="w-full border-b border-gray-300 bg-gray-100 py-3 px-2 outline-none"
                />
              </div>

              <select
                value={
                  form.status
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target
                        .value,
                  })
                }
                className="w-full border-b border-gray-300 bg-transparent py-3"
              >
                <option value="AVAILABLE">
                  AVAILABLE
                </option>
                <option value="CANCELLED">
                  CANCELLED
                </option>
              </select>

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
                SAVE ACCOUNTABLE FORM
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}