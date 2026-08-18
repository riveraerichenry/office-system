export type RCD = {
    id: string;

    report_no: string;

    report_date: string;

    fund_source_id: string;

    date_from: string;

    date_to: string;

    total_collections:
        | number
        | string;

    total_remittances:
        | number
        | string;

    total_deposits:
        | number
        | string;

    balance:
        | number
        | string;

    status: string;
};


/*
=========================================================
RCD ITEM
=========================================================
*/

export type RCDItem = {
    id: string;

    rcd_transaction_id?:
        | string
        | null;

    dipp_transaction_id: string;

    or_number: string;

    receipt_date: string;

    collector_id?:
        | string
        | null;

    payor: string;

    payment_mode: string;

    amount:
        | number
        | string;

    form_code?:
        | string
        | null;

    form_name?:
        | string
        | null;

    booklet_registration_id?:
        | string
        | null;

    booklet_beginning_or?:
        | string
        | number
        | null;

    booklet_ending_or?:
        | string
        | number
        | null;

    booklet_current_or?:
        | string
        | number
        | null;
};


/*
=========================================================
FUND SOURCE
=========================================================
*/

export type RCDFundSource = {
    id: string;

    fund_code?:
        | string
        | null;

    fund_name?:
        | string
        | null;

    acronym?:
        | string
        | null;
};


/*
=========================================================
USER
=========================================================
*/

export type RCDUser = {
    id: string;

    username?:
        | string
        | null;

    full_name?:
        | string
        | null;
};


/*
=========================================================
RCD FORM ROW
=========================================================
*/

export type RCDFormRow = {

    /*
     * Accountable Form
     */
    formCode: string;


    /*
     * CURRENT RCD ISSUED ORs
     *
     * Example:
     *
     * 103 - 120
     */
    from: string;

    to: string;


    /*
     * CURRENT RCD ISSUED QTY
     */
    quantity: number;


    /*
     * CURRENT FORM TOTAL
     */
    amount: number;


    /*
     * BEGINNING BALANCE
     *
     * FIRST OR IN CURRENT RCD
     * TO BOOKLET ENDING OR
     *
     * Example:
     *
     * 103 - 150
     */
    beginningFrom?:
        | string
        | null;

    beginningTo?:
        | string
        | null;


    /*
     * ENDING BALANCE
     *
     * LAST ISSUED OR + 1
     * TO BOOKLET ENDING OR
     *
     * Example:
     *
     * 121 - 150
     */
    endingFrom?:
        | string
        | null;

    endingTo?:
        | string
        | null;

};