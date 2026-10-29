
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Banknote,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

export type CashTicketRow = {
  id: number | string;
  ticket_number: string;
  ticket_date: string;
  number_of_tickets: number;
  price_per_ticket: number | string;
  amount: number | string;
  assigned_quantity?: number | string;
  available_quantity?: number | string;
  created_at?: string;
};

type UserOption = {
  full_name: string;
};

type Props = {
  data: CashTicketRow[];
  loading: boolean;
  error?: string;
  onRefresh: () => void;
  onAdd: () => void;
};

type AssignmentForm = {
  assigned_to: string;
  office_name: string;
  assignment_date: string;
  quantity_assigned: string;
  remarks: string;
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialForm = (): AssignmentForm => ({
  assigned_to: "",
  office_name: "",
  assignment_date: today(),
  quantity_assigned: "",
  remarks: "",
});

const money = (value: number | string) =>
  Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

export default function CashTicketTable({
  data,
  loading,
  error,
  onRefresh,
  onAdd,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedTicket, setSelectedTicket] =
    useState<CashTicketRow | null>(null);

  const [form, setForm] = useState<AssignmentForm>(initialForm());
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearchError, setUserSearchError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((row) =>
      row.ticket_number.toLowerCase().includes(keyword)
    );
  }, [data, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalTickets = data.reduce(
    (sum, row) => sum + Number(row.number_of_tickets || 0),
    0
  );

  const totalAssigned = data.reduce(
    (sum, row) => sum + Number(row.assigned_quantity || 0),
    0
  );

  const totalAvailable = data.reduce(
    (sum, row) =>
      sum +
      Number(
        row.available_quantity ??
          Number(row.number_of_tickets || 0) -
            Number(row.assigned_quantity || 0)
      ),
    0
  );

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    if (!selectedTicket) return;

    let cancelled = false;

    async function loadUsers() {
      try {
        setUserSearchError("");

        const response = await axios.get(
          "/api/smi/cash-ticket-users",
          { params: { search: "" } }
        );

        if (!cancelled) {
          setUsers(response.data.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load users:", error);

        if (!cancelled) {
          setUsers([]);
          setUserSearchError(
            "Existing user names could not be loaded. You can still type the recipient's name."
          );
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [selectedTicket]);

  function openAssignment(ticket: CashTicketRow) {
    setSelectedTicket(ticket);
    setForm(initialForm());
    setFormError("");
    setSuccessMessage("");
  }

  function closeAssignment() {
    if (saving) return;

    setSelectedTicket(null);
    setForm(initialForm());
    setFormError("");
  }

  function updateField(
    field: keyof AssignmentForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTicket) return;

    const quantity = Number(form.quantity_assigned);
    const available = Number(
      selectedTicket.available_quantity ??
        Number(selectedTicket.number_of_tickets || 0) -
          Number(selectedTicket.assigned_quantity || 0)
    );

    if (!form.assigned_to.trim()) {
      setFormError("Select or type the recipient's name.");
      return;
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      setFormError("Enter a positive whole number of tickets.");
      return;
    }

    if (quantity > available) {
      setFormError(
        `Only ${available.toLocaleString()} tickets are available.`
      );
      return;
    }

    if (!form.assignment_date) {
      setFormError("Select the assignment date.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await axios.post("/api/smi/cash-ticket-assignments", {
        cash_ticket_id: selectedTicket.id,
        assigned_to: form.assigned_to.trim(),
        office_name: form.office_name.trim(),
        assignment_date: form.assignment_date,
        quantity_assigned: quantity,
        remarks: form.remarks.trim(),
      });

      setSuccessMessage("Cash tickets assigned successfully.");
      setSelectedTicket(null);
      setForm(initialForm());

      await onRefresh();
    } catch (error) {
      console.error("Failed to assign cash tickets:", error);

      setFormError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to assign cash tickets."
          : "Failed to assign cash tickets."
      );

      await onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              Cash Tickets
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Registered batches, assignments, and available stock.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Banknote size={17} />
              Register Cash Ticket
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-5 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-slate-500">Registered Tickets</p>
            <p className="mt-2 text-2xl font-bold text-blue-700">
              {totalTickets.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm text-slate-500">Assigned Tickets</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              {totalAssigned.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm text-slate-500">Available Tickets</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {totalAvailable.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket number..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label htmlFor="cash-ticket-page-size">Rows</label>

            <select
              id="cash-ticket-page-size"
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value))
              }
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {successMessage && (
          <div className="m-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="ml-3 font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading cash tickets...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No cash tickets found.
            </div>
          ) : (
            <table className="w-full min-w-[1050px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm font-semibold text-slate-600">
                  <th className="px-4 py-3">Ticket Number</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Registered</th>
                  <th className="px-4 py-3 text-right">Assigned</th>
                  <th className="px-4 py-3 text-right">Available</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total Value</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((row) => {
                  const assigned = Number(row.assigned_quantity || 0);
                  const available = Number(
                    row.available_quantity ??
                      Number(row.number_of_tickets || 0) - assigned
                  );

                  return (
                    <tr
                      key={row.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {row.ticket_number}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {row.ticket_date}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {Number(row.number_of_tickets).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right text-orange-600">
                        {assigned.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-green-700">
                        {available.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {money(row.price_per_ticket)}
                      </td>

                      <td className="px-4 py-4 text-right font-medium">
                        {money(row.amount)}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openAssignment(row)}
                          disabled={available <= 0}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <ClipboardList size={16} />
                          Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-500">
            Showing{" "}
            {filteredData.length === 0
              ? 0
              : (page - 1) * pageSize + 1}
            {" - "}
            {Math.min(page * pageSize, filteredData.length)} of{" "}
            {filteredData.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm font-medium">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Assign Cash Tickets
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Batch: {selectedTicket.ticket_number}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAssignment}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close assignment modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4 p-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-xs text-slate-500">Registered</p>
                  <p className="mt-1 font-bold text-blue-700">
                    {Number(selectedTicket.number_of_tickets).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs text-slate-500">Assigned</p>
                  <p className="mt-1 font-bold text-orange-600">
                    {Number(selectedTicket.assigned_quantity || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3">
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="mt-1 font-bold text-green-700">
                    {Number(
                      selectedTicket.available_quantity ??
                        Number(selectedTicket.number_of_tickets || 0) -
                          Number(selectedTicket.assigned_quantity || 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="assigned-to"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Assigned To *
                </label>

                <input
                  id="assigned-to"
                  list="cash-ticket-user-options"
                  required
                  maxLength={150}
                  value={form.assigned_to}
                  onChange={(event) =>
                    updateField("assigned_to", event.target.value)
                  }
                  placeholder="Select an existing user or type a name"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <datalist id="cash-ticket-user-options">
                  {users.map((user, index) => (
                    <option key={`${user.full_name}-${index}`} value={user.full_name} />
                  ))}
                </datalist>

                <p className="mt-1 text-xs text-slate-500">
                  Select a suggested user or enter any recipient's name.
                </p>

                {userSearchError && (
                  <p className="mt-1 text-xs text-amber-700">
                    {userSearchError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="assignment-office"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Office / Department
                </label>

                <input
                  id="assignment-office"
                  maxLength={150}
                  value={form.office_name}
                  onChange={(event) =>
                    updateField("office_name", event.target.value)
                  }
                  placeholder="Enter office or department"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="assignment-quantity"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Quantity to Assign *
                  </label>

                  <input
                    id="assignment-quantity"
                    type="number"
                    min={1}
                    max={Number(
                      selectedTicket.available_quantity ??
                        Number(selectedTicket.number_of_tickets || 0) -
                          Number(selectedTicket.assigned_quantity || 0)
                    )}
                    step={1}
                    required
                    value={form.quantity_assigned}
                    onChange={(event) =>
                      updateField("quantity_assigned", event.target.value)
                    }
                    placeholder="e.g. 2000"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="assignment-date"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Assignment Date *
                  </label>

                  <input
                    id="assignment-date"
                    type="date"
                    required
                    value={form.assignment_date}
                    onChange={(event) =>
                      updateField("assignment_date", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="assignment-remarks"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Remarks
                </label>

                <textarea
                  id="assignment-remarks"
                  rows={3}
                  maxLength={2000}
                  value={form.remarks}
                  onChange={(event) =>
                    updateField("remarks", event.target.value)
                  }
                  placeholder="Optional remarks"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAssignment}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
