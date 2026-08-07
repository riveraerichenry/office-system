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

type Bank = {
  id: string;
  bank_name: string;
};

type Props = {
  selected: any;
  banks: Bank[];
  onRefresh: () => void;
};

export default function BankAccountDetails({
  selected,
  banks,
  onRefresh,
}: Props) {
  const [editing, setEditing] =
    useState(false);

  const [form, setForm] =
    useState<any>(null);

  useEffect(() => {
    setForm(selected);
    setEditing(false);
  }, [selected]);

  async function save() {
    await axios.put(
      `/api/bank-accounts/${selected.id}`,
      form
    );

    setEditing(false);
    onRefresh();
  }

  async function remove() {
    await axios.delete(
      `/api/bank-accounts/${selected.id}`
    );

    onRefresh();
  }

  if (!selected)
    return (
      <div className="rounded-[40px] bg-white p-10 shadow-xl">
        No selected bank account
      </div>
    );

  return (
    <div className="rounded-[40px] bg-white px-10 py-12 shadow-xl">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Bank Account Details
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
              <button
                onClick={() =>
                  setEditing(true)
                }
                className="rounded-full bg-amber-500 p-3 text-white"
              >
                <Pencil />
              </button>

              <button
                onClick={remove}
                className="rounded-full bg-red-600 p-3 text-white"
              >
                <Trash2 />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Field
          label="Sequence Code"
          value={
            form?.sequence_code
          }
          editing={editing}
          onChange={(
            v: string
          ) =>
            setForm({
              ...form,
              sequence_code:
                v,
            })
          }
        />

        <div>
          <label className="mb-2 block text-sm text-gray-500">
            Bank
          </label>

          {editing ? (
            <select
              value={
                form?.bank_id
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  bank_id:
                    e.target
                      .value,
                })
              }
              className="w-full border-b pb-3"
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
          ) : (
            <div className="border-b pb-3 font-medium">
              {selected.bank_name}
            </div>
          )}
        </div>

        <Field
          label="Account Number"
          value={
            form?.account_number
          }
          editing={editing}
          onChange={(
            v: string
          ) =>
            setForm({
              ...form,
              account_number:
                v,
            })
          }
        />

        <Field
          label="Account Name"
          value={
            form?.account_name
          }
          editing={editing}
          onChange={(
            v: string
          ) =>
            setForm({
              ...form,
              account_name:
                v,
            })
          }
        />

        <Field
          label="Status"
          value={
            form?.account_status
          }
          editing={editing}
          onChange={(
            v: string
          ) =>
            setForm({
              ...form,
              account_status:
                v,
            })
          }
        />

        <Field
          label="Deposit Label"
          value={
            form?.deposit_label
          }
          editing={editing}
          onChange={(
            v: string
          ) =>
            setForm({
              ...form,
              deposit_label:
                v,
            })
          }
        />
      </div>

      <div className="mt-8">
        <Field
          label="Remarks"
          value={
            form?.remarks
          }
          editing={editing}
          onChange={(
            v: string
          ) =>
            setForm({
              ...form,
              remarks: v,
            })
          }
        />
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value?: string;
  editing?: boolean;
  onChange?: (
    value: string
  ) => void;
};

function Field({
  label,
  value,
  editing,
  onChange,
}: FieldProps) {
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