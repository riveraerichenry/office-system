"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
  Layers3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import type {
  CategoryFormData,
  ExpenseAccountCategory,
  OfficeOption,
  SubOfficeOption,
} from "./account-types";

type Props = {
  category: ExpenseAccountCategory | null;
  offices?: OfficeOption[];
  subOffices?: SubOfficeOption[];
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

const API = {
  offices: "/budget/api/offices",
  subOffices: "/budget/api/sub_offices",
};

export default function AccountCategoryModal({
  category,
  offices: initialOffices = [],
  subOffices: initialSubOffices = [],
  onClose,
  onSave,
}: Props) {
  const [ownerType, setOwnerType] = useState<
    "office" | "sub_office"
  >(category?.sub_office_id ? "sub_office" : "office");

  const [officeId, setOfficeId] = useState(
    category?.office_id ?? ""
  );

  const [subOfficeId, setSubOfficeId] = useState(
    category?.sub_office_id ?? ""
  );

  const [categoryCode, setCategoryCode] = useState(
    category?.category_code ?? ""
  );

  const [categoryName, setCategoryName] = useState(
    category?.category_name ?? ""
  );

  const [description, setDescription] = useState(
    category?.description ?? ""
  );

  const [isActive, setIsActive] = useState(
    category?.is_active ?? true
  );

  const [offices, setOffices] =
    useState<OfficeOption[]>(initialOffices);

  const [subOffices, setSubOffices] =
    useState<SubOfficeOption[]>(initialSubOffices);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD OFFICES AND SUB-OFFICES
  // =====================================================

  async function loadOptions() {
    setLoadingOptions(true);
    setLoadingError("");

    try {
      const [officeResponse, subOfficeResponse] =
        await Promise.all([
          fetch(API.offices, {
            method: "GET",
            cache: "no-store",
          }),
          fetch(API.subOffices, {
            method: "GET",
            cache: "no-store",
          }),
        ]);

      const [officeJson, subOfficeJson] = await Promise.all([
        officeResponse.json(),
        subOfficeResponse.json(),
      ]);

      if (!officeResponse.ok || !officeJson.success) {
        throw new Error(
          officeJson.message || "Failed to load offices."
        );
      }

      if (!subOfficeResponse.ok || !subOfficeJson.success) {
        throw new Error(
          subOfficeJson.message ||
            "Failed to load sub-offices."
        );
      }

      setOffices(
        Array.isArray(officeJson.data)
          ? officeJson.data
          : []
      );

      setSubOffices(
        Array.isArray(subOfficeJson.data)
          ? subOfficeJson.data
          : []
      );
    } catch (err) {
      console.error("Load Category Options Error:", err);

      setLoadingError(
        err instanceof Error
          ? err.message
          : "Unable to load offices and sub-offices."
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  useEffect(() => {
    loadOptions();
  }, []);

  // =====================================================
  // ACTIVE OPTIONS
  // =====================================================

  const activeOffices = useMemo(() => {
    return offices.filter(
      (office) => office.is_active === true
    );
  }, [offices]);

  const activeSubOffices = useMemo(() => {
    return subOffices.filter(
      (item) => item.is_active === true
    );
  }, [subOffices]);

  // =====================================================
  // OWNER TYPE
  // =====================================================

  function changeOwnerType(
    type: "office" | "sub_office"
  ) {
    setOwnerType(type);
    setOfficeId("");
    setSubOfficeId("");
    setError("");
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (loadingOptions) {
      setError("Please wait while the office options are loading.");
      return;
    }

    if (loadingError) {
      setError("Unable to load office options. Please retry.");
      return;
    }

    if (!categoryCode.trim()) {
      setError("Category code is required.");
      return;
    }

    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    if (ownerType === "office" && !officeId) {
      setError("Please select an office.");
      return;
    }

    if (ownerType === "sub_office" && !subOfficeId) {
      setError("Please select a sub-office.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        owner_type: ownerType,
        office_id:
          ownerType === "office" ? officeId : "",
        sub_office_id:
          ownerType === "sub_office"
            ? subOfficeId
            : "",
        category_code: categoryCode.trim(),
        category_name: categoryName.trim(),
        description: description.trim(),
        is_active: isActive,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <Layers3 size={25} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {category
                  ? "Edit Account Category"
                  : "Add Account Category"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Assign the category to an office or sub-office.
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
          {/* CATEGORY ASSIGNMENT */}
          <section>
            <div className="mb-4 border-b border-slate-300">
              <h3 className="border-b-2 border-[#6689A5] pb-2 text-sm font-medium text-[#557992]">
                Category Assignment
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* OWNER TYPE */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Assign category to
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      changeOwnerType("office")
                    }
                    className={`rounded-md border px-5 py-2.5 text-xs font-semibold ${
                      ownerType === "office"
                        ? "border-[#6689A5] bg-[#EAF1F6] text-[#557992]"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Office
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      changeOwnerType("sub_office")
                    }
                    className={`rounded-md border px-5 py-2.5 text-xs font-semibold ${
                      ownerType === "sub_office"
                        ? "border-[#6689A5] bg-[#EAF1F6] text-[#557992]"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Sub-office
                  </button>
                </div>
              </div>

              {/* LOADING */}
              {loadingOptions && (
                <div className="sm:col-span-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-4 text-xs text-slate-500">
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Loading offices and sub-offices...
                </div>
              )}

              {/* LOADING ERROR */}
              {!loadingOptions && loadingError && (
                <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-xs text-red-700">
                    {loadingError}
                  </p>

                  <button
                    type="button"
                    onClick={loadOptions}
                    className="mt-2 flex items-center gap-2 text-xs font-semibold text-red-700 hover:underline"
                  >
                    <RefreshCw size={13} />
                    Retry loading options
                  </button>
                </div>
              )}

              {/* OFFICE DROPDOWN */}
              {!loadingOptions &&
                !loadingError &&
                ownerType === "office" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Select Office{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={officeId}
                      onChange={(e) =>
                        setOfficeId(e.target.value)
                      }
                      className={inputClass}
                      required
                      disabled={saving}
                    >
                      <option value="">
                        -- Select Office --
                      </option>

                      {activeOffices.map((office) => (
                        <option
                          key={office.id}
                          value={office.id}
                        >
                          {office.office_code} —{" "}
                          {office.office_name}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {activeOffices.length} active office(s) available
                    </p>

                    {activeOffices.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No active offices found.
                      </p>
                    )}
                  </div>
                )}

              {/* SUB-OFFICE DROPDOWN */}
              {!loadingOptions &&
                !loadingError &&
                ownerType === "sub_office" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Select Sub-office{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={subOfficeId}
                      onChange={(e) =>
                        setSubOfficeId(e.target.value)
                      }
                      className={inputClass}
                      required
                      disabled={saving}
                    >
                      <option value="">
                        -- Select Sub-office --
                      </option>

                      {activeSubOffices.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.sub_office_code
                            ? `${item.sub_office_code} — `
                            : ""}
                          {item.sub_office_name}
                          {item.office_name
                            ? ` (${item.office_name})`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {activeSubOffices.length} active sub-office(s) available
                    </p>

                    {activeSubOffices.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No active sub-offices found.
                      </p>
                    )}
                  </div>
                )}
            </div>
          </section>

          {/* CATEGORY INFORMATION */}
          <section>
            <div className="mb-4 border-b border-slate-300">
              <h3 className="border-b-2 border-[#6689A5] pb-2 text-sm font-medium text-[#557992]">
                Category Information
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* CATEGORY CODE */}
              <div>
                <label className={labelClass}>
                  Category Code{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  value={categoryCode}
                  onChange={(e) =>
                    setCategoryCode(e.target.value)
                  }
                  className={inputClass}
                  placeholder="e.g. PS, MOOE, CO"
                  required
                  disabled={saving}
                />
              </div>

              {/* CATEGORY NAME */}
              <div>
                <label className={labelClass}>
                  Category Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  className={inputClass}
                  placeholder="Enter category name"
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
                    Category status
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Inactive categories cannot be selected for new accounts.
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
              disabled={saving || loadingOptions || !!loadingError}
              className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:opacity-50"
            >
              {saving && (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Saving..."
                : category
                  ? "Update Category"
                  : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}