export type ReleaseType = "regular" | "special";

export type AppropriationOption = {
  id: string;
  fiscal_year: number;

  fund_source_id: string;
  fund_code: string;
  fund_name: string;

  account_id: string;
  account_code: string;
  account_name: string;

  category_id: string;
  category_name: string;

  office_id: string;
  office_name: string;

  sub_office_id: string | null;
  sub_office_name: string | null;

  appropriated_amount: number;
  previous_allotment: number;
  current_allotment: number;
  special_release: number;
  total_release: number;
  remaining_appropriation: number;
};

export type Allotment = {
  id: string;
  allotment_no: string;
  allotment_date: string;
  fiscal_year: number;
  quarter: number;
  release_type: ReleaseType;
  status: "draft" | "posted" | "cancelled";

  item_id: string;
  appropriation_id: string;
  amount: number;

  account_code: string;
  account_name: string;
  fund_code: string;
  fund_name: string;
  office_name: string;
};