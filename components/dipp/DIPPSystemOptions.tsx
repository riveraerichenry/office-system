"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    FileBarChart2,
    FolderOpen,
    Landmark,
    ClipboardList,
    FileSpreadsheet,
    Receipt,
    ChevronRight,
    Send,
} from "lucide-react";

import MyRCDReportsModal from "./systemoptionmodal/rcd-reports/MyRCDReportsModal";

type Props = {

    open: boolean;

    setOpen: (v: boolean) => void;


    onSetupBooklet: () => void;

    onGenerateRCD: () => void;

    onMyReports: () => void;

    onDeposits: () => void;

    onRemittance: () => void;

    onSkip: () => void;

    onExcl: () => void;

    onRAAF: () => void;

};


export default function DIPPSystemOptions({

    open,

    setOpen,

    onSetupBooklet,

    onGenerateRCD,

    onMyReports,

    onDeposits,

    onRemittance,

    onSkip,

    onExcl,

    onRAAF,

}: Props) {


    /*
    =========================================================
    SYSTEM OPTIONS PANEL
    =========================================================
    */

    const panelRef =
        useRef<HTMLDivElement>(null);


    /*
    =========================================================
    MY RCD REPORTS MODAL
    =========================================================
    */

    const [
        myRCDReportsOpen,
        setMyRCDReportsOpen,
    ] = useState(false);


    /*
    =========================================================
    CLICK OUTSIDE
    =========================================================
    */

    useEffect(() => {

        function handleClickOutside(
            event: MouseEvent
        ) {

            if (

                open &&

                panelRef.current &&

                !panelRef.current.contains(
                    event.target as Node
                )

            ) {

                setOpen(false);

            }

        }


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, [
        open,
        setOpen,
    ]);


    /*
    =========================================================
    ACTIVE ITEM
    =========================================================
    */

    const Item = ({

        icon,

        title,

        onClick,

    }: {

        icon: React.ReactNode;

        title: string;

        onClick: () => void;

    }) => (

        <button

            type="button"

            onClick={() => {

                onClick();

                setOpen(false);

            }}

            className="
                w-full
                flex
                items-center
                justify-between
                px-4
                py-3
                border-b
                border-gray-200
                hover:bg-blue-50
                transition
            "

        >

            <div
                className="
                    flex
                    items-center
                    gap-3
                "
            >

                {icon}


                <span
                    className="
                        font-medium
                        text-gray-700
                    "
                >

                    {title}

                </span>

            </div>


            <ChevronRight
                size={18}
                className="
                    text-gray-400
                "
            />

        </button>

    );


    /*
    =========================================================
    INACTIVE ITEM
    =========================================================
    */

    const InactiveItem = ({

        icon,

        title,

    }: {

        icon: React.ReactNode;

        title: string;

    }) => (

        <button

            type="button"

            disabled

            className="
                w-full
                flex
                items-center
                justify-between
                px-4
                py-3
                border-b
                border-gray-200
                bg-gray-50
                cursor-not-allowed
                opacity-50
            "

        >

            <div
                className="
                    flex
                    items-center
                    gap-3
                "
            >

                {icon}


                <span
                    className="
                        font-medium
                        text-gray-500
                    "
                >

                    {title}

                </span>

            </div>


            <span
                className="
                    text-xs
                    font-semibold
                    text-gray-400
                "
            >

                Inactive

            </span>

        </button>

    );


    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (

        <>

            <div

                ref={panelRef}

                className="
                    fixed
                    right-0
                    top-1/2
                    -translate-y-1/2
                    flex
                    items-center
                    z-50
                "

            >


                {/* =================================================
                    PANEL
                ================================================= */}

                <div

                    className={`
                        bg-white
                        rounded-l-xl
                        shadow-2xl
                        overflow-hidden
                        border
                        border-gray-200
                        transition-all
                        duration-300
                        ease-in-out

                        ${
                            open

                                ? "w-80 opacity-100"

                                : "w-0 opacity-0"
                        }
                    `}

                >


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div
                        className="
                            bg-blue-900
                            text-white
                            px-5
                            py-4
                            font-bold
                            text-lg
                        "
                    >

                        System Options

                    </div>


                    {/* =================================================
                        GENERATE RCD
                    ================================================= */}

                    <Item

                        icon={
                            <FileBarChart2
                                size={18}
                            />
                        }

                        title="
                            Generate RCD Report
                        "

                        onClick={
                            onGenerateRCD
                        }

                    />


                    {/* =================================================
                        MY RCD REMITTANCE
                    ================================================= */}

                    <Item

                        icon={
                            <Send
                                size={18}
                            />
                        }

                        title="
                            My RCD Remittance
                        "

                        onClick={
                            onRemittance
                        }

                    />


                    {/* =================================================
                        MY RCD DEPOSITS
                    ================================================= */}

                    <InactiveItem

                        icon={
                            <Landmark
                                size={18}
                            />
                        }

                        title="
                            My RCD Deposits
                        "

                    />


                    {/* =================================================
                        MY SKIP REQUESTS
                    ================================================= */}

                    <InactiveItem

                        icon={
                            <ClipboardList
                                size={18}
                            />
                        }

                        title="
                            My SKIP Requests
                        "

                    />


                    {/* =================================================
                        MY EXCL TRANSACTIONS
                    ================================================= */}

                    <InactiveItem

                        icon={
                            <FileSpreadsheet
                                size={18}
                            />
                        }

                        title="
                            My EXCL Transactions
                        "

                    />


                    {/* =================================================
                        MY RAAF REPORTS
                    ================================================= */}

                    <InactiveItem

                        icon={
                            <Receipt
                                size={18}
                            />
                        }

                        title="
                            My RAAF Reports
                        "

                    />


                    {/* =================================================
                        MY RCD REPORTS
                    ================================================= */}

                    <Item

                        icon={
                            <FolderOpen
                                size={18}
                            />
                        }

                        title="
                            My RCD Reports
                        "

                        onClick={() => {

                            /*
                            -----------------------------------------
                            Keep the existing callback.
                            -----------------------------------------
                            */

                            onMyReports();


                            /*
                            -----------------------------------------
                            Open the new modal.
                            -----------------------------------------
                            */

                            setMyRCDReportsOpen(
                                true
                            );

                        }}

                    />

                </div>


                {/* =================================================
                    TAB
                ================================================= */}

                <button

                    type="button"

                    onClick={() =>
                        setOpen(!open)
                    }

                    className="
                        h-40
                        w-11
                        bg-yellow-500
                        hover:bg-yellow-600
                        text-white
                        font-bold
                        shadow-xl
                        rounded-l-lg
                        flex
                        items-center
                        justify-center
                        transition
                    "

                    style={{

                        writingMode:
                            "vertical-rl",

                        transform:
                            "rotate(180deg)",

                    }}

                >

                    {

                        open

                            ? "Close"

                            : "System Options"

                    }

                </button>


            </div>


            {/* =====================================================
                MY RCD REPORTS MODAL
            ===================================================== */}

            <MyRCDReportsModal

                open={
                    myRCDReportsOpen
                }

                onClose={() =>
                    setMyRCDReportsOpen(
                        false
                    )
                }

            />

        </>

    );

}