"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    RefreshCw,
    X,
    Printer,
} from "lucide-react";

import RCDRemittanceFilters
    from "./RCDRemittanceFilters";

import RCDRemittanceList
    from "./RCDRemittanceList";

import RCDRemittancePreview
    from "./printable/RCDRemittancePreview";

import RCDRemittanceFormModal
    from "./RCDRemittanceFormModal";

import {
    RCD,
    FundSource,
    RCDRemittance,
} from "./RCDRemittanceTypes";


type Props = {
    open: boolean;

    onClose: () => void;

    onSuccess?: () => void;
};


export default function RCDRemittanceModal({

    open,

    onClose,

    onSuccess,

}: Props) {


    /*
    =====================================================
    RCD LIST
    =====================================================
    */

    const [
        rcds,
        setRCDs,
    ] = useState<RCD[]>([]);


    /*
    =====================================================
    FUND SOURCES
    =====================================================
    */

    const [
        fundSources,
        setFundSources,
    ] = useState<FundSource[]>([]);


    /*
    =====================================================
    SELECTED RCD
    =====================================================
    */

    const [
        selectedRCD,
        setSelectedRCD,
    ] = useState<RCD | null>(
        null
    );


    /*
    =====================================================
    SELECTED REMITTANCE
    =====================================================
    */

    const [
        remittance,
        setRemittance,
    ] = useState<RCDRemittance | null>(
        null
    );


    /*
    =====================================================
    FORM
    =====================================================
    */

    const [
        formOpen,
        setFormOpen,
    ] = useState(false);


    /*
    =====================================================
    PREVIEW
    =====================================================
    */

    const [
        previewOpen,
        setPreviewOpen,
    ] = useState(false);


    /*
    =====================================================
    LOADING
    =====================================================
    */

    const [
        loading,
        setLoading,
    ] = useState(false);


    /*
    =====================================================
    FILTERS
    =====================================================
    */

    const [
        dateFrom,
        setDateFrom,
    ] = useState("");


    const [
        dateTo,
        setDateTo,
    ] = useState("");


    const [
        fundSourceId,
        setFundSourceId,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    /*
    =====================================================
    LOAD WHEN OPEN
    =====================================================
    */

    useEffect(() => {

        if (!open) {
            return;
        }

        loadRCDs();

        loadFundSources();

    }, [
        open,
    ]);


    /*
    =====================================================
    LOAD RCDS
    =====================================================
    */

    async function loadRCDs() {

        try {

            setLoading(true);


            const response =
                await axios.get(
                    "/api/rcd/remittance"
                );


            setRCDs(
                response.data?.data ??
                []
            );

        } catch (error) {

            console.error(
                "LOAD RCD ERROR:",
                error
            );


            setRCDs([]);

        } finally {

            setLoading(false);

        }

    }


    /*
    =====================================================
    LOAD FUND SOURCES
    =====================================================
    */

    async function loadFundSources() {

        try {

            const response =
                await axios.get(
                    "/api/fund-sources"
                );


            const data =
                Array.isArray(
                    response.data
                )

                    ? response.data

                    : Array.isArray(
                        response.data?.data
                    )

                        ? response.data.data

                        : [];


            setFundSources(
                data
            );

        } catch (error) {

            console.error(
                "LOAD FUND SOURCES ERROR:",
                error
            );


            setFundSources([]);

        }

    }


    /*
    =====================================================
    FILTER RCDS
    =====================================================
    */

    const filteredRCDs =
        useMemo(
            () => {

                return rcds.filter(
                    (rcd) => {

                        if (
                            dateFrom &&
                            rcd.report_date <
                            dateFrom
                        ) {

                            return false;

                        }


                        if (
                            dateTo &&
                            rcd.report_date >
                            dateTo
                        ) {

                            return false;

                        }


                        if (
                            fundSourceId &&
                            rcd.fund_source_id !==
                            fundSourceId
                        ) {

                            return false;

                        }


                        if (
                            search.trim()
                        ) {

                            const keyword =
                                search
                                    .trim()
                                    .toLowerCase();


                            const searchable = [

                                rcd.report_no,

                                rcd.fund_code,

                                rcd.fund_name,

                                rcd.acronym,

                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                            if (
                                !searchable.includes(
                                    keyword
                                )
                            ) {

                                return false;

                            }

                        }


                        return true;

                    }
                );

            },
            [
                rcds,
                dateFrom,
                dateTo,
                fundSourceId,
                search,
            ]
        );


    /*
    =====================================================
    SELECT RCD
    =====================================================
    */

    function selectRCD(
        rcd: RCD
    ) {

        setSelectedRCD(
            rcd
        );


        /*
        =================================================
        ALREADY REMITTED
        =================================================
        */

        if (
            rcd.has_remittance &&
            rcd.remittance
        ) {

            setRemittance(
                rcd.remittance
            );


            setFormOpen(
                false
            );


            setPreviewOpen(
                true
            );


            return;

        }


        /*
        =================================================
        NOT YET REMITTED
        =================================================
        */

        setRemittance(
            null
        );


        setPreviewOpen(
            false
        );


        setFormOpen(
            true
        );

    }


    /*
    =====================================================
    FORM SUCCESS
    =====================================================
    */

    function handleFormSuccess(
        newRemittance: RCDRemittance
    ) {

        setRemittance(
            newRemittance
        );


        setFormOpen(
            false
        );


        setPreviewOpen(
            true
        );


        setSelectedRCD(
            previous => {

                if (!previous) {

                    return previous;

                }


                return {

                    ...previous,

                    has_remittance:
                        true,

                    remittance:
                        newRemittance,

                };

            }
        );


        loadRCDs();


        onSuccess?.();

    }


    /*
    =====================================================
    CLOSE
    =====================================================
    */

    function handleClose() {

        if (
            formOpen
        ) {

            return;

        }


        setSelectedRCD(
            null
        );


        setRemittance(
            null
        );


        setFormOpen(
            false
        );


        setPreviewOpen(
            false
        );


        onClose();

    }


    /*
    =====================================================
    FORM CLOSE
    =====================================================
    */

    function handleFormClose() {

        setFormOpen(
            false
        );

    }


    /*
    =====================================================
    PRINT

    IMPORTANT:
    ONLY USE window.print().

    NO window.open().
    NO document.write().
    NO printWindow.
    =====================================================
    */

    function handlePrint() {

        if (
            !selectedRCD ||
            !remittance
        ) {

            return;

        }


        window.print();

    }


    /*
    =====================================================
    CLOSED
    =====================================================
    */

    if (!open) {

        return null;

    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <>

            {/* =================================================
                MAIN MODAL
            ================================================= */}

            <div className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                p-6
            ">

                <div className="
                    flex
                    h-[92vh]
                    w-full
                    max-w-7xl
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                ">


                    {/* =========================================
                        HEADER
                    ========================================= */}

                    <div className="
                        flex
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
                                My RCD Remittance
                            </h2>


                            <p className="
                                mt-1
                                text-sm
                                text-blue-100
                            ">
                                Select an RCD to view
                                or process its remittance.
                            </p>

                        </div>


                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <button
                                type="button"
                                onClick={
                                    loadRCDs
                                }
                                disabled={
                                    loading
                                }
                                className="
                                    rounded-lg
                                    p-2
                                    hover:bg-white/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                                title="Refresh"
                            >

                                <RefreshCw
                                    size={19}
                                    className={
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                            </button>


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
                                title="Close"
                            >

                                <X
                                    size={22}
                                />

                            </button>

                        </div>

                    </div>


                    {/* =========================================
                        BODY
                    ========================================= */}

                    <div className="
                        flex
                        min-h-0
                        flex-1
                    ">


                        {/* =====================================
                            LEFT
                        ===================================== */}

                        <div className="
                            flex
                            w-1/4
                            min-w-0
                            flex-col
                            border-r
                            border-gray-200
                            bg-gray-50
                        ">

                            <RCDRemittanceFilters

                                dateFrom={
                                    dateFrom
                                }

                                dateTo={
                                    dateTo
                                }

                                fundSourceId={
                                    fundSourceId
                                }

                                search={
                                    search
                                }

                                fundSources={
                                    fundSources
                                }

                                onDateFromChange={
                                    setDateFrom
                                }

                                onDateToChange={
                                    setDateTo
                                }

                                onFundSourceChange={
                                    setFundSourceId
                                }

                                onSearchChange={
                                    setSearch
                                }

                            />


                            <div className="
                                min-h-0
                                flex-1
                                overflow-y-auto
                            ">

                                <RCDRemittanceList

                                    rcds={
                                        filteredRCDs
                                    }

                                    selectedRCDId={
                                        selectedRCD?.id ??
                                        null
                                    }

                                    loading={
                                        loading
                                    }

                                    onSelect={
                                        selectRCD
                                    }

                                />

                            </div>

                        </div>


                        {/* =====================================
                            RIGHT PREVIEW
                        ===================================== */}

                        <div className="
                            flex
                            w-3/4
                            min-w-0
                            flex-col
                            bg-white
                        ">

                            {selectedRCD ? (

                                previewOpen &&
                                remittance ? (

                                    <RCDRemittancePreview

                                        rcd={
                                            selectedRCD
                                        }

                                        remittance={
                                            remittance
                                        }

                                    />

                                ) : (

                                    <div className="
                                        flex
                                        h-full
                                        items-center
                                        justify-center
                                        px-10
                                        text-center
                                    ">

                                        <div>

                                            <div className="
                                                text-sm
                                                font-semibold
                                                text-gray-500
                                            ">
                                                RCD Selected
                                            </div>

                                            <div className="
                                                mt-1
                                                text-xs
                                                text-gray-400
                                            ">
                                                Complete the
                                                remittance form
                                                to generate the
                                                preview.
                                            </div>

                                        </div>

                                    </div>

                                )

                            ) : (

                                <div className="
                                    flex
                                    h-full
                                    items-center
                                    justify-center
                                    px-10
                                    text-center
                                ">

                                    <div>

                                        <div className="
                                            text-sm
                                            font-semibold
                                            text-gray-500
                                        ">
                                            Select an RCD
                                        </div>

                                        <div className="
                                            mt-1
                                            text-xs
                                            text-gray-400
                                        ">
                                            Select an RCD from
                                            the list to process
                                            or view its remittance.
                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =========================================
                        FOOTER
                    ========================================= */}

                    <div className="
                        flex
                        items-center
                        justify-between
                        border-t
                        border-gray-200
                        px-6
                        py-3
                    ">

                        <span className="
                            text-xs
                            text-gray-500
                        ">

                            {selectedRCD

                                ? `Selected: ${selectedRCD.report_no}`

                                : "Select an RCD from the list."

                            }

                        </span>


                        <button
                            type="button"
                            onClick={
                                handlePrint
                            }
                            disabled={
                                !selectedRCD ||
                                !remittance
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-blue-600
                                px-5
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <Printer
                                size={17}
                            />

                            Print

                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                REMITTANCE FORM
            ================================================= */}

            <RCDRemittanceFormModal

                open={
                    formOpen
                }

                rcd={
                    selectedRCD
                }

                onClose={
                    handleFormClose
                }

                onSuccess={
                    handleFormSuccess
                }

            />

        </>

    );

}