"use client";

import Image from "next/image";
import Barcode from "react-barcode";

type Props = {
    billing: any;
};

function money(value: number = 0) {
    return Number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function StatementOfAccount({
    billing,
}: Props) {

    if (!billing) return null;

    const paymentDate = billing.paymentDate
        ? new Date(billing.paymentDate)
        : new Date();

    const validUntil = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth() + 1,
        0
    );

    const refNo =
        billing?.billingNumber?.split("-").pop() ?? "";

    return (
        <div className="min-h-screen bg-slate-300 py-10">

            <div className="mx-auto min-h-[297mm] w-[210mm] bg-white p-10 shadow-2xl">

                {/* =======================================================
                                HEADER
                ======================================================= */}

                <div className="flex items-center justify-between">

                    {/* LEFT LOGO */}

                    <div className="flex h-24 w-24 items-center justify-center">

                        <Image
                            src="/logo2.png"
                            alt="Municipality Logo"
                            width={100}
                            height={100}
                            className="object-contain"
                        />

                    </div>

                    {/* CENTER */}

                    <div className="flex-1 text-center">

                        <p className="text-sm">
                            Republic of the Philippines
                        </p>

                        <p className="text-sm">
                            Province of Palawan
                        </p>

                        <p className="text-sm font-semibold">
                            Municipality of Taytay
                        </p>

                        <p className="mt-3 text-2xl font-extrabold uppercase tracking-widest">
                            Statement of Account
                        </p>

                    </div>

                    {/* RIGHT LOGO */}

                    <div className="flex h-24 w-24 items-center justify-center">

                        <Image
                            src="/logo.png"
                            alt="Treasury Logo"
                            width={100}
                            height={100}
                            className="object-contain"
                        />

                    </div>

                </div>

                {/* =======================================================
                            TAXPAYER INFORMATION
                ======================================================= */}

                <div className="mt-8 text-[12px] uppercase">

                    <div className="flex justify-between">

                        <div className="flex w-[60%]">

                            <span className="w-20">
                                Payor
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1">
                                {billing.property?.owner_name}
                            </span>

                        </div>

                        <div className="flex w-[35%]">

                            <span className="w-12">
                                PIN
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1 text-right">
                                {billing.property?.fullpin}
                            </span>

                        </div>

                    </div>

                    <div className="mt-1 flex justify-between">

                        <div className="flex w-[60%]">

                            <span className="w-20">
                                Address
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1">
                                {billing.property?.location}
                            </span>

                        </div>

                        <div className="flex w-[35%]">

                            <span className="w-16">
                                Ref No.
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1 text-right">
                                {refNo}
                            </span>

                        </div>

                    </div>

                </div>

                {/* =======================================================
                            PROPERTY INFORMATION
                ======================================================= */}

                <div className="mt-2 border-t border-black pt-2 text-[12px] uppercase">

                    <div className="flex justify-between">

                        <div className="flex w-[60%]">

                            <span className="w-24">
                                Barangay
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1">
                                {billing.property?.barangay_name}
                            </span>

                        </div>

                        <div className="flex w-[35%]">

                            <span className="w-28">
                                Classification
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1 text-right">
                                {billing.property?.classification_name}
                            </span>

                        </div>

                    </div>

                    <div className="mt-1 flex justify-between">

                        <div className="flex w-[60%]">

                            <span className="w-24">
                                TD Number
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1">
                                {billing.property?.tdno}
                            </span>

                        </div>

                        <div className="flex w-[35%]">

                            <span className="w-28">
                                Billing Date
                            </span>

                            <span className="mr-2">:</span>

                            <span className="flex-1 text-right">
                                {paymentDate.toLocaleDateString("en-PH", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>

                        </div>

                    </div>

                </div>

                                {/* =======================================================
                            ASSESSMENT DETAILS
                ======================================================= */}

                <div className="mt-6">

                    <table className="w-full border-collapse border border-black text-[11px]">

                        <thead>

                            <tr className="bg-gray-100">

                                <th className="border border-black p-2">
                                    #
                                </th>

                                <th className="border border-black p-2">
                                    Coverage
                                </th>

                                <th className="border border-black p-2">
                                    TD Number
                                </th>

                                <th className="border border-black p-2">
                                    Assessed Value
                                </th>

                                <th className="border border-black p-2">
                                    Basic
                                </th>

                                <th className="border border-black p-2">
                                    SEF
                                </th>

                                <th className="border border-black p-2">
                                    Penalty
                                </th>

                                <th className="border border-black p-2">
                                    Discount
                                </th>

                                <th className="border border-black p-2">
                                    Amount Due
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {billing.rows?.map(
                                (row: any, index: number) => (

                                    <tr key={index}>

                                        <td className="border border-black p-2 text-center">
                                            {index + 1}
                                        </td>

                                        <td className="border border-black p-2">
                                            {row.coverage}
                                        </td>

                                        <td className="border border-black p-2">
                                            {row.td_number}
                                        </td>

                                        <td className="border border-black p-2 text-right">
                                            {money(row.assessed_value)}
                                        </td>

                                        <td className="border border-black p-2 text-right">
                                            {money(row.basic)}
                                        </td>

                                        <td className="border border-black p-2 text-right">
                                            {money(row.sef)}
                                        </td>

                                        <td className="border border-black p-2 text-right">
                                            {money(row.penalty)}
                                        </td>

                                        <td className="border border-black p-2 text-right">
                                            {money(row.discount)}
                                        </td>

                                        <td className="border border-black p-2 text-right font-semibold">
                                            {money(row.total)}
                                        </td>

                                    </tr>

                                )
                            )}

                            {billing.rows?.length === 0 && (

                                <tr>

                                    <td
                                        colSpan={9}
                                        className="border border-black p-6 text-center"
                                    >
                                        No assessment records found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* =======================================================
                                TOTALS
                ======================================================= */}

                <div className="mt-6 flex justify-end">

                    <table className="w-[360px] border-collapse border border-black text-[12px]">

                        <tbody>

                            <tr>

                                <td className="border border-black p-2 font-medium">
                                    Basic Tax
                                </td>

                                <td className="border border-black p-2 text-right">
                                    {money(billing.totals?.basic)}
                                </td>

                            </tr>

                            <tr>

                                <td className="border border-black p-2 font-medium">
                                    SEF
                                </td>

                                <td className="border border-black p-2 text-right">
                                    {money(billing.totals?.sef)}
                                </td>

                            </tr>

                            <tr>

                                <td className="border border-black p-2 font-medium">
                                    Penalty
                                </td>

                                <td className="border border-black p-2 text-right">
                                    {money(billing.totals?.penalty)}
                                </td>

                            </tr>

                            <tr>

                                <td className="border border-black p-2 font-medium">
                                    Discount
                                </td>

                                <td className="border border-black p-2 text-right">
                                    ({money(billing.totals?.discount)})
                                </td>

                            </tr>

                            <tr className="bg-gray-100">

                                <td className="border border-black p-2 text-sm font-bold">
                                    TOTAL AMOUNT DUE
                                </td>

                                <td className="border border-black p-2 text-right text-sm font-bold">
                                    {money(billing.totals?.total)}
                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

                                {/* =======================================================
                        PAYMENT INFORMATION
                ======================================================= */}

                <div className="mt-8 grid grid-cols-2 gap-8">

                    {/* LEFT */}

                    <div>

                        <p className="text-sm font-bold uppercase">
                            Payment Information
                        </p>

                        <table className="mt-2 w-full border-collapse border border-black text-[12px]">

                            <tbody>

                                <tr>

                                    <td className="border border-black p-2 font-medium">
                                        Billing No.
                                    </td>

                                    <td className="border border-black p-2">
                                        {billing.billingNumber}
                                    </td>

                                </tr>

                                <tr>

                                    <td className="border border-black p-2 font-medium">
                                        Bill Amount
                                    </td>

                                    <td className="border border-black p-2 font-bold">
                                        ₱ {money(billing.totals?.total)}
                                    </td>

                                </tr>

                                <tr>

                                    <td className="border border-black p-2 font-medium">
                                        Due Until
                                    </td>

                                    <td className="border border-black p-2">
                                        {validUntil.toLocaleDateString("en-PH", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                        <div className="mt-5 text-[11px] leading-6">

                            <p>
                                • Please present this Statement of Account when
                                paying at the Municipal Treasurer's Office.
                            </p>

                            <p>
                                • Payments made after the due date shall be
                                subject to applicable penalties and surcharges
                                under the Local Government Code.
                            </p>

                            <p>
                                • This Statement of Account is valid only for the
                                period indicated above.
                            </p>

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div className="flex flex-col items-center justify-center rounded border border-black p-4">

                        <Barcode
                            value={billing.billingNumber}
                            width={1.6}
                            height={60}
                            displayValue={false}
                        />

                        <p className="mt-3 text-xs font-semibold">
                            {billing.billingNumber}
                        </p>

                    </div>

                </div>

                {/* =======================================================
                            SIGNATURES
                ======================================================= */}

                <div className="mt-16 grid grid-cols-2 gap-16 text-center text-[12px]">

                    <div>

                        <p className="font-semibold uppercase">
                            Prepared By
                        </p>

                        <div className="mt-12 border-t border-black pt-2 font-bold uppercase">
                            &nbsp;
                        </div>

                    </div>

                    <div>

                        <p className="font-semibold uppercase">
                            Approved By
                        </p>

                        <div className="mt-12 border-t border-black pt-2 font-bold uppercase">
                            &nbsp;
                        </div>

                    </div>

                </div>

                {/* =======================================================
                            FOOTER
                ======================================================= */}

                <div className="mt-16 border-t pt-3 text-center text-[10px] text-gray-600">

                    <p>
                        MUNICIPAL TREASURER'S OFFICE
                    </p>

                    <p>
                        Municipality of Taytay, Palawan
                    </p>

                    <p className="mt-1">
                        This Statement of Account was generated electronically.
                    </p>

                </div>

            </div>

        </div>

    );

}