"use client";

import { useEffect, useState } from "react";
import {
  X,
  Pencil,
  Trash2,
  Save,
  User,
  Loader2,
} from "lucide-react";

interface RATDetailsModalProps {
  open: boolean;
  ratId: string | null;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

interface RATHeader {
  id: string;
  rat_no: string;
  ris_no: string;
  request_date: string | null;

  // Existing requester
  accountable_officer: string | null;

  // Actual accountable officer from lor_releases
  accountable_officer_id: string | null;
  lor_accountable_officer: string | null;

  status: string;
  generated_by_name: string | null;
  generated_at: string | null;
  remarks: string | null;
}

interface RATItem {
  id: string;
  ris_request_item_id: string;
  booklet_registration_id: string;

  form_code: string;
  form_name: string;

  control_no: string;
  series: string;

  beginning_or: number | string;
  ending_or: number | string;
  current_or: number | string | null;

  status: string;
  issued_date: string | null;
}

interface UserOption {
  id: string;
  full_name: string;
}

export default function RATDetailsModal({
  open,
  ratId,
  onClose,
  onSuccess,
}: RATDetailsModalProps) {
  const [header, setHeader] = useState<RATHeader | null>(null);
  const [items, setItems] = useState<RATItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [accountableOfficerId, setAccountableOfficerId] =
    useState("");

  const loadDetails = async () => {
    if (!ratId) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/rat/${ratId}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load RAT details."
        );
      }

      setHeader(data.header);
      setItems(data.items || []);

      setAccountableOfficerId(
        data.header?.accountable_officer_id || ""
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load RAT details."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/rat/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load users."
        );
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load users."
      );
    }
  };

  useEffect(() => {
    if (!open || !ratId) return;

    setEditMode(false);
    loadDetails();
    loadUsers();
  }, [open, ratId]);

  if (!open) return null;

  const handleSave = async () => {
    if (!ratId) return;

    if (!accountableOfficerId) {
      alert("Please select an accountable officer.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/rat/${ratId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountableOfficerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update RAT."
        );
      }

      alert("Accountable officer updated successfully.");

      setEditMode(false);

      await loadDetails();

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update RAT."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ratId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this RAT?\n\n" +
        "This will delete the RAT header, assigned RAT items, " +
        "and LOR release records associated with this RAT."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/rat/${ratId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete RAT."
        );
      }

      alert("RAT deleted successfully.");

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete RAT."
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-PH", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (value: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              RAT Details
            </h2>

            {header && (
              <p className="mt-1 text-sm text-slate-500">
                {header.rat_no}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : !header ? (
            <div className="py-20 text-center text-slate-500">
              RAT details not found.
            </div>
          ) : (
            <div className="space-y-6">

              {/* RAT INFORMATION */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b bg-slate-50 px-5 py-3">
                  <h3 className="font-semibold text-slate-800">
                    RAT Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">
                      RAT No.
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {header.rat_no}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">
                      RIS No.
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {header.ris_no}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Request Date
                    </p>
                    <p className="mt-1 text-slate-700">
                      {formatDateOnly(header.request_date)}
                    </p>
                  </div>

                  {/* ACCOUNTABLE OFFICER */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <div className="flex items-center gap-2">
                      <User
                        size={16}
                        className="text-blue-600"
                      />

                      <p className="text-xs font-medium uppercase text-slate-500">
                        Accountable Officer
                      </p>
                    </div>

                    {editMode ? (
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <select
                          value={accountableOfficerId}
                          onChange={(e) =>
                            setAccountableOfficerId(
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">
                            Select Accountable Officer
                          </option>

                          {users.map((user) => (
                            <option
                              key={user.id}
                              value={user.id}
                            >
                              {user.full_name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Save size={16} />
                          )}

                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(false);
                            setAccountableOfficerId(
                              header.accountable_officer_id || ""
                            );
                          }}
                          disabled={saving}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-800">
                          {header.lor_accountable_officer ||
                            header.accountable_officer ||
                            "-"}
                        </p>

                        <button
                          type="button"
                          onClick={() => setEditMode(true)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Status
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {header.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Generated By
                    </p>

                    <p className="mt-1 text-slate-700">
                      {header.generated_by_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Generated Date
                    </p>

                    <p className="mt-1 text-slate-700">
                      {formatDate(header.generated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ASSIGNED FORMS */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b bg-slate-50 px-5 py-3">
                  <h3 className="font-semibold text-slate-800">
                    Assigned Accountable Forms
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
                      <tr>
                        <th className="px-4 py-3">
                          Form
                        </th>

                        <th className="px-4 py-3">
                          Control No.
                        </th>

                        <th className="px-4 py-3">
                          Series
                        </th>

                        <th className="px-4 py-3">
                          OR Range
                        </th>

                        <th className="px-4 py-3">
                          Current OR
                        </th>

                        <th className="px-4 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-slate-500"
                          >
                            No assigned accountable forms.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800">
                                {item.form_code}
                              </div>

                              <div className="text-xs text-slate-500">
                                {item.form_name}
                              </div>
                            </td>

                            <td className="px-4 py-3 font-medium text-slate-700">
                              {item.control_no}
                            </td>

                            <td className="px-4 py-3 text-slate-700">
                              {item.series}
                            </td>

                            <td className="px-4 py-3 text-slate-700">
                              {item.beginning_or} -{" "}
                              {item.ending_or}
                            </td>

                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {item.current_or ?? "-"}
                            </td>

                            <td className="px-4 py-3">
                              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REMARKS */}
              {header.remarks && (
                <div className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b bg-slate-50 px-5 py-3">
                    <h3 className="font-semibold text-slate-800">
                      Remarks
                    </h3>
                  </div>

                  <div className="p-5 text-sm text-slate-700">
                    {header.remarks}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || loading || !header}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            Delete RAT
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}