export type PaymentType =
    | "CASH"
    | "CHECK"
    | "BOTH";


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

    fund_code?:
        | string
        | null;

    fund_name?:
        | string
        | null;

    acronym?:
        | string
        | null;


    /*
    =====================================================
    RCD REMITTANCE
    =====================================================
    */

    has_remittance?:
        | boolean;

    remittance?:
        | RCDRemittance
        | null;

};


export type FundSource = {

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


export type Denominations =
    Record<number, number>;


export type RCDRemittance = {

    id: string;

    report_no: string;

    rcd_id: string;

    payment_type:
        | PaymentType;

    cash_amount:
        | number
        | string;

    check_amount:
        | number
        | string;

    total_amount:
        | number
        | string;

    denomination_total:
        | number
        | string;

    denominations:
        | Denominations
        | null;

    remitted_by?:
        | string
        | null;

    remitted_by_name?:
        | string
        | null;

    created_at?:
        | string
        | null;

    report_date?:
        | string
        | null;

};