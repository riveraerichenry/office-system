"use client";

type Props = {
  summary: {
    pending: number;
    approved: number;
    issued: number;
    total: number;
  };
};

export default function ApprovalSummary({
  summary,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-gray-500">
          Pending
        </p>

        <h2 className="mt-2 text-3xl font-bold text-yellow-600">
          {summary.pending}
        </h2>

      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-gray-500">
          Approved
        </p>

        <h2 className="mt-2 text-3xl font-bold text-green-600">
          {summary.approved}
        </h2>

      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-gray-500">
          Issued
        </p>

        <h2 className="mt-2 text-3xl font-bold text-blue-600">
          {summary.issued}
        </h2>

      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-gray-500">
          Total Requests
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-700">
          {summary.total}
        </h2>

      </div>

    </div>
  );
}