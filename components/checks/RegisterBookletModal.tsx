
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";

interface FundSource {
  id: string;
  name: string;
  fund_code?: string;
  acronym?: string;
}

interface Bank {
  id: string;
  name: string;
  bank_code?: string;
}

interface BankAccount {
  id: string;
  bank_id: string;
  account_number: string;
  account_name?: string | null;
  account_code?: string | null;
}

interface Options {
  fundSources: FundSource[];
  banks: Bank[];
  accounts: BankAccount[];
}

interface Props {
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

interface FormData {
  registeredAt: string;
  fundSourceId: string;
  bankId: string;
  bankAccountId: string;
  beginningCheckNo: string;
  endingCheckNo: string;
  remarks: string;
  status: "Active" | "Exhausted";
}

function getCurrentDateTime() {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

export default function RegisterBookletModal({
  onClose,
  onSuccess,
}: Props) {
  const [options, setOptions] = useState<Options>({
    fundSources: [],
    banks: [],
    accounts: [],
  });

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    registeredAt: getCurrentDateTime(),
    fundSourceId: "",
    bankId: "",
    bankAccountId: "",
    beginningCheckNo: "",
    endingCheckNo: "",
    remarks: "",
    status: "Active",
  });

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError("");

        const response = await fetch("/api/checks/options", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load registration options."
          );
        }

        if (active) {
          setOptions({
            fundSources: data.fundSources ?? [],
            banks: data.banks ?? [],
            accounts: data.accounts ?? [],
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load registration options."
          );
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const filteredAccounts = useMemo(
    () =>
      options.accounts.filter(
        (account) => account.bank_id === form.bankId
      ),
    [options.accounts, form.bankId]
  );

  const checkCount = useMemo(() => {
    const beginning = form.beginningCheckNo.trim();
    const ending = form.endingCheckNo.trim();

    if (
      !/^\d+$/.test(beginning) ||
      !/^\d+$/.test(ending) ||
      beginning.length !== ending.length
    ) {
      return 0;
    }

    const start = Number(beginning);
    const end = Number(ending);

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      end < start
    ) {
      return 0;
    }

    return end - start + 1;
  }, [form.beginningCheckNo, form.endingCheckNo]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleBankChange = (bankId: string) => {
    setForm((previous) => ({
      ...previous,
      bankId,
      bankAccountId: "",
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (checkCount < 1 || checkCount > 500) {
      setError("Please enter a valid check number range (maximum 500 checks).");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/checks/booklets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          beginningCheckNo: form.beginningCheckNo.trim(),
          endingCheckNo: form.endingCheckNo.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to register check booklet."
        );
      }

      await onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to register check booklet."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Register Check Booklet
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the check booklet information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {loadingOptions ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Loading fund sources, banks, and accounts...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Book No.
                    </label>
                    <input
                      type="text"
                      value="Auto-generated"
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Date and Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={form.registeredAt}
                      onChange={(e) =>
                        updateField("registeredAt", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Fund Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.fundSourceId}
                      onChange={(e) =>
                        updateField("fundSourceId", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select fund source</option>
                      {options.fundSources.map((fund) => (
                        <option key={fund.id} value={fund.id}>
                          {fund.name}
                          {fund.acronym ? ` (${fund.acronym})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Bank <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.bankId}
                      onChange={(e) => handleBankChange(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select bank</option>
                      {options.banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Account Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.bankAccountId}
                      onChange={(e) =>
                        updateField("bankAccountId", e.target.value)
                      }
                      disabled={!form.bankId}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="">
                        {form.bankId
                          ? "Select account number"
                          : "Select a bank first"}
                      </option>
                      {filteredAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.account_number}
                          {account.account_name
                            ? ` — ${account.account_name}`
                            : ""}
                        </option>
                      ))}
                    </select>
                    {form.bankId && filteredAccounts.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600">
                        No active accounts found for this bank.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Beginning Check No.{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={form.beginningCheckNo}
                      onChange={(e) =>
                        updateField("beginningCheckNo", e.target.value)
                      }
                      placeholder="e.g. 000001"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Ending Check No.{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={form.endingCheckNo}
                      onChange={(e) =>
                        updateField("endingCheckNo", e.target.value)
                      }
                      placeholder="e.g. 000050"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Number of Checks
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        checkCount > 0
                          ? checkCount.toLocaleString("en-PH")
                          : ""
                      }
                      placeholder="Automatically calculated"
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-600"
                    />
                    {checkCount > 500 && (
                      <p className="mt-1 text-xs text-red-600">
                        Maximum of 500 checks per booklet.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.status}
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value as FormData["status"]
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Active">Active</option>
                      <option value="Exhausted">Exhausted</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Remarks
                    </label>
                    <textarea
                      value={form.remarks}
                      onChange={(e) =>
                        updateField("remarks", e.target.value)
                      }
                      rows={3}
                      placeholder="Optional remarks"
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loadingOptions ||
                submitting ||
                checkCount < 1 ||
                checkCount > 500
              }
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Register Booklet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
