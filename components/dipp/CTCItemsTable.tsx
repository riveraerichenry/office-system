"use client";

type Item = {
ctc_type?: string | null;

full_name?: string | null;

address?: string | null;

tin?: string | null;

cr_number?: string | null;

citizenship?: string | null;

sex?: string | null;

height?: string | number | null;

weight?: string | number | null;

place_of_birth?: string | null;

birth_date?: string | null;

civil_status?: string | null;

occupation?: string | null;

corporation_name?: string | null;

sec_registration?: string | null;

representative?: string | null;

place_issued?: string | null;

issue_date?: string | null;

tax_mode?: string | null;

taxable_amount?: number | string | null;

basic_tax?: number | string | null;

salary_tax?: number | string | null;

additional_tax?: number | string | null;

penalty?: number | string | null;

interest?: number | string | null;

total_amount?: number | string | null;

};

type Props = {
items: Item[];

grandTotal: number;

saving?: boolean;

onChange: (
    items: Item[]
) => void;

};

const money = (
value: number | string | null | undefined
) =>
Number(
value || 0
).toLocaleString(
"en-PH",
{
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}
);

export default function CTCItemsTable({
items,
grandTotal,
saving = false,
onChange,
}: Props) {

function updateItem(
    index: number,
    field: keyof Item,
    value: string
) {

    const updatedItems =
        [...items];

    const updatedItem = {
        ...updatedItems[index],
        [field]: value,
    };

    /*
        Automatically compute the CTC total.

        Formula:

        Basic Tax
        + Salary Tax
        + Additional Tax
        + Penalty
        + Interest
    */

    const basic =
        Number(
            field === "basic_tax"
                ? value
                : updatedItem.basic_tax || 0
        );

    const salary =
        Number(
            field === "salary_tax"
                ? value
                : updatedItem.salary_tax || 0
        );

    const additional =
        Number(
            field === "additional_tax"
                ? value
                : updatedItem.additional_tax || 0
        );

    const penalty =
        Number(
            field === "penalty"
                ? value
                : updatedItem.penalty || 0
        );

    const interest =
        Number(
            field === "interest"
                ? value
                : updatedItem.interest || 0
        );

    updatedItem.total_amount =
        basic +
        salary +
        additional +
        penalty +
        interest;

    updatedItems[index] =
        updatedItem;

    onChange(
        updatedItems
    );

}


function addItem() {

    onChange([
        ...items,
        {
            ctc_type: "Individual",

            full_name: "",

            address: "",

            tin: "",

            cr_number: "",

            citizenship: "",

            sex: "",

            height: "",

            weight: "",

            place_of_birth: "",

            birth_date: "",

            civil_status: "",

            occupation: "",

            corporation_name: "",

            sec_registration: "",

            representative: "",

            place_issued: "",

            issue_date: "",

            tax_mode: "",

            taxable_amount: "",

            basic_tax: "",

            salary_tax: "",

            additional_tax: "",

            penalty: "",

            interest: "",

            total_amount: 0,
        },
    ]);

}


function removeItem(
    index: number
) {

    onChange(
        items.filter(
            (
                _,
                itemIndex
            ) =>
                itemIndex !== index
        )
    );

}


return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Community Tax Certificate Details
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                    Edit certificate holder information and tax computation
                </p>

            </div>


            <div className="flex items-center gap-3">

                <div className="rounded-md bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">

                    {items.length} Record
                    {items.length !== 1 && "s"}

                </div>


                <button
                    type="button"
                    onClick={addItem}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    + Add Record
                </button>

            </div>

        </div>


        {/* =========================================================
            ITEMS
        ========================================================= */}

        <div className="divide-y divide-slate-200">

            {items.length > 0 ? (

                items.map(
                    (
                        item,
                        index
                    ) => (

                        <div
                            key={index}
                            className="p-5"
                        >

                            {/* =================================================
                                RECORD HEADER
                            ================================================= */}

                            <div className="mb-5 flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-bold text-slate-800">

                                        CTC Record #{index + 1}

                                    </p>

                                    <p className="text-xs text-slate-500">

                                        Community Tax Certificate information

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    disabled={
                                        saving ||
                                        items.length === 1
                                    }
                                    onClick={() =>
                                        removeItem(
                                            index
                                        )
                                    }
                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Remove Record
                                </button>

                            </div>


                            {/* =================================================
                                CERTIFICATE HOLDER
                            ================================================= */}

                            <SectionTitle>
                                Certificate Holder
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="CTC Type"
                                    value={
                                        item.ctc_type
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "ctc_type",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Full Name"
                                    value={
                                        item.full_name
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "full_name",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Address"
                                    value={
                                        item.address
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "address",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Citizenship"
                                    value={
                                        item.citizenship
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "citizenship",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="TIN"
                                    value={
                                        item.tin
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "tin",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="CR Number"
                                    value={
                                        item.cr_number
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "cr_number",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Sex"
                                    value={
                                        item.sex
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "sex",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Civil Status"
                                    value={
                                        item.civil_status
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "civil_status",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* =================================================
                                PERSONAL INFORMATION
                            ================================================= */}

                            <SectionTitle>
                                Personal Information
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="Place of Birth"
                                    value={
                                        item.place_of_birth
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "place_of_birth",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Birth Date"
                                    type="date"
                                    value={
                                        item.birth_date
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "birth_date",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Height"
                                    type="number"
                                    value={
                                        item.height
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "height",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Weight"
                                    type="number"
                                    value={
                                        item.weight
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "weight",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Occupation"
                                    value={
                                        item.occupation
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "occupation",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* =================================================
                                CORPORATION INFORMATION
                            ================================================= */}

                            <SectionTitle>
                                Corporation Information
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                                <Field
                                    label="Corporation Name"
                                    value={
                                        item.corporation_name
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "corporation_name",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="SEC Registration"
                                    value={
                                        item.sec_registration
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "sec_registration",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Representative"
                                    value={
                                        item.representative
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "representative",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* =================================================
                                CERTIFICATE INFORMATION
                            ================================================= */}

                            <SectionTitle>
                                Certificate Information
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="Place Issued"
                                    value={
                                        item.place_issued
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "place_issued",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Issue Date"
                                    type="date"
                                    value={
                                        item.issue_date
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "issue_date",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Tax Mode"
                                    value={
                                        item.tax_mode
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "tax_mode",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* =================================================
                                TAX COMPUTATION
                            ================================================= */}

                            <SectionTitle>
                                Tax Computation
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="Taxable Amount"
                                    type="number"
                                    value={
                                        item.taxable_amount
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "taxable_amount",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Basic Tax"
                                    type="number"
                                    value={
                                        item.basic_tax
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "basic_tax",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Salary Tax"
                                    type="number"
                                    value={
                                        item.salary_tax
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "salary_tax",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Additional Tax"
                                    type="number"
                                    value={
                                        item.additional_tax
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "additional_tax",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Penalty"
                                    type="number"
                                    value={
                                        item.penalty
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "penalty",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Interest"
                                    type="number"
                                    value={
                                        item.interest
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "interest",
                                            value
                                        )
                                    }
                                />


                                {/* READ ONLY COMPUTED TOTAL */}

                                <div>

                                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">

                                        Total Amount

                                    </label>

                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-right font-bold text-emerald-700">

                                        ₱{
                                            money(
                                                item.total_amount
                                            )
                                        }

                                    </div>

                                </div>

                            </div>

                        </div>

                    )
                )

            ) : (

                <div className="py-12 text-center text-sm text-slate-500">

                    No CTC transaction details found.

                </div>

            )}

        </div>


        {/* =========================================================
            GRAND TOTAL
        ========================================================= */}

        {items.length > 0 && (

            <div className="flex items-center justify-between border-t bg-slate-50 px-5 py-4">

                <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">

                    Grand Total

                </span>


                <span className="text-xl font-bold text-emerald-700">

                    ₱{
                        money(
                            grandTotal
                        )
                    }

                </span>

            </div>

        )}

    </div>
);

}

function SectionTitle({
children,
}: {
children: React.ReactNode;
}) {

return (
    <h4 className="mb-3 mt-6 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-blue-700 first:mt-0">

        {children}

    </h4>
);

}

function Field({
label,
value,
type = "text",
disabled,
onChange,
}: {
label: string;

value:
    | string
    | number
    | null
    | undefined;

type?: string;

disabled?: boolean;

onChange: (
    value: string
) => void;

}) {

return (
    <div>

        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">

            {label}

        </label>


        <input
            type={type}
            value={
                value ?? ""
            }
            disabled={disabled}
            onChange={(e) =>
                onChange(
                    e.target.value
                )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

    </div>
);

}