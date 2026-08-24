"use client";

import {
    useEffect,
    useState,
} from "react";

import "./AbstractSummaryPreview.css";

import AbstractSummaryHeader
    from "./AbstractSummaryHeader";

import AbstractSummaryAccounts
    from "./AbstractSummaryAccounts";


type Props = {
    rcd?: any;
    report?: any;
    items?: any[];
    fundSource?: any;
    user?: any;
};


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(
    value?: string | null
): string {

    if (!value) {
        return "—";
    }

    const date =
        new Date(
            `${String(value).substring(
                0,
                10
            )}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "long",
            day: "numeric",
            year: "numeric",
        }
    );
}


/* ============================================================
   AMOUNT FORMAT
============================================================ */

function formatAmount(
    value: any
): string {

    return Number(
        value ?? 0
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}


/* ============================================================
   USER NAME
============================================================ */

function getFullName(
    user: any
): string {

    if (!user) {
        return "—";
    }

    if (user.full_name) {
        return user.full_name;
    }

    const parts = [
        user.first_name,
        user.middle_name,
        user.last_name,
        user.suffix,
    ].filter(Boolean);

    return (
        parts.join(" ") ||
        user.name ||
        user.username ||
        "—"
    );
}


/* ============================================================
   COMPONENT
============================================================ */

export default function AbstractSummary({
    rcd,
    report,
    items = [],
    fundSource,
    user,
}: Props) {


    /* ========================================================
       INITIAL REPORT
    ======================================================== */

    const initialReport =
        rcd ??
        report ??
        null;


    /* ========================================================
       REPORT FROM API
    ======================================================== */

    const [
        selectedReport,
        setSelectedReport,
    ] = useState<any>(
        initialReport
    );


    /* ========================================================
       FUND SOURCE FROM API
    ======================================================== */

    const [
        selectedFundSource,
        setSelectedFundSource,
    ] = useState<any>(
        fundSource ??
        null
    );


    /* ========================================================
       COLLECTION ITEMS
    ======================================================== */

    const [
        accountRows,
        setAccountRows,
    ] = useState<any[]>(
        Array.isArray(items)
            ? items
            : []
    );


    /* ========================================================
       LOADING
    ======================================================== */

    const [
        loading,
        setLoading,
    ] = useState(false);


    /* ========================================================
       ERROR
    ======================================================== */

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /* ============================================================
       LOAD ABSTRACT SUMMARY
    ============================================================ */

    useEffect(() => {

        const reportId =
            initialReport?.id;


        if (!reportId) {

            setSelectedReport(
                initialReport
            );

            setSelectedFundSource(
                fundSource ??
                null
            );

            setAccountRows(
                Array.isArray(items)
                    ? items
                    : []
            );

            return;

        }


        let cancelled = false;


        async function loadAbstractSummary() {

            try {

                setLoading(true);

                setError(null);


                /* ==================================================
                   API
                ================================================== */

                const url =
                    `/api/rcd/reports/${reportId}/abstractsummary`;


                const response =
                    await fetch(
                        url,
                        {
                            method: "GET",
                            cache: "no-store",
                        }
                    );


                const data =
                    await response.json();


                /* ==================================================
                   ERROR
                ================================================== */

                if (!response.ok) {

                    throw new Error(
                        data?.error ??
                        "Failed to load Abstract Summary."
                    );

                }


                if (cancelled) {
                    return;
                }


                /* ==================================================
                   RCD
                ================================================== */

                if (
                    data?.rcd
                ) {

                    setSelectedReport(
                        data.rcd
                    );

                }
                else {

                    setSelectedReport(
                        initialReport
                    );

                }


                /* ==================================================
                   FUND SOURCE
                ================================================== */

                if (
                    data?.fund_source
                ) {

                    setSelectedFundSource(
                        data.fund_source
                    );

                }
                else {

                    setSelectedFundSource(
                        fundSource ??
                        null
                    );

                }


                /* ==================================================
                   ITEMS
                ================================================== */

                const rows =
                    Array.isArray(
                        data?.items
                    )
                        ? data.items
                        : [];


                setAccountRows(
                    rows
                );


            }
            catch (
                err: any
            ) {

                console.error(
                    "LOAD ABSTRACT SUMMARY ERROR:",
                    err
                );


                if (!cancelled) {

                    setError(
                        err?.message ??
                        "Failed to load Abstract Summary."
                    );


                    setAccountRows(
                        []
                    );

                }

            }
            finally {

                if (!cancelled) {

                    setLoading(
                        false
                    );

                }

            }

        }


        loadAbstractSummary();


        return () => {

            cancelled = true;

        };


    }, [
        initialReport?.id,
    ]);


    /* ============================================================
       NO REPORT
    ============================================================ */

    if (!selectedReport) {

        return (

            <div className="
                abstract-summary-empty-state
            ">

                Select a report from the list.

            </div>

        );

    }


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div className="
            abstract-summary-preview-wrapper
        ">


            <div
                id="abstract-summary-print-area"
                className="
                    abstract-summary-paper
                "
            >


                {/* ==================================================
                    HEADER
                ================================================== */}

                <AbstractSummaryHeader
                    report={
                        selectedReport
                    }

                    fundSource={
                        selectedFundSource
                    }

                    user={
                        user
                    }
                />


                {/* ==================================================
                    COLLECTION TABLE
                ================================================== */}

                {loading ? (

                    <div className="
                        abstract-summary-status
                    ">

                        Loading collections...

                    </div>

                ) : error ? (

                    <div className="
                        abstract-summary-status
                        abstract-summary-error
                    ">

                        {error}

                    </div>

                ) : (

                    <AbstractSummaryAccounts

                        items={
                            accountRows
                        }

                        formatAmount={
                            formatAmount
                        }

                    />

                )}


                {/* ==================================================
                    SIGNATORIES
                ================================================== */}

                <div className="
                    abstract-summary-signatories
                ">


                    {/* ==================================================
                        PREPARED BY
                    ================================================== */}

                    <div className="
                        abstract-summary-signature
                    ">

                        <div className="
                            abstract-summary-signature-label
                        ">

                            Prepared By:

                        </div>


                        <div className="
                            abstract-summary-signature-name
                        ">

                            {
                                selectedReport?.rcd_by_name ??
                                getFullName(user)
                            }

                        </div>


                        <div className="
                            abstract-summary-signature-role
                        ">

                            Accountable Officer

                        </div>

                    </div>


                    {/* ==================================================
                        NOTED BY
                    ================================================== */}

                    <div className="
                        abstract-summary-signature
                    ">

                        <div className="
                            abstract-summary-signature-label
                        ">

                            Noted By:

                        </div>


                        <div className="
                            abstract-summary-signature-name
                        ">

                            MARIA CRISTINA B. FORMACION

                        </div>


                        <div className="
                            abstract-summary-signature-role
                        ">

                            Municipal Treasurer

                        </div>

                    </div>


                </div>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="
                    abstract-summary-footer
                ">

                    <span>

                        Abstract of Collections

                    </span>


                    <span>

                        {
                            selectedReport?.report_no ??
                            "—"
                        }

                    </span>

                </div>


            </div>

        </div>

    );

}