"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Landmark,
  CalendarDays,
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  CreditCard,
  Banknote,
} from "lucide-react";

type DepositFormModalProps = {
  open: boolean;
  onClose: () => void;
};

type Bank = {
  id: string;
  name: string;
};

type BankAccount = {
  id: string;
  bankId: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
};

const SAMPLE_BANKS: Bank[] = [
  { id: "bank-1", name: "LandBank" },
  { id: "bank-2", name: "Development Bank of the Philippines" },
];

const SAMPLE_ACCOUNTS: BankAccount[] = [
  {
    id: "account-1",
    bankId: "bank-1",
    accountName: "General Fund",
    accountNumber: "0000-0000-4821",
    accountType: "Savings",
  },
  {
    id: "account-2",
    bankId: "bank-1",
    accountName: "Trust Fund",
    accountNumber: "0000-0000-7350",
    accountType: "Current",
  },
  {
    id: "account-3",
    bankId: "bank-2",
    accountName: "Special Education Fund",
    accountNumber: "0000-0000-1926",
    accountType: "Current",
  },
];

const DENOMINATIONS = [
  { value: 1000, label: "₱1,000" },
  { value: 500, label: "₱500" },
  { value: 200, label: "₱200" },
  { value: 100, label: "₱100" },
  { value: 50, label: "₱50" },
  { value: 20, label: "₱20" },
  { value: 10, label: "₱10" },
  { value: 5, label: "₱5" },
  { value: 1, label: "₱1" },
  { value: 0.25, label: "₱0.25" },
];

const formatPeso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function DepositFormModal({
  open,
  onClose,
}: DepositFormModalProps) {
  const [banks] = useState<Bank[]>(SAMPLE_BANKS);
  const [accounts] = useState<BankAccount[]>(SAMPLE_ACCOUNTS);

  const [depositDate, setDepositDate] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open && !depositDate) {
      const today = new Date();
      const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      setDepositDate(localDate);
    }
  }, [open, depositDate]);

  const availableAccounts = useMemo(
    () => accounts.filter((account) => account.bankId === selectedBankId),
    [accounts, selectedBankId]
  );

  const totalCash = useMemo(
    () =>
      DENOMINATIONS.reduce((total, denomination) => {
        const quantity = Number(quantities[denomination.value] || 0);
        return total + denomination.value * quantity;
      }, 0),
    [quantities]
  );

  useEffect(() => {
    if (
      selectedAccountId &&
      !availableAccounts.some(
        (account) => account.id === selectedAccountId
      )
    ) {
      setSelectedAccountId("");
    }
  }, [availableAccounts, selectedAccountId]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  function resetForm() {
    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setDepositDate(localDate);
    setSelectedBankId("");
    setSelectedAccountId("");
    setReferenceNumber("");
    setRemarks("");
    setQuantities({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBankId) {
      alert("Please select a bank.");
      return;
    }

    if (!selectedAccountId) {
      alert("Please select a bank account.");
      return;
    }

    if (totalCash <= 0) {
      alert("Please enter at least one cash denomination quantity.");
      return;
    }

    const selectedBank = banks.find(
      (bank) => bank.id === selectedBankId
    );

    const selectedAccount = accounts.find(
      (account) => account.id === selectedAccountId
    );

    const depositData = {
      depositDate,
      bank: selectedBank,
      bankAccount: selectedAccount,
      referenceNumber: referenceNumber.trim(),
      denominations: DENOMINATIONS.map((denomination) => ({
        denomination: denomination.value,
        quantity: Number(quantities[denomination.value] || 0),
        subtotal:
          denomination.value *
          Number(quantities[denomination.value] || 0),
      })),
      totalCash,
      remarks: remarks.trim(),
    };

    console.log("Deposit form data:", depositData);

    alert(
      `Deposit validated successfully.\nTotal: ${formatPeso(totalCash)}\n\nDatabase saving is not connected yet.`
    );
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

  const sectionTitleClass = "text-sm font-bold text-gray-900";

  return (
    <div
      className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/60 p-2"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <Landmark size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Cash Deposit
              </h2>
              <p className="text-xs text-gray-500">
                Select a bank account and enter the cash breakdown.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close deposit modal"
            className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable content */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Deposit information */}
            <section className="space-y-2">
              <h3 className={sectionTitleClass}>
                1. Deposit Information
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Deposit Date <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="date"
                      required
                      value={depositDate}
                      onChange={(event) =>
                        setDepositDate(event.target.value)
                      }
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Deposit Reference Number
                  </label>

                  <div className="relative">
                    <FileText
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={referenceNumber}
                      onChange={(event) =>
                        setReferenceNumber(event.target.value)
                      }
                      placeholder="Enter reference number"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Bank selection */}
            <section className="space-y-2">
              <h3 className={sectionTitleClass}>
                2. Select Bank <span className="text-red-500">*</span>
              </h3>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {banks.map((bank) => {
                  const selected = selectedBankId === bank.id;

                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`flex items-center gap-3 rounded-lg border-2 p-2.5 text-left transition ${
                        selected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Landmark size={19} />
                      </div>

                      <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900">
                        {bank.name}
                      </span>

                      {selected && (
                        <CheckCircle2
                          size={19}
                          className="shrink-0 text-blue-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Bank account carousel */}
            <section className="space-y-2">
              <h3 className={sectionTitleClass}>
                3. Select Bank Account{" "}
                <span className="text-red-500">*</span>
              </h3>

              {!selectedBankId ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center">
                  <CreditCard
                    size={23}
                    className="mx-auto mb-1.5 text-gray-400"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    Select a bank first
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Bank accounts will appear here.
                  </p>
                </div>
              ) : availableAccounts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500">
                  No accounts are available for this bank.
                </div>
              ) : (
                <div className="-mx-1 overflow-x-auto px-1 pb-1.5">
                  <div className="flex snap-x snap-mandatory gap-3">
                    {availableAccounts.map((account) => {
                      const selected =
                        selectedAccountId === account.id;

                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() =>
                            setSelectedAccountId(account.id)
                          }
                          className={`w-[220px] shrink-0 snap-start rounded-xl border-2 p-3 text-left transition ${
                            selected
                              ? "border-blue-600 bg-blue-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div
                              className={`rounded-lg p-2 ${
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <CreditCard size={20} />
                            </div>

                            {selected && (
                              <CheckCircle2
                                size={19}
                                className="text-blue-600"
                              />
                            )}
                          </div>

                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            {account.accountType} Account
                          </p>

                          <h4 className="mt-0.5 truncate text-sm font-bold text-gray-900">
                            {account.accountName}
                          </h4>

                          <p className="mt-2 text-[11px] text-gray-500">
                            Account Number
                          </p>

                          <p className="truncate font-mono text-xs font-semibold text-gray-900">
                            {account.accountNumber}
                          </p>

                          <div
                            className={`mt-3 rounded-md px-2 py-1.5 text-center text-xs font-semibold ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {selected ? "Selected" : "Select Account"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Cash breakdown */}
            <section className="space-y-2">
              <div>
                <h3 className={sectionTitleClass}>
                  4. Cash Deposit Breakdown
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Enter the quantity of each bill or coin.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[450px] text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-600">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">
                          Denomination
                        </th>
                        <th className="w-32 px-3 py-2 text-right font-semibold">
                          Quantity
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Subtotal
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {DENOMINATIONS.map((denomination) => {
                        const quantity = Number(
                          quantities[denomination.value] || 0
                        );

                        const subtotal =
                          denomination.value * quantity;

                        const isCoin = denomination.value < 20;

                        return (
                          <tr
                            key={denomination.value}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex h-7 min-w-14 items-center justify-center rounded-md px-2 text-xs font-bold ${
                                    isCoin
                                      ? "bg-amber-50 text-amber-800"
                                      : "bg-blue-50 text-blue-800"
                                  }`}
                                >
                                  {denomination.label}
                                </span>

                                <span className="text-[11px] text-gray-500">
                                  {isCoin ? "Coin" : "Bill"}
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-1.5">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                value={
                                  quantities[denomination.value] ?? ""
                                }
                                onChange={(event) => {
                                  const value = event.target.value;

                                  if (
                                    value !== "" &&
                                    (!/^\d+$/.test(value) ||
                                      !Number.isSafeInteger(
                                        Number(value)
                                      ))
                                  ) {
                                    return;
                                  }

                                  setQuantities((previous) => ({
                                    ...previous,
                                    [denomination.value]: value,
                                  }));
                                }}
                                placeholder="0"
                                aria-label={`Quantity of ${denomination.label}`}
                                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-right text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                              />
                            </td>

                            <td className="whitespace-nowrap px-3 py-1.5 text-right text-sm font-medium text-gray-900">
                              {formatPeso(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-blue-50">
                        <td
                          colSpan={2}
                          className="px-3 py-2.5 text-sm font-bold text-gray-900"
                        >
                          Total Cash Deposit
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-base font-bold text-blue-700">
                          {formatPeso(totalCash)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </section>

            {/* Remarks */}
            <section className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Remarks
              </label>

              <textarea
                rows={2}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Additional deposit information..."
                className={`${inputClass} resize-y`}
              />
            </section>

            {/* Total summary */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-white p-2 text-blue-700">
                  <Banknote size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Total Deposit Amount
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Automatically calculated
                  </p>
                </div>
              </div>

              <p className="whitespace-nowrap text-lg font-bold text-blue-700">
                {formatPeso(totalCash)}
              </p>
            </div>
          </div>

          {/* Fixed footer */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white px-4 py-2">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={15} />
                Validate Deposit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}