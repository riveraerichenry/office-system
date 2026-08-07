"use client";


import axios from "axios";
import Swal from "sweetalert2";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  CalendarDays,
  User,
  Package,
} from "lucide-react";

type Item = {
  accountable_form_id: string;
  form_code: string;
  form_name: string;
  quantity: number;
};
type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RegisterRISModal({
  open,
  onClose,
  onSuccess,
}: Props) {

  const [forms, setForms] = useState<any[]>([]);
  const [requestDate, setRequestDate] = useState("");
  const [requestedBy, setRequestedBy] = useState("");

  const [items, setItems] = useState<Item[]>([
  {
    accountable_form_id: "",
    form_code: "",
    form_name: "",
    quantity: 1,
  },
]);

  useEffect(() => {
  if (!open) return;

  setRequestDate(new Date().toLocaleString());

  setItems([
    {
      accountable_form_id: "",
      form_code: "",
      form_name: "",
      quantity: 1,
    },
  ]);

  loadForms();
  loadCurrentUser();

}, [open]);



  async function loadCurrentUser() {
  try {
    const res = await axios.get("/api/profile");

    console.log(res.data);

    if (res.data.success) {
      setRequestedBy(res.data.data.full_name);
    }

  } catch (err) {
    console.error(err);

    setRequestedBy("");
  }
}

  async function loadForms() {
    try {
      const res = await axios.get(
        "/api/accountable-forms/master"
      );

      setForms(res.data.data ?? []);

    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        "Unable to load accountable forms.",
        "error"
      );
    }
  }

  if (!open) return null;

  function addItem() {
  setItems((prev) => [
    ...prev,
    {
      accountable_form_id: "",
      form_code: "",
      form_name: "",
      quantity: 1,
    },
  ]);
}
  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(
    index: number,
    field: keyof Item,
    value: any
  ) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  const totalQuantity = items.reduce(
    (a, b) => a + Number(b.quantity || 0),
    0
  );

  async function submit() {
  if (items.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "No Items",
      text: "Please add at least one accountable form.",
    });
    return;
  }

  for (const item of items) {
    if (!item.accountable_form_id) {
      Swal.fire({
        icon: "warning",
        title: "Accountable Form Required",
        text: "Please select an accountable form for every row.",
      });
      return;
    }

    if (!item.quantity || item.quantity < 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be at least 1.",
      });
      return;
    }
  }

  try {
    const res = await axios.post("/api/ris", {
      request_date: new Date().toISOString(),
      remarks: "",
      items: items.map((item) => ({
        accountable_form_id: item.accountable_form_id,
        quantity: item.quantity,
        remarks: "",
      })),
    });

    if (res.data.success) {
      Swal.fire({
        icon: "success",
        title: "Request Submitted",
        text: `RIS No. ${res.data.data.ris_no} has been created.`,
      });

      onSuccess();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.data.message,
      });
    }
  } catch (err: any) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        err.response?.data?.message ??
        "Unable to submit RIS request.",
    });
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">

      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b bg-blue-700 px-6 py-4 text-white">

          <div>

            <h2 className="text-xl font-semibold">
              Request Booklet
            </h2>

            <p className="text-sm text-blue-100">
              Request accountable forms
            </p>

          </div>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        {/* BODY */}

        <div className="space-y-6 p-6">

          {/* REQUEST INFO */}

          <div className="rounded-xl border">

            <div className="border-b bg-slate-50 px-5 py-3">

              <h3 className="font-semibold text-slate-800">
                Request Information
              </h3>

            </div>

            <div className="grid grid-cols-2 gap-5 p-5">

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-medium">

                  <CalendarDays size={16} />

                  Date & Time

                </label>

                <input
                  readOnly
                  value={requestDate}
                  className="w-full rounded-lg border bg-slate-100 px-3 py-2"
                />

              </div>

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-medium">

                  <User size={16} />

                  Requested By

                </label>

                <input
                  readOnly
                  value={requestedBy}
                  className="w-full rounded-lg border bg-slate-100 px-3 py-2"
                />

              </div>

            </div>

          </div>

          {/* ITEMS */}

          <div className="rounded-xl border">

            <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-3">

              <h3 className="font-semibold text-slate-800">
                Requested Items
              </h3>

              <button
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                <Plus size={18} />

                Add Item

              </button>

            </div>

            <div className="overflow-auto">

              <table className="w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="px-4 py-3 text-left">
                      #
                    </th>

                    <th className="px-4 py-3 text-left">
                        Code
                    </th>

                    <th className="px-4 py-3 text-left">
                        Accountable Form
                    </th>

                    <th className="px-4 py-3 text-center">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {items.map((item, index) => (

                    <tr
                      key={index}
                      className="border-t"
                    >

                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                        <td className="px-4 py-3 font-medium text-blue-700">
                        {item.form_code || "-"}
                    </td>

                    <td className="px-4 py-3">

                        <select
                            value={item.accountable_form_id}
                            onChange={(e) => {

                                const form = forms.find(
                                    (x) => x.id === e.target.value
                                );

                                if (!form) return;

                                const updated = [...items];

                                updated[index] = {
                                    ...updated[index],
                                    accountable_form_id: form.id,
                                    form_code: form.form_code,
                                    form_name: form.form_name,
                                    quantity: updated[index].quantity,
                                };

                                setItems(updated);

                            }}
                            className="w-full rounded-lg border px-3 py-2"
                        >

                            <option value="">
                                Select Accountable Form
                            </option>

                            {forms
                              .filter((form) => {
                                  return (
                                      form.id === item.accountable_form_id ||
                                      !items.some(
                                          (selected) =>
                                              selected.accountable_form_id === form.id
                                      )
                                  );
                              })
                              .map((form) => (

                                  <option
                                      key={form.id}
                                      value={form.id}
                                  >
                                      {form.form_name}
                                  </option>

                          ))}

                        </select>

                    </td>

                      <td className="px-4 py-3 text-center">

                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                                index,
                                "quantity",
                                Math.max(1, Number(e.target.value))
                            )
                        }
                          className="w-24 rounded-lg border px-3 py-2 text-center"
                        />

                      </td>

                      <td className="px-4 py-3 text-center">

                        <button
                          onClick={() =>
                            removeItem(index)
                          }
                          disabled={items.length === 1}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-30"
                        >
                          <Trash2 size={18} />
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-5 py-4">

            <div className="flex items-center gap-2">

              <Package size={18} />

              <span className="font-medium">
                Total Items: {items.length}
              </span>

            </div>

            <div className="font-semibold text-blue-700">

              Total Quantity : {totalQuantity}

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Submit Request
          </button>

        </div>

      </div>

    </div>
  );
}