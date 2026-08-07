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

};

type Totals = {

    taxDue: number;

    basic: number;

    sef: number;

    penalty: number;

    discount: number;

    total: number;

};

function money(value: number) {

    return Number(value).toLocaleString(undefined, {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

    });

}

function coverageLabel(

    startQuarter: number,
    startYear: number,

    endQuarter: number,
    endYear: number

) {

    if (
        startQuarter === endQuarter &&
        startYear === endYear
    ) {

        return `Q${startQuarter} ${startYear}`;

    }

    if (startYear === endYear) {

        return `Q${startQuarter}-Q${endQuarter} ${startYear}`;

    }

    return `Q${startQuarter} ${startYear} - Q${endQuarter} ${endYear}`;

}


function generateCoverageRows(

    property: any,

    fromQuarter: number,
    fromYear: number,

    toQuarter: number,
    toYear: number,

    paymentDate: Date

): AssessmentRow[] {

    const rows: AssessmentRow[] = [];

    const assessedValue = Number(
        property.totalav ??
        property.assessed_value ??
        0
    );

    const arp =
        property.tdno ??
        property.arp ??
        property.td_number ??
        "";

    const kind =
        property.rputype ??
        property.kind ??
        property.property_type ??
        property.classification_name ??
        "";

    for (
        let year = fromYear;
        year <= toYear;
        year++
    ) {

        let startQuarter = 1;
        let endQuarter = 4;

        if (year === fromYear)
            startQuarter = fromQuarter;

        if (year === toYear)
            endQuarter = toQuarter;

        /*
            Previous years

            One row

            Example

            Q1-Q4 2024
        */

        if (year < paymentDate.getFullYear()) {

            const quarterCount =
                endQuarter -
                startQuarter +
                1;

            const result =
                computeRPT({

                    assessedValue,

                    taxYear: year,

                    paymentDate,

                });

            rows.push({

                arp,

                kind,

                coverage: coverageLabel(

                    startQuarter,
                    year,

                    endQuarter,
                    year,

                ),

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

                startQuarter,

                startYear: year,

                endQuarter,

                endYear: year,

            });

            continue;

        }

        /*
            Current year
            Future year

            One row
            PER QUARTER
        */

        for (
            let quarter = startQuarter;
            quarter <= endQuarter;
            quarter++
        ) {

            const result =
                computeRPT({

                    assessedValue,

                    taxYear: year,

                    paymentDate,

                });

            rows.push({

                arp,

                kind,

                coverage: coverageLabel(

                    quarter,
                    year,

                    quarter,
                    year,

                ),

                assessed_value:
                    assessedValue,

                tax_due:
                    result.taxDue,

                basic:
                    result.basic,

                sef:
                    result.sef,

                penalty_percent:
                    result.penaltyPercent,

                penalty:
                    result.penalty,

                discount_percent:
                    result.discountPercent,

                discount:
                    result.discount,

                total:
                    result.total,

                startQuarter:
                    quarter,

                startYear:
                    year,

                endQuarter:
                    quarter,

                endYear:
                    year,

            });

        }

    }

    return rows;

}function computeTotals(
    rows: AssessmentRow[]
): Totals {

    return rows.reduce(

        (acc, row) => {

            acc.taxDue += row.tax_due;

            acc.basic += row.basic;

            acc.sef += row.sef;

            acc.penalty += row.penalty;

            acc.discount += row.discount;

            acc.total += row.total;

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





export default function AssessmentTable({
    assessment,
}: Props) {

    /*
        Temporary

        Later this will come from

        OR Date
        or
        Billing Date
    */


    const [previewOpen, setPreviewOpen] = useState(false);

    const [printData, setPrintData] = useState<any>(null);
    




    const [openAddModal, setOpenAddModal] = useState(false);

    
    const paymentDate = useMemo(() => {

        return assessment.paymentDate
            ? new Date(assessment.paymentDate)
            : new Date();

    }, [assessment]);

    const generatedRows = useMemo(() => {
        return generateCoverageRows(
            assessment.property,
            assessment.fromQuarter,
            assessment.fromYear,
            assessment.toQuarter,
            assessment.toYear,
            paymentDate,
        );
    }, [assessment, paymentDate]);

    const [rows, setRows] = useState<AssessmentRow[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    useEffect(() => {
        setRows(generatedRows);
        setSelectedRows([]);
    }, [generatedRows]);

    const totals = useMemo(() => {

        return computeTotals(rows);

    }, [rows]);


    function toggleRow(index: number) {
        setSelectedRows(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    }

    function removeSelectedRows() {
        setRows(prev =>
            prev.filter((_, index) => !selectedRows.includes(index))
        );

        setSelectedRows([]);
    }

    async function saveBilling() {

    try {

        const payload = {

            property: assessment.property,

            paymentDate,

            fromQuarter: assessment.fromQuarter,
            fromYear: assessment.fromYear,

            toQuarter: assessment.toQuarter,
            toYear: assessment.toYear,

            totals,

            rows,

        };

        const { data } = await axios.post(
            "/api/rpt/billing",
            payload
        );

        if (!data.success) {

            throw new Error();

        }

        await Swal.fire({
            icon: "success",
            title: "Billing Saved",
            text: data.billingNumber,
            confirmButtonText: "Preview Statement"
        });

        setPrintData({

            billingId: data.billingId,

            billingNumber: data.billingNumber,

            property: assessment.property,

            paymentDate,

            fromQuarter: assessment.fromQuarter,
            fromYear: assessment.fromYear,

            toQuarter: assessment.toQuarter,
            toYear: assessment.toYear,

            rows,

            totals,

        });

        setPreviewOpen(true);



    } catch (error) {

        console.error(error);

        Swal.fire({

            icon: "error",

            title: "Save Failed",

            text: "Unable to save billing."

        });

    }

}

    


function addAssessment(data: {
    tdn: string;
    assessedValue: number;
    fromQuarter: number;
    fromYear: number;
    toQuarter: number;
    toYear: number;
}) {

    console.log("ADD ASSESSMENT", data);

    // Copy the current property
    const property = {
        ...assessment.property,

        // Override only what the user entered
        tdno: data.tdn,
        totalav: data.assessedValue,
        assessed_value: data.assessedValue,
    };

    // Generate the assessment rows using the existing logic
            const newRows = generateCoverageRows(
                property,
                data.fromQuarter,
                data.fromYear,
                data.toQuarter,
                data.toYear,
                paymentDate
            );

            // Append to the existing rows
            setRows(prev => {
                return [...prev, ...newRows].sort((a, b) => {
                    // Year
                    if (a.startYear !== b.startYear) {
                        return a.startYear - b.startYear;
                    }

                    // Quarter
                    if (a.startQuarter !== b.startQuarter) {
                        return a.startQuarter - b.startQuarter;
                    }

                    // TD Number
                    return a.arp.localeCompare(b.arp);
                });
            });
        }


        
         console.log("RETURN REACHED");   

    return (

        <div className="rounded-xl bg-white shadow">

            {/* Header */}

            <div className="flex items-center justify-between border-b px-6 py-4">

                <div className="border-b px-6 py-4">

                    <h2 className="text-xl font-bold text-gray-900">
                        Real Property Billing Assessment
                    </h2>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Declared Owner
                            </p>
                            <p className="font-semibold text-gray-900">
                                {assessment.property.owner_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                TD Number
                            </p>
                            <p className="font-semibold text-gray-900">
                                {assessment.property.tdno}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                PIN
                            </p>
                            <p className="font-semibold text-gray-900">
                                {assessment.property.fullpin}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Classification
                            </p>
                            <p className="font-semibold text-gray-900">
                                {assessment.property.classification_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Barangay
                            </p>
                            <p className="font-semibold text-gray-900">
                                {assessment.property.barangay_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Assessed Value
                            </p>
                            <p className="font-semibold text-green-700">
                                {`₱${Number(
                                    assessment.property.totalav ?? 0
                                ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Type
                            </p>
                            <p className="font-semibold text-gray-900">
                                {assessment.property.rputype}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Status
                            </p>
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Active
                            </span>
                        </div>

                    </div>

                </div>

            </div>


            <AssessmentToolbar
                selectedCount={selectedRows.length}
                onAdd={() => setOpenAddModal(true)}
                onRemove={removeSelectedRows}
                onSavePrint={saveBilling}
            />
            

                        {/* Assessment Table */}

            <div className="overflow-x-auto p-6">

                <table className="w-full border-collapse text-sm">

                    <thead>

                        <tr className="bg-slate-100 text-slate-700">
                            <th className="border px-2 py-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={
                                        rows.length > 0 &&
                                        selectedRows.length === rows.length
                                    }
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(rows.map((_, i) => i));
                                        } else {
                                            setSelectedRows([]);
                                        }
                                    }}
                                />
                            </th>

                            <th className="border px-2 py-2 text-left">
                                TD Number
                            </th>

                            <th className="border px-2 py-2 text-left">
                                Coverage
                            </th>

                            <th className="border px-2 py-2 text-right">
                                Assessed Value
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

                        {rows.map((row, index) => (

                            <tr
                                key={index}
                                className="hover:bg-slate-50"
                            >
                                <td className="border px-2 py-1 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(index)}
                                        onChange={() => toggleRow(index)}
                                    />
                                </td>

                                <td className="border px-2 py-1">
                                    {row.arp}
                                </td>

                                <td className="border px-2 py-1">
                                    {row.coverage}
                                </td>

                                <td className="border px-2 py-1 text-right">
                                    {money(row.assessed_value)}
                                </td>

                                <td className="border px-2 py-1 text-right">
                                    {money(row.tax_due)}
                                </td>

                                <td className="border px-2 py-1 text-right">
                                    {money(row.basic)}
                                </td>

                                <td className="border px-2 py-1 text-right">
                                    {money(row.sef)}
                                </td>

                                <td className="border px-2 py-1 text-center">
                                    {row.penalty_percent}%
                                </td>

                                <td className="border px-2 py-1 text-right text-red-600">
                                    {money(row.penalty)}
                                </td>

                                <td className="border px-2 py-1 text-center text-green-700">
                                    {row.discount_percent}%
                                </td>

                                <td className="border px-2 py-1 text-right text-green-700">
                                    {money(row.discount)}
                                </td>

                                <td className="border px-2 py-1 text-right font-semibold">
                                    {money(row.total)}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                    <tfoot>

                        <tr className="bg-slate-200 font-bold">

                            <td
                                colSpan={4}
                                className="border px-2 py-2 text-right"
                            >
                                TOTAL
                            </td>

                            <td className="border px-2 py-2 text-right">
                                {money(totals.taxDue)}
                            </td>

                            <td className="border px-2 py-2 text-right">
                                {money(totals.basic)}
                            </td>

                            <td className="border px-2 py-2 text-right">
                                {money(totals.sef)}
                            </td>

                            <td className="border"></td>

                            <td className="border px-2 py-2 text-right">
                                {money(totals.penalty)}
                            </td>

                            <td className="border"></td>

                            <td className="border px-2 py-2 text-right">
                                {money(totals.discount)}
                            </td>

                            <td className="border px-2 py-2 text-right">
                                {money(totals.total)}
                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>

                        {rows.length === 0 && (

                <div className="border-t p-8 text-center text-gray-500">

                    No assessment generated.

                </div>

            )}

            <AddAssessmentModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onCompute={addAssessment}
            />

            <BillingPreviewDialog
                open={previewOpen}
                billing={printData}
                onClose={() => setPreviewOpen(false)}
            />

            

        </div>

        

    );

}