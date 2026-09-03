"use client";


type Header = {

    form_code: string;

    booklet_number?: string;

    fiscal_year?: string;

    series?: string;

    beginning_or?: string;

    ending_or?: string;

    current_or?: string;

    receipt_count?: number;

    issued_date?: string;

    received_date?: string;

};


type Props = {

    header: Header;

};


function formatDate(
    value?: string
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-PH"
    );

}


export default function ReceiptAccountableForm({

    header,

}: Props) {

    return (

        <div
            className="
                mt-5
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-sm
            "
        >

            <div
                className="
                    border-b
                    border-slate-200
                    px-5
                    py-3
                "
            >

                <h3
                    className="
                        text-sm
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-700
                    "
                >

                    Accountable Form Information

                </h3>

            </div>


            <div
                className="
                    overflow-x-auto
                "
            >

                <table
                    className="
                        w-full
                        text-sm
                    "
                >

                    <thead
                        className="
                            border-b
                            bg-slate-100
                        "
                    >

                        <tr>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                Accountable Form
                            </th>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                Booklet
                            </th>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                Fiscal Year
                            </th>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                Series
                            </th>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                OR Range
                            </th>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                OR Number
                            </th>

                            <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase text-slate-600">
                                Receipts
                            </th>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                Issued
                            </th>

                            <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                                Received
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr
                            className="
                                border-b
                                hover:bg-slate-50
                            "
                        >

                            <td className="px-4 py-3">

                                <div
                                    className="
                                        flex
                                        flex-col
                                    "
                                >

                                    <span
                                        className="
                                            font-semibold
                                        "
                                    >

                                        {
                                            header.form_code
                                        }

                                    </span>


                                    <span
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    >

                                        {
                                            header.form_code ===
                                            "AF56"

                                                ? "Real Property Tax"

                                                : header.form_code ===
                                                  "CTC-I"

                                                ? "Community Tax Certificate - Individual"

                                                : header.form_code ===
                                                  "CTC-C"

                                                ? "Community Tax Certificate - Corporation"

                                                : "General Official Receipt"
                                        }

                                    </span>

                                </div>

                            </td>


                            <td
                                className="
                                    px-4
                                    py-3
                                    font-semibold
                                "
                            >

                                {
                                    header.booklet_number ||
                                    "-"
                                }

                            </td>


                            <td className="px-4 py-3">

                                {
                                    header.fiscal_year ||
                                    "-"
                                }

                            </td>


                            <td className="px-4 py-3">

                                {
                                    header.series ||
                                    "-"
                                }

                            </td>


                            <td className="px-4 py-3">

                                {
                                    header.beginning_or ||
                                    "-"
                                }

                                {" - "}

                                {
                                    header.ending_or ||
                                    "-"
                                }

                            </td>


                            <td
                                className="
                                    px-4
                                    py-3
                                    font-semibold
                                    text-blue-700
                                "
                            >

                                {
                                    header.current_or ||
                                    "-"
                                }

                            </td>


                            <td
                                className="
                                    px-4
                                    py-3
                                    text-center
                                "
                            >

                                {
                                    header.receipt_count ??
                                    "-"
                                }

                            </td>


                            <td className="px-4 py-3">

                                {
                                    formatDate(
                                        header.issued_date
                                    )
                                }

                            </td>


                            <td className="px-4 py-3">

                                {
                                    formatDate(
                                        header.received_date
                                    )
                                }

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    );

}