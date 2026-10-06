"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { FilePlus2 } from "lucide-react";
import BarangayRATItems, {
    BookletOption,
    RATBookletItem,
} from "./BarangayRATItems";

type BarangayUserOption = {
    value: string;
    label: string;
    barangay_name?: string;
    full_name?: string;
};

type Props = {
    onCreated: () => void;
};

export default function BarangayRATCreate({
    onCreated,
}: Props) {
    const [users, setUsers] = useState<
        BarangayUserOption[]
    >([]);

    const [booklets, setBooklets] = useState<
        BookletOption[]
    >([]);

    const [selectedUser, setSelectedUser] =
        useState<BarangayUserOption | null>(null);

    // Always start with one empty booklet row
    const [items, setItems] = useState<
        RATBookletItem[]
    >([
        {
            booklet_id: "",
        },
    ]);

    const [loadingUsers, setLoadingUsers] =
        useState(false);

    const [loadingBooklets, setLoadingBooklets] =
        useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadUsers();
        loadBooklets();
    }, []);

    async function loadUsers() {
        try {
            setLoadingUsers(true);
            setError("");

            const response = await axios.get(
                "/api/barangay-rat/users"
            );

            if (response.data?.success) {
                setUsers(
                    response.data.users.map(
                        (user: any) => ({
                            value: user.id,
                            label: user.display_name,
                            barangay_name:
                                user.barangay?.name,
                            full_name:
                                user.full_name,
                        })
                    )
                );
            }
        } catch (error) {
            console.error(
                "Failed to load barangay users:",
                error
            );

            setError(
                "Failed to load Barangay Users."
            );
        } finally {
            setLoadingUsers(false);
        }
    }

    async function loadBooklets() {
        try {
            setLoadingBooklets(true);
            setError("");

            const response = await axios.get(
                "/api/barangay-rat/booklets"
            );

            if (response.data?.success) {
                setBooklets(
                    response.data.booklets.map(
                        (booklet: any) => ({
                            value: booklet.id,

                            label:
                                booklet.form_code ??
                                booklet.control_no ??
                                `Booklet ${booklet.id}`,

                            control_no:
                                booklet.control_no,

                            form_code:
                                booklet.form_code,

                            fiscal_year:
                                booklet.fiscal_year,

                            series:
                                booklet.series,

                            beginning_or:
                                Number(
                                    booklet.beginning_or
                                ),

                            ending_or:
                                Number(
                                    booklet.ending_or
                                ),

                            status:
                                booklet.status,
                        })
                    )
                );
            }
        } catch (error) {
            console.error(
                "Failed to load booklets:",
                error
            );

            setError(
                "Failed to load booklets."
            );
        } finally {
            setLoadingBooklets(false);
        }
    }

    function handleAddItem() {
        setItems((current) => [
            ...current,
            {
                booklet_id: "",
            },
        ]);

        setError("");
        setSuccess("");
    }

    function handleRemoveItem(index: number) {
        setItems((current) => {
            const updated = current.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            );

            // Always keep at least one row
            if (updated.length === 0) {
                return [
                    {
                        booklet_id: "",
                    },
                ];
            }

            return updated;
        });

        setError("");
        setSuccess("");
    }

    function handleUpdateItem(
        index: number,
        bookletId: string
    ) {
        setItems((current) =>
            current.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                              ...item,
                              booklet_id:
                                  bookletId,
                          }
                        : item
            )
        );

        setError("");
        setSuccess("");
    }

    function handleReset() {
        setSelectedUser(null);

        setItems([
            {
                booklet_id: "",
            },
        ]);

        setError("");
        setSuccess("");
    }

    async function handleCreate() {
        setError("");
        setSuccess("");

        if (!selectedUser) {
            setError(
                "Please select a Barangay User."
            );

            return;
        }

        if (items.length === 0) {
            setError(
                "Please add at least one booklet."
            );

            return;
        }

        const bookletIds = items.map(
            (item) => item.booklet_id
        );

        if (bookletIds.some((id) => !id)) {
            setError(
                "Please select a booklet for every row."
            );

            return;
        }

        const uniqueIds = new Set(bookletIds);

        if (
            uniqueIds.size !==
            bookletIds.length
        ) {
            setError(
                "A booklet cannot be selected more than once."
            );

            return;
        }

        try {
            setSaving(true);

            const response = await axios.post(
                "/api/barangay-rat",
                {
                    barangay_user_id:
                        selectedUser.value,

                    booklet_ids:
                        bookletIds,
                }
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ??
                        "Failed to create RAT."
                );
            }

            /*
             * RAT successfully created.
             *
             * Reload the entire page so:
             * - Created RAT list refreshes
             * - Booklet list refreshes
             * - Issued booklet disappears
             * - Form resets
             * - All data is loaded fresh
             */
            window.location.reload();
        } catch (error: any) {
            console.error(
                "Create Barangay RAT error:",
                error
            );

            setError(
                error?.response?.data
                    ?.message ??
                    error?.message ??
                    "Failed to create Barangay RAT."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <FilePlus2 size={21} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        Create RAT
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Assign multiple booklets to one
                        Barangay User.
                    </p>
                </div>
            </div>

            <div className="space-y-5 p-5">
                {/* Error */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                {/* Barangay User */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Barangay User
                    </label>

                    <Select<BarangayUserOption>
                        instanceId="barangay-rat-user"
                        value={selectedUser}
                        options={users}
                        isLoading={loadingUsers}
                        isDisabled={saving}
                        isSearchable
                        isClearable
                        placeholder={
                            loadingUsers
                                ? "Loading Barangay Users..."
                                : "Select Barangay User..."
                        }
                        noOptionsMessage={() =>
                            "No active Barangay Users found."
                        }
                        onChange={(option) =>
                            setSelectedUser(
                                option
                            )
                        }
                        menuPortalTarget={
                            typeof document !==
                            "undefined"
                                ? document.body
                                : undefined
                        }
                        menuPosition="fixed"
                        menuPlacement="auto"
                        styles={{
                            menuPortal: (
                                base
                            ) => ({
                                ...base,
                                zIndex: 99999,
                            }),
                        }}
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                        The selected Barangay User
                        will be assigned to all
                        booklets in this RAT.
                    </p>
                </div>

                {/* Booklets */}
                <BarangayRATItems
                    items={items}
                    booklets={booklets}
                    loadingBooklets={
                        loadingBooklets
                    }
                    saving={saving}
                    onAdd={handleAddItem}
                    onRemove={handleRemoveItem}
                    onUpdate={
                        handleUpdateItem
                    }
                />

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={saving}
                        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <FilePlus2
                                    size={18}
                                />
                                Create RAT
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}