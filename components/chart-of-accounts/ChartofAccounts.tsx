"use client";

import { BookOpen, Wallet } from "lucide-react";
import CollectionAccountsTable from "./CollectionAccountsTable";
import DisbursementAccountsTable from "./DisbursementAccountsTable";

export default function ChartOfAccounts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Chart of Accounts
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage collection and disbursement accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        
      </div>

      <div className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-2">
        <CollectionAccountsTable />
        <DisbursementAccountsTable />
      </div>
    </div>
  );
}