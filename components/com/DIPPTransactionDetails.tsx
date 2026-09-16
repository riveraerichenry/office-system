"use client";

import {
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    Plus,
    Save,
    Trash2,
    X,
    ChevronDown,
    Loader2,
} from "lucide-react";

type Props = {
    transactionId?: string | null;
};

type Account = {
    id: string;
    account_code: string;
    account_name: string;
};

type TransactionItem = {
    id?: string;
    account_id?: string | null;
    account_code?: string;
    account_name?: string;
    amount?: number | string;
    remarks?: string;
};

export default function DIPPTransactionDetails({
    transactionId,
}: Props) {
    // ============================================================
    // STATE
    // ============================================================

    const [header, setHeader] =
        useState<any | null>(null);

    const [items, setItems] =
        useState<TransactionItem[]>([]);

    const [originalHeader, setOriginalHeader] =
        useState<any | null>(null);

    const [originalItems, setOriginalItems] =
        useState<TransactionItem[]>([]);

    const [accounts, setAccounts] =
        useState<Account[]>([]);

    const [accountsLoading, setAccountsLoading] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [saveMessage, setSaveMessage] =
        useState<string | null>(null);

    // ============================================================
    // LOAD ACCOUNTS
    // ============================================================

    useEffect(() => {
        let mounted = true;

        async function loadAccounts() {
            try {
                setAccountsLoading(true);

                const response = await fetch(
                    "/api/accounts",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load accounts (${response.status})`
                    );
                }

                const result =
                    await response.json();

                if (!mounted) {
                    return;
                }

                const rawAccounts =
                    Array.isArray(result)
                        ? result
                        : Array.isArray(
                              result?.data
                          )
                        ? result.data
                        : Array.isArray(
                              result?.accounts
                          )
                        ? result.accounts
                        : [];

                const mappedAccounts: Account[] =
                    rawAccounts
                        .map(
                            (
                                account: any
                            ): Account => ({
                                id: String(
                                    account?.id ??
                                        ""
                                ),

                                account_code:
                                    account?.account_code ??
                                    account?.accountCode ??
                                    account?.code ??
                                    "",

                                account_name:
                                    account?.account_name ??
                                    account?.accountName ??
                                    account?.name ??
                                    "",
                            })
                        )
                        .filter(
                            (
                                account: Account
                            ) =>
                                account.id &&
                                account.account_code &&
                                account.account_name
                        )
                        .sort(
                            (
                                a: Account,
                                b: Account
                            ) =>
                                a.account_code.localeCompare(
                                    b.account_code
                                )
                        );

                setAccounts(
                    mappedAccounts
                );
            } catch (err: any) {
                console.error(
                    "LOAD ACCOUNTS ERROR:",
                    err
                );

                if (mounted) {
                    setAccounts([]);
                }
            } finally {
                if (mounted) {
                    setAccountsLoading(
                        false
                    );
                }
            }
        }

        loadAccounts();

        return () => {
            mounted = false;
        };
    }, []);

    // ============================================================
    // LOAD TRANSACTION DETAILS
    // ============================================================

    useEffect(() => {
        if (!transactionId) {
            setHeader(null);
            setItems([]);
            setOriginalHeader(null);
            setOriginalItems([]);
            setError(null);
            setSaveMessage(null);

            return;
        }

        const id = transactionId;

        let cancelled = false;

        async function loadDetails() {
            try {
                setLoading(true);
                setError(null);
                setSaveMessage(null);

                const response = await fetch(
                    `/api/com/dipp-transaction-details?id=${encodeURIComponent(
                        id
                    )}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) ?? "";

                const responseText =
                    await response.text();

                if (
                    !contentType.includes(
                        "application/json"
                    )
                ) {
                    throw new Error(
                        `Transaction details API returned ${response.status} instead of JSON.`
                    );
                }

                const data =
                    JSON.parse(
                        responseText
                    );

                if (!response.ok) {
                    throw new Error(
                        data?.message ??
                            data?.error ??
                            "Failed to load transaction details."
                    );
                }

                if (cancelled) {
                    return;
                }

                const loadedHeader =
                    data?.header
                        ? {
                              ...data.header,
                          }
                        : null;

                const loadedItems =
                    Array.isArray(
                        data?.items
                    )
                        ? data.items.map(
                              (
                                  item: any
                              ) => ({
                                  ...item,

                                  account_id:
                                      item?.account_id ??
                                      item?.accountId ??
                                      null,

                                  account_code:
                                      item?.account_code ??
                                      "",

                                  account_name:
                                      item?.account_name ??
                                      "",

                                  amount:
                                      item?.amount ??
                                      0,

                                  remarks:
                                      item?.remarks ??
                                      "",
                              })
                          )
                        : [];

                setHeader(
                    loadedHeader
                );

                setItems(
                    loadedItems
                );

                setOriginalHeader(
                    loadedHeader
                        ? {
                              ...loadedHeader,
                          }
                        : null
                );

                setOriginalItems(
                    loadedItems.map(
                        (
                            item: TransactionItem
                        ) => ({
                            ...item,
                        })
                    )
                );
            } catch (err: any) {
                console.error(
                    "LOAD DIPP TRANSACTION DETAILS ERROR:",
                    err
                );

                if (!cancelled) {
                    setHeader(null);
                    setItems([]);
                    setOriginalHeader(null);
                    setOriginalItems([]);

                    setError(
                        err?.message ??
                            "Failed to load transaction details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDetails();

        return () => {
            cancelled = true;
        };
    }, [transactionId]);

    // ============================================================
    // UPDATE HEADER
    // ============================================================

    function updateHeader(
        field: string,
        value: any
    ) {
        setHeader(
            (previous: any) => ({
                ...previous,
                [field]: value,
            })
        );

        setSaveMessage(null);
    }

    // ============================================================
    // UPDATE ITEM
    // ============================================================

    function updateItem(
        index: number,
        field: keyof TransactionItem,
        value: any
    ) {
        setItems(
            (previous) =>
                previous.map(
                    (
                        item,
                        itemIndex
                    ) =>
                        itemIndex ===
                        index
                            ? {
                                  ...item,
                                  [field]:
                                      value,
                              }
                            : item
                )
        );

        setSaveMessage(null);
    }

    // ============================================================
    // SELECT ACCOUNT
    // ============================================================

    function selectAccount(
        index: number,
        accountId: string
    ) {
        const account =
            accounts.find(
                (item) =>
                    item.id ===
                    accountId
            );

        if (!account) {
            return;
        }

        setItems(
            (previous) =>
                previous.map(
                    (
                        item,
                        itemIndex
                    ) =>
                        itemIndex ===
                        index
                            ? {
                                  ...item,

                                  account_id:
                                      account.id,

                                  account_code:
                                      account.account_code,

                                  account_name:
                                      account.account_name,
                              }
                            : item
                )
        );

        setSaveMessage(null);
    }

    // ============================================================
    // ADD ITEM
    // ============================================================

    function addItem() {
        setItems(
            (previous) => [
                ...previous,
                {
                    id: undefined,
                    account_id: null,
                    account_code: "",
                    account_name: "",
                    amount: 0,
                    remarks: "",
                },
            ]
        );

        setSaveMessage(null);
    }

    // ============================================================
    // DELETE ITEM
    // ============================================================

    function deleteItem(
        index: number
    ) {
        setItems(
            (previous) =>
                previous.filter(
                    (
                        _,
                        itemIndex
                    ) =>
                        itemIndex !==
                        index
                )
        );

        setSaveMessage(null);
    }

    // ============================================================
    // CANCEL
    // ============================================================

    function handleCancel() {
        setHeader(
            originalHeader
                ? {
                      ...originalHeader,
                  }
                : null
        );

        setItems(
            originalItems.map(
                (item) => ({
                    ...item,
                })
            )
        );

        setSaveMessage(null);
    }

    // ============================================================
    // FORMAT AMOUNT
    // ============================================================

    function formatAmount(
        value: any
    ): string {
        const number =
            Number(value ?? 0);

        if (
            Number.isNaN(number)
        ) {
            return "0.00";
        }

        return number.toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    // ============================================================
    // TOTAL
    // ============================================================

    function calculateTotal() {
        return items.reduce(
            (
                total,
                item
            ) => {
                const amount =
                    Number(
                        item?.amount ??
                            0
                    );

                return (
                    total +
                    (Number.isNaN(
                        amount
                    )
                        ? 0
                        : amount)
                );
            },
            0
        );
    }

    // ============================================================
    // DATE INPUT
    // ============================================================

    function formatDateForInput(
        value: any
    ): string {
        if (!value) {
            return "";
        }

        if (
            typeof value ===
                "string" &&
            /^\d{4}-\d{2}-\d{2}/.test(
                value
            )
        ) {
            return value.substring(
                0,
                10
            );
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // ============================================================
    // FUND DISPLAY
    // ============================================================

    function getFundDisplay() {
        const code =
            String(
                header?.fund_code ??
                    header?.fundCode ??
                    header?.fund_source_code ??
                    header?.fundSourceCode ??
                    ""
            ).trim();

        const name =
            String(
                header?.fund_name ??
                    header?.fundName ??
                    header?.fund_source_name ??
                    header?.fundSourceName ??
                    ""
            ).trim();

        if (
            code &&
            name
        ) {
            return `${code} - ${name}`;
        }

        if (code) {
            return code;
        }

        if (name) {
            return name;
        }

        return "—";
    }

    // ============================================================
    // COLLECTOR
    // ============================================================

    function getCollectorDisplay() {
        return (
            header?.encoded_by_name ??
            header?.encoder_name ??
            header?.encoded_by_full_name ??
            header?.encoded_by ??
            "—"
        );
    }

    // ============================================================
    // ACCOUNT VALUE
    // ============================================================

    function getAccountValue(
        item: TransactionItem
    ) {
        if (item.account_id) {
            return item.account_id;
        }

        /*
         * Fallback for existing transactions
         * where account_id was not returned.
         */

        const matched =
            accounts.find(
                (account) =>
                    account.account_code ===
                    item.account_code
            );

        return matched?.id ?? "";
    }

    // ============================================================
    // SAVE
    // ============================================================

    async function handleSave() {
        if (
            !transactionId ||
            !header
        ) {
            return;
        }

        try {
            setSaving(true);
            setSaveMessage(null);

            const total =
                calculateTotal();

            const payor = String(
                header?.payor ?? ""
            ).trim();

            if (!payor) {
                throw new Error(
                    "Payor is required. Please enter the payor before saving."
                );
            }

            const updatedHeader = {
                ...header,
                payor,
                grand_total: total,
            };

            const updatedItems =
                items.map((item) => {
                    const fallbackAccount =
                        accounts.find(
                            (account) =>
                                account.account_code ===
                                item.account_code
                        );

                    return {
                        ...item,
                        account_id:
                            item.account_id ??
                            fallbackAccount?.id ??
                            null,
                        amount: Number(
                            item.amount ?? 0
                        ),
                        remarks: String(
                            item.remarks ?? ""
                        ),
                    };
                });

            const invalidItem =
                updatedItems.find(
                    (item) =>
                        !item.account_id
                );

            if (invalidItem) {
                throw new Error(
                    "Please select an account for every transaction item."
                );
            }

            const response =
                await fetch(
                    "/api/com/dipp-transaction-details",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(
                            {
                                id: transactionId,

                                // Keep the complete header object for the
                                // COM API, while also sending the commonly
                                // validated header fields at the top level.
                                // This makes the request compatible with
                                // routes that validate body.payor directly.
                                payor: payor,
                                receipt_date:
                                    updatedHeader.receipt_date ?? null,
                                payment_mode:
                                    updatedHeader.payment_mode ?? null,
                                remarks:
                                    updatedHeader.remarks ?? null,
                                status:
                                    updatedHeader.status ?? null,
                                grand_total: total,

                                header:
                                    updatedHeader,

                                items:
                                    updatedItems,
                            }
                        ),
                    }
                );

            const contentType =
                response.headers.get(
                    "content-type"
                ) ?? "";

            const responseText =
                await response.text();

            let data: any = {};

            if (
                contentType.includes(
                    "application/json"
                ) &&
                responseText
            ) {
                try {
                    data =
                        JSON.parse(
                            responseText
                        );
                } catch {
                    data = {};
                }
            }

            if (!response.ok) {
                throw new Error(
                    data?.message ??
                        data?.error ??
                        `Save failed (${response.status}).`
                );
            }

            setHeader(
                updatedHeader
            );

            setItems(
                updatedItems
            );

            setOriginalHeader({
                ...updatedHeader,
            });

            setOriginalItems(
                updatedItems.map(
                    (item) => ({
                        ...item,
                    })
                )
            );

            setSaveMessage(
                "Changes saved successfully."
            );
        } catch (err: any) {
            console.error(
                "SAVE DIPP TRANSACTION ERROR:",
                err
            );

            setSaveMessage(
                err?.message ??
                    "Failed to save changes."
            );
        } finally {
            setSaving(false);
        }
    }

    // ============================================================
    // NO TRANSACTION
    // ============================================================

    if (!transactionId) {
        return (
            <div className="flex min-h-[360px] items-center justify-center bg-white">

                <div className="text-center">

                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-400">
                        —
                    </div>

                    <h3 className="text-sm font-semibold text-slate-700">
                        No Transaction Selected
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Select a DIPP transaction
                        from the list.
                    </p>

                </div>

            </div>
        );
    }

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="flex min-h-[360px] items-center justify-center bg-white text-xs text-slate-500">
                Loading transaction details...
            </div>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (error) {
        return (
            <div className="bg-white p-5">

                <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {error}
                </div>

            </div>
        );
    }

    // ============================================================
    // NOT FOUND
    // ============================================================

    if (!header) {
        return (
            <div className="bg-white p-5 text-xs text-slate-500">
                Transaction not found.
            </div>
        );
    }

    const grandTotal =
        calculateTotal();

    // ============================================================
    // STYLES
    // ============================================================

    const inputClass =
        "h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50";

    const readonlyClass =
        "flex min-h-9 w-full min-w-0 items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700";

    // ============================================================
    // MAIN
    // ============================================================

    return (
        <div className="flex h-full min-h-0 flex-col bg-slate-50">

            {/* ====================================================
                TRANSACTION INFORMATION
            ==================================================== */}

            <div className="shrink-0 border-b border-slate-200 bg-white">

                <div className="px-5 py-4">

                    {/* HEADER */}

                    <div className="mb-4 flex items-center justify-between">

                        <div>

                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                DIPP Transaction
                            </div>

                            <h2 className="mt-1 text-base font-semibold text-slate-800">
                                Transaction Details
                            </h2>

                        </div>


                        <div className="flex items-center gap-3">

                            <div className="text-right">

                                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    OR Number
                                </div>

                                <div className="mt-0.5 text-sm font-semibold text-slate-700">
                                    {header.or_number ??
                                        "—"}
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Save size={14} />
                                )}
                                {saving
                                    ? "Saving..."
                                    : "Save All Changes"}
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        INFORMATION GRID
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 lg:grid-cols-2">

                        {/* PAYOR */}

                        <CorporateField label="Payor">

                            <input
                                type="text"
                                value={
                                    header.payor ??
                                    ""
                                }
                                onChange={(e) =>
                                    updateHeader(
                                        "payor",
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />

                        </CorporateField>


                        {/* COLLECTOR - READ ONLY */}

                        <CorporateField label="Collector">

                            <div className={readonlyClass}>
                                <span className="truncate">
                                    {getCollectorDisplay()}
                                </span>
                            </div>

                        </CorporateField>


                        {/* PAYMENT MODE */}

                        <CorporateField label="Payment Mode">

                            <select
                                value={
                                    header.payment_mode ??
                                    ""
                                }
                                onChange={(e) =>
                                    updateHeader(
                                        "payment_mode",
                                        e.target.value
                                    )
                                }
                                className={`${inputClass} cursor-pointer`}
                            >

                                <option value="">
                                    Select Payment Mode
                                </option>

                                <option value="Cash">
                                    Cash
                                </option>

                                <option value="Check">
                                    Check
                                </option>

                                <option value="Bank">
                                    Bank
                                </option>

                                <option value="Online">
                                    Online
                                </option>

                            </select>

                        </CorporateField>


                        {/* ACCOUNTABLE FORM - READ ONLY */}

                        <CorporateField label="Accountable Form">

                            <div className={readonlyClass}>
                                <span className="truncate">
                                    {header.form_code ??
                                        header.form_name ??
                                        "—"}
                                </span>
                            </div>

                        </CorporateField>


                        {/* STATUS */}

                        <CorporateField label="Status">

                            <select
                                value={
                                    header.status ??
                                    ""
                                }
                                onChange={(e) =>
                                    updateHeader(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className={`${inputClass} cursor-pointer`}
                            >

                                <option value="">
                                    Select Status
                                </option>

                                <option value="ISSUED">
                                    ISSUED
                                </option>

                                <option value="POSTED">
                                    POSTED
                                </option>

                                <option value="CANCELLED">
                                    CANCELLED
                                </option>

                                <option value="REMITTED">
                                    REMITTED
                                </option>

                            </select>

                        </CorporateField>


                        {/* RECEIPT DATE */}

                        <CorporateField label="Receipt Date">

                            <input
                                type="date"
                                value={formatDateForInput(
                                    header.receipt_date
                                )}
                                onChange={(e) =>
                                    updateHeader(
                                        "receipt_date",
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />

                        </CorporateField>


                        {/* FUND CODE - READ ONLY */}

                        <CorporateField label="Fund Code">

                            <div className={readonlyClass}>

                                <span className="truncate font-semibold text-slate-700">
                                    {getFundDisplay()}
                                </span>

                            </div>

                        </CorporateField>


                        {/* REMARKS */}

                        <div className="lg:col-span-2">

                            <div className="grid grid-cols-[140px_minmax(0,1fr)] items-start gap-5">

                                <label className="pt-2 text-xs font-medium text-slate-500">
                                    Remarks
                                </label>

                                <textarea
                                    value={
                                        header.remarks ??
                                        ""
                                    }
                                    onChange={(e) =>
                                        updateHeader(
                                            "remarks",
                                            e.target.value
                                        )
                                    }
                                    rows={2}
                                    placeholder="Enter remarks..."
                                    className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ====================================================
                SAVE MESSAGE
            ==================================================== */}

            {saveMessage && (

                <div
                    className={`shrink-0 border-b px-5 py-2 text-xs ${
                        saveMessage.includes(
                            "successfully"
                        )
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                    }`}
                >
                    {saveMessage}
                </div>

            )}


            {/* ====================================================
                TRANSACTION ITEMS
            ==================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto p-3">

                <div className="w-full max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* =================================================
                        ITEMS HEADER
                    ================================================= */}

                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0">

                            <div className="flex items-center gap-2">

                                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                    Transaction Items
                                </h3>

                                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                    {items.length}
                                </span>

                            </div>

                            <p className="mt-0.5 text-[10px] text-slate-500">
                                Edit account distribution and collection amounts
                            </p>

                        </div>


                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={saving}
                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-blue-200 bg-white px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Plus size={14} />
                                Add Item
                            </button>
                        </div>

                    </div>


                    {/* =================================================
                        ITEM HEADER
                    ================================================= */}

                    <div className="hidden grid-cols-[32px_minmax(0,2fr)_140px_minmax(0,1.4fr)_44px] gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 md:grid">

                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            #
                        </div>

                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Account
                        </div>

                        <div className="text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Amount
                        </div>

                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Remarks
                        </div>

                        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Action
                        </div>

                    </div>


                    {/* =================================================
                        ITEMS
                    ================================================= */}

                    <div className="divide-y divide-slate-100">

                        {items.length === 0 ? (

                            <div className="px-4 py-10 text-center text-xs text-slate-400">
                                No transaction items.
                            </div>

                        ) : (

                            items.map(
                                (
                                    item,
                                    index
                                ) => (

                                    <div
                                        key={
                                            item.id ??
                                            `item-${index}`
                                        }
                                        className="p-3"
                                    >

                                        {/* =========================================
                                            DESKTOP
                                        ========================================= */}

                                        <div className="hidden min-w-0 grid-cols-[32px_minmax(0,2fr)_140px_minmax(0,1.4fr)_44px] items-center gap-2 md:grid">

                                            {/* NUMBER */}

                                            <div className="text-xs font-medium text-slate-500">
                                                {index +
                                                    1}
                                            </div>


                                            {/* ACCOUNT */}

                                            <div className="min-w-0">

                                                <div className="relative min-w-0">

                                                    <select
                                                        value={getAccountValue(
                                                            item
                                                        )}
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            selectAccount(
                                                                index,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            accountsLoading ||
                                                            saving
                                                        }
                                                        className="h-9 w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                    >

                                                        <option value="">
                                                            {accountsLoading
                                                                ? "Loading accounts..."
                                                                : "Select account"}
                                                        </option>

                                                        {accounts.map(
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
                                                                    {
                                                                        account.account_code
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        account.account_name
                                                                    }
                                                                </option>

                                                            )
                                                        )}

                                                    </select>


                                                    <ChevronDown
                                                        size={14}
                                                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />

                                                </div>

                                            </div>


                                            {/* AMOUNT */}

                                            <div className="min-w-0">

                                                <div className="relative">

                                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                                        ₱
                                                    </span>

                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            item.amount ??
                                                            0
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateItem(
                                                                index,
                                                                "amount",
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                        className="h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white pl-7 pr-2 text-right text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                                                    />

                                                </div>

                                            </div>


                                            {/* REMARKS */}

                                            <div className="min-w-0">

                                                <input
                                                    type="text"
                                                    value={
                                                        item.remarks ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "remarks",
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    placeholder="Item remarks"
                                                    className="h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                                                />

                                            </div>


                                            {/* DELETE */}

                                            <div className="flex justify-center">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteItem(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    title="Delete item"
                                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                >

                                                    <Trash2
                                                        size={
                                                            15
                                                        }
                                                    />

                                                </button>

                                            </div>

                                        </div>


                                        {/* =========================================
                                            MOBILE
                                        ========================================= */}

                                        <div className="space-y-2 md:hidden">

                                            <div className="flex items-center justify-between">

                                                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Item{" "}
                                                    {index +
                                                        1}
                                                </span>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteItem(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                >

                                                    <Trash2
                                                        size={
                                                            14
                                                        }
                                                    />

                                                </button>

                                            </div>


                                            {/* ACCOUNT */}

                                            <div className="relative">

                                                <select
                                                    value={getAccountValue(
                                                        item
                                                    )}
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        selectAccount(
                                                            index,
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    disabled={
                                                        accountsLoading ||
                                                        saving
                                                    }
                                                    className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                >

                                                    <option value="">
                                                        {accountsLoading
                                                            ? "Loading accounts..."
                                                            : "Select account"}
                                                    </option>

                                                    {accounts.map(
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
                                                                {
                                                                    account.account_code
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    account.account_name
                                                                }
                                                            </option>

                                                        )
                                                    )}

                                                </select>


                                                <ChevronDown
                                                    size={14}
                                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                            </div>


                                            {/* AMOUNT */}

                                            <div className="relative">

                                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                    ₱
                                                </span>

                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={
                                                        item.amount ??
                                                        0
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "amount",
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="h-9 w-full rounded-md border border-slate-300 bg-white pl-7 pr-3 text-right text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                />

                                            </div>


                                            {/* REMARKS */}

                                            <input
                                                type="text"
                                                value={
                                                    item.remarks ??
                                                    ""
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateItem(
                                                        index,
                                                        "remarks",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                                placeholder="Item remarks"
                                                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>


                    {/* =================================================
                        GRAND TOTAL
                    ================================================= */}

                    <div className="border-t border-slate-200 bg-slate-50">

                        <div className="flex items-center justify-end gap-5 px-4 py-3">

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Grand Total
                            </span>

                            <span className="min-w-[130px] text-right text-base font-bold text-blue-700">
                                ₱
                                {formatAmount(
                                    grandTotal
                                )}
                            </span>

                        </div>

                    </div>

                </div>


                {/* BOTTOM */}

                <div className="flex items-center justify-between px-1 pt-2">

                    <span className="text-[10px] text-slate-400">
                        Select an account from the account master list.
                    </span>

                    <span className="text-[10px] font-medium text-slate-500">
                        {items.length}{" "}
                        {items.length === 1
                            ? "item"
                            : "items"}
                    </span>

                </div>

            </div>

        </div>
    );
}


/*
============================================================
CORPORATE FIELD
============================================================
*/

function CorporateField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="grid min-w-0 grid-cols-[140px_minmax(0,1fr)] items-center gap-4">

            <label className="text-xs font-medium text-slate-500">
                {label}
            </label>

            <div className="min-w-0">
                {children}
            </div>

        </div>
    );
}