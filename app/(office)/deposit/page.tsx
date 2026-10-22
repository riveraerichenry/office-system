import ConsolidatedRCDTable from "@/components/deposit/ConsolidatedRCDTable";
import DepositedRCD from "@/components/deposit/DepositedRCD";

export default function DepositPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6">
        {/* PAGE HEADER */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deposit Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage consolidated Report of Collections and Deposits records.
          </p>
        </header>

        {/* LEFT AND RIGHT TABLES */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          {/* LEFT: CONSOLIDATED RCD */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">
                Consolidated RCDs
              </h2>

              <div className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xs font-semibold text-blue-700">
                  Consolidated Records
                </span>
              </div>
            </div>

            <ConsolidatedRCDTable />
          </section>

          {/* RIGHT: DEPOSITED RCD */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <DepositedRCD />
          </section>
        </div>
      </div>
    </main>
  );
}