"use client";

import AF53CertificateSection from "./AF53CertificateSection";
import AF53OwnerSection from "./AF53OwnerSection";
import AF53CattleSection from "./AF53CattleSection";

export type AF53BodyProps = {

    /* ================================================================
       FORM IDENTIFICATION
    ================================================================ */

    formNumber: string;
    series: string;


    /* ================================================================
       CERTIFICATE
    ================================================================ */

    province: string;
    municipality: string;
    issueDate: string;


    /* ================================================================
       OWNER
    ================================================================ */

    ownerName: string;
    ownerMunicipality: string;
    ownerProvince: string;


    /* ================================================================
       ANIMAL
    ================================================================ */

    animalType: string;
    description: string;
    sex: string;
    years: string;


    /* ================================================================
       BRANDS
    ================================================================ */

    brandMunicipality: string;
    brandOwner: string;


    /* ================================================================
       PAYMENT
    ================================================================ */

    paymentMode: string;


    /* ================================================================
       SAVING
    ================================================================ */

    saving: boolean;


    /* ================================================================
       FORM HANDLERS
    ================================================================ */

    onFormNumberChange: (
        value: string
    ) => void;

    onSeriesChange: (
        value: string
    ) => void;


    /* ================================================================
       CERTIFICATE HANDLERS
    ================================================================ */

    onProvinceChange: (
        value: string
    ) => void;

    onMunicipalityChange: (
        value: string
    ) => void;

    onIssueDateChange: (
        value: string
    ) => void;


    /* ================================================================
       OWNER HANDLERS
    ================================================================ */

    onOwnerNameChange: (
        value: string
    ) => void;

    onOwnerMunicipalityChange: (
        value: string
    ) => void;

    onOwnerProvinceChange: (
        value: string
    ) => void;


    /* ================================================================
       ANIMAL HANDLERS
    ================================================================ */

    onAnimalTypeChange: (
        value: string
    ) => void;

    onSexChange: (
        value: string
    ) => void;

    onDescriptionChange: (
        value: string
    ) => void;

    onYearsChange: (
        value: string
    ) => void;


    /* ================================================================
       BRAND HANDLERS
    ================================================================ */

    onBrandMunicipalityChange: (
        value: string
    ) => void;

    onBrandOwnerChange: (
        value: string
    ) => void;


    /* ================================================================
       PAYMENT HANDLER
    ================================================================ */

    onPaymentModeChange: (
        value: string
    ) => void;
};


export default function AF53Body({

    /* ================================================================
       FORM
    ================================================================ */

    formNumber,
    series,


    /* ================================================================
       CERTIFICATE
    ================================================================ */

    province,
    municipality,
    issueDate,


    /* ================================================================
       OWNER
    ================================================================ */

    ownerName,
    ownerMunicipality,
    ownerProvince,


    /* ================================================================
       ANIMAL
    ================================================================ */

    animalType,
    description,
    sex,
    years,


    /* ================================================================
       BRANDS
    ================================================================ */

    brandMunicipality,
    brandOwner,


    /* ================================================================
       PAYMENT
    ================================================================ */

    paymentMode,


    /* ================================================================
       SAVING
    ================================================================ */

    saving,


    /* ================================================================
       FORM HANDLERS
    ================================================================ */

    onFormNumberChange,
    onSeriesChange,


    /* ================================================================
       CERTIFICATE HANDLERS
    ================================================================ */

    onProvinceChange,
    onMunicipalityChange,
    onIssueDateChange,


    /* ================================================================
       OWNER HANDLERS
    ================================================================ */

    onOwnerNameChange,
    onOwnerMunicipalityChange,
    onOwnerProvinceChange,


    /* ================================================================
       ANIMAL HANDLERS
    ================================================================ */

    onAnimalTypeChange,
    onSexChange,
    onDescriptionChange,
    onYearsChange,


    /* ================================================================
       BRAND HANDLERS
    ================================================================ */

    onBrandMunicipalityChange,
    onBrandOwnerChange,


    /* ================================================================
       PAYMENT HANDLER
    ================================================================ */

    onPaymentModeChange,

}: AF53BodyProps) {

    return (
        <main
            className="
                flex-1
                overflow-y-auto
                bg-slate-100
                p-5
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    max-w-6xl
                    space-y-5
                "
            >

                {/* ====================================================
                    CERTIFICATE INFORMATION
                ==================================================== */}

                <AF53CertificateSection
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

                    saving={
                        saving
                    }

                    onFormNumberChange={
                        onFormNumberChange
                    }

                    onSeriesChange={
                        onSeriesChange
                    }

                    onProvinceChange={
                        onProvinceChange
                    }

                    onMunicipalityChange={
                        onMunicipalityChange
                    }

                    onIssueDateChange={
                        onIssueDateChange
                    }
                />


                {/* ====================================================
                    REGISTERED OWNER
                ==================================================== */}

                <AF53OwnerSection

                    ownerName={
                        ownerName
                    }

                    ownerMunicipality={
                        ownerMunicipality
                    }

                    ownerProvince={
                        ownerProvince
                    }

                    sex={
                        sex
                    }

                    paymentMode={
                        paymentMode
                    }

                    saving={
                        saving
                    }

                    onOwnerNameChange={
                        onOwnerNameChange
                    }

                    onOwnerMunicipalityChange={
                        onOwnerMunicipalityChange
                    }

                    onOwnerProvinceChange={
                        onOwnerProvinceChange
                    }

                    onSexChange={
                        onSexChange
                    }

                    onPaymentModeChange={
                        onPaymentModeChange
                    }

                />


                {/* ====================================================
                    ANIMAL DESCRIPTION
                ==================================================== */}

                <AF53CattleSection

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

                    saving={
                        saving
                    }

                    onAnimalTypeChange={
                        onAnimalTypeChange
                    }

                    onDescriptionChange={
                        onDescriptionChange
                    }

                    onSexChange={
                        onSexChange
                    }

                    onYearsChange={
                        onYearsChange
                    }

                    onBrandMunicipalityChange={
                        onBrandMunicipalityChange
                    }

                    onBrandOwnerChange={
                        onBrandOwnerChange
                    }

                />

            </div>

        </main>
    );
}