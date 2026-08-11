"use client";

import { CalendarDays } from "lucide-react";

type Props = {
    fundSourceId: string;
    setFundSourceId: (
        value: string
    ) => void;

    fundSources: any[];

    loadingFunds: boolean;
    loading: boolean;

    dateFrom: string;
    dateTo: string;

    handleDateFromChange: (
        value: string
    ) => void;

    handleDateToChange: (
        value: string
    ) => void;
};

export default function RCDReportForm({
    fundSourceId,
    setFundSourceId,
    fundSources,
    loadingFunds,
    loading,
    dateFrom,
    dateTo,
    handleDateFromChange,
    handleDateToChange,
}: Props) {

    function formatDate(value: string) {
        if (!value) return "-";

        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    }

    return (

                <div
                    className="
                        rounded-xl
                        border
                        bg-white
                        p-6
                        shadow-sm
                    "
                >

                    <div
                        className="
                            mb-5
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div>

                            <h3
                                className="
                                    text-sm
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-slate-700
                                "
                            >
                                Report Parameters
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Select the fund source
                                and collection period.
                            </p>

                        </div>

                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-3
                        "
                    >

                        {/* ============================= */}
                        {/* FUND SOURCE */}
                        {/* ============================= */}

                        <div
                            className="
                                md:col-span-3
                            "
                        >

                            <label
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-700
                                "
                            >
                                Fund Source
                            </label>

                            <select
                                value={
                                    fundSourceId
                                }
                                disabled={
                                    loadingFunds ||
                                    loading
                                }
                                onChange={(e) => {
                                    setFundSourceId(
                                        e.target.value
                                    );

                                }}
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    px-3
                                    py-2.5
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                    disabled:bg-slate-100
                                "
                            >

                                <option value="">
                                    {loadingFunds
                                        ? "Loading fund sources..."
                                        : "-- Select Fund Source --"}
                                </option>

                                {fundSources.map(
                                    (
                                        item: any
                                    ) => (

                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.fund_code
                                                ? `${item.fund_code} - `
                                                : ""}
                                            {item.fund_name ??
                                                item.name ??
                                                item.description ??
                                                item.id}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        {/* ============================= */}
                        {/* FROM DATE */}
                        {/* ============================= */}

                        <div>

                            <label
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-700
                                "
                            >
                                From Date
                            </label>

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    px-4
                                    py-2.5
                                "
                            >

                                <div
                                    className="
                                        min-w-0
                                    "
                                >

                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        {formatDate(
                                            dateFrom
                                        )}
                                    </p>

                                </div>

                                <div
                                    className="
                                        relative
                                        ml-3
                                        shrink-0
                                    "
                                >

                                    <input
                                        type="date"
                                        value={
                                            dateFrom
                                        }
                                        disabled={
                                            loading
                                        }
                                        onChange={(e) =>
                                            handleDateFromChange(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            absolute
                                            inset-0
                                            z-10
                                            h-full
                                            w-full
                                            cursor-pointer
                                            opacity-0
                                        "
                                    />

                                    <button
                                        type="button"
                                        disabled={
                                            loading
                                        }
                                        className="
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-white
                                            p-2
                                            text-slate-700
                                            hover:bg-slate-100
                                            disabled:opacity-50
                                        "
                                    >
                                        <CalendarDays
                                            size={18}
                                        />
                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* ============================= */}
                        {/* TO DATE */}
                        {/* ============================= */}

                        <div>

                            <label
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-700
                                "
                            >
                                To Date
                            </label>

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    px-4
                                    py-2.5
                                "
                            >

                                <div
                                    className="
                                        min-w-0
                                    "
                                >

                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        {formatDate(
                                            dateTo
                                        )}
                                    </p>

                                </div>

                                <div
                                    className="
                                        relative
                                        ml-3
                                        shrink-0
                                    "
                                >

                                    <input
                                        type="date"
                                        value={
                                            dateTo
                                        }
                                        min={
                                            dateFrom
                                        }
                                        disabled={
                                            loading
                                        }
                                        onChange={(e) =>
                                            handleDateToChange(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            absolute
                                            inset-0
                                            z-10
                                            h-full
                                            w-full
                                            cursor-pointer
                                            opacity-0
                                        "
                                    />

                                    <button
                                        type="button"
                                        disabled={
                                            loading
                                        }
                                        className="
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-white
                                            p-2
                                            text-slate-700
                                            hover:bg-slate-100
                                            disabled:opacity-50
                                        "
                                    >
                                        <CalendarDays
                                            size={18}
                                        />
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

    );
}