"use client";

import { Calendar } from "lucide-react";

type Props = {
    formNumber: string;
    series: string;

    province: string;
    municipality: string;
    issueDate: string;

    saving: boolean;

    onFormNumberChange: (
        value: string
    ) => void;

    onSeriesChange: (
        value: string
    ) => void;

    onProvinceChange: (
        value: string
    ) => void;

    onMunicipalityChange: (
        value: string
    ) => void;

    onIssueDateChange: (
        value: string
    ) => void;
};

export default function AF53CertificateSection({
    formNumber,
    series,
    province,
    municipality,
    issueDate,
    saving,

    onFormNumberChange,
    onSeriesChange,

    onProvinceChange,
    onMunicipalityChange,
    onIssueDateChange,
}: Props) {

    /*
     * Convert YYYY-MM-DD into:
     *
     * Thursday, September 24, 2026
     *
     * This is only for display.
     */
    const formattedDate = issueDate
        ? new Date(
              `${issueDate}T00:00:00`
          ).toLocaleDateString(
              "en-US",
              {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              }
          )
        : "Select Date";

    return (
        <section className="w-full rounded-xl border bg-white shadow-sm">

            {/* ============================================================
                HEADER
            ============================================================ */}

            <div className="border-b bg-slate-50 px-5 py-3">

                <h3 className="font-semibold text-slate-800">
                    Certificate Information
                </h3>

            </div>


            {/* ============================================================
                BODY
            ============================================================ */}

            <div className="grid grid-cols-12 items-center gap-5 p-5">


               


                {/* ========================================================
                    MUNICIPALITY
                ======================================================== */}

                <div className="col-span-4">

                    <label className="
                        block
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-500
                    ">
                        Municipality
                    </label>

                    <div className="
                        mt-2
                        text-lg
                        font-semibold
                        text-slate-800
                    ">
                        {municipality || "—"}
                    </div>

                </div>



                 {/* ========================================================
                    PROVINCE
                ======================================================== */}

                <div className="col-span-4">

                    <label className="
                        block
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-500
                    ">
                        Province
                    </label>

                    <div className="
                        mt-2
                        text-lg
                        font-semibold
                        text-slate-800
                    ">
                        {province || "—"}
                    </div>

                </div>


                {/* ========================================================
                    DATE
                ======================================================== */}

                <div className="col-span-4">

                  

                    <div className="
                        relative
                        mt-2
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-lg
   
                        bg-white
                        px-4
                        py-2.5
                    ">

                        {/* DISPLAYED DATE */}

                        <span className="
                            text-base
                            font-semibold
                            text-slate-800
                        ">
                            {formattedDate}
                        </span>


                        {/* CALENDAR BUTTON */}

                        <div className="
                            relative
                            ml-3
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                        ">

                            <Calendar
                                size={18}
                                className="text-slate-700"
                            />

                            {/* Invisible native date input */}

                            <input
                                type="date"
                                value={issueDate}
                                disabled={saving}
                                onChange={(e) =>
                                    onIssueDateChange(
                                        e.target.value
                                    )
                                }
                                className="
                                    absolute
                                    inset-0
                                    cursor-pointer
                                    opacity-0
                                "
                            />

                        </div>

                    </div>

                </div>


            </div>

        </section>
    );
}