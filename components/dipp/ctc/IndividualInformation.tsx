"use client";

import {
    useEffect,
    useState,
} from "react";

import axios from "axios";
import Select from "react-select";


type Props = {
    name: string;
    address: string;
    tin: string;
    crNumber: string;
    citizenship: string;
    sex: string;
    height: string;
    weight: string;
    placeOfBirth: string;
    birthDate: string;
    civilStatus: string;
    occupation: string;
    saving: boolean;

    onNameChange: (
        value: string
    ) => void;

    onAddressChange: (
        value: string
    ) => void;

    onTinChange: (
        value: string
    ) => void;

    onCRNumberChange: (
        value: string
    ) => void;

    onCitizenshipChange: (
        value: string
    ) => void;

    onSexChange: (
        value: string
    ) => void;

    onHeightChange: (
        value: string
    ) => void;

    onWeightChange: (
        value: string
    ) => void;

    onPlaceOfBirthChange: (
        value: string
    ) => void;

    onBirthDateChange: (
        value: string
    ) => void;

    onCivilStatusChange: (
        value: string
    ) => void;

    onOccupationChange: (
        value: string
    ) => void;
};


type BarangayOption = {
    value: string;
    label: string;
};


export default function IndividualInformation({

    name,
    address,
    tin,
    crNumber,
    citizenship,
    sex,
    height,
    weight,
    placeOfBirth,
    birthDate,
    civilStatus,
    occupation,
    saving,

    onNameChange,
    onAddressChange,
    onTinChange,
    onCRNumberChange,
    onCitizenshipChange,
    onSexChange,
    onHeightChange,
    onWeightChange,
    onPlaceOfBirthChange,
    onBirthDateChange,
    onCivilStatusChange,
    onOccupationChange,

}: Props) {


    /* =====================================================
       BARANGAY OPTIONS
    ===================================================== */

    const [
        barangayOptions,
        setBarangayOptions,
    ] = useState<
        BarangayOption[]
    >([]);


    const [
        loadingBarangays,
        setLoadingBarangays,
    ] = useState(
        false
    );


    /* =====================================================
       LOAD BARANGAYS
    ===================================================== */

    useEffect(() => {

        let mounted =
            true;


        async function loadBarangays() {

            try {

                setLoadingBarangays(
                    true
                );


                const response =
                    await axios.get(
                        "/api/barangays"
                    );


                /*
                 * Supports API responses such as:
                 *
                 * {
                 *     success: true,
                 *     data: [...]
                 * }
                 *
                 * or directly:
                 *
                 * [...]
                 */

                const data =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : (
                            response.data?.data ??
                            response.data?.barangays ??
                            []
                        );


                if (
                    !mounted
                ) {

                    return;

                }


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    const options =
                        data
                            .filter(
                                (
                                    barangay: any
                                ) =>
                                    barangay
                                        ?.barangay_name
                            )
                            .map(
                                (
                                    barangay: any
                                ) => ({

                                    value:
                                        barangay
                                            .barangay_name,

                                    label:
                                        barangay
                                            .barangay_name,

                                })
                            );


                    setBarangayOptions(
                        options
                    );

                } else {

                    setBarangayOptions(
                        []
                    );

                }

            } catch (
                error
            ) {

                console.error(
                    "Failed to load barangays:",
                    error
                );


                if (
                    mounted
                ) {

                    setBarangayOptions(
                        []
                    );

                }

            } finally {

                if (
                    mounted
                ) {

                    setLoadingBarangays(
                        false
                    );

                }

            }

        }


        loadBarangays();


        return () => {

            mounted =
                false;

        };

    }, []);


    /* =====================================================
       COMMON INPUT STYLE
    ===================================================== */

    const inputClass =
        `
        w-full
        rounded-lg
        border
        border-slate-300
        bg-white
        px-3
        py-2.5
        text-sm
        text-slate-800
        outline-none
        transition
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-100
        disabled:cursor-not-allowed
        disabled:bg-slate-100
        disabled:text-slate-500
        `;


    const labelClass =
        `
        mb-1.5
        block
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-600
        `;


    return (

        <section
            className="
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-sm
            "
        >


            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    border-b
                    border-slate-200
                    bg-slate-50
                    px-5
                    py-4
                "
            >

                <div
                    className="
                        text-sm
                        font-bold
                        text-slate-800
                    "
                >

                    Individual Information

                </div>


                <div
                    className="
                        mt-0.5
                        text-xs
                        text-slate-500
                    "
                >

                    Enter the taxpayer's personal information.

                </div>

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    p-5
                    md:grid-cols-2
                "
            >


                {/* =============================================
                    FULL NAME
                ============================================= */}

                <div
                    className="
                        md:col-span-2
                    "
                >

                    <label
                        className={
                            labelClass
                        }
                    >

                        Full Name

                    </label>


                    <input
                        type="text"

                        value={
                            name
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onNameChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            Enter full name
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    BARANGAY
                    SAME SEARCHABLE DROPDOWN AS ACCOUNT
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Barangay

                    </label>


                    <Select<BarangayOption>

                        options={
                            barangayOptions
                        }


                        isSearchable


                        isClearable


                        menuPortalTarget={
                            typeof window !==
                            "undefined"

                                ? document.body

                                : undefined
                        }


                       menuPosition="fixed"
menuPlacement="auto"


                        styles={{

                            menuPortal: (
                                base
                            ) => ({

                                ...base,

                                zIndex:
                                    99999,

                            }),

                            control: (
                                base,
                                state
                            ) => ({

                                ...base,

                                minHeight:
                                    "42px",

                                borderRadius:
                                    "0.5rem",

                                borderColor:

                                    state.isFocused

                                        ? "#3b82f6"

                                        : "#cbd5e1",

                                boxShadow:

                                    state.isFocused

                                        ? "0 0 0 2px rgb(219 234 254)"

                                        : "none",

                                "&:hover": {

                                    borderColor:

                                        state.isFocused

                                            ? "#3b82f6"

                                            : "#94a3b8",

                                },

                            }),

                        }}


                        value={

                            barangayOptions.find(

                                (
                                    barangay
                                ) =>

                                    barangay.value ===
                                    address

                            ) ?? null

                        }


                        onChange={(
                            selected
                        ) =>

                            onAddressChange(

                                selected?.value ??
                                ""

                            )

                        }


                        isDisabled={

                            saving ||

                            loadingBarangays

                        }


                        placeholder={

                            loadingBarangays

                                ? "Loading..."

                                : "Search barangay..."

                        }

                    />

                </div>


                {/* =============================================
                    TIN
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        TIN

                    </label>


                    <input
                        type="text"

                        value={
                            tin
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onTinChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            Enter TIN
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    CTC / CR NUMBER
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        CTC / CR Number

                    </label>


                    <input
                        type="text"

                        value={
                            crNumber
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onCRNumberChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            Enter CTC / CR number
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    CITIZENSHIP
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Citizenship

                    </label>


                    <input
                        type="text"

                        value={
                            citizenship
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onCitizenshipChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            Enter citizenship
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    SEX
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
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
                            event
                        ) =>

                            onSexChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        className={
                            inputClass
                        }
                    >

                        <option
                            value=""
                        >

                            Select sex

                        </option>


                        <option
                            value="MALE"
                        >

                            Male

                        </option>


                        <option
                            value="FEMALE"
                        >

                            Female

                        </option>

                    </select>

                </div>


                {/* =============================================
                    HEIGHT
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Height

                    </label>


                    <input
                        type="text"

                        value={
                            height
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onHeightChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            e.g. 170 cm
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    WEIGHT
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Weight

                    </label>


                    <input
                        type="text"

                        value={
                            weight
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onWeightChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            e.g. 70 kg
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    PLACE OF BIRTH
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Place of Birth

                    </label>


                    <input
                        type="text"

                        value={
                            placeOfBirth
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onPlaceOfBirthChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            Enter place of birth
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    BIRTH DATE
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Birth Date

                    </label>


                    <input
                        type="date"

                        value={
                            birthDate
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onBirthDateChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        className={
                            inputClass
                        }
                    />

                </div>


                {/* =============================================
                    CIVIL STATUS
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Civil Status

                    </label>


                    <select

                        value={
                            civilStatus
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onCivilStatusChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        className={
                            inputClass
                        }
                    >

                        <option
                            value=""
                        >

                            Select civil status

                        </option>


                        <option
                            value="SINGLE"
                        >

                            Single

                        </option>


                        <option
                            value="MARRIED"
                        >

                            Married

                        </option>


                        <option
                            value="WIDOWED"
                        >

                            Widowed

                        </option>


                        <option
                            value="SEPARATED"
                        >

                            Separated

                        </option>


                        <option
                            value="DIVORCED"
                        >

                            Divorced

                        </option>

                    </select>

                </div>


                {/* =============================================
                    OCCUPATION
                ============================================= */}

                <div>

                    <label
                        className={
                            labelClass
                        }
                    >

                        Occupation

                    </label>


                    <input
                        type="text"

                        value={
                            occupation
                        }

                        disabled={
                            saving
                        }

                        onChange={(
                            event
                        ) =>

                            onOccupationChange(
                                event
                                    .target
                                    .value
                            )

                        }

                        placeholder="
                            Enter occupation
                        "

                        className={
                            inputClass
                        }
                    />

                </div>


            </div>

        </section>

    );

}