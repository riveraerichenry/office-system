"use client";

import { Search } from "lucide-react";

type Props = {
  search: string;
  onSearch: (value: string) => void;
};

export default function AF56BillingInformation({
  search,
  onSearch,
}: Props) {
  return (
    <div className="w-full lg:w-[420px]">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search Billing No., Owner, TD No. or PIN..."
          className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm transition focus:border-blue-600 focus:outline-none"
        />
      </div>
    </div>
  );
}