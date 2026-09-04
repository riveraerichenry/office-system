"use client";

type Props = {
    transaction: any;
    af58: any;
};

export default function AF58PrintHeader({
    transaction,
    af58,
}: Props) {

    const payor =
        af58?.payor_name ??
        transaction?.payor ??
        "";

    const municipality =
        af58?.city_municipality ??
        "";

    const province =
        af58?.province ??
        "";

    return (
        <div
            className="af58-print-header"
            style={{

                /*
                 * =====================================================
                 * HEADER POSITION CALIBRATION
                 * =====================================================
                 *
                 * Change ONLY these values when calibrating
                 * the physical AF58 receipt.
                 */


                /* =====================================================
                   PAYOR
                ===================================================== */

                "--af58-payor-x": "66px",
                "--af58-payor-y": "255px",


                /* =====================================================
                   MUNICIPALITY
                ===================================================== */

                "--af58-municipality-x": "90px",
                "--af58-municipality-y": "295px",


                /* =====================================================
                   PROVINCE
                ===================================================== */

                "--af58-province-x": "90px",
                "--af58-province-y": "320px",

            } as React.CSSProperties}
        >


            {/* =====================================================
                PAYOR
            ===================================================== */}

            <div
                className="af58-header-payor"
            >
                {payor}
            </div>


            {/* =====================================================
                MUNICIPALITY
            ===================================================== */}

            <div
                className="af58-header-municipality"
            >
                {municipality}
            </div>


            {/* =====================================================
                PROVINCE
            ===================================================== */}

            <div
                className="af58-header-province"
            >
                {province}
            </div>


            <style jsx>{`

                /* =====================================================
                   PAYOR
                ===================================================== */

                .af58-header-payor {

                    position: absolute;

                    top: var(
                        --af58-payor-y
                    );

                    left: var(
                        --af58-payor-x
                    );

                    width: 340px;

                    font-size: 12px;

                    font-weight: 700;

                    text-transform: uppercase;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   MUNICIPALITY
                ===================================================== */

                .af58-header-municipality {

                    position: absolute;

                    top: var(
                        --af58-municipality-y
                    );

                    left: var(
                        --af58-municipality-x
                    );

                    width: 340px;

                    font-size: 12px;

                    font-weight: 700;

                    text-transform: uppercase;

                    white-space: nowrap;

                    overflow: hidden;

                }


                /* =====================================================
                   PROVINCE
                ===================================================== */

                .af58-header-province {

                    position: absolute;

                    top: var(
                        --af58-province-y
                    );

                    left: var(
                        --af58-province-x
                    );

                    width: 340px;

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