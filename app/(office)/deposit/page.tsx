import ConsolidatedRCDTable from "@/components/deposit/ConsolidatedRCDTable";


export default function DepositPage() {
  return (
    <main className="min-h-screen w-full bg-slate-50 p-2 sm:p-4 lg:p-6">
      <div className="mx-auto flex w-full max-w-none flex-col gap-6">
        {/* PAGE HEADER */}
        <header className="w-full">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deposit Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage consolidated Report of Collections and Deposits records.
          </p>
        </header>

        {/* CONSOLIDATED RCD TABLE - FULL WIDTH */}
        <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:px-5">
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

          {/* Allow the table to use the full width and scroll horizontally
              on smaller screens if its columns need more space. */}
          <div className="w-full min-w-0 overflow-x-auto">
            <ConsolidatedRCDTable />
          </div>
        </section>
      </div>
    </main>
  );
}