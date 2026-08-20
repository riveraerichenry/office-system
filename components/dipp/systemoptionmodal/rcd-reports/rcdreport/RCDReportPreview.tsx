"use client";

import {
    useMemo,
} from "react";

type Props = {
    rcd: any;
    items?: any[];
    fundSource?: any;
    user?: any;
    previousFormRows?: any[];
};

function formatDate(
    value: any
) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(
            `${String(value).substring(0, 10)}T00:00:00`
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
) {

    const amount =
        Number(
            value ?? 0
        );

    return amount.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );

}

function getFullName(
    user: any
) {

    if (!user) {
        return "—";
    }

    if (
        user.full_name
    ) {
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

export default function RCDPreview({
    rcd,
    items = [],
    fundSource,
    user,
    previousFormRows = [],
}: Props) {

    /*
    ============================================================
    FUND SOURCE
    ============================================================
    */

    const fund =
        fundSource ??
        rcd?.fund_source ??
        {};


    /*
    ============================================================
    ITEMS
    ============================================================
    */

    const rcdItems =
        Array.isArray(items)
            ? items
            : [];


    /*
    ============================================================
    TOTALS
    ============================================================
    */

    const totalCollections =
        useMemo(
            () => {

                if (
                    rcd?.total_collections !==
                    undefined &&
                    rcd?.total_collections !==
                    null
                ) {

                    return Number(
                        rcd.total_collections
                    );

                }

                return rcdItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item?.amount ??
                            0
                        ),
                    0
                );

            },
            [
                rcd,
                rcdItems,
            ]
        );


    const totalRemittances =
        Number(
            rcd?.total_remittances ??
            rcd?.remittance?.total_amount ??
            0
        );


    const totalDeposits =
        Number(
            rcd?.total_deposits ??
            0
        );


    const balance =
        Number(
            rcd?.balance ??
            0
        );


    /*
    ============================================================
    FORM GROUPS
    ============================================================
    */

    const formGroups =
        useMemo(
            () => {

                const map =
                    new Map<
                        string,
                        any[]
                    >();

                for (
                    const item
                    of rcdItems
                ) {

                    const formCode =
                        item?.form_code ??
                        item?.accountable_form_code ??
                        item?.form_name ??
                        "—";

                    if (
                        !map.has(
                            formCode
                        )
                    ) {

                        map.set(
                            formCode,
                            []
                        );

                    }

                    map
                        .get(
                            formCode
                        )!
                        .push(
                            item
                        );

                }

                return Array.from(
                    map.entries()
                );

            },
            [
                rcdItems,
            ]
        );


    /*
    ============================================================
    EMPTY
    ============================================================
    */

    if (!rcd) {

        return (

            <div className="
                flex
                min-h-[500px]
                items-center
                justify-center
                text-sm
                text-gray-400
            ">

                Select an RCD from the list.

            </div>

        );

    }


    return (

        <div className="
            flex
            min-w-[900px]
            justify-center
            pb-10
        ">

            {/* ====================================================
                PAPER
            ==================================================== */}

            <div
                id="my-rcd-report-preview"
                className="
                    relative
                    w-[816px]
                    min-h-[1248px]
                    bg-white
                    px-[48px]
                    py-[48px]
                    text-[11px]
                    text-black
                    shadow-lg
                "
            >

                {/* ====================================================
                    HEADER
                ==================================================== */}

                <div className="
                    text-center
                ">

                    <div className="
                        text-[11px]
                        font-semibold
                    ">
                        REPUBLIC OF THE PHILIPPINES
                    </div>

                    <div className="
                        mt-1
                        text-[12px]
                        font-bold
                    ">
                        MUNICIPALITY OF TAYTAY
                    </div>

                    <div className="
                        text-[11px]
                    ">
                        PROVINCE OF PALAWAN
                    </div>

                    <div className="
                        mt-5
                        text-[15px]
                        font-bold
                    ">
                        REPORT OF COLLECTIONS AND DEPOSITS
                    </div>

                </div>


                {/* ====================================================
                    RCD INFORMATION
                ==================================================== */}

                <div className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-x-10
                    border-b
                    border-black
                    pb-3
                ">

                    <div>

                        <div className="
                            font-semibold
                        ">
                            Fund Source
                        </div>

                        <div className="
                            mt-1
                            border-b
                            border-black
                            pb-1
                        ">
                            {
                                fund?.fund_name ??
                                fund?.fund_code ??
                                fund?.acronym ??
                                "—"
                            }
                        </div>

                    </div>


                    <div>

                        <div className="
                            font-semibold
                        ">
                            RCD No.
                        </div>

                        <div className="
                            mt-1
                            border-b
                            border-black
                            pb-1
                        ">
                            {
                                rcd.report_no ??
                                "—"
                            }
                        </div>

                    </div>


                    <div className="
                        mt-3
                    ">

                        <div className="
                            font-semibold
                        ">
                            Coverage
                        </div>

                        <div className="
                            mt-1
                            border-b
                            border-black
                            pb-1
                        ">

                            {
                                formatDate(
                                    rcd.date_from
                                )
                            }

                            {" — "}

                            {
                                formatDate(
                                    rcd.date_to
                                )
                            }

                        </div>

                    </div>


                    <div className="
                        mt-3
                    ">

                        <div className="
                            font-semibold
                        ">
                            Report Date
                        </div>

                        <div className="
                            mt-1
                            border-b
                            border-black
                            pb-1
                        ">
                            {
                                formatDate(
                                    rcd.report_date
                                )
                            }
                        </div>

                    </div>

                </div>


                {/* ====================================================
                    SECTION A
                ==================================================== */}

                <div className="
                    mt-5
                ">

                    <div className="
                        border
                        border-black
                        bg-gray-100
                        px-3
                        py-2
                        text-[12px]
                        font-bold
                    ">
                        A. COLLECTIONS
                    </div>


                    <table className="
                        w-full
                        border-collapse
                        border-x
                        border-b
                        border-black
                    ">

                        <thead>

                            <tr>

                                <th className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-left
                                ">
                                    Accountable Form
                                </th>

                                <th className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-left
                                ">
                                    OR / Receipt No.
                                </th>

                                <th className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-left
                                ">
                                    Payor
                                </th>

                                <th className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-right
                                ">
                                    Amount
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {rcdItems.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={4}
                                        className="
                                            border
                                            border-black
                                            px-2
                                            py-4
                                            text-center
                                            text-gray-500
                                        "
                                    >
                                        No collection items.
                                    </td>

                                </tr>

                            ) : (

                                rcdItems.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                item?.id ??
                                                index
                                            }
                                        >

                                            <td className="
                                                border
                                                border-black
                                                px-2
                                                py-1.5
                                            ">
                                                {
                                                    item?.form_code ??
                                                    item?.form_name ??
                                                    "—"
                                                }
                                            </td>

                                            <td className="
                                                border
                                                border-black
                                                px-2
                                                py-1.5
                                            ">
                                                {
                                                    item?.or_number ??
                                                    "—"
                                                }
                                            </td>

                                            <td className="
                                                border
                                                border-black
                                                px-2
                                                py-1.5
                                            ">
                                                {
                                                    item?.payor ??
                                                    "—"
                                                }
                                            </td>

                                            <td className="
                                                border
                                                border-black
                                                px-2
                                                py-1.5
                                                text-right
                                            ">
                                                {
                                                    formatAmount(
                                                        item?.amount
                                                    )
                                                }
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>


                        <tfoot>

                            <tr>

                                <td
                                    colSpan={3}
                                    className="
                                        border
                                        border-black
                                        px-2
                                        py-2
                                        text-right
                                        font-bold
                                    "
                                >
                                    TOTAL COLLECTIONS
                                </td>

                                <td className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-right
                                    font-bold
                                ">
                                    ₱
                                    {
                                        formatAmount(
                                            totalCollections
                                        )
                                    }
                                </td>

                            </tr>

                        </tfoot>

                    </table>

                </div>


                {/* ====================================================
                    SECTION B
                ==================================================== */}

                <div className="
                    mt-5
                ">

                    <div className="
                        border
                        border-black
                        bg-gray-100
                        px-3
                        py-2
                        text-[12px]
                        font-bold
                    ">
                        B. REMITTANCES / DEPOSITS
                    </div>


                    <div className="
                        border-x
                        border-b
                        border-black
                        p-3
                    ">

                        <div className="
                            grid
                            grid-cols-2
                            gap-5
                        ">

                            <div>

                                <div className="
                                    text-gray-600
                                ">
                                    Total Remittances
                                </div>

                                <div className="
                                    mt-1
                                    text-[14px]
                                    font-bold
                                ">
                                    ₱
                                    {
                                        formatAmount(
                                            totalRemittances
                                        )
                                    }
                                </div>

                            </div>


                            <div>

                                <div className="
                                    text-gray-600
                                ">
                                    Total Deposits
                                </div>

                                <div className="
                                    mt-1
                                    text-[14px]
                                    font-bold
                                ">
                                    ₱
                                    {
                                        formatAmount(
                                            totalDeposits
                                        )
                                    }
                                </div>

                            </div>

                        </div>


                        {rcd.remittance && (

                            <div className="
                                mt-4
                                border-t
                                border-gray-300
                                pt-3
                            ">

                                <div className="
                                    grid
                                    grid-cols-3
                                    gap-4
                                ">

                                    <div>

                                        <div className="
                                            text-gray-600
                                        ">
                                            Payment Type
                                        </div>

                                        <div className="
                                            mt-1
                                            font-semibold
                                        ">
                                            {
                                                rcd
                                                    .remittance
                                                    ?.payment_type ??
                                                "—"
                                            }
                                        </div>

                                    </div>


                                    <div>

                                        <div className="
                                            text-gray-600
                                        ">
                                            Cash
                                        </div>

                                        <div className="
                                            mt-1
                                            font-semibold
                                        ">
                                            ₱
                                            {
                                                formatAmount(
                                                    rcd
                                                        .remittance
                                                        ?.cash_amount
                                                )
                                            }
                                        </div>

                                    </div>


                                    <div>

                                        <div className="
                                            text-gray-600
                                        ">
                                            Check
                                        </div>

                                        <div className="
                                            mt-1
                                            font-semibold
                                        ">
                                            ₱
                                            {
                                                formatAmount(
                                                    rcd
                                                        .remittance
                                                        ?.check_amount
                                                )
                                            }
                                        </div>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>


                {/* ====================================================
                    SECTION C
                ==================================================== */}

                <div className="
                    mt-5
                ">

                    <div className="
                        border
                        border-black
                        bg-gray-100
                        px-3
                        py-2
                        text-[12px]
                        font-bold
                    ">
                        C. ACCOUNTABILITY
                    </div>


                    <table className="
                        w-full
                        border-collapse
                        border-x
                        border-b
                        border-black
                    ">

                        <thead>

                            <tr>

                                <th className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-left
                                ">
                                    Accountable Form
                                </th>

                                <th className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-center
                                ">
                                    Beginning
                                </th>

                                <th className="
                                    border
                                    border-black
                                    px-2
                                    py-2
                                    text-center
                                ">
                                    Ending
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {previousFormRows.length === 0 ? (

                                formGroups.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={3}
                                            className="
                                                border
                                                border-black
                                                px-2
                                                py-4
                                                text-center
                                                text-gray-500
                                            "
                                        >
                                            No accountability data.
                                        </td>

                                    </tr>

                                ) : (

                                    formGroups.map(
                                        (
                                            [
                                                formCode,
                                                group,
                                            ],
                                            index
                                        ) => {

                                            const first =
                                                group[0];

                                            const last =
                                                group[
                                                    group.length - 1
                                                ];


                                            return (

                                                <tr
                                                    key={
                                                        formCode ??
                                                        index
                                                    }
                                                >

                                                    <td className="
                                                        border
                                                        border-black
                                                        px-2
                                                        py-1.5
                                                    ">
                                                        {
                                                            formCode
                                                        }
                                                    </td>

                                                    <td className="
                                                        border
                                                        border-black
                                                        px-2
                                                        py-1.5
                                                        text-center
                                                    ">
                                                        {
                                                            first?.or_number ??
                                                            "—"
                                                        }
                                                    </td>

                                                    <td className="
                                                        border
                                                        border-black
                                                        px-2
                                                        py-1.5
                                                        text-center
                                                    ">
                                                        {
                                                            last?.or_number ??
                                                            "—"
                                                        }
                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                )

                            ) : (

                                previousFormRows.map(
                                    (
                                        row,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                row?.formCode ??
                                                index
                                            }
                                        >

                                            <td className="
                                                border
                                                border-black
                                                px-2
                                                py-1.5
                                            ">
                                                {
                                                    row?.formCode ??
                                                    "—"
                                                }
                                            </td>

                                            <td className="
                                                border
                                                border-black
                                                px-2
                                                py-1.5
                                                text-center
                                            ">

                                                {
                                                    row?.beginningFrom ??
                                                    "—"
                                                }

                                                {" — "}

                                                {
                                                    row?.beginningTo ??
                                                    "—"
                                                }

                                            </td>

                                            <td className="
                                                border
                                                border-black
                                                px-2
                                                py-1.5
                                                text-center
                                            ">

                                                {
                                                    row?.endingFrom ??
                                                    "—"
                                                }

                                                {" — "}

                                                {
                                                    row?.endingTo ??
                                                    "—"
                                                }

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>


                {/* ====================================================
                    SECTION D
                ==================================================== */}

                <div className="
                    mt-5
                ">

                    <div className="
                        border
                        border-black
                        bg-gray-100
                        px-3
                        py-2
                        text-[12px]
                        font-bold
                    ">
                        D. SUMMARY
                    </div>


                    <div className="
                        border-x
                        border-b
                        border-black
                    ">

                        <div className="
                            grid
                            grid-cols-2
                        ">

                            <div className="
                                border-b
                                border-r
                                border-black
                                p-3
                            ">

                                <div className="
                                    text-gray-600
                                ">
                                    Total Collections
                                </div>

                                <div className="
                                    mt-1
                                    text-[15px]
                                    font-bold
                                ">
                                    ₱
                                    {
                                        formatAmount(
                                            totalCollections
                                        )
                                    }
                                </div>

                            </div>


                            <div className="
                                border-b
                                border-black
                                p-3
                            ">

                                <div className="
                                    text-gray-600
                                ">
                                    Total Remittances
                                </div>

                                <div className="
                                    mt-1
                                    text-[15px]
                                    font-bold
                                ">
                                    ₱
                                    {
                                        formatAmount(
                                            totalRemittances
                                        )
                                    }
                                </div>

                            </div>


                            <div className="
                                border-r
                                border-black
                                p-3
                            ">

                                <div className="
                                    text-gray-600
                                ">
                                    Total Deposits
                                </div>

                                <div className="
                                    mt-1
                                    text-[15px]
                                    font-bold
                                ">
                                    ₱
                                    {
                                        formatAmount(
                                            totalDeposits
                                        )
                                    }
                                </div>

                            </div>


                            <div className="
                                p-3
                            ">

                                <div className="
                                    text-gray-600
                                ">
                                    Balance
                                </div>

                                <div className="
                                    mt-1
                                    text-[15px]
                                    font-bold
                                ">
                                    ₱
                                    {
                                        formatAmount(
                                            balance
                                        )
                                    }
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ====================================================
                    SIGNATORIES
                ==================================================== */}

                <div className="
                    mt-12
                    grid
                    grid-cols-3
                    gap-8
                ">

                    <div>

                        <div className="
                            text-xs
                        ">
                            Prepared by:
                        </div>

                        <div className="
                            mt-8
                            border-b
                            border-black
                            pb-1
                            text-center
                            text-[12px]
                            font-bold
                        ">
                            {
                                getFullName(
                                    user
                                )
                            }
                        </div>

                        <div className="
                            mt-1
                            text-center
                            text-[10px]
                        ">
                            Accountable Officer
                        </div>

                    </div>


                    <div>

                        <div className="
                            text-xs
                        ">
                            Noted by:
                        </div>

                        <div className="
                            mt-8
                            border-b
                            border-black
                            pb-1
                            text-center
                            text-[12px]
                            font-bold
                        ">
                            MARIA CRISTINA B. FORMACION
                        </div>

                        <div className="
                            mt-1
                            text-center
                            text-[10px]
                        ">
                            LRCO - II
                        </div>

                    </div>


                    <div>

                        <div className="
                            text-xs
                        ">
                            Approved By:
                        </div>

                        <div className="
                            mt-8
                            border-b
                            border-black
                            pb-1
                            text-center
                            text-[12px]
                            font-bold
                        ">
                            IMLYN B. PARAPINA
                        </div>

                        <div className="
                            mt-1
                            text-center
                            text-[10px]
                        ">
                            Municipal Treasurer
                        </div>

                    </div>

                </div>


                {/* ====================================================
                    FOOTER
                ==================================================== */}

                <div className="
                    absolute
                    bottom-[24px]
                    left-[48px]
                    right-[48px]
                    flex
                    items-center
                    justify-between
                    border-t
                    border-black
                    pt-2
                    text-[9px]
                ">

                    <span>
                        RCD Report
                    </span>

                    <span>
                        {
                            rcd.report_no ??
                            "—"
                        }
                    </span>

                </div>

            </div>

        </div>

    );

}