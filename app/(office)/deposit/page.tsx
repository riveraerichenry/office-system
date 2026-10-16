import ConsolidatedRCDTable from "@/components/deposit/ConsolidatedRCDTable";

export default function DepositPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* PAGE HEADER */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Deposit Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage consolidated Report of Collections and Deposits records.
            </p>
          </div>
        </header>

        {/* CONSOLIDATED RCD SECTION */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Consolidated RCD
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View, filter, and reprint consolidated RCD records.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-semibold text-blue-700">
                Consolidated Records
              </span>
            </div>
          </div>

          {/* TABLE COMPONENT */}
          <ConsolidatedRCDTable />
        </section>
      </div>
    </main>
  );
}