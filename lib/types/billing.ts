export type Billing = {
    id: string;
    billing_number: string;
    billing_date: string;

    owner_name: string;

    td_number: string;

    fullpin: string;

    classification_name: string | null;

    barangay_name: string | null;

    property_type: string | null;

    assessed_value: number | null;

    from_quarter: number;

    from_year: number;

    to_quarter: number;

    to_year: number;

    total_tax_due: number | null;

    total_basic: number | null;

    total_sef: number | null;

    total_penalty: number | null;

    total_discount: number | null;

    grand_total: number | null;

    status: string | null;

    remarks: string | null;

    created_by: string | null;

    created_at: string | null;

    updated_at: string | null;
};

export type BillingItem = {
    id: string;

    billing_id: string;

    td_number: string | null;

    coverage: string | null;

    start_quarter: number | null;

    start_year: number | null;

    end_quarter: number | null;

    end_year: number | null;

    assessed_value: number | null;

    tax_due: number | null;

    basic: number | null;

    sef: number | null;

    penalty_percent: number | null;

    penalty: number | null;

    discount_percent: number | null;

    discount: number | null;

    total: number | null;

    created_at: string | null;
};

export type BillingResponse = {
    billing: Billing;
    items: BillingItem[];
};