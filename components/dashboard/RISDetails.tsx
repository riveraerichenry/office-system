"use client";

import axios from "axios";
import {
  Pencil,
  Check,
  Package,
  XCircle,
  Save,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useState,
  useEffect,
} from "react";

import { formatDate } from "@/lib/format";

export default function RISDetails({
  selected,
  onRefresh,
}: {
  selected: any;
  onRefresh: () => void;
}) {
  const [loading, setLoading] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [forms, setForms] =
    useState<any[]>([]);

  const [form, setForm] =
    useState<any>(null);

  const [items, setItems] =
    useState<any[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (!selected) return;

    setForm({
      fiscal_year:
        selected.fiscal_year,
      ris_date:
        selected.ris_date
          ?.split("T")[0] ||
        "",
      officer_id:
        selected.officer_id,
      remarks:
        selected.remarks || "",
    });

    setItems(
      selected.items?.map(
        (item: any) => ({
          accountable_form_id:
            item.accountable_form_id,
          quantity:
            item.quantity,
        })
      ) || []
    );

    setIsEditing(false);
  }, [selected]);

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

  function addItem() {
    setItems([
      ...items,
      {
        accountable_form_id:
          "",
        quantity: 1,
      },
    ]);
  }

  function removeItem(
    index: number
  ) {
    setItems(
      items.filter(
        (_, i) =>
          i !== index
      )
    );
  }

  function updateItem(
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



    async function handleSave() {
    if (!selected) return;

    try {
      setLoading(true);

      await axios.put(
        `/api/ris/${selected.id}`,
        {
          ...form,
          items,
        }
      );

      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    status: string
  ) {
    if (!selected) return;

    try {
      setLoading(true);

      await axios.put(
        `/api/ris/${selected.id}`,
        { status }
      );

      onRefresh();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (!selected) {
    return (
      <div className="rounded-[40px] bg-white px-8 py-12 shadow-xl">
        No RIS selected
      </div>
    );
  }

  return (
    <div className="rounded-[40px] bg-white px-8 py-8 shadow-xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1
          className="text-3xl font-extrabold"
          style={{
            textShadow:
              "2px 2px 0 rgba(0,0,0,0.15)",
          }}
        >
          RIS Details
        </h1>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={
                  handleSave
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white"
              >
                <Save size={18} />
              </button>

              <button
                onClick={() =>
                  setIsEditing(
                    false
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  setIsEditing(
                    true
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-white"
              >
                <Pencil size={18} />
              </button>

              <button
                disabled={loading}
                onClick={() =>
                  updateStatus(
                    "APP"
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white"
              >
                <Check size={18} />
              </button>

              <button
                disabled={loading}
                onClick={() =>
                  updateStatus(
                    "ISS"
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white"
              >
                <Package size={18} />
              </button>

              <button
                disabled={loading}
                onClick={() =>
                  updateStatus(
                    "CAN"
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
        </div>
      </div>


            <div className="grid grid-cols-2 gap-5">
        <Field
          label="RIS No"
          value={
            selected.ris_no
          }
        />

        <Field
          label="Status"
          value={
            selected.status
          }
        />

        <EditableField
          label="RIS Date"
          value={
            isEditing
              ? form?.ris_date
              : formatDate(
                  selected.ris_date
                )
          }
          editing={
            isEditing
          }
          type="date"
          onChange={(
            value
          ) =>
            setForm({
              ...form,
              ris_date:
                value,
            })
          }
        />

        <EditableField
          label="Fiscal Year"
          value={
            form?.fiscal_year
          }
          editing={
            isEditing
          }
          onChange={(
            value
          ) =>
            setForm({
              ...form,
              fiscal_year:
                value,
            })
          }
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase text-gray-500">
            Requested Forms
          </h2>

          {isEditing && (
            <button
              onClick={
                addItem
              }
              className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2"
            >
              <Plus size={16} />
              Add
            </button>
          )}
        </div>

        <div className="space-y-3">
          {items.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 rounded-2xl bg-gray-50 p-3"
              >
                <div className="col-span-7">
                  <select
                    disabled={!isEditing}
                    value={item.accountable_form_id}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "accountable_form_id",
                        e.target.value
                      )
                    }
                    className={`
                      w-full rounded-xl bg-transparent px-2 py-3 outline-none
                      ${
                        isEditing
                          ? "border-b border-gray-300"
                          : "border-none cursor-default appearance-none"
                      }
                    `}
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
                          -{" "}
                          {
                            af.form_name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    step={1}
                    min={1}
                    value={parseInt(item.quantity ?? 0)}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`
                      w-full rounded-xl bg-transparent px-2 py-3 outline-none
                      ${
                        isEditing
                          ? "border-b border-gray-300"
                          : "border-none text-center"
                      }
                    `}
                  />
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  {isEditing && (
                    <button
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                      className="rounded-full bg-red-100 p-3 text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-8">
        <label className="mb-2 block text-sm text-gray-500">
          Remarks
        </label>

        {isEditing ? (
          <textarea
            rows={5}
            value={
              form?.remarks
            }
            onChange={(
              e
            ) =>
              setForm({
                ...form,
                remarks:
                  e.target
                    .value,
              })
            }
            className="w-full rounded-3xl border p-4"
          />
        ) : (
          <div className="min-h-[120px] rounded-3xl border p-4">
            {selected.remarks ||
              "-"}
          </div>
        )}
      </div>

      {/* Audit Trail */}
      <div className="mt-10 rounded-3xl border border-gray-200 bg-white">
        <div className="border-b bg-gray-50 px-6 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
            Audit Trail
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-5 px-6 py-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Created By
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {selected.created_by_name || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Date Created
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {formatDate(selected.created_at)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Last Updated By
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {selected.updated_by_name || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Last Updated
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {formatDate(selected.updated_at)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Approved By
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {selected.approved_by_name || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Date Approved
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {formatDate(selected.approved_date)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Issued By
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {selected.issued_by_name || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Date Issued
            </p>

            <p className="border-b pb-2 text-sm font-semibold text-gray-800">
              {formatDate(selected.issued_date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: any) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-500">
        {label}
      </label>
      <div className="border-b pb-2 font-semibold">
        {value || "-"}
      </div>
    </div>
  );
}

type EditableFieldProps = {
  label: string;
  value: string | number;
  editing: boolean;
  type?: string;
  onChange: (
    value: string
  ) => void;
};

function EditableField({
  label,
  value,
  editing,
  onChange,
  type = "text",
}: EditableFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-500">
        {label}
      </label>

      {editing ? (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="w-full border-b pb-2 outline-none"
        />
      ) : (
        <div className="border-b pb-2 font-semibold">
          {value || "-"}
        </div>
      )}
    </div>
  );
}