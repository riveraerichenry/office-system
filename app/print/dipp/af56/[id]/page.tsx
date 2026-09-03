"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
} from "next/navigation";

import axios from "axios";

import AF56Print
    from "@/components/dipp/af56/print/AF56Print";

import "@/components/dipp/af56/print/af56-print.css";


export default function AF56PrintPage() {

    const params =
        useParams();


    const id =
        String(
            params?.id ?? ""
        );


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    const [
        transaction,
        setTransaction,
    ] = useState<any>(
        null
    );


    const [
        items,
        setItems,
    ] = useState<any[]>(
        []
    );


    useEffect(() => {

        if (!id) {

            setError(
                "Missing transaction ID."
            );

            setLoading(
                false
            );

            return;

        }


        async function loadPrintData() {

            try {

                setLoading(
                    true
                );


                setError(
                    null
                );


                /*
                ====================================================
                GET AF56 TRANSACTION
                ====================================================
                */

                const response =
                    await axios.get(

                        `/api/dipp/rpt-transactions/${id}`

                    );


                console.log(
                    "AF56 TRANSACTION:",
                    response.data
                );


                /*
                ====================================================
                RESPONSE DATA
                ====================================================
                */

                const transactionData =
                    response?.data
                        ?.transaction;


                const itemsData =
                    response?.data
                        ?.items;


                /*
                ====================================================
                VALIDATE
                ====================================================
                */

                if (
                    !transactionData
                ) {

                    throw new Error(
                        "RPT transaction not found."
                    );

                }


                /*
                ====================================================
                SAVE DATA
                ====================================================
                */

                setTransaction(
                    transactionData
                );


                setItems(

                    Array.isArray(
                        itemsData
                    )

                        ? itemsData

                        : []

                );


            }
            catch (
                err: any
            ) {

                console.error(
                    "AF56 PRINT ERROR:",
                    err
                );


                setError(

                    err
                        ?.response
                        ?.data
                        ?.error

                    ??

                    err?.message

                    ??

                    "Unable to load AF56 transaction."

                );

            }
            finally {

                setLoading(
                    false
                );

            }

        }


        loadPrintData();

    }, [id]);


    /*
    ================================================================
    LOADING
    ================================================================
    */

    if (
        loading
    ) {

        return (

            <div
                style={{

                    width:
                        "100%",

                    minHeight:
                        "100vh",

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    fontFamily:
                        "Arial, sans-serif",

                    fontSize:
                        "16px",

                }}
            >

                Loading AF56...

            </div>

        );

    }


    /*
    ================================================================
    ERROR
    ================================================================
    */

    if (
        error
    ) {

        return (

            <div
                style={{

                    padding:
                        "30px",

                    fontFamily:
                        "Arial, sans-serif",

                }}
            >

                <h2>

                    AF56 Print Error

                </h2>


                <p>

                    {error}

                </p>

            </div>

        );

    }


    /*
    ================================================================
    PRINT PAGE
    ================================================================
    */

    return (

        <main>

            <AF56Print

                transaction={
                    transaction
                }

                items={
                    items
                }

            />

        </main>

    );

}