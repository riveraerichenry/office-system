"use client";

import "./af58-print.css";

import AF58PrintHeader
    from "./AF58PrintHeader";

import AF58PrintBody
    from "./AF58PrintBody";

import AF58PrintFooter
    from "./AF58PrintFooter";


type Props = {
    transaction: any;
    af58: any;
};


export default function AF58Print({
    transaction,
    af58,
}: Props) {

    return (

        <div className="af58-print">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <AF58PrintHeader
                transaction={transaction}
                af58={af58}
            />


            {/* =====================================================
                BODY
            ===================================================== */}

            <AF58PrintBody
                transaction={transaction}
                af58={af58}
            />


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <AF58PrintFooter
                transaction={transaction}
                af58={af58}
            />

        </div>

    );

}