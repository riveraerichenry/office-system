"use client";

import {
    useState,
} from "react";

import AF56PrintHeader
    from "./AF56PrintHeader";

import AF56PrintBody
    from "./AF56PrintBody";

import "./af56-print.css";


type Props = {

    transaction:
        any;

    items:
        any[];

};


export default function AF56Print({

    transaction,

    items = [],

}: Props) {


    /*
    ================================================================
    PRINT STATE
    ================================================================
    */

    const [
        printing,
        setPrinting,
    ] = useState(
        false
    );


    /*
    ================================================================
    PRINT MESSAGE
    ================================================================
    */

    const [
        message,
        setMessage,
    ] = useState(
        ""
    );


    /*
    ================================================================
    PRINT AF56

    Uses the browser's native print engine.

    IMPORTANT:

    NO server.js
    NO localhost:9100
    NO PNG
    NO html-to-image
    NO PDF conversion

    This preserves the original HTML/CSS quality of the AF56.
    ================================================================
    */

    function handlePrint() {

        try {

            /*
            ============================================================
            VALIDATE
            ============================================================
            */

            if (
                !transaction
            ) {

                throw new Error(
                    "AF56 transaction has not loaded."
                );

            }


            /*
            ============================================================
            START PRINTING
            ============================================================
            */

            setPrinting(
                true
            );


            setMessage(
                ""
            );


            /*
            ============================================================
            SMALL DELAY

            Allows React to update the button state before printing.
            ============================================================
            */

            window.setTimeout(

                () => {

                    window.print();

                },

                100

            );

        }
        catch (
            error: unknown
        ) {

            console.error(
                "AF56 PRINT ERROR:",
                error
            );


            let errorMessage =
                "Unable to print AF56.";


            if (
                error instanceof Error
            ) {

                errorMessage =
                    error.message;

            }


            setMessage(
                errorMessage
            );


            setPrinting(
                false
            );

        }

    }


    /*
    ================================================================
    PRINT EVENTS

    afterprint fires after the browser finishes the print process.
    ================================================================
    */

    if (
        typeof window !== "undefined"
    ) {

        window.onafterprint =
            () => {

                setPrinting(
                    false
                );

            };

    }


    /*
    ================================================================
    RENDER
    ================================================================
    */

    return (

        <div
            className="
                af56-page
            "
        >


            {/* =====================================================
                PRINT CONTROLS

                These will be hidden during printing.
            ===================================================== */}

            <div
                className="
                    af56-controls
                "
            >

                <button

                    type="button"

                    className="
                        af56-button
                        af56-button-primary
                    "

                    onClick={
                        handlePrint
                    }

                    disabled={
                        printing
                    }

                >

                    {

                        printing

                            ? "Printing..."

                            : "Print AF56"

                    }

                </button>


                {

                    message && (

                        <span

                            className="

                                af56-message-error

                            "

                        >

                            {

                                message

                            }

                        </span>

                    )

                }

            </div>


            {/* =====================================================
                ACTUAL AF56 PAPER

                This is the REAL HTML receipt.

                It is printed directly by the browser.
            ===================================================== */}

            <div

                className="
                    af56-paper
                "

            >


                {/* =================================================
                    ACTUAL AF56 FORM
                ================================================= */}

                <div

                    className="
                        af56-form
                    "

                >


                    {/* =============================================
                        HEADER
                    ============================================= */}

                    <AF56PrintHeader

                        transaction={
                            transaction
                        }

                    />


                    {/* =============================================
                        BODY
                    ============================================= */}

                    <AF56PrintBody

                        transaction={
                            transaction
                        }

                        items={
                            items
                        }

                    />


                </div>


            </div>


        </div>

    );

}