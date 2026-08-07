"use client";

import axios from "axios";
import {
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

export default function SMIDetails({
  selected,
  officers = [],
  onRefresh,
}: {
  selected: any;
  officers?: any[];
  onRefresh: () => void;
}) {
  const [editing, setEditing] =
    useState(false);

  const [form, setForm] =
    useState<any>(null);

  useEffect(() => {
    setForm(selected);
    setEditing(false);
  }, [selected]);

  async function save() {
    try {
      await axios.put(
        `/api/accountable-form-inventory/${selected.id}`,
        form
      );

      setEditing(false);
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  async function remove() {
    if (!selected) return;

    const confirmed =
      confirm(
        "Delete this booklet?"
      );

    if (!confirmed) return;

    try {
      await axios.delete(
        `/api/accountable-form-inventory/${selected.id}`
      );

      onRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  if (!selected)
    return (
      <div className="rounded-[40px] bg-white p-10 shadow-xl">
        No inventory selected
      </div>
    );

  return (
    <div className="rounded-[40px] bg-white px-8 py-10 shadow-xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Receipt Info
        </h1>

        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={save}
                className="rounded-full bg-green-600 p-3 text-white"
              >
                <Check />
              </button>

              <button
                onClick={() =>
                  setEditing(false)
                }
                className="rounded-full bg-gray-200 p-3"
              >
                <X />
              </button>
            </>
          ) : (
            <>
              {selected.status !==
                "ISSUED" && (
                <>
                  <button
                    onClick={() =>
                      setEditing(
                        true
                      )
                    }
                    className="rounded-full bg-amber-500 p-3 text-white"
                  >
                    <Pencil />
                  </button>

                  <button
                    onClick={
                      remove
                    }
                    className="rounded-full bg-red-600 p-3 text-white"
                  >
                    <Trash2 />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-6">
        <Field
          label="Reference No"
          value={
            form?.reference_no
          }
        />

        <Field
          label="Fiscal Year"
          value={String(
            form?.fiscal_year
          )}
          editing={editing}
          onChange={(v) =>
            setForm({
              ...form,
              fiscal_year:
                Number(v),
            })
          }
        />

        <Field
          label="AF Code"
          value={
            form?.af_code
          }
        />

        <Field
          label="Series"
          value={
            form?.series
          }
          editing={editing}
          onChange={(v) =>
            setForm({
              ...form,
              series: v,
            })
          }
        />

        <Field
          label="Beginning OR"
          value={String(
            form?.beginning_or
          )}
          editing={editing}
          onChange={(v) =>
            setForm({
              ...form,
              beginning_or:
                v,
            })
          }
        />

        <Field
          label="Ending OR"
          value={String(
            form?.ending_or
          )}
          editing={editing}
          onChange={(v) =>
            setForm({
              ...form,
              ending_or:
                v,
            })
          }
        />

        <Field
          label="No. of Receipts"
          value={String(
            form?.no_of_receipts
          )}
        />

        <div>
          <label className="mb-2 block text-sm text-gray-500">
            Status
          </label>

          {editing ? (
            <select
              value={
                form?.status
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  status:
                    e.target
                      .value,
                })
              }
              className="w-full border-b pb-3"
            >
              <option>
                AVAILABLE
              </option>
              <option>
                ISSUED
              </option>
              <option>
                CONSUMED
              </option>
            </select>
          ) : (
            <div className="border-b pb-3 font-medium">
              {
                form?.status
              }
            </div>
          )}
        </div>

        <Field
          label="Issued Date"
          value={
            form?.issued_date
          }
        />

        <div>
          <label className="mb-2 block text-sm text-gray-500">
            Officer
          </label>

          {editing ? (
            <select
              value={
                form?.issued_to ||
                ""
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  issued_to:
                    e.target
                      .value,
                })
              }
              className="w-full border-b pb-3"
            >
              <option value="">
                None
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
          ) : (
            <div className="border-b pb-3 font-medium">
              {form?.officer_name ||
                "-"}
            </div>
          )}
        </div>
      </div>

      {/* Remarks */}
      <div className="mt-8">
        <label className="mb-2 block text-sm text-gray-500">
          Remarks
        </label>

        {editing ? (
          <textarea
            rows={5}
            value={
              form?.remarks ||
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
            className="w-full rounded-2xl border p-4"
          />
        ) : (
          <div className="min-h-[120px] rounded-2xl border p-4">
            {form?.remarks ||
              "-"}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value?: string;
  editing?: boolean;
  onChange?: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-500">
        {label}
      </label>

      {editing ? (
        <input
          value={value || ""}
          onChange={(e) =>
            onChange?.(
              e.target.value
            )
          }
          className="w-full border-b pb-3 outline-none"
        />
      ) : (
        <div className="border-b pb-3 font-medium">
          {value || "-"}
        </div>
      )}
    </div>
  );
}