"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { X, Wallet, Loader2 } from "lucide-react";

import type {
  AccountFormData,
  ExpenseAccount,
  ExpenseAccountCategory,
  OfficeOption,
  SubOfficeOption,
} from "./account-types";

type Props = {
  account: ExpenseAccount | null;
  categories: ExpenseAccountCategory[];
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  onClose: () => void;
  onSave: (data: AccountFormData) => Promise<void>;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

export default function AccountModal({
  account,
  categories,
  offices,
  subOffices,
  onClose,
  onSave,
}: Props) {
  const [officeId, setOfficeId] = useState("");
  const [subOfficeId, setSubOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [accountCode, setAccountCode] = useState(
    account?.account_code ?? ""
  );

  const [accountName, setAccountName] = useState(
    account?.account_name ?? ""
  );

  const [description, setDescription] = useState(
    account?.description ?? ""
  );

  const [isActive, setIsActive] = useState(
    account?.is_active ?? true
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // INITIALIZE EDITING VALUES
  // =====================================================

  useEffect(() => {
    if (!account) return;

    const selectedCategory = categories.find(
      (item) => item.id === account.category_id
    );

    if (!selectedCategory) return;

    let selectedOfficeId = selectedCategory.office_id ?? "";
    let selectedSubOfficeId = selectedCategory.sub_office_id ?? "";

    // If category belongs to a sub-office,
    // determine its parent office.
    if (selectedSubOfficeId) {
      const selectedSubOffice = subOffices.find(
        (item) => item.id === selectedSubOfficeId
      );

      selectedOfficeId =
        selectedSubOffice?.office_id ?? selectedOfficeId;
    }

    setOfficeId(selectedOfficeId);
    setSubOfficeId(selectedSubOfficeId);
    setCategoryId(account.category_id);
  }, [account, categories, subOffices]);

  // =====================================================
  // FILTER SUB-OFFICES BY OFFICE
  // =====================================================

  const filteredSubOffices = useMemo(() => {
    if (!officeId) return [];

    return subOffices.filter(
      (item) =>
        item.office_id === officeId &&
        (item.is_active || item.id === subOfficeId)
    );
  }, [subOffices, officeId, subOfficeId]);

  // =====================================================
  // FILTER CATEGORIES BY OFFICE / SUB-OFFICE
  // =====================================================

  const filteredCategories = useMemo(() => {
    if (!officeId) return [];

    return categories.filter((item) => {
      const isCurrentlyAssigned =
        item.id === account?.category_id;

      if (!item.is_active && !isCurrentlyAssigned) {
        return false;
      }

      // Category directly assigned to the selected office
      const belongsToOffice =
        item.office_id === officeId &&
        !item.sub_office_id;

      // Category assigned to the selected sub-office
      const belongsToSubOffice =
        Boolean(subOfficeId) &&
        item.sub_office_id === subOfficeId;

      return belongsToOffice || belongsToSubOffice;
    });
  }, [categories, officeId, subOfficeId, account]);

  // =====================================================
  // SELECTED CATEGORY
  // =====================================================

  const selectedCategory = categories.find(
    (item) => item.id === categoryId
  );

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!officeId) {
      setError("Please select an office.");
      return;
    }

    if (!categoryId) {
      setError("Please select an account category.");
      return;
    }

    if (!accountCode.trim()) {
      setError("Account code is required.");
      return;
    }

    if (!accountName.trim()) {
      setError("Account name is required.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        category_id: categoryId,
        account_code: accountCode.trim(),
        account_name: accountName.trim(),
        description: description.trim(),
        is_active: isActive,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save account."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <Wallet size={25} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {account
                  ? "Edit Expense Account"
                  : "Add Expense Account"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select the office, sub-office and account category.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5 sm:p-8"
        >
          {/* OFFICE AND CATEGORY */}
          <section>
            <h3 className="mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">
              Office and Account Classification
            </h3>

            <div className="space-y-5">

              {/* OFFICE */}
              <div>
                <label className={labelClass}>
                  Office <span className="text-red-500">*</span>
                </label>

                <select
                  value={officeId}
                  onChange={(e) => {
                    setOfficeId(e.target.value);
                    setSubOfficeId("");
                    setCategoryId("");
                  }}
                  className={inputClass}
                  required
                  disabled={saving}
                >
                  <option value="">Select office</option>

                  {offices
                    .filter(
                      (item) =>
                        item.is_active ||
                        item.id === officeId
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.office_code} — {item.office_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* SUB-OFFICE */}
              <div>
                <label className={labelClass}>
                  Sub-office
                  <span className="ml-1 text-slate-400">
                    (Optional)
                  </span>
                </label>

                <select
                  value={subOfficeId}
                  onChange={(e) => {
                    setSubOfficeId(e.target.value);
                    setCategoryId("");
                  }}
                  className={inputClass}
                  disabled={!officeId || saving}
                >
                  <option value="">
                    {officeId
                      ? "No sub-office / Office-level category"
                      : "Select office first"}
                  </option>

                  {filteredSubOffices.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sub_office_code
                        ? `${item.sub_office_code} — `
                        : ""}
                      {item.sub_office_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}
              <div>
                <label className={labelClass}>
                  Account Category{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value)
                  }
                  className={inputClass}
                  required
                  disabled={!officeId || saving}
                >
                  <option value="">
                    {officeId
                      ? "Select account category"
                      : "Select office first"}
                  </option>

                  {filteredCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.category_code} — {item.category_name}
                      {item.sub_office_id
                        ? " (Sub-office)"
                        : " (Office)"}
                    </option>
                  ))}
                </select>

                {officeId && filteredCategories.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No active categories are assigned to this selection.
                  </p>
                )}

                {/* CATEGORY ASSIGNMENT PREVIEW */}
                {selectedCategory && (
                  <div className="mt-3 rounded-md border border-[#DCE3E9] bg-white px-3 py-3">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Selected category assignment
                    </p>

                    <p className="text-xs font-semibold text-slate-700">
                      {selectedCategory.category_code} —{" "}
                      {selectedCategory.category_name}
                    </p>

                    {selectedCategory.office_name && (
                      <p className="mt-1 text-xs text-blue-700">
                        Office: {selectedCategory.office_name}
                      </p>
                    )}

                    {selectedCategory.sub_office_name && (
                      <p className="mt-1 text-xs text-violet-700">
                        Sub-office: {selectedCategory.sub_office_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ACCOUNT INFORMATION */}
          <section>
            <h3 className="mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">
              Account Information
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* ACCOUNT CODE */}
              <div>
                <label className={labelClass}>
                  Account Code{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  value={accountCode}
                  onChange={(e) =>
                    setAccountCode(e.target.value)
                  }
                  className={inputClass}
                  placeholder="Enter account code"
                  required
                  disabled={saving}
                />
              </div>

              {/* ACCOUNT NAME */}
              <div>
                <label className={labelClass}>
                  Account Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  value={accountName}
                  onChange={(e) =>
                    setAccountName(e.target.value)
                  }
                  className={inputClass}
                  placeholder="Enter account name"
                  required
                  disabled={saving}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={3}
                  disabled={saving}
                  className="w-full resize-y rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#829FB5] focus:ring-1 focus:ring-[#829FB5]"
                  placeholder="Optional description"
                />
              </div>

              {/* STATUS */}
              <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Account status
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Inactive accounts cannot be selected for new transactions.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setIsActive((value) => !value)
                  }
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          </section>

          {/* ERROR */}
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          {/* FOOTER */}
          <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-1 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !officeId ||
                !categoryId
              }
              className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:opacity-50"
            >
              {saving && (
                <Loader2 size={14} className="animate-spin" />
              )}

              {saving
                ? "Saving..."
                : account
                  ? "Update Account"
                  : "Save Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}