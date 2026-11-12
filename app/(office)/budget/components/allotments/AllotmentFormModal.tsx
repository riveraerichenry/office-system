"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Plus, Trash2, X, Save } from "lucide-react";

import type { AppropriationOption, ReleaseType } from "./allotment-types";

type FundSource = {
  id: string;
  fund_code: string;
  fund_name: string;
};

type AccountOption = {
  account_id: string;
  account_code: string;
  account_name: string;
  category_id: string;
  category_name: string;
  office_id: string;
  office_name: string;
  sub_office_id: string | null;
  sub_office_name: string | null;
};

type Props = {
  fiscalYear: number;
  quarter: number;
  onClose: () => void;
  onSaved: () => void;
  onQuarterChange: (value: number) => void;
  
};

type Item = {
  appropriation_id: string;
  office_id: string;
  sub_office_id: string;
  category_id: string;
  account_id: string;
  amount: string;
};

const EMPTY_ITEM: Item = {
  appropriation_id: "",
  office_id: "",
  sub_office_id: "",
  category_id: "",
  account_id: "",
  amount: "",
};

const NO_SUB_OFFICE = "__none__";

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

const fieldClass =
  "w-full border-b border-slate-300 bg-transparent py-2 text-sm outline-none focus:border-[#6689A5] disabled:cursor-not-allowed disabled:text-slate-400";

export default function AllotmentFormModal({
  fiscalYear,
  quarter,
  onClose,
  onSaved,
  onQuarterChange,
}: Props) {
  const [allotmentNo, setAllotmentNo] = useState("");
  const [allotmentDate, setAllotmentDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [releaseType, setReleaseType] = useState<ReleaseType>("regular");
  const [remarks, setRemarks] = useState("");

  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [appropriations, setAppropriations] = useState<AppropriationOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [offices, setOffices] = useState<{ id: string; office_name: string }[]>([]);
  const [subOffices, setSubOffices] = useState<{ id: string; office_id: string; sub_office_name: string }[]>([]);
  const [fundSourceId, setFundSourceId] = useState("");
  const [items, setItems] = useState<Item[]>([{ ...EMPTY_ITEM }]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [fundRes, appropriationRes] = await Promise.all([
          fetch("/budget/api/fund_sources"),
          fetch(`/budget/api/allotments?fiscal_year=${fiscalYear}&quarter=${quarter}`),
        ]);

        const [fundJson, appropriationJson] = await Promise.all([
          fundRes.json(),
          appropriationRes.json(),
        ]);

        if (!fundRes.ok || !fundJson.success) {
          throw new Error(fundJson.message || "Unable to load fund sources.");
        }
        if (!appropriationRes.ok || !appropriationJson.success) {
          throw new Error(appropriationJson.message || "Unable to load appropriations.");
        }
        if (!active) return;

        setFundSources(fundJson.data || []);
        setAppropriations(appropriationJson.appropriations || []);
        setAccounts(appropriationJson.accounts || []);
        setOffices(appropriationJson.offices || []);
        setSubOffices(appropriationJson.subOffices || []);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [fiscalYear, quarter]);

  // Only appropriations under the selected fund source with an available balance.
  const availableAppropriations = useMemo(
    () =>
      appropriations.filter(
        (item) =>
          item.fund_source_id === fundSourceId &&
          Number(item.remaining_appropriation) > 0
      ),
    [appropriations, fundSourceId]
  );

  

  const selectedIds = items.map((item) => item.appropriation_id).filter(Boolean);

  function updateItem(index: number, changes: Partial<Item>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...changes } : item))
    );
  }

  function addItem() {
    setItems((current) => [...current, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1 ? [{ ...EMPTY_ITEM }] : current.filter((_, i) => i !== index)
    );
  }

  function selectAccount(index: number, accountId: string) {
    const appropriation = availableAppropriations.find(
      (a) => a.account_id === accountId
    );
    updateItem(index, {
      account_id: accountId,
      appropriation_id: appropriation?.id || "",
    });
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allotmentNo.trim()) {
      setError("Enter the allotment document number.");
      return;
    }
    if (!fundSourceId) {
      setError("Select a fund source.");
      return;
    }

    const validItems = items.map((item) => ({
      appropriation_id: item.appropriation_id,
      amount: Number(item.amount),
    }));

    if (
      validItems.some(
        (item) =>
          !item.appropriation_id ||
          !Number.isFinite(item.amount) ||
          item.amount <= 0
      )
    ) {
      setError("Complete the Office, Category, Account, and Amount fields.");
      return;
    }

    if (new Set(validItems.map((item) => item.appropriation_id)).size !== validItems.length) {
      setError("An appropriation account cannot be added twice.");
      return;
    }

    for (const item of validItems) {
      const appropriation = availableAppropriations.find((a) => a.id === item.appropriation_id);
      if (!appropriation) {
        setError("An appropriation account is unavailable under the selected fund source.");
        return;
      }
      if (item.amount > Number(appropriation.remaining_appropriation)) {
        setError(`${appropriation.account_name} exceeds its remaining appropriation.`);
        return;
      }
    }

    try {
      setSaving(true);
      const response = await fetch("/budget/api/allotments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allotment_no: allotmentNo,
          allotment_date: allotmentDate,
          fiscal_year: fiscalYear,
          quarter,
          release_type: releaseType,
          remarks,
          items: validItems,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save release.");
      }

      await Swal.fire({
        icon: "success",
        title: "Allotment Posted Successfully",
        text: result.message || "The budget release has been successfully posted.",
        confirmButtonText: "OK",
        confirmButtonColor: "#6689A5",
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save release.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-3">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-[#C7D8E3] bg-[#F8FAFC] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">New Budget Release</h2>
            <p className="text-xs text-slate-500">FY {fiscalYear} · Quarter {quarter}</p>
          </div>
          <button onClick={onClose} type="button" aria-label="Close">
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Document Number *</label>
                <input value={allotmentNo} onChange={(e) => setAllotmentNo(e.target.value)} className={fieldClass} required />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Document Date *</label>
                <input type="date" value={allotmentDate} onChange={(e) => setAllotmentDate(e.target.value)} className={fieldClass} required />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Release Type *</label>
                <select value={releaseType} onChange={(e) => setReleaseType(e.target.value as ReleaseType)} className={fieldClass}>
                  <option value="regular">Regular Allotment</option>
                  <option value="special">Special Release</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Fiscal Year</label>
                <input value={fiscalYear} disabled className={fieldClass} />
              </div>
              
              <div>
                <label className="mb-1 block text-xs text-slate-500">
                  Quarter
                </label>

                <select
                  value={quarter}
                  onChange={(e) => onQuarterChange(Number(e.target.value))}
                  className={fieldClass}
                >
                  <option value="1">1st Quarter</option>
                  <option value="2">2nd Quarter</option>
                  <option value="3">3rd Quarter</option>
                  <option value="4">4th Quarter</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-500">Fund Source *</label>
                <select
                  value={fundSourceId}
                  onChange={(e) => {
                    setFundSourceId(e.target.value);
                    setItems([{ ...EMPTY_ITEM }]);
                  }}
                  className={fieldClass}
                  required
                >
                  <option value="">Select fund source</option>
                  {fundSources.map((fund) => (
                    <option key={fund.id} value={fund.id}>{fund.fund_code} — {fund.fund_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#557992]">Allotment Account Details</h3>
                  <p className="mt-1 text-xs text-slate-400">Office filters its sub-offices. Category filters its expense accounts. These two pairs are independent.</p>
                </div>
                <button type="button" onClick={addItem} disabled={!fundSourceId || loading} className="flex items-center gap-2 rounded-md border border-[#6689A5] px-3 py-2 text-xs font-semibold text-[#557992] disabled:opacity-50">
                  <Plus size={15} /> Add Account
                </button>
              </div>

              {loading ? (
                <p className="py-6 text-sm text-slate-500">Loading appropriation accounts...</p>
              ) : !fundSourceId ? (
                <p className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">Select a fund source first.</p>
              ) : accounts.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">No registered expense accounts were returned by the API.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => {
                    // Office and sub-office form one cascading pair.
                    const officeOptions = offices
                      .map((office) => ({ id: office.id, name: office.office_name }))
                      .sort((a, b) => a.name.localeCompare(b.name));

                    const subOfficeOptions = subOffices
                      .filter((sub) => sub.office_id === item.office_id)
                      .map((sub) => ({ id: sub.id, name: sub.sub_office_name }))
                      .sort((a, b) => a.name.localeCompare(b.name));

                    // Category and account form a separate cascading pair.
                    // Selecting an office does not filter expense categories.
                    const categoryOptions = Array.from(
                      new Map(
                        accounts.map((account) => [
                          account.category_id,
                          { id: account.category_id, name: account.category_name },
                        ])
                      ).values()
                    ).sort((a, b) => a.name.localeCompare(b.name));

                    const accountOptions = accounts
                      .filter((account) => account.category_id === item.category_id)
                      .map((account) => {
                        const appropriation = availableAppropriations.find(
                          (a) => a.account_id === account.account_id
                        );
                        return { ...account, appropriation };
                      })
                      .sort((a, b) => a.account_code.localeCompare(b.account_code));

                    const selected = availableAppropriations.find((a) => a.id === item.appropriation_id);

                    return (
                      <div key={index} className="rounded-md border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-600">Allotment Item {index + 1}</p>
                          <button type="button" onClick={() => removeItem(index)} className="rounded-md p-2 text-red-500 hover:bg-red-50" title="Remove item">
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <label className="mb-1 block text-xs text-slate-500">Office *</label>
                            <select
                              value={item.office_id}
                              onChange={(e) => updateItem(index, { office_id: e.target.value, sub_office_id: "", category_id: "", account_id: "", appropriation_id: "" })}
                              className={fieldClass}
                              required
                            >
                              <option value="">Select office</option>
                              {officeOptions.map((office) => <option key={office.id} value={office.id}>{office.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-slate-500">Sub-office *</label>
                            <select
                              value={item.sub_office_id}
                              onChange={(e) => updateItem(index, { sub_office_id: e.target.value, category_id: "", account_id: "", appropriation_id: "" })}
                              className={fieldClass}
                              disabled={!item.office_id}
                            >
                              <option value="">No sub-office / Office-level</option>
                              {subOfficeOptions.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-slate-500">Expense Account Category *</label>
                            <select
                              value={item.category_id}
                              onChange={(e) => updateItem(index, { category_id: e.target.value, account_id: "", appropriation_id: "" })}
                              className={fieldClass}
                              disabled={false}
                              required
                            >
                              <option value="">Select category</option>
                              {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-slate-500">Expense Account *</label>
                            <select
                              value={item.account_id}
                              onChange={(e) => selectAccount(index, e.target.value)}
                              className={fieldClass}
                              disabled={!item.category_id}
                              required
                            >
                              <option value="">Select account</option>
                              {accountOptions.map((account) => (
                                <option
                                  key={account.account_id}
                                  value={account.account_id}
                                  disabled={!account.appropriation || selectedIds.includes(account.appropriation.id) && account.appropriation.id !== item.appropriation_id}
                                >
                                  {account.account_code} — {account.account_name}
                                  {!account.appropriation ? " (No available appropriation)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {selected && (
                          <div className="mt-3 grid gap-2 rounded-md bg-[#F3F7FA] p-3 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                            <p><span className="text-slate-400">Appropriation:</span><br />{money(Number(selected.appropriated_amount))}</p>
                            <p><span className="text-slate-400">Previous releases:</span><br />{money(Number(selected.total_release))}</p>
                            <p><span className="text-slate-400">Remaining:</span><br />{money(Number(selected.remaining_appropriation))}</p>
                            <div>
                              <label className="mb-1 block text-slate-500">Release Amount *</label>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                max={Number(selected.remaining_appropriation)}
                                value={item.amount}
                                onChange={(e) => updateItem(index, { amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-[#6689A5]"
                                required
                              />
                            </div>
                          </div>
                        )}
                        {!selected && (
                          <p className="mt-2 text-[11px] text-slate-400">Choose an account to view its remaining appropriation and enter the release amount.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-500">Remarks</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#6689A5]" />
            </div>

            <div className="flex justify-end">
              <div className="rounded-md bg-[#EAF1F6] px-5 py-3 text-right">
                <p className="text-xs text-slate-500">Document Total</p>
                <p className="text-xl font-bold text-[#557992]">{money(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-5 py-2.5 text-sm text-slate-600">Cancel</button>
            <button type="submit" disabled={saving || loading} className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              <Save size={16} /> {saving ? "Posting..." : "Post Release"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
