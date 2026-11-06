
"use client";

import { useMemo, useState } from "react";
import CashTicketTransactionModal from "./CashTicketTransactionModal";

type CashTicket = {
    assignment_id: number;
    cash_ticket_id: number;
    assigned_to: string;
    office_name: string | null;
    assignment_date: string | null;
    quantity_assigned: number;
    remarks: string | null;
    assigned_by: string | null;
    status: string | null;
    ticket_number: string;
    ticket_date: string | null;
    number_of_tickets: number;
    price_per_ticket: number | string;
    amount: number | string;
    remaining: number;
    assigned_amount: number | string;
    available_quantity?: number | string | null;
    total_issued?: number | string | null;
};

type Props = {
    data: CashTicket[];
    loading: boolean;
    onRefresh: () => void;
    onAdd: () => void;
};

const peso = (value: number | string | null | undefined) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));

const dateText = (value: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "2-digit",
          });
};

/*
 * Calculate available quantity.
 *
 * Prefer the value returned by the API.
 * If the API does not provide it, calculate:
 * quantity_assigned - total_issued
 */
const getAvailableQuantity = (item: CashTicket): number => {
    const apiAvailable = Number(item.available_quantity);

    if (
        item.available_quantity !== undefined &&
        item.available_quantity !== null &&
        Number.isFinite(apiAvailable)
    ) {
        return Math.max(apiAvailable, 0);
    }

    const assigned = Number(item.quantity_assigned ?? 0);
    const issued = Number(item.total_issued ?? 0);

    return Math.max(assigned - issued, 0);
};

export default function CashTicketTable({
    data,
    loading,
    onRefresh,
    onAdd,
}: Props) {
    const [search, setSearch] = useState("");
    const [selectedTicket, setSelectedTicket] =
        useState<CashTicket | null>(null);
    const [transactionModalOpen, setTransactionModalOpen] =
        useState(false);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return data;

        return data.filter((item) =>
            [
                item.ticket_number,
                item.office_name,
                item.assigned_to,
                item.status,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(keyword)
            )
        );
    }, [data, search]);

    function openTransaction(item: CashTicket) {
        const available = getAvailableQuantity(item);

        console.log("SELECTED CASH TICKET:", item);
        console.log("ASSIGNED QUANTITY:", item.quantity_assigned);
        console.log("TOTAL ISSUED:", item.total_issued);
        console.log("API AVAILABLE QUANTITY:", item.available_quantity);
        console.log("CALCULATED AVAILABLE QUANTITY:", available);

        setSelectedTicket({
            ...item,
            available_quantity: available,
        });

        setTransactionModalOpen(true);
    }

    function closeTransaction() {
        setTransactionModalOpen(false);
        setSelectedTicket(null);
    }

    function handleTransactionSuccess() {
        closeTransaction();
        onRefresh();
    }

    return (
        <>
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* HEADER */}
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            My Assigned Cash Tickets
                        </h2>

                        <p className="text-sm text-gray-500">
                            Cash tickets assigned to your account
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search ticket..."
                            className="h-9 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={loading}
                            className="h-9 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Refresh"}
                        </button>

                        <button
                            type="button"
                            onClick={onAdd}
                            className="h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Register
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                            <tr>
                                <th className="px-4 py-3">#</th>

                                <th className="px-4 py-3">
                                    Ticket Number
                                </th>

                                <th className="px-4 py-3">
                                    Date Assigned
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Assigned
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Issued
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Available
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Price / Ticket
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Assigned Amount
                                </th>

                                <th className="px-4 py-3">
                                    Office
                                </th>

                                <th className="px-4 py-3 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        Loading assigned cash tickets...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        No assigned cash tickets found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => {
                                    const available =
                                        getAvailableQuantity(item);

                                    return (
                                        <tr
                                            key={item.assignment_id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 text-gray-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {item.ticket_number}
                                            </td>

                                            <td className="px-4 py-3">
                                                {dateText(
                                                    item.assignment_date
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                {Number(
                                                    item.quantity_assigned ?? 0
                                                ).toLocaleString("en-PH")}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                {Number(
                                                    item.total_issued ?? 0
                                                ).toLocaleString("en-PH")}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <span
                                                    className={
                                                        available > 0
                                                            ? "font-semibold text-green-700"
                                                            : "font-semibold text-red-600"
                                                    }
                                                >
                                                    {available.toLocaleString(
                                                        "en-PH"
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                {peso(item.price_per_ticket)}
                                            </td>

                                            <td className="px-4 py-3 text-right font-medium">
                                                {peso(item.assigned_amount)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.office_name || "—"}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openTransaction(item)
                                                    }
                                                    disabled={available <= 0}
                                                    className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                                >
                                                    Issue Tickets
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
                    Showing {filteredData.length} of {data.length} assigned ticket(s)
                </div>
            </section>

            {/* TRANSACTION MODAL */}
            <CashTicketTransactionModal
                open={transactionModalOpen}
                cashTicket={
                    selectedTicket
                        ? {
                            assignment_id: selectedTicket.assignment_id,
                            cash_ticket_id: selectedTicket.cash_ticket_id,
                            ticket_number: selectedTicket.ticket_number,
                            number_of_tickets: selectedTicket.number_of_tickets,
                            quantity_assigned: selectedTicket.quantity_assigned,
                            available_quantity: getAvailableQuantity(selectedTicket),
                            price_per_ticket: selectedTicket.price_per_ticket,
                        }
                        : null
                }
                onClose={closeTransaction}
                onSuccess={handleTransactionSuccess}
            />
        </>
    );
}
