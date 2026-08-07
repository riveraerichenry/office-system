"use client";

import { useRef } from "react";
import { X, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import "./print.css";
import Barcode from "react-barcode";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";


type Props = {
    open: boolean;
    billing: any;
    onClose: () => void;
};

function money(value: number) {
    return Number(value ?? 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function BillingPreviewDialog({
    open,
    billing,
    onClose,
}: Props) {

    const printRef = useRef<HTMLDivElement>(null);

    const [preparedBy, setPreparedBy] = useState({
        full_name: "",
        role_name: "",
    });

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle:
            billing?.billingNumber ??
            "Statement of Account",
    });

    useEffect(() => {
        if (!open) return;

        async function loadPreparedBy() {
            try {
                const { data } = await axios.get("/api/auth/me");
                setPreparedBy(data);
            } catch (err) {
                console.error(err);
            }
        }

        loadPreparedBy();
    }, [open]);

    if (!open || !billing) return null;

    const refNo =
        billing.billingNumber?.split("-").pop() ?? "";

    const paymentDate = new Date(
        billing.paymentDate
    );

    const validUntil = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth() + 1,
        0
    ).toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });


    const lastDayOfCurrentMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
        );

    const money = (value: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
        }).format(value);


    

    return (

        <div className="fixed inset-0 z-50">

            {/* Background */}

            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Window */}

            <div className="absolute inset-6 flex flex-col rounded-lg bg-white shadow-xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b p-4">

                    <h2 className="font-semibold">
                        Print Preview
                    </h2>

                    <button onClick={onClose}>
                        <X size={20}/>
                    </button>

                </div>

                {/* Preview */}

                <div className="flex-1 overflow-auto bg-slate-300 p-8">

                    <div
                        id="print-area"
                        ref={printRef}
                        className="mx-auto w-[210mm] min-h-[297mm] bg-white p-10 shadow-lg"
                    >
                            {/* ===========================================================
                                            HEADER
                        ============================================================ */}

                        <div className="flex items-center justify-between">

                            <div className="w-24 flex justify-center">

                                <Image
                                    src="/logo2.png"
                                    alt="Municipality Logo"
                                    width={90}
                                    height={90}
                                />

                            </div>

                            <div className="flex-1 text-center">

                                <p className="text-[12px]">
                                    Republic of the Philippines
                                </p>

                                <p className="text-[12px]">
                                    Province of Palawan
                                </p>

                                <p className="text-[12px]">
                                    Municipality of Taytay
                                </p>

                                <p className="mt-3 text-xl font-bold tracking-widest uppercase">
                                    Statement of Account
                                </p>

                            </div>

                            <div className="w-24 flex justify-center">

                                <Image
                                    src="/logo.png"
                                    alt="Treasury Logo"
                                    width={90}
                                    height={90}
                                />

                            </div>

                        </div>

                        {/* ===========================================================
                                        TAXPAYER INFORMATION
                        ============================================================ */}

                        <div className="text-[12px] mt-8">

                            <div className="flex justify-between">

                                <div className="flex w-[60%]">
                                    <span className="w-24">Payor</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1">
                                        {billing.property.owner_name}
                                    </span>
                                </div>

                                <div className="flex w-[35%]">
                                    <span className="w-14">PIN</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1 text-right">
                                        {billing.property.fullpin}
                                    </span>
                                </div>

                            </div>

                            <div className="flex justify-between">

                                <div className="flex w-[60%]">
                                    <span className="w-24">Address</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1">
                                        {billing.property.location}
                                    </span>
                                </div>

                                <div className="flex w-[35%]">
                                    <span className="w-14">Ref No.</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1 text-right">
                                        {refNo}
                                    </span>
                                </div>

                            </div>

                        </div>

                        {/* ===========================================================
                                        PROPERTY INFORMATION
                        ============================================================ */}

                        <div className="border-t border-black text-[12px]">

                            <div className="flex justify-between">

                                <div className="flex w-[60%]">
                                    <span className="w-24">Declared Owner</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1">
                                        {billing.property.owner_name}
                                    </span>
                                </div>

                                <div className="flex w-[35%]">
                                    <span className="w-28">Classification</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1 text-right">
                                        {billing.property.classification_name}
                                    </span>
                                </div>

                            </div>

                            <div className="flex justify-between">

                                <div className="flex w-[60%]">
                                    <span className="w-24">Barangay</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1">
                                        {billing.property.barangay_name}
                                    </span>
                                </div>

                                <div className="flex w-[35%]">
                                    <span className="w-28">Billing Date</span>
                                    <span className="mr-2">:</span>
                                    <span className="flex-1 text-right">
                                        {paymentDate.toLocaleDateString("en-PH", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                            </div>

                        </div>

                                                {/* ===========================================================
                                        ASSESSMENT TABLE
                        ============================================================ */}

                        <div className="mt-6">

                            <table className="w-full border-collapse text-[11px]">

                                <thead>
                                    <tr className="border-y border-black">

                                        <th className="border-r  px-2 py-2 text-left">
                                            TD NO.
                                        </th>

                                        <th className="border-r  px-2 py-2 text-right">
                                            ASSESSED VALUE
                                        </th>

                                        <th className="border-r  px-2 py-2 text-center">
                                            PERIOD
                                        </th>

                                        <th className="border-r  px-2 py-2 text-right">
                                            BASIC
                                        </th>

                                        <th className="border-r  px-2 py-2 text-right">
                                            SEF
                                        </th>

                                        <th className="border-r  px-2 py-2 text-right">
                                            PENALTY
                                        </th>

                                        <th className="border-r  px-2 py-2 text-right">
                                            DISCOUNT
                                        </th>

                                        <th className="px-2 py-2 text-right">
                                            TOTAL
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {billing.rows.map((row: any, index: number) => (
                                        <tr
                                            key={index}
                                            className="align-top text-[12px] leading-tight"
                                        >
                                            <td className="px-2 py-1">
                                                {row.arp || billing.property.tdno}
                                            </td>

                                            <td className="px-2 py-1 text-right">
                                                {money(row.assessed_value)}
                                            </td>

                                            <td className="px-2 py-1 text-center">
                                                {row.coverage}
                                            </td>

                                            <td className="px-2 py-1 text-right">
                                                {money(row.basic)}
                                            </td>

                                            <td className="px-2 py-1 text-right">
                                                {money(row.sef)}
                                            </td>

                                            <td className="px-2 py-1 text-right">
                                                {money(row.penalty)}
                                            </td>

                                            <td className="px-2 py-1 text-right">
                                                {money(row.discount)}
                                            </td>

                                            <td className="px-2 py-1 text-right font-semibold">
                                                {money(row.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                                <tfoot>

                                    <tr className="border-t-2 border-black">

                                        <td
                                            colSpan={3}
                                            className="pt-3 text-right font-bold uppercase"
                                        >
                                            SUB TOTAL
                                        </td>

                                        <td className="pt-3 text-right font-bold">

                                            {money(billing.totals.basic)}

                                        </td>

                                        <td className="pt-3 text-right font-bold">

                                            {money(billing.totals.sef)}

                                        </td>

                                        <td className="pt-3 text-right font-bold">

                                            {money(billing.totals.penalty)}

                                        </td>

                                        <td className="pt-3 text-right font-bold">

                                            {money(billing.totals.discount)}

                                        </td>

                                        <td className="pt-3 text-right text-base font-bold">

                                            {money(billing.totals.total)}

                                        </td>

                                    </tr>

                                </tfoot>

                            </table>

                        </div>

                                                {/* ===========================================================
                                        SUMMARY
                        ============================================================ */}

                        <div className="mt-8 flex justify-between gap-8">

                            {/* Barcode */}

                            <div className="flex flex-col items-center">

                                <Barcode
                                    value={billing.billingNumber}
                                    width={1.3}
                                    height={45}
                                    fontSize={10}
                                    displayValue={true}
                                />

                              
                            </div>

                            {/* Summary */}

                            <div className="w-[320px] rounded border border-black">

                                

                                <table className="w-full text-[15px]">

                                    <tbody>

                                        

                                        <tr className="border-t border-black font-bold">

                                            <td className="px-3 py-2 uppercase">
                                                BILL AMOUNT:
                                            </td>

                                            <td className="px-3 py-2 text-right text-lg">

                                                {money(billing.totals.total)}

                                            </td>

                                        </tr>
                                        <tr className=" font-bold">

                                            <td className="px-3 py-2">
                                                valid until:
                                            </td>

                                            <td className="px-3 py-2 text-right text-lg">

                                                {lastDayOfCurrentMonth.toLocaleDateString("en-PH", {
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    })}

                                            </td>

                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                        </div>



                         {/* =======================================================
                                                SIGNATURES
                            ======================================================= */}

                            <div className="mt-16 grid grid-cols-3 gap-12 text-center text-[12px]">

                                {/* PREPARED BY */}

                                <div>

                                    <p className="mb-8 text-left">
                                        Prepared by:
                                    </p>

                                    <div className="font-bold uppercase">
                                        {preparedBy.full_name}
                                    </div>

                                    <div className="mx-auto mt-1 w-48 border-b border-black"></div>

                                    <p className="mt-1 uppercase">
                                        {preparedBy.role_name}
                                    </p>

                                </div>

                                {/* APPROVED BY */}

                                <div>

                                    <p className="mb-8 text-left">
                                        Approved by:
                                    </p>

                                    <div className="font-bold uppercase">
                                        IMLYN B. PARAPINA
                                    </div>

                                    <div className="mx-auto mt-1 w-48 border-b border-black"></div>

                                    <p className="mt-1 uppercase">
                                        MUNICIPAL TREASURER
                                    </p>

                                </div>

                                {/* RECEIVED BY */}

                                <div>

                                    <p className="mb-8 text-left">
                                        Received by:
                                    </p>

                                    <div className="font-bold uppercase">
                                        &nbsp;
                                    </div>

                                    <div className="mx-auto mt-1 w-48 border-b border-black"></div>

                                    <p className="mt-1 uppercase">
                                        NAME & SIGNATURE
                                    </p>

                                </div>

                            </div>

                        {/* ===========================================================
                                        NOTES
                        ============================================================ */}

                        <div className="mt-8 rounded border border-black p-4 text-[11.5px]">

                            <span className="font-bold">
                                NOTE:
                            </span>

                            <p>
                                • 20% discount shall be granted for advance payment of Real Property Taxes if payment is made on or before December of the current year.
                            </p>

                            <p>
                                • 10% discount shall be granted for prompt payment of the first quarter. Payments made beginning the second quarter up to the last quarter of the current year shall no longer qualify for the prompt payment discount.
                            </p>

                            <p>
                                • Penalties shall continue to accrue until full payment is made. Payments may be made in four (4) equal installments:
                            </p>

                            <div className="ml-5 flex gap-16">
                                <span>• 1st Qtr - not later than March 31st</span>
                                <span>• 2nd Qtr - not later than June 30th</span>
                            </div>

                            <div className="ml-5 flex gap-16">
                                <span>• 3rd Qtr - not later than September 30th</span>
                                <span>• 4th Qtr - not later than December 31st</span>
                            </div>

                            <p>
                                • Delinquent payments are assessed a penalty of 2% per month of delinquency or fraction thereof.
                            </p>

                            <p>
                                • Please help us protect your good name by making settlement of your unpaid taxes, thereby excluding your property from those to be advertised.
                            </p>


                        </div>

                       

                        {/* ===========================================================
                                        FOOTER
                        ============================================================ */}

                        <div className="mt-10 border-t pt-3 text-center text-[10px] text-gray-600">

                            Municipal Treasurer's Office • Municipality of Taytay • Province of Palawan

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t p-4">

                    <button
                        onClick={onClose}
                        className="rounded border px-4 py-2"
                    >
                        Close
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        <Printer size={18} />

                        Print
                    </button>

                </div>

            </div>

        </div>

    );

}