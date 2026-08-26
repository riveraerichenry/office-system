"use client";


type Props = {

    transaction: any;

    af58: any;

};


export default function AF58PrintHeader({

    transaction,

    af58,

}: Props) {


    return (

        <div className="af58-print-header">


            {/* =====================================================
                PAYOR
            ===================================================== */}

            <div className="af58-header-payor">

                {
                    af58?.payor_name ??
                    transaction?.payor ??
                    ""
                }

            </div>


            {/* =====================================================
                MUNICIPALITY
            ===================================================== */}

            <div className="af58-header-municipality">

                {
                    af58?.city_municipality ??
                    ""
                }

            </div>


            {/* =====================================================
                PROVINCE
            ===================================================== */}

            <div className="af58-header-province">

                {
                    af58?.province ??
                    ""
                }

            </div>


        </div>

    );

}