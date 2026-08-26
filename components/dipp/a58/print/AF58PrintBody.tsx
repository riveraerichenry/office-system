"use client";

type Props = {
    transaction: any;
    af58: any;
};


/* ================================================================
   HELPERS
================================================================ */

function formatDate(value: any) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-PH", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}


function formatAmount(value: any) {

    const amount = Number(value ?? 0);

    return amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}


/* ================================================================
   COMPONENT
================================================================ */

export default function AF58PrintBody({
    transaction,
    af58,
}: Props) {


    /*
    ================================================================
    DATABASE DATA
    ================================================================
    */

    const deceasedName =
        af58?.deceased_name ?? "";

    const nationality =
        af58?.nationality ?? "";

    const age =
        af58?.age ?? "";

    const sex =
        af58?.sex ?? "";

    const dateOfDeath =
        af58?.date_of_death ?? "";

    const causeOfDeath =
        af58?.cause_of_death ?? "";

    const cemeteryName =
        af58?.cemetery_name ?? "";


    /*
    ================================================================
    INFECTIOUS STATUS

    DIRECTLY FROM DATABASE:
    af58.infectious_status
    ================================================================
    */

    const infectiousStatus =
        af58?.infectious_status ?? "";


    /*
    ================================================================
    EMBALMED STATUS

    DIRECTLY FROM DATABASE:
    af58.embalmed_status
    ================================================================
    */

    const embalmedStatus =
        af58?.embalmed_status ?? "";


    /*
    ================================================================
    DISPOSITION

    DIRECTLY FROM DATABASE:
    af58.disposition_of_remains
    ================================================================
    */

    const disposition =
        af58?.disposition_of_remains ?? "";


    /*
    ================================================================
    FEE

    DIRECTLY FROM DATABASE:
    af58.fee_amount
    ================================================================
    */

    const fee =
        af58?.fee_amount ??
        0;


    /*
    ================================================================
    POSITIONING

    CHANGE THESE VALUES TO CALIBRATE THE RECEIPT
    ================================================================
    */

    const positions = {

        deceased: {
            left: "66px",
            top: "455px",
        },

        nationality: {
            left: "96px",
            top: "470px",
        },

        age: {
            left: "86px",
            top: "485px",
        },

        sex: {
            left: "240px",
            top: "485px",
        },

        dateDeath: {
            left: "126px",
            top: "510px",
        },

        cause: {
            left: "126px",
            top: "525px",
        },

        cemetery: {
            left: "156px",
            top: "545px",
        },

        infectious: {
            left: "180px",
            top: "580px",
        },


        embalmed: {
            left: "210px",
            top: "595px",
        },


        disposition: {
            left: "180px",
            top: "610px",
        },

        fee: {
            left: "280px",
            top: "700px",
        },

    };


    return (

        <div
            className="af58-print-body"
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "8.5in",
                height: "11in",
                margin: 0,
                padding: 0,
            }}
        >


            {/* =====================================================
                DECEASED NAME
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.deceased.left,

                    top:
                        positions.deceased.top,

                    width: "340px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    overflow: "hidden",

                    color: "#000",
                }}
            >
                {deceasedName}
            </span>


            {/* =====================================================
                NATIONALITY
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.nationality.left,

                    top:
                        positions.nationality.top,

                    width: "120px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    overflow: "hidden",

                    color: "#000",
                }}
            >
                {nationality}
            </span>


            {/* =====================================================
                AGE
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.age.left,

                    top:
                        positions.age.top,

                    width: "40px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    color: "#000",
                }}
            >
                {age}
            </span>


            {/* =====================================================
                SEX
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.sex.left,

                    top:
                        positions.sex.top,

                    width: "100px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    color: "#000",
                }}
            >
                {sex}
            </span>


            {/* =====================================================
                DATE OF DEATH
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.dateDeath.left,

                    top:
                        positions.dateDeath.top,

                    width: "150px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    color: "#000",
                }}
            >
                {formatDate(dateOfDeath)}
            </span>


            {/* =====================================================
                CAUSE OF DEATH
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.cause.left,

                    top:
                        positions.cause.top,

                    width: "340px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    overflow: "hidden",

                    color: "#000",
                }}
            >
                {causeOfDeath}
            </span>


            {/* =====================================================
                NAME OF CEMETERY
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.cemetery.left,

                    top:
                        positions.cemetery.top,

                    width: "340px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    overflow: "hidden",

                    color: "#000",
                }}
            >
                {cemeteryName}
            </span>


            {/* =====================================================
                INFECTIOUS STATUS

                DATABASE:
                infectious_status
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.infectious.left,

                    top:
                        positions.infectious.top,

                    width: "130px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    color: "#000",
                }}
            >
                {infectiousStatus}
            </span>


            {/* =====================================================
                NON-INFECTIOUS

                We display the actual database value only.
                If the database says INFECTIOUS, this remains blank.
            ===================================================== */}

           

            {/* =====================================================
                EMBALMED STATUS

                DATABASE:
                embalmed_status
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.embalmed.left,

                    top:
                        positions.embalmed.top,

                    width: "130px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",

                    color: "#000",
                }}
            >
                {embalmedStatus}
            </span>


            {/* =====================================================
                NOT EMBALMED

                The actual database value is displayed.
            ===================================================== */}

           

            {/* =====================================================
                DISPOSITION OF REMAINS
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        positions.disposition.left,

                    top:
                        positions.disposition.top,

                    width: "180px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "normal",

                    color: "#000",
                }}
            >
                {disposition}
            </span>


            {/* =====================================================
                FEE
            ===================================================== */}

           

        </div>

    );

}