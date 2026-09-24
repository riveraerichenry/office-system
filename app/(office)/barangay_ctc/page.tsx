"use client";

import { Plus, RefreshCw } from "lucide-react";
import CTCTable from "@/components/dipp/ctc/barangay/CTCTable";

export default function BarangayCTCPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Barangay CTC
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Community Tax Certificate Sales
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Issue CTC-I
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Plus size={18} />
              Issue CTC-C
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-gray-300 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                placeholder="CTC No. or taxpayer name"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                CTC Type
              </label>

              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                defaultValue=""
              >
                <option value="">All Types</option>
                <option value="CTC-I">CTC-I</option>
                <option value="CTC-C">CTC-C</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Date From
              </label>

              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Date To
              </label>

              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* CTC Records Table */}
        <CTCTable />
      </div>
    </div>
  );
}