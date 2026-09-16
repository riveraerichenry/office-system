"use client";

import {
  FileText,
  WalletCards,
  Files,
  RefreshCw,
} from "lucide-react";

import CollectorRCDTable from "@/components/remittance/CollectorRCDTable";
import RemittanceTable from "@/components/remittance/RemittanceTable";
import ConsolidatedRCDTable from "@/components/remittance/ConsolidatedRCDTable";

export default function RemittancePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 p-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FileText size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Remittance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review collector RCDs and manage remittance records.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>


      {/* ======================================================
          COLLECTOR RCD + REMITTANCE TABLES
      ====================================================== */}

      <div className="grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-2">

        {/* ====================================================
            COLLECTOR RCD TABLE
        ==================================================== */}

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-800">
                  For Remittance
                </h2>

                <p className="text-xs text-slate-500">
                  RCDs submitted for remittance.
                </p>
              </div>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              For Review
            </span>

          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <CollectorRCDTable />
          </div>

        </section>


        {/* ====================================================
            REMITTANCE TABLE
        ==================================================== */}

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <WalletCards size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Remittances
                </h2>

                <p className="text-xs text-slate-500">
                  Processed remittance records.
                </p>
              </div>

            </div>

          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <RemittanceTable />
          </div>

        </section>

      </div>


      {/* ======================================================
          CONSOLIDATED RCD TABLE
      ====================================================== */}

      <section className="mt-5 flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Files size={18} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Consolidated RCDs
              </h2>

              <p className="text-xs text-slate-500">
                View consolidated reports of collection and deposits.
              </p>
            </div>

          </div>

        </div>

        <div className="min-h-0 overflow-auto">
          <ConsolidatedRCDTable />
        </div>

      </section>

    </div>
  );
}