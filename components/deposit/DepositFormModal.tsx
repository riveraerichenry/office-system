"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import Swal from "sweetalert2";

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

  consolidatedRcdId?: string;

  rcdNumber?: string;

  rcdAmount?: number;

  fundSourceId?: string;

};

type Bank = {

  id: string;

  bank_code: string;

  name: string;

};

type BankAccount = {

  id: string;

  bankId: string;

  sequenceCode: string;

  accountName: string;

  accountNumber: string;

  accountCode: string | null;

  accountStatus: string | null;

  depositLabel: string | null;

  remarks: string | null;

  isActive: boolean;

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

  return new Date(

    Number(match[1]),

    Number(match[2]) - 1,

    Number(match[3])

  ).toLocaleDateString("en-PH", {

    month: "short",

    day: "2-digit",

    year: "numeric",

  });

};

const getLocalDate = () => {

  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(

    2,

    "0"

  )}-${String(now.getDate()).padStart(2, "0")}`;

};

const escapeHtml = (value: unknown) =>

  String(value ?? "—").replace(/[&<>"']/g, (character) => ({

    "&": "&amp;",

    "<": "&lt;",

    ">": "&gt;",

    '"': "&quot;",

    "'": "&#39;",

  })[character] as string);

export default function DepositFormModal({

  open,

  onClose,

  consolidatedRcdId = "",

  rcdNumber = "",

  rcdAmount = 0,

  fundSourceId = "",

}: DepositFormModalProps) {

  const [depositDate, setDepositDate] = useState(getLocalDate());

  const [selectedBankId, setSelectedBankId] = useState("");

  const [selectedAccountId, setSelectedAccountId] = useState("");

  const [referenceNumber, setReferenceNumber] = useState("");

  const [remarks, setRemarks] = useState("");

  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const [checks, setChecks] = useState<DepositCheck[]>([]);

  const [validationMessage, setValidationMessage] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [banks, setBanks] = useState<Bank[]>([]);

  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  const [banksLoading, setBanksLoading] = useState(false);

  const [accountsLoading, setAccountsLoading] = useState(false);

  const selectedBank = banks.find(

    (bank) => bank.id === selectedBankId

  );

  const selectedAccount = accounts.find(

    (account) => account.id === selectedAccountId

  );

  const availableAccounts = accounts.filter(

    (account) => account.bankId === selectedBankId

  );

  const cashRows = useMemo(

    () =>

      DENOMINATIONS.map((denomination) => {

        const quantity = Number(

          quantities[denomination.value] || 0

        );

        return {

          ...denomination,

          quantity,

          subtotal: denomination.value * quantity,

        };

      }),

    [quantities]

  );

  const totalCash = cashRows.reduce(

    (sum, row) => sum + row.subtotal,

    0

  );

  const validChecks = checks.filter(

    (check) =>

      check.checkNumber.trim() &&

      check.checkDate &&

      check.bankName.trim() &&

      Number.isFinite(Number(check.amount)) &&

      Number(check.amount) > 0

  );

  const onUsChecks = validChecks.filter(

    (check) => check.checkType === "ON_US"

  );

  const localChecks = validChecks.filter(

    (check) => check.checkType === "LOCAL"

  );

  const totalChecks = validChecks.reduce(

    (sum, check) => sum + Number(check.amount),

    0

  );

  const totalOnUs = onUsChecks.reduce(

    (sum, check) => sum + Number(check.amount),

    0

  );

  const totalLocal = localChecks.reduce(

    (sum, check) => sum + Number(check.amount),

    0

  );

  const totalDeposit = totalCash + totalChecks;

  // Compare in centavos to avoid floating-point rounding differences.

  const expectedAmountCents = Math.round((Number(rcdAmount) || 0) * 100);

  const totalDepositCents = Math.round(totalDeposit * 100);

  // The deposit must cover the RCD amount. An excess below ₱2.00 is allowed,

  // but an excess of ₱2.00 or more is not. Compare in centavos.

  const excessCents = Math.max(0, totalDepositCents - expectedAmountCents);

  const isAmountMatched =

    expectedAmountCents > 0 &&

    totalDepositCents >= expectedAmountCents &&

    excessCents < 200;

  const remainingAmount = Math.max(

    0,

    (expectedAmountCents - totalDepositCents) / 100

  );

  const excessAmount = Math.max(

    0,

    (totalDepositCents - expectedAmountCents) / 100

  );

  useEffect(() => {

    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {

      if (event.key === "Escape") onClose();

    };

    document.addEventListener("keydown", handleEscape);

    return () => {

      document.removeEventListener("keydown", handleEscape);

    };

  }, [open, onClose]);

  // Load active banks from the database.

  useEffect(() => {

    if (!open) return;

    let cancelled = false;

    async function loadBanks() {

      setBanksLoading(true);

      try {

        const response = await fetch("/api/deposit/banks", {

          cache: "no-store",

        });

        const result = await response.json();

        if (!response.ok || !result.success) {

          throw new Error(

            result.message || "Failed to load banks."

          );

        }

        if (!cancelled) {

          setBanks(result.banks ?? []);

          setValidationMessage("");

        }

      } catch (error) {

        if (!cancelled) {

          setValidationMessage(

            error instanceof Error

              ? error.message

              : "Failed to load banks."

          );

        }

      } finally {

        if (!cancelled) setBanksLoading(false);

      }

    }

    void loadBanks();

    return () => {

      cancelled = true;

    };

  }, [open]);

  // Load accounts for the selected bank.

  useEffect(() => {

    if (!open || !selectedBankId) {

      setAccounts([]);

      setSelectedAccountId("");

      setAccountsLoading(false);

      return;

    }

    let cancelled = false;

    async function loadAccounts() {

      setAccountsLoading(true);

      setAccounts([]);

      setSelectedAccountId("");

      try {

        const params = new URLSearchParams({

          bank_id: selectedBankId,

        });

        const response = await fetch(

          `/api/deposit/bank-accounts?${params.toString()}`,

          { cache: "no-store" }

        );

        const result = await response.json();

        if (!response.ok || !result.success) {

          throw new Error(

            result.message || "Failed to load bank accounts."

          );

        }

        if (!cancelled) {

          setAccounts(result.accounts ?? []);

        }

      } catch (error) {

        if (!cancelled) {

          setValidationMessage(

            error instanceof Error

              ? error.message

              : "Failed to load bank accounts."

          );

        }

      } finally {

        if (!cancelled) setAccountsLoading(false);

      }

    }

    void loadAccounts();

    return () => {

      cancelled = true;

    };

  }, [open, selectedBankId]);

  if (!open) return null;

  const inputClass =

    "w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

  const sectionTitleClass = "text-sm font-bold text-gray-900";

  function addCheck() {

    setChecks((previous) => [

      ...previous,

      {

        id:

          typeof crypto !== "undefined" && "randomUUID" in crypto

            ? crypto.randomUUID()

            : `${Date.now()}-${Math.random()}`,

        checkNumber: "",

        checkDate: getLocalDate(),

        bankName: "",

        amount: "",

        remarks: "",

        checkType: "ON_US",

      },

    ]);

    setValidationMessage("");

  }

  function updateCheck(

    id: string,

    field: keyof Omit<DepositCheck, "id">,

    value: string

  ) {

    setChecks((previous) =>

      previous.map((check) =>

        check.id === id ? { ...check, [field]: value } : check

      )

    );

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

    if (!depositDate) {

      return fail("Please select a deposit date.");

    }

    if (!selectedBankId) {

      return fail("Please select a bank.");

    }

    if (!selectedAccountId) {

      return fail("Please select a bank account.");

    }

    return true;

  }

  function fail(message: string) {

    setValidationMessage(message);

    return false;

  }

  function hasIncompleteCheck() {

    return checks.some((check) => {

      const started = Boolean(

        check.checkNumber.trim() ||

          check.bankName.trim() ||

          check.amount.trim() ||

          check.remarks.trim()

      );

      if (!started) return false;

      return (

        !check.checkNumber.trim() ||

        !check.checkDate ||

        !check.bankName.trim() ||

        !Number.isFinite(Number(check.amount)) ||

        Number(check.amount) <= 0

      );

    });

  }

  function validateGroupedChecks() {

    if (!validateHeader()) return false;

    if (hasIncompleteCheck()) {

      return fail(

        "Complete or remove every partially entered check before printing a grouped deposit slip."

      );

    }

    return true;

  }

  function validateDeposit() {

    if (!validateHeader()) return false;

    if (!consolidatedRcdId.trim()) {

      return fail("Please select a Consolidated RCD.");

    }

    if (expectedAmountCents <= 0) {

      return fail("The Consolidated RCD amount must be greater than zero.");

    }

    if (totalCash <= 0 && totalChecks <= 0) {

      return fail(

        "Enter at least one cash denomination quantity or one valid check."

      );

    }

    if (hasIncompleteCheck()) {

      return fail(

        "Complete or remove every partially entered check before validating the deposit."

      );

    }

    if (totalDepositCents < expectedAmountCents) {

      return fail(

        `Insufficient deposit amount. You still need ${formatPeso(

          remainingAmount

        )} to match the Consolidated RCD amount of ${formatPeso(

          Number(rcdAmount) || 0

        )}.`

      );

    }

    if (excessCents >= 200) {

      return fail(

        `The deposit exceeds the Consolidated RCD amount by ${formatPeso(

          excessAmount

        )}. An excess of ₱2.00 or more is not allowed. Please adjust the cash or checks.`

      );

    }

    return true;

  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {

    event?.preventDefault();

    if (isSaving || !validateDeposit()) return;

    if (!rcdNumber.trim()) {

      await Swal.fire({

        didOpen: () => {

          const container = Swal.getContainer();

          if (container) container.style.zIndex = "100010";

        },

        icon: "warning",

        title: "RCD Required",

        text: "RCD number is missing. Select an RCD before saving the deposit.",

        confirmButtonText: "OK",

      });

      return;

    }

    const confirmation = await Swal.fire({

      didOpen: () => {

        const container = Swal.getContainer();

        if (container) container.style.zIndex = "100010";

      },

      icon: "question",

      title: "Validate Deposit?",

      text:

        `Are you sure you want to save this deposit for RCD ${rcdNumber.trim()}? ` +

        `The total deposit amount is ${formatPeso(totalDeposit)}.`,

      showCancelButton: true,

      confirmButtonText: "Yes, Save Deposit",

      cancelButtonText: "Review Details",

      reverseButtons: true,

      focusCancel: true,

      confirmButtonColor: "#2563eb",

      cancelButtonColor: "#6b7280",

    });

    if (!confirmation.isConfirmed) return;

    setIsSaving(true);

    setValidationMessage("");

    try {

      const payload = {

        consolidated_rcd_id: consolidatedRcdId.trim(),

        rcd_number: rcdNumber.trim(),

        deposit_date: depositDate,

        bank_id: selectedBankId,

        bank_account_id: selectedAccountId,

        fund_source_id: fundSourceId.trim() || null,

        reference_number: referenceNumber.trim() || null,

        total_cash: Number(totalCash.toFixed(2)),

        // Persist the denomination breakdown so the cash slip can be reprinted later.
        cash_denominations: cashRows
          .filter((row) => row.quantity > 0)
          .map((row) => ({
            denomination: row.value,
            quantity: row.quantity,
          })),

        total_amount: Number(totalDeposit.toFixed(2)),

        checks: validChecks.map((check) => ({

          checkType: check.checkType,

          checkNumber: check.checkNumber.trim(),

          checkDate: check.checkDate,

          bankName: check.bankName.trim(),

          amount: Number(Number(check.amount).toFixed(2)),

          remarks: check.remarks.trim() || null,

        })),

        remarks: remarks.trim() || null,

      };

      const response = await fetch("/api/deposit/transactions", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),

      });

      const result = await response.json();

      if (!response.ok || !result.success) {

        console.error("Save deposit API response:", {

          status: response.status,

          result,

        });

        throw new Error(

          result.error || result.message || "Failed to save deposit transaction."

        );

      }

      const saved = result.data ?? result.transaction;

      await Swal.fire({

        didOpen: () => {

          const container = Swal.getContainer();

          if (container) container.style.zIndex = "100010";

        },

        icon: "success",

        title: "Deposit Saved Successfully!",

        html: `

          <div style="text-align:left; line-height:1.8">

            <div><strong>RCD No.:</strong> ${escapeHtml(saved.rcd_number)}</div>

            <div><strong>Deposit Date:</strong> ${escapeHtml(formatDate(saved.deposit_date || depositDate))}</div>

            <div><strong>Cash:</strong> ${escapeHtml(formatPeso(totalCash))}</div>

            <div><strong>On Us Checks:</strong> ${escapeHtml(formatPeso(totalOnUs))}</div>

            <div><strong>Local Checks:</strong> ${escapeHtml(formatPeso(totalLocal))}</div>

            <div><strong>Total Deposit:</strong> <strong>${escapeHtml(formatPeso(Number(saved.total_amount)))}</strong></div>

            <div><strong>Items Saved:</strong> ${escapeHtml(saved.item_count)}</div>

          </div>

        `,

        confirmButtonText: "OK",

        confirmButtonColor: "#2563eb",

      });

      resetForm();

    } catch (error) {

      console.error("Save deposit error:", error);

      const message =

        error instanceof Error

          ? error.message

          : "An unexpected error occurred while saving the deposit.";

      setValidationMessage(message);

      await Swal.fire({

        didOpen: () => {

          const container = Swal.getContainer();

          if (container) container.style.zIndex = "100010";

        },

        icon: "error",

        title: "Unable to Save Deposit",

        text: message,

        confirmButtonText: "OK",

        confirmButtonColor: "#2563eb",

      });

    } finally {

      setIsSaving(false);

    }

  }

  function openPrintDocument(title: string, content: string) {

    const printWindow = window.open("", "_blank");

    if (!printWindow) {

      setValidationMessage(

        "The print window was blocked. Allow pop-ups for this site and try again."

      );

      return;

    }

    printWindow.document.open();

    printWindow.document.write(`<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(title)}</title>

<style>

*{box-sizing:border-box}

body{margin:0;padding:24px;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:12px}

.document{width:100%;max-width:1100px;margin:0 auto}

.heading{padding-bottom:16px;margin-bottom:18px;border-bottom:2px solid #1e3a8a;text-align:center}

.heading h1{margin:0 0 6px;font-size:19px}

.heading p{margin:0;color:#4b5563;font-size:11px}

.details{display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin-bottom:20px}

.details div{display:flex;flex-direction:column;gap:3px}

.details span{color:#6b7280;font-size:10px}

.details strong{font-size:12px;overflow-wrap:anywhere}

table{width:100%;border-collapse:collapse;margin:12px 0 18px}

th,td{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}

th{background:#f3f4f6}

.number{text-align:right;white-space:nowrap}

tfoot td{background:#eff6ff;font-weight:700}

.total-card{display:flex;justify-content:space-between;gap:16px;padding:14px;border:1px solid #bfdbfe;background:#eff6ff;font-size:14px}

.total-card strong{color:#1d4ed8;white-space:nowrap}

.remarks{margin-top:18px;overflow-wrap:anywhere}

.signatures{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:65px}

.signature{border-top:1px solid #111827;padding-top:7px;text-align:center}

@page{size:landscape;margin:12mm}

@media print{body{padding:0}.document{max-width:none}thead{display:table-header-group}tr{break-inside:avoid}}

</style>

</head>

<body>

<main class="document">

<header class="heading">

<h1>${escapeHtml(title)}</h1>

<p>Municipal Treasury — Deposit Record</p>

</header>

<section class="details">

<div><span>Consolidated RCD No.</span><strong>${escapeHtml(

      rcdNumber || "—"

    )}</strong></div>

<div><span>Consolidated RCD Amount</span><strong>${escapeHtml(

      formatPeso(Number(rcdAmount) || 0)

    )}</strong></div>

<div><span>Deposit Date</span><strong>${escapeHtml(

      formatDate(depositDate)

    )}</strong></div>

<div><span>Deposit Reference Number</span><strong>${escapeHtml(

      referenceNumber.trim() || "—"

    )}</strong></div>

<div><span>Depositing Bank</span><strong>${escapeHtml(

      selectedBank?.name || "—"

    )}</strong></div>

<div><span>Bank Account</span><strong>${escapeHtml(

      selectedAccount?.accountName || "—"

    )}</strong></div>

<div><span>Account Number</span><strong>${escapeHtml(

      selectedAccount?.accountNumber || "—"

    )}</strong></div>

</section>

${content}

<div class="remarks"><strong>General Remarks:</strong> ${escapeHtml(

      remarks.trim() || "—"

    )}</div>

<div class="signatures">

<div class="signature">Prepared By</div>

<div class="signature">Checked By</div>

</div>

</main>

<script>

window.addEventListener('load',function(){window.focus();window.print();});

</script>

</body>

</html>`);

    printWindow.document.close();

  }

  function printCashSlip() {

    if (!validateHeader()) return;

    if (totalCash <= 0) {

      return fail(

        "Enter at least one cash denomination quantity before printing the cash slip."

      );

    }

    const rows = cashRows

      .filter((row) => row.quantity > 0)

      .map(

        (row) =>

          `<tr><td>${escapeHtml(row.label)}</td><td>${

            row.value < 20 ? "Coin" : "Bill"

          }</td><td class="number">${row.quantity.toLocaleString(

            "en-PH"

          )}</td><td class="number">${escapeHtml(

            formatPeso(row.subtotal)

          )}</td></tr>`

      )

      .join("");

    openPrintDocument(

      "CASH DEPOSIT SLIP",

      `<table>

<thead><tr><th>Denomination</th><th>Type</th><th class="number">Quantity</th><th class="number">Subtotal</th></tr></thead>

<tbody>${rows}</tbody>

<tfoot><tr><td colspan="3">Total Cash</td><td class="number">${escapeHtml(

        formatPeso(totalCash)

      )}</td></tr></tfoot>

</table>

<div class="total-card"><span>Total Cash Deposit</span><strong>${escapeHtml(

        formatPeso(totalCash)

      )}</strong></div>`

    );

  }

  function printCheckSlip(checkType: CheckType) {

    if (!validateGroupedChecks()) return;

    const checksToPrint =

      checkType === "ON_US" ? onUsChecks : localChecks;

    if (!checksToPrint.length) {

      return fail(

        `There are no ${

          checkType === "ON_US" ? "On Us" : "Local"

        } checks to print.`

      );

    }

    const total = checksToPrint.reduce(

      (sum, check) => sum + Number(check.amount),

      0

    );

    const typeLabel = checkType === "ON_US" ? "On Us" : "Local";

    const rows = checksToPrint

      .map(

        (check, index) =>

          `<tr><td>${index + 1}</td><td>${escapeHtml(

            check.checkNumber

          )}</td><td>${escapeHtml(

            formatDate(check.checkDate)

          )}</td><td>${escapeHtml(

            check.bankName

          )}</td><td class="number">${escapeHtml(

            formatPeso(Number(check.amount))

          )}</td><td>${escapeHtml(

            check.remarks.trim() || "—"

          )}</td></tr>`

      )

      .join("");

    openPrintDocument(

      `${typeLabel.toUpperCase()} CHECK DEPOSIT SLIP`,

      `<table>

<thead><tr><th>#</th><th>Check Number</th><th>Check Date</th><th>Issuing Bank</th><th class="number">Amount</th><th>Remarks</th></tr></thead>

<tbody>${rows}</tbody>

<tfoot><tr><td colspan="4">Total ${typeLabel} Checks (${

        checksToPrint.length

      })</td><td class="number">${escapeHtml(

        formatPeso(total)

      )}</td><td></td></tr></tfoot>

</table>

<div class="total-card"><span>Total ${typeLabel} Checks</span><strong>${escapeHtml(

        formatPeso(total)

      )}</strong></div>`

    );

  }

  return (

    <div

      className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/60 p-2 sm:p-3"

      onMouseDown={(event) => {

        if (event.target === event.currentTarget) onClose();

      }}

    >

      <div className="flex h-[calc(100dvh-16px)] max-h-[900px] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-2">

          <div className="flex min-w-0 items-center gap-3">

            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">

              <Landmark size={20} />

            </div>

            <div className="min-w-0">

              <h2 className="text-base font-bold text-gray-900">

                Cash and Check Deposit

              </h2>

              <p className="hidden text-xs text-gray-500 sm:block">

                One deposit entry with separate cash, On Us, and Local slips.

              </p>

            </div>

          </div>

          <div className="ml-auto flex min-w-0 items-center justify-end gap-3">

            <div className="min-w-0 text-right">

              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">

                Consolidated RCD No.

              </p>

              <p

                className="max-w-[130px] truncate text-xs font-bold text-blue-800 sm:max-w-[200px]"

                title={rcdNumber || "No RCD selected"}

              >

                {rcdNumber || "No RCD selected"}

              </p>

            </div>

            <div className="shrink-0 border-l border-gray-200 pl-3 text-right">

              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">

                RCD Amount

              </p>

              <p className="whitespace-nowrap text-sm font-bold tabular-nums text-gray-900">

                {formatPeso(Number(rcdAmount) || 0)}

              </p>

            </div>

            <button

              type="button"

              onClick={onClose}

              aria-label="Close deposit modal"

              className="shrink-0 rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"

            >

              <X size={20} />

            </button>

          </div>

        </div>

        <form

          onSubmit={(event) => void handleSubmit(event)}

          className="flex min-h-0 flex-1 flex-col"

        >

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-3 sm:p-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,0.75fr)_minmax(0,1.2fr)] lg:gap-4 lg:overflow-hidden">

            {/* LEFT COLUMN */}

            <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1">

              {/* Deposit Information */}

              <section className="space-y-2 rounded-lg border border-gray-200 p-3">

                <h3 className={sectionTitleClass}>

                  1. Deposit Information

                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">

                  <div>

                    <label className="mb-1 block text-xs font-medium text-gray-700">

                      Deposit Date *

                    </label>

                    <div className="relative">

                      <CalendarDays

                        size={16}

                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"

                      />

                      <input

                        type="date"

                        required

                        value={depositDate}

                        onChange={(e) => setDepositDate(e.target.value)}

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

                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"

                      />

                      <input

                        value={referenceNumber}

                        onChange={(e) =>

                          setReferenceNumber(e.target.value)

                        }

                        placeholder="Enter reference number"

                        className={`${inputClass} pl-9`}

                      />

                    </div>

                  </div>

                </div>

              </section>

              {/* Bank Selection */}

              <section className="space-y-2 rounded-lg border border-gray-200 p-3">

                <h3 className={sectionTitleClass}>2. Select Bank *</h3>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  {banksLoading ? (

                    <p className="col-span-full py-3 text-sm text-gray-500">

                      Loading banks...

                    </p>

                  ) : banks.length === 0 ? (

                    <p className="col-span-full py-3 text-sm text-gray-500">

                      No active banks found.

                    </p>

                  ) : (

                    banks.map((bank) => {

                      const selected = selectedBankId === bank.id;

                      return (

                        <button

                          key={bank.id}

                          type="button"

                          onClick={() => setSelectedBankId(bank.id)}

                          aria-pressed={selected}

                          className={`flex min-w-0 items-center gap-2 rounded-lg border-2 p-2 text-left transition ${

                            selected

                              ? "border-blue-600 bg-blue-50"

                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"

                          }`}

                        >

                          <div

                            className={`shrink-0 rounded-lg p-2 ${

                              selected

                                ? "bg-blue-600 text-white"

                                : "bg-gray-100 text-gray-600"

                            }`}

                          >

                            <Landmark size={18} />

                          </div>

                          <span className="min-w-0 flex-1 text-xs font-semibold text-gray-900 sm:text-sm">

                            {bank.name}

                          </span>

                          {selected && (

                            <CheckCircle2

                              size={17}

                              className="shrink-0 text-blue-600"

                            />

                          )}

                        </button>

                      );

                    })

                  )}

                </div>

              </section>

              {/* Bank Account Dropdown */}

              <section className="min-w-0 space-y-2 rounded-lg border border-gray-200 bg-white p-3">

                <h3 className={sectionTitleClass}>

                  3. Select Bank Account *

                </h3>

                {!selectedBankId ? (

                  <p className="text-sm text-gray-500">

                    Select a bank first.

                  </p>

                ) : accountsLoading ? (

                  <div className="flex items-center gap-2 py-2 text-sm text-gray-500">

                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

                    Loading bank accounts...

                  </div>

                ) : availableAccounts.length === 0 ? (

                  <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">

                    No active accounts are available for this bank.

                  </p>

                ) : (

                  <>

                    <label

                      htmlFor="deposit-bank-account"

                      className="block text-xs font-medium text-gray-700"

                    >

                      Choose Account

                    </label>

                    <div className="relative">

                      <CreditCard

                        size={18}

                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"

                      />

                      <select

                        id="deposit-bank-account"

                        value={selectedAccountId}

                        onChange={(e) =>

                          setSelectedAccountId(e.target.value)

                        }

                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"

                      >

                        <option value="" disabled>

                          Select a bank account...

                        </option>

                        {availableAccounts.map((account) => (

                          <option key={account.id} value={account.id}>

                            {account.accountName} — {account.accountNumber}

                            {account.accountCode

                              ? ` (${account.accountCode})`

                              : ""}

                          </option>

                        ))}

                      </select>

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">

                        <svg

                          xmlns="http\\://www.w3.org/2000/svg"

                          width="16"

                          height="16"

                          viewBox="0 0 24 24"

                          fill="none"

                          stroke="currentColor"

                          strokeWidth="2"

                          strokeLinecap="round"

                          strokeLinejoin="round"

                        >

                          <path d="m6 9 6 6 6-6" />

                        </svg>

                      </span>

                    </div>

                    {selectedAccount && (

                      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">

                          <CreditCard size={18} />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="break-words text-sm font-semibold text-gray-900">

                              {selectedAccount.accountName}

                            </p>

                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                              {selectedAccount.accountStatus || "ACTIVE"}

                            </span>

                          </div>

                          <p className="mt-1 text-xs text-gray-600">

                            Account Number:{" "}

                            <span className="font-mono font-medium text-gray-800">

                              {selectedAccount.accountNumber || "—"}

                            </span>

                          </p>

                          {selectedAccount.accountCode && (

                            <p className="mt-1 text-xs text-gray-600">

                              Account Code:{" "}

                              <span className="font-medium text-gray-800">

                                {selectedAccount.accountCode}

                              </span>

                            </p>

                          )}

                          {selectedAccount.depositLabel && (

                            <p className="mt-1 text-xs text-gray-500">

                              {selectedAccount.depositLabel}

                            </p>

                          )}

                        </div>

                        <CheckCircle2

                          size={19}

                          className="mt-0.5 shrink-0 text-blue-600"

                        />

                      </div>

                    )}

                  </>

                )}

              </section>

              {/* Deposit Remarks */}

              <section className="space-y-1 rounded-lg border border-gray-200 p-3">

                <label className="block text-xs font-semibold text-gray-700">

                  Deposit Remarks

                </label>

                <textarea

                  rows={2}

                  value={remarks}

                  onChange={(e) => setRemarks(e.target.value)}

                  placeholder="Additional deposit information..."

                  className={`${inputClass} resize-y`}

                />

              </section>

              {/* Print Deposit Slips */}

              <section className="shrink-0 space-y-3 rounded-lg border border-gray-200 p-3">

                <h3 className={sectionTitleClass}>

                  6. Print Deposit Slips

                </h3>

                <p className="text-xs text-gray-500">

                  Print each slip separately. Checks are grouped by type.

                </p>

                <button

                  type="button"

                  onClick={printCashSlip}

                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"

                >

                  <Banknote size={16} />

                  Print Cash Deposit Slip

                  <span className="ml-auto">{formatPeso(totalCash)}</span>

                </button>

                <button

                  type="button"

                  onClick={() => printCheckSlip("ON_US")}

                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"

                >

                  <Printer size={16} />

                  Print On Us Checks

                  <span className="ml-auto">

                    {onUsChecks.length} · {formatPeso(totalOnUs)}

                  </span>

                </button>

                <button

                  type="button"

                  onClick={() => printCheckSlip("LOCAL")}

                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100"

                >

                  <Printer size={16} />

                  Print Local Checks

                  <span className="ml-auto">

                    {localChecks.length} · {formatPeso(totalLocal)}

                  </span>

                </button>

              </section>

            </div>

            {/* MIDDLE COLUMN: CASH DENOMINATIONS */}

            <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1">

              {/* Cash Denomination Breakdown */}

              <section className="min-w-0 rounded-lg border border-gray-200 p-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">

                <div className="mb-2 shrink-0">

                  <h3 className={sectionTitleClass}>

                    4. Cash Denomination Breakdown

                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">

                    Enter the quantity of each bill or coin.

                  </p>

                </div>

                <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 lg:min-h-0 lg:flex-1">

                  <div className="h-full overflow-y-auto">

                    <table className="w-full table-fixed text-sm">

                      <thead className="sticky top-0 z-10 bg-gray-50 text-xs text-gray-600">

                        <tr>

                          <th className="w-[35%] px-2 py-2 text-left font-semibold sm:px-3">

                            Denomination

                          </th>

                          <th className="w-[25%] px-2 py-2 text-right font-semibold sm:px-3">

                            Quantity

                          </th>

                          <th className="w-[40%] px-2 py-2 text-right font-semibold sm:px-3">

                            Subtotal

                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-100">

                        {DENOMINATIONS.map((denomination) => {

                          const quantity = Number(

                            quantities[denomination.value] ?? 0

                          );

                          const subtotal =

                            denomination.value * quantity;

                          const isCoin = denomination.value < 20;

                          return (

                            <tr

                              key={denomination.value}

                              className="hover:bg-gray-50"

                            >

                              <td className="px-2 py-1.5 sm:px-3">

                                <span

                                  className={`inline-flex items-center justify-center rounded-md px-1.5 py-1 text-[11px] font-bold sm:px-2 sm:text-xs ${

                                    isCoin

                                      ? "bg-amber-50 text-amber-800"

                                      : "bg-blue-50 text-blue-800"

                                  }`}

                                >

                                  {denomination.label}

                                </span>

                              </td>

                              <td className="px-2 py-1 sm:px-3">

                                <input

                                  type="number"

                                  min="0"

                                  step="1"

                                  inputMode="numeric"

                                  value={

                                    quantities[denomination.value] ?? ""

                                  }

                                  onChange={(e) => {

                                    const value = e.target.value;

                                    if (

                                      value === "" ||

                                      (/^\d+$/.test(value) &&

                                        Number.isSafeInteger(Number(value)))

                                    ) {

                                      setQuantities((previous) => ({

                                        ...previous,

                                        [denomination.value]: value,

                                      }));

                                    }

                                  }}

                                  placeholder="0"

                                  aria-label={`Quantity of ${denomination.label}`}

                                  className="w-full min-w-0 rounded-md border border-gray-300 px-2 py-1.5 text-right text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"

                                />

                              </td>

                              <td className="whitespace-nowrap px-2 py-1.5 text-right text-xs font-medium text-gray-900 sm:px-3 sm:text-sm">

                                {formatPeso(subtotal)}

                              </td>

                            </tr>

                          );

                        })}

                      </tbody>

                      <tfoot className="sticky bottom-0 bg-blue-50">

                        <tr>

                          <td

                            colSpan={2}

                            className="px-2 py-2 text-xs font-bold text-gray-900 sm:px-3 sm:text-sm"

                          >

                            Total Cash

                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right text-sm font-bold text-blue-700 sm:px-3 sm:text-base">

                            {formatPeso(totalCash)}

                          </td>

                        </tr>

                      </tfoot>

                    </table>

                  </div>

                </div>

              </section>

            </div>

            {/* RIGHT COLUMN: CHECKS AND DEPOSIT TOTALS */}

            <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1">

              {/* Check Payments */}

              <section className="space-y-3 rounded-lg border border-gray-200 p-3">

                <div className="flex items-center justify-between gap-2">

                  <div>

                    <h3 className={sectionTitleClass}>5. Check Payments</h3>

                    <p className="mt-0.5 text-xs text-gray-500">

                      Checks are grouped by type when printing.

                    </p>

                  </div>

                  <button

                    type="button"

                    onClick={addCheck}

                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"

                  >

                    <Plus size={15} />

                    Add Check

                  </button>

                </div>

                {checks.length === 0 ? (

                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center">

                    <ReceiptText

                      size={22}

                      className="mx-auto mb-1 text-gray-400"

                    />

                    <p className="text-sm font-medium text-gray-700">

                      No checks added

                    </p>

                    <p className="text-xs text-gray-500">

                      Cash-only deposits are supported.

                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {checks.map((check, index) => (

                      <div

                        key={check.id}

                        className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3"

                      >

                        <div className="flex items-center justify-between gap-2">

                          <p className="text-xs font-bold text-gray-800">

                            Check #{index + 1}

                          </p>

                          <button

                            type="button"

                            onClick={() =>

                              setChecks((previous) =>

                                previous.filter(

                                  (item) => item.id !== check.id

                                )

                              )

                            }

                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"

                          >

                            <Trash2 size={14} />

                            Remove

                          </button>

                        </div>

                        <div>

                          <label className="mb-1 block text-xs font-medium text-gray-700">

                            Check Type *

                          </label>

                          <select

                            value={check.checkType}

                            onChange={(e) =>

                              updateCheck(

                                check.id,

                                "checkType",

                                e.target.value

                              )

                            }

                            className={inputClass}

                          >

                            <option value="ON_US">On Us Check</option>

                            <option value="LOCAL">Local Check</option>

                          </select>

                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                          <div>

                            <label className="mb-1 block text-xs font-medium text-gray-700">

                              Check Number *

                            </label>

                            <input

                              value={check.checkNumber}

                              onChange={(e) =>

                                updateCheck(

                                  check.id,

                                  "checkNumber",

                                  e.target.value

                                )

                              }

                              placeholder="Enter check number"

                              className={inputClass}

                            />

                          </div>

                          <div>

                            <label className="mb-1 block text-xs font-medium text-gray-700">

                              Check Date *

                            </label>

                            <input

                              type="date"

                              value={check.checkDate}

                              onChange={(e) =>

                                updateCheck(

                                  check.id,

                                  "checkDate",

                                  e.target.value

                                )

                              }

                              className={inputClass}

                            />

                          </div>

                          <div>

                            <label className="mb-1 block text-xs font-medium text-gray-700">

                              Issuing Bank *

                            </label>

                            <input

                              value={check.bankName}

                              onChange={(e) =>

                                updateCheck(

                                  check.id,

                                  "bankName",

                                  e.target.value

                                )

                              }

                              placeholder="Bank printed on check"

                              className={inputClass}

                            />

                          </div>

                          <div>

                            <label className="mb-1 block text-xs font-medium text-gray-700">

                              Check Amount (₱) *

                            </label>

                            <input

                              type="number"

                              min="0.01"

                              step="0.01"

                              inputMode="decimal"

                              value={check.amount}

                              onChange={(e) => {

                                const value = e.target.value;

                                if (

                                  value === "" ||

                                  /^\d*\.?\d{0,2}$/.test(value)

                                ) {

                                  updateCheck(

                                    check.id,

                                    "amount",

                                    value

                                  );

                                }

                              }}

                              placeholder="0.00"

                              className={`${inputClass} text-right tabular-nums`}

                            />

                          </div>

                        </div>

                        <div>

                          <label className="mb-1 block text-xs font-medium text-gray-700">

                            Check Remarks

                          </label>

                          <input

                            value={check.remarks}

                            onChange={(e) =>

                              updateCheck(

                                check.id,

                                "remarks",

                                e.target.value

                              )

                            }

                            placeholder="Optional remarks"

                            className={inputClass}

                          />

                        </div>

                        <div className="border-t border-gray-200 pt-3">

                          <span

                            className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${

                              check.checkType === "ON_US"

                                ? "bg-blue-100 text-blue-800"

                                : "bg-orange-100 text-orange-800"

                            }`}

                          >

                            {check.checkType === "ON_US"

                              ? "On Us Check"

                              : "Local Check"}

                          </span>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

                {checks.length > 0 && (

                  <div className="flex items-center justify-between gap-3 rounded-md bg-orange-50 px-3 py-2">

                    <span className="text-xs font-semibold text-gray-700">

                      Valid checks: {validChecks.length} / {checks.length}

                    </span>

                    <span className="whitespace-nowrap text-sm font-bold text-orange-800">

                      {formatPeso(totalChecks)}

                    </span>

                  </div>

                )}

              </section>

              {/* Deposit Totals */}

              <div className="shrink-0 space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3 sm:p-4">

                <div className="flex items-center justify-between gap-3">

                  <span className="text-sm font-medium text-gray-700">

                    Cash Total

                  </span>

                  <span className="font-semibold tabular-nums text-gray-900">

                    {formatPeso(totalCash)}

                  </span>

                </div>

                <div className="flex items-center justify-between gap-3">

                  <span className="text-sm font-medium text-gray-700">

                    On Us Checks

                  </span>

                  <span className="font-semibold tabular-nums text-gray-900">

                    {formatPeso(totalOnUs)}

                  </span>

                </div>

                <div className="flex items-center justify-between gap-3">

                  <span className="text-sm font-medium text-gray-700">

                    Local Checks

                  </span>

                  <span className="font-semibold tabular-nums text-gray-900">

                    {formatPeso(totalLocal)}

                  </span>

                </div>

                <div className="flex items-center justify-between gap-3 border-t border-blue-200 pt-2">

                  <span className="text-sm font-bold text-gray-900">

                    New Deposit Total

                  </span>

                  <span className="whitespace-nowrap text-lg font-bold tabular-nums text-blue-700">

                    {formatPeso(totalDeposit)}

                  </span>

                </div>

                <div

                  className={`mt-2 rounded-md px-3 py-2 text-xs font-semibold ${

                    isAmountMatched

                      ? "bg-green-50 text-green-700"

                      : totalDepositCents < expectedAmountCents

                        ? "bg-amber-50 text-amber-700"

                        : "bg-red-50 text-red-700"

                  }`}

                >

                  {isAmountMatched

                    ? excessCents > 0

                      ? `✓ Deposit is sufficient. Excess of ${formatPeso(excessAmount)} is allowed (below ₱2.00).`

                      : "✓ Deposit amount matches the Consolidated RCD."

                    : expectedAmountCents <= 0

                      ? "A valid Consolidated RCD amount is required."

                      : totalDepositCents < expectedAmountCents

                        ? `Remaining amount needed: ${formatPeso(remainingAmount)}`

                        : `Excess amount: ${formatPeso(excessAmount)}. Excess must be less than ₱2.00.`}

                </div>

              </div>

            </div>

          </div>

          {/* Validation Message */}

          {validationMessage && (

            <div

              role="alert"

              className="mx-3 mb-2 shrink-0 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sm:mx-4"

            >

              {validationMessage}

            </div>

          )}

          {/* Footer */}

          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2 sm:px-4">

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

                type="button"

                onClick={() => void handleSubmit()}

                disabled={isSaving}

                title="Validate the deposit amount and save if valid"

                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-blue-600 sm:px-4"

              >

                <Save size={15} />

                {isSaving ? "Saving Deposit..." : "Validate Deposit"}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>

  );

}
