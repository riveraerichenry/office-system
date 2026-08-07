"use client";

import { Plus } from "lucide-react";

export default function BankAccountTable({
  data,
  selected,
  onSelect,
  onAdd,
}: {
  data: any[];
  selected: any;
  onSelect: (item: any) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-[40px] bg-white px-6 py-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Bank Accounts
        </h1>

        <button
          onClick={onAdd}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              onSelect(item)
            }
            className={`w-full rounded-2xl border p-4 text-left transition ${
              selected?.id ===
              item.id
                ? "border-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >
            <p className="font-bold">
              {
                item.account_number
              }
            </p>

            <p className="text-sm text-gray-500">
              {
                item.account_name
              }
            </p>

            <p className="text-xs text-gray-400">
              {item.bank_name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}