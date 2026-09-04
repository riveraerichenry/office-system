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
        return "";
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


function formatAmount(
    value: any
) {

    const amount =
        Number(value ?? 0);

    return amount.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}


export default function AF58PrintFooter({
    transaction,
    af58,
}: Props) {


    const amount =
        Number(
            af58?.fee_amount ??
            0
        );


    const cityMunicipality =
        af58?.city_municipality ??
        "";


    const province =
        af58?.province ??
        "";


    const receiptDate =
        transaction?.receipt_date ??
        transaction?.created_at ??
        af58?.certification_date ??
        new Date();


    const loggedUser =
        transaction?.encoded_by ??
        transaction?.collector ??
        "";


    const year =
        new Date(
            receiptDate
        ).getFullYear();


    const displayYear =
        String(year);


    return (
        <div
            className="af58-print-footer"
            style={{

                /*
                 * =====================================================
                 * FOOTER POSITION CALIBRATION
                 * =====================================================
                 *
                 * Change ONLY these values when calibrating
                 * the physical AF58 receipt.
                 */


                /* =====================================================
                   AMOUNT
                ===================================================== */

                "--af58-amount-x": "36px",
                "--af58-amount-y": "623px",


                /* =====================================================
                   CITY / MUNICIPALITY
                ===================================================== */

                "--af58-city-x": "36px",
                "--af58-city-y": "655px",


                /* =====================================================
                   PROVINCE
                ===================================================== */

                "--af58-province-x": "230px",
                "--af58-province-y": "655px",


                /* =====================================================
                   DATE
                ===================================================== */

                "--af58-date-x": "230px",
                "--af58-date-y": "625px",


                /* =====================================================
                   YEAR
                ===================================================== */

                "--af58-year-x": "260px",
                "--af58-year-y": "678px",


                /* =====================================================
                   LOGGED USER
                ===================================================== */

                "--af58-user-x": "200px",
                "--af58-user-y": "770px",

            } as React.CSSProperties}
        >


            {/* =====================================================
                AMOUNT
            ===================================================== */}

            <div
                className="af58-footer-amount"
            >
                ₱ {formatAmount(amount)}
            </div>


            {/* =====================================================
                CITY
            ===================================================== */}

            <div
                className="af58-footer-city"
            >
                {cityMunicipality}
            </div>


            {/* =====================================================
                PROVINCE
            ===================================================== */}

            <div
                className="af58-footer-province"
            >
                {province}
            </div>


            {/* =====================================================
                DATE
            ===================================================== */}

            <div
                className="af58-footer-date"
            >
                {formatDate(receiptDate)}
            </div>


            {/* =====================================================
                YEAR
            ===================================================== */}

            <div
                className="af58-footer-year"
            >
                {displayYear}
            </div>


            {/* =====================================================
                LOGGED USER
            ===================================================== */}

            <div
                className="af58-footer-user"
            >
                {loggedUser}
            </div>


            <style jsx>{`

                .af58-footer-amount,
                .af58-footer-city,
                .af58-footer-province,
                .af58-footer-date,
                .af58-footer-year,
                .af58-footer-user {

                    position: absolute;

                    color: #000;

                }


                /* =====================================================
                   AMOUNT
                ===================================================== */

                .af58-footer-amount {

                    left: var(
                        --af58-amount-x
                    );

                    top: var(
                        --af58-amount-y
                    );

                    width: 340px;

                    font-size: 12px;

                    font-weight: 700;

                    white-space: nowrap;

                }


                /* =====================================================
                   CITY
                ===================================================== */

                .af58-footer-city {

                    left: var(
                        --af58-city-x
                    );

                    top: var(
                        --af58-city-y
                    );

                    width: 160px;

                    font-size: 12px;

                    font-weight: 600;

                    text-transform: uppercase;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   PROVINCE
                ===================================================== */

                .af58-footer-province {

                    left: var(
                        --af58-province-x
                    );

                    top: var(
                        --af58-province-y
                    );

                    width: 160px;

                    font-size: 12px;

                    font-weight: 600;

                    text-transform: uppercase;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   DATE
                ===================================================== */

                .af58-footer-date {

                    left: var(
                        --af58-date-x
                    );

                    top: var(
                        --af58-date-y
                    );

                    width: 150px;

                    font-size: 12px;

                    font-weight: 600;

                    white-space: nowrap;

                }


                /* =====================================================
                   YEAR
                ===================================================== */

                .af58-footer-year {

                    left: var(
                        --af58-year-x
                    );

                    top: var(
                        --af58-year-y
                    );

                    width: 80px;

                    font-size: 12px;

                    font-weight: 600;

                    white-space: nowrap;

                }


                /* =====================================================
                   LOGGED USER
                ===================================================== */

                .af58-footer-user {

                    left: var(
                        --af58-user-x
                    );

                    top: var(
                        --af58-user-y
                    );

                    width: 180px;

                    font-size: 12px;

                    font-weight: 700;

                    text-transform: uppercase;

                    white-space: nowrap;

                    overflow: hidden;

                }

            `}</style>

        </div>
    );
}