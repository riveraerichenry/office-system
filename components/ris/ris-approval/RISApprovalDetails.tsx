"use client";

import {
  CheckCircle2,
  CornerUpLeft,
  XCircle,
  RefreshCw,
} from "lucide-react";

type Props = {
  request: any;
  onApprove: () => void;
  onReturn: () => void;
  onReject: () => void;
  onRefresh: () => void;
};

export default function RISApprovalDetails({
  request,
  onApprove,
  onReturn,
  onReject,
  onRefresh,
}: Props) {

  if (!request) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
        Select a RIS request.
      </div>
    );
  }

  return (

    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="flex items-center justify-between border-b p-5">

        <div>

          <h2 className="text-lg font-semibold">
            {request.ris_no}
          </h2>

          <p className="text-sm text-slate-500">
            Requisition & Issue Slip
          </p>

        </div>

        <div className="flex gap-2">

          <button
            onClick={onRefresh}
            className="rounded-xl border px-4 py-2 hover:bg-slate-50"
          >
            <RefreshCw
              size={18}
            />
          </button>

          {request.status ===
            "PENDING" && (

            <>
              <button
                onClick={async () => {

                    if (
                    !confirm(
                        "Approve this RIS?"
                    )
                    ) return;

                    await onApprove();

                }}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                <CheckCircle2
                    size={18}
                />

                Approve

                </button>

              

            </>

          )}

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6 border-b p-6">

        <div>

          <label className="text-xs uppercase text-slate-500">
            RIS No.
          </label>

          <p className="mt-1 font-medium">
            {request.ris_no}
          </p>

        </div>

        <div>

          <label className="text-xs uppercase text-slate-500">
            Status
          </label>

          <p className="mt-1">
            {request.status}
          </p>

        </div>

        <div>

          <label className="text-xs uppercase text-slate-500">
            Requester
          </label>

          <p className="mt-1">
            {request.requested_by_name}
          </p>

        </div>

        <div>

          <label className="text-xs uppercase text-slate-500">
            Request Date
          </label>

          <p className="mt-1">
            {request.request_date}
          </p>

        </div>

        <div className="col-span-2">

          <label className="text-xs uppercase text-slate-500">
            Remarks
          </label>

          <p className="mt-1">
            {request.remarks ||
              "-"}
          </p>

        </div>

      </div>


            <div className="p-6">

        <h3 className="mb-4 text-lg font-semibold">
          Requested Accountable Forms
        </h3>

        <div className="overflow-x-auto rounded-xl border">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr className="text-left text-sm text-slate-600">

                <th className="px-4 py-3">
                  Form Code
                </th>

                <th className="px-4 py-3">
                  Form Name
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

              {request.items?.map(
                (item: any) => (

                <tr
                  key={item.id}
                  className="border-t"
                >

                  <td className="px-4 py-3">
                    {item.form_code}
                  </td>

                  <td className="px-4 py-3">
                    {item.form_name}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {item.quantity}
                  </td>

                  <td className="px-4 py-3">
                    {item.remarks || "-"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <div className="border-t p-6">

        <h3 className="mb-4 text-lg font-semibold">
          Workflow History
        </h3>

        <div className="space-y-4">

          {request.workflow?.length === 0 ? (

            <div className="text-sm text-slate-500">
              No workflow history.
            </div>

          ) : (

            request.workflow?.map(
              (row: any) => (

              <div
                key={row.id}
                className="rounded-xl border p-4"
              >

                <div className="flex items-center justify-between">

                  <span className="font-semibold">
                    {row.status}
                  </span>

                  <span className="text-sm text-slate-500">
                    {row.action_date}
                  </span>

                </div>

                <div className="mt-2 text-sm">

                  {row.remarks}

                </div>

                <div className="mt-2 text-xs text-slate-500">

                  By:

                  {" "}

                  {row.username}

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>

  );

}