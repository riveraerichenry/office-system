"use client";

import {
    useEffect,
    useState,
} from "react";

import { useParams } from "next/navigation";

import axios from "axios";

import Receipt from "@/components/dipp/receipt/Receipt";

import A51Print from "@/components/dipp/receipt/A51Print";

import "@/components/dipp/receipt/a51-print.css";

export default function ReceiptPrintPage() {

    const params = useParams();

    const id =
        params.id as string;


    const [loading, setLoading] =
        useState(true);

    const [header, setHeader] =
        useState<any>(null);

    const [items, setItems] =
        useState<any[]>([]);


    useEffect(() => {

        if (!id) {
            return;
        }


        let printTimer: ReturnType<
            typeof setTimeout
        >;


        async function loadReceipt() {

            try {

                const response =
                    await axios.get(
                        `/api/dipp/transactions/${id}`
                    );


                const receiptHeader =
                    response.data.header;

                const receiptItems =
                    response.data.items || [];


                setHeader(
                    receiptHeader
                );

                setItems(
                    receiptItems
                );


                /*
                ========================================================
                WAIT UNTIL REACT FINISHES RENDERING
                ========================================================
                */

                printTimer =
                    setTimeout(
                        () => {

                            window.print();

                        },
                        1000
                    );

            }
            catch (error) {

                console.error(
                    "Unable to load A51 receipt:",
                    error
                );

            }
            finally {

                setLoading(false);

            }

        }


        loadReceipt();


        /*
        ========================================================
        CLEANUP
        ========================================================
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
    ============================================================
    LOADING
    ============================================================
    */

    if (loading) {

        return (
            <div className="a51-loading">

                Loading receipt...

            </div>
        );

    }


    /*
    ============================================================
    RECEIPT NOT FOUND
    ============================================================
    */

    if (!header) {

        return (
            <div className="a51-error">

                Receipt not found.

            </div>
        );

    }


    /*
    ============================================================
    PRINT PAGE
    ============================================================
    */

    return (

        <main className="a51-print-document">

            <A51Print
                transaction={header}
                items={items}
            />

        </main>

    );

}