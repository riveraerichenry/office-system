
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  X,
  Save,
  Loader2,
  Trash2,
  FilePlus2,
  Pencil,
  Building2,
  Layers,
} from "lucide-react";

export type DisbursementAccount = {
  id: string;
  account_code: string;
  account_name: string;

  nature_id: string | null;
  nature_name: string | null;

  office_id: string | null;
  office_name: string | null;

  class_name: string | null;
  title_name: string | null;
  type_name: string | null;

  is_postable: boolean;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type DisbursementAccountFormData = {
  account_code: string;
  account_name: string;

  nature_id: string;
  office_id: string;

  class_name: string;
  title_name: string;
  type_name: string;

  is_postable: boolean;
};

type Office = {
  id: string;
  office_name: string;
  office_code?: string;
};

type Nature = {
  id: string;
  nature_name: string;
  office_id: string;
  status: string;
};

type Props = {
  open: boolean;
  account: DisbursementAccount | null;
  saving: boolean;
  deleting: boolean;
  defaultOfficeId: string;
  onClose: () => void;
  onSave: (data: DisbursementAccountFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const API_OFFICES = "/api/offices";

const API_NATURES =
  "/api/chart-of-accounts/disbursement/natures";

const initialForm: DisbursementAccountFormData = {
  account_code: "",
  account_name: "",

  nature_id: "",
  office_id: "",

  class_name: "",
  title_name: "",
  type_name: "",

  is_postable: false,
};

export default function DisbursementAccountModal({
  open,
  account,
  saving,
  deleting,
  defaultOfficeId,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] =
    useState<DisbursementAccountFormData>(initialForm);

  const [error, setError] = useState("");

  // OFFICES
  const [offices, setOffices] = useState<Office[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [officeError, setOfficeError] = useState("");

  // NATURES
  const [natures, setNatures] = useState<Nature[]>([]);
  const [loadingNatures, setLoadingNatures] = useState(false);
  const [natureError, setNatureError] = useState("");

  const isEditing = Boolean(account);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700";

  // LOAD OFFICES
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadOffices() {
      try {
        setLoadingOffices(true);
        setOfficeError("");

        const response = await fetch(API_OFFICES, {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load offices."
          );
        }

        const officeData = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.offices)
            ? result.offices
            : [];

        if (!cancelled) {
          setOffices(officeData);
        }
      } catch (err) {
        if (!cancelled) {
          setOfficeError(
            err instanceof Error
              ? err.message
              : "Unable to load offices."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOffices(false);
        }
      }
    }

    loadOffices();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // INITIALIZE FORM
  useEffect(() => {
    if (!open) return;

    setError("");
    setNatureError("");
    setNatures([]);

    if (account) {
      setForm({
        account_code: account.account_code ?? "",
        account_name: account.account_name ?? "",

        nature_id: account.nature_id ?? "",
        office_id: account.office_id ?? "",

        class_name: account.class_name ?? "",
        title_name: account.title_name ?? "",
        type_name: account.type_name ?? "",

        is_postable: Boolean(account.is_postable),
      });
    } else {
      setForm({
        ...initialForm,
        office_id: defaultOfficeId || "",
      });
    }
  }, [open, account, defaultOfficeId]);

  // LOAD NATURES WHEN OFFICE CHANGES
  useEffect(() => {
    if (!open || !form.office_id) {
      setNatures([]);
      setLoadingNatures(false);
      setNatureError("");
      return;
    }

    let cancelled = false;

    async function loadNatures() {
      try {
        setLoadingNatures(true);
        setNatureError("");

        const response = await fetch(
          `${API_NATURES}?office_id=${encodeURIComponent(
            form.office_id
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load natures."
          );
        }

        if (!cancelled) {
          setNatures(result.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setNatures([]);
          setNatureError(
            err instanceof Error
              ? err.message
              : "Unable to load natures."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingNatures(false);
        }
      }
    }

    loadNatures();

    return () => {
      cancelled = true;
    };
  }, [open, form.office_id]);

  // UPDATE FORM
  function updateField<K extends keyof DisbursementAccountFormData>(
    field: K,
    value: DisbursementAccountFormData[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // CHANGE OFFICE
  function handleOfficeChange(officeId: string) {
    setForm((prev) => ({
      ...prev,
      office_id: officeId,
      nature_id: "",
    }));

    setNatures([]);
    setNatureError("");
    setError("");
  }

  // SUBMIT
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.office_id) {
      setError("Please select an office.");
      return;
    }

    if (!form.nature_id) {
      setError("Please select a nature of disbursement.");
      return;
    }

    if (!form.account_code.trim()) {
      setError("Account code is required.");
      return;
    }

    if (!form.account_name.trim()) {
      setError("Account name is required.");
      return;
    }

    const selectedNature = natures.find(
      (nature) => nature.id === form.nature_id
    );

    if (!selectedNature) {
      setError(
        "Please select a valid nature for the selected office."
      );
      return;
    }

    const selectedOffice = offices.find(
      (office) => office.id === form.office_id
    );

    if (!selectedOffice) {
      setError("Please select a valid office.");
      return;
    }

    try {
      await onSave({
        ...form,
        account_code: form.account_code.trim(),
        account_name: form.account_name.trim(),
        class_name: form.class_name.trim(),
        title_name: form.title_name.trim(),
        type_name: form.type_name.trim(),
      });

      // AFTER SUCCESSFUL CREATION, RETAIN OFFICE AND NATURE
      if (!isEditing) {
        setForm((prev) => ({
          ...initialForm,
          office_id: prev.office_id,
          nature_id: prev.nature_id,
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save disbursement account."
      );
    }
  }

  // DELETE
  async function handleDelete() {
    if (!account) return;

    const confirmed = window.confirm(
      `Delete account ${account.account_code} - ${account.account_name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await onDelete(account.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete disbursement account."
      );
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              {isEditing ? (
                <Pencil size={20} />
              ) : (
                <FilePlus2 size={20} />
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEditing
                  ? "Edit Disbursement Account"
                  : "Add Disbursement Account"}
              </h2>

              <p className="text-xs text-slate-500">
                Manage disbursement chart of accounts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* OFFICE */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                  <Building2 size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Office Assignment
                  </h3>

                  <p className="text-xs text-slate-500">
                    Select the office responsible for this account.
                  </p>
                </div>
              </div>

              <label className={labelClass}>
                Select Office <span className="text-red-500">*</span>
              </label>

              <select
                value={form.office_id}
                onChange={(e) => handleOfficeChange(e.target.value)}
                disabled={loadingOffices || saving || deleting}
                className={inputClass}
                required
              >
                <option value="">
                  {loadingOffices
                    ? "Loading offices..."
                    : "Select an office"}
                </option>

                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.office_code
                      ? `${office.office_code} - ${office.office_name}`
                      : office.office_name}
                  </option>
                ))}
              </select>

              {officeError && (
                <p className="mt-2 text-xs text-red-600">
                  {officeError}
                </p>
              )}

              {form.office_id && (
                <p className="mt-2 text-xs font-medium text-green-700">
                  Office selected
                </p>
              )}
            </div>

            {/* NATURE */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                  <Layers size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Nature of Disbursement
                  </h3>

                  <p className="text-xs text-slate-500">
                    Available natures depend on the selected office.
                  </p>
                </div>
              </div>

              <label className={labelClass}>
                Select Nature <span className="text-red-500">*</span>
              </label>

              <select
                value={form.nature_id}
                onChange={(e) =>
                  updateField("nature_id", e.target.value)
                }
                disabled={
                  !form.office_id ||
                  loadingNatures ||
                  saving ||
                  deleting
                }
                className={inputClass}
                required
              >
                <option value="">
                  {!form.office_id
                    ? "Select an office first"
                    : loadingNatures
                      ? "Loading natures..."
                      : "Select a nature"}
                </option>

                {natures.map((nature) => (
                  <option key={nature.id} value={nature.id}>
                    {nature.nature_name}
                  </option>
                ))}
              </select>

              {loadingNatures && (
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 size={13} className="animate-spin" />
                  Loading available natures...
                </p>
              )}

              {natureError && (
                <p className="mt-2 text-xs text-red-600">
                  {natureError}
                </p>
              )}

              {form.office_id &&
                !loadingNatures &&
                !natureError &&
                natures.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No active natures are available for this office.
                  </p>
                )}
            </div>

            {/* ACCOUNT CODE */}
            <div>
              <label className={labelClass}>
                Account Code <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={form.account_code}
                onChange={(e) =>
                  updateField("account_code", e.target.value)
                }
                placeholder="Enter account code"
                className={inputClass}
                disabled={saving || deleting}
                required
              />
            </div>

            {/* ACCOUNT NAME */}
            <div>
              <label className={labelClass}>
                Account Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={form.account_name}
                onChange={(e) =>
                  updateField("account_name", e.target.value)
                }
                placeholder="Enter account name"
                className={inputClass}
                disabled={saving || deleting}
                required
              />
            </div>

            {/* OPTIONAL CLASS */}
            <div>
              <label className={labelClass}>
                Class Name
              </label>

              <input
                type="text"
                value={form.class_name}
                onChange={(e) =>
                  updateField("class_name", e.target.value)
                }
                placeholder="Enter class name (optional)"
                className={inputClass}
                disabled={saving || deleting}
              />
            </div>

            {/* TITLE */}
            <div>
              <label className={labelClass}>
                Title / Subgroup
              </label>

              <input
                type="text"
                value={form.title_name}
                onChange={(e) =>
                  updateField("title_name", e.target.value)
                }
                placeholder="Enter title or subgroup"
                className={inputClass}
                disabled={saving || deleting}
              />
            </div>

            {/* TYPE */}
            <div>
              <label className={labelClass}>
                Type Name
              </label>

              <input
                type="text"
                value={form.type_name}
                onChange={(e) =>
                  updateField("type_name", e.target.value)
                }
                placeholder="Enter type name (optional)"
                className={inputClass}
                disabled={saving || deleting}
              />
            </div>

            {/* POSTABLE */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.is_postable}
                  onChange={(e) =>
                    updateField("is_postable", e.target.checked)
                  }
                  disabled={saving || deleting}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Postable Account
                  </span>

                  <span className="mt-0.5 block text-xs text-slate-500">
                    Enable this if transactions can be directly posted to this account.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  deleting ||
                  loadingOffices ||
                  loadingNatures
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                {saving
                  ? "Saving..."
                  : isEditing
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
