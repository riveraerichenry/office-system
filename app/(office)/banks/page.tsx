
"use client";

import { useCallback, useState } from "react";
import { Landmark } from "lucide-react";
import Banks from "@/components/banks/Banks";
import BankAccounts from "@/components/banks/BankAccounts";

type Bank = {
  id: string;
  bank_code: string;
  bank_name: string;
  seq_no: number | null;
  remarks: string | null;
  is_active: boolean;
  account_count?: number;
};

export default function BanksPage() {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectBank = useCallback((bank: Bank) => {
    setSelectedBank(bank);
  }, []);

  const handleBanksUpdated = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-700 p-3 text-white">
            <Landmark size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Banks Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage registered banks and their associated accounts.
            </p>
          </div>
        </header>

        {/* 5 columns for Banks and 7 columns for Bank Accounts */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-4">
            <Banks
              selectedBankId={selectedBank?.id ?? ""}
              onSelectBank={handleSelectBank}
              onBanksUpdated={handleBanksUpdated}
            />
          </div>

          <div className="min-w-0 xl:col-span-8">
            <BankAccounts
              selectedBank={selectedBank}
              refreshKey={refreshKey}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
