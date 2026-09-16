"use client";

import {
    useState,
} from "react";

import DippTransactionList
    from "@/components/com/DIPPTransactionList";

import DippTransactionDetails
    from "@/components/com/DIPPTransactionDetails";


export default function SystemControlPage() {

    const [
        selectedTransaction,
        setSelectedTransaction,
    ] = useState<any | null>(null);


    return (

        <div
            className="
                min-h-full
                bg-slate-100
                p-4
            "
        >

            {/* ==================================================
                COM HEADER
            ================================================== */}

            <div className="mb-4">

                <div className="
                    flex
                    items-center
                    gap-3
                ">

                    <h1 className="
                        text-2xl
                        font-bold
                        text-slate-800
                    ">
                        System Control and Override Module
                    </h1>

                    <span className="
                        rounded-md
                        bg-blue-100
                        px-2.5
                        py-1
                        text-xs
                        font-bold
                        text-blue-700
                    ">
                        COM
                    </span>

                </div>


                <p className="
                    mt-1
                    text-sm
                    text-slate-500
                ">
                    Centralized transaction control, inspection,
                    and authorized system overrides.
                </p>

            </div>


            {/* ==================================================
                TRANSACTION CONTROL
            ================================================== */}

            <div className="
                grid
                grid-cols-1
                gap-4
                xl:grid-cols-12
            ">

                {/* ==================================================
                    TRANSACTION LIST
                ================================================== */}

                <div className="
                    xl:col-span-7
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                ">

                    <DippTransactionList
                        selectedTransaction={
                            selectedTransaction
                        }
                        onSelectTransaction={
                            setSelectedTransaction
                        }
                    />

                </div>


                {/* ==================================================
                    TRANSACTION DETAILS
                ================================================== */}

                <div className="
                    xl:col-span-5
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                ">

                    <DippTransactionDetails
                        transactionId={
                            selectedTransaction?.id ??
                            null
                        }
                    />

                </div>

            </div>

        </div>

    );

}