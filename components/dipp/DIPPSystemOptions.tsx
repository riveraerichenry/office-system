"use client";

import {
    useEffect,
    useRef,
} from "react";

import {
    FileBarChart2,
    FolderOpen,
    Landmark,
    ClipboardList,
    FileSpreadsheet,
    Receipt,
    ChevronRight,
} from "lucide-react";


type Props = {
    open: boolean;
    setOpen: (v: boolean) => void;

    onSetupBooklet: () => void;
    onGenerateRCD: () => void;
    onMyReports: () => void;
    onDeposits: () => void;
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
    onSkip,
    onExcl,
    onRAAF,

}: Props) {


    const panelRef =
        useRef<HTMLDivElement>(null);



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


    },[
        open,
        setOpen
    ]);



    const Item = ({
        icon,
        title,
        onClick,

    }: any) => (

        <button

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

            <div className="flex items-center gap-3">

                {icon}


                <span className="
                    font-medium
                    text-gray-700
                ">
                    {title}
                </span>


            </div>


            <ChevronRight
                size={18}
                className="text-gray-400"
            />


        </button>

    );



    return (

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


            {/* PANEL */}

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



                <Item

                    icon={
                        <FileBarChart2 size={18}/>
                    }

                    title="Generate RCD Report"

                    onClick={
                        onGenerateRCD
                    }

                />



                <Item

                    icon={
                        <FolderOpen size={18}/>
                    }

                    title="My RCD Reports"

                    onClick={
                        onMyReports
                    }

                />



                <Item

                    icon={
                        <Landmark size={18}/>
                    }

                    title="My RCD Deposits"

                    onClick={
                        onDeposits
                    }

                />



                <Item

                    icon={
                        <ClipboardList size={18}/>
                    }

                    title="My SKIP Requests"

                    onClick={
                        onSkip
                    }

                />



                <Item

                    icon={
                        <FileSpreadsheet size={18}/>
                    }

                    title="My EXCL Transactions"

                    onClick={
                        onExcl
                    }

                />



                <Item

                    icon={
                        <Receipt size={18}/>
                    }

                    title="My RAAF Reports"

                    onClick={
                        onRAAF
                    }

                />


            </div>




            {/* TAB */}

            <button

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
                    writingMode:"vertical-rl",
                    transform:"rotate(180deg)",
                }}

            >

                {
                    open
                    ? "Close"
                    : "System Options"
                }


            </button>


        </div>

    );

}