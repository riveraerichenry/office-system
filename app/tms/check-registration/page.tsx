"use client";

import axios from "axios";
import {
  useEffect,
  useState,
} from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AddCheckRegistrationModal from "@/components/dashboard/AddCheckRegistrationModal";
import EditCheckRegistrationModal from "@/components/dashboard/EditCheckRegistrationModal";

const PAGE_SIZE = 10;

export default function CheckRegistrationPage() {
  const [data, setData] =
    useState<any[]>([]);

  const [banks, setBanks] =
    useState<any[]>([]);

  const [selected, setSelected] =
    useState<any>(null);

  const [page, setPage] =
    useState(1);

  const [openModal, setOpenModal] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const currentYear =
    new Date().getFullYear();

  const [fiscalYear, setFiscalYear] =
    useState(currentYear);

  const [selectedBank, setSelectedBank] =
    useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [
        registrationsRes,
        banksRes,
      ] = await Promise.all([
        axios.get(
          "/api/check-registrations"
        ),
        axios.get("/api/banks"),
      ]);

      const rows =
        registrationsRes.data.data ||
        [];

      setData(rows);
      setBanks(
        banksRes.data.data || []
      );
      setPage(1);

      if (rows.length > 0) {
        setSelected(rows[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteSelected() {
    if (!selected) return;

    const confirmed = confirm(
      "Delete selected check registration?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `/api/check-registrations/${selected.id}`
      );

      fetchData();
    } catch (error) {
      console.log(error);
    }
  }

  const filtered = data.filter(
    (row) => {
      const yearMatch =
        row.fiscal_year ===
        fiscalYear;

      const bankMatch =
        selectedBank === "all" ||
        row.bank_id ===
          selectedBank;

      return (
        yearMatch &&
        bankMatch
      );
    }
  );

  const totalPages =
    Math.ceil(
      filtered.length /
        PAGE_SIZE
    ) || 1;

  const paginated =
    filtered.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  return (
    <>
      <div className="rounded-[40px] bg-white px-8 py-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Check Registration
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() =>
                setOpenModal(true)
              }
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 p-3 text-white shadow-lg"
            >
              <Plus size={18} />
            </button>

            <button
              onClick={() =>
                setEditOpen(true)
              }
              disabled={!selected}
              className="rounded-full bg-amber-500 p-3 text-white shadow-lg disabled:opacity-40"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={
                deleteSelected
              }
              disabled={!selected}
              className="rounded-full bg-red-600 p-3 text-white shadow-lg disabled:opacity-40"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm text-gray-500">
              Fiscal Year
            </label>

            <select
              value={fiscalYear}
              onChange={(e) => {
                setFiscalYear(
                  Number(
                    e.target
                      .value
                  )
                );
                setPage(1);
              }}
              className="w-full rounded-2xl border px-4 py-3"
            >
              {Array.from({
                length: 10,
              }).map(
                (_, i) => {
                  const year =
                    currentYear -
                    5 +
                    i;

                  return (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-500">
              Bank
            </label>

            <select
              value={
                selectedBank
              }
              onChange={(e) => {
                setSelectedBank(
                  e.target
                    .value
                );
                setPage(1);
              }}
              className="w-full rounded-2xl border px-4 py-3"
            >
              <option value="all">
                All Banks
              </option>

              {banks.map(
                (bank) => (
                  <option
                    key={
                      bank.id
                    }
                    value={
                      bank.id
                    }
                  >
                    {
                      bank.bank_name
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold">
                    Book No
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Fund Source
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Bank
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Account No
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Begin
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    End
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Checks
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginated.map(
                  (row) => (
                    <tr
                      key={
                        row.id
                      }
                      onClick={() =>
                        setSelected(
                          row
                        )
                      }
                      className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                        selected?.id ===
                        row.id
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        {
                          row.book_no
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          row.fund_name
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          row.bank_name
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          row.account_number
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          row.beginning_check
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          row.ending_check
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          row.no_of_checks
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {
              filtered.length
            }{" "}
            records
          </p>

          <div className="flex items-center gap-4">
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
        </div>
      </div>

      <EditCheckRegistrationModal
        open={editOpen}
        selected={selected}
        onClose={() =>
          setEditOpen(false)
        }
        onSuccess={fetchData}
      />

      <AddCheckRegistrationModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
        onSuccess={fetchData}
      />
    </>
  );
}