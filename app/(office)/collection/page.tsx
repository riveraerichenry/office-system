"use client";

import CollectionTable from "@/components/collection/CollectionTable";

export default function CollectionPage() {
    return (
        <div className="min-h-full bg-slate-100 p-4">

            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-800">
                    Collection
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Collection distribution by RCD, collector, and account.
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <CollectionTable />
            </div>

        </div>
    );
}