"use client";

export default function CTCTable() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                CTC No.
              </th>

              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date Issued
              </th>

              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Taxpayer
              </th>

              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Type
              </th>

              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Barangay
              </th>

              <th className="border-b border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Basic Tax
              </th>

              <th className="border-b border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Total Amount
              </th>

              <th className="border-b border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Records will be added here later */}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      <div className="flex min-h-[180px] items-center justify-center border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">
            No CTC records found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            CTC sales records will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}