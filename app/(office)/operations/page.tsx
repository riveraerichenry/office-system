"use client";

import OperationsTransactionTable from "@/components/operations/OperationsTransactionTable";

export default function OperationsPage() {
    return (
        <div className="min-h-full bg-slate-100 p-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-800">
                    Operations
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Monitor and manage operational transactions.
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <OperationsTransactionTable />
            </div>
        </div>
    );
}