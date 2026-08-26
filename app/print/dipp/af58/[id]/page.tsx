"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
} from "next/navigation";

import axios from "axios";

import AF58Print
    from "@/components/dipp/a58/print/AF58Print";

import "@/components/dipp/a58/print/af58-print.css";


export default function AF58PrintPage() {

    const params = useParams();

    const id =
        String(params?.id ?? "");


    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [transaction, setTransaction] =
        useState<any>(null);

    const [af58, setAf58] =
        useState<any>(null);


    useEffect(() => {

        if (!id) {

            setError(
                "Missing transaction ID."
            );

            setLoading(false);

            return;

        }


        let printTimer:
            ReturnType<
                typeof setTimeout
            > | null = null;


        async function loadPrintData() {

            try {

                /*
                ========================================================
                TRANSACTION HEADER
                ========================================================
                */

                const transactionResponse =
                    await axios.get(
                        `/api/dipp/transactions/${id}`
                    );


                /*
                ========================================================
                AF58 DETAILS
                ========================================================
                */

                const af58Response =
                    await axios.get(
                        `/api/dipp/af58-transactions/${id}`
                    );


                /*
                ========================================================
                HEADER
                ========================================================
                */

                const header =
                    transactionResponse
                        ?.data
                        ?.header;


                /*
                ========================================================
                AF58
                ========================================================
                */

                const af58Data =
                    af58Response
                        ?.data
                        ?.af58;


                /*
                ========================================================
                DEBUG
                ========================================================
                */

                console.log(
                    "================================"
                );

                console.log(
                    "AF58 PRINT TRANSACTION:"
                );

                console.log(
                    header
                );

                console.log(
                    "AF58 PRINT DETAILS:"
                );

                console.log(
                    af58Data
                );

                console.log(
                    "================================"
                );


                /*
                ========================================================
                VALIDATE HEADER
                ========================================================
                */

                if (!header) {

                    throw new Error(
                        "Transaction header not found."
                    );

                }


                /*
                ========================================================
                VALIDATE AF58
                ========================================================
                */

                if (!af58Data) {

                    throw new Error(
                        "AF58 details not found."
                    );

                }


                /*
                ========================================================
                SAVE DATA
                ========================================================
                */

                setTransaction(
                    header
                );

                setAf58(
                    af58Data
                );


                /*
                ========================================================
                STOP LOADING
                ========================================================
                */

                setLoading(
                    false
                );


                /*
                ========================================================
                WAIT FOR RENDER
                ========================================================
                */

                printTimer =
                    setTimeout(
                        () => {

                            window.print();

                        },
                        700
                    );

            }
            catch (err: any) {

                console.error(
                    "AF58 PRINT ERROR:",
                    err
                );


                setError(
                    err
                        ?.response
                        ?.data
                        ?.error ??
                    err?.message ??
                    "Unable to load AF58 receipt."
                );


                setLoading(
                    false
                );

            }

        }


        loadPrintData();


        /*
        ================================================================
        CLEANUP
        ================================================================
        */

        return () => {

            if (printTimer) {

                clearTimeout(
                    printTimer
                );

            }

        };

    }, [id]);


    /*
    ====================================================================
    LOADING
    ====================================================================
    */

    if (loading) {

        return (

            <div
                style={{
                    width: "100%",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily:
                        "Arial, sans-serif",
                    fontSize: "16px",
                }}
            >

                Loading AF58 receipt...

            </div>

        );

    }


    /*
    ====================================================================
    ERROR
    ====================================================================
    */

    if (error) {

        return (

            <div
                style={{
                    padding: "30px",
                    fontFamily:
                        "Arial, sans-serif",
                }}
            >

                <h2>
                    AF58 Print Error
                </h2>

                <p>
                    {error}
                </p>

            </div>

        );

    }


    /*
    ====================================================================
    PRINT DOCUMENT
    ====================================================================
    */

    return (

        <main>

            <AF58Print

                transaction={
                    transaction
                }

                af58={
                    af58
                }

            />

        </main>

    );

}