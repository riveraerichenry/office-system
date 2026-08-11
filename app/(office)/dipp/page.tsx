"use client";

import {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import ActiveBookletTable from "@/components/dipp/ActiveBookletTable";
import FiscalYearSummary from "@/components/dipp/FiscalYearSummary";
import DailyCollections from "@/components/dipp/DailyCollection";
import DIPPSystemOptions from "@/components/dipp/DIPPSystemOptions";

import OfficialReceiptDetailsModal
    from "@/components/dipp/OfficialReceiptModal";

import AF56ReceiptModal
    from "@/components/dipp/AF56ReceiptModal";

import GeneralReceiptModal
    from "@/components/dipp/GeneralReceiptModal";

import MonthlyTransactionsModal
    from "@/components/dipp/MonthlyTransactionModal";

import CTCIReceiptModal
    from "@/components/dipp/ctc/CTCIReceiptModal";

import CTCCReceiptModal
    from "@/components/dipp/ctc/CTCCReceiptModal";

export default function DIPPPage() {

    /*
    |--------------------------------------------------------------------------
    | System Options
    |--------------------------------------------------------------------------
    */

    const [
        systemOpen,
        setSystemOpen,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Active Booklets
    |--------------------------------------------------------------------------
    */

    const [
        booklets,
        setBooklets,
    ] = useState<any[]>([]);

    const [
        selected,
        setSelected,
    ] = useState<any>(null);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        search,
        setSearch,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Selected Booklet
    |--------------------------------------------------------------------------
    */

    const [
        selectedBooklet,
        setSelectedBooklet,
    ] = useState<any>(null);

    /*
    |--------------------------------------------------------------------------
    | General / AF56
    |--------------------------------------------------------------------------
    */

    const [
        openGeneralModal,
        setOpenGeneralModal,
    ] = useState(false);

    const [
        openAF56Modal,
        setOpenAF56Modal,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | CTC-I
    |--------------------------------------------------------------------------
    */

    const [
        openCTCI,
        setOpenCTCI,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | CTC-C
    |--------------------------------------------------------------------------
    */

    const [
        openCTCC,
        setOpenCTCC,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Monthly Transactions Modal
    |--------------------------------------------------------------------------
    */

    const [
        selectedMonth,
        setSelectedMonth,
    ] = useState(1);

    const [
        openMonthlyModal,
        setOpenMonthlyModal,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Fiscal Year Summary
    |--------------------------------------------------------------------------
    */

    const [
        summaryRows,
        setSummaryRows,
    ] = useState<any[]>([]);

    const [
        summaryForms,
        setSummaryForms,
    ] = useState<string[]>([]);

    const [
        summaryYears,
        setSummaryYears,
    ] = useState<number[]>([]);

    const [
        summaryLoading,
        setSummaryLoading,
    ] = useState(false);

    const [
        fiscalYear,
        setFiscalYear,
    ] = useState(
        new Date().getFullYear()
    );

    /*
    |--------------------------------------------------------------------------
    | Daily / Monthly Collections
    |--------------------------------------------------------------------------
    */

    const [
        dailyCollections,
        setDailyCollections,
    ] = useState<any[]>([]);

    const [
        dailyLoading,
        setDailyLoading,
    ] = useState(false);

    const [
        dailyPage,
        setDailyPage,
    ] = useState(1);

    const [
        dailyTotalPages,
        setDailyTotalPages,
    ] = useState(1);

    const [
        dailyTotalRecords,
        setDailyTotalRecords,
    ] = useState(0);

    const [
        dailySearch,
        setDailySearch,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Daily / Monthly View
    |--------------------------------------------------------------------------
    */

    const [
        viewMode,
        setViewMode,
    ] = useState<
        "daily" | "monthly"
    >("daily");

    /*
    |--------------------------------------------------------------------------
    | Transaction Details
    |--------------------------------------------------------------------------
    */

    const [
        receiptDetailsOpen,
        setReceiptDetailsOpen,
    ] = useState(false);

    const [
        receiptLoading,
        setReceiptLoading,
    ] = useState(false);

    const [
        receiptHeader,
        setReceiptHeader,
    ] = useState<any>(null);

    const [
        receiptItems,
        setReceiptItems,
    ] = useState<any[]>([]);

    /*
    |--------------------------------------------------------------------------
    | Initial Load - Active Booklets
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadBooklets();
    }, [search]);

    /*
    |--------------------------------------------------------------------------
    | Fiscal Summary
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadSummary();
    }, [fiscalYear]);

    /*
    |--------------------------------------------------------------------------
    | Daily / Monthly
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadDailyCollections();
    }, [
        viewMode,
        dailySearch,
        dailyPage,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Transaction Details
    |--------------------------------------------------------------------------
    */

    async function loadTransactionDetails(
        id: string
    ) {
        try {

            setReceiptLoading(
                true
            );

            const res =
                await axios.get(
                    "/api/dipp/transaction-details",
                    {
                        params: {
                            id,
                        },
                    }
                );

            setReceiptHeader(
                res.data.header
            );

            setReceiptItems(
                res.data.items
            );

            setReceiptDetailsOpen(
                true
            );

        } catch (err) {

            console.error(
                "Failed to load transaction details:",
                err
            );

        } finally {

            setReceiptLoading(
                false
            );

        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Active Booklets
    |--------------------------------------------------------------------------
    */

    async function loadBooklets() {

        try {

            setLoading(
                true
            );

            const res =
                await axios.get(
                    "/api/dipp/active-booklets",
                    {
                        params: {
                            search,
                        },
                    }
                );

            const rows =
                res.data.data ?? [];

            setBooklets(
                rows
            );

            /*
            |--------------------------------------------------------------------------
            | No Booklets
            |--------------------------------------------------------------------------
            */

            if (
                rows.length === 0
            ) {

                setSelected(
                    null
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Preserve Current Selection
            |--------------------------------------------------------------------------
            */

            if (selected) {

                const updated =
                    rows.find(
                        (x: any) =>
                            x.booklet_registration_id ===
                            selected.booklet_registration_id
                    );

                if (updated) {

                    setSelected(
                        updated
                    );

                    return;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Default Selection
            |--------------------------------------------------------------------------
            */

            setSelected(
                rows[0]
            );

        } catch (err) {

            console.error(
                "Failed to load active booklets:",
                err
            );

        } finally {

            setLoading(
                false
            );

        }
    }

    /*
    |--------------------------------------------------------------------------
    | Fiscal Summary
    |--------------------------------------------------------------------------
    */

    async function loadSummary() {

        try {

            setSummaryLoading(
                true
            );

            const res =
                await axios.get(
                    "/api/dipp/dashboard/summary",
                    {
                        params: {
                            fiscal_year:
                                fiscalYear,
                        },
                    }
                );

            setSummaryRows(
                res.data.rows ?? []
            );

            setSummaryForms(
                res.data.forms ?? []
            );

            setSummaryYears(
                res.data.years ?? []
            );

        } catch (err) {

            console.error(
                "Failed to load fiscal summary:",
                err
            );

        } finally {

            setSummaryLoading(
                false
            );

        }
    }

    /*
    |--------------------------------------------------------------------------
    | Daily / Monthly Collections
    |--------------------------------------------------------------------------
    */

    async function loadDailyCollections() {

        try {

            setDailyLoading(
                true
            );

            const res =
                await axios.get(
                    "/api/dipp/daily-collections",
                    {
                        params: {
                            view:
                                viewMode,

                            search:
                                dailySearch,

                            page:
                                dailyPage,

                            pageSize:
                                5,
                        },
                    }
                );

            setDailyCollections(
                Array.isArray(
                    res.data.rows
                )
                    ? res.data.rows
                    : []
            );

            setDailyTotalPages(
                Number(
                    res.data.totalPages ??
                    1
                )
            );

            setDailyTotalRecords(
                Number(
                    res.data.totalRecords ??
                    0
                )
            );

        } catch (err) {

            console.error(
                "Failed to load DIPP collections:",
                err
            );

            setDailyCollections(
                []
            );

            setDailyTotalPages(
                1
            );

            setDailyTotalRecords(
                0
            );

        } finally {

            setDailyLoading(
                false
            );

        }
    }

    /*
    |--------------------------------------------------------------------------
    | Daily / Monthly Toggle
    |--------------------------------------------------------------------------
    */

    function handleViewModeChange(
        mode:
            | "daily"
            | "monthly"
    ) {

        if (
            mode ===
            viewMode
        ) {
            return;
        }

        setDailyCollections(
            []
        );

        setDailyPage(
            1
        );

        setViewMode(
            mode
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Active Booklet Modal Routing
    |--------------------------------------------------------------------------
    |
    | The selected booklet determines which
    | receipt modal will open.
    |
    */

    function handleSelectBooklet(
        row: any
    ) {

        /*
        |--------------------------------------------------------------------------
        | Save Selected Booklet
        |--------------------------------------------------------------------------
        */

        setSelected(
            row
        );

        setSelectedBooklet(
            row
        );

        /*
        |--------------------------------------------------------------------------
        | Close All Other Receipt Modals
        |--------------------------------------------------------------------------
        */

        setOpenGeneralModal(
            false
        );

        setOpenAF56Modal(
            false
        );

        setOpenCTCI(
            false
        );

        setOpenCTCC(
            false
        );

        /*
        |--------------------------------------------------------------------------
        | Normalize Form Code
        |--------------------------------------------------------------------------
        */

        const formCode =
            String(
                row?.form_code ??
                row?.accountable_form_code ??
                row?.formCode ??
                ""
            )
                .trim()
                .toUpperCase();

        console.log(
            "SELECTED BOOKLET:",
            row
        );

        console.log(
            "FORM CODE:",
            formCode
        );

        /*
        |--------------------------------------------------------------------------
        | AF56
        |--------------------------------------------------------------------------
        */

        if (
            formCode ===
            "AF56"
        ) {

            setOpenAF56Modal(
                true
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CTC - INDIVIDUAL
        |--------------------------------------------------------------------------
        */

        if (
            formCode === "CTC-I" ||
            formCode === "CTCI" ||
            formCode === "CTC-INDIVIDUAL" ||
            formCode === "CTC INDIVIDUAL"
        ) {

            setOpenCTCI(
                true
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CTC - CORPORATION
        |--------------------------------------------------------------------------
        */

        if (
            formCode === "CTC-C" ||
            formCode === "CTCC" ||
            formCode === "CTC-CORPORATION" ||
            formCode === "CTC CORPORATION"
        ) {

            setOpenCTCC(
                true
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | General Receipt
        |--------------------------------------------------------------------------
        */

        setOpenGeneralModal(
            true
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh
    |--------------------------------------------------------------------------
    */

    async function refreshDashboard() {

        await Promise.all([
            loadBooklets(),
            loadSummary(),
            loadDailyCollections(),
        ]);

    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>

            {/* ==============================================================
                MAIN DASHBOARD
            ============================================================== */}

            <div className="grid grid-cols-12 gap-6">

                {/* ==========================================================
                    ACTIVE BOOKLETS
                ========================================================== */}

                <div className="col-span-2">

                    <ActiveBookletTable
                        data={
                            booklets
                        }

                        loading={
                            loading
                        }

                        selected={
                            selected
                        }

                        search={
                            search
                        }

                        onSearch={
                            setSearch
                        }

                        onRefresh={
                            loadBooklets
                        }

                        onSelect={
                            handleSelectBooklet
                        }
                    />

                </div>

                {/* ==========================================================
                    FISCAL SUMMARY
                ========================================================== */}

                <div className="col-span-7">

                    <FiscalYearSummary
                        forms={
                            summaryForms
                        }

                        rows={
                            summaryRows
                        }

                        years={
                            summaryYears
                        }

                        loading={
                            summaryLoading
                        }

                        fiscalYear={
                            fiscalYear
                        }

                        onFiscalYearChange={
                            setFiscalYear
                        }

                        onRefresh={
                            loadSummary
                        }

                        onMonthClick={(
                            month
                        ) => {

                            setSelectedMonth(
                                month
                            );

                            setOpenMonthlyModal(
                                true
                            );

                        }}
                    />

                </div>

                {/* ==========================================================
                    DAILY / MONTHLY
                ========================================================== */}

                <div className="col-span-3">

                    <DailyCollections

                        rows={
                            dailyCollections
                        }

                        loading={
                            dailyLoading
                        }

                        page={
                            dailyPage
                        }

                        totalPages={
                            dailyTotalPages
                        }

                        totalRecords={
                            dailyTotalRecords
                        }

                        viewMode={
                            viewMode
                        }

                        onViewModeChange={
                            handleViewModeChange
                        }

                        onPageChange={(
                            page
                        ) => {

                            setDailyPage(
                                page
                            );

                        }}

                        onSelectTransaction={
                            loadTransactionDetails
                        }

                    />

                </div>

            </div>

            {/* ==============================================================
                GENERAL RECEIPT
            ============================================================== */}

            <GeneralReceiptModal

                open={
                    openGeneralModal
                }

                booklet={
                    selectedBooklet
                }

                onClose={() => {

                    setOpenGeneralModal(
                        false
                    );

                    setSelectedBooklet(
                        null
                    );

                }}

                onSuccess={
                    async () => {

                        setOpenGeneralModal(
                            false
                        );

                        setSelectedBooklet(
                            null
                        );

                        await refreshDashboard();

                    }
                }

            />

            {/* ==============================================================
                AF56
            ============================================================== */}

            <AF56ReceiptModal

                open={
                    openAF56Modal
                }

                booklet={
                    selectedBooklet
                }

                onClose={() => {

                    setOpenAF56Modal(
                        false
                    );

                    setSelectedBooklet(
                        null
                    );

                }}

                onSuccess={
                    async () => {

                        setOpenAF56Modal(
                            false
                        );

                        setSelectedBooklet(
                            null
                        );

                        await refreshDashboard();

                    }
                }

            />

            {/* ==============================================================
                CTC-I
            ============================================================== */}

            <CTCIReceiptModal

                open={
                    openCTCI
                }

                booklet={
                    selectedBooklet
                }

                onClose={() => {

                    setOpenCTCI(
                        false
                    );

                    setSelectedBooklet(
                        null
                    );

                }}

                onSuccess={
                    async () => {

                        setOpenCTCI(
                            false
                        );

                        setSelectedBooklet(
                            null
                        );

                        await refreshDashboard();

                    }
                }

            />

            {/* ==============================================================
                CTC-C
            ============================================================== */}

            <CTCCReceiptModal

                open={
                    openCTCC
                }

                booklet={
                    selectedBooklet
                }

                onClose={() => {

                    setOpenCTCC(
                        false
                    );

                    setSelectedBooklet(
                        null
                    );

                }}

                onSuccess={
                    async () => {

                        setOpenCTCC(
                            false
                        );

                        setSelectedBooklet(
                            null
                        );

                        await refreshDashboard();

                    }
                }

            />

            {/* ==============================================================
                MONTHLY TRANSACTIONS
            ============================================================== */}

            <MonthlyTransactionsModal

                open={
                    openMonthlyModal
                }

                month={
                    selectedMonth
                }

                year={
                    fiscalYear
                }

                onClose={() =>
                    setOpenMonthlyModal(
                        false
                    )
                }

                onSelectTransaction={
                    loadTransactionDetails
                }

            />

            {/* ==============================================================
                TRANSACTION DETAILS
            ============================================================== */}

            <OfficialReceiptDetailsModal

                open={
                    receiptDetailsOpen
                }

                loading={
                    receiptLoading
                }

                header={
                    receiptHeader
                }

                items={
                    receiptItems
                }

                onClose={() => {

                    setReceiptDetailsOpen(
                        false
                    );

                    setReceiptHeader(
                        null
                    );

                    setReceiptItems(
                        []
                    );

                }}

            />

            {/* ==============================================================
                SYSTEM OPTIONS
            ============================================================== */}

            <DIPPSystemOptions

                open={
                    systemOpen
                }

                setOpen={
                    setSystemOpen
                }

                onSetupBooklet={() => {

                    console.log(
                        "Setup Booklet"
                    );

                }}

                onGenerateRCD={() => {

                    console.log(
                        "Generate RCD"
                    );

                }}

                onMyReports={() => {

                    console.log(
                        "Reports"
                    );

                }}

                onDeposits={() => {

                    console.log(
                        "Deposits"
                    );

                }}

                onSkip={() => {

                    console.log(
                        "Skip"
                    );

                }}

                onExcl={() => {

                    console.log(
                        "EXCL"
                    );

                }}

                onRAAF={() => {

                    console.log(
                        "RAAF"
                    );

                }}

            />

        </>
    );
}