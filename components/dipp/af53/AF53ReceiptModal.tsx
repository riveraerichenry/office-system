"use client";

import {
    useEffect,
    useState,
} from "react";

import axios from "axios";
import { useRouter } from "next/navigation";

import AF53Header from "./AF53Header";
import AF53Body from "./AF53Body";
import AF53Footer from "./AF53Footer";


/* ============================================================
   PROPS
============================================================ */

type Props = {
    open: boolean;
    booklet: any;
    onClose: () => void;
    onSuccess?: () => void;
};


/* ============================================================
   AF53 FORM DATA
============================================================ */

export type AF53FormData = {

    /* ========================================================
       FORM
    ======================================================== */

    formNumber: string;
    series: string;


    /* ========================================================
       CERTIFICATE
    ======================================================== */

    province: string;
    municipality: string;
    issueDate: string;


    /* ========================================================
       OWNER
    ======================================================== */

    ownerName: string;
    ownerMunicipality: string;
    ownerProvince: string;


    /* ========================================================
       ANIMAL
    ======================================================== */

    animalType: string;
    description: string;
    sex: string;
    years: string;


    /* ========================================================
       BRANDS
    ======================================================== */

    brandMunicipality: string;
    brandOwner: string;


    /* ========================================================
       PAYMENT
    ======================================================== */

    paymentMode: string;
};


/* ============================================================
   TODAY
============================================================ */

function today() {

    return new Date()
        .toISOString()
        .substring(0, 10);

}


/* ============================================================
   COMPONENT
============================================================ */

export default function AF53ReceiptModal({

    open,
    booklet,
    onClose,
    onSuccess,

}: Props) {

    const router = useRouter();


    /* ========================================================
       SAVING
    ======================================================== */

    const [saving, setSaving] =
        useState(false);


    /* ========================================================
       FORM
    ======================================================== */

    const [formNumber, setFormNumber] =
        useState("");

    const [series, setSeries] =
        useState("C");


    /* ========================================================
       CERTIFICATE
    ======================================================== */

    const [province, setProvince] =
        useState("PALAWAN");

    const [municipality, setMunicipality] =
        useState("TAYTAY");

    const [issueDate, setIssueDate] =
        useState(today());


    /* ========================================================
       OWNER
    ======================================================== */

    const [ownerName, setOwnerName] =
        useState("");

    const [ownerMunicipality, setOwnerMunicipality] =
        useState("TAYTAY");

    const [ownerProvince, setOwnerProvince] =
        useState("PALAWAN");


    /* ========================================================
       ANIMAL
    ======================================================== */

    const [animalType, setAnimalType] =
        useState("Cow");

    const [description, setDescription] =
        useState("");

    const [sex, setSex] =
        useState("");

    const [years, setYears] =
        useState("");


    /* ========================================================
       BRANDS
    ======================================================== */

    const [brandMunicipality, setBrandMunicipality] =
        useState("");

    const [brandOwner, setBrandOwner] =
        useState("");


    /* ========================================================
       PAYMENT
    ======================================================== */

    const [paymentMode, setPaymentMode] =
        useState("Cash");


    /* ============================================================
       RESET FORM WHEN OPENED
    ============================================================ */

    useEffect(() => {

        if (!open) {
            return;
        }


        setSaving(false);


        /* ----------------------------------------------------
           FORM
        ---------------------------------------------------- */

        setFormNumber("");
        setSeries("C");


        /* ----------------------------------------------------
           CERTIFICATE
        ---------------------------------------------------- */

        setProvince("PALAWAN");
        setMunicipality("TAYTAY");
        setIssueDate(today());


        /* ----------------------------------------------------
           OWNER
        ---------------------------------------------------- */

        setOwnerName("");
        setOwnerMunicipality("TAYTAY");
        setOwnerProvince("PALAWAN");


        /* ----------------------------------------------------
           ANIMAL
        ---------------------------------------------------- */

        setAnimalType("Cow");
        setDescription("");
        setSex("");
        setYears("");


        /* ----------------------------------------------------
           BRANDS
        ---------------------------------------------------- */

        setBrandMunicipality("");
        setBrandOwner("");


        /* ----------------------------------------------------
           PAYMENT
        ---------------------------------------------------- */

        setPaymentMode("Cash");

    }, [open]);


    /* ============================================================
       PROCESS AF53

       IMPORTANT:

       grandTotal:
           Actual AF53 charge.
           This is recorded in dipp_transactions.

       paymentReceived:
           UI ONLY.
           Used to calculate change.

       paymentReceived is NOT sent to the API.
    ============================================================ */

    async function processAF53(
        grandTotal: number,
        paymentReceived: number
    ) {

        /* ====================================================
           BOOKLET
        ==================================================== */

        if (!booklet) {

            window.alert(
                "No AF53 booklet was selected."
            );

            return;
        }


        if (!booklet.booklet_registration_id) {

            window.alert(
                "The selected booklet registration could not be identified."
            );

            return;
        }


        /* ====================================================
           GRAND TOTAL
        ==================================================== */

        if (
            !Number.isFinite(grandTotal) ||
            grandTotal < 0
        ) {

            window.alert(
                "Please enter a valid grand total."
            );

            return;
        }


        /* ====================================================
           PAYMENT RECEIVED

           UI VALIDATION ONLY.

           This value is NOT stored.
        ==================================================== */

        if (
            !Number.isFinite(paymentReceived) ||
            paymentReceived < grandTotal
        ) {

            window.alert(
                "Payment received is less than the grand total."
            );

            return;
        }


        /* ====================================================
           OWNER
        ==================================================== */

        if (!ownerName.trim()) {

            window.alert(
                "Please enter the name of the owner."
            );

            return;
        }


        /* ====================================================
           CERTIFICATE
        ==================================================== */

        if (!province.trim()) {

            window.alert(
                "Please enter the province."
            );

            return;
        }


        if (!municipality.trim()) {

            window.alert(
                "Please enter the municipality."
            );

            return;
        }


        if (!issueDate) {

            window.alert(
                "Please select the certificate date."
            );

            return;
        }


        /* ====================================================
           ANIMAL TYPE
        ==================================================== */

        const validAnimalTypes = [
            "Cow",
            "Carabao",
            "Horse",
        ];


        if (!animalType) {

            window.alert(
                "Please select the animal type."
            );

            return;
        }


        if (
            !validAnimalTypes.includes(
                animalType
            )
        ) {

            window.alert(
                "Invalid animal type."
            );

            return;
        }


        /* ====================================================
           DESCRIPTION
        ==================================================== */

        if (!description.trim()) {

            window.alert(
                "Please enter the description of the animal."
            );

            return;
        }


        /* ====================================================
           YEARS
        ==================================================== */

        let numericYears:
            number | null = null;


        if (years.trim() !== "") {

            numericYears =
                Number(years);


            if (
                !Number.isInteger(
                    numericYears
                ) ||
                numericYears < 0
            ) {

                window.alert(
                    "Please enter a valid age in years."
                );

                return;
            }

        }


        /* ====================================================
           SAVE
        ==================================================== */

        try {

            setSaving(true);


            const response =
                await axios.post(

                    "/api/dipp/af53-transactions",

                    {

                        /* ==================================================
                           BOOKLET
                        ================================================== */

                        booklet_registration_id:
                            booklet.booklet_registration_id,


                        /* ==================================================
                           RECEIPT DATE
                        ================================================== */

                        receipt_date:
                            issueDate,


                        /* ==================================================
                           CERTIFICATE
                        ================================================== */

                        municipality:
                            municipality.trim(),

                        province:
                            province.trim(),


                        /* ==================================================
                           OWNER
                        ================================================== */

                        owner_name:
                            ownerName.trim(),

                        owner_gender:
                            sex || null,

                        owner_municipality:
                            ownerMunicipality.trim() ||
                            null,

                        owner_province:
                            ownerProvince.trim() ||
                            null,


                        /* ==================================================
                           ANIMAL
                        ================================================== */

                        animal_type:
                            animalType,

                        description:
                            description.trim(),

                        sex:
                            sex || null,

                        years:
                            numericYears,


                        /* ==================================================
                           BRANDS
                        ================================================== */

                        brand_municipality:
                            brandMunicipality.trim() ||
                            null,

                        brand_owner:
                            brandOwner.trim() ||
                            null,


                        /* ==================================================
                           PAYMENT MODE
                        ================================================== */

                        payment_mode:
                            paymentMode ||
                            "Cash",


                        /* ==================================================
                           GRAND TOTAL

                           THIS IS RECORDED.

                           Payment Received is intentionally NOT
                           included in this request.
                        ================================================== */

                        grand_total:
                            Number(
                                grandTotal.toFixed(2)
                            ),

                    }

                );


            /* ====================================================
               TRANSACTION ID
            ==================================================== */

            const transactionId =
                response?.data?.transaction_id ??
                response?.data?.id ??
                response?.data?.transaction?.id;


            if (!transactionId) {

                console.error(
                    "AF53 POST RESPONSE:",
                    response?.data
                );


                throw new Error(
                    "AF53 was saved, but the transaction ID was not returned."
                );

            }


            /* ====================================================
               OR NUMBER
            ==================================================== */

            const orNumber =
                response?.data?.or_number;


            /* ====================================================
               SUCCESS
            ==================================================== */

            window.alert(

                orNumber
                    ? `AF53 successfully issued.\n\nO.R. No. ${orNumber}`
                    : "AF53 successfully issued."

            );


            /* ====================================================
               REFRESH
            ==================================================== */

            if (onSuccess) {

                await onSuccess();

            }


            /* ====================================================
               CLOSE
            ==================================================== */

            onClose();


            /* ====================================================
               PRINT
            ==================================================== */

            router.push(
                `/print/dipp/af53/${transactionId}`
            );


        } catch (error: any) {

            console.error(
                "AF53 TRANSACTION ERROR:",
                error
            );


            const message =
                error?.response?.data?.error ??
                error?.response?.data?.message ??
                error?.message ??
                "Unable to process AF53 transaction.";


            window.alert(
                message
            );


        } finally {

            setSaving(false);

        }

    }


    /* ========================================================
       FORM DATA
    ======================================================== */

    const formData: AF53FormData = {

        formNumber,
        series,

        province,
        municipality,
        issueDate,

        ownerName,
        ownerMunicipality,
        ownerProvince,

        animalType,
        description,
        sex,
        years,

        brandMunicipality,
        brandOwner,

        paymentMode,

    };


    /* ========================================================
       PREVENT UNUSED VARIABLE WARNING
    ======================================================== */

    void formData;


    /* ========================================================
       RENDER
    ======================================================== */

    if (
        !open ||
        !booklet
    ) {

        return null;

    }


    return (

        <div
            className="
                af53-screen-modal
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                p-6
            "
        >

            <div
                className="
                    flex
                    h-[94vh]
                    w-full
                    max-w-7xl
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* ====================================================
                    HEADER
                ==================================================== */}

                <AF53Header
                    booklet={booklet}
                    saving={saving}
                    onClose={onClose}
                />


                {/* ====================================================
                    BODY
                ==================================================== */}

                <AF53Body

                    formNumber={
                        formNumber
                    }

                    series={
                        series
                    }


                    province={
                        province
                    }

                    municipality={
                        municipality
                    }

                    issueDate={
                        issueDate
                    }


                    ownerName={
                        ownerName
                    }

                    ownerMunicipality={
                        ownerMunicipality
                    }

                    ownerProvince={
                        ownerProvince
                    }


                    animalType={
                        animalType
                    }

                    description={
                        description
                    }

                    sex={
                        sex
                    }

                    years={
                        years
                    }


                    brandMunicipality={
                        brandMunicipality
                    }

                    brandOwner={
                        brandOwner
                    }


                    paymentMode={
                        paymentMode
                    }

                    saving={
                        saving
                    }


                    onFormNumberChange={
                        setFormNumber
                    }

                    onSeriesChange={
                        setSeries
                    }


                    onProvinceChange={
                        setProvince
                    }

                    onMunicipalityChange={
                        setMunicipality
                    }

                    onIssueDateChange={
                        setIssueDate
                    }


                    onOwnerNameChange={
                        setOwnerName
                    }

                    onOwnerMunicipalityChange={
                        setOwnerMunicipality
                    }

                    onOwnerProvinceChange={
                        setOwnerProvince
                    }


                    onAnimalTypeChange={
                        setAnimalType
                    }

                    onSexChange={
                        setSex
                    }

                    onDescriptionChange={
                        setDescription
                    }

                    onYearsChange={
                        setYears
                    }


                    onBrandMunicipalityChange={
                        setBrandMunicipality
                    }

                    onBrandOwnerChange={
                        setBrandOwner
                    }


                    onPaymentModeChange={
                        setPaymentMode
                    }

                />


                {/* ====================================================
                    FOOTER

                    Payment Received:
                        UI ONLY

                    Change:
                        UI ONLY

                    Grand Total:
                        Sent to API
                ==================================================== */}

                <AF53Footer

                    saving={
                        saving
                    }

                    onClose={
                        onClose
                    }

                    onProcess={
                        processAF53
                    }

                />

            </div>

        </div>

    );

}