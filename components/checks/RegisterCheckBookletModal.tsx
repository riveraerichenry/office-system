"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  BookOpen,
  Save,
  LoaderCircle,
  AlertCircle,
  Building2,
  CreditCard,
  Wallet,
  RefreshCw,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Bank {
  id: string | number;
  bankName: string;
  details?: Record<string, unknown> | null;
}

interface BankAccount {
  id: string | number;
  bankId: string | number;
  accountNumber: string;
  details?: Record<string, unknown> | null;
}

interface FundSource {
  id: string | number;
  fundName: string;
  details?: Record<string, unknown> | null;
}

interface FormData {
  fundSourceId: string;
  bankId: string;
  bankAccountId: string;
  beginningCheckNo: string;
  endingCheckNo: string;
  dateReceived: string;
  remarks: string;
}

const INITIAL_FORM: FormData = {
  fundSourceId: "",
  bankId: "",
  bankAccountId: "",
  beginningCheckNo: "",
  endingCheckNo: "",
  dateReceived: "",
  remarks: "",
};

function getLocalDate(): string {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function getAccountName(account: BankAccount): string {
  const details = account.details ?? {};

  const candidates = [
    details.account_name,
    details.account_holder_name,
    details.account_holder,
    details.account_type,
    details.accountName,
  ];

  const value = candidates.find(
    (item) => item !== undefined && item !== null && String(item).trim()
  );

  return value ? String(value) : "";
}

function getFundSourceCode(fundSource: FundSource): string {
  const details = fundSource.details ?? {};

  const candidates = [
    details.fund_code,
    details.fund_source_code,
    details.code,
  ];

  const value = candidates.find(
    (item) => item !== undefined && item !== null && String(item).trim()
  );

  return value ? String(value) : "";
}

export default function RegisterCheckBookletModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedBank = useMemo(
    () =>
      banks.find((bank) => String(bank.id) === form.bankId) ?? null,
    [banks, form.bankId]
  );

  const filteredAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => String(account.bankId) === form.bankId
      ),
    [accounts, form.bankId]
  );

  const selectedAccount = useMemo(
    () =>
      filteredAccounts.find(
        (account) => String(account.id) === form.bankAccountId
      ) ?? null,
    [filteredAccounts, form.bankAccountId]
  );

  useEffect(() => {
    if (!open) return;

    setForm({
      ...INITIAL_FORM,
      dateReceived: getLocalDate(),
    });

    setError("");
    setLoadingOptions(true);

    let cancelled = false;

    async function loadOptions() {
      try {
        const response = await fetch(
          "/api/checks/booklets/options",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Failed to load dropdown options."
          );
        }

        if (
          !Array.isArray(result?.banks) ||
          !Array.isArray(result?.accounts) ||
          !Array.isArray(result?.fundSources)
        ) {
          throw new Error(
            "The options API must return banks, accounts, and fundSources arrays."
          );
        }

        if (cancelled) return;

        setBanks(
          result.banks.map((item: Record<string, unknown>) => ({
            id: item.id as string | number,
            bankName: String(
              item.bankName ?? item.bank_name ?? ""
            ),
            details:
              item.details &&
              typeof item.details === "object"
                ? (item.details as Record<string, unknown>)
                : null,
          }))
        );

        setAccounts(
          result.accounts.map((item: Record<string, unknown>) => ({
            id: item.id as string | number,
            bankId: (
              item.bankId ??
              item.bank_id ??
              ""
            ) as string | number,
            accountNumber: String(
              item.accountNumber ?? item.account_number ?? ""
            ),
            details:
              item.details &&
              typeof item.details === "object"
                ? (item.details as Record<string, unknown>)
                : null,
          }))
        );

        setFundSources(
          result.fundSources.map(
            (item: Record<string, unknown>) => ({
              id: item.id as string | number,
              fundName: String(
                item.fundName ?? item.fund_name ?? ""
              ),
              details:
                item.details &&
                typeof item.details === "object"
                  ? (item.details as Record<string, unknown>)
                  : null,
            })
          )
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dropdown options."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  function updateField(field: keyof FormData, value: string) {
    setForm((previous) => {
      if (field === "bankId") {
        return {
          ...previous,
          bankId: value,
          bankAccountId: "",
        };
      }

      return {
        ...previous,
        [field]: value,
      };
    });

    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const beginning = form.beginningCheckNo.trim();
    const ending = form.endingCheckNo.trim();

    if (
      !form.fundSourceId ||
      !form.bankId ||
      !form.bankAccountId ||
      !beginning ||
      !ending ||
      !form.dateReceived
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^\d+$/.test(beginning) || !/^\d+$/.test(ending)) {
      setError("Check numbers must contain digits only.");
      return;
    }

    if (beginning.length !== ending.length) {
      setError(
        "Beginning and ending check numbers must have the same number of digits."
      );
      return;
    }

    // FIX: use BigInt() instead of BigInt literals such as 1n.
    if (BigInt(ending) < BigInt(beginning)) {
      setError(
        "Ending check number must not be less than the beginning check number."
      );
      return;
    }

    const count =
      BigInt(ending) - BigInt(beginning) + BigInt(1);

    // FIX: use BigInt(500) instead of 500n.
    if (count > BigInt(500)) {
      setError("A booklet cannot contain more than 500 checks.");
      return;
    }

    const validAccount = accounts.some(
      (account) =>
        String(account.id) === form.bankAccountId &&
        String(account.bankId) === form.bankId
    );

    if (!validAccount) {
      setError(
        "Please select a valid bank account for the selected bank."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/checks/booklets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          registeredAt: form.dateReceived,
          fundSourceId: form.fundSourceId,
          bankId: form.bankId,
          bankAccountId: form.bankAccountId,
          beginningCheckNo: beginning,
          endingCheckNo: ending,
          remarks: form.remarks.trim() || null,
          status: "Active",
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Unable to register the check booklet."
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

  const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700";

  const optionsUnavailable =
    loadingOptions ||
    banks.length === 0 ||
    fundSources.length === 0;

  const beginningValue = form.beginningCheckNo.trim();
  const endingValue = form.endingCheckNo.trim();

  const validPreviewRange =
    /^\d+$/.test(beginningValue) &&
    /^\d+$/.test(endingValue) &&
    beginningValue.length === endingValue.length &&
    BigInt(endingValue || "0") >= BigInt(beginningValue || "0");

  const previewTotalChecks = validPreviewRange
    ? (
        BigInt(endingValue) -
        BigInt(beginningValue) +
        BigInt(1)
      ).toString()
    : "0";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-booklet-title"
        className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <BookOpen size={23} />
            </div>

            <div>
              <h2
                id="register-booklet-title"
                className="text-xl font-bold text-slate-900"
              >
                Register Check Booklet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an existing fund source, bank, and bank account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close registration modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {loadingOptions && (
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Loading banks, accounts, and fund sources...
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="fundSourceId"
                  className={labelClass}
                >
                  Fund Source <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Wallet
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    id="fundSourceId"
                    value={form.fundSourceId}
                    onChange={(event) =>
                      updateField("fundSourceId", event.target.value)
                    }
                    required
                    disabled={
                      saving ||
                      loadingOptions ||
                      fundSources.length === 0
                    }
                    className={`${inputClass} pl-9`}
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading fund sources..."
                        : fundSources.length === 0
                          ? "No fund sources available"
                          : "Select fund source"}
                    </option>

                    {fundSources.map((fundSource) => {
                      const code = getFundSourceCode(fundSource);

                      return (
                        <option
                          key={String(fundSource.id)}
                          value={String(fundSource.id)}
                        >
                          {fundSource.fundName}
                          {code ? ` (${code})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bankId" className={labelClass}>
                  Bank <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Building2
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    id="bankId"
                    value={form.bankId}
                    onChange={(event) =>
                      updateField("bankId", event.target.value)
                    }
                    required
                    disabled={
                      saving ||
                      loadingOptions ||
                      banks.length === 0
                    }
                    className={`${inputClass} pl-9`}
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading banks..."
                        : banks.length === 0
                          ? "No banks available"
                          : "Select bank"}
                    </option>

                    {banks.map((bank) => (
                      <option
                        key={String(bank.id)}
                        value={String(bank.id)}
                      >
                        {bank.bankName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="bankAccountId"
                  className={labelClass}
                >
                  Bank Account <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <CreditCard
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    id="bankAccountId"
                    value={form.bankAccountId}
                    onChange={(event) =>
                      updateField("bankAccountId", event.target.value)
                    }
                    required
                    disabled={
                      saving ||
                      loadingOptions ||
                      !form.bankId ||
                      filteredAccounts.length === 0
                    }
                    className={`${inputClass} pl-9`}
                  >
                    <option value="">
                      {!form.bankId
                        ? "Select a bank first"
                        : loadingOptions
                          ? "Loading accounts..."
                          : filteredAccounts.length === 0
                            ? "No accounts for this bank"
                            : "Select bank account"}
                    </option>

                    {filteredAccounts.map((account) => {
                      const accountName = getAccountName(account);

                      return (
                        <option
                          key={String(account.id)}
                          value={String(account.id)}
                        >
                          {account.accountNumber}
                          {accountName ? ` — ${accountName}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {selectedBank && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Selected Bank
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedBank.bankName}
                  </p>

                  {selectedAccount && (
                    <>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Selected Account
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedAccount.accountNumber}
                      </p>

                      {getAccountName(selectedAccount) && (
                        <p className="mt-1 text-sm text-slate-600">
                          {getAccountName(selectedAccount)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="beginningCheckNo"
                  className={labelClass}
                >
                  Beginning Check No.{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="beginningCheckNo"
                  value={form.beginningCheckNo}
                  onChange={(event) =>
                    updateField("beginningCheckNo", event.target.value)
                  }
                  placeholder="e.g. 000001"
                  required
                  maxLength={30}
                  disabled={saving}
                  inputMode="numeric"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label
                  htmlFor="endingCheckNo"
                  className={labelClass}
                >
                  Ending Check No.{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="endingCheckNo"
                  value={form.endingCheckNo}
                  onChange={(event) =>
                    updateField("endingCheckNo", event.target.value)
                  }
                  placeholder="e.g. 000050"
                  required
                  maxLength={30}
                  disabled={saving}
                  inputMode="numeric"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="dateReceived"
                  className={labelClass}
                >
                  Date Received <span className="text-red-500">*</span>
                </label>

                <input
                  id="dateReceived"
                  type="date"
                  value={form.dateReceived}
                  onChange={(event) =>
                    updateField("dateReceived", event.target.value)
                  }
                  required
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="remarks" className={labelClass}>
                  Remarks
                </label>

                <textarea
                  id="remarks"
                  value={form.remarks}
                  onChange={(event) =>
                    updateField("remarks", event.target.value)
                  }
                  placeholder="Optional notes about this booklet"
                  rows={3}
                  maxLength={2000}
                  disabled={saving}
                  className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                />
              </div>
            </div>

            {!loadingOptions && optionsUnavailable && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-semibold">
                  Dropdown options are unavailable.
                </p>

                <p className="mt-1">
                  Check that the banks and fund sources have records in the
                  database, or reload the options.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setLoadingOptions(true);

                    fetch("/api/checks/booklets/options", {
                      cache: "no-store",
                    })
                      .then(async (response) => {
                        const result = await response.json();

                        if (!response.ok || result?.success === false) {
                          throw new Error(
                            result?.message ||
                              "Unable to reload options."
                          );
                        }

                        setBanks(
                          result.banks.map(
                            (item: Record<string, unknown>) => ({
                              id: item.id as string | number,
                              bankName: String(
                                item.bankName ?? item.bank_name ?? ""
                              ),
                              details: item.details ?? null,
                            })
                          )
                        );

                        setAccounts(
                          result.accounts.map(
                            (item: Record<string, unknown>) => ({
                              id: item.id as string | number,
                              bankId: (
                                item.bankId ??
                                item.bank_id ??
                                ""
                              ) as string | number,
                              accountNumber: String(
                                item.accountNumber ??
                                  item.account_number ??
                                  ""
                              ),
                              details: item.details ?? null,
                            })
                          )
                        );

                        setFundSources(
                          result.fundSources.map(
                            (item: Record<string, unknown>) => ({
                              id: item.id as string | number,
                              fundName: String(
                                item.fundName ?? item.fund_name ?? ""
                              ),
                              details: item.details ?? null,
                            })
                          )
                        );
                      })
                      .catch((err: unknown) => {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "Unable to reload dropdown options."
                        );
                      })
                      .finally(() => setLoadingOptions(false));
                  }}
                  className="mt-2 inline-flex items-center gap-2 font-semibold underline"
                >
                  <RefreshCw size={14} />
                  Reload options
                </button>
              </div>
            )}

            <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Check Number Tracking
                </h3>

                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Initial values
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Current Check No.
                  </p>

                  <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900">
                    {validPreviewRange ? beginningValue : "—"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Total Checks
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {previewTotalChecks}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Issued Checks
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    0
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Remaining Checks
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {previewTotalChecks}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                The current check number starts at the beginning of the
                range. It advances as checks are issued.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Book No. is assigned automatically by the database. Check
              numbers are generated from the range you provide. Fields marked
              with <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingOptions}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Register Booklet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}