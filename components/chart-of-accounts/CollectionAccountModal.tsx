
"use client";

import { useEffect, useState } from "react";
import { X, Save, Ban } from "lucide-react";

export type Account = {
  id: string;
  parent_id?: string | null;
  parent_code?: string | null;
  parent_name?: string | null;
  account_code: string | null;
  account_name: string;
  class_name?: string | null;
  title_name?: string | null;
  type_name?: string | null;
  account_level?: number | null;
  sort_order?: number | null;
  is_postable?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type AccountForm = {
  parent_id: string;
  account_code: string;
  account_name: string;
  class_name: string;
  title_name: string;
  type_name: string;
  account_level: string;
  sort_order: string;
  is_postable: boolean;
  is_active: boolean;
};

type Props = {
  open: boolean;
  account: Account | null;
  accounts: Account[];
  saving: boolean;
  deleting: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const emptyForm: AccountForm = {
  parent_id: "",
  account_code: "",
  account_name: "",
  class_name: "",
  title_name: "",
  type_name: "",
  account_level: "0",
  sort_order: "0",
  is_postable: false,
  is_active: true,
};

export default function CollectionAccountModal({
  open,
  account,
  accounts,
  saving,
  deleting,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (account) {
      setForm({
        parent_id: account.parent_id ?? "",
        account_code: account.account_code ?? "",
        account_name: account.account_name ?? "",
        class_name: account.class_name ?? "",
        title_name: account.title_name ?? "",
        type_name: account.type_name ?? "",
        account_level: String(account.account_level ?? 0),
        sort_order: String(account.sort_order ?? 0),
        is_postable: Boolean(account.is_postable),
        is_active: account.is_active !== false,
      });
    } else {
      setForm(emptyForm);
    }

    setError("");
  }, [open, account]);

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-slate-700";

  const updateField = <K extends keyof AccountForm>(
    field: K,
    value: AccountForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.account_name.trim()) {
      setError("Account name is required.");
      return;
    }

    if (form.parent_id && form.parent_id === account?.id) {
      setError("An account cannot be its own parent.");
      return;
    }

    try {
      await onSave({
        parent_id: form.parent_id || null,
        account_code: form.account_code.trim() || null,
        account_name: form.account_name.trim(),
        class_name: form.class_name.trim() || null,
        title_name: form.title_name.trim() || null,
        type_name: form.type_name.trim() || null,
        account_level:
          form.account_level === "" ? null : Number(form.account_level),
        sort_order:
          form.sort_order === "" ? null : Number(form.sort_order),
        is_postable: form.is_postable,
        is_active: form.is_active,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save account."
      );
    }
  };

  const handleDeactivate = async () => {
    if (!account) return;

    const confirmed = window.confirm(
      `Deactivate ${account.account_code || ""} - ${account.account_name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await onDelete(account.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to deactivate account."
      );
    }
  };

  const availableParents = accounts.filter(
    (item) => item.id !== account?.id
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving &&
          !deleting
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {account ? "Edit Collection Account" : "Add Collection Account"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {account
                ? "Update the account information."
                : "Enter the details for the new account."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-4 p-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ACCOUNT CODE AND NAME */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Account Code</label>

                <input
                  value={form.account_code}
                  onChange={(e) =>
                    updateField("account_code", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Enter account code"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Account Name <span className="text-red-500">*</span>
                </label>

                <input
                  value={form.account_name}
                  onChange={(e) =>
                    updateField("account_name", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Enter account name"
                  required
                />
              </div>
            </div>

            {/* PARENT ACCOUNT */}
            <div>
              <label className={labelClass}>Parent Account</label>

              <select
                value={form.parent_id}
                onChange={(e) =>
                  updateField("parent_id", e.target.value)
                }
                className={inputClass}
              >
                <option value="">No Parent Account</option>

                {availableParents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.account_code || "(No Code)"} - {item.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* CLASSIFICATION */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Class</label>

                <input
                  value={form.class_name}
                  onChange={(e) =>
                    updateField("class_name", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Class"
                />
              </div>

              <div>
                <label className={labelClass}>Title</label>

                <input
                  value={form.title_name}
                  onChange={(e) =>
                    updateField("title_name", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Title"
                />
              </div>

              <div>
                <label className={labelClass}>Type</label>

                <input
                  value={form.type_name}
                  onChange={(e) =>
                    updateField("type_name", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Type"
                />
              </div>
            </div>

            {/* LEVEL AND SORT ORDER */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Account Level</label>

                <input
                  type="number"
                  min="0"
                  value={form.account_level}
                  onChange={(e) =>
                    updateField("account_level", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Sort Order</label>

                <input
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) =>
                    updateField("sort_order", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* OPTIONS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={form.is_postable}
                  onChange={(e) =>
                    updateField("is_postable", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Postable Account
                  </span>
                  <span className="text-xs text-slate-500">
                    Allow direct transaction posting.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    updateField("is_active", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Active Account
                  </span>
                  <span className="text-xs text-slate-500">
                    Enable this account.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            <div>
              {account && account.is_active !== false && (
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Ban size={15} />
                  {deleting ? "Deactivating..." : "Deactivate"}
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={15} />
                {saving
                  ? "Saving..."
                  : account
                    ? "Update Account"
                    : "Save Account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
