"use client";

import { useState } from "react";
import BarangayRATCreate from "@/components/rat/barangay/BarangayRATCreate";
import BarangayRATCreated from "@/components/rat/barangay/BarangayRATCreated";

export default function BarangayRATPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    function handleCreated() {
        setRefreshKey((current) => current + 1);
    }

    return (
        <main className="fixed inset-x-0 bottom-0 top-[74px] overflow-hidden bg-slate-100">
            <div className="h-full w-full overflow-hidden p-4 md:p-6">
                <div className="mx-auto w-full max-w-[1600px]">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">
                            Barangay RAT
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Requisition and Accountability
                            Tracking for barangay accountable
                            forms.
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
                        {/* Create RAT - 8 columns */}
                        <div className="min-w-0 xl:col-span-8">
                            <BarangayRATCreate
                                onCreated={handleCreated}
                            />
                        </div>

                        {/* Created RAT - 4 columns */}
                        <div className="min-w-0 xl:col-span-4">
                            <BarangayRATCreated
                                refreshKey={refreshKey}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}