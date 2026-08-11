"use client";

import {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import Swal from "sweetalert2";

import {
    CalendarDays,
    X,
} from "lucide-react";

import BookletHeader from "../general/BookletHeader";
import PayorSection from "./PayorSection";

type Props = {
    open: boolean;

    booklet: any;

    onClose: () => void;

    onSuccess: () => void;
};

export default function AF58ReceiptModal({
    open,
    booklet,
    onClose,
    onSuccess,
}: Props) {

    /* ================================================================
       STATE
    ================================================================= */

    const [
        saving,
        setSaving,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Receipt
    |--------------------------------------------------------------------------
    */

    const [
        receiptDate,
        setReceiptDate,
    ] = useState(
        new Date()
            .toISOString()
            .substring(0, 10)
    );

    const [
        payor,
        setPayor,
    ] = useState("");

    const [
        paymentMode,
        setPaymentMode,
    ] = useState("Cash");

    /*
    |--------------------------------------------------------------------------
    | Burial Permit
    |--------------------------------------------------------------------------
    */

    const [
        cityMunicipality,
        setCityMunicipality,
    ] = useState("TAYTAY");

    const [
        province,
        setProvince,
    ] = useState("PALAWAN");

    const [
        permitAction,
        setPermitAction,
    ] = useState("");

    const [
        remainsOf,
        setRemainsOf,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Deceased
    |--------------------------------------------------------------------------
    */

    const [
        deceasedName,
        setDeceasedName,
    ] = useState("");

    const [
        nationality,
        setNationality,
    ] = useState("FILIPINO");

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

    /*
    |--------------------------------------------------------------------------
    | Fee
    |--------------------------------------------------------------------------
    */

    const [
        feeAmount,
        setFeeAmount,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Certification
    |--------------------------------------------------------------------------
    */

    const [
        certificationCity,
        setCertificationCity,
    ] = useState("TAYTAY");

    const [
        certificationProvince,
        setCertificationProvince,
    ] = useState("PALAWAN");

    const [
        certificationDate,
        setCertificationDate,
    ] = useState(
        new Date()
            .toISOString()
            .substring(0, 10)
    );

    /* ================================================================
       RESET WHEN MODAL OPENS
    ================================================================= */

    useEffect(() => {

        if (!open) {
            return;
        }

        setSaving(false);

        setReceiptDate(
            new Date()
                .toISOString()
                .substring(0, 10)
        );

        setPayor("");

        setPaymentMode(
            "Cash"
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
            new Date()
                .toISOString()
                .substring(0, 10)
        );

    }, [open]);

    /* ================================================================
       PROCESS AF58
    ================================================================= */

    async function processAF58() {

        if (!booklet) {

            await Swal.fire({
                icon: "warning",
                title: "No Booklet Selected",
                text:
                    "Please select an active AF58 booklet.",
            });

            return;
        }

        /* ------------------------------------------------------------
           Payor
        ------------------------------------------------------------ */

        if (
            !payor.trim()
        ) {

            await Swal.fire({
                icon: "warning",
                title: "Required Field",
                text:
                    "Please enter the payor name.",
            });

            return;
        }

        /* ------------------------------------------------------------
           Receipt Date
        ------------------------------------------------------------ */

        if (
            !receiptDate
        ) {

            await Swal.fire({
                icon: "warning",
                title: "Required Field",
                text:
                    "Please select the receipt date.",
            });

            return;
        }

        /* ------------------------------------------------------------
           Permit Action
        ------------------------------------------------------------ */

        if (
            !permitAction
        ) {

            await Swal.fire({
                icon: "warning",
                title: "Required Field",
                text:
                    "Please select the permit action.",
            });

            return;
        }

        /* ------------------------------------------------------------
           Deceased Name
        ------------------------------------------------------------ */

        if (
            !deceasedName.trim()
        ) {

            await Swal.fire({
                icon: "warning",
                title: "Required Field",
                text:
                    "Please enter the name of the deceased.",
            });

            return;
        }

        /* ------------------------------------------------------------
           Fee
        ------------------------------------------------------------ */

        const amount =
            Number(
                feeAmount || 0
            );

        if (
            !Number.isFinite(
                amount
            ) ||
            amount < 0
        ) {

            await Swal.fire({
                icon: "warning",
                title: "Invalid Fee",
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

            await Swal.fire({

                icon: "success",

                title:
                    "AF58 Successfully Issued",

                text:
                    `O.R. No. ${response.data.or_number}`,

                timer: 1500,

                showConfirmButton:
                    false,

            });

            await onSuccess();

            onClose();

        } catch (
            error: any
        ) {

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
                        ?.message ||
                    "An unexpected error occurred.",

            });

        } finally {

            setSaving(false);

        }

    }

    /* ================================================================
       DO NOT RENDER
    ================================================================= */

    if (
        !open ||
        !booklet
    ) {

        return null;

    }

    /* ================================================================
       TOTAL
    ================================================================= */

    const totalAmount =
        Number(
            feeAmount || 0
        );

    /* ================================================================
       RENDER
    ================================================================= */

    return (

        <div
            className="
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
                    BOOKLET HEADER
                ================================================== */}

                <div className="relative">

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
                            PAYOR INFORMATION
                        ================================================== */}

                        <PayorSection

                            payor={
                                payor
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

                            onPaymentModeChange={
                                setPaymentMode
                            }

                        />

                        {/* ==================================================
                            DATE ISSUED
                        ================================================== */}

                        <section
                            className="
                                rounded-xl
                                border
                                bg-white
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    border-b
                                    bg-slate-50
                                    px-5
                                    py-3
                                "
                            >

                                <h3
                                    className="
                                        font-semibold
                                        text-slate-800
                                    "
                                >

                                    Certificate Information

                                </h3>

                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-3
                                    gap-5
                                    p-5
                                "
                            >

                                {/* Date Issued */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Date Issued

                                    </label>

                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                rounded-lg
                                                border
                                                border-slate-300
                                                bg-white
                                                px-3
                                                py-2.5
                                            "
                                        >

                                            <span
                                                className="
                                                    font-medium
                                                    text-slate-700
                                                "
                                            >

                                                {new Date(
                                                    `${receiptDate}T00:00:00`
                                                ).toLocaleDateString(
                                                    "en-PH",
                                                    {
                                                        year:
                                                            "numeric",
                                                        month:
                                                            "long",
                                                        day:
                                                            "numeric",
                                                    }
                                                )}

                                            </span>

                                            <CalendarDays
                                                size={
                                                    18
                                                }
                                                className="
                                                    text-slate-500
                                                "
                                            />

                                        </div>

                                        <input
                                            type="date"
                                            value={
                                                receiptDate
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setReceiptDate(
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                absolute
                                                inset-0
                                                h-full
                                                w-full
                                                cursor-pointer
                                                opacity-0
                                            "
                                        />

                                    </div>

                                </div>

                                {/* City */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        City / Municipality

                                    </label>

                                    <input
                                        value={
                                            cityMunicipality
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCityMunicipality(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                            uppercase
                                        "
                                    />

                                </div>

                                {/* Province */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Province

                                    </label>

                                    <input
                                        value={
                                            province
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setProvince(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                            uppercase
                                        "
                                    />

                                </div>

                                <div
                                    className="
                                        grid
                                        grid-cols-2
                                        gap-5
                                    "
                                >

                                    {/* Permit Action */}

                                    <div>

                                        <label
                                            className="
                                                mb-1
                                                block
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-slate-500
                                            "
                                        >

                                            Permission

                                        </label>

                                        <select
                                            value={
                                                permitAction
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setPermitAction(
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                w-full
                                                rounded-lg
                                                border
                                                border-slate-300
                                                bg-white
                                                px-3
                                                py-2.5
                                            "
                                        >

                                            <option value="">
                                                Select
                                            </option>

                                            <option value="INTER">
                                                Inter
                                            </option>

                                            <option value="DIAMETER">
                                                Diameter
                                            </option>

                                            <option value="REMOVE">
                                                Remove
                                            </option>

                                        </select>

                                    </div>

                                    {/* Remains Of */}

                                    

                                </div>

                            </div>

                        </section>

                     

                        {/* ==================================================
                            DECEASED INFORMATION
                        ================================================== */}

                        <section
                            className="
                                rounded-xl
                                border
                                bg-white
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    border-b
                                    bg-slate-50
                                    px-5
                                    py-3
                                "
                            >

                                <h3
                                    className="
                                        font-semibold
                                        text-slate-800
                                    "
                                >

                                    Information of the Deceased

                                </h3>

                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-3
                                    gap-5
                                    p-5
                                "
                            >

                                {/* Name */}

                                <div
                                    className="
                                        col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Name

                                    </label>

                                    <input
                                        value={
                                            deceasedName
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setDeceasedName(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                        "
                                    />

                                </div>

                                {/* Nationality */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Nationality

                                    </label>

                                    <input
                                        value={
                                            nationality
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setNationality(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                            uppercase
                                        "
                                    />

                                </div>

                                {/* Age */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Age

                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            age
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setAge(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                        "
                                    />

                                </div>

                                {/* Sex */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Sex

                                    </label>

                                    <select
                                        value={
                                            sex
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSex(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-white
                                            px-3
                                            py-2.5
                                        "
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option value="MALE">
                                            Male
                                        </option>

                                        <option value="FEMALE">
                                            Female
                                        </option>

                                    </select>

                                </div>

                                {/* Date of Death */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Date of Death

                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            dateOfDeath
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setDateOfDeath(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                        "
                                    />

                                </div>

                                {/* Cause of Death */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Cause of Death

                                    </label>

                                    <input
                                        value={
                                            causeOfDeath
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCauseOfDeath(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                        "
                                    />

                                </div>

                                {/* Cemetery */}

                                <div
                                    className="
                                        col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Name of Cemetery

                                    </label>

                                    <input
                                        value={
                                            cemeteryName
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCemeteryName(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                        "
                                    />

                                </div>

                                {/* Infectious */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Infectious / Non-infectious

                                    </label>

                                    <select
                                        value={
                                            infectiousStatus
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setInfectiousStatus(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-white
                                            px-3
                                            py-2.5
                                        "
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option value="INFECTIOUS">
                                            Infectious
                                        </option>

                                        <option value="NON-INFECTIOUS">
                                            Non-infectious
                                        </option>

                                    </select>

                                </div>

                                {/* Embalmed */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Body

                                    </label>

                                    <select
                                        value={
                                            embalmedStatus
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setEmbalmedStatus(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-white
                                            px-3
                                            py-2.5
                                        "
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option value="EMBALMED">
                                            Embalmed
                                        </option>

                                        <option value="NOT EMBALMED">
                                            Not Embalmed
                                        </option>

                                    </select>

                                </div>

                                {/* Disposition */}

                                <div
                                    className="
                                        col-span-3
                                    "
                                >

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Disposition of Remains

                                    </label>

                                    <input
                                        value={
                                            dispositionOfRemains
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setDispositionOfRemains(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                        "
                                    />

                                </div>

                            </div>

                        </section>

                        {/* ==================================================
                            FEE AND CERTIFICATION
                        ================================================== */}

                        <section
                            className="
                                rounded-xl
                                border
                                bg-white
                                shadow-sm
                            "
                        >

                            <div
                                className="
                                    border-b
                                    bg-slate-50
                                    px-5
                                    py-3
                                "
                            >

                                <h3
                                    className="
                                        font-semibold
                                        text-slate-800
                                    "
                                >

                                    Fee and Certification

                                </h3>

                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-4
                                    gap-5
                                    p-5
                                "
                            >

                                {/* Fee */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Fee per City/Municipal Ordinance

                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            feeAmount
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setFeeAmount(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                            text-right
                                            font-semibold
                                        "
                                    />

                                </div>

                                {/* Certification City */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        City / Municipality

                                    </label>

                                    <input
                                        value={
                                            certificationCity
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCertificationCity(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                            uppercase
                                        "
                                    />

                                </div>

                                {/* Certification Province */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Province

                                    </label>

                                    <input
                                        value={
                                            certificationProvince
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCertificationProvince(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                            uppercase
                                        "
                                    />

                                </div>

                                {/* Certification Date */}

                                <div>

                                    <label
                                        className="
                                            mb-1
                                            block
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >

                                        Certification Date

                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            certificationDate
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCertificationDate(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            px-3
                                            py-2.5
                                        "
                                    />

                                </div>

                            </div>

                        </section>

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

                    {/* CLOSE */}

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

                    {/* TOTAL + PROCESS */}

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
                                : "Process AF58"}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}