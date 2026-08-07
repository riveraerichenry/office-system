"use client";

import {
  Search,
  Receipt,
} from "lucide-react";

type Props = {
  data: any[];
  loading: boolean;
  selected: any;

  search: string;
  yearFilter: string;
  officerFilter: string;

  years: number[];
  officers: any[];

  onSearch: (value: string) => void;
  onYearFilter: (value: string) => void;
  onOfficerFilter: (value: string) => void;

  onRefresh: () => void;
  onSelect: (item: any) => void;
};

export default function LORTable({

  data,
  loading,
  selected,

  search,
  yearFilter,
  officerFilter,

  years,
  officers,

  onSearch,
  onYearFilter,
  onOfficerFilter,

  onRefresh,
  onSelect,

}: Props) {

  return (

    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b bg-slate-50 p-4">

        <div>

          <h2 className="text-lg font-semibold text-slate-800">

            Released Booklets

          </h2>

          <p className="text-sm text-slate-500">

            Booklets released to accountable officers

          </p>

        </div>

        <button
          onClick={onRefresh}
          className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >

          Refresh

        </button>

      </div>

      {/* Filters */}

      <div className="grid grid-cols-3 gap-3 border-b p-4">

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              onSearch(
                e.target.value
              )
            }
            placeholder="Search LOR, RAT, RIS, Form or Booklet..."
            className="w-full rounded-lg border py-2 pl-10 pr-3"
          />

        </div>

        {/* Year */}

        <select
          value={yearFilter}
          onChange={(e) =>
            onYearFilter(
              e.target.value
            )
          }
          className="rounded-lg border px-3 py-2"
        >

          <option value="">

            All Years

          </option>

          {

            years.map((year) => (

              <option
                key={year}
                value={year}
              >

                {year}

              </option>

            ))

          }

        </select>

        {/* Officer */}

        <select
          value={officerFilter}
          onChange={(e) =>
            onOfficerFilter(
              e.target.value
            )
          }
          className="rounded-lg border px-3 py-2"
        >

          <option value="">

            All Accountable Officers

          </option>

          {

            officers.map((officer) => (

              <option
                key={officer.id}
                value={officer.id}
              >

                {officer.full_name}

              </option>

            ))

          }

        </select>

      </div>

      {/* Table */}

      <div className="max-h-[700px] overflow-auto">

        <table className="w-full">

          <thead className="sticky top-0 bg-slate-50">

            <tr>

              <th className="px-4 py-3 text-left">

                LOR

              </th>

              <th className="px-4 py-3 text-left">

                Booklet

              </th>

              <th className="px-4 py-3 text-left">

                Accountable Officer

              </th>

              <th className="px-4 py-3 text-left">

                Fund Source

              </th>

              <th className="px-4 py-3 text-center">

                Status

              </th>

            </tr>

          </thead>

          <tbody>

            {

              loading && (

                <tr>

                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >

                    Loading released booklets...

                  </td>

                </tr>

              )

            }

            {

              !loading &&
              data.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >

                    No released booklets found.

                  </td>

                </tr>

              )

            }

            {

              data.map((item: any) => (

                <tr

                  key={item.id}

                  onClick={() =>
                    onSelect(item)
                  }

                  className={`cursor-pointer border-t transition hover:bg-blue-50

                  ${
                    selected?.id === item.id
                      ? "bg-blue-100"
                      : ""
                  }`}

                >

                  {/* LOR */}

                  <td className="px-4 py-4">

                    <div className="font-semibold text-blue-700">

                      {item.lor_no}

                    </div>

                    <div className="text-xs text-slate-500">

                      {

                        item.released_at

                        ?

                        new Date(
                          item.released_at
                        ).toLocaleString()

                        :

                        "-"

                      }

                    </div>

                  </td>

                  {/* Booklet */}

                  <td className="px-4 py-4">

                    <div className="flex items-start gap-2">

                      <Receipt
                        size={16}
                        className="mt-1 text-blue-600"
                      />

                      <div>

                        <div className="font-medium">

                          {item.form_code}

                        </div>

                        <div className="text-xs text-slate-500">

                          {item.control_no}

                        </div>

                        <div className="text-xs text-slate-500">

                          OR {item.beginning_or} - {item.ending_or}

                        </div>

                      </div>

                    </div>

                  </td>

                  {/* Officer */}

                  <td className="px-4 py-4">

                    <div>

                      {item.accountable_officer}

                    </div>

                    <div className="text-xs text-slate-500">

                      {item.rat_no}

                    </div>

                  </td>

                  {/* Fund */}

                  <td className="px-4 py-4">

                    <div className="font-medium">

                      {item.fund_code}

                    </div>

                    <div className="text-xs text-slate-500">

                      {item.fund_name}

                    </div>

                  </td>

                  {/* Status */}

                  <td className="px-4 py-4 text-center">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold

                      ${
                        item.status === "ISSUED"
                          ? "bg-amber-100 text-amber-700"
                          : item.status === "CONSUMED"
                          ? "bg-green-100 text-green-700"
                          : item.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >

                      {item.status}

                    </span>

                  </td>

                </tr>

              ))

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}