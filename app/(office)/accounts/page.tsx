"use client";

import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import Swal from "sweetalert2";

type Account = {
    id: string;
    parent_id: string | null;
    account_code: string | null;
    account_name: string;
    class_name: string | null;
    title_name: string | null;
    type_name: string | null;
    account_level: number | null;
    sort_order: number | null;
    is_postable: boolean | null;
    is_active: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    parent_code?: string | null;
    parent_name?: string | null;
};

type AccountForm = {
    id?: string;
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

const EMPTY_FORM: AccountForm = {
    parent_id: "",
    account_code: "",
    account_name: "",
    class_name: "",
    title_name: "",
    type_name: "",
    account_level: "",
    sort_order: "",
    is_postable: false,
    is_active: true,
};

const PAGE_SIZE = 10;

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>(
        []
    );

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [form, setForm] =
        useState<AccountForm>(EMPTY_FORM);

    const [editing, setEditing] =
        useState(false);

    /* =========================================================
       LOAD ACCOUNTS
    ========================================================= */

    const loadAccounts = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch(
                "/api/accounts",
                {
                    cache: "no-store",
                }
            );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                        "Failed to load accounts."
                );
            }

            setAccounts(
                Array.isArray(result.data)
                    ? result.data
                    : []
            );
        } catch (error: any) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Unable to Load Accounts",
                text:
                    error?.message ||
                    "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    /* =========================================================
       SEARCH
    ========================================================= */

    const filteredAccounts = useMemo(() => {
        const keyword =
            search.trim().toLowerCase();

        if (!keyword) {
            return accounts;
        }

        return accounts.filter(
            (account) => {
                return (
                    (
                        account.account_code ||
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword) ||

                    account.account_name
                        .toLowerCase()
                        .includes(keyword) ||

                    (
                        account.parent_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword) ||

                    (
                        account.parent_code ||
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword) ||

                    (
                        account.class_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword) ||

                    (
                        account.title_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword) ||

                    (
                        account.type_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(keyword)
                );
            }
        );
    }, [accounts, search]);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredAccounts.length /
                PAGE_SIZE
        )
    );

    const paginatedAccounts =
        useMemo(() => {
            const start =
                (page - 1) *
                PAGE_SIZE;

            return filteredAccounts.slice(
                start,
                start + PAGE_SIZE
            );
        }, [
            filteredAccounts,
            page,
        ]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    /* =========================================================
       FORM HELPERS
    ========================================================= */

    function updateForm(
        field: keyof AccountForm,
        value: string | boolean
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function clearForm() {
        setForm(EMPTY_FORM);
        setEditing(false);
    }

    /* =========================================================
       ADD
    ========================================================= */

    function handleAddNew() {
        clearForm();

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    /* =========================================================
       EDIT
    ========================================================= */

    function handleEdit(
        account: Account
    ) {
        setEditing(true);

        setForm({
            id: account.id,

            parent_id:
                account.parent_id || "",

            account_code:
                account.account_code ||
                "",

            account_name:
                account.account_name ||
                "",

            class_name:
                account.class_name ||
                "",

            title_name:
                account.title_name ||
                "",

            type_name:
                account.type_name ||
                "",

            account_level:
                account.account_level !==
                    null &&
                account.account_level !==
                    undefined
                    ? String(
                          account.account_level
                      )
                    : "",

            sort_order:
                account.sort_order !==
                    null &&
                account.sort_order !==
                    undefined
                    ? String(
                          account.sort_order
                      )
                    : "",

            is_postable:
                Boolean(
                    account.is_postable
                ),

            is_active:
                account.is_active !==
                false,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    /* =========================================================
       SAVE
    ========================================================= */

    async function handleSubmit(
        event: FormEvent
    ) {
        event.preventDefault();

        if (!form.account_name.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Account Name Required",
                text:
                    "Please enter an account name.",
            });

            return;
        }

        if (
            form.id &&
            form.parent_id === form.id
        ) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Parent",
                text:
                    "An account cannot be its own parent.",
            });

            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...(form.id
                    ? { id: form.id }
                    : {}),

                parent_id:
                    form.parent_id ||
                    null,

                account_code:
                    form.account_code.trim() ||
                    null,

                account_name:
                    form.account_name.trim(),

                class_name:
                    form.class_name.trim() ||
                    null,

                title_name:
                    form.title_name.trim() ||
                    null,

                type_name:
                    form.type_name.trim() ||
                    null,

                account_level:
                    form.account_level ===
                    ""
                        ? null
                        : Number(
                              form.account_level
                          ),

                sort_order:
                    form.sort_order ===
                    ""
                        ? null
                        : Number(
                              form.sort_order
                          ),

                is_postable:
                    form.is_postable,

                is_active:
                    form.is_active,
            };

            const response = await fetch(
                form.id
                    ? `/api/accounts/${form.id}`
                    : "/api/accounts",
                {
                    method: form.id
                        ? "PUT"
                        : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        payload
                    ),
                }
            );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                        "Failed to save account."
                );
            }

            await loadAccounts();

            Swal.fire({
                icon: "success",
                title: form.id
                    ? "Account Updated"
                    : "Account Added",
                text: form.id
                    ? "Account updated successfully."
                    : "Account added successfully.",
                timer: 1400,
                showConfirmButton: false,
            });

            clearForm();
        } catch (error: any) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Unable to Save",
                text:
                    error?.message ||
                    "Something went wrong.",
            });
        } finally {
            setSaving(false);
        }
    }

    /* =========================================================
       DEACTIVATE
    ========================================================= */

    async function handleDelete(
        account: Account
    ) {
        const result =
            await Swal.fire({
                icon: "warning",
                title: "Deactivate Account?",
                html: `
                    <div>
                        <strong>
                            ${escapeHtml(
                                account.account_name
                            )}
                        </strong>
                        ${
                            account.account_code
                                ? `<br><small>${escapeHtml(
                                      account.account_code
                                  )}</small>`
                                : ""
                        }
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText:
                    "Deactivate",
                cancelButtonText:
                    "Cancel",
                confirmButtonColor:
                    "#dc2626",
            });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/accounts/${account.id}`,
                {
                    method: "DELETE",
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                let message =
                    data.message ||
                    "Unable to deactivate account.";

                if (
                    Array.isArray(
                        data.children
                    )
                ) {
                    message +=
                        "\n\nActive child accounts:\n" +
                        data.children
                            .map(
                                (
                                    child: Account
                                ) =>
                                    `${child.account_code || ""} - ${child.account_name}`
                            )
                            .join("\n");
                }

                throw new Error(message);
            }

            await loadAccounts();

            Swal.fire({
                icon: "success",
                title:
                    "Account Deactivated",
                timer: 1300,
                showConfirmButton: false,
            });

            if (
                form.id === account.id
            ) {
                clearForm();
            }
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title:
                    "Unable to Deactivate",
                text:
                    error?.message ||
                    "Something went wrong.",
            });
        }
    }

    /* =========================================================
       ACTIVATE
    ========================================================= */

    async function handleActivate(
        account: Account
    ) {
        try {
            const response = await fetch(
                `/api/accounts/${account.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        id: account.id,

                        parent_id:
                            account.parent_id,

                        account_code:
                            account.account_code,

                        account_name:
                            account.account_name,

                        class_name:
                            account.class_name,

                        title_name:
                            account.title_name,

                        type_name:
                            account.type_name,

                        account_level:
                            account.account_level,

                        sort_order:
                            account.sort_order,

                        is_postable:
                            account.is_postable,

                        is_active: true,
                    }),
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Unable to activate account."
                );
            }

            await loadAccounts();

            Swal.fire({
                icon: "success",
                title:
                    "Account Activated",
                timer: 1300,
                showConfirmButton: false,
            });
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title:
                    "Unable to Activate",
                text:
                    error?.message ||
                    "Something went wrong.",
            });
        }
    }

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="mx-auto max-w-[1600px]">

                {/* HEADER */}

                <div className="mb-4">

                    <h1 className="text-xl font-bold text-slate-900">
                        Accounts
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage the Chart of Accounts
                    </p>

                </div>

                {/* =================================================
                   TWO COLUMN LAYOUT
                ================================================= */}

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">

                    {/* =================================================
                       LEFT - FORM
                    ================================================= */}

                    <div className="h-fit rounded-xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-5 py-4">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        {editing
                                            ? "Edit Account"
                                            : "New Account"}
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {editing
                                            ? "Update account information"
                                            : "Create a new account"}
                                    </p>

                                </div>

                                {editing && (
                                    <button
                                        type="button"
                                        onClick={
                                            clearForm
                                        }
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        New
                                    </button>
                                )}

                            </div>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-4 p-5"
                        >

                            {/* CODE */}

                            <Field label="Account Code">

                                <input
                                    type="text"
                                    value={
                                        form.account_code
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        updateForm(
                                            "account_code",
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. 1-01-01"
                                    className={
                                        inputClass
                                    }
                                />

                            </Field>

                            {/* NAME */}

                            <Field
                                label="Account Name"
                                required
                            >

                                <input
                                    type="text"
                                    value={
                                        form.account_name
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        updateForm(
                                            "account_name",
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Account name"
                                    className={
                                        inputClass
                                    }
                                />

                            </Field>

                            {/* PARENT */}

                            <Field label="Parent Account">

                                <select
                                    value={
                                        form.parent_id
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        updateForm(
                                            "parent_id",
                                            e.target
                                                .value
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                >

                                    <option value="">
                                        No Parent
                                    </option>

                                    {accounts
                                        .filter(
                                            (
                                                account
                                            ) =>
                                                account.id !==
                                                form.id &&
                                                account.is_active !==
                                                    false
                                        )
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                (
                                                    a.account_code ||
                                                    ""
                                                ).localeCompare(
                                                    b.account_code ||
                                                        ""
                                                )
                                        )
                                        .map(
                                            (
                                                account
                                            ) => (
                                                <option
                                                    key={
                                                        account.id
                                                    }
                                                    value={
                                                        account.id
                                                    }
                                                >
                                                    {account.account_code
                                                        ? `${account.account_code} - `
                                                        : ""}
                                                    {
                                                        account.account_name
                                                    }
                                                </option>
                                            )
                                        )}

                                </select>

                            </Field>

                            {/* CLASS / TITLE */}

                            <div className="grid grid-cols-2 gap-3">

                                <Field label="Class">

                                    <input
                                        type="text"
                                        value={
                                            form.class_name
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            updateForm(
                                                "class_name",
                                                e.target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />

                                </Field>

                                <Field label="Title">

                                    <input
                                        type="text"
                                        value={
                                            form.title_name
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            updateForm(
                                                "title_name",
                                                e.target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />

                                </Field>

                            </div>

                            {/* TYPE */}

                            <Field label="Type">

                                <input
                                    type="text"
                                    value={
                                        form.type_name
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        updateForm(
                                            "type_name",
                                            e.target
                                                .value
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />

                            </Field>

                            {/* LEVEL / SORT */}

                            <div className="grid grid-cols-2 gap-3">

                                <Field label="Level">

                                    <input
                                        type="number"
                                        value={
                                            form.account_level
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            updateForm(
                                                "account_level",
                                                e.target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />

                                </Field>

                                <Field label="Sort Order">

                                    <input
                                        type="number"
                                        value={
                                            form.sort_order
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            updateForm(
                                                "sort_order",
                                                e.target
                                                    .value
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />

                                </Field>

                            </div>

                            {/* TOGGLES */}

                            <div className="flex gap-5 border-t border-slate-100 pt-4">

                                <Toggle
                                    checked={
                                        form.is_postable
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "is_postable",
                                            value
                                        )
                                    }
                                    label="Postable"
                                />

                                <Toggle
                                    checked={
                                        form.is_active
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "is_active",
                                            value
                                        )
                                    }
                                    label="Active"
                                />

                            </div>

                            {/* BUTTONS */}

                            <div className="flex gap-2 border-t border-slate-100 pt-4">

                                <button
                                    type="button"
                                    onClick={
                                        clearForm
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="
                                        flex-1
                                        rounded-lg
                                        border
                                        border-slate-300
                                        bg-white
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        hover:bg-slate-50
                                    "
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="
                                        flex-1
                                        rounded-lg
                                        bg-blue-600
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        hover:bg-blue-700
                                        disabled:opacity-50
                                    "
                                >
                                    {saving
                                        ? "Saving..."
                                        : editing
                                        ? "Update"
                                        : "Add Account"}
                                </button>

                            </div>

                        </form>
                    </div>

                    {/* =================================================
                       RIGHT - TABLE
                    ================================================= */}

                    <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">

                        {/* TABLE HEADER */}

                        <div className="border-b border-slate-200 px-5 py-4">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Accounts List
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {filteredAccounts.length.toLocaleString()} account
                                        {filteredAccounts.length !==
                                        1
                                            ? "s"
                                            : ""}
                                    </p>

                                </div>

                                {/* SEARCH */}

                                <div className="relative w-full sm:w-80">

                                    <svg
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle
                                            cx="11"
                                            cy="11"
                                            r="7"
                                        />

                                        <path d="m20 20-3.5-3.5" />
                                    </svg>

                                    <input
                                        type="text"
                                        value={
                                            search
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSearch(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Search accounts..."
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            py-2
                                            pl-9
                                            pr-3
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                        "
                                    />

                                </div>

                            </div>

                        </div>

                        {/* TABLE */}

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[850px]">

                                <thead>

                                    <tr className="border-b border-slate-200 bg-slate-50">

                                        <Th>
                                            Account Code
                                        </Th>

                                        <Th>
                                            Account Name
                                        </Th>

                                        <Th>
                                            Parent
                                        </Th>

                                        <Th center>
                                            Level
                                        </Th>

                                        <Th center>
                                            Postable
                                        </Th>

                                        <Th center>
                                            Status
                                        </Th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {loading ? (
                                        <LoadingRows />
                                    ) : paginatedAccounts.length ===
                                      0 ? (
                                        <tr>

                                            <td
                                                colSpan={7}
                                                className="px-5 py-16 text-center"
                                            >

                                                <div className="text-sm font-semibold text-slate-700">
                                                    No accounts found
                                                </div>

                                                <div className="mt-1 text-xs text-slate-400">
                                                    Try another search.
                                                </div>

                                            </td>

                                        </tr>
                                    ) : (
                                        paginatedAccounts.map(
                                            (
                                                account
                                            ) => (
                                                <tr
                                                    key={
                                                        account.id
                                                    }
                                                    className="
                                                        border-b
                                                        border-slate-100
                                                        hover:bg-slate-50
                                                    "
                                                >

                                                    {/* CODE */}

                                                    <td className="px-4 py-3">

                                                        <span className="font-mono text-xs font-semibold text-slate-700">
                                                            {account.account_code ||
                                                                "—"}
                                                        </span>

                                                    </td>

                                                    {/* NAME */}

                                                    <td className="px-4 py-3">

                                                        <div
                                                            className="text-sm font-semibold text-slate-900"
                                                            style={{
                                                                paddingLeft:
                                                                    Math.min(
                                                                        Number(
                                                                            account.account_level ||
                                                                                0
                                                                        ) *
                                                                            12,
                                                                        36
                                                                    ),
                                                            }}
                                                        >
                                                            {
                                                                account.account_name
                                                            }
                                                        </div>

                                                    </td>

                                                    {/* PARENT */}

                                                    <td className="px-4 py-3">

                                                        {account.parent_name ? (
                                                            <div>

                                                                {account.parent_code && (
                                                                    <span className="mr-1 font-mono text-[11px] text-slate-400">
                                                                        {
                                                                            account.parent_code
                                                                        }
                                                                    </span>
                                                                )}

                                                                <span className="text-xs text-slate-600">
                                                                    {
                                                                        account.parent_name
                                                                    }
                                                                </span>

                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-300">
                                                                —
                                                            </span>
                                                        )}

                                                    </td>

                                                    {/* LEVEL */}

                                                    <td className="px-4 py-3 text-center">

                                                        <span className="text-xs font-semibold text-slate-600">
                                                            {account.account_level ??
                                                                "—"}
                                                        </span>

                                                    </td>

                                                    {/* POSTABLE */}

                                                    <td className="px-4 py-3 text-center">

                                                        {account.is_postable ? (
                                                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                                                Yes
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                                                                No
                                                            </span>
                                                        )}

                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-4 py-3 text-center">

                                                        {account.is_active !==
                                                        false ? (
                                                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                                                                Inactive
                                                            </span>
                                                        )}

                                                    </td>

                                                    {/* ACTION */}

                                                   
                                                </tr>
                                            )
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                        {/* PAGINATION */}

                        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="text-xs text-slate-500">

                                {filteredAccounts.length >
                                0 ? (
                                    <>
                                        Showing{" "}
                                        <strong className="text-slate-700">
                                            {(page -
                                                1) *
                                                PAGE_SIZE +
                                                1}
                                        </strong>

                                        {" – "}

                                        <strong className="text-slate-700">
                                            {Math.min(
                                                page *
                                                    PAGE_SIZE,
                                                filteredAccounts.length
                                            )}
                                        </strong>

                                        {" of "}

                                        <strong className="text-slate-700">
                                            {
                                                filteredAccounts.length
                                            }
                                        </strong>
                                    </>
                                ) : (
                                    "No records"
                                )}

                            </div>

                            <div className="flex items-center gap-1">

                                <button
                                    type="button"
                                    disabled={
                                        page ===
                                        1
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                current
                                            ) =>
                                                Math.max(
                                                    1,
                                                    current -
                                                        1
                                                )
                                        )
                                    }
                                    className={`
                                        rounded-md
                                        border
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        ${
                                            page ===
                                            1
                                                ? "cursor-not-allowed border-slate-200 text-slate-300"
                                                : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    Previous
                                </button>

                                {getPageNumbers(
                                    page,
                                    totalPages
                                ).map(
                                    (
                                        number,
                                        index
                                    ) =>
                                        number ===
                                        "..." ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="px-2 text-xs text-slate-400"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={
                                                    number
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setPage(
                                                        number as number
                                                    )
                                                }
                                                className={`
                                                    min-w-8
                                                    rounded-md
                                                    px-2
                                                    py-1.5
                                                    text-xs
                                                    font-semibold
                                                    ${
                                                        page ===
                                                        number
                                                            ? "bg-blue-600 text-white"
                                                            : "text-slate-600 hover:bg-slate-100"
                                                    }
                                                `}
                                            >
                                                {
                                                    number
                                                }
                                            </button>
                                        )
                                )}

                                <button
                                    type="button"
                                    disabled={
                                        page ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                current
                                            ) =>
                                                Math.min(
                                                    totalPages,
                                                    current +
                                                        1
                                                )
                                        )
                                    }
                                    className={`
                                        rounded-md
                                        border
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        ${
                                            page ===
                                            totalPages
                                                ? "cursor-not-allowed border-slate-200 text-slate-300"
                                                : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    Next
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>

            <label className="mb-1.5 block text-xs font-semibold text-slate-600">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            {children}

        </div>
    );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (
        value: boolean
    ) => void;
    label: string;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-2">

            <button
                type="button"
                role="switch"
                aria-checked={
                    checked
                }
                onClick={() =>
                    onChange(
                        !checked
                    )
                }
                className={`
                    relative
                    h-5
                    w-9
                    rounded-full
                    transition
                    ${
                        checked
                            ? "bg-blue-600"
                            : "bg-slate-300"
                    }
                `}
            >

                <span
                    className={`
                        absolute
                        top-0.5
                        h-4
                        w-4
                        rounded-full
                        bg-white
                        shadow-sm
                        transition
                        ${
                            checked
                                ? "left-[18px]"
                                : "left-0.5"
                        }
                    `}
                />

            </button>

            <span className="text-xs font-medium text-slate-700">
                {label}
            </span>

        </label>
    );
}

/* =========================================================
   TABLE HEADER
========================================================= */

function Th({
    children,
    center = false,
    right = false,
}: {
    children: React.ReactNode;
    center?: boolean;
    right?: boolean;
}) {
    return (
        <th
            className={`
                px-4
                py-3
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-500
                ${
                    center
                        ? "text-center"
                        : ""
                }
                ${
                    right
                        ? "text-right"
                        : ""
                }
            `}
        >
            {children}
        </th>
    );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingRows() {
    return (
        <>
            {Array.from({
                length: 6,
            }).map((_, row) => (
                <tr
                    key={row}
                    className="border-b border-slate-100"
                >
                    {Array.from({
                        length: 7,
                    }).map(
                        (_, cell) => (
                            <td
                                key={cell}
                                className="px-4 py-4"
                            >
                                <div className="h-4 animate-pulse rounded bg-slate-100" />
                            </td>
                        )
                    )}
                </tr>
            ))}
        </>
    );
}

/* =========================================================
   PAGE NUMBERS
========================================================= */

function getPageNumbers(
    current: number,
    total: number
): (number | "...")[] {
    if (total <= 7) {
        return Array.from(
            {
                length: total,
            },
            (_, index) =>
                index + 1
        );
    }

    if (current <= 4) {
        return [
            1,
            2,
            3,
            4,
            5,
            "...",
            total,
        ];
    }

    if (current >= total - 3) {
        return [
            1,
            "...",
            total - 4,
            total - 3,
            total - 2,
            total - 1,
            total,
        ];
    }

    return [
        1,
        "...",
        current - 1,
        current,
        current + 1,
        "...",
        total,
    ];
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value: string
) {
    return value
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

const inputClass = `
    w-full
    rounded-lg
    border
    border-slate-300
    bg-white
    px-3
    py-2
    text-sm
    text-slate-900
    outline-none
    transition
    placeholder:text-slate-400
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-100
`;