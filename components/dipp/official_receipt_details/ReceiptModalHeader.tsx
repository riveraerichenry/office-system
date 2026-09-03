"use client";

import {
    X,
    Printer,
} from "lucide-react";


type Props = {

    loading: boolean;

    disabled: boolean;

    onPrint: () => void;

    onClose: () => void;

};


export default function ReceiptModalHeader({

    loading,

    disabled,

    onPrint,

    onClose,

}: Props) {

    return (

        <div
            className="
                border-b
                border-slate-200
                bg-slate-900
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-6
                    py-4
                "
            >

                <div>

                    <h2
                        className="
                            text-lg
                            font-semibold
                            tracking-wide
                            text-white
                        "
                    >

                        Official Receipt Details

                    </h2>


                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-300
                        "
                    >

                        Complete Official Receipt
                        Transaction Information

                    </p>

                </div>


                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <button
                        type="button"
                        onClick={onPrint}
                        disabled={
                            loading ||
                            disabled
                        }
                        className="
                            inline-flex
                            items-center
                            rounded-md
                            bg-blue-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        <Printer
                            size={16}
                            className="mr-2"
                        />

                        Print

                    </button>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-md
                            p-2
                            text-slate-300
                            transition
                            hover:bg-slate-800
                            hover:text-white
                        "
                    >

                        <X
                            size={20}
                        />

                    </button>

                </div>

            </div>

        </div>

    );

}