"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function SMIReportPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    const res = await axios.get(
      "/api/reports/smi"
    );

    setRows(res.data.data);
  }

  function printReport() {
    window.print();
  }

  const totalBooklets = rows.length;

  const totalReceipts = rows.reduce(
    (sum, row) =>
      sum + Number(row.receipt_count),
    0
  );

  return (
    <div className="mx-auto max-w-7xl bg-white p-10">

      {/* Toolbar */}

      <div className="mb-6 flex justify-end print:hidden">

        <button
          onClick={printReport}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          Print Report
        </button>

      </div>

      {/* Government Header */}

      <div className="text-center">

        <p>Republic of the Philippines</p>

        <p>Province of Palawan</p>

        <p>Municipality of Taytay</p>

        <h2 className="mt-3 text-2xl font-bold">
          MUNICIPAL TREASURER'S OFFICE
        </h2>

        <h3 className="mt-6 text-xl font-bold uppercase">
          Statement of Accountable Form Inventory
        </h3>

      </div>

      {/* Summary */}

      <div className="mt-10 grid grid-cols-2 gap-8">

        <div>

          <p>
            <strong>Total Booklets :</strong>{" "}
            {totalBooklets}
          </p>

        </div>

        <div>

          <p>
            <strong>Total Receipts :</strong>{" "}
            {totalReceipts}
          </p>

        </div>

      </div>

      {/* Table */}

      <table className="mt-8 w-full border border-collapse text-sm">

        <thead>

          <tr className="bg-gray-200">

            <th className="border p-2">
              Control No
            </th>

            <th className="border p-2">
              Form
            </th>

            <th className="border p-2">
              Series
            </th>

            <th className="border p-2">
              Beginning OR
            </th>

            <th className="border p-2">
              Ending OR
            </th>

            <th className="border p-2">
              Receipt Count
            </th>

            <th className="border p-2">
              Status
            </th>

            <th className="border p-2">
              Supplier
            </th>

          </tr>

        </thead>

        <tbody>

          {rows.map((row) => (

            <tr key={row.control_no}>

              <td className="border p-2">
                {row.control_no}
              </td>

              <td className="border p-2">
                {row.form_code}
              </td>

              <td className="border p-2">
                {row.series}
              </td>

              <td className="border p-2 text-center">
                {row.beginning_or}
              </td>

              <td className="border p-2 text-center">
                {row.ending_or}
              </td>

              <td className="border p-2 text-center">
                {row.receipt_count}
              </td>

              <td className="border p-2 text-center">
                {row.status}
              </td>

              <td className="border p-2">
                {row.supplier}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* Signature */}

      <div className="mt-24 grid grid-cols-2">

        <div>

          <p className="font-semibold">
            Prepared by:
          </p>

          <div className="mt-16 border-t w-64">
          </div>

        </div>

        <div className="text-right">

          <p className="font-semibold">
            Certified Correct:
          </p>

          <div className="ml-auto mt-16 w-64 border-t">
          </div>

        </div>

      </div>

    </div>
  );
}