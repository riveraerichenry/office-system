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
import PayorSection from "../a58/PayorSection";

type Props = {
    open: boolean;

    booklet: any;

    onClose: () => void;

    onSuccess: () => void;
};

export default function AF54ReceiptModal({

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
    | Basic Information
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | First Contracting Party
    |--------------------------------------------------------------------------
    */

    const [
        firstPartyName,
        setFirstPartyName,
    ] = useState("");

    const [
        firstPartyAgeYears,
        setFirstPartyAgeYears,
    ] = useState("");

    const [
        firstPartyAgeMonths,
        setFirstPartyAgeMonths,
    ] = useState("");

    const [
        firstPartyResidence,
        setFirstPartyResidence,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Second Contracting Party
    |--------------------------------------------------------------------------
    */

    const [
        secondPartyName,
        setSecondPartyName,
    ] = useState("");

    const [
        secondPartyAgeYears,
        setSecondPartyAgeYears,
    ] = useState("");

    const [
        secondPartyAgeMonths,
        setSecondPartyAgeMonths,
    ] = useState("");

    const [
        secondPartyResidence,
        setSecondPartyResidence,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Register / Registrar
    |--------------------------------------------------------------------------
    */

    const [
        registerNo,
        setRegisterNo,
    ] = useState("");

    const [
        localCivilRegistrar,
        setLocalCivilRegistrar,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!open) {
            return;
        }

        setSaving(false);

        const today =
            new Date()
                .toISOString()
                .substring(
                    0,
                    10
                );

        setReceiptDate(
            today
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

        setFirstPartyName("");

        setFirstPartyAgeYears("");

        setFirstPartyAgeMonths("");

        setFirstPartyResidence("");

        setSecondPartyName("");

        setSecondPartyAgeYears("");

        setSecondPartyAgeMonths("");

        setSecondPartyResidence("");

        setRegisterNo("");

        setLocalCivilRegistrar("");

    }, [open]);

    /*
    |--------------------------------------------------------------------------
    | EXPIRATION
    |--------------------------------------------------------------------------
    */

    const expirationDate = (() => {

        if (!receiptDate) {
            return "";
        }

        const date =
            new Date(
                `${receiptDate}T00:00:00`
            );

        date.setDate(
            date.getDate() +
            120
        );

        return date
            .toISOString()
            .substring(
                0,
                10
            );

    })();

    /*
    |--------------------------------------------------------------------------
    | DATE FORMAT
    |--------------------------------------------------------------------------
    */

    function formatDate(
        value: string
    ) {

        if (!value) {
            return "-";
        }

        return new Date(
            `${value}T00:00:00`
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
        );

    }

    /*
    |--------------------------------------------------------------------------
    | PROCESS AF54
    |--------------------------------------------------------------------------
    */

    async function processAF54() {

        if (!booklet) {

            await Swal.fire({
                icon: "warning",
                title:
                    "No Booklet Selected",
                text:
                    "Please select an active AF54 booklet.",
            });

            return;

        }

        /*
        |--------------------------------------------------------------------------
        | PAYOR
        |--------------------------------------------------------------------------
        */

        if (
            !payor.trim()
        ) {

            await Swal.fire({
                icon: "warning",
                title:
                    "Required Field",
                text:
                    "Please enter the payor name.",
            });

            return;

        }

        /*
        |--------------------------------------------------------------------------
        | FIRST PARTY
        |--------------------------------------------------------------------------
        */

        if (
            !firstPartyName.trim()
        ) {

            await Swal.fire({
                icon: "warning",
                title:
                    "Required Field",
                text:
                    "Please enter the first contracting party.",
            });

            return;

        }

        /*
        |--------------------------------------------------------------------------
        | SECOND PARTY
        |--------------------------------------------------------------------------
        */

        if (
            !secondPartyName.trim()
        ) {

            await Swal.fire({
                icon: "warning",
                title:
                    "Required Field",
                text:
                    "Please enter the second contracting party.",
            });

            return;

        }

        try {

            setSaving(true);

            const response =
                await axios.post(
                    "/api/dipp/af54-transactions",
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

                        af54: {

                            city_municipality:
                                cityMunicipality.trim() ||
                                null,

                            province:
                                province.trim() ||
                                null,

                            first_party_name:
                                firstPartyName.trim(),

                            first_party_age_years:
                                firstPartyAgeYears.trim() ||
                                null,

                            first_party_age_months:
                                firstPartyAgeMonths.trim() ||
                                null,

                            first_party_residence:
                                firstPartyResidence.trim() ||
                                null,

                            second_party_name:
                                secondPartyName.trim(),

                            second_party_age_years:
                                secondPartyAgeYears.trim() ||
                                null,

                            second_party_age_months:
                                secondPartyAgeMonths.trim() ||
                                null,

                            second_party_residence:
                                secondPartyResidence.trim() ||
                                null,

                            register_no:
                                registerNo.trim() ||
                                null,

                            local_civil_registrar:
                                localCivilRegistrar.trim() ||
                                null,

                        },

                    }
                );

            await Swal.fire({

                icon:
                    "success",

                title:
                    "AF54 Successfully Issued",

                html:
                    `
                    <div style="text-align:center">

                        <div>
                            O.R. No.
                        </div>

                        <strong style="font-size:24px">
                            ${response.data.or_number}
                        </strong>

                        <div style="margin-top:12px">
                            Marriage License Fee:
                            ₱${Number(
                                response.data.license_fee
                            ).toFixed(2)}
                        </div>

                        <div style="margin-top:6px">
                            Expires:
                            ${formatDate(
                                response.data.expiration_date
                            )}
                        </div>

                    </div>
                    `,

                confirmButtonText:
                    "OK",

            });

            await onSuccess();

            onClose();

        } catch (
            error: any
        ) {

            console.error(
                "AF54 ERROR:",
                error
            );

            await Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Process AF54",

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

    /*
    |--------------------------------------------------------------------------
    | DON'T RENDER
    |--------------------------------------------------------------------------
    */

    if (
        !open ||
        !booklet
    ) {

        return null;

    }

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

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
                            PAYOR
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
                            CERTIFICATE INFORMATION
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

                                    Marriage License Information

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

                                                {formatDate(
                                                    receiptDate
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

                                {/* City / Municipality */}

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

                            </div>

                        </section>

                        {/* ==================================================
                            FIRST PARTY
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

                                    First Contracting Party

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

                                        Full Name

                                    </label>

                                    <input
                                        value={
                                            firstPartyName
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setFirstPartyName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="
                                            Enter first contracting party...
                                        "
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

                                {/* Age Years */}

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

                                        Age - Years

                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            firstPartyAgeYears
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setFirstPartyAgeYears(
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

                                {/* Age Months */}

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

                                        Age - Months

                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        max="11"
                                        value={
                                            firstPartyAgeMonths
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setFirstPartyAgeMonths(
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

                                {/* Residence */}

                                <div
                                    className="
                                        col-span-4
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

                                        Residence

                                    </label>

                                    <input
                                        value={
                                            firstPartyResidence
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setFirstPartyResidence(
                                                e.target.value
                                            )
                                        }
                                        placeholder="
                                            Enter residence...
                                        "
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
                            SECOND PARTY
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

                                    Second Contracting Party

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

                                        Full Name

                                    </label>

                                    <input
                                        value={
                                            secondPartyName
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSecondPartyName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="
                                            Enter second contracting party...
                                        "
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

                                {/* Age Years */}

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

                                        Age - Years

                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            secondPartyAgeYears
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSecondPartyAgeYears(
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

                                {/* Age Months */}

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

                                        Age - Months

                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        max="11"
                                        value={
                                            secondPartyAgeMonths
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSecondPartyAgeMonths(
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

                                {/* Residence */}

                                <div
                                    className="
                                        col-span-4
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

                                        Residence

                                    </label>

                                    <input
                                        value={
                                            secondPartyResidence
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSecondPartyResidence(
                                                e.target.value
                                            )
                                        }
                                        placeholder="
                                            Enter residence...
                                        "
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
                            LICENSE DETAILS
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

                                    Marriage License Details

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

                                        License Fee

                                    </label>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-slate-100
                                            px-3
                                            py-2.5
                                        "
                                    >

                                        <span
                                            className="
                                                text-slate-500
                                            "
                                        >

                                            ₱

                                        </span>

                                        <span
                                            className="
                                                ml-1
                                                font-bold
                                                text-slate-800
                                            "
                                        >

                                            2.00

                                        </span>

                                    </div>

                                </div>

                                {/* Expiration */}

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

                                        Expiration Date

                                    </label>

                                    <div
                                        className="
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-slate-100
                                            px-3
                                            py-2.5
                                            font-semibold
                                            text-slate-700
                                        "
                                    >

                                        {formatDate(
                                            expirationDate
                                        )}

                                    </div>

                                </div>

                                {/* Register No. */}

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

                                        Register No.

                                    </label>

                                    <input
                                        value={
                                            registerNo
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setRegisterNo(
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

                                {/* Registrar */}

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

                                        Local Civil Registrar

                                    </label>

                                    <input
                                        value={
                                            localCivilRegistrar
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setLocalCivilRegistrar(
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

                                ₱2.00

                            </p>

                        </div>

                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={
                                processAF54
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

                            {
                                saving
                                    ? "Processing..."
                                    : "Process AF54"
                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}