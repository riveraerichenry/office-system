"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  X,
  Search,
  Package,
  Calendar,
  User,
  BadgeCheck,
  ClipboardList,
} from "lucide-react";

type Props = {
  open: boolean;
  request: any;
  onClose: () => void;
};

const ROWS_PER_PAGE = 10;

export default function RISDetailsModal({
  open,
  request,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open || !request) return;

    loadDetails();
    loadHistory();
  }, [open, request]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function loadDetails() {
    try {
      setLoading(true);

      const res = await axios.get(
        `/api/ris/${request.id}`
      );

      if (res.data.success) {
        setDetails(res.data.data);
        setItems(res.data.data.items ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setHistory([]);
  }

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return items.filter(
      (i) =>
        i.form_code?.toLowerCase().includes(keyword) ||
        i.form_name?.toLowerCase().includes(keyword)
    );
  }, [items, search]);

  const totalPages = Math.ceil(
    filtered.length / ROWS_PER_PAGE
  );

  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  if (!open) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
    <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 text-white">

        <div>
          <h2 className="text-2xl font-bold">
            Request & Issue Slip
          </h2>

          <p className="mt-1 text-blue-100">
            {details?.ris_no ?? "-"}
          </p>
        </div>

        <div className="flex items-center gap-4">

          <StatusBadge status={details?.status} />

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <X size={22} />
          </button>

        </div>

      </div>

      {/* BODY */}

      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden p-6">

        {/* LEFT */}

        <div className="col-span-8 flex flex-col overflow-hidden rounded-xl border">

          <div className="border-b bg-slate-50 p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Package className="text-blue-600" />

                <h3 className="text-lg font-semibold">
                  Requested Accountable Forms
                </h3>

              </div>

              <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                {filtered.length} Item(s)
              </span>

            </div>

            <div className="relative mt-5">

              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search accountable form..."
                className="w-full rounded-lg border py-2 pl-10 pr-3"
              />

            </div>

          </div>

          <div className="flex-1 overflow-auto">

            <table className="w-full">

              <thead className="sticky top-0 bg-slate-100">

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

                  <th className="px-4 py-3">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="p-10 text-center"
                    >
                      Loading...
                    </td>

                  </tr>

                ) : paginated.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="p-10 text-center"
                    >
                      No records found.
                    </td>

                  </tr>

                ) : (

                  paginated.map((item, index) => (

                    <tr
                      key={item.id}
                      className="border-b hover:bg-blue-50"
                    >

                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-blue-700">
                        {item.form_code}
                      </td>

                      <td className="px-4 py-3">
                        {item.form_name}
                      </td>

                      <td className="px-4 py-3 text-center font-semibold">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3">
                        {item.remarks || "-"}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

          <div className="flex items-center justify-between border-t bg-slate-50 px-5 py-3">

            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="font-medium">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              disabled={page >= totalPages}
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>

          </div>

        </div>

        {/* RIGHT */}

        <div className="col-span-4 space-y-5 overflow-auto">

          <div className="overflow-hidden rounded-xl border">

            <div className="border-b bg-slate-50 p-4">

              <div className="flex items-center gap-2">

                <ClipboardList
                  className="text-blue-600"
                  size={20}
                />

                <h3 className="font-semibold">
                  Request Information
                </h3>

              </div>

            </div>

            <div className="space-y-4 p-5">

              <Info
                label="RIS Number"
                value={details?.ris_no}
              />

              <Info
                label="RIS Status"
                value={
                  <StatusBadge
                    status={details?.status}
                  />
                }
              />

              <Info
                label="Approved Date"
                value={
                  details?.approved_date
                    ? new Date(
                        details.approved_date
                      ).toLocaleString()
                    : "-"
                }
              />

              <Info
                label="Approved By"
                value={details?.approved_by}
              />

              <Info
                label="RIS Date"
                value={
                  details?.request_date
                    ? new Date(
                        details.request_date
                      ).toLocaleString()
                    : "-"
                }
              />

              <Info
                label="Requester / Accountable Officer"
                value={details?.requested_by}
              />

              <Info
                label="Remarks"
                value={details?.remarks}
              />

            </div>

          </div>

          <div className="overflow-hidden rounded-xl border">

            <div className="border-b bg-slate-50 p-4">

              <div className="flex items-center gap-2">

                <Calendar
                  className="text-blue-600"
                  size={20}
                />

                <h3 className="font-semibold">
                  Workflow Timeline
                </h3>

              </div>

            </div>

            <div className="space-y-5 p-5">

              <TimelineItem
                title="Created"
                date={details?.created_at}
              />

              <TimelineItem
                title="Submitted"
                date={details?.submitted_at}
              />

              <TimelineItem
                title="Reviewed"
                date={details?.reviewed_at}
              />

              <TimelineItem
                title="Approved"
                date={details?.approved_date}
              />

              <TimelineItem
                title="Returned"
                date={details?.returned_at}
              />

              <TimelineItem
                title="Rejected"
                date={details?.rejected_at}
              />

              <TimelineItem
                title="Cancelled"
                date={details?.cancelled_at}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
);
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800">
        {value || "-"}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status?: string;
}) {
  const value = (status ?? "").toLowerCase();

  const color =
    value === "approved"
      ? "bg-green-100 text-green-700"
      : value === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : value === "rejected"
      ? "bg-red-100 text-red-700"
      : value === "returned"
      ? "bg-orange-100 text-orange-700"
      : value === "cancelled"
      ? "bg-slate-200 text-slate-700"
      : value === "submitted"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {status ?? "-"}
    </span>
  );
}

function TimelineItem({
  title,
  date,
}: {
  title: string;
  date: string | null | undefined;
}) {
  const completed = !!date;

  return (
    <div className="flex gap-4">

      <div className="mt-1">

        <div
          className={`h-4 w-4 rounded-full ${
            completed
              ? "bg-green-500"
              : "border-2 border-slate-300 bg-white"
          }`}
        />

      </div>

      <div className="flex-1">

        <div className="font-medium text-slate-800">
          {title}
        </div>

        <div className="mt-1 text-sm text-slate-500">
          {completed
            ? new Date(date!).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "Not yet"}
        </div>

      </div>

    </div>
  );
}