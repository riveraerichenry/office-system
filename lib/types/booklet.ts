export type AssignedBooklet = {
    lor_item_id: string;
    booklet_id: string;

    form_code: string;
    form_name: string;

    control_no: string;
    series: string;

    beginning_or: number;
    current_or: number;
    ending_or: number;

    remaining: number;

    fund_name: string | null;
};