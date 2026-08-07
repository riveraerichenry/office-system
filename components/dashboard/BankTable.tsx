"use client";

import { Plus } from "lucide-react";

export default function BankTable({
  data,
  selected,
  onSelect,
  loading,
  onAdd,
}: {
  data: any[];
  selected: any;
  onSelect: (bank: any) => void;
  loading: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-[40px] bg-white shadow-xl px-6 py-6 h-[750px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Banks
        </h1>

        <button
          onClick={onAdd}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {data.map((bank) => (
            <button
              key={bank.id}
              onClick={() =>
                onSelect(bank)
              }
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected?.id === bank.id
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <p className="font-semibold">
                {bank.bank_code}
              </p>

              <p className="text-sm text-gray-500">
                {bank.bank_name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}