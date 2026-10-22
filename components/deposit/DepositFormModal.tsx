"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  X,
  Landmark,
  CalendarDays,
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  CreditCard,
  Plus,
  Trash2,
  Printer,
  ReceiptText,
  Banknote,
} from "lucide-react";

type DepositFormModalProps = {
  open: boolean;
  onClose: () => void;
  rcdNumber?: string;
  rcdAmount?: number;
};

type Bank = { id: string; name: string };
type BankAccount = {
  id: string;
  bankId: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
};
type CheckType = "ON_US" | "LOCAL";
type DepositCheck = {
  id: string;
  checkNumber: string;
  checkDate: string;
  bankName: string;
  amount: string;
  remarks: string;
  checkType: CheckType;
};

// Replace these sample records with your bank/account API data when available.
const SAMPLE_BANKS: Bank[] = [
  { id: "bank-1", name: "LandBank" },
  { id: "bank-2", name: "Development Bank of the Philippines" },
];
const SAMPLE_ACCOUNTS: BankAccount[] = [
  { id: "account-1", bankId: "bank-1", accountName: "General Fund", accountNumber: "0000-0000-4821", accountType: "Savings" },
  { id: "account-2", bankId: "bank-1", accountName: "Trust Fund", accountNumber: "0000-0000-7350", accountType: "Current" },
  { id: "account-3", bankId: "bank-2", accountName: "Special Education Fund", accountNumber: "0000-0000-1926", accountType: "Current" },
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
  }).format(Number.isFinite(value) ? value : 0);

const formatDate = (value: string) => {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString("en-PH", {
    month: "short", day: "2-digit", year: "numeric",
  });
};

const getLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "—").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] as string);

export default function DepositFormModal({
  open,
  onClose,
  rcdNumber = "",
  rcdAmount = 0,
}: DepositFormModalProps) {
  const [depositDate, setDepositDate] = useState(getLocalDate());
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [checks, setChecks] = useState<DepositCheck[]>([]);
  const [validationMessage, setValidationMessage] = useState("");

  const banks = SAMPLE_BANKS;
  const accounts = SAMPLE_ACCOUNTS;
  const selectedBank = banks.find((bank) => bank.id === selectedBankId);
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
  const availableAccounts = accounts.filter((account) => account.bankId === selectedBankId);

  const cashRows = useMemo(() => DENOMINATIONS.map((denomination) => {
    const quantity = Number(quantities[denomination.value] || 0);
    return { ...denomination, quantity, subtotal: denomination.value * quantity };
  }), [quantities]);
  const totalCash = cashRows.reduce((sum, row) => sum + row.subtotal, 0);

  const validChecks = checks.filter((check) =>
    check.checkNumber.trim() && check.checkDate && check.bankName.trim() &&
    Number.isFinite(Number(check.amount)) && Number(check.amount) > 0
  );
  const onUsChecks = validChecks.filter((check) => check.checkType === "ON_US");
  const localChecks = validChecks.filter((check) => check.checkType === "LOCAL");
  const totalChecks = validChecks.reduce((sum, check) => sum + Number(check.amount), 0);
  const totalOnUs = onUsChecks.reduce((sum, check) => sum + Number(check.amount), 0);
  const totalLocal = localChecks.reduce((sum, check) => sum + Number(check.amount), 0);
  const totalDeposit = totalCash + totalChecks;

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (selectedAccountId && !availableAccounts.some((account) => account.id === selectedAccountId)) {
      setSelectedAccountId("");
    }
  }, [selectedAccountId, selectedBankId]);

  if (!open) return null;

  const inputClass = "w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100";
  const sectionTitleClass = "text-sm font-bold text-gray-900";

  function addCheck() {
    setChecks((previous) => [...previous, {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      checkNumber: "", checkDate: getLocalDate(), bankName: "", amount: "", remarks: "", checkType: "ON_US",
    }]);
    setValidationMessage("");
  }

  function updateCheck(id: string, field: keyof Omit<DepositCheck, "id">, value: string) {
    setChecks((previous) => previous.map((check) => check.id === id ? { ...check, [field]: value } : check));
    setValidationMessage("");
  }

  function resetForm() {
    setDepositDate(getLocalDate());
    setSelectedBankId("");
    setSelectedAccountId("");
    setReferenceNumber("");
    setRemarks("");
    setQuantities({});
    setChecks([]);
    setValidationMessage("");
  }

  function validateHeader() {
    setValidationMessage("");
    if (!depositDate) return fail("Please select a deposit date.");
    if (!selectedBankId) return fail("Please select a bank.");
    if (!selectedAccountId) return fail("Please select a bank account.");
    return true;
  }

  function fail(message: string) {
    setValidationMessage(message);
    return false;
  }

  function hasIncompleteCheck() {
    return checks.some((check) => {
      const started = Boolean(check.checkNumber.trim() || check.bankName.trim() || check.amount.trim() || check.remarks.trim());
      if (!started) return false;
      return !check.checkNumber.trim() || !check.checkDate || !check.bankName.trim() || !Number.isFinite(Number(check.amount)) || Number(check.amount) <= 0;
    });
  }

  function validateGroupedChecks() {
    if (!validateHeader()) return false;
    if (hasIncompleteCheck()) return fail("Complete or remove every partially entered check before printing a grouped deposit slip.");
    return true;
  }

  function validateDeposit() {
    if (!validateHeader()) return false;
    if (totalCash <= 0 && totalChecks <= 0) return fail("Enter at least one cash denomination quantity or one valid check.");
    if (hasIncompleteCheck()) return fail("Complete or remove every partially entered check before validating the deposit.");
    return true;
  }

  function buildDepositData() {
    return {
      rcdNumber,
      rcdAmount,
      depositDate,
      bank: selectedBank,
      bankAccount: selectedAccount,
      referenceNumber: referenceNumber.trim(),
      denominations: cashRows.map((row) => ({ denomination: row.value, quantity: row.quantity, subtotal: row.subtotal })),
      totalCash,
      checks: validChecks.map((check) => ({ ...check, amount: Number(check.amount) })),
      totalChecks,
      totalOnUs,
      totalLocal,
      totalDeposit,
      remarks: remarks.trim(),
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateDeposit()) return;
    console.log("Deposit form data:", buildDepositData());
    alert(`Deposit validated.\nRCD No.: ${rcdNumber || "—"}\nRCD Amount: ${formatPeso(rcdAmount)}\nCash: ${formatPeso(totalCash)}\nOn Us Checks: ${formatPeso(totalOnUs)}\nLocal Checks: ${formatPeso(totalLocal)}\nNew Deposit Total: ${formatPeso(totalDeposit)}\n\nDatabase saving is not connected yet.`);
  }

  function openPrintDocument(title: string, content: string) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setValidationMessage("The print window was blocked. Allow pop-ups for this site and try again.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:24px;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:12px}.document{width:100%;max-width:1100px;margin:0 auto}.heading{padding-bottom:16px;margin-bottom:18px;border-bottom:2px solid #1e3a8a;text-align:center}.heading h1{margin:0 0 6px;font-size:19px}.heading p{margin:0;color:#4b5563;font-size:11px}.details{display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin-bottom:20px}.details div{display:flex;flex-direction:column;gap:3px}.details span{color:#6b7280;font-size:10px}.details strong{font-size:12px;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;margin:12px 0 18px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#f3f4f6}.number{text-align:right;white-space:nowrap}tfoot td{background:#eff6ff;font-weight:700}.total-card{display:flex;justify-content:space-between;gap:16px;padding:14px;border:1px solid #bfdbfe;background:#eff6ff;font-size:14px}.total-card strong{color:#1d4ed8;white-space:nowrap}.remarks{margin-top:18px;overflow-wrap:anywhere}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:65px}.signature{border-top:1px solid #111827;padding-top:7px;text-align:center}@page{size:landscape;margin:12mm}@media print{body{padding:0}.document{max-width:none}thead{display:table-header-group}tr{break-inside:avoid}}
</style></head><body><main class="document"><header class="heading"><h1>${escapeHtml(title)}</h1><p>Municipal Treasury — Deposit Record</p></header>
<section class="details">
<div><span>Consolidated RCD No.</span><strong>${escapeHtml(rcdNumber || "—")}</strong></div>
<div><span>Consolidated RCD Amount</span><strong>${escapeHtml(formatPeso(Number(rcdAmount) || 0))}</strong></div>
<div><span>Deposit Date</span><strong>${escapeHtml(formatDate(depositDate))}</strong></div>
<div><span>Deposit Reference Number</span><strong>${escapeHtml(referenceNumber.trim() || "—")}</strong></div>
<div><span>Depositing Bank</span><strong>${escapeHtml(selectedBank?.name || "—")}</strong></div>
<div><span>Bank Account</span><strong>${escapeHtml(selectedAccount?.accountName || "—")}</strong></div>
<div><span>Account Number</span><strong>${escapeHtml(selectedAccount?.accountNumber || "—")}</strong></div>
</section>${content}<div class="remarks"><strong>General Remarks:</strong> ${escapeHtml(remarks.trim() || "—")}</div><div class="signatures"><div class="signature">Prepared By</div><div class="signature">Checked By</div></div></main><script>window.addEventListener('load',function(){window.focus();window.print();});</script></body></html>`);
    printWindow.document.close();
  }

  function printCashSlip() {
    if (!validateHeader()) return;
    if (totalCash <= 0) return fail("Enter at least one cash denomination quantity before printing the cash slip.");
    const rows = cashRows.filter((row) => row.quantity > 0).map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${row.value < 20 ? "Coin" : "Bill"}</td><td class="number">${row.quantity.toLocaleString("en-PH")}</td><td class="number">${escapeHtml(formatPeso(row.subtotal))}</td></tr>`).join("");
    openPrintDocument("CASH DEPOSIT SLIP", `<table><thead><tr><th>Denomination</th><th>Type</th><th class="number">Quantity</th><th class="number">Subtotal</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3">Total Cash</td><td class="number">${escapeHtml(formatPeso(totalCash))}</td></tr></tfoot></table><div class="total-card"><span>Total Cash Deposit</span><strong>${escapeHtml(formatPeso(totalCash))}</strong></div>`);
  }

  function printCheckSlip(checkType: CheckType) {
    if (!validateGroupedChecks()) return;
    const checksToPrint = checkType === "ON_US" ? onUsChecks : localChecks;
    if (!checksToPrint.length) return fail(`There are no ${checkType === "ON_US" ? "On Us" : "Local"} checks to print.`);
    const total = checksToPrint.reduce((sum, check) => sum + Number(check.amount), 0);
    const typeLabel = checkType === "ON_US" ? "On Us" : "Local";
    const rows = checksToPrint.map((check, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(check.checkNumber)}</td><td>${escapeHtml(formatDate(check.checkDate))}</td><td>${escapeHtml(check.bankName)}</td><td class="number">${escapeHtml(formatPeso(Number(check.amount)))}</td><td>${escapeHtml(check.remarks.trim() || "—")}</td></tr>`).join("");
    openPrintDocument(`${typeLabel.toUpperCase()} CHECK DEPOSIT SLIP`, `<table><thead><tr><th>#</th><th>Check Number</th><th>Check Date</th><th>Issuing Bank</th><th class="number">Amount</th><th>Remarks</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4">Total ${typeLabel} Checks (${checksToPrint.length})</td><td class="number">${escapeHtml(formatPeso(total))}</td><td></td></tr></tfoot></table><div class="total-card"><span>Total ${typeLabel} Checks</span><strong>${escapeHtml(formatPeso(total))}</strong></div>`);
  }

  return (
    <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/60 p-2 sm:p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex h-[calc(100dvh-16px)] max-h-[900px] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* COMPACT HEADER: original size/padding retained; RCD details added on the same row */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700"><Landmark size={20} /></div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900">Cash and Check Deposit</h2>
              <p className="hidden text-xs text-gray-500 sm:block">One deposit entry with separate cash, On Us, and Local slips.</p>
            </div>
          </div>
          <div className="ml-auto flex min-w-0 items-center justify-end gap-3">
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Consolidated RCD No.</p>
              <p className="max-w-[130px] truncate text-xs font-bold text-blue-800 sm:max-w-[200px]" title={rcdNumber || "No RCD selected"}>{rcdNumber || "No RCD selected"}</p>
            </div>
            <div className="shrink-0 border-l border-gray-200 pl-3 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">RCD Amount</p>
              <p className="whitespace-nowrap text-sm font-bold tabular-nums text-gray-900">{formatPeso(Number(rcdAmount) || 0)}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close deposit modal" className="shrink-0 rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"><X size={20} /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-3 sm:p-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-5 lg:overflow-hidden">
            <div className="flex min-w-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
              <section className="space-y-2 rounded-lg border border-gray-200 p-3">
                <h3 className={sectionTitleClass}>1. Deposit Information</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div><label className="mb-1 block text-xs font-medium text-gray-700">Deposit Date *</label><div className="relative"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="date" required value={depositDate} onChange={(e) => setDepositDate(e.target.value)} className={`${inputClass} pl-9`} /></div></div>
                  <div><label className="mb-1 block text-xs font-medium text-gray-700">Deposit Reference Number</label><div className="relative"><FileText size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Enter reference number" className={`${inputClass} pl-9`} /></div></div>
                </div>
              </section>

              <section className="space-y-2 rounded-lg border border-gray-200 p-3">
                <h3 className={sectionTitleClass}>2. Select Bank *</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {banks.map((bank) => {
                    const selected = selectedBankId === bank.id;
                    return <button key={bank.id} type="button" onClick={() => setSelectedBankId(bank.id)} aria-pressed={selected} className={`flex min-w-0 items-center gap-2 rounded-lg border-2 p-2 text-left transition ${selected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}><div className={`shrink-0 rounded-lg p-2 ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}><Landmark size={18} /></div><span className="min-w-0 flex-1 text-xs font-semibold text-gray-900 sm:text-sm">{bank.name}</span>{selected && <CheckCircle2 size={17} className="shrink-0 text-blue-600" />}</button>;
                  })}
                </div>
              </section>

              <section className="min-w-0 space-y-2 rounded-lg border border-gray-200 p-3">
                <h3 className={sectionTitleClass}>3. Select Bank Account *</h3>
                {!selectedBankId ? <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-sm text-gray-600">Select a bank first.</div> : availableAccounts.length === 0 ? <div className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-sm text-gray-500">No accounts are available for this bank.</div> : <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{availableAccounts.map((account) => {
                  const selected = selectedAccountId === account.id;
                  return <button key={account.id} type="button" onClick={() => setSelectedAccountId(account.id)} aria-pressed={selected} className={`min-w-0 rounded-lg border-2 p-3 text-left transition ${selected ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-300"}`}><div className="flex items-start justify-between gap-2"><CreditCard size={17} />{selected && <CheckCircle2 size={17} className="text-blue-600" />}</div><p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">{account.accountType} Account</p><h4 className="mt-0.5 break-words text-sm font-bold text-gray-900">{account.accountName}</h4><p className="mt-1 text-[10px] text-gray-500">Account Number</p><p className="break-all font-mono text-xs font-semibold text-gray-900">{account.accountNumber}</p><div className={`mt-2 rounded-md px-2 py-1 text-center text-xs font-semibold ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>{selected ? "Selected" : "Select Account"}</div></button>;
                })}</div>}
              </section>

              <section className="space-y-3 rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between gap-2"><div><h3 className={sectionTitleClass}>4. Check Payments</h3><p className="mt-0.5 text-xs text-gray-500">Checks are grouped by type when printing.</p></div><button type="button" onClick={addCheck} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"><Plus size={15} />Add Check</button></div>
                {checks.length === 0 ? <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center"><ReceiptText size={22} className="mx-auto mb-1 text-gray-400" /><p className="text-sm font-medium text-gray-700">No checks added</p><p className="text-xs text-gray-500">Cash-only deposits are supported.</p></div> : <div className="space-y-3">{checks.map((check, index) => <div key={check.id} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-2"><p className="text-xs font-bold text-gray-800">Check #{index + 1}</p><button type="button" onClick={() => setChecks((prev) => prev.filter((item) => item.id !== check.id))} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={14} />Remove</button></div>
                  <div><label className="mb-1 block text-xs font-medium text-gray-700">Check Type *</label><select value={check.checkType} onChange={(e) => updateCheck(check.id, "checkType", e.target.value)} className={inputClass}><option value="ON_US">On Us Check</option><option value="LOCAL">Local Check</option></select></div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div><label className="mb-1 block text-xs font-medium text-gray-700">Check Number *</label><input value={check.checkNumber} onChange={(e) => updateCheck(check.id, "checkNumber", e.target.value)} placeholder="Enter check number" className={inputClass} /></div>
                    <div><label className="mb-1 block text-xs font-medium text-gray-700">Check Date *</label><input type="date" value={check.checkDate} onChange={(e) => updateCheck(check.id, "checkDate", e.target.value)} className={inputClass} /></div>
                    <div><label className="mb-1 block text-xs font-medium text-gray-700">Issuing Bank *</label><input value={check.bankName} onChange={(e) => updateCheck(check.id, "bankName", e.target.value)} placeholder="Bank printed on check" className={inputClass} /></div>
                    <div><label className="mb-1 block text-xs font-medium text-gray-700">Check Amount (₱) *</label><input type="number" min="0.01" step="0.01" inputMode="decimal" value={check.amount} onChange={(e) => { const value = e.target.value; if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) updateCheck(check.id, "amount", value); }} placeholder="0.00" className={`${inputClass} text-right tabular-nums`} /></div>
                  </div>
                  <div><label className="mb-1 block text-xs font-medium text-gray-700">Check Remarks</label><input value={check.remarks} onChange={(e) => updateCheck(check.id, "remarks", e.target.value)} placeholder="Optional remarks" className={inputClass} /></div>
                  <div className="border-t border-gray-200 pt-3"><span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${check.checkType === "ON_US" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}`}>{check.checkType === "ON_US" ? "On Us Check" : "Local Check"}</span></div>
                </div>)}</div>}
                {checks.length > 0 && <div className="flex items-center justify-between gap-3 rounded-md bg-orange-50 px-3 py-2"><span className="text-xs font-semibold text-gray-700">Valid checks: {validChecks.length} / {checks.length}</span><span className="whitespace-nowrap text-sm font-bold text-orange-800">{formatPeso(totalChecks)}</span></div>}
              </section>

              <section className="space-y-1 rounded-lg border border-gray-200 p-3"><label className="block text-xs font-semibold text-gray-700">Deposit Remarks</label><textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Additional deposit information..." className={`${inputClass} resize-y`} /></section>
            </div>

            <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
              <section className="min-w-0 rounded-lg border border-gray-200 p-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                <div className="mb-2 shrink-0"><h3 className={sectionTitleClass}>5. Cash Denomination Breakdown</h3><p className="mt-0.5 text-xs text-gray-500">Enter the quantity of each bill or coin.</p></div>
                <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 lg:min-h-0 lg:flex-1"><div className="h-full overflow-y-auto"><table className="w-full table-fixed text-sm"><thead className="sticky top-0 z-10 bg-gray-50 text-xs text-gray-600"><tr><th className="w-[35%] px-2 py-2 text-left font-semibold sm:px-3">Denomination</th><th className="w-[25%] px-2 py-2 text-right font-semibold sm:px-3">Quantity</th><th className="w-[40%] px-2 py-2 text-right font-semibold sm:px-3">Subtotal</th></tr></thead><tbody className="divide-y divide-gray-100">{DENOMINATIONS.map((denomination) => { const quantity = Number(quantities[denomination.value] || 0); const subtotal = denomination.value * quantity; const isCoin = denomination.value < 20; return <tr key={denomination.value} className="hover:bg-gray-50"><td className="px-2 py-1.5 sm:px-3"><span className={`inline-flex items-center justify-center rounded-md px-1.5 py-1 text-[11px] font-bold sm:px-2 sm:text-xs ${isCoin ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-800"}`}>{denomination.label}</span></td><td className="px-2 py-1 sm:px-3"><input type="number" min="0" step="1" inputMode="numeric" value={quantities[denomination.value] ?? ""} onChange={(e) => { const value = e.target.value; if (value === "" || (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)))) setQuantities((prev) => ({ ...prev, [denomination.value]: value })); }} placeholder="0" aria-label={`Quantity of ${denomination.label}`} className="w-full min-w-0 rounded-md border border-gray-300 px-2 py-1.5 text-right text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100" /></td><td className="whitespace-nowrap px-2 py-1.5 text-right text-xs font-medium text-gray-900 sm:px-3 sm:text-sm">{formatPeso(subtotal)}</td></tr>; })}</tbody><tfoot className="sticky bottom-0 bg-blue-50"><tr><td colSpan={2} className="px-2 py-2 text-xs font-bold text-gray-900 sm:px-3 sm:text-sm">Total Cash</td><td className="whitespace-nowrap px-2 py-2 text-right text-sm font-bold text-blue-700 sm:px-3 sm:text-base">{formatPeso(totalCash)}</td></tr></tfoot></table></div></div>
              </section>

              <div className="shrink-0 space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-gray-700">Cash Total</span><span className="font-semibold tabular-nums text-gray-900">{formatPeso(totalCash)}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-gray-700">On Us Checks</span><span className="font-semibold tabular-nums text-gray-900">{formatPeso(totalOnUs)}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-gray-700">Local Checks</span><span className="font-semibold tabular-nums text-gray-900">{formatPeso(totalLocal)}</span></div>
                <div className="flex items-center justify-between gap-3 border-t border-blue-200 pt-2"><span className="text-sm font-bold text-gray-900">New Deposit Total</span><span className="whitespace-nowrap text-lg font-bold tabular-nums text-blue-700">{formatPeso(totalDeposit)}</span></div>
              </div>

              <section className="shrink-0 space-y-3 rounded-lg border border-gray-200 p-3">
                <h3 className={sectionTitleClass}>6. Print Deposit Slips</h3>
                <p className="text-xs text-gray-500">Print each slip separately. Checks are grouped by type.</p>
                <button type="button" onClick={printCashSlip} className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"><Banknote size={16} />Print Cash Deposit Slip<span className="ml-auto">{formatPeso(totalCash)}</span></button>
                <button type="button" onClick={() => printCheckSlip("ON_US")} className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"><Printer size={16} />Print On Us Checks<span className="ml-auto">{onUsChecks.length} · {formatPeso(totalOnUs)}</span></button>
                <button type="button" onClick={() => printCheckSlip("LOCAL")} className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100"><Printer size={16} />Print Local Checks<span className="ml-auto">{localChecks.length} · {formatPeso(totalLocal)}</span></button>
              </section>
            </div>
          </div>

          {validationMessage && <div role="alert" className="mx-3 mb-2 shrink-0 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sm:mx-4">{validationMessage}</div>}
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2 sm:px-4">
            <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"><RotateCcw size={15} />Reset</button>
            <div className="flex items-center gap-2"><button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">Cancel</button><button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:px-4"><Save size={15} />Validate Deposit</button></div>
          </div>
        </form>
      </div>
    </div>
  );
}
