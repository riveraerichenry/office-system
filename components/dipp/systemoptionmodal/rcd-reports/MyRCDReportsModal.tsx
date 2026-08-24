"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    X,
    Search,
    RefreshCw,
} from "lucide-react";

import axios from "axios";

import RCDReport from "./rcdreport/RCDReport";
import DailyReceiptByFundSource from "./dailyreceiptbyfundsource/DailyReceiptByFundSource";
import AbstractSummary from "./abstract-summary/AbstractSummary";

import AbstractSummaryBy
    from "./abstractbyaccount/AbstractSummaryBy";



type Props = {
    open: boolean;
    onClose: () => void;
};


export type RCDReportTab =
    | "rcd"
    | "daily_receipt"
    | "abstract_summary"
    | "abstract_account";


export type RCDReportItem = {

    id: string;

    report_no: string;

    report_date: string;

    fund_source_id: string;

    date_from: string;

    date_to: string;

    total_collections:
        number |
        string;

    total_remittances:
        number |
        string;

    total_deposits:
        number |
        string;

    balance:
        number |
        string;

    status: string;

    fund_code?:
        string |
        null;

    fund_name?:
        string |
        null;

    acronym?:
        string |
        null;

    rcd_by?:
        string |
        null;

    has_remittance?:
        boolean;


    remittance?: {

        id: string;

        report_no?:
            string |
            null;

        payment_type?:
            string |
            null;

        cash_amount?:
            number |
            string;

        check_amount?:
            number |
            string;

        total_amount?:
            number |
            string;

        report_date?:
            string |
            null;

        remitted_by?:
            string |
            null;

        created_by?:
            string |
            null;

        created_at?:
            string |
            null;

    } |
        null;


    /*
    ============================================================
    COMPLETE RCD DETAILS
    ============================================================
    */

    items?:
        any[];

    denominations?:
        any[];

    user?: {

        id?:
            string |
            null;

        full_name?:
            string |
            null;

        username?:
            string |
            null;

    } |
        null;

    previousFormRows?:
        any[];

};


type FundSource = {

    id: string;

    fund_code?:
        string |
        null;

    fund_name?:
        string |
        null;

    acronym?:
        string |
        null;

    name?:
        string |
        null;

    description?:
        string |
        null;

};


export default function MyRCDReportsModal({
    open,
    onClose,
}: Props) {


    /*
    ============================================================
    SELECTED RCD
    ============================================================
    */

    const [
        selectedRCD,
        setSelectedRCD,
    ] = useState<RCDReportItem | null>(
        null
    );


    /*
    ============================================================
    ACTIVE TAB
    ============================================================
    */

    const [
        activeTab,
        setActiveTab,
    ] = useState<RCDReportTab>(
        "rcd"
    );


    /*
    ============================================================
    RCD LIST
    ============================================================
    */

    const [
        rcds,
        setRCDs,
    ] = useState<RCDReportItem[]>(
        []
    );


    /*
    ============================================================
    FUND SOURCES
    ============================================================
    */

    const [
        fundSources,
        setFundSources,
    ] = useState<FundSource[]>(
        []
    );


    /*
    ============================================================
    FILTERS
    ============================================================
    */

    const [
        fundSourceId,
        setFundSourceId,
    ] = useState("");


    const [
        dateFrom,
        setDateFrom,
    ] = useState("");


    const [
        dateTo,
        setDateTo,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    /*
    ============================================================
    LOADING
    ============================================================
    */

    const [
        loadingDetail,
        setLoadingDetail,
    ] = useState(false);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        loadingFunds,
        setLoadingFunds,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    /*
    ============================================================
    RESET
    ============================================================
    */

    useEffect(
        () => {

            if (!open) {
                return;
            }

            setSelectedRCD(
                null
            );

            setActiveTab(
                "rcd"
            );

            setFundSourceId(
                ""
            );

            setDateFrom(
                ""
            );

            setDateTo(
                ""
            );

            setSearch(
                ""
            );

            setError(
                ""
            );

            loadFundSources();

            loadRCDs();

        },
        [open]
    );


    /*
    ============================================================
    LOAD FUND SOURCES
    ============================================================
    */

    async function loadFundSources() {

        try {

            setLoadingFunds(
                true
            );

            const response =
                await axios.get(
                    "/api/fund-sources",
                    {
                        withCredentials:
                            true,
                    }
                );


            const result =
                response.data;


            let data:
                FundSource[] = [];


            if (
                Array.isArray(
                    result
                )
            ) {

                data =
                    result;

            } else if (
                Array.isArray(
                    result?.data
                )
            ) {

                data =
                    result.data;

            } else if (
                Array.isArray(
                    result?.fundSources
                )
            ) {

                data =
                    result.fundSources;

            }


            setFundSources(
                data
            );

        } catch (error) {

            console.error(
                "LOAD FUND SOURCES ERROR:",
                error
            );

            setFundSources(
                []
            );

        } finally {

            setLoadingFunds(
                false
            );

        }

    }


    /*
    ============================================================
    LOAD RCDs
    ============================================================
    */

    async function loadRCDs() {

        try {

            setLoading(
                true
            );

            setError(
                ""
            );


            const params =
                new URLSearchParams();


            if (
                fundSourceId
            ) {

                params.set(
                    "fund_source_id",
                    fundSourceId
                );

            }


            if (
                dateFrom
            ) {

                params.set(
                    "date_from",
                    dateFrom
                );

            }


            if (
                dateTo
            ) {

                params.set(
                    "date_to",
                    dateTo
                );

            }


            if (
                search.trim()
            ) {

                params.set(
                    "search",
                    search.trim()
                );

            }


            const response =
                await axios.get(
                    `/api/rcd/remittance?${params.toString()}`,
                    {
                        withCredentials:
                            true,
                    }
                );


            const result =
                response.data;


            if (
                !result?.success
            ) {

                throw new Error(
                    result?.message ||
                    "Unable to load RCD records."
                );

            }


            const data =
                Array.isArray(
                    result?.data
                )
                    ? result.data
                    : [];


            setRCDs(
                data
            );


            /*
            ====================================================
            KEEP SELECTED RCD
            ====================================================
            */

            if (
                selectedRCD
            ) {

                const updated =
                    data.find(
                        (
                            item:
                                RCDReportItem
                        ) =>
                            item.id ===
                            selectedRCD.id
                    );


                if (
                    updated
                ) {

                    setSelectedRCD(
                        updated
                    );

                } else {

                    setSelectedRCD(
                        null
                    );

                }

            }

        } catch (error: any) {

            console.error(
                "LOAD RCD LIST ERROR:",
                error
            );

            setRCDs(
                []
            );

            setSelectedRCD(
                null
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load RCD records."
            );

        } finally {

            setLoading(
                false
            );

        }

    }


    /*
    ============================================================
    APPLY FILTERS
    ============================================================
    */

    function handleFilter() {

        loadRCDs();

    }


    /*
    ============================================================
    CLEAR FILTERS
    ============================================================
    */

    function handleClearFilters() {

        setFundSourceId(
            ""
        );

        setDateFrom(
            ""
        );

        setDateTo(
            ""
        );

        setSearch(
            ""
        );

        setSelectedRCD(
            null
        );


        setTimeout(
            () => {

                loadRCDs();

            },
            0
        );

    }


    /*
    ============================================================
    SEARCH ENTER
    ============================================================
    */

    function handleSearchKeyDown(
        event:
            React.KeyboardEvent<HTMLInputElement>
    ) {

        if (
            event.key ===
            "Enter"
        ) {

            loadRCDs();

        }

    }


    /*
    ============================================================
    CLOSE
    ============================================================
    */

    function handleClose() {

        setSelectedRCD(
            null
        );

        setActiveTab(
            "rcd"
        );

        onClose();

    }


    /*
    ============================================================
    SELECT RCD
    ============================================================
    */

    async function handleSelectRCD(
        rcd:
            RCDReportItem
    ) {

        try {

            setSelectedRCD(
                rcd
            );

            setActiveTab(
                "rcd"
            );

            setLoadingDetail(
                true
            );


            const response =
                await axios.get(
                    `/api/rcd/reports/${rcd.id}`,
                    {
                        withCredentials:
                            true,
                    }
                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to load RCD details."
                );

            }


            /*
            ====================================================
            STORE COMPLETE RCD RESPONSE
            ====================================================

            The detailed API response contains:

            rcd
            items
            remittance
            denominations
            user
            previousFormRows

            ====================================================
            */

            setSelectedRCD(
                {
                    ...response.data.rcd,

                    items:
                        response.data.items,

                    remittance:
                        response.data.remittance,

                    denominations:
                        response.data.denominations,

                    user:
                        response.data.user,

                    previousFormRows:
                        response.data.previousFormRows,

                } as RCDReportItem
            );

        } catch (error: any) {

            console.error(
                "LOAD RCD DETAIL ERROR:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load RCD details."
            );

        } finally {

            setLoadingDetail(
                false
            );

        }

    }


    /*
    ============================================================
    FUND SOURCE LABEL
    ============================================================
    */

    function getFundSourceLabel(
        fund:
            FundSource
    ) {

        const code =
            fund.fund_code ||
            "";

        const name =
            fund.fund_name ||
            fund.name ||
            fund.description ||
            "";


        if (
            code &&
            name
        ) {

            return `${code} - ${name}`;

        }


        return (
            code ||
            name ||
            "—"
        );

    }


    /*
    ============================================================
    DATE FORMAT
    ============================================================
    */

    function formatDate(
        value?:
            string |
            null
    ) {

        if (
            !value
        ) {

            return "—";

        }


        const date =
            new Date(
                `${value.substring(
                    0,
                    10
                )}T00:00:00`
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }


        return date.toLocaleDateString(
            "en-PH",
            {
                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",
            }
        );

    }


    /*
    ============================================================
    CURRENCY
    ============================================================
    */

    function formatCurrency(
        value:
            | number
            | string
            | null
            | undefined
    ) {

        return Number(
            value ?? 0
        ).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2,
            }
        );

    }


    /*
    ============================================================
    REPORT CONTENT
    ============================================================
    */

    function renderReport() {

        if (
            !selectedRCD
        ) {

            return (

                <div className="
                    flex
                    h-full
                    min-h-[500px]
                    items-center
                    justify-center
                    text-center
                ">

                    <div>

                        <div className="
                            text-lg
                            font-semibold
                            text-gray-500
                        ">
                            Select an RCD
                        </div>

                        <div className="
                            mt-1
                            text-sm
                            text-gray-400
                        ">
                            Select an RCD from the
                            list to view its report.
                        </div>

                    </div>

                </div>

            );

        }


        switch (
            activeTab
        ) {

            /*
            ====================================================
            RCD
            ====================================================
            */

            case "rcd":

                return (

                    <RCDReport
                        rcd={
                            selectedRCD
                        }
                    />

                );


            /*
            ====================================================
            DAILY RECEIPT BY FUND SOURCE
            ====================================================
            */

            case "daily_receipt":

                return (

                    <DailyReceiptByFundSource

                        report={
                            selectedRCD
                        }

                        items={
                            selectedRCD.items ??
                            []
                        }

                        fundSource={{

                            id:
                                selectedRCD.fund_source_id,

                            fund_code:
                                selectedRCD.fund_code,

                            fund_name:
                                selectedRCD.fund_name,

                            acronym:
                                selectedRCD.acronym,

                        }}

                        user={
                            selectedRCD.user ??
                            null
                        }

                    />

                );


            /*
            ====================================================
            ABSTRACT SUMMARY
            ====================================================
            */

            case "abstract_summary":

                return (
                    <AbstractSummary
                        rcd={
                            selectedRCD
                        }
                    />
                );


            case "abstract_account":

                return (
                    <AbstractSummaryBy
                        report={
                            selectedRCD
                        }

                        items={
                            selectedRCD?.items ??
                            []
                        }

                        fundSource={{
                            id:
                                selectedRCD?.fund_source_id,

                            fund_code:
                                selectedRCD?.fund_code,

                            fund_name:
                                selectedRCD?.fund_name,

                            acronym:
                                selectedRCD?.acronym,
                        }}

                        user={
                            selectedRCD?.user ??
                            null
                        }
                    />
                );

            default:

                return null;

        }

    }


    /*
    ============================================================
    CLOSED
    ============================================================
    */

    if (
        !open
    ) {

        return null;

    }


    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (

        <div className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
        ">

            <div className="
                flex
                h-[94vh]
                w-full
                max-w-[1600px]
                flex-col
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-2xl
            ">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    bg-blue-900
                    px-6
                    py-4
                    text-white
                ">

                    <div>

                        <h2 className="
                            text-xl
                            font-bold
                        ">
                            My RCD Reports
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-blue-100
                        ">
                            Select an RCD and view
                            its reports.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleClose
                        }
                        className="
                            rounded-lg
                            p-2
                            hover:bg-white/10
                        "
                    >

                        <X
                            size={22}
                        />

                    </button>

                </div>


                {/* =================================================
                    BODY
                ================================================= */}

                <div className="
                    grid
                    min-h-0
                    flex-1
                    grid-cols-12
                ">


                    {/* =================================================
                        LEFT — 4
                    ================================================= */}

                    <div className="
                        col-span-4
                        flex
                        min-h-0
                        flex-col
                        border-r
                        border-gray-200
                        bg-gray-50
                    ">


                        {/* =================================================
                            FILTERS
                        ================================================= */}

                        <div className="
                            shrink-0
                            border-b
                            border-gray-200
                            bg-white
                            p-4
                        ">

                            <div className="
                                text-sm
                                font-bold
                                text-gray-800
                            ">
                                RCD List
                            </div>


                            <div className="
                                mt-1
                                text-xs
                                text-gray-500
                            ">
                                Filter RCD reports by
                                fund source and coverage.
                            </div>


                            {/* FUND SOURCE */}

                            <div className="
                                mt-4
                            ">

                                <label className="
                                    mb-1
                                    block
                                    text-xs
                                    font-semibold
                                    text-gray-700
                                ">
                                    Fund Source
                                </label>


                                <select
                                    value={
                                        fundSourceId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setFundSourceId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        loadingFunds
                                    }
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3
                                        py-2
                                        text-sm
                                        text-gray-800
                                        outline-none
                                        focus:border-blue-500
                                    "
                                >

                                    <option value="">
                                        All Fund Sources
                                    </option>

                                    {
                                        fundSources.map(
                                            (
                                                fund
                                            ) => (

                                                <option
                                                    key={
                                                        fund.id
                                                    }
                                                    value={
                                                        fund.id
                                                    }
                                                >
                                                    {
                                                        getFundSourceLabel(
                                                            fund
                                                        )
                                                    }
                                                </option>

                                            )
                                        )
                                    }

                                </select>

                            </div>


                            {/* DATE RANGE */}

                            <div className="
                                mt-3
                                grid
                                grid-cols-2
                                gap-2
                            ">

                                <div>

                                    <label className="
                                        mb-1
                                        block
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                    ">
                                        From
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            dateFrom
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDateFrom(
                                                event.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-2
                                            py-2
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                        "
                                    />

                                </div>


                                <div>

                                    <label className="
                                        mb-1
                                        block
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                    ">
                                        To
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            dateTo
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDateTo(
                                                event.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-2
                                            py-2
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                        "
                                    />

                                </div>

                            </div>


                            {/* SEARCH */}

                            <div className="
                                mt-3
                                relative
                            ">

                                <Search
                                    size={16}
                                    className="
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-gray-400
                                    "
                                />


                                <input
                                    type="text"
                                    value={
                                        search
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={
                                        handleSearchKeyDown
                                    }
                                    placeholder="
                                        Search report no...
                                    "
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        py-2
                                        pl-9
                                        pr-3
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                    "
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="
                                mt-3
                                flex
                                gap-2
                            ">

                                <button
                                    type="button"
                                    onClick={
                                        handleFilter
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="
                                        flex
                                        flex-1
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        bg-blue-600
                                        px-3
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        hover:bg-blue-700
                                        disabled:opacity-50
                                    "
                                >

                                    <Search
                                        size={15}
                                    />

                                    Filter

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleClearFilters
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-gray-600
                                        hover:bg-gray-100
                                        disabled:opacity-50
                                    "
                                >
                                    Clear
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            RCD LIST
                        ================================================= */}

                        <div className="
                            min-h-0
                            flex-1
                            overflow-y-auto
                            p-3
                        ">

                            {
                                loading ? (

                                    <div className="
                                        flex
                                        h-full
                                        items-center
                                        justify-center
                                        text-gray-400
                                    ">

                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                        ">

                                            <RefreshCw
                                                size={17}
                                                className="
                                                    animate-spin
                                                "
                                            />

                                            Loading RCD records...

                                        </div>

                                    </div>

                                ) : error ? (

                                    <div className="
                                        flex
                                        h-full
                                        items-center
                                        justify-center
                                        p-4
                                        text-center
                                    ">

                                        <div>

                                            <div className="
                                                text-sm
                                                font-semibold
                                                text-red-600
                                            ">
                                                Unable to load RCD records
                                            </div>

                                            <div className="
                                                mt-1
                                                text-xs
                                                text-gray-500
                                            ">
                                                {error}
                                            </div>


                                            <button
                                                type="button"
                                                onClick={
                                                    loadRCDs
                                                }
                                                className="
                                                    mt-3
                                                    rounded-lg
                                                    bg-blue-600
                                                    px-4
                                                    py-2
                                                    text-xs
                                                    font-semibold
                                                    text-white
                                                "
                                            >
                                                Retry
                                            </button>

                                        </div>

                                    </div>

                                ) : rcds.length === 0 ? (

                                    <div className="
                                        flex
                                        h-full
                                        items-center
                                        justify-center
                                        text-center
                                    ">

                                        <div>

                                            <div className="
                                                text-sm
                                                font-semibold
                                                text-gray-500
                                            ">
                                                No RCD records
                                            </div>

                                            <div className="
                                                mt-1
                                                text-xs
                                                text-gray-400
                                            ">
                                                No RCD reports match
                                                the selected filters.
                                            </div>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="
                                        space-y-2
                                    ">

                                        {
                                            rcds.map(
                                                (
                                                    rcd
                                                ) => {

                                                    const selected =
                                                        selectedRCD?.id ===
                                                        rcd.id;


                                                    return (

                                                        <button
                                                            key={
                                                                rcd.id
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectRCD(
                                                                    rcd
                                                                )
                                                            }
                                                            className={`
                                                                w-full
                                                                rounded-xl
                                                                border
                                                                p-4
                                                                text-left
                                                                transition
                                                                ${
                                                                    selected
                                                                        ? "border-blue-600 bg-blue-50 shadow-sm"
                                                                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                                                                }
                                                            `}
                                                        >

                                                            <div className="
                                                                flex
                                                                items-start
                                                                justify-between
                                                                gap-3
                                                            ">

                                                                <div>

                                                                    <div className="
                                                                        text-sm
                                                                        font-bold
                                                                        text-gray-800
                                                                    ">
                                                                        {
                                                                            rcd.report_no
                                                                        }
                                                                    </div>

                                                                    <div className="
                                                                        mt-1
                                                                        text-xs
                                                                        text-gray-600
                                                                    ">
                                                                        {
                                                                            rcd.fund_code
                                                                                ? `${rcd.fund_code} - `
                                                                                : ""
                                                                        }

                                                                        {
                                                                            rcd.fund_name ??
                                                                            rcd.acronym ??
                                                                            "—"
                                                                        }
                                                                    </div>

                                                                </div>


                                                                <span
                                                                    className={`
                                                                        rounded-full
                                                                        px-2
                                                                        py-1
                                                                        text-[10px]
                                                                        font-bold
                                                                        ${
                                                                            String(
                                                                                rcd.status
                                                                            ).toUpperCase() ===
                                                                            "DRAFT"
                                                                                ? "bg-yellow-100 text-yellow-700"
                                                                                : "bg-green-100 text-green-700"
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        rcd.status
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div className="
                                                                mt-3
                                                                grid
                                                                grid-cols-2
                                                                gap-2
                                                                text-xs
                                                            ">

                                                                <div>

                                                                    <div className="
                                                                        text-gray-400
                                                                    ">
                                                                        Report Date
                                                                    </div>

                                                                    <div className="
                                                                        mt-0.5
                                                                        font-semibold
                                                                        text-gray-700
                                                                    ">
                                                                        {
                                                                            formatDate(
                                                                                rcd.report_date
                                                                            )
                                                                        }
                                                                    </div>

                                                                </div>


                                                                <div>

                                                                    <div className="
                                                                        text-gray-400
                                                                    ">
                                                                        Coverage
                                                                    </div>

                                                                    <div className="
                                                                        mt-0.5
                                                                        font-semibold
                                                                        text-gray-700
                                                                    ">

                                                                        {
                                                                            formatDate(
                                                                                rcd.date_from
                                                                            )
                                                                        }

                                                                        {" - "}

                                                                        {
                                                                            formatDate(
                                                                                rcd.date_to
                                                                            )
                                                                        }

                                                                    </div>

                                                                </div>

                                                            </div>


                                                            <div className="
                                                                mt-3
                                                                border-t
                                                                border-gray-100
                                                                pt-3
                                                                text-right
                                                            ">

                                                                <span className="
                                                                    text-[11px]
                                                                    text-gray-400
                                                                ">
                                                                    Total Collections
                                                                </span>

                                                                <div className="
                                                                    text-sm
                                                                    font-bold
                                                                    text-gray-800
                                                                ">
                                                                    ₱
                                                                    {
                                                                        formatCurrency(
                                                                            rcd.total_collections
                                                                        )
                                                                    }
                                                                </div>

                                                            </div>

                                                        </button>

                                                    );

                                                }
                                            )
                                        }

                                    </div>

                                )
                            }

                        </div>

                    </div>


                    {/* =================================================
                        RIGHT — 8
                    ================================================= */}

                    <div className="
                        col-span-8
                        flex
                        min-h-0
                        flex-col
                    ">


                        {/* =================================================
                            TABS
                        ================================================= */}

                        <div className="
                            flex
                            shrink-0
                            overflow-x-auto
                            border-b
                            border-gray-200
                            bg-white
                        ">

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        "rcd"
                                    )
                                }
                                className={`
                                    whitespace-nowrap
                                    px-5
                                    py-4
                                    text-sm
                                    font-semibold
                                    ${
                                        activeTab ===
                                        "rcd"
                                            ? "border-b-2 border-blue-600 text-blue-700"
                                            : "text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >
                                RCD
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        "daily_receipt"
                                    )
                                }
                                className={`
                                    whitespace-nowrap
                                    px-5
                                    py-4
                                    text-sm
                                    font-semibold
                                    ${
                                        activeTab ===
                                        "daily_receipt"
                                            ? "border-b-2 border-blue-600 text-blue-700"
                                            : "text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >
                                Daily Receipt by Fund Source
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        "abstract_summary"
                                    )
                                }
                                className={`
                                    whitespace-nowrap
                                    px-5
                                    py-4
                                    text-sm
                                    font-semibold
                                    ${
                                        activeTab ===
                                        "abstract_summary"
                                            ? "border-b-2 border-blue-600 text-blue-700"
                                            : "text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >
                                Abstract Summary
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        "abstract_account"
                                    )
                                }
                                className={`
                                    whitespace-nowrap
                                    px-5
                                    py-4
                                    text-sm
                                    font-semibold
                                    ${
                                        activeTab ===
                                        "abstract_account"
                                            ? "border-b-2 border-blue-600 text-blue-700"
                                            : "text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >
                                Abstract by Account
                            </button>

                        </div>


                        {/* =================================================
                            REPORT PREVIEW
                        ================================================= */}

                        <div className="
                            min-h-0
                            flex-1
                            overflow-auto
                            bg-gray-100
                            p-6
                        ">

                            {
                                renderReport()
                            }

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}