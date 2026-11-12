"use client";

import { FormEvent, useState } from "react";
import { X, Layers3, Loader2 } from "lucide-react";
import type { CategoryFormData, ExpenseAccountCategory } from "./account-types";

type Props = {
  category: ExpenseAccountCategory | null;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400";
const labelClass = "mb-1 block text-[11px] font-medium text-slate-400";

export default function AccountCategoryModal({ category, onClose, onSave }: Props) {
  const [categoryCode, setCategoryCode] = useState(category?.category_code ?? "");
  const [categoryName, setCategoryName] = useState(category?.category_name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!categoryCode.trim()) return setError("Category code is required.");
    if (!categoryName.trim()) return setError("Category name is required.");

    setSaving(true);
    try {
      await onSave({
        category_code: categoryCode.trim(),
        category_name: categoryName.trim(),
        description: description.trim(),
        is_active: isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#83A8C5] text-white"><Layers3 size={25} /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{category ? "Edit Account Category" : "Add Account Category"}</h2>
              <p className="mt-1 text-xs text-slate-500">Create a category available to all offices and sub-offices.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-md p-2 text-slate-500 hover:bg-white/60"><X size={19} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
          <section>
            <h3 className="mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">Category Information</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category Code <span className="text-red-500">*</span></label>
                <input value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} className={inputClass} placeholder="e.g. PS, MOOE, CO" required disabled={saving} />
              </div>
              <div>
                <label className={labelClass}>Category Name <span className="text-red-500">*</span></label>
                <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className={inputClass} placeholder="Enter category name" required disabled={saving} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={saving} className="w-full resize-y rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#829FB5] focus:ring-1 focus:ring-[#829FB5]" placeholder="Optional description" />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-3">
                <div><p className="text-xs font-semibold text-slate-700">Category status</p><p className="text-[11px] text-slate-400">Inactive categories cannot be selected for new accounts.</p></div>
                <button type="button" disabled={saving} onClick={() => setIsActive((value) => !value)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{isActive ? "Active" : "Inactive"}</button>
              </div>
            </div>
          </section>
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-1 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:opacity-50">{saving && <Loader2 size={14} className="animate-spin" />}{saving ? "Saving..." : category ? "Update Category" : "Save Category"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
