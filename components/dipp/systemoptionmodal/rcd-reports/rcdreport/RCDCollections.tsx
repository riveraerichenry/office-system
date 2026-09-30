
"use client";

import { useEffect, useState } from "react";
import { RCDItem, RCDFormRow } from "./RCDTypes";

type Props = {
    items: RCDItem[];
    totalCollections: number;
    formatCurrency: (
        value: number | string | null | undefined
    ) => string;
};

export default function RCDCollections({
    items,
    totalCollections,
    formatCurrency,
}: Props) {
    const [formRows, setFormRows] = useState<RCDFormRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadCollections() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/rcd/collections", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                    signal: controller.signal,
                    body: JSON.stringify({ items }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                            "Failed to load RCD collections."
                    );
                }

                setFormRows(
                    Array.isArray(result.formRows)
                        ? result.formRows
                        : []
                );
            } catch (err) {
                if (controller.signal.aborted) return;

                console.error("RCD collections error:", err);
                setFormRows([]);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load RCD collections."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCollections();

        return () => controller.abort();
    }, [items]);

    return (
        <section className="rcd-section mb-10">
            <div className="rcd-section-title">
                A. COLLECTIONS
                <span> ( 1. For Collectors )</span>
            </div>

            <table className="rcd-table">
                <thead>
                    <tr>
                        <th rowSpan={2} style={{ width: "38%" }}>
                            Type ( Form No )
                        </th>
                        <th colSpan={2}>
                            Official Receipts / Serial No
                        </th>
                        <th rowSpan={2} style={{ width: "25%" }}>
                            Amount
                        </th>
                    </tr>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="center">
                                Loading collections...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="center"
                                style={{ color: "red" }}
                            >
                                {error}
                            </td>
                        </tr>
                    ) : formRows.length === 0 ? (
                        <tr>
                            <td colSpan={4}>—</td>
                        </tr>
                    ) : (
                        formRows.map((row, index) => (
                            <tr key={`${row.formCode}-${index}`}>
                                <td className="bold">
                                    <center>{row.formCode}</center>
                                </td>

                                <td className="center">{row.from}</td>

                                <td className="center">{row.to}</td>

                                <td className="right bold">
                                    {formatCurrency(row.amount)}
                                </td>
                            </tr>
                        ))
                    )}

                    <tr>
                        <td
                            colSpan={3}
                            className="bold"
                            style={{ height: "50px" }}
                        >
                            TOTAL
                        </td>

                        <td
                            className="right bold"
                            style={{ fontSize: "15px" }}
                        >
                            {formatCurrency(totalCollections)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
}