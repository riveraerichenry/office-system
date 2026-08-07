"use client";

import axios from "axios";
import { useState } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { X } from "lucide-react";
import { Formik, Form, Field } from "formik";

type Props = {
  open: boolean;
  onClose: () => void;
  forms: any[];
  onSuccess: () => void;
};

export default function AddInventoryModal({
  open,
  onClose,
  forms,
  onSuccess,
}: Props) {
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
            className="w-full max-w-3xl rounded-[40px] bg-white shadow-xl px-10 py-12"
          >
            <div className="mb-10 flex items-center justify-between">

              <div>

                <h1
                  className="text-5xl font-extrabold"
                  style={{
                    textShadow:
                      "2px 2px 0 rgba(0,0,0,.15)",
                  }}
                >
                  Register Inventory
                </h1>

                <p className="mt-2 text-gray-500">
                  Register accountable form inventory
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
                accountable_form_id: "",
                series_from: "",
                series_to: "",
                received_date: "",
                supplier: "",
                remarks: "",
              }}
              onSubmit={async (
                values,
                { resetForm }
              ) => {
                try {

                  await axios.post(
                    "/api/smi",
                    values
                  );

                  resetForm();

                  onClose();

                  onSuccess();

                } catch (err) {
                  console.log(err);
                }
              }}
            >
              {({ values }) => {

                const qty =
                  Number(values.series_to || 0) -
                  Number(values.series_from || 0) +
                  1;

                return (

                  <Form className="space-y-7">

                    <div className="grid grid-cols-2 gap-6">

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Accountable Form
                        </label>

                        <Field
                          as="select"
                          name="accountable_form_id"
                          className="w-full rounded-xl border p-3"
                        >
                          <option value="">
                            Select Form
                          </option>

                          {forms.map((form) => (
                            <option
                              key={form.id}
                              value={form.id}
                            >
                              {form.form_name}
                            </option>
                          ))}

                        </Field>

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Received Date
                        </label>

                        <Field
                          type="date"
                          name="received_date"
                          className="w-full rounded-xl border p-3"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Series From
                        </label>

                        <Field
                          name="series_from"
                          className="w-full rounded-xl border p-3"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Series To
                        </label>

                        <Field
                          name="series_to"
                          className="w-full rounded-xl border p-3"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Quantity
                        </label>

                        <input
                          readOnly
                          value={
                            qty > 0 ? qty : 0
                          }
                          className="w-full rounded-xl border bg-gray-100 p-3"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Supplier
                        </label>

                        <Field
                          name="supplier"
                          className="w-full rounded-xl border p-3"
                        />

                      </div>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Remarks
                      </label>

                      <Field
                        as="textarea"
                        rows={4}
                        name="remarks"
                        className="w-full rounded-xl border p-3"
                      />

                    </div>

                    <button
                      type="submit"
                      className="
                        w-full
                        rounded-xl
                        bg-gradient-to-r
                        from-cyan-400
                        via-purple-400
                        to-fuchsia-500
                        py-4
                        font-bold
                        text-white
                      "
                    >
                      Register Inventory
                    </button>

                  </Form>

                );
              }}
            </Formik>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}