
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Network,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Power,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

import OfficeModal from "./OfficeModal";
import SubOfficeModal from "./SubOfficeModal";
import type { Office, SubOffice } from "./office-types";

const API = {
  offices: "/budget/api/offices",
  subOffices: "/budget/api/sub_offices",
};

async function getResponseData(response: Response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [subOffices, setSubOffices] = useState<SubOffice[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [officeSearch, setOfficeSearch] = useState("");
  const [subOfficeSearch, setSubOfficeSearch] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("All");

  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showSubOfficeModal, setShowSubOfficeModal] = useState(false);

  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [editingSubOffice, setEditingSubOffice] =
    useState<SubOffice | null>(null);

  const [officeExpanded, setOfficeExpanded] = useState(true);
  const [subOfficeExpanded, setSubOfficeExpanded] = useState(true);

  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [officeResponse, subOfficeResponse] = await Promise.all([
        fetch(API.offices, { cache: "no-store" }),
        fetch(API.subOffices, { cache: "no-store" }),
      ]);

      const officeJson = await getResponseData(officeResponse);
      const subOfficeJson = await getResponseData(subOfficeResponse);

      setOffices(officeJson.data || []);
      setSubOffices(subOfficeJson.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOffices = useMemo(() => {
    const keyword = officeSearch.toLowerCase();

    return offices.filter((office) =>
      [
        office.office_code,
        office.office_name,
        office.office_description,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      )
    );
  }, [offices, officeSearch]);

  const filteredSubOffices = useMemo(() => {
    const keyword = subOfficeSearch.toLowerCase();

    return subOffices.filter((subOffice) => {
      const matchesOffice =
        selectedOffice === "All" ||
        String(subOffice.office_id) === selectedOffice;

      const matchesSearch = [
        subOffice.sub_office_code,
        subOffice.sub_office_name,
        subOffice.office_name,
        subOffice.description,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );

      return matchesOffice && matchesSearch;
    });
  }, [subOffices, subOfficeSearch, selectedOffice]);

  const activeOffices = offices.filter((item) => item.is_active).length;
  const activeSubOffices = subOffices.filter(
    (item) => item.is_active
  ).length;

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  // SAVE OFFICE
  const saveOffice = async (data: {
    office_code: string;
    office_name: string;
    office_description: string;
    is_active: boolean;
  }) => {
    const editing = Boolean(editingOffice);

    const response = await fetch(
      editing
        ? `${API.offices}/${editingOffice!.id}`
        : API.offices,
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    await getResponseData(response);

    setShowOfficeModal(false);
    setEditingOffice(null);

    await loadData();

    notify(
      editing
        ? "Office updated successfully."
        : "Office created successfully."
    );
  };

  // SAVE SUB-OFFICE
  const saveSubOffice = async (data: {
    office_id: string;
    sub_office_code: string;
    sub_office_name: string;
    description: string;
    is_active: boolean;
  }) => {
    const editing = Boolean(editingSubOffice);

    const response = await fetch(
      editing
        ? `${API.subOffices}/${editingSubOffice!.id}`
        : API.subOffices,
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    await getResponseData(response);

    setShowSubOfficeModal(false);
    setEditingSubOffice(null);

    await loadData();

    notify(
      editing
        ? "Sub-office updated successfully."
        : "Sub-office created successfully."
    );
  };

  // TOGGLE OFFICE STATUS
  const toggleOffice = async (office: Office) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${
        office.is_active ? "deactivate" : "activate"
      } ${office.office_name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API.offices}/${office.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          office_code: office.office_code,
          office_name: office.office_name,
          office_description: office.office_description || "",
          is_active: !office.is_active,
        }),
      });

      await getResponseData(response);

      await loadData();
      notify("Office status updated.");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Update failed."
      );
    }
  };

  // TOGGLE SUB-OFFICE STATUS
  const toggleSubOffice = async (item: SubOffice) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${
        item.is_active ? "deactivate" : "activate"
      } ${item.sub_office_name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API.subOffices}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          office_id: item.office_id,
          sub_office_code: item.sub_office_code,
          sub_office_name: item.sub_office_name,
          description: item.description || "",
          is_active: !item.is_active,
        }),
      });

      await getResponseData(response);

      await loadData();
      notify("Sub-office status updated.");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Update failed."
      );
    }
  };

  const statusBadge = (active: boolean) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );

  const inputClass =
    "rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#829FB5]";

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-6">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            Budget Management
            <span>/</span>
            Settings
            <span>/</span>
            <span className="text-slate-600">Offices</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            Office Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage municipal offices and their corresponding sub-offices.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#DCE3E9] bg-white p-4">
          <p className="text-xs text-slate-400">Active Offices</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">
            {activeOffices}
          </p>
        </div>

        <div className="rounded-lg border border-[#DCE3E9] bg-white p-4">
          <p className="text-xs text-slate-400">Active Sub-offices</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">
            {activeSubOffices}
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* NOTICE */}
      {notice && (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          {notice}
        </div>
      )}

      {/* OFFICE TABLE */}
      <section className="mb-6 overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3E9] p-4">
          <button
            type="button"
            onClick={() => setOfficeExpanded(!officeExpanded)}
            className="flex items-center gap-3 text-left"
          >
            <div className="rounded-md bg-[#EAF1F6] p-2 text-[#6689A5]">
              <Building2 size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Offices
              </h2>
              <p className="text-[11px] text-slate-400">
                Main municipal offices
              </p>
            </div>

            {officeExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                value={officeSearch}
                onChange={(e) => setOfficeSearch(e.target.value)}
                placeholder="Search offices..."
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingOffice(null);
                setShowOfficeModal(true);
              }}
              className="flex items-center gap-2 rounded-md bg-[#6689A5] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#557992]"
            >
              <Plus size={15} />
              Add Office
            </button>
          </div>
        </div>

        {officeExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-[#F3F6F8] text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Office Code</th>
                  <th className="px-5 py-3 font-semibold">Office Name</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Sub-offices
                  </th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400"
                    >
                      <Loader2
                        size={20}
                        className="mx-auto mb-2 animate-spin"
                      />
                      Loading offices...
                    </td>
                  </tr>
                ) : filteredOffices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No office records found.
                    </td>
                  </tr>
                ) : (
                  filteredOffices.map((office) => (
                    <tr
                      key={office.id}
                      className="transition hover:bg-[#F8FAFC]"
                    >
                      <td className="px-5 py-3 font-semibold text-[#6689A5]">
                        {office.office_code}
                      </td>

                      <td className="px-5 py-3 text-xs font-medium text-slate-700">
                        {office.office_name}
                      </td>

                      <td className="max-w-[250px] truncate px-5 py-3 text-xs text-slate-500">
                        {office.office_description || "—"}
                      </td>

                      <td className="px-5 py-3 text-center text-xs text-slate-600">
                        {office.sub_office_count ?? 0}
                      </td>

                      <td className="px-5 py-3 text-center">
                        {statusBadge(office.is_active)}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            title="Edit office"
                            onClick={() => {
                              setEditingOffice(office);
                              setShowOfficeModal(true);
                            }}
                            className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-[#EAF1F6] hover:text-[#557992]"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            title={
                              office.is_active
                                ? "Deactivate office"
                                : "Activate office"
                            }
                            onClick={() => toggleOffice(office)}
                            className={`rounded-md border border-slate-200 p-2 ${
                              office.is_active
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Power size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {officeExpanded && (
          <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
            Showing {filteredOffices.length} of {offices.length} offices
          </div>
        )}
      </section>

      {/* SUB-OFFICE TABLE */}
      <section className="overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3E9] p-4">
          <button
            type="button"
            onClick={() => setSubOfficeExpanded(!subOfficeExpanded)}
            className="flex items-center gap-3 text-left"
          >
            <div className="rounded-md bg-[#EAF1F6] p-2 text-[#6689A5]">
              <Network size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Sub-offices
              </h2>
              <p className="text-[11px] text-slate-400">
                Offices under each main office
              </p>
            </div>

            {subOfficeExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                value={subOfficeSearch}
                onChange={(e) => setSubOfficeSearch(e.target.value)}
                placeholder="Search sub-offices..."
                className={inputClass}
              />
            </div>

            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#829FB5]"
            >
              <option value="All">All Offices</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.office_name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setEditingSubOffice(null);
                setShowSubOfficeModal(true);
              }}
              disabled={!offices.some((office) => office.is_active)}
              className="flex items-center gap-2 rounded-md bg-[#6689A5] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} />
              Add Sub-office
            </button>
          </div>
        </div>

        {subOfficeExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-[#F3F6F8] text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    Sub-office Code
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    Sub-office Name
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    Parent Office
                  </th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400"
                    >
                      <Loader2
                        size={20}
                        className="mx-auto mb-2 animate-spin"
                      />
                      Loading sub-offices...
                    </td>
                  </tr>
                ) : filteredSubOffices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No sub-office records found.
                    </td>
                  </tr>
                ) : (
                  filteredSubOffices.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#F8FAFC]"
                    >
                      <td className="px-5 py-3 font-semibold text-[#6689A5]">
                        {item.sub_office_code}
                      </td>

                      <td className="px-5 py-3 text-xs font-medium text-slate-700">
                        {item.sub_office_name}
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-600">
                        {item.office_name || "—"}
                      </td>

                      <td className="max-w-[220px] truncate px-5 py-3 text-xs text-slate-500">
                        {item.description || "—"}
                      </td>

                      <td className="px-5 py-3 text-center">
                        {statusBadge(item.is_active)}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            title="Edit sub-office"
                            onClick={() => {
                              setEditingSubOffice(item);
                              setShowSubOfficeModal(true);
                            }}
                            className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-[#EAF1F6] hover:text-[#557992]"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            title={
                              item.is_active
                                ? "Deactivate sub-office"
                                : "Activate sub-office"
                            }
                            onClick={() => toggleSubOffice(item)}
                            className={`rounded-md border border-slate-200 p-2 ${
                              item.is_active
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Power size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {subOfficeExpanded && (
          <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
            Showing {filteredSubOffices.length} of {subOffices.length} sub-offices
          </div>
        )}
      </section>

      {/* OFFICE MODAL */}
      {showOfficeModal && (
        <OfficeModal
          office={editingOffice}
          onClose={() => {
            setShowOfficeModal(false);
            setEditingOffice(null);
          }}
          onSave={saveOffice}
        />
      )}

      {/* SUB-OFFICE MODAL */}
      {showSubOfficeModal && (
        <SubOfficeModal
          subOffice={editingSubOffice}
          offices={offices}
          onClose={() => {
            setShowSubOfficeModal(false);
            setEditingSubOffice(null);
          }}
          onSave={saveSubOffice}
        />
      )}
    </div>
  );
}
