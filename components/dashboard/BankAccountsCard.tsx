"use client";

import axios from "axios";
import {
  useEffect,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

export default function BankAccountsCard({
  bank,
}: {
  bank: any;
}) {
  const [accounts, setAccounts] =
    useState<any[]>([]);

  const [page, setPage] =
    useState(1);

  useEffect(() => {
    if (bank) {
      fetchAccounts();
    }
  }, [bank]);

  async function fetchAccounts() {
    try {
      const res =
        await axios.get(
          `/api/banks/${bank.id}/accounts`
        );

      const rows =
        res.data.data || [];

      setAccounts(rows);
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  }

  if (!bank) return null;

  const totalPages =
    Math.ceil(
      accounts.length /
        PAGE_SIZE
    ) || 1;

  const paginated =
    accounts.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  return (
    <div className="rounded-[40px] bg-white px-8 py-8 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Bank Accounts
        </h2>

        <span className="text-sm text-gray-500">
          {accounts.length} records
        </span>
      </div>

      {accounts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No bank accounts found
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold">
                      Seq
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Account No
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Account Name
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map(
                    (account) => (
                      <tr
                        key={
                          account.id
                        }
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          {
                            account.sequence_code
                          }
                        </td>

                        <td className="px-4 py-3">
                          {
                            account.account_number
                          }
                        </td>

                        <td className="px-4 py-3">
                          {
                            account.account_name
                          }
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {account.account_status ||
                              "ACTIVE"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={
                  page === 1
                }
                onClick={() =>
                  setPage(
                    page - 1
                  )
                }
                className="rounded-xl border p-2 disabled:opacity-40"
              >
                <ChevronLeft
                  size={16}
                />
              </button>

              <button
                disabled={
                  page ===
                  totalPages
                }
                onClick={() =>
                  setPage(
                    page + 1
                  )
                }
                className="rounded-xl border p-2 disabled:opacity-40"
              >
                <ChevronRight
                  size={16}
                />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}