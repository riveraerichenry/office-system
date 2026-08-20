"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import AssessmentToolbar from "./AssessmentToolbar";
import AddAssessmentModal from "./AddAssessmentModal";
import Swal from "sweetalert2";
import BillingPreviewDialog from "./BillingPreviewDialog";

import { computeRPT } from "@/lib/rpt/computation";

type BillingRequest = {
    property: any;

    fromQuarter: number;
    fromYear: number;

    toQuarter: number;
    toYear: number;

    paymentDate?: Date;
};

type Props = {
    assessment: BillingRequest;
};

type FaaSRevision = {
    objid: string;
    realpropertyid: string;

    tdno: string | null;
    utdno: string | null;
    prevtdno: string | null;

    state: string | null;

    effectivityyear: number;
    effectivityqtr: number;

    totalav: number | string | null;
    totalmv: number | string | null;

    fullpin: string | null;
    pin: string | null;

    owner_name: string | null;
    owner_address: string | null;

    barangayid: string | null;
    barangay_name: string | null;

    classification_name: string | null;
    rputype: string | null;
};

type AssessmentRow = {
    arp: string;

    kind: string;

    coverage: string;

    assessed_value: number;

    tax_due: number;

    basic: number;

    sef: number;

    penalty_percent: number;

    penalty: number;

    discount_percent: number;

    discount: number;

    total: number;

    startQuarter: number;
    startYear: number;

    endQuarter: number;
    endYear: number;

    faasState?: string;

    faasEffectivityYear?: number;

    faasEffectivityQuarter?: number;

    realpropertyid?: string;

    /*
     * Indicates that the AV came from
     * the next known FAAS revision because
     * there was no historical FAAS yet
     * for that billing period.
     */
    inheritedFromNextRevision?: boolean;
};

type Totals = {
    taxDue: number;

    basic: number;

    sef: number;

    penalty: number;

    discount: number;

    total: number;
};


/* =========================================================
   MONEY
========================================================= */

function money(value: number) {
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}


/* =========================================================
   COVERAGE LABEL
========================================================= */

function coverageLabel(
    startQuarter: number,
    startYear: number,
    endQuarter: number,
    endYear: number
) {

    /*
     * Same quarter
     *
     * Q1 2026
     */

    if (
        startQuarter === endQuarter &&
        startYear === endYear
    ) {
        return `Q${startQuarter} ${startYear}`;
    }


    /*
     * Same year
     *
     * Q1-Q4 2021
     */

    if (startYear === endYear) {
        return `Q${startQuarter}-Q${endQuarter} ${startYear}`;
    }


    /*
     * Different years
     *
     * Q4 2024 - Q1 2025
     */

    return `Q${startQuarter} ${startYear} - Q${endQuarter} ${endYear}`;
}


/* =========================================================
   PERIOD VALUE
========================================================= */

function periodValue(
    year: number,
    quarter: number
) {
    return (
        Number(year) * 4 +
        Number(quarter)
    );
}


/* =========================================================
   VALIDATE FAAS REVISION
========================================================= */

function isValidRevision(
    revision: FaaSRevision
) {

    const year =
        Number(
            revision.effectivityyear
        );

    const quarter =
        Number(
            revision.effectivityqtr
        );


    if (
        !Number.isInteger(year) ||
        !Number.isInteger(quarter)
    ) {
        return false;
    }


    /*
     * Ignore corrupt years such as:
     *
     * 66230015
     * 2302
     */

    if (
        year < 1900 ||
        year > 2100
    ) {
        return false;
    }


    if (
        quarter < 1 ||
        quarter > 4
    ) {
        return false;
    }


    return true;
}


/* =========================================================
   FIND APPLICABLE REVISION
========================================================= */

function findApplicableRevision(
    revisions: FaaSRevision[],
    year: number,
    quarter: number
) {

    const billingPeriod =
        periodValue(
            year,
            quarter
        );


    const applicable =
        revisions
            .filter(
                (revision) =>
                    isValidRevision(
                        revision
                    )
            )
            .filter(
                (revision) =>
                    periodValue(
                        Number(
                            revision.effectivityyear
                        ),
                        Number(
                            revision.effectivityqtr
                        )
                    ) <=
                    billingPeriod
            )
            .sort(
                (a, b) =>
                    periodValue(
                        Number(
                            b.effectivityyear
                        ),
                        Number(
                            b.effectivityqtr
                        )
                    ) -
                    periodValue(
                        Number(
                            a.effectivityyear
                        ),
                        Number(
                            a.effectivityqtr
                        )
                    )
            );


    return (
        applicable[0] ??
        null
    );
}


/* =========================================================
   FIND NEXT REVISION
========================================================= */

/*
 * Used when the billing period is BEFORE
 * the earliest known FAAS revision.
 *
 * Example:
 *
 * Billing: 2018
 *
 * Earliest FAAS:
 * 2019 Q1
 *
 * Result:
 *
 * TD = blank
 * AV = 2019 FAAS AV
 */

function findNextRevision(
    revisions: FaaSRevision[],
    year: number,
    quarter: number
) {

    const billingPeriod =
        periodValue(
            year,
            quarter
        );


    const next =
        revisions
            .filter(
                (revision) =>
                    isValidRevision(
                        revision
                    )
            )
            .filter(
                (revision) =>
                    periodValue(
                        Number(
                            revision.effectivityyear
                        ),
                        Number(
                            revision.effectivityqtr
                        )
                    ) >
                    billingPeriod
            )
            .sort(
                (a, b) =>
                    periodValue(
                        Number(
                            a.effectivityyear
                        ),
                        Number(
                            a.effectivityqtr
                        )
                    ) -
                    periodValue(
                        Number(
                            b.effectivityyear
                        ),
                        Number(
                            b.effectivityqtr
                        )
                    )
            );


    return (
        next[0] ??
        null
    );
}


/* =========================================================
   GENERATE HISTORICAL BILLING ROWS
========================================================= */

async function generateCoverageRows(
    property: any,

    revisions: FaaSRevision[],

    fromQuarter: number,
    fromYear: number,

    toQuarter: number,
    toYear: number,

    paymentDate: Date
): Promise<AssessmentRow[]> {

    const rows: AssessmentRow[] = [];


    type QuarterAssessment = {

        year: number;

        quarter: number;

        revision:
            FaaSRevision | null;

        assessedValue: number;

        arp: string;

        kind: string;

        result:
            ReturnType<
                typeof computeRPT
            >;

        inheritedFromNextRevision: boolean;
    };


    const quarters:
        QuarterAssessment[] = [];


    /*
     * Generate every quarter individually.
     */

    for (
        let year = fromYear;
        year <= toYear;
        year++
    ) {

        let startQuarter = 1;

        let endQuarter = 4;


        if (
            year === fromYear
        ) {
            startQuarter =
                fromQuarter;
        }


        if (
            year === toYear
        ) {
            endQuarter =
                toQuarter;
        }


        for (
            let quarter = startQuarter;
            quarter <= endQuarter;
            quarter++
        ) {

            /*
             * First try to find a historical FAAS
             * effective on or before this quarter.
             */

            const revision =
                findApplicableRevision(
                    revisions,
                    year,
                    quarter
                );


            /*
             * =====================================================
             * CASE 1
             *
             * We have an applicable historical FAAS.
             * =====================================================
             */

            if (revision) {

                const assessedValue =
                    Number(
                        revision.totalav ??
                        0
                    );


                /*
                 * Use the actual TD.
                 */

                const arp =
                    revision.tdno ??
                    "";


                const kind =
                    revision.rputype ??
                    property.rputype ??
                    property.kind ??
                    property.property_type ??
                    property.classification_name ??
                    "";


                const result =
                    computeRPT({

                        assessedValue,

                        taxYear:
                            year,

                        paymentDate,

                    });


                quarters.push({

                    year,

                    quarter,

                    revision,

                    assessedValue,

                    arp,

                    kind,

                    result,

                    inheritedFromNextRevision:
                        false,

                });


                continue;
            }


            /*
             * =====================================================
             * CASE 2
             *
             * Billing period is BEFORE the earliest known FAAS.
             *
             * Use the NEXT known FAAS assessed value.
             *
             * TD remains BLANK.
             * =====================================================
             */

            const nextRevision =
                findNextRevision(
                    revisions,
                    year,
                    quarter
                );


            if (nextRevision) {

                const assessedValue =
                    Number(
                        nextRevision.totalav ??
                        0
                    );


                /*
                 * IMPORTANT:
                 *
                 * Do NOT use nextRevision.tdno.
                 *
                 * TD must remain blank because
                 * that TD was not yet effective.
                 */

                const arp = "";


                const kind =
                    nextRevision.rputype ??
                    property.rputype ??
                    property.kind ??
                    property.property_type ??
                    property.classification_name ??
                    "";


                const result =
                    computeRPT({

                        assessedValue,

                        taxYear:
                            year,

                        paymentDate,

                    });


                quarters.push({

                    year,

                    quarter,

                    revision:
                        nextRevision,

                    assessedValue,

                    arp,

                    kind,

                    result,

                    inheritedFromNextRevision:
                        true,

                });


                continue;
            }


            /*
             * =====================================================
             * CASE 3
             *
             * No FAAS history exists at all.
             *
             * Only here do we fall back to the
             * selected property's current AV.
             *
             * TD is intentionally blank.
             * =====================================================
             */

            const assessedValue =
                Number(
                    property.totalav ??
                    property.assessed_value ??
                    0
                );


            const result =
                computeRPT({

                    assessedValue,

                    taxYear:
                        year,

                    paymentDate,

                });


            quarters.push({

                year,

                quarter,

                revision:
                    null,

                assessedValue,

                arp: "",

                kind:
                    property.rputype ??
                    property.kind ??
                    property.property_type ??
                    property.classification_name ??
                    "",

                result,

                inheritedFromNextRevision:
                    false,

            });
        }
    }


    /*
     * =========================================================
     * GROUP CONSECUTIVE QUARTERS
     * =========================================================
     */

    let index = 0;


    while (
        index <
        quarters.length
    ) {

        const first =
            quarters[index];


        let lastIndex =
            index;


        while (
            lastIndex + 1 <
            quarters.length
        ) {

            const next =
                quarters[
                    lastIndex + 1
                ];


            /*
             * Same effective revision.
             *
             * For inherited rows, we compare
             * the revision being used for the AV.
             */

            const sameRevision =
                (
                    first.revision?.objid ??
                    null
                ) ===
                (
                    next.revision?.objid ??
                    null
                );


            const sameInheritedState =
                first.inheritedFromNextRevision ===
                next.inheritedFromNextRevision;


            const sameYear =
                first.year ===
                next.year;


            const consecutiveQuarter =
                next.quarter ===
                quarters[
                    lastIndex
                ].quarter + 1;


            if (
                !sameRevision ||
                !sameInheritedState ||
                !sameYear ||
                !consecutiveQuarter
            ) {
                break;
            }


            lastIndex++;
        }


        const last =
            quarters[
                lastIndex
            ];


        const quarterCount =
            lastIndex -
            index +
            1;


        rows.push({

            /*
             * If this is an inherited historical
             * assessment, TD remains blank.
             */

            arp:
                first.inheritedFromNextRevision
                    ? ""
                    : first.arp,


            kind:
                first.kind,


            coverage:
                coverageLabel(

                    first.quarter,
                    first.year,

                    last.quarter,
                    last.year

                ),


            assessed_value:
                first.assessedValue,


            tax_due:
                first.result.taxDue *
                quarterCount,


            basic:
                first.result.basic *
                quarterCount,


            sef:
                first.result.sef *
                quarterCount,


            penalty_percent:
                first.result.penaltyPercent,


            penalty:
                first.result.penalty *
                quarterCount,


            discount_percent:
                first.result.discountPercent,


            discount:
                first.result.discount *
                quarterCount,


            total:
                first.result.total *
                quarterCount,


            startQuarter:
                first.quarter,


            startYear:
                first.year,


            endQuarter:
                last.quarter,


            endYear:
                last.year,


            /*
             * For inherited rows, don't pretend
             * the next TD was effective yet.
             */

            faasState:
                first.inheritedFromNextRevision
                    ? undefined
                    : first.revision?.state ??
                      undefined,


            faasEffectivityYear:
                first.revision
                    ?.effectivityyear,


            faasEffectivityQuarter:
                first.revision
                    ?.effectivityqtr,


            realpropertyid:
                first.revision
                    ?.realpropertyid,


            inheritedFromNextRevision:
                first.inheritedFromNextRevision,

        });


        index =
            lastIndex + 1;
    }


    return rows;
}


/* =========================================================
   COMPUTE TOTALS
========================================================= */

function computeTotals(
    rows: AssessmentRow[]
): Totals {

    return rows.reduce(
        (acc, row) => {

            acc.taxDue +=
                row.tax_due;

            acc.basic +=
                row.basic;

            acc.sef +=
                row.sef;

            acc.penalty +=
                row.penalty;

            acc.discount +=
                row.discount;

            acc.total +=
                row.total;


            return acc;

        },

        {
            taxDue: 0,

            basic: 0,

            sef: 0,

            penalty: 0,

            discount: 0,

            total: 0,
        }
    );
}


/* =========================================================
   RECALCULATE EDITED ROW
========================================================= */

function recalculateRow(
    row: AssessmentRow,

    tdno: string,

    assessedValue: number,

    paymentDate: Date
): AssessmentRow {

    const quarterCount =
        (
            row.endYear * 4 +
            row.endQuarter
        ) -
        (
            row.startYear * 4 +
            row.startQuarter
        ) +
        1;


    const result =
        computeRPT({

            assessedValue,

            taxYear:
                row.startYear,

            paymentDate,

        });


    return {

        ...row,

        /*
         * TD can be blank or manually entered.
         */

        arp:
            tdno,


        assessed_value:
            assessedValue,


        tax_due:
            result.taxDue *
            quarterCount,


        basic:
            result.basic *
            quarterCount,


        sef:
            result.sef *
            quarterCount,


        penalty_percent:
            result.penaltyPercent,


        penalty:
            result.penalty *
            quarterCount,


        discount_percent:
            result.discountPercent,


        discount:
            result.discount *
            quarterCount,


        total:
            result.total *
            quarterCount,

    };
}


/* =========================================================
   COMPONENT
========================================================= */

export default function AssessmentTable({
    assessment,
}: Props) {

    const [
        previewOpen,
        setPreviewOpen
    ] = useState(false);


    const [
        printData,
        setPrintData
    ] = useState<any>(null);


    const [
        openAddModal,
        setOpenAddModal
    ] = useState(false);


    /*
     * FAAS HISTORY
     */

    const [
        faasRevisions,
        setFaasRevisions
    ] =
        useState<FaaSRevision[]>(
            []
        );


    const [
        faasLoading,
        setFaasLoading
    ] =
        useState(false);


    const [
        faasError,
        setFaasError
    ] =
        useState<string | null>(
            null
        );


    /*
     * PAYMENT DATE
     */

    const paymentDate =
        useMemo(
            () => {

                return assessment.paymentDate
                    ? new Date(
                        assessment.paymentDate
                    )
                    : new Date();

            },
            [
                assessment.paymentDate
            ]
        );


    /* =========================================================
       LOAD FAAS HISTORY
    ========================================================== */

    useEffect(() => {

        let cancelled =
            false;


        async function loadFaasHistory() {

            const pin =
                assessment.property?.fullpin ??
                assessment.property?.pin;


            if (!pin) {

                setFaasRevisions([]);

                return;
            }


            try {

                setFaasLoading(
                    true
                );

                setFaasError(
                    null
                );


                const response =
                    await axios.get(
                        "/api/rpt/faas/history",
                        {
                            params: {
                                pin,
                            },
                        }
                    );


                if (
                    cancelled
                ) {
                    return;
                }


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ??
                        "Unable to load FAAS history."
                    );
                }


                const revisions =
                    Array.isArray(
                        response.data?.revisions
                    )
                        ? response.data.revisions
                        : [];


                setFaasRevisions(
                    revisions
                );


                console.log(
                    "FAAS HISTORY:",
                    revisions
                );

            } catch (error: any) {

                if (
                    cancelled
                ) {
                    return;
                }


                console.error(
                    "FAAS HISTORY LOAD ERROR:",
                    error
                );


                setFaasError(
                    error?.response
                        ?.data
                        ?.message ??
                    error?.message ??
                    "Unable to load FAAS history."
                );


                setFaasRevisions([]);

            } finally {

                if (
                    !cancelled
                ) {

                    setFaasLoading(
                        false
                    );

                }
            }
        }


        loadFaasHistory();


        return () => {

            cancelled =
                true;

        };

    }, [
        assessment.property?.fullpin,
        assessment.property?.pin,
    ]);


    /* =========================================================
       GENERATE ROWS
    ========================================================== */

    const [
        generatedRows,
        setGeneratedRows
    ] =
        useState<
            AssessmentRow[]
        >([]);


    const [
        generatingRows,
        setGeneratingRows
    ] =
        useState(false);


    useEffect(() => {

        let cancelled =
            false;


        async function generate() {

            try {

                setGeneratingRows(
                    true
                );


                const result =
                    await generateCoverageRows(

                        assessment.property,

                        faasRevisions,

                        assessment.fromQuarter,
                        assessment.fromYear,

                        assessment.toQuarter,
                        assessment.toYear,

                        paymentDate

                    );


                if (
                    cancelled
                ) {
                    return;
                }


                setGeneratedRows(
                    result
                );

            } catch (error) {

                console.error(
                    "ASSESSMENT GENERATION ERROR:",
                    error
                );


                if (
                    !cancelled
                ) {

                    setGeneratedRows(
                        []
                    );

                }

            } finally {

                if (
                    !cancelled
                ) {

                    setGeneratingRows(
                        false
                    );

                }
            }
        }


        generate();


        return () => {

            cancelled =
                true;

        };

    }, [
        assessment.property,

        assessment.fromQuarter,
        assessment.fromYear,

        assessment.toQuarter,
        assessment.toYear,

        paymentDate,

        faasRevisions,
    ]);


    /* =========================================================
       EDITABLE ROWS
    ========================================================== */

    const [
        rows,
        setRows
    ] =
        useState<
            AssessmentRow[]
        >([]);


    const [
        selectedRows,
        setSelectedRows
    ] =
        useState<number[]>(
            []
        );


    useEffect(() => {

        setRows(
            generatedRows
        );

        setSelectedRows(
            []
        );

    }, [
        generatedRows
    ]);


    const totals =
        useMemo(
            () =>
                computeTotals(
                    rows
                ),
            [rows]
        );


    /* =========================================================
       TOGGLE ROW
    ========================================================== */

    function toggleRow(
        index: number
    ) {

        setSelectedRows(
            (prev) =>
                prev.includes(index)

                    ? prev.filter(
                        (i) =>
                            i !== index
                    )

                    : [
                        ...prev,
                        index,
                    ]
        );
    }


    /* =========================================================
       UPDATE ROW
    ========================================================== */

    function updateRow(
        index: number,

        changes: {
            tdno?: string;

            assessedValue?: number;
        }
    ) {

        setRows(
            (prev) => {

                return prev.map(
                    (
                        row,
                        rowIndex
                    ) => {

                        if (
                            rowIndex !==
                            index
                        ) {
                            return row;
                        }


                        const tdno =
                            changes.tdno ??
                            row.arp;


                        const assessedValue =
                            changes.assessedValue ??
                            row.assessed_value;


                        return recalculateRow(

                            row,

                            tdno,

                            Number(
                                assessedValue
                            ),

                            paymentDate

                        );
                    }
                );
            }
        );
    }


    /* =========================================================
       REMOVE SELECTED
    ========================================================== */

    function removeSelectedRows() {

        setRows(
            (prev) =>
                prev.filter(
                    (_, index) =>
                        !selectedRows.includes(
                            index
                        )
                )
        );


        setSelectedRows([]);
    }


    /* =========================================================
       SAVE BILLING
    ========================================================== */

    async function saveBilling() {

        try {

            const payload = {

                property:
                    assessment.property,

                paymentDate,

                fromQuarter:
                    assessment.fromQuarter,

                fromYear:
                    assessment.fromYear,

                toQuarter:
                    assessment.toQuarter,

                toYear:
                    assessment.toYear,

                totals,

                rows,

            };


            const { data } =
                await axios.post(
                    "/api/rpt/billing",
                    payload
                );


            if (
                !data.success
            ) {

                throw new Error(
                    "Unable to save billing."
                );
            }


            await Swal.fire({

                icon:
                    "success",

                title:
                    "Billing Saved",

                text:
                    data.billingNumber,

                confirmButtonText:
                    "Preview Statement",

            });


            setPrintData({

                billingId:
                    data.billingId,

                billingNumber:
                    data.billingNumber,

                property:
                    assessment.property,

                paymentDate,

                fromQuarter:
                    assessment.fromQuarter,

                fromYear:
                    assessment.fromYear,

                toQuarter:
                    assessment.toQuarter,

                toYear:
                    assessment.toYear,

                rows,

                totals,

            });


            setPreviewOpen(
                true
            );

        } catch (error) {

            console.error(
                error
            );


            Swal.fire({

                icon:
                    "error",

                title:
                    "Save Failed",

                text:
                    "Unable to save billing.",

            });
        }
    }


    /* =========================================================
       ADD ASSESSMENT
    ========================================================== */

    async function addAssessment(
        data: {
            tdn: string;

            assessedValue: number;

            fromQuarter: number;
            fromYear: number;

            toQuarter: number;
            toYear: number;
        }
    ) {

        const property = {

            ...assessment.property,

            tdno:
                data.tdn,

            totalav:
                data.assessedValue,

            assessed_value:
                data.assessedValue,

        };


        const manualRevisions:
            FaaSRevision[] = [

                {

                    objid:
                        `manual-${Date.now()}`,

                    realpropertyid:
                        property.realpropertyid ??
                        "",

                    tdno:
                        data.tdn,

                    utdno:
                        data.tdn,

                    prevtdno:
                        null,

                    state:
                        "MANUAL",

                    effectivityyear:
                        data.fromYear,

                    effectivityqtr:
                        data.fromQuarter,

                    totalav:
                        data.assessedValue,

                    totalmv:
                        property.totalmv ??
                        null,

                    fullpin:
                        property.fullpin ??
                        property.pin ??
                        null,

                    pin:
                        property.pin ??
                        property.fullpin ??
                        null,

                    owner_name:
                        property.owner_name ??
                        null,

                    owner_address:
                        property.owner_address ??
                        null,

                    barangayid:
                        property.barangayid ??
                        null,

                    barangay_name:
                        property.barangay_name ??
                        null,

                    classification_name:
                        property.classification_name ??
                        null,

                    rputype:
                        property.rputype ??
                        null,

                },

            ];


        const newRows =
            await generateCoverageRows(

                property,

                manualRevisions,

                data.fromQuarter,
                data.fromYear,

                data.toQuarter,
                data.toYear,

                paymentDate

            );


        setRows(
            (prev) => {

                return [
                    ...prev,
                    ...newRows,
                ].sort(
                    (a, b) => {

                        if (
                            a.startYear !==
                            b.startYear
                        ) {

                            return (
                                a.startYear -
                                b.startYear
                            );
                        }


                        if (
                            a.startQuarter !==
                            b.startQuarter
                        ) {

                            return (
                                a.startQuarter -
                                b.startQuarter
                            );
                        }


                        return a.arp.localeCompare(
                            b.arp
                        );

                    }
                );
            }
        );


        setOpenAddModal(
            false
        );
    }


    /* =========================================================
       RENDER
    ========================================================== */

    return (

        <div className="rounded-xl bg-white shadow">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="border-b bg-white px-5 py-2.5">

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">

                    {/* =================================================
                        PROPERTY INFORMATION
                    ================================================== */}

                    <div className="min-w-0 pr-6">

                        <div className="mb-2">

                            <h2 className="text-base font-bold text-gray-900">
                                Real Property Billing Assessment
                            </h2>

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-x-5
                                gap-y-1.5
                                md:grid-cols-3
                                xl:grid-cols-4
                            "
                        >

                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    Declared Owner
                                </p>

                                <p className="truncate text-xs font-semibold leading-4 text-gray-900">
                                    {assessment.property.owner_name ||
                                        "-"}
                                </p>

                            </div>


                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    TD Number 
                                </p>

                                <p className="truncate text-xs font-semibold leading-4 text-gray-900">
                                    {assessment.property.tdno ||
                                        "-"}
                                </p>

                            </div>


                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    PIN
                                </p>

                                <p className="truncate text-xs font-semibold leading-4 text-gray-900">
                                    {assessment.property.fullpin ||
                                        "-"}
                                </p>

                            </div>


                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    Barangay
                                </p>

                                <p className="truncate text-xs font-semibold leading-4 text-gray-900">
                                    {assessment.property.barangay_name ||
                                        "-"}
                                </p>

                            </div>


                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    Classification
                                </p>

                                <p className="truncate text-xs font-semibold leading-4 text-gray-900">
                                    {assessment.property.classification_name ||
                                        "-"}
                                </p>

                            </div>


                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    Property Type
                                </p>

                                <p className="truncate text-xs font-semibold leading-4 text-gray-900">
                                    {assessment.property.rputype ||
                                        "-"}
                                </p>

                            </div>


                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    Current Assessed Value
                                </p>

                                <p className="truncate text-xs font-bold leading-4 text-green-700">

                                    ₱
                                    {Number(
                                        assessment.property.totalav ??
                                        0
                                    ).toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits:
                                                2,

                                            maximumFractionDigits:
                                                2,
                                        }
                                    )}

                                </p>

                            </div>


                            <div className="min-w-0">

                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                    FAAS History
                                </p>

                                <div className="mt-0.5">

                                    {faasLoading ? (

                                        <span className="text-[9px] font-medium text-blue-600">
                                            Loading...
                                        </span>

                                    ) : faasError ? (

                                        <span className="text-[9px] font-medium text-red-600">
                                            Unavailable
                                        </span>

                                    ) : (

                                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold leading-3 text-blue-700">

                                            {
                                                faasRevisions.length
                                            }{" "}
                                            revision
                                            {faasRevisions.length !==
                                            1
                                                ? "s"
                                                : ""}

                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        PAYMENT HISTORY
                    ================================================== */}

                    <div
                        className="
                            min-w-0
                            border-l
                            border-gray-200
                            pl-5
                        "
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <h3 className="text-xs font-bold text-gray-900">
                                    Payment History
                                </h3>

                                <p className="text-[9px] text-gray-400">
                                    Previous RPT payments
                                </p>

                            </div>

                            <span className="text-[9px] font-semibold text-blue-600">
                                History
                            </span>

                        </div>


                        <div className="mt-1.5 max-h-[105px] overflow-y-auto">

                            <div className="border-b border-gray-100 py-1.5">

                                <div className="flex items-center justify-between gap-3">

                                    <div className="min-w-0">

                                        <p className="truncate text-[10px] font-semibold leading-3.5 text-gray-900">
                                            OR No. 00012345
                                        </p>

                                        <p className="text-[9px] leading-3 text-gray-500">
                                            Q1-Q4 2025
                                        </p>

                                    </div>

                                    <div className="shrink-0 text-right">

                                        <p className="text-[10px] font-bold leading-3.5 text-gray-900">
                                            ₱3,174.64
                                        </p>

                                        <p className="text-[9px] leading-3 text-gray-400">
                                            Aug 15, 2026
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="border-b border-gray-100 py-1.5">

                                <div className="flex items-center justify-between gap-3">

                                    <div className="min-w-0">

                                        <p className="truncate text-[10px] font-semibold leading-3.5 text-gray-900">
                                            OR No. 00011892
                                        </p>

                                        <p className="text-[9px] leading-3 text-gray-500">
                                            Q1-Q4 2024
                                        </p>

                                    </div>

                                    <div className="shrink-0 text-right">

                                        <p className="text-[10px] font-bold leading-3.5 text-gray-900">
                                            ₱3,718.86
                                        </p>

                                        <p className="text-[9px] leading-3 text-gray-400">
                                            Mar 10, 2025
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="py-1.5">

                                <div className="flex items-center justify-between gap-3">

                                    <div className="min-w-0">

                                        <p className="truncate text-[10px] font-semibold leading-3.5 text-gray-900">
                                            OR No. 00010421
                                        </p>

                                        <p className="text-[9px] leading-3 text-gray-500">
                                            Q1-Q4 2023
                                        </p>

                                    </div>

                                    <div className="shrink-0 text-right">

                                        <p className="text-[10px] font-bold leading-3.5 text-gray-900">
                                            ₱3,900.27
                                        </p>

                                        <p className="text-[9px] leading-3 text-gray-400">
                                            Feb 12, 2024
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                TOOLBAR
            ====================================================== */}

            <AssessmentToolbar
                selectedCount={
                    selectedRows.length
                }

                onAdd={() =>
                    setOpenAddModal(
                        true
                    )
                }

                onRemove={
                    removeSelectedRows
                }

                onSavePrint={
                    saveBilling
                }
            />


            {/* =====================================================
                ASSESSMENT TABLE
            ====================================================== */}

            <div className="overflow-x-auto p-6">

                <table className="w-full border-collapse text-sm">

                    <thead>

                        <tr className="bg-slate-100 text-slate-700">

                            <th className="border px-2 py-2 text-center">

                                <input
                                    type="checkbox"

                                    checked={
                                        rows.length >
                                            0 &&
                                        selectedRows.length ===
                                            rows.length
                                    }

                                    onChange={(e) => {

                                        if (
                                            e.target.checked
                                        ) {

                                            setSelectedRows(
                                                rows.map(
                                                    (
                                                        _,
                                                        i
                                                    ) =>
                                                        i
                                                )
                                            );

                                        } else {

                                            setSelectedRows(
                                                []
                                            );

                                        }

                                    }}
                                />

                            </th>


                            <th className="border px-2 py-2 text-left">
                                TD Number (click cell to edit)
                            </th>


                            <th className="border px-2 py-2 text-left">
                                Coverage
                            </th>


                            <th className="border px-2 py-2 text-right">
                                Assessed Value (click cell to edit)
                            </th>


                            <th className="border px-2 py-2 text-right">
                                Tax Due
                            </th>


                            <th className="border px-2 py-2 text-right">
                                Basic
                            </th>


                            <th className="border px-2 py-2 text-right">
                                SEF
                            </th>


                            <th className="border px-2 py-2 text-center">
                                Penalty %
                            </th>


                            <th className="border px-2 py-2 text-right">
                                Penalty
                            </th>


                            <th className="border px-2 py-2 text-center">
                                Discount %
                            </th>


                            <th className="border px-2 py-2 text-right">
                                Discount
                            </th>


                            <th className="border px-2 py-2 text-right">
                                Total
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {generatingRows ? (

                            <tr>

                                <td
                                    colSpan={12}
                                    className="border px-4 py-8 text-center text-sm text-gray-500"
                                >
                                    Generating assessment...
                                </td>

                            </tr>

                        ) : rows.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={12}
                                    className="border px-4 py-8 text-center text-sm text-gray-500"
                                >
                                    No assessment generated.
                                </td>

                            </tr>

                        ) : (

                            rows.map(
                                (
                                    row,
                                    index
                                ) => (

                                    <tr
                                        key={`${row.arp}-${row.startYear}-${row.startQuarter}-${index}`}
                                        className="hover:bg-slate-50"
                                    >

                                        {/* SELECT */}

                                        <td className="border px-2 py-1 text-center">

                                            <input
                                                type="checkbox"

                                                checked={selectedRows.includes(
                                                    index
                                                )}

                                                onChange={() =>
                                                    toggleRow(
                                                        index
                                                    )
                                                }
                                            />

                                        </td>


                                        {/* =================================================
                                            EDITABLE TD
                                        ================================================== */}

                                        <td className="border px-2 py-1">

                                            <input
                                                type="text"
                                                defaultValue={row.arp}
                                                placeholder="—"
                                                onBlur={(e) =>
                                                    updateRow(
                                                        index,
                                                        {
                                                            tdno: e.target.value,
                                                        }
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                className="
                                                    w-full
                                                    min-w-[150px]
                                                    rounded
                                                    border
                                                    border-transparent
                                                    bg-transparent
                                                    px-1
                                                    py-0.5
                                                    font-medium
                                                    text-gray-900
                                                    outline-none
                                                    transition
                                                    placeholder:text-gray-300
                                                    hover:border-gray-300
                                                    focus:border-blue-500
                                                    focus:bg-white
                                                "
                                            />


                                            {row.inheritedFromNextRevision ? (

                                                <div className="px-1 text-[9px] text-amber-600">

                                                    TD not available, Historical AV
                                                    from next
                                                    revision

                                                </div>

                                            ) : row.faasState ? (

                                                <div className="px-1 text-[9px] text-gray-400">

                                                    {
                                                        row.faasState
                                                    }

                                                </div>

                                            ) : null}

                                        </td>


                                        {/* COVERAGE */}

                                        <td className="border px-2 py-1">

                                            {
                                                row.coverage
                                            }

                                        </td>


                                        {/* =================================================
                                            EDITABLE ASSESSED VALUE
                                        ================================================== */}

                                        <td className="border px-2 py-1 text-right">

                                            <div className="flex items-center justify-end">

                                                <span className="mr-1 text-gray-400">
                                                    ₱
                                                </span>


                                                <input
                                                    type="number"

                                                    min="0"

                                                    step="0.01"

                                                    value={
                                                        row.assessed_value
                                                    }

                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateRow(
                                                            index,
                                                            {
                                                                assessedValue:
                                                                    Number(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    ),
                                                            }
                                                        )
                                                    }

                                                    className="
                                                        w-[120px]
                                                        rounded
                                                        border
                                                        border-transparent
                                                        bg-transparent
                                                        px-1
                                                        py-0.5
                                                        text-right
                                                        font-medium
                                                        text-gray-900
                                                        outline-none
                                                        transition
                                                        hover:border-gray-300
                                                        focus:border-blue-500
                                                        focus:bg-white
                                                    "
                                                />

                                            </div>

                                        </td>


                                        {/* TAX DUE */}

                                        <td className="border px-2 py-1 text-right">

                                            {
                                                money(
                                                    row.tax_due
                                                )
                                            }

                                        </td>


                                        {/* BASIC */}

                                        <td className="border px-2 py-1 text-right">

                                            {
                                                money(
                                                    row.basic
                                                )
                                            }

                                        </td>


                                        {/* SEF */}

                                        <td className="border px-2 py-1 text-right">

                                            {
                                                money(
                                                    row.sef
                                                )
                                            }

                                        </td>


                                        {/* PENALTY % */}

                                        <td className="border px-2 py-1 text-center">

                                            {
                                                row.penalty_percent
                                            }%

                                        </td>


                                        {/* PENALTY */}

                                        <td className="border px-2 py-1 text-right text-red-600">

                                            {
                                                money(
                                                    row.penalty
                                                )
                                            }

                                        </td>


                                        {/* DISCOUNT % */}

                                        <td className="border px-2 py-1 text-center text-green-700">

                                            {
                                                row.discount_percent
                                            }%

                                        </td>


                                        {/* DISCOUNT */}

                                        <td className="border px-2 py-1 text-right text-green-700">

                                            {
                                                money(
                                                    row.discount
                                                )
                                            }

                                        </td>


                                        {/* TOTAL */}

                                        <td className="border px-2 py-1 text-right font-semibold">

                                            {
                                                money(
                                                    row.total
                                                )
                                            }

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>


                    {/* =====================================================
                        TOTAL
                    ====================================================== */}

                    <tfoot>

                        <tr className="bg-slate-200 font-bold">

                            <td
                                colSpan={4}
                                className="border px-2 py-2 text-right"
                            >
                                TOTAL
                            </td>


                            <td className="border px-2 py-2 text-right">

                                {
                                    money(
                                        totals.taxDue
                                    )
                                }

                            </td>


                            <td className="border px-2 py-2 text-right">

                                {
                                    money(
                                        totals.basic
                                    )
                                }

                            </td>


                            <td className="border px-2 py-2 text-right">

                                {
                                    money(
                                        totals.sef
                                    )
                                }

                            </td>


                            <td className="border"></td>


                            <td className="border px-2 py-2 text-right">

                                {
                                    money(
                                        totals.penalty
                                    )
                                }

                            </td>


                            <td className="border"></td>


                            <td className="border px-2 py-2 text-right">

                                {
                                    money(
                                        totals.discount
                                    )
                                }

                            </td>


                            <td className="border px-2 py-2 text-right">

                                {
                                    money(
                                        totals.total
                                    )
                                }

                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>


            {/* =====================================================
                ADD ASSESSMENT
            ====================================================== */}

            <AddAssessmentModal
                open={
                    openAddModal
                }

                onClose={() =>
                    setOpenAddModal(
                        false
                    )
                }

                onCompute={
                    addAssessment
                }
            />


            {/* =====================================================
                BILLING PREVIEW
            ====================================================== */}

            <BillingPreviewDialog
                open={
                    previewOpen
                }

                billing={
                    printData
                }

                onClose={() =>
                    setPreviewOpen(
                        false
                    )
                }
            />

        </div>
    );
}