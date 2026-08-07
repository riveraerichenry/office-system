"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import ActiveBookletTable from "@/components/dipp/ActiveBookletTable";
import FiscalYearSummary from "@/components/dipp/FiscalYearSummary";
import DailyCollections from "@/components/dipp/DailyCollection";
import DIPPSystemOptions from "@/components/dipp/DIPPSystemOptions";
import OfficialReceiptDetailsModal from "@/components/dipp/OfficialReceiptModal";
import AF56ReceiptModal from "@/components/dipp/AF56ReceiptModal";
import GenerateRCDModal from "@/components/dipp/systemoptionmodal/GenerateRCDModal";

import CTCReceiptModal from "@/components/dipp/ctc/CTCReceiptModal";



import GeneralReceiptModal from "@/components/dipp/GeneralReceiptModal";
import MonthlyTransactionsModal from "@/components/dipp/MonthlyTransactionModal";
// import AF56ReceiptModal from "@/components/dipp/AF56ReceiptModal";

export default function DIPPPage() {

    /*
    |--------------------------------------------------------------------------
    | Active Booklets
    |--------------------------------------------------------------------------
    */

    const [systemOpen, setSystemOpen] = useState(false);

    const [booklets, setBooklets] =
        useState<any[]>([]);

    const [selected, setSelected] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [openGenerateRCDModal, setOpenGenerateRCDModal] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Receipt Modals
    |--------------------------------------------------------------------------
    */

    const [selectedBooklet, setSelectedBooklet] =
        useState<any>(null);

    const [openGeneralModal, setOpenGeneralModal] =
        useState(false);

    const [openAF56Modal, setOpenAF56Modal] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Monthly Transactions Modal
    |--------------------------------------------------------------------------
    */

    const [selectedMonth, setSelectedMonth] =
        useState(1);

    const [openMonthlyModal, setOpenMonthlyModal] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Fiscal Year Summary
    |--------------------------------------------------------------------------
    */

    const [summaryRows, setSummaryRows] =
        useState<any[]>([]);

    const [summaryForms, setSummaryForms] =
        useState<string[]>([]);

    const [summaryYears, setSummaryYears] =
        useState<number[]>([]);

    const [summaryLoading, setSummaryLoading] =
        useState(false);

    const [fiscalYear, setFiscalYear] =
        useState(new Date().getFullYear());

    /*
    |--------------------------------------------------------------------------
    | Daily Collections
    |--------------------------------------------------------------------------
    */

    const [dailyCollections, setDailyCollections] =
        useState<any[]>([]);

    const [dailyLoading, setDailyLoading] =
        useState(false);

    const [dailyPage, setDailyPage] =
        useState(1);

    const [dailyTotalPages, setDailyTotalPages] =
        useState(1);

    const [dailyTotalRecords, setDailyTotalRecords] =
        useState(0);

    const [dailyMonth, setDailyMonth] =
        useState(new Date().getMonth() + 1);

    const [dailyYear, setDailyYear] =
        useState(new Date().getFullYear());

    const [dailySearch, setDailySearch] =
        useState("");





    const [openCTCModal, setOpenCTCModal] =
        useState(false);




    const [receiptDetailsOpen, setReceiptDetailsOpen] =
        useState(false);

    const [receiptLoading, setReceiptLoading] =
        useState(false);

    const [receiptHeader, setReceiptHeader] =
        useState<any>(null);

    const [receiptItems, setReceiptItems] =
        useState<any[]>([]);
    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadBooklets();

    }, [search]);

    useEffect(() => {

        loadSummary();

    }, [fiscalYear]);

    useEffect(() => {

        loadDailyCollections();

    }, [

        dailyMonth,

        dailyYear,

        dailySearch,

        dailyPage,

    ]);




    async function loadTransactionDetails(

    id:string

){

    try{

        setReceiptLoading(true);

        const res =
            await axios.get(

                `/api/dipp/transactions/${id}`

            );

        setReceiptHeader(

            res.data.header

        );

        setReceiptItems(

            res.data.items

        );

        setReceiptDetailsOpen(true);

    }

    catch(err){

        console.error(err);

    }

    finally{

        setReceiptLoading(false);

    }

}

    /*
    |--------------------------------------------------------------------------
    | Load Active Booklets
    |--------------------------------------------------------------------------
    */


    async function loadBooklets() {

        try {

            setLoading(true);

            const res =
                await axios.get(

                    "/api/dipp/active-booklets",

                    {

                        params: {

                            search,

                        },

                    }

                );

            const rows =
                res.data.data ?? [];

            setBooklets(rows);

            if (rows.length === 0) {

                setSelected(null);

                return;

            }

            if (selected) {

                const updated =
                    rows.find(

                        (x: any) =>

                            x.booklet_registration_id ===
                            selected.booklet_registration_id

                    );

                if (updated) {

                    setSelected(updated);

                    return;

                }

            }

            setSelected(rows[0]);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Load Fiscal Summary
    |--------------------------------------------------------------------------
    */

    async function loadSummary() {

        try {

            setSummaryLoading(true);

            const res =
                await axios.get(

                    "/api/dipp/dashboard/summary",

                    {

                        params: {

                            fiscal_year:
                                fiscalYear,

                        },

                    }

                );

            setSummaryRows(
                res.data.rows ?? []
            );

            setSummaryForms(
                res.data.forms ?? []
            );

            setSummaryYears(
                res.data.years ?? []
            );

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setSummaryLoading(false);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Load Daily Collections
    |--------------------------------------------------------------------------
    */

    async function loadDailyCollections() {

        try {

            setDailyLoading(true);

            const res =
                await axios.get(

                    "/api/dipp/daily-collections",

                    {

                        params: {

                            month: dailyMonth,

                            year: dailyYear,

                            search: dailySearch,

                            page: dailyPage,

                            pageSize: 5,

                        },

                    }

                );

            setDailyCollections(
                res.data.rows ?? []
            );

            setDailyTotalPages(
                res.data.totalPages ?? 1
            );

            setDailyTotalRecords(
                res.data.totalRecords ?? 0
            );

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setDailyLoading(false);

        }

    }

        /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <>

            <div className="grid grid-cols-12 gap-6">

                {/* ==========================================================
                    Active Booklets
                ========================================================== */}

                <div className="col-span-2">

                    <ActiveBookletTable
                        data={booklets}
                        loading={loading}
                        selected={selected}
                        search={search}
                        onSearch={setSearch}
                        onRefresh={loadBooklets}
                        onSelect={(row) => {

                            /*
                            |--------------------------------------------------------------------------
                            | Select Booklet
                            |--------------------------------------------------------------------------
                            */

                            setSelected(row);
                            setSelectedBooklet(row);

                            /*
                            |--------------------------------------------------------------------------
                            | Open Appropriate Issuance Modal
                            |--------------------------------------------------------------------------
                            */

                            const formCode =
                                    row.form_code
                                        ?.trim()
                                        .toUpperCase();

                                switch (formCode) {

                                    case "AF56":

                                        setOpenAF56Modal(true);
                                        break;

                                    case "CTC-I":

                                    case "CTC-C":

                                        setOpenCTCModal(true);
                                        break;

                                    default:

                                        setOpenGeneralModal(true);
                                        break;

                                }

                        }}
                    />

                </div>

                {/* ==========================================================
                    Fiscal Year Summary
                ========================================================== */}

                <div className="col-span-6">

                    <FiscalYearSummary

                        forms={summaryForms}

                        rows={summaryRows}

                        years={summaryYears}

                        loading={summaryLoading}

                        fiscalYear={fiscalYear}

                        onFiscalYearChange={

                            setFiscalYear

                        }

                        onRefresh={

                            loadSummary

                        }

                        onMonthClick={(month) => {

                            setSelectedMonth(month);

                            setOpenMonthlyModal(true);

                        }}

                    />

                </div>

                {/* ==========================================================
                    Daily Collections
                ========================================================== */}

                <div className="col-span-4">

                    <DailyCollections

                        rows={dailyCollections}

                        loading={dailyLoading}

                        page={dailyPage}

                        totalPages={dailyTotalPages}

                        totalRecords={dailyTotalRecords}

                        onPageChange={setDailyPage}

                        onSelectTransaction={

                            loadTransactionDetails

                        }

                    />

                </div>

            </div>
                        {/* ==========================================================
                General Collection Receipt
            ========================================================== */}

            <GeneralReceiptModal

                open={openGeneralModal}

                booklet={selectedBooklet}

                onClose={() => {

                    setOpenGeneralModal(false);

                    setSelectedBooklet(null);

                }}

                onSuccess={async () => {

                    setOpenGeneralModal(false);

                    setSelectedBooklet(null);

                    /*
                    |--------------------------------------------------------------------------
                    | Refresh Dashboard
                    |--------------------------------------------------------------------------
                    */

                    await Promise.all([

                        loadBooklets(),

                        loadSummary(),

                        loadDailyCollections(),

                    ]);

                }}

            />

            <AF56ReceiptModal

                open={openAF56Modal}

                booklet={selectedBooklet}

                onClose={() => {

                    setOpenAF56Modal(false);

                    setSelectedBooklet(null);

                }}

                onSuccess={async () => {

                    setOpenAF56Modal(false);

                    setSelectedBooklet(null);

                    await Promise.all([

                        loadBooklets(),

                        loadSummary(),

                        loadDailyCollections(),

                    ]);

                }}

            />

            



            {/* ==========================================================
                Monthly Transactions
            ========================================================== */}

            <MonthlyTransactionsModal

                open={openMonthlyModal}

                month={selectedMonth}

                year={fiscalYear}

                onClose={() =>

                    setOpenMonthlyModal(false)

                }

                onSelectTransaction={

                    loadTransactionDetails

                }

            />

            <OfficialReceiptDetailsModal

                open={receiptDetailsOpen}

                loading={receiptLoading}

                header={receiptHeader}

                items={receiptItems}

                onClose={() => {

                    setReceiptDetailsOpen(false);

                    setReceiptHeader(null);

                    setReceiptItems([]);

                }}

            />

            <CTCReceiptModal

                open={openCTCModal}

                booklet={selectedBooklet}

                onClose={() => {

                    setOpenCTCModal(false);

                    setSelectedBooklet(null);

                }}

                onSuccess={async () => {

                    setOpenCTCModal(false);

                    setSelectedBooklet(null);

                    await Promise.all([

                        loadBooklets(),

                        loadSummary(),

                        loadDailyCollections(),

                    ]);

                }}

            />



       

            <DIPPSystemOptions
                open={systemOpen}
                setOpen={setSystemOpen}

                onSetupBooklet={() => {
                    console.log("Setup Booklet");
                }}

                onGenerateRCD={() => {
                    setOpenGenerateRCDModal(true);
                }}

                onMyReports={() => {
                    console.log("Reports");
                }}

                onDeposits={() => {
                    console.log("Deposits");
                }}

                onSkip={() => {
                    console.log("Skip");
                }}

                onExcl={() => {
                    console.log("EXCL");
                }}

                onRAAF={() => {
                    console.log("RAAF");
                }}
            />


            <GenerateRCDModal

                open={openGenerateRCDModal}

                onClose={() =>
                    setOpenGenerateRCDModal(false)
                }

            />




            {/* ==========================================================
                AF56 Receipt
            ========================================================== */}

            {/*
            <AF56ReceiptModal

                open={openAF56Modal}

                booklet={selectedBooklet}

                onClose={() => {

                    setOpenAF56Modal(false);

                    setSelectedBooklet(null);

                }}

                onSuccess={async () => {

                    setOpenAF56Modal(false);

                    setSelectedBooklet(null);

                    await Promise.all([

                        loadBooklets(),

                        loadSummary(),

                        loadDailyCollections(),

                    ]);

                }}

            />
            */}

        </>

    );

}