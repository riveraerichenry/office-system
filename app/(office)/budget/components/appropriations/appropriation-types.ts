export type OfficeOption = { id: string; office_code: string; office_name: string };
export type SubOfficeOption = { id: string; office_id: string; sub_office_code: string | null; sub_office_name: string };
export type CategoryOption = { id: string; category_code: string; category_name: string };

export type AccountOption = {
  account_id: string;
  account_code: string;
  account_name: string;
  category_id: string;
  category_code: string;
  category_name: string;
};

export type FundSource = {
  id: string;
  fund_code: string;
  fund_name: string;
  acronym: string | null;
};

export type Appropriation = {
  id: string;
  fiscal_year: number;
  appropriation_type: "annual" | "supplemental";
  ordinance_no: string | null;
  ordinance_date: string | null;
  fund_source_id: string;
  fund_code: string;
  fund_name: string;
  acronym: string | null;
  office_id: string | null;
  office_code: string | null;
  office_name: string | null;
  sub_office_id: string | null;
  sub_office_code: string | null;
  sub_office_name: string | null;
  category_id: string | null;
  category_code: string | null;
  category_name: string | null;
  account_id: string;
  account_code: string;
  account_name: string;
  appropriated_amount: string | number;
  adjustment_in: string | number;
  adjustment_out: string | number;
  realignment_in: string | number;
  realignment_out: string | number;
  adjusted_amount: string | number;
  remarks: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type AppropriationFormData = {
  fiscal_year: number;
  appropriation_type: "annual" | "supplemental";
  ordinance_no: string;
  ordinance_date: string;
  fund_source_id: string;
  office_id: string;
  sub_office_id: string;
  category_id: string;
  account_id: string;
  appropriated_amount: string;
  remarks: string;
};

export type AdjustmentFormData = {
  appropriation_id: string;
  adjustment_type: "increase" | "decrease";
  reference_no: string;
  reference_date: string;
  amount: string;
  justification: string;
};

export type RealignmentFormData = {
  realignment_no: string;
  fiscal_year: number;
  fund_source_id: string;
  authority_reference: string;
  authority_date: string;
  justification: string;
  source_appropriation_id: string;
  destination_appropriation_id: string;
  amount: string;
  remarks: string;
};
