"use client";


import axios from "axios";
import Swal from "sweetalert2";




type Props = {
  ris: any;
  onSuccess: () => void;
};

export default function GenerateRATDetails({
  ris,
  onSuccess,
}: Props) {

  async function generate() {

    if (!ris) return;

    const confirm =
      await Swal.fire({
        title: "Generate RAT?",
        text: `Generate RAT for ${ris.ris_no}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Generate",
      });

    if (!confirm.isConfirmed) return;

    try {

      const res =
        await axios.post(
          "/api/rat/generate",
          {
            ris_id: ris.id,
          }
        );

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: res.data.message,
      });

      onSuccess();

    } catch (err: any) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ??
          "Unable to generate RAT.",
      });

    }

  }

  if (!ris) {
    return (
      <div className="flex h-full min-h-[650px] items-center justify-center rounded-2xl border bg-white text-slate-500 shadow-sm">
        Select an approved RIS.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="border-b px-6 py-4">

        <h2 className="text-lg font-semibold">
          RIS Details
        </h2>

        <p className="text-sm text-slate-500">
          Review the request before generating the RAT.
        </p>

      </div>

      <div className="space-y-6 p-6">

        <div className="grid grid-cols-2 gap-6">

          <Info
            label="RIS No."
            value={ris.ris_no}
          />

          <Info
            label="Request Date"
            value={formatDate(ris.request_date)}
          />

          <Info
            label="Requester"
            value={ris.requester}
          />

          <Info
            label="Approver"
            value={ris.approver}
          />

          <Info
            label="Approved Date"
            value={formatDate(ris.approved_date)}
          />

          <Info
            label="Total Items"
            value={ris.total_items}
          />

        </div>

        <div>

          <div className="mb-2 text-sm font-medium">
            Remarks
          </div>

          <div className="min-h-[120px] rounded-lg border bg-slate-50 p-4 whitespace-pre-wrap">
            {ris.remarks || "-"}
          </div>

        </div>

        <div>

          <div className="mb-2 text-sm font-medium">
            Requested Items
          </div>

          <div className="rounded-lg border">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-4 py-3 text-left">
                    Form
                  </th>

                  <th className="px-4 py-3 text-center">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-left">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {ris.items?.length ? (

                  ris.items.map(
                    (item: any) => (

                      <tr
                        key={item.id}
                        className="border-t"
                      >

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

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={3}
                      className="py-8 text-center text-slate-500"
                    >
                      No requested items.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      <div className="flex justify-end border-t p-6">

        <button
          onClick={generate}
          className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Generate RAT
        </button>

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

      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 font-medium">
        {value || "-"}
      </div>

    </div>
  );
}

function formatDate(value: any) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString();
}