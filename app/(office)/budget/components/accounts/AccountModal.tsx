"use client";

import { FormEvent, useState } from "react";
import { X, Wallet, Loader2 } from "lucide-react";
import type { AccountFormData, ExpenseAccount, ExpenseAccountCategory } from "./account-types";

type Props = {
  account: ExpenseAccount | null;
  categories: ExpenseAccountCategory[];
  onClose: () => void;
  onSave: (data: AccountFormData) => Promise<void>;
};

const inputClass = "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400";
const labelClass = "mb-1 block text-[11px] font-medium text-slate-400";

export default function AccountModal({ account, categories, onClose, onSave }: Props) {
  const [categoryId, setCategoryId] = useState(account?.category_id ?? "");
  const [accountCode, setAccountCode] = useState(account?.account_code ?? "");
  const [accountName, setAccountName] = useState(account?.account_name ?? "");
  const [description, setDescription] = useState(account?.description ?? "");
  const [isActive, setIsActive] = useState(account?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableCategories = categories.filter((item) => item.is_active || item.id === account?.category_id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!categoryId) return setError("Please select an account category.");
    if (!accountCode.trim()) return setError("Account code is required.");
    if (!accountName.trim()) return setError("Account name is required.");

    setSaving(true);
    try {
      await onSave({ category_id: categoryId, account_code: accountCode.trim(), account_name: accountName.trim(), description: description.trim(), is_active: isActive });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#83A8C5] text-white"><Wallet size={25} /></div>
            <div><h2 className="text-lg font-semibold text-slate-800">{account ? "Edit Expense Account" : "Add Expense Account"}</h2><p className="mt-1 text-xs text-slate-500">An account must belong to one category only.</p></div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-md p-2 text-slate-500 hover:bg-white/60"><X size={19} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
          <section>
            <h3 className="mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">Account Classification</h3>
            <div>
              <label className={labelClass}>Account Category <span className="text-red-500">*</span></label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} required disabled={saving}>
                <option value="">Select account category</option>
                {availableCategories.map((item) => <option key={item.id} value={item.id}>{item.category_code} — {item.category_name}</option>)}
              </select>
              {availableCategories.length === 0 && <p className="mt-2 text-xs text-amber-600">Create an active account category first.</p>}
            </div>
          </section>

          <section>
            <h3 className="mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">Account Information</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={labelClass}>Account Code <span className="text-red-500">*</span></label><input value={accountCode} onChange={(e) => setAccountCode(e.target.value)} className={inputClass} placeholder="Enter account code" required disabled={saving} /></div>
              <div><label className={labelClass}>Account Name <span className="text-red-500">*</span></label><input value={accountName} onChange={(e) => setAccountName(e.target.value)} className={inputClass} placeholder="Enter account name" required disabled={saving} /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={saving} className="w-full resize-y rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#829FB5] focus:ring-1 focus:ring-[#829FB5]" placeholder="Optional description" /></div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-3"><div><p className="text-xs font-semibold text-slate-700">Account status</p><p className="text-[11px] text-slate-400">Inactive accounts cannot be used for new transactions.</p></div><button type="button" disabled={saving} onClick={() => setIsActive((value) => !value)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{isActive ? "Active" : "Inactive"}</button></div>
            </div>
          </section>
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-1 pt-4"><button type="button" onClick={onClose} disabled={saving} className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" disabled={saving || availableCategories.length === 0} className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:opacity-50">{saving && <Loader2 size={14} className="animate-spin" />}{saving ? "Saving..." : account ? "Update Account" : "Save Account"}</button></div>
        </form>
      </div>
    </div>
  );
}
