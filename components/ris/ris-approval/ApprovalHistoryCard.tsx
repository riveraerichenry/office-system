"use client";

import { useEffect, useState } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Undo2,
  Clock3,
} from "lucide-react";

type Props = {
  history: any[];
};

export default function ApprovalHistoryCard({
  history,
}: Props) {
  const [page, setPage] = useState(1);

  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    setPage(1);
  }, [history]);

  function getIcon(status: string) {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return (
          <CheckCircle2
            size={18}
            className="text-green-600"
          />
        );

      case "RETURNED":
        return (
          <Undo2
            size={18}
            className="text-orange-600"
          />
        );

      case "REJECTED":
        return (
          <XCircle
            size={18}
            className="text-red-600"
          />
        );

      default:
        return (
          <Clock3
            size={18}
            className="text-slate-500"
          />
        );
    }
  }

  function getBadge(status: string) {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "RETURNED":
        return "bg-orange-100 text-orange-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(history.length / ROWS_PER_PAGE)
  );

  const paginated = history.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      {/* Header */}

      <div className="border-b bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <History
              size={20}
              className="text-blue-600"
            />

            <h2 className="text-lg font-semibold text-slate-800">
              History
            </h2>

          </div>

          <span className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {history.length}
          </span>

        </div>

      </div>

      {/* Body */}

      <div>

        {paginated.length === 0 ? (

          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            No history available.
          </div>

        ) : (

          paginated.map((item) => (

            <div
              key={item.id}
              className="border-b p-4 transition hover:bg-slate-50"
            >

              <div className="flex items-start gap-3">

                {getIcon(item.status)}

                <div className="flex-1">

                  <div className="flex items-center justify-between gap-2">

                    <div className="truncate font-semibold text-slate-800">
                      {item.ris_no}
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${getBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    {item.accountable_officer}
                  </div>

                  {item.action_by && (
                    <div className="mt-2 text-xs text-slate-500">
                      By{" "}
                      <span className="font-semibold">
                        {item.action_by}
                      </span>
                    </div>
                  )}

                  <div className="mt-1 text-xs text-slate-400">
                    {item.action_date
                      ? new Date(
                          item.action_date
                        ).toLocaleString()
                      : "-"}
                  </div>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">

        <button
          onClick={() =>
            setPage((p) =>
              Math.max(1, p - 1)
            )
          }
          disabled={page === 1}
          className="rounded border px-3 py-1 text-xs disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-xs text-slate-500">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) =>
              Math.min(totalPages, p + 1)
            )
          }
          disabled={page >= totalPages}
          className="rounded border px-3 py-1 text-xs disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  );
}