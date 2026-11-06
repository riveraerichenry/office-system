
"use client";

import { useEffect, useState } from "react";

type CashTicket = {
    assignment_id: number;
    cash_ticket_id: number;
    ticket_number: string;
    number_of_tickets: number;
    quantity_assigned: number;
    available_quantity: number;
    price_per_ticket: number | string;
};

type Props = {
    open: boolean;
    cashTicket: CashTicket | null;
    onClose: () => void;
    onSuccess: () => void;
};

const peso = (value: number | string | null | undefined) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));

export default function CashTicketTransactionModal({
    open,
    cashTicket,
    onClose,
    onSuccess,
}: Props) {
    const [quantityIssued, setQuantityIssued] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setQuantityIssued("");
            setError("");
            setSaving(false);
        }
    }, [open, cashTicket?.assignment_id]);

    if (!open || !cashTicket) return null;

    const ticket = cashTicket;

    const available = Number(ticket.available_quantity ?? 0);
    const pricePerTicket = Number(ticket.price_per_ticket ?? 0);
    const quantity = Number(quantityIssued);

    const totalAmount =
        Number.isSafeInteger(quantity) && quantity > 0
            ? quantity * pricePerTicket
            : 0;

    function validateQuantity(value: string) {
        if (!value.trim()) {
            setError("");
            return;
        }

        const parsed = Number(value);

        if (!Number.isSafeInteger(parsed) || parsed <= 0) {
            setError("Please enter a valid positive whole number.");
            return;
        }

        if (parsed > available) {
            setError(
                `Only ${available.toLocaleString("en-PH")} tickets are available.`
            );
            return;
        }

        setError("");
    }

    async function saveTransaction() {
        const requestedQuantity = Number(quantityIssued);

        if (
            !Number.isSafeInteger(requestedQuantity) ||
            requestedQuantity <= 0
        ) {
            setError("Please enter a valid quantity to issue.");
            return;
        }

        if (requestedQuantity > available) {
            setError(
                `Insufficient available tickets. Only ${available.toLocaleString("en-PH")} tickets are available.`
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await fetch(
                "/api/dipp/cash-ticket-transactions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        assignment_id: ticket.assignment_id,
                        quantity_issued: requestedQuantity,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Failed to save cash ticket transaction."
                );
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(
                "Save Cash Ticket Transaction Error:",
                err
            );

            setError(
                err.message ||
                    "Something went wrong while saving."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Issue Cash Tickets
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Record cash tickets issued to market vendors.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="space-y-5 p-6">

                    {/* CASH TICKET INFORMATION */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div className="col-span-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Available Cash Ticket
                                </p>

                                <p className="mt-1 text-lg font-bold text-gray-900">
                                    {ticket.ticket_number}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Assigned Quantity
                                </p>

                                <p className="mt-1 text-base font-semibold text-gray-900">
                                    {Number(
                                        ticket.quantity_assigned
                                    ).toLocaleString("en-PH")}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Available Quantity
                                </p>

                                <p className="mt-1 text-base font-bold text-blue-700">
                                    {available.toLocaleString("en-PH")}
                                </p>
                            </div>

                            <div className="col-span-2 border-t border-blue-200 pt-3">
                                <p className="text-xs text-gray-500">
                                    Price per Ticket
                                </p>

                                <p className="mt-1 font-semibold text-gray-900">
                                    {peso(pricePerTicket)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QUANTITY INPUT */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Quantity to Issue
                        </label>

                        <input
                            type="number"
                            min="1"
                            max={available}
                            step="1"
                            value={quantityIssued}
                            onChange={(event) => {
                                const value = event.target.value;

                                setQuantityIssued(value);
                                validateQuantity(value);
                            }}
                            placeholder="Enter quantity"
                            disabled={saving || available <= 0}
                            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Maximum available quantity:{" "}
                            {available.toLocaleString("en-PH")}
                        </p>
                    </div>

                    {/* AMOUNT SUMMARY */}
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <div className="space-y-3 p-4">

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Quantity Issued
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    {Number.isSafeInteger(quantity) && quantity > 0
                                        ? quantity.toLocaleString("en-PH")
                                        : "0"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Price per Ticket
                                </span>

                                <span className="text-sm font-semibold text-gray-900">
                                    {peso(pricePerTicket)}
                                </span>
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700">
                                        Total Amount
                                    </span>

                                    <span className="text-xl font-bold text-blue-700">
                                        {peso(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Remaining After Issuance
                                </span>

                                <span className="text-sm font-bold text-green-700">
                                    {(
                                        available -
                                        (
                                            Number.isSafeInteger(quantity) &&
                                            quantity > 0
                                                ? quantity
                                                : 0
                                        )
                                    ).toLocaleString("en-PH")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {available <= 0 && (
                        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                            There are no available tickets remaining in this assignment.
                        </p>
                    )}

                    {error && (
                        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={saveTransaction}
                        disabled={
                            saving ||
                            !Number.isSafeInteger(quantity) ||
                            quantity <= 0 ||
                            quantity > available
                        }
                        className="h-10 rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Transaction"}
                    </button>
                </div>
            </div>
        </div>
    );
}
