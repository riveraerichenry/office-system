"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

type Props = {
  open: boolean;
  request: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditRISModal({
  open,
  request,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [forms, setForms] =
    useState<any[]>([]);

  const [requestDate, setRequestDate] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [items, setItems] =
    useState<any[]>([]);

  useEffect(() => {
    if (
      open &&
      request
    ) {
      loadForms();

      setRequestDate(
        request.request_date?.substring(
          0,
          10
        ) || ""
      );

      setRemarks(
        request.remarks || ""
      );

      setItems(
        request.items || []
      );
    }
  }, [open, request]);

  async function loadForms() {
    const res =
      await axios.get(
        "/api/accountable-forms/master"
      );

    setForms(
      res.data.data
    );
  }

  function addItem() {
    setItems([
      ...items,
      {
        accountable_form_id: "",
        quantity: 1,
        remarks: "",
      },
    ]);
  }

  function removeItem(
    index: number
  ) {
    setItems(
      items.filter(
        (_, i) => i !== index
      )
    );
  }

  function updateItem(
    index: number,
    field: string,
    value: any
  ) {
    const temp = [...items];

    temp[index] = {
      ...temp[index],
      [field]: value,
    };

    setItems(temp);
  }

  async function save() {


        try {

      setLoading(true);

      await axios.put(
        `/api/ris/${request.id}`,
        {
          request_date: requestDate,
          remarks,
          items,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "RIS updated successfully.",
      });

      onSuccess();

      onClose();

    } catch (err: any) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ??
          "Unable to update request.",
      });

    } finally {

      setLoading(false);

    }
  }

  if (!open || !request)
    return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">

        <div className="border-b px-6 py-4">

          <h2 className="text-xl font-semibold">
            Edit RIS Request
          </h2>

          <p className="text-sm text-slate-500">
            Update requisition details.
          </p>

        </div>

        <div className="space-y-6 p-6">

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Request Date
              </label>

              <input
                type="date"
                value={requestDate}
                onChange={(e) =>
                  setRequestDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border px-3 py-2"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Remarks
              </label>

              <input
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border px-3 py-2"
              />

            </div>

          </div>

                    <div className="rounded-xl border">

            <div className="flex items-center justify-between border-b p-4">

              <h3 className="font-semibold">
                Requested Forms
              </h3>

              <button
                type="button"
                onClick={addItem}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Add Form
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr className="text-left text-sm">

                    <th className="px-4 py-3">
                      Accountable Form
                    </th>

                    <th className="w-32 px-4 py-3">
                      Booklets
                    </th>

                    <th className="px-4 py-3">
                      Remarks
                    </th>

                    <th className="w-24 px-4 py-3">
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {items.length === 0 && (

                    <tr>

                      <td
                        colSpan={4}
                        className="py-10 text-center text-slate-500"
                      >
                        No accountable forms added.
                      </td>

                    </tr>

                  )}

                  {items.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={index}
                        className="border-t"
                      >

                        <td className="px-4 py-3">

                          <select
                            value={
                              item.accountable_form_id
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "accountable_form_id",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                          >

                            <option value="">
                              Select Form
                            </option>

                            {forms.map(
                              (form) => (

                                <option
                                  key={form.id}
                                  value={form.id}
                                >
                                  {form.form_code}
                                  {" - "}
                                  {form.form_name}
                                </option>

                              )
                            )}

                          </select>

                        </td>

                        <td className="px-4 py-3">

                          <input
                            type="number"
                            min={1}
                            value={
                              item.quantity
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                          />

                        </td>

                        <td className="px-4 py-3">

                          <input
                            value={
                              item.remarks
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "remarks",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                          />

                        </td>

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-200"
                          >
                            Remove
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>


                    <div className="flex items-center justify-end gap-3 border-t pt-6">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border px-5 py-2.5 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Updating..."
                : "Update Request"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}