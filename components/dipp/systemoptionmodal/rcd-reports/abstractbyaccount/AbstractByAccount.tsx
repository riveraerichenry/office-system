"use client";

import {
    RCDReportItem,
} from "../MyRCDReportsModal";


type Props = {

    rcd: RCDReportItem;

};


export default function AbstractByAccount({
    rcd,
}: Props) {

    return (

        <div className="
            mx-auto
            min-h-[11in]
            w-full
            max-w-[8.5in]
            bg-white
            p-8
            shadow-lg
        ">

            <div className="
                text-center
            ">

                <div className="text-xs">
                    Republic of the Philippines
                </div>

                <div className="
                    mt-1
                    text-base
                    font-bold
                ">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="
                    text-xs
                    font-semibold
                ">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>

                <div className="
                    mt-6
                    text-lg
                    font-bold
                ">
                    ABSTRACT BY ACCOUNT
                </div>

            </div>


            <div className="
                mt-8
                border
                border-gray-300
                p-4
            ">

                <div className="
                    text-xs
                    text-gray-500
                ">
                    RCD Report No.
                </div>

                <div className="
                    mt-1
                    text-sm
                    font-bold
                ">
                    {rcd.report_no}
                </div>

            </div>


            <div className="
                mt-8
                flex
                min-h-[500px]
                items-center
                justify-center
                border
                border-dashed
                border-gray-300
            ">

                <span className="
                    text-sm
                    text-gray-400
                ">
                    Abstract by Account content
                    will be connected here.
                </span>

            </div>

        </div>

    );

}