"use client";

type Props = {
  request: any;
  onRefresh: () => void;
  onEdit: () => void;
};

export default function RISDetails({
  request,
  onRefresh,
  onEdit,
}: Props) {
  if (!request) {
    return (
      <div className="flex h-full min-h-[650px] items-center justify-center rounded-2xl border bg-white text-slate-500">
        Select a RIS request.
      </div>
    );
  }

  const editable = [
    "DRAFT",
    "PENDING",
    "RETURNED",
  ].includes(request.status);

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="flex items-center justify-between border-b p-6">

        <div>

          <h2 className="text-xl font-semibold">
            {request.ris_no}
          </h2>

          <p className="text-sm text-slate-500">
            Requisition and Issue Slip
          </p>

        </div>

        <div className="flex gap-2">

          {editable && (
            <button
              onClick={onEdit}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Edit
            </button>
          )}

        </div>

      </div>

      <div className="space-y-6 p-6">

        <div className="grid grid-cols-2 gap-6">

          <div>

            <label className="text-sm font-medium text-slate-500">
              Requester
            </label>

            <p className="mt-1 font-medium">
              {request.requested_by_name}
            </p>

          </div>

          <div>

            <label className="text-sm font-medium text-slate-500">
              Request Date
            </label>

            <p className="mt-1 font-medium">
              {request.request_date}
            </p>

          </div>

          <div>

            <label className="text-sm font-medium text-slate-500">
              Status
            </label>

            <p className="mt-1">
              {request.status}
            </p>

          </div>

          <div>

            <label className="text-sm font-medium text-slate-500">
              Remarks
            </label>

            <p className="mt-1">
              {request.remarks || "-"}
            </p>

          </div>

        </div>

                <div className="rounded-xl border">

          <div className="border-b px-4 py-3">

            <h3 className="font-semibold">
              Requested Forms
            </h3>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr className="text-left text-sm">

                  <th className="px-4 py-3">
                    Accountable Form
                  </th>

                  <th className="px-4 py-3 text-center">
                    Booklets
                  </th>

                  <th className="px-4 py-3">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {(request.items || []).length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={3}
                      className="py-8 text-center text-slate-500"
                    >
                      No requested forms.
                    </td>

                  </tr>

                ) : (

                  request.items.map(
                    (
                      item: any,
                      index: number
                    ) => (

                      <tr
                        key={index}
                        className="border-t"
                      >

                        <td className="px-4 py-3">
                          {item.form_code} -{" "}
                          {item.form_name}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3">
                          {item.remarks || "-"}
                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        <div className="rounded-xl border">

          <div className="border-b px-4 py-3">

            <h3 className="font-semibold">
              Workflow Timeline
            </h3>

          </div>

          <div className="space-y-3 p-4">

            {(request.workflow || [])
              .length === 0 ? (

              <p className="text-sm text-slate-500">
                No workflow history.
              </p>

            ) : (

              request.workflow.map(
                (
                  item: any,
                  index: number
                ) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 border-l-2 border-blue-500 pl-4"
                  >

                    <div>

                      <p className="font-medium">
                        {item.status}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.remarks}
                      </p>

                      <p className="text-xs text-slate-400">
                        {item.username}
                      </p>

                      <p className="text-xs text-slate-400">
                        {item.action_date}
                      </p>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </div>
  );
}