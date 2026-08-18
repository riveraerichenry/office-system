"use client";

import {
    CalendarDays,
    Search,
} from "lucide-react";

import {
    FundSource,
} from "./RCDRemittanceTypes";


type Props = {

    dateFrom: string;

    dateTo: string;

    fundSourceId: string;

    search: string;

    fundSources: FundSource[];

    onDateFromChange: (
        value: string
    ) => void;

    onDateToChange: (
        value: string
    ) => void;

    onFundSourceChange: (
        value: string
    ) => void;

    onSearchChange: (
        value: string
    ) => void;

};


export default function RCDRemittanceFilters({

    dateFrom,

    dateTo,

    fundSourceId,

    search,

    fundSources,

    onDateFromChange,

    onDateToChange,

    onFundSourceChange,

    onSearchChange,

}: Props) {

    return (

        <div className="border-b border-gray-200 bg-white p-4">

            <div className="mb-4">

                <h3 className="text-base font-bold text-gray-800">
                    RCD Reports
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Filter the RCD reports available for remittance.
                </p>

            </div>


            <div className="grid grid-cols-2 gap-3">

                <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Date From
                    </label>

                    <div className="flex h-10 items-center rounded-lg border border-gray-300 bg-white px-3">

                        <CalendarDays
                            size={16}
                            className="mr-2 text-gray-400"
                        />

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e =>
                                onDateFromChange(
                                    e.target.value
                                )
                            }
                            className="w-full bg-transparent text-sm outline-none"
                        />

                    </div>

                </div>


                <div>

                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Date To
                    </label>

                    <div className="flex h-10 items-center rounded-lg border border-gray-300 bg-white px-3">

                        <CalendarDays
                            size={16}
                            className="mr-2 text-gray-400"
                        />

                        <input
                            type="date"
                            value={dateTo}
                            onChange={e =>
                                onDateToChange(
                                    e.target.value
                                )
                            }
                            className="w-full bg-transparent text-sm outline-none"
                        />

                    </div>

                </div>

            </div>


            <div className="mt-3">

                <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Fund Source
                </label>

                <select
                    value={fundSourceId}
                    onChange={e =>
                        onFundSourceChange(
                            e.target.value
                        )
                    }
                    className="
                        h-10
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-3
                        text-sm
                        outline-none
                    "
                >

                    <option value="">
                        All Fund Sources
                    </option>

                    {fundSources.map(
                        fund => (

                            <option
                                key={fund.id}
                                value={fund.id}
                            >

                                {fund.fund_code
                                    ? `${fund.fund_code} - `
                                    : ""}

                                {fund.fund_name ??
                                    fund.acronym ??
                                    "—"}

                            </option>

                        )
                    )}

                </select>

            </div>


            <div className="mt-3 flex h-10 items-center rounded-lg border border-gray-300 bg-white px-3">

                <Search
                    size={17}
                    className="mr-2 text-gray-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={e =>
                        onSearchChange(
                            e.target.value
                        )
                    }
                    placeholder="Search RCD report..."
                    className="
                        w-full
                        bg-transparent
                        text-sm
                        outline-none
                    "
                />

            </div>

        </div>

    );

}