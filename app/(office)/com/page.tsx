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

        <div className="
            min-h-full
            bg-slate-100
            p-4
        ">

            <div className="mb-4">

                <h1 className="
                    text-2xl
                    font-bold
                    text-slate-800
                ">
                    System Control
                </h1>


                <p className="
                    mt-1
                    text-sm
                    text-slate-500
                ">
                    Manage and inspect system transactions.
                </p>

            </div>


            <div className="
                grid
                grid-cols-1
                gap-4
                xl:grid-cols-12
            ">

                {/* 8 COLUMNS */}

                <div className="
                    xl:col-span-8
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


                {/* 4 COLUMNS */}

                <div className="
                    xl:col-span-4
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