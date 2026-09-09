"use client";

type Item = {
payor_name?: string | null;

city_municipality?: string | null;

province?: string | null;

permit_action?: string | null;

remains_of?: string | null;

deceased_name?: string | null;

nationality?: string | null;

age?: number | string | null;

sex?: string | null;

date_of_death?: string | null;

cause_of_death?: string | null;

cemetery_name?: string | null;

infectious_status?: string | null;

embalmed_status?: string | null;

disposition_of_remains?: string | null;

fee_amount?: number | string | null;

certification_city_municipality?: string | null;

certification_province?: string | null;

certification_date?: string | null;

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

export default function AF58ItemsTable({
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

    updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
    };

    onChange(
        updatedItems
    );

}


function addItem() {

    onChange([
        ...items,
        {
            payor_name: "",

            city_municipality: "",

            province: "",

            permit_action: "",

            remains_of: "",

            deceased_name: "",

            nationality: "",

            age: "",

            sex: "",

            date_of_death: "",

            cause_of_death: "",

            cemetery_name: "",

            infectious_status: "",

            embalmed_status: "",

            disposition_of_remains: "",

            fee_amount: "",

            certification_city_municipality: "",

            certification_province: "",

            certification_date: "",
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

        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    AF58 Permit Details
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                    Edit permit and human remains transaction information
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


        {/* ========================================================
            RECORDS
        ======================================================== */}

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

                            {/* RECORD HEADER */}

                            <div className="mb-5 flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-bold text-slate-800">

                                        AF58 Record #{index + 1}

                                    </p>

                                    <p className="text-xs text-slate-500">

                                        Permit transaction information

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


                            {/* ====================================================
                                PERMIT INFORMATION
                            ==================================================== */}

                            <SectionTitle>
                                Permit Information
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="Payor Name"
                                    value={
                                        item.payor_name
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "payor_name",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Permit Action"
                                    value={
                                        item.permit_action
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "permit_action",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Remains Of"
                                    value={
                                        item.remains_of
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "remains_of",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Permit Fee"
                                    type="number"
                                    value={
                                        item.fee_amount
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "fee_amount",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* ====================================================
                                DECEASED INFORMATION
                            ==================================================== */}

                            <SectionTitle>
                                Deceased Information
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="Deceased Name"
                                    value={
                                        item.deceased_name
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "deceased_name",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Nationality"
                                    value={
                                        item.nationality
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "nationality",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Age"
                                    type="number"
                                    value={
                                        item.age
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "age",
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
                                    label="Date of Death"
                                    type="date"
                                    value={
                                        item.date_of_death
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "date_of_death",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Cause of Death"
                                    value={
                                        item.cause_of_death
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "cause_of_death",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Cemetery Name"
                                    value={
                                        item.cemetery_name
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "cemetery_name",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* ====================================================
                                CONDITION AND DISPOSITION
                            ==================================================== */}

                            <SectionTitle>
                                Condition and Disposition
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                                <Field
                                    label="Infectious Status"
                                    value={
                                        item.infectious_status
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "infectious_status",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Embalmed Status"
                                    value={
                                        item.embalmed_status
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "embalmed_status",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Disposition of Remains"
                                    value={
                                        item.disposition_of_remains
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "disposition_of_remains",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* ====================================================
                                LOCATION INFORMATION
                            ==================================================== */}

                            <SectionTitle>
                                Location Information
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <Field
                                    label="City / Municipality"
                                    value={
                                        item.city_municipality
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "city_municipality",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Province"
                                    value={
                                        item.province
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "province",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* ====================================================
                                CERTIFICATION INFORMATION
                            ==================================================== */}

                            <SectionTitle>
                                Certification Information
                            </SectionTitle>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                                <Field
                                    label="Certification City / Municipality"
                                    value={
                                        item.certification_city_municipality
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "certification_city_municipality",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Certification Province"
                                    value={
                                        item.certification_province
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "certification_province",
                                            value
                                        )
                                    }
                                />


                                <Field
                                    label="Certification Date"
                                    type="date"
                                    value={
                                        item.certification_date
                                    }
                                    disabled={saving}
                                    onChange={(value) =>
                                        updateItem(
                                            index,
                                            "certification_date",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* ====================================================
                                RECORD TOTAL
                            ==================================================== */}

                            <div className="mt-6 flex justify-end">

                                <div className="w-full max-w-xs">

                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">

                                        Permit Fee

                                    </p>

                                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-right text-lg font-bold text-blue-700">

                                        ₱{
                                            money(
                                                item.fee_amount
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

                    No AF58 transaction details found.

                </div>

            )}

        </div>


        {/* ========================================================
            GRAND TOTAL
        ======================================================== */}

        {items.length > 0 && (

            <div className="flex items-center justify-between border-t bg-slate-50 px-5 py-4">

                <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">

                    Grand Total

                </span>


                <span className="text-xl font-bold text-blue-700">

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
    <h4 className="mb-3 mt-7 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-blue-700 first:mt-0">

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