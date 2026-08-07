"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function RISApprovalDetailsPage() {
  const params = useParams();

  const [loading, setLoading] =
    useState(true);

  const [ris, setRis] =
    useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {

      setLoading(true);

      const res =
        await axios.get(
          `/api/ris/approval/${params.id}`
        );

      setRis(res.data.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (!ris) {
    return (
      <div className="p-10">
        RIS not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          RIS Approval
        </h1>

        <p className="text-gray-500">
          {ris.ris_no}
        </p>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <div className="grid grid-cols-2 gap-6">

          <div>

            <p className="text-sm text-gray-500">
              Request Date
            </p>

            <p className="font-semibold">
              {ris.request_date}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Requested By
            </p>

            <p className="font-semibold">
              {ris.requested_by_name}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-semibold">
              {ris.status}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Remarks
            </p>

            <p className="font-semibold">
              {ris.remarks || "-"}
            </p>

          </div>

        </div>

      </div>

      <div className="rounded-xl border bg-white">

        <div className="border-b p-4 font-semibold">
          Requested Items
        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                Form Code
              </th>

              <th className="p-3 text-left">
                Form Name
              </th>

              <th className="p-3 text-center">
                Quantity
              </th>

              <th className="p-3 text-left">
                Remarks
              </th>

            </tr>

          </thead>

          <tbody>

            {ris.items.map(
              (item: any) => (

                <tr
                  key={item.id}
                  className="border-t"
                >

                  <td className="p-3">
                    {item.form_code}
                  </td>

                  <td className="p-3">
                    {item.form_name}
                  </td>

                  <td className="p-3 text-center">
                    {item.quantity}
                  </td>

                  <td className="p-3">
                    {item.remarks || "-"}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      <div className="rounded-xl border bg-white">

        <div className="border-b p-4 font-semibold">
          Workflow History
        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3">
                Date
              </th>

              <th className="p-3">
                Status
              </th>

              <th className="p-3">
                Remarks
              </th>

              <th className="p-3">
                Action By
              </th>

            </tr>

          </thead>

          <tbody>

            {ris.workflow.map(
              (w: any) => (

                <tr
                  key={w.id}
                  className="border-t"
                >

                  <td className="p-3">
                    {w.action_date}
                  </td>

                  <td className="p-3">
                    {w.status}
                  </td>

                  <td className="p-3">
                    {w.remarks}
                  </td>

                  <td className="p-3">
                    {w.full_name}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      <div className="flex justify-end gap-3">

        <button
          className="rounded-lg bg-red-500 px-5 py-2 text-white"
        >
          Reject
        </button>

        <button
          className="rounded-lg bg-yellow-500 px-5 py-2 text-white"
        >
          Return
        </button>

        <button
          className="rounded-lg bg-green-600 px-5 py-2 text-white"
        >
          Approve
        </button>

      </div>

    </div>
  );
}