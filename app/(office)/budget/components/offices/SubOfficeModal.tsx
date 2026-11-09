
"use client";

import { useEffect, useState } from "react";
import {
  X,
  Building,
  Building2,
  Save,
  FileText,
  ChevronDown,
} from "lucide-react";

import type { SubOffice, Office } from "./office-types";

interface Props {
  subOffice: SubOffice | null;
  offices: Office[];
  onClose: () => void;
  onSave: (data: {
    office_id: string;
    sub_office_code: string;
    sub_office_name: string;
    description: string;
    is_active: boolean;
  }) => Promise<void>;
}

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

export default function SubOfficeModal({
  subOffice,
  offices,
  onClose,
  onSave,
}: Props) {
  const [officeId, setOfficeId] = useState("");
  const [subOfficeCode, setSubOfficeCode] = useState("");
  const [subOfficeName, setSubOfficeName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOfficeId(
      subOffice?.office_id
        ? String(subOffice.office_id)
        : ""
    );

    setSubOfficeCode(subOffice?.sub_office_code ?? "");
    setSubOfficeName(subOffice?.sub_office_name ?? "");
    setDescription(subOffice?.description ?? "");
    setIsActive(subOffice?.is_active ?? true);
    setError("");
  }, [subOffice]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (!officeId) {
      setError("Please select an office.");
      return;
    }

    if (!subOfficeName.trim()) {
      setError("Sub-office name is required.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        office_id: officeId,
        sub_office_code: subOfficeCode.trim(),
        sub_office_name: subOfficeName.trim(),
        description: description.trim(),
        is_active: isActive,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save sub-office."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-6">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <Building size={28} />
            </div>

            <div>
              <h2 className="text-lg font-medium tracking-wide text-slate-800 sm:text-xl">
                {subOffice
                  ? "EDIT SUB-OFFICE"
                  : "REGISTER NEW SUB-OFFICE"}
              </h2>

              <p className="text-xs text-slate-500">
                Budget Management System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-2 text-slate-500 transition hover:bg-white/60 hover:text-slate-800 disabled:opacity-50"
            title="Close"
          >
            <X size={21} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div className="px-5 py-6 sm:px-8">

            {/* SECTION HEADER */}
            <div className="mb-8 flex items-center justify-between border-b border-slate-300">
              <div className="border-b-2 border-[#6689A5] px-4 py-3 text-sm font-medium text-[#557992]">
                Sub-office Information
              </div>

              <span className="pb-3 text-[11px] text-slate-400">
                Fields marked with * are required
              </span>
            </div>

            {/* BASIC INFORMATION */}
            <div className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">

              {/* PARENT OFFICE */}
              <div className="md:col-span-2">
                <label className={labelClass}>
                  Parent Office *
                </label>

                <div className="relative">
                  <select
                    value={officeId}
                    onChange={(e) => setOfficeId(e.target.value)}
                    required
                    className={`${inputClass} appearance-none pr-8`}
                  >
                    <option value="">
                      Select parent office
                    </option>

                    {offices
                      .filter(
                        (office) =>
                          office.is_active ||
                          String(office.id) === officeId
                      )
                      .map((office) => (
                        <option
                          key={office.id}
                          value={String(office.id)}
                        >
                          {office.office_code} - {office.office_name}
                        </option>
                      ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-1 top-3 text-slate-400"
                  />
                </div>
              </div>

              {/* SUB-OFFICE CODE - OPTIONAL */}
              <div>
                <label className={labelClass}>
                  Sub-office Code
                  <span className="ml-1 text-slate-400">
                    (Optional)
                  </span>
                </label>

                <input
                  value={subOfficeCode}
                  onChange={(e) =>
                    setSubOfficeCode(e.target.value)
                  }
                  maxLength={50}
                  placeholder="Enter sub-office code (optional)"
                  className={inputClass}
                />
              </div>

              {/* SUB-OFFICE NAME */}
              <div>
                <label className={labelClass}>
                  Sub-office Name *
                </label>

                <div className="relative">
                  <input
                    value={subOfficeName}
                    onChange={(e) =>
                      setSubOfficeName(e.target.value)
                    }
                    required
                    maxLength={255}
                    placeholder="Enter sub-office name"
                    className={`${inputClass} pr-7`}
                  />

                  <Building2
                    size={15}
                    className="pointer-events-none absolute right-1 top-3 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-6 mt-10 flex items-center justify-between border-b border-slate-300 pb-3">
              <div className="flex items-center gap-2">
                <FileText
                  size={18}
                  className="text-[#6689A5]"
                />

                <h3 className="text-sm font-semibold text-slate-700">
                  Description
                </h3>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Sub-office Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={4}
                placeholder="Enter sub-office description..."
                className="w-full resize-y rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#829FB5] focus:ring-1 focus:ring-[#829FB5]"
              />
            </div>

            {/* ACTIVE STATUS */}
            {subOffice && (
              <div className="mt-7 border-t border-slate-200 pt-5">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) =>
                      setIsActive(e.target.checked)
                    }
                    className="h-4 w-4 accent-[#6689A5]"
                  />

                  <div>
                    <p className="text-xs font-medium text-slate-700">
                      Active Sub-office
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Enable or disable this sub-office in the system.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-8">
            <p className="text-xs text-slate-400">
              Please review the sub-office information before saving.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : subOffice
                    ? "Update Sub-office"
                    : "Save Sub-office"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
