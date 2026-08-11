"use client";

type Props = {
    collections: any[];
    totalCollections: number;
    accountableOfficer: string;
    usedForms: any[];
    formatAmount: (value: any) => string;
};

export default function RCDCollection({
    collections,
    totalCollections,
    accountableOfficer,
    usedForms,
    formatAmount,
}: Props) {
    const hasCollections =
        collections.length > 0;

    return (
        <section className="rcd-collection">

            {/* =================================================
                A. COLLECTIONS
            ================================================= */}

            <div className="section-title">

                A. COLLECTIONS

                <span className="normal">
                    {" "}
                    ( 1. For Collectors )
                </span>

            </div>

            {hasCollections ? (

                <table className="collections-table">

                    <thead>

                        <tr>

                            <th
                                rowSpan={2}
                                className="collection-form"
                            >
                                Type ( Form No )
                            </th>

                            <th
                                colSpan={2}
                                className="collection-or"
                            >
                                Official Receipts /
                                Serial No
                            </th>

                            <th
                                rowSpan={2}
                                className="collection-amount"
                            >
                                Amount
                            </th>

                        </tr>

                        <tr>

                            <th>
                                From
                            </th>

                            <th>
                                To
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {collections.map(
                            (
                                item: any,
                                index: number
                            ) => (

                                <tr
                                    key={
                                        item?.booklet_registration_id ??
                                        item?.id ??
                                        index
                                    }
                                >

                                    <td className="center bold">

                                        {
                                            item?.form_code ??
                                            item?.accountable_form_code ??
                                            item?.form_name ??
                                            ""
                                        }

                                    </td>

                                    <td className="center">

                                        {
                                            item?.from_or ??
                                            ""
                                        }

                                    </td>

                                    <td className="center">

                                        {
                                            item?.to_or ??
                                            ""
                                        }

                                    </td>

                                    <td className="right">

                                        {formatAmount(
                                            item?.collection_amount ??
                                            item?.amount ??
                                            item?.total_amount ??
                                            0
                                        )}

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                    <tfoot>

                        <tr>

                            <td
                                colSpan={3}
                                className="total-label"
                            >
                                TOTAL
                            </td>

                            <td className="right bold">

                                {formatAmount(
                                    totalCollections
                                )}

                            </td>

                        </tr>

                    </tfoot>

                </table>

            ) : (

                <table className="collections-table">

                    <tbody>

                        <tr>

                            <td
                                colSpan={4}
                                className="empty-row"
                            >
                                No collections recorded
                                for the selected period.
                            </td>

                        </tr>

                    </tbody>

                </table>

            )}

            {/* =================================================
                2. FOR LIQUIDATION
            ================================================= */}

            <div className="subsection-title">
                2. For Liquidation
            </div>

            <table className="liquidation-table">

                <thead>

                    <tr>

                        <th>
                            Accountable Officer
                        </th>

                        <th>
                            Report No.
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td className="bold">
                            {accountableOfficer}
                        </td>

                        <td className="center">
                        </td>

                        <td className="right bold">

                            {formatAmount(
                                totalCollections
                            )}

                        </td>

                    </tr>

                </tbody>

                <tfoot>

                    <tr>

                        <td
                            colSpan={2}
                            className="total-label"
                        >
                            TOTAL
                        </td>

                        <td className="right bold">

                            {formatAmount(
                                totalCollections
                            )}

                        </td>

                    </tr>

                </tfoot>

            </table>

            {/* =================================================
                C. ACCOUNTABILITY FOR ACCOUNTABLE FORMS
            ================================================= */}

            <div className="section-title">
                C. ACCOUNTABILITY FOR ACCOUNTABLE FORMS
            </div>

            <table className="accountability-table">

                <thead>

                    <tr>

                        <th
                            rowSpan={2}
                            className="form-name"
                        >
                            Name of
                            <br />
                            Form &amp; No
                        </th>

                        <th
                            rowSpan={2}
                            className="qty"
                        >
                            QTY
                        </th>

                        <th colSpan={2}>
                            Beginning Balance
                            <br />
                            Inclusive Serial Nos
                        </th>

                        <th
                            rowSpan={2}
                            className="qty"
                        >
                            QTY
                        </th>

                        <th colSpan={2}>
                            Receipts
                            <br />
                            Inclusive Serial Nos
                        </th>

                        <th
                            rowSpan={2}
                            className="qty"
                        >
                            QTY
                        </th>

                        <th colSpan={2}>
                            Issued
                            <br />
                            Inclusive Serial Nos
                        </th>

                        <th
                            rowSpan={2}
                            className="qty"
                        >
                            QTY
                        </th>

                        <th colSpan={2}>
                            Ending Balance
                            <br />
                            Inclusive Serial Nos
                        </th>

                    </tr>

                    <tr>

                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>

                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>

                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>

                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {usedForms.map(
                        (
                            form: any,
                            index: number
                        ) => {

                            const booklets =
                                Array.isArray(
                                    form?.booklets
                                )
                                    ? form.booklets
                                    : [];

                            const firstBooklet =
                                booklets[0];

                            const lastBooklet =
                                booklets[
                                    booklets.length - 1
                                ];

                            const endingQuantity =
                                booklets.reduce(
                                    (
                                        total: number,
                                        item: any
                                    ) =>
                                        total +
                                        Number(
                                            item?.ending_balance_count ??
                                            0
                                        ),
                                    0
                                );

                            return (
                                <tr
                                    key={
                                        form?.accountable_form_id ??
                                        form?.id ??
                                        index
                                    }
                                >

                                    {/* FORM */}

                                    <td className="center bold">

                                        <div>
                                            {form?.form_code ?? ""}
                                        </div>

                                        {form?.form_name && (
                                            <div className="form-description">
                                                {form.form_name}
                                            </div>
                                        )}

                                    </td>

                                    {/* BEGINNING QTY */}

                                    <td className="center">

                                        {
                                            form?.booklet_count ??
                                            booklets.length ??
                                            0
                                        }

                                    </td>

                                    {/* BEGINNING FROM */}

                                    <td className="center">

                                        {
                                            form?.beginning_or ??
                                            firstBooklet?.beginning_or ??
                                            ""
                                        }

                                    </td>

                                    {/* BEGINNING TO */}

                                    <td className="center">

                                        {
                                            form?.ending_or ??
                                            lastBooklet?.ending_or ??
                                            ""
                                        }

                                    </td>

                                    {/* RECEIPTS QTY */}

                                    <td className="center">

                                        {
                                            form?.receipt_count ??
                                            0
                                        }

                                    </td>

                                    {/* RECEIPTS FROM */}

                                    <td className="center">

                                        {
                                            firstBooklet?.beginning_or ??
                                            ""
                                        }

                                    </td>

                                    {/* RECEIPTS TO */}

                                    <td className="center">

                                        {
                                            lastBooklet?.ending_or ??
                                            ""
                                        }

                                    </td>

                                    {/* ISSUED QTY */}

                                    <td className="center">

                                        {
                                            form?.issued_count ??
                                            0
                                        }

                                    </td>

                                    {/* ISSUED FROM */}

                                    <td className="center">

                                        {
                                            firstBooklet?.issued_beginning_or ??
                                            ""
                                        }

                                    </td>

                                    {/* ISSUED TO */}

                                    <td className="center">

                                        {
                                            lastBooklet?.issued_ending_or ??
                                            ""
                                        }

                                    </td>

                                    {/* ENDING QTY */}

                                    <td className="center">

                                        {
                                            endingQuantity
                                        }

                                    </td>

                                    {/* ENDING FROM */}

                                    <td className="center">

                                        {
                                            firstBooklet?.ending_balance_beginning_or ??
                                            ""
                                        }

                                    </td>

                                    {/* ENDING TO */}

                                    <td className="center">

                                        {
                                            lastBooklet?.ending_balance_ending_or ??
                                            ""
                                        }

                                    </td>

                                </tr>
                            );
                        }
                    )}

                </tbody>

            </table>

        </section>
    );
}