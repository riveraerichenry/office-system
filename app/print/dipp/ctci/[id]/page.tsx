"use client";

import {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {
    useParams,
} from "next/navigation";

import CTCPrint from "@/components/dipp/ctc/print/CTCPrint";


export default function CTCIPrintPage() {

    /* =====================================================
       PARAMS
    ===================================================== */

    const params =
        useParams();


    const id =
        params?.id as string;


    /* =====================================================
       STATE
    ===================================================== */

    const [
        transaction,
        setTransaction,
    ] = useState<any>(
        null
    );


    const [
        loading,
        setLoading,
    ] = useState(
        true
    );


    const [
        error,
        setError,
    ] = useState(
        ""
    );


    /* =====================================================
       LOAD CTC-I TRANSACTION
    ===================================================== */

    useEffect(
        () => {

            if (!id) {

                return;

            }


            const loadTransaction =
                async () => {

                    try {

                        setLoading(
                            true
                        );

                        setError(
                            ""
                        );


                        const response =
                            await axios.get(
                                `/api/dipp/ctci/${id}`
                            );


                        const data =
                            response.data;


                        const transactionData =
                            data?.transaction ??
                            data?.data ??
                            data;


                        setTransaction(
                            transactionData
                        );


                    } catch (
                        err: any
                    ) {

                        console.error(
                            "CTC-I PRINT ERROR:",
                            err
                        );


                        setError(

                            err?.response
                                ?.data
                                ?.message ??

                            "Failed to load CTC-I transaction."

                        );


                    } finally {

                        setLoading(
                            false
                        );

                    }

                };


            loadTransaction();


        },
        [
            id,
        ]
    );


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div
                className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    bg-slate-100
                    p-6
                "
            >

                <div
                    className="
                        rounded-lg
                        bg-white
                        px-6
                        py-4
                        text-sm
                        text-slate-600
                        shadow
                    "
                >

                    Loading CTC-I receipt...

                </div>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div
                className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    bg-slate-100
                    p-6
                "
            >

                <div
                    className="
                        max-w-md
                        rounded-lg
                        bg-white
                        p-6
                        shadow
                    "
                >

                    <h1
                        className="
                            text-lg
                            font-semibold
                            text-red-600
                        "
                    >

                        Unable to Load CTC-I

                    </h1>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-slate-600
                        "
                    >

                        {error}

                    </p>

                </div>

            </div>

        );

    }


    /* =====================================================
       NO DATA
    ===================================================== */

    if (!transaction) {

        return (

            <div
                className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    bg-slate-100
                    p-6
                "
            >

                <div
                    className="
                        rounded-lg
                        bg-white
                        px-6
                        py-4
                        text-sm
                        text-slate-600
                        shadow
                    "
                >

                    CTC-I transaction not found.

                </div>

            </div>

        );

    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <main
            className="
                min-h-screen
                bg-slate-200
                p-8
                print:min-h-0
                print:bg-white
                print:p-0
            "
        >


            {/* =================================================
                PRINT TOOLBAR
            ================================================= */}

            <div
                className="
                    mx-auto
                    mb-6
                    flex
                    w-[8.5in]
                    justify-end
                    gap-3
                    print:hidden
                "
            >

                <button
                    type="button"
                    onClick={() =>
                        window.print()
                    }
                    className="
                        rounded-lg
                        bg-blue-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                    "
                >

                    Print CTC-I

                </button>

            </div>


            {/* =================================================
                LETTER PRINT PAGE
            ================================================= */}

            <div
                className="
                    mx-auto
                    h-[11in]
                    w-[8.5in]
                    bg-white
                    shadow-xl
                    print:m-0
                    print:h-[11in]
                    print:w-[8.5in]
                    print:shadow-none
                "
            >

                <CTCPrint
                    transaction={
                        transaction
                    }
                />

            </div>


        </main>

    );

}