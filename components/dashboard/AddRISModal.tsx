"use client";

import axios from "axios";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Plus,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddRISModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const currentYear =
    new Date().getFullYear();

  const [forms, setForms] =
    useState<any[]>([]);

  const [officers, setOfficers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      fiscal_year:
        currentYear,
      ris_date:
        new Date()
          .toISOString()
          .split("T")[0],
      officer_id: "",
      remarks: "",
    });

  const [items, setItems] =
    useState([
      {
        accountable_form_id:
          "",
        quantity: 1,
      },
    ]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  async function fetchData() {
    try {
      const [
        formsRes,
        officersRes,
      ] = await Promise.all([
        axios.get(
          "/api/accountable-forms/master"
        ),
        axios.get(
          "/api/accountable-officer/list"
        ),
      ]);

      setForms(
        formsRes.data.data ||
          []
      );

      setOfficers(
        officersRes.data.data ||
          []
      );
    } catch (error) {
      console.log(error);
    }
  }

  function addRow() {
    setItems([
      ...items,
      {
        accountable_form_id:
          "",
        quantity: 1,
      },
    ]);
  }

  function removeRow(
    index: number
  ) {
    setItems(
      items.filter(
        (_, i) =>
          i !== index
      )
    );
  }

  function updateRow(
    index: number,
    field: string,
    value: any
  ) {
    const clone = [
      ...items,
    ];

    clone[index] = {
      ...clone[index],
      [field]: value,
    };

    setItems(clone);
  }

  async function save() {
    try {
      setLoading(true);

      await axios.post(
        "/api/ris",
        {
          ...form,
          items,
        }
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
            className="w-[1200px] rounded-[40px] bg-white px-10 py-8 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                Create RIS
              </h2>

              <button
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            {/* Header Fields */}
            <div className="grid grid-cols-2 gap-8">
              <Field
                label="Fiscal Year"
              >
                <input
                  type="number"
                  value={
                    form.fiscal_year
                  }
                  onChange={(
                    e
                  ) =>
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
                  className="w-full border-b py-3 outline-none"
                />
              </Field>

              <Field label="Status">
                <input
                  value="ACT"
                  readOnly
                  className="w-full border-b py-3 bg-gray-50"
                />
              </Field>

              <Field label="RIS Date">
                <input
                  type="date"
                  value={
                    form.ris_date
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      ris_date:
                        e
                          .target
                          .value,
                    })
                  }
                  className="w-full border-b py-3 outline-none"
                />
              </Field>

              <Field label="Officer">
                <select
                  value={
                    form.officer_id
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      officer_id:
                        e
                          .target
                          .value,
                    })
                  }
                  className="w-full border-b py-3 outline-none"
                >
                  <option value="">
                    Select Officer
                  </option>

                  {officers.map(
                    (
                      officer
                    ) => (
                      <option
                        key={
                          officer.id
                        }
                        value={
                          officer.id
                        }
                      >
                        {
                          officer.first_name
                        }{" "}
                        {
                          officer.last_name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>
            </div>

            {/* Items */}
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  Requested Forms
                </h3>

                <button
                  onClick={addRow}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="grid grid-cols-12 gap-4 rounded-3xl bg-gray-50 p-4"
                    >
                      <div className="col-span-6">
                        <select
                          value={
                            item.accountable_form_id
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "accountable_form_id",
                              e
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        >
                          <option value="">
                            Select AF
                          </option>

                          {forms.map(
                            (
                              af
                            ) => (
                              <option
                                key={
                                  af.id
                                }
                                value={
                                  af.id
                                }
                              >
                                {
                                  af.af_code
                                }{" "}
                                -
                                {
                                  af.form_name
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="col-span-4">
                        <input
                          type="number"
                          min={1}
                          value={
                            item.quantity
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "quantity",
                              Number(
                                e
                                  .target
                                  .value
                              )
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          onClick={() =>
                            removeRow(
                              index
                            )
                          }
                          disabled={
                            items.length ===
                            1
                          }
                          className="rounded-full bg-red-100 p-3 text-red-600 disabled:opacity-40"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Remarks */}
            <div className="mt-8">
              <textarea
                rows={4}
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
                className="w-full rounded-3xl border p-5"
              />
            </div>

            {/* Save */}
            <button
              disabled={loading}
              onClick={save}
              className="
                mt-8 w-full rounded-full
                bg-gradient-to-r
                from-cyan-400
                via-purple-400
                to-fuchsia-500
                py-4 font-bold text-white
              "
            >
              SAVE RIS
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: any) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}