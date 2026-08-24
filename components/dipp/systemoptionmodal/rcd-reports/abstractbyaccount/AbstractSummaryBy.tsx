"use client";

import {
    useEffect,
    useState,
} from "react";

import "./AbstractSummaryByPreview.css";

import AbstractSummaryByHeader from "./AbstractSummaryByHeader";

import AbstractSummaryByAccounts from "./AbstractSummaryByAccounts";


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


export default function AbstractSummaryByAccount({
    report,
    items = [],
    fundSource,
    user,
}: Props) {

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


    useEffect(() => {

        if (!report?.id) {

            setAccountRows([]);

            return;
        }


        let cancelled = false;


        async function loadAbstractSummary() {

            try {

                setLoading(true);

                setError(null);


                const url =
                    `/api/rcd/reports/${report.id}/abstract-by-summary`;


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


                if (!response.ok) {

                    throw new Error(
                        data?.error ??
                        "Failed to load Abstract Summary."
                    );

                }


                if (cancelled) {
                    return;
                }


                const rows =
                    Array.isArray(
                        data?.items
                    )
                        ? data.items
                        : [];


                setAccountRows(rows);

            } catch (err: any) {

                console.error(
                    "LOAD ABSTRACT SUMMARY ERROR:",
                    err
                );


                if (!cancelled) {

                    setError(
                        err?.message ??
                        "Failed to load Abstract Summary."
                    );

                    setAccountRows([]);

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        loadAbstractSummary();


        return () => {

            cancelled = true;

        };

    }, [
        report?.id,
    ]);


    if (!report) {

        return (
            <div className="abstract-by-summary-empty-state">
                Select a report from the list.
            </div>
        );

    }


    return (

        <div className="abstract-by-summary-preview-wrapper">

            <div
                id="abstract-by-summary-print-area"
                className="abstract-by-summary-paper"
            >

                <AbstractSummaryByHeader
                    report={report}
                    fundSource={fundSource}
                    user={user}
                    formatDate={formatDate}
                />


                {loading ? (

                    <div className="abstract-by-summary-status">
                        Loading account summary...
                    </div>

                ) : error ? (

                    <div className="abstract-by-summary-status abstract-by-summary-error">
                        {error}
                    </div>

                ) : (

                    <AbstractSummaryByAccounts
                        items={accountRows}
                        formatAmount={formatAmount}
                    />

                )}


                <div className="abstract-by-summary-signatories">

                    <div className="abstract-by-summary-signature">

                        <div className="abstract-by-summary-signature-label">
                            Prepared By:
                        </div>

                        <div className="abstract-by-summary-signature-name">
                            {getFullName(user)}
                        </div>

                        <div className="abstract-by-summary-signature-role">
                            Accountable Officer
                        </div>

                    </div>


                    <div className="abstract-by-summary-signature">

                        <div className="abstract-by-summary-signature-label">
                            Noted By:
                        </div>

                        <div className="abstract-by-summary-signature-name">
                            MARIA CRISTINA B. FORMACION
                        </div>

                        <div className="abstract-by-summary-signature-role">
                            Municipal Treasurer
                        </div>

                    </div>

                </div>


                <div className="abstract-by-summary-footer">

                    <span>
                        Abstract of Collections
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
