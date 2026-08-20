"use client";

import {
    useEffect,
    useState,
} from "react";

import "./AbstractSummaryPreview.css";

import AbstractSummaryHeader from "./AbstractSummaryHeader";
import AbstractSummaryAccounts from "./AbstractSummaryAccounts";


type Props = {
    report?: any;
    items?: any[];
    fundSource?: any;
    user?: any;
};


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


export default function AbstractSummary({
    report,
    items = [],
    fundSource,
    user,
}: Props) {

    /* ============================================================
       ACCOUNT SUMMARY DATA
    ============================================================ */

    const [
        accountRows,
        setAccountRows,
    ] = useState<any[]>(
        Array.isArray(items)
            ? items
            : []
    );


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /* ============================================================
       LOAD ACCOUNT SUMMARY FROM API
    ============================================================ */

    useEffect(() => {

        if (!report?.id) {

            setAccountRows([]);

            return;

        }


        let cancelled =
            false;


        async function loadAbstractSummary() {

            try {

                setLoading(true);

                setError(null);


                const url =
                    `/api/rcd/reports/${report.id}/abstract-summary`;


                console.log(
                    "ABSTRACT SUMMARY REQUEST:",
                    url
                );


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


                console.log(
                    "ABSTRACT SUMMARY RESPONSE:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data?.error ??
                        "Failed to load Abstract Summary."
                    );

                }


                if (
                    cancelled
                ) {
                    return;
                }


                const rows =
                    Array.isArray(
                        data?.items
                    )
                        ? data.items
                        : [];


                console.log(
                    "ABSTRACT SUMMARY ROWS:",
                    rows
                );


                setAccountRows(
                    rows
                );


            } catch (
                err: any
            ) {

                console.error(
                    "LOAD ABSTRACT SUMMARY ERROR:",
                    err
                );


                if (
                    !cancelled
                ) {

                    setError(
                        err?.message ??
                        "Failed to load Abstract Summary."
                    );

                    setAccountRows([]);

                }

            } finally {

                if (
                    !cancelled
                ) {

                    setLoading(
                        false
                    );

                }

            }

        }


        loadAbstractSummary();


        return () => {

            cancelled =
                true;

        };

    }, [
        report?.id,
    ]);


    /* ============================================================
       EMPTY REPORT
    ============================================================ */

    if (!report) {

        return (
            <div className="
                flex
                min-h-[500px]
                items-center
                justify-center
                text-sm
                text-gray-400
            ">
                Select a report from the list.
            </div>
        );

    }


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
                    report={report}
                    fundSource={fundSource}
                    user={user}
                    formatDate={formatDate}
                />


                {/* ==================================================
                    ACCOUNT SUMMARY
                ================================================== */}

                {loading ? (

                    <div className="
                        flex
                        min-h-[250px]
                        items-center
                        justify-center
                        text-sm
                        text-gray-400
                    ">

                        Loading account summary...

                    </div>

                ) : error ? (

                    <div className="
                        flex
                        min-h-[250px]
                        items-center
                        justify-center
                        text-sm
                        text-red-500
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

                    {/* LEFT */}

                    <div>

                        <div className="
                            abstract-summary-signature-label
                        ">
                            Prepared by:
                        </div>


                        <div className="
                            abstract-summary-signature-name
                        ">

                            {
                                getFullName(
                                    user
                                )
                            }

                        </div>


                        <div className="
                            abstract-summary-signature-role
                        ">

                            Accountable Officer

                        </div>

                    </div>


                    {/* RIGHT */}

                    <div>

                        <div className="
                            abstract-summary-signature-label
                        ">
                            Noted by:
                        </div>


                        <div className="
                            abstract-summary-signature-name
                        ">

                            IMLYN B. PARAPINA

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
                        Abstract Summary
                    </span>


                    <span>

                        {
                            report?.report_no ??
                            "—"
                        }

                    </span>

                </div>

            </div>

        </div>

    );
}