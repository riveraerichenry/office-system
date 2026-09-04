"use client";

type Props = {
    transaction: any;
    af58: any;
};


/* ================================================================
   HELPERS
================================================================ */

function formatDate(
    value: any
) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        }
    );
}


export default function AF58PrintBody({
    transaction,
    af58,
}: Props) {


    /* =============================================================
       DATABASE DATA
    ============================================================= */

    const deceasedName =
        af58?.deceased_name ??
        "";

    const nationality =
        af58?.nationality ??
        "";

    const age =
        af58?.age ??
        "";

    const sex =
        af58?.sex ??
        "";

    const dateOfDeath =
        af58?.date_of_death ??
        "";

    const causeOfDeath =
        af58?.cause_of_death ??
        "";

    const cemeteryName =
        af58?.cemetery_name ??
        "";

    const infectiousStatus =
        af58?.infectious_status ??
        "";

    const embalmedStatus =
        af58?.embalmed_status ??
        "";

    const disposition =
        af58?.disposition_of_remains ??
        "";


    return (
        <div
            className="af58-print-body"
            style={{

                /*
                 * =====================================================
                 * BODY POSITION CALIBRATION
                 * =====================================================
                 *
                 * Change ONLY these values when calibrating
                 * the physical AF58 receipt.
                 */


                /* =====================================================
                   DECEASED NAME
                ===================================================== */

                "--af58-deceased-x": "140px",
                "--af58-deceased-y": "400px",


                /* =====================================================
                   NATIONALITY
                ===================================================== */

                "--af58-nationality-x": "145px",
                "--af58-nationality-y": "415px",


                /* =====================================================
                   AGE
                ===================================================== */

                "--af58-age-x": "110px",
                "--af58-age-y": "432px",


                /* =====================================================
                   SEX
                ===================================================== */

                "--af58-sex-x": "280px",
                "--af58-sex-y": "432px",


                /* =====================================================
                   DATE OF DEATH
                ===================================================== */

                "--af58-date-death-x": "180px",
                "--af58-date-death-y": "449px",


                /* =====================================================
                   CAUSE OF DEATH
                ===================================================== */

                "--af58-cause-x": "200px",
                "--af58-cause-y": "468px",


                /* =====================================================
                   CEMETERY
                ===================================================== */

                "--af58-cemetery-x": "210px",
                "--af58-cemetery-y": "485px",


                /* =====================================================
                   INFECTIOUS STATUS
                ===================================================== */

                "--af58-infectious-x": "230px",
                "--af58-infectious-y": "519px",


                /* =====================================================
                   EMBALMED STATUS
                ===================================================== */

                "--af58-embalmed-x": "270px",
                "--af58-embalmed-y": "536px",


                /* =====================================================
                   DISPOSITION
                ===================================================== */

                "--af58-disposition-x": "250px",
                "--af58-disposition-y": "553px",

            } as React.CSSProperties}
        >


            {/* =====================================================
                DECEASED NAME
            ===================================================== */}

            <div
                className="af58-body-deceased"
            >
                {deceasedName}
            </div>


            {/* =====================================================
                NATIONALITY
            ===================================================== */}

            <div
                className="af58-body-nationality"
            >
                {nationality}
            </div>


            {/* =====================================================
                AGE
            ===================================================== */}

            <div
                className="af58-body-age"
            >
                {age}
            </div>


            {/* =====================================================
                SEX
            ===================================================== */}

            <div
                className="af58-body-sex"
            >
                {sex}
            </div>


            {/* =====================================================
                DATE OF DEATH
            ===================================================== */}

            <div
                className="af58-body-date-death"
            >
                {formatDate(dateOfDeath)}
            </div>


            {/* =====================================================
                CAUSE OF DEATH
            ===================================================== */}

            <div
                className="af58-body-cause"
            >
                {causeOfDeath}
            </div>


            {/* =====================================================
                CEMETERY
            ===================================================== */}

            <div
                className="af58-body-cemetery"
            >
                {cemeteryName}
            </div>


            {/* =====================================================
                INFECTIOUS STATUS
            ===================================================== */}

            <div
                className="af58-body-infectious"
            >
                {infectiousStatus}
            </div>


            {/* =====================================================
                EMBALMED STATUS
            ===================================================== */}

            <div
                className="af58-body-embalmed"
            >
                {embalmedStatus}
            </div>


            {/* =====================================================
                DISPOSITION
            ===================================================== */}

            <div
                className="af58-body-disposition"
            >
                {disposition}
            </div>


            <style jsx>{`

                .af58-body-deceased,
                .af58-body-nationality,
                .af58-body-age,
                .af58-body-sex,
                .af58-body-date-death,
                .af58-body-cause,
                .af58-body-cemetery,
                .af58-body-infectious,
                .af58-body-embalmed,
                .af58-body-disposition {

                    position: absolute;

                    font-size: 12px;

                    font-weight: 600;

                    color: #000;

                }


                /* =====================================================
                   DECEASED NAME
                ===================================================== */

                .af58-body-deceased {

                    left: var(
                        --af58-deceased-x
                    );

                    top: var(
                        --af58-deceased-y
                    );

                    width: 340px;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   NATIONALITY
                ===================================================== */

                .af58-body-nationality {

                    left: var(
                        --af58-nationality-x
                    );

                    top: var(
                        --af58-nationality-y
                    );

                    width: 120px;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   AGE
                ===================================================== */

                .af58-body-age {

                    left: var(
                        --af58-age-x
                    );

                    top: var(
                        --af58-age-y
                    );

                    width: 40px;

                    white-space: nowrap;

                }


                /* =====================================================
                   SEX
                ===================================================== */

                .af58-body-sex {

                    left: var(
                        --af58-sex-x
                    );

                    top: var(
                        --af58-sex-y
                    );

                    width: 100px;

                    white-space: nowrap;

                }


                /* =====================================================
                   DATE OF DEATH
                ===================================================== */

                .af58-body-date-death {

                    left: var(
                        --af58-date-death-x
                    );

                    top: var(
                        --af58-date-death-y
                    );

                    width: 150px;

                    white-space: nowrap;

                }


                /* =====================================================
                   CAUSE OF DEATH
                ===================================================== */

                .af58-body-cause {

                    left: var(
                        --af58-cause-x
                    );

                    top: var(
                        --af58-cause-y
                    );

                    width: 340px;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   CEMETERY
                ===================================================== */

                .af58-body-cemetery {

                    left: var(
                        --af58-cemetery-x
                    );

                    top: var(
                        --af58-cemetery-y
                    );

                    width: 340px;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   INFECTIOUS STATUS
                ===================================================== */

                .af58-body-infectious {

                    left: var(
                        --af58-infectious-x
                    );

                    top: var(
                        --af58-infectious-y
                    );

                    width: 130px;

                    white-space: nowrap;

                }


                /* =====================================================
                   EMBALMED STATUS
                ===================================================== */

                .af58-body-embalmed {

                    left: var(
                        --af58-embalmed-x
                    );

                    top: var(
                        --af58-embalmed-y
                    );

                    width: 130px;

                    white-space: nowrap;

                }


                /* =====================================================
                   DISPOSITION
                ===================================================== */

                .af58-body-disposition {

                    left: var(
                        --af58-disposition-x
                    );

                    top: var(
                        --af58-disposition-y
                    );

                    width: 180px;

                    white-space: normal;

                }

            `}</style>

        </div>
    );
}