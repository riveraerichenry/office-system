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

export default function AddSMIModal({
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
      accountable_form_id:
        "",
      series: "",
      beginning_or: "",
      ending_or: "",
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

  const noOfReceipts =
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

  async function save() {
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
            className="w-[900px] rounded-[40px] bg-white px-10 py-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                Register Booklet
              </h2>

              <button
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
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
                className="w-full border-b py-3 outline-none"
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
                className="w-full border-b py-3 outline-none"
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
                value={
                  form.series
                }
                placeholder="Series"
                onChange={(e) =>
                  setForm({
                    ...form,
                    series:
                      e.target
                        .value,
                  })
                }
                className="w-full border-b py-3 outline-none"
              />

              <div className="grid grid-cols-3 gap-6">
                <input
                  value={
                    form.beginning_or
                  }
                  placeholder="Beginning OR"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      beginning_or:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b py-3 outline-none"
                />

                <input
                  value={
                    form.ending_or
                  }
                  placeholder="Ending OR"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ending_or:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border-b py-3 outline-none"
                />

                <input
                  readOnly
                  value={
                    noOfReceipts
                  }
                  className="w-full border-b bg-gray-100 py-3"
                />
              </div>

              <textarea
                rows={5}
                value={
                  form.remarks
                }
                placeholder="Remarks"
                onChange={(e) =>
                  setForm({
                    ...form,
                    remarks:
                      e.target
                        .value,
                  })
                }
                className="w-full rounded-3xl border p-4"
              />

              <button
                onClick={save}
                className="w-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 py-4 font-bold text-white"
              >
                SAVE BOOKLET
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}