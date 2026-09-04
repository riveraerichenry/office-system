"use client";

import {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import Swal from "sweetalert2";

import {
    X,
} from "lucide-react";


import BookletHeader
    from "../general/BookletHeader";

import PayorSection
    from "./PayorSection";

import PermitSection
    from "./PermitSection";

import DeceasedSection
    from "./DeceasedSection";

import CertificateSection
    from "./CertificateSection";


type Props = {

    open: boolean;

    booklet: any;

    onClose: () => void;

    onSuccess: () => void;

};


function today() {

    return new Date()
        .toISOString()
        .substring(0, 10);

}


export default function AF58ReceiptModal({

    open,

    booklet,

    onClose,

    onSuccess,

}: Props) {


    /* ================================================================
       SAVING
    ================================================================ */

    const [
        saving,
        setSaving,
    ] = useState(false);


    /* ================================================================
       PAYOR
    ================================================================ */

    const [
        payor,
        setPayor,
    ] = useState("");


    const [
        gender,
        setGender,
    ] = useState("");


    const [
        paymentMode,
        setPaymentMode,
    ] = useState("Cash");


    /* ================================================================
       RECEIPT / PERMIT
    ================================================================ */

    const [
        receiptDate,
        setReceiptDate,
    ] = useState(
        today()
    );


    const [
        cityMunicipality,
        setCityMunicipality,
    ] = useState(
        "TAYTAY"
    );


    const [
        province,
        setProvince,
    ] = useState(
        "PALAWAN"
    );


    const [
        permitAction,
        setPermitAction,
    ] = useState("");


    const [
        remainsOf,
        setRemainsOf,
    ] = useState("");


    /* ================================================================
       DECEASED
    ================================================================ */

    const [
        deceasedName,
        setDeceasedName,
    ] = useState("");


    const [
        nationality,
        setNationality,
    ] = useState(
        "FILIPINO"
    );


    const [
        age,
        setAge,
    ] = useState("");


    const [
        sex,
        setSex,
    ] = useState("");


    const [
        dateOfDeath,
        setDateOfDeath,
    ] = useState("");


    const [
        causeOfDeath,
        setCauseOfDeath,
    ] = useState("");


    const [
        cemeteryName,
        setCemeteryName,
    ] = useState("");


    const [
        infectiousStatus,
        setInfectiousStatus,
    ] = useState("");


    const [
        embalmedStatus,
        setEmbalmedStatus,
    ] = useState("");


    const [
        dispositionOfRemains,
        setDispositionOfRemains,
    ] = useState("");


    /* ================================================================
       FEE
    ================================================================ */

    const [
        feeAmount,
        setFeeAmount,
    ] = useState("");


    /* ================================================================
       CERTIFICATION
    ================================================================ */

    const [
        certificationCity,
        setCertificationCity,
    ] = useState(
        "TAYTAY"
    );


    const [
        certificationProvince,
        setCertificationProvince,
    ] = useState(
        "PALAWAN"
    );


    const [
        certificationDate,
        setCertificationDate,
    ] = useState(
        today()
    );


    /* ================================================================
       RESET WHEN MODAL OPENS
    ================================================================ */

    useEffect(() => {

        if (!open) {

            return;

        }


        setSaving(false);

        setPayor("");

        setGender("");

        setPaymentMode(
            "Cash"
        );


        setReceiptDate(
            today()
        );


        setCityMunicipality(
            "TAYTAY"
        );


        setProvince(
            "PALAWAN"
        );


        setPermitAction("");

        setRemainsOf("");

        setDeceasedName("");


        setNationality(
            "FILIPINO"
        );


        setAge("");

        setSex("");

        setDateOfDeath("");

        setCauseOfDeath("");

        setCemeteryName("");

        setInfectiousStatus("");

        setEmbalmedStatus("");

        setDispositionOfRemains("");

        setFeeAmount("");


        setCertificationCity(
            "TAYTAY"
        );


        setCertificationProvince(
            "PALAWAN"
        );


        setCertificationDate(
            today()
        );


    }, [open]);


    /* ================================================================
       PROCESS AF58
    ================================================================ */

    async function processAF58() {


        /* ------------------------------------------------------------
           BOOKLET
        ------------------------------------------------------------ */

        if (!booklet) {

            await Swal.fire({

                icon: "warning",

                title:
                    "No Booklet Selected",

                text:
                    "Please select an active AF58 booklet.",

            });

            return;

        }


        /* ------------------------------------------------------------
           PAYOR
        ------------------------------------------------------------ */

        if (!payor.trim()) {

            await Swal.fire({

                icon: "warning",

                title:
                    "Required Field",

                text:
                    "Please enter the payor name.",

            });

            return;

        }


        /* ------------------------------------------------------------
           RECEIPT DATE
        ------------------------------------------------------------ */

        if (!receiptDate) {

            await Swal.fire({

                icon: "warning",

                title:
                    "Required Field",

                text:
                    "Please select the receipt date.",

            });

            return;

        }


        /* ------------------------------------------------------------
           PERMIT ACTION
        ------------------------------------------------------------ */

        if (!permitAction) {

            await Swal.fire({

                icon: "warning",

                title:
                    "Required Field",

                text:
                    "Please select the permit action.",

            });

            return;

        }


        /* ------------------------------------------------------------
           DECEASED NAME
        ------------------------------------------------------------ */

        if (!deceasedName.trim()) {

            await Swal.fire({

                icon: "warning",

                title:
                    "Required Field",

                text:
                    "Please enter the name of the deceased.",

            });

            return;

        }


        /* ------------------------------------------------------------
           FEE
        ------------------------------------------------------------ */

        const amount =
            Number(
                feeAmount || 0
            );


        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            await Swal.fire({

                icon: "warning",

                title:
                    "Invalid Fee",

                text:
                    "Please enter a valid fee amount.",

            });

            return;

        }


        /* ============================================================
           SAVE
        ============================================================ */

        try {

            setSaving(true);


            const response =
                await axios.post(

                    "/api/dipp/af58-transactions",

                    {

                        booklet_registration_id:
                            booklet.booklet_registration_id,


                        receipt_date:
                            receiptDate,


                        payor:
                            payor.trim(),


                        gender:
                            gender || null,


                        payment_mode:
                            paymentMode,


                        remarks:
                            null,


                        af58: {

                            city_municipality:
                                cityMunicipality.trim() ||
                                null,


                            province:
                                province.trim() ||
                                null,


                            permit_action:
                                permitAction ||
                                null,


                            remains_of:
                                remainsOf.trim() ||
                                null,


                            deceased_name:
                                deceasedName.trim(),


                            nationality:
                                nationality.trim() ||
                                null,


                            age:
                                age.trim() ||
                                null,


                            sex:
                                sex ||
                                null,


                            date_of_death:
                                dateOfDeath ||
                                null,


                            cause_of_death:
                                causeOfDeath.trim() ||
                                null,


                            cemetery_name:
                                cemeteryName.trim() ||
                                null,


                            infectious_status:
                                infectiousStatus ||
                                null,


                            embalmed_status:
                                embalmedStatus ||
                                null,


                            disposition_of_remains:
                                dispositionOfRemains.trim() ||
                                null,


                            fee_amount:
                                amount,


                            certification_city_municipality:
                                certificationCity.trim() ||
                                null,


                            certification_province:
                                certificationProvince.trim() ||
                                null,


                            certification_date:
                                certificationDate ||
                                receiptDate,

                        },

                    }

                );


            /* ========================================================
               TRANSACTION ID
            ======================================================== */

            const transactionId =
                response
                    ?.data
                    ?.transaction_id;


            if (!transactionId) {

                throw new Error(
                    "The transaction was saved, but no transaction ID was returned."
                );

            }


            /* ========================================================
               SUCCESS MESSAGE
            ======================================================== */

            await Swal.fire({

                icon: "success",

                title:
                    "AF58 Successfully Issued",

                text:
                    `O.R. No. ${response.data.or_number} successfully issued.`,

                timer:
                    1500,

                showConfirmButton:
                    false,

            });


            /* ========================================================
               OPEN AF58 PRINT PAGE
            ======================================================== */

            window.open(

                `/print/dipp/af58/${transactionId}`,

                "_blank",

                "width=420,height=850"

            );


            /* ========================================================
               REFRESH DIPP LIST
            ======================================================== */

            await onSuccess();


            /* ========================================================
               CLOSE MODAL
            ======================================================== */

            onClose();

        }
        catch (error: any) {

            console.error(
                "AF58 ERROR:",
                error
            );


            await Swal.fire({

                icon: "error",

                title:
                    "Unable to Process AF58",

                text:
                    error
                        ?.response
                        ?.data
                        ?.message ??
                    error?.message ??
                    "An unexpected error occurred.",

            });

        }
        finally {

            setSaving(false);

        }

    }


    /* ================================================================
       TOTAL
    ================================================================ */

    const totalAmount =
        Number(
            feeAmount || 0
        );


    /* ================================================================
       CLOSED
    ================================================================ */

    if (
        !open ||
        !booklet
    ) {

        return null;

    }


    /* ================================================================
       UI
    ================================================================ */

    return (

        <div
            className="
                af58-screen-modal
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


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        relative
                    "
                >

                    <BookletHeader
                        booklet={
                            booklet
                        }
                    />


                    <button

                        type="button"

                        disabled={
                            saving
                        }

                        onClick={
                            onClose
                        }

                        className="
                            absolute
                            right-5
                            top-5
                            rounded-lg
                            p-2
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-800
                            disabled:opacity-50
                        "
                    >

                        <X
                            size={22}
                        />

                    </button>

                </div>


                {/* ==================================================
                    BODY
                ================================================== */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        bg-slate-100
                        p-6
                    "
                >

                    <div
                        className="
                            space-y-5
                        "
                    >


                        {/* ==================================================
                            PAYOR
                        ================================================== */}

                        <PayorSection

                            payor={
                                payor
                            }

                            gender={
                                gender
                            }

                            paymentMode={
                                paymentMode
                            }

                            saving={
                                saving
                            }

                            onPayorChange={
                                setPayor
                            }

                            onGenderChange={
                                setGender
                            }

                            onPaymentModeChange={
                                setPaymentMode
                            }

                        />


                        {/* ==================================================
                            PERMIT
                        ================================================== */}

                        <PermitSection

                            receiptDate={
                                receiptDate
                            }

                            cityMunicipality={
                                cityMunicipality
                            }

                            province={
                                province
                            }

                            permitAction={
                                permitAction
                            }

                            remainsOf={
                                remainsOf
                            }

                            saving={
                                saving
                            }

                            onReceiptDateChange={
                                setReceiptDate
                            }

                            onCityMunicipalityChange={
                                setCityMunicipality
                            }

                            onProvinceChange={
                                setProvince
                            }

                            onPermitActionChange={
                                setPermitAction
                            }

                            onRemainsOfChange={
                                setRemainsOf
                            }

                        />


                        {/* ==================================================
                            DECEASED
                        ================================================== */}

                        <DeceasedSection

                            deceasedName={
                                deceasedName
                            }

                            nationality={
                                nationality
                            }

                            age={
                                age
                            }

                            sex={
                                sex
                            }

                            dateOfDeath={
                                dateOfDeath
                            }

                            causeOfDeath={
                                causeOfDeath
                            }

                            cemeteryName={
                                cemeteryName
                            }

                            infectiousStatus={
                                infectiousStatus
                            }

                            embalmedStatus={
                                embalmedStatus
                            }

                            dispositionOfRemains={
                                dispositionOfRemains
                            }

                            saving={
                                saving
                            }

                            onDeceasedNameChange={
                                setDeceasedName
                            }

                            onNationalityChange={
                                setNationality
                            }

                            onAgeChange={
                                setAge
                            }

                            onSexChange={
                                setSex
                            }

                            onDateOfDeathChange={
                                setDateOfDeath
                            }

                            onCauseOfDeathChange={
                                setCauseOfDeath
                            }

                            onCemeteryNameChange={
                                setCemeteryName
                            }

                            onInfectiousStatusChange={
                                setInfectiousStatus
                            }

                            onEmbalmedStatusChange={
                                setEmbalmedStatus
                            }

                            onDispositionChange={
                                setDispositionOfRemains
                            }

                        />


                        {/* ==================================================
                            FEE / CERTIFICATION
                        ================================================== */}

                        <CertificateSection

                            feeAmount={
                                feeAmount
                            }

                            certificationCity={
                                certificationCity
                            }

                            certificationProvince={
                                certificationProvince
                            }

                            certificationDate={
                                certificationDate
                            }

                            saving={
                                saving
                            }

                            onFeeAmountChange={
                                setFeeAmount
                            }

                            onCertificationCityChange={
                                setCertificationCity
                            }

                            onCertificationProvinceChange={
                                setCertificationProvince
                            }

                            onCertificationDateChange={
                                setCertificationDate
                            }

                        />

                    </div>

                </div>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-t
                        bg-white
                        px-6
                        py-4
                    "
                >


                    {/* ==================================================
                        CLOSE
                    ================================================== */}

                    <button

                        type="button"

                        disabled={
                            saving
                        }

                        onClick={
                            onClose
                        }

                        className="
                            rounded-lg
                            border
                            border-slate-300
                            px-6
                            py-2.5
                            font-semibold
                            text-slate-700
                            transition
                            hover:bg-slate-100
                            disabled:opacity-50
                        "
                    >

                        Close

                    </button>


                    {/* ==================================================
                        TOTAL + PROCESS
                    ================================================== */}

                    <div
                        className="
                            flex
                            items-center
                            gap-6
                        "
                    >

                        <div
                            className="
                                text-right
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                "
                            >

                                Total Amount

                            </p>


                            <p
                                className="
                                    text-2xl
                                    font-black
                                    text-green-700
                                "
                            >

                                ₱

                                {totalAmount.toLocaleString(
                                    "en-PH",
                                    {
                                        minimumFractionDigits:
                                            2,

                                        maximumFractionDigits:
                                            2,
                                    }
                                )}

                            </p>

                        </div>


                        <button

                            type="button"

                            disabled={
                                saving
                            }

                            onClick={
                                processAF58
                            }

                            className="
                                rounded-lg
                                bg-blue-600
                                px-7
                                py-2.5
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {saving
                                ? "Processing..."
                                : "Process AF58"
                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}