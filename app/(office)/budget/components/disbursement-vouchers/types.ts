// ============================================================
// OBR TYPES
// ============================================================

export type NewOBRData = {
  obr_number: string;
  obr_date: string;
  payee: string;
  particulars: string;

  office_id: string;
  sub_office_id: string | null;
  category_id: string;
  account_id: string;

  obligation_amount: number;
  remarks: string;

  office_name?: string;
  sub_office_name?: string | null;
  category_name?: string;
  category_code?: string;
  account_name?: string;
  account_code?: string;

  [key: string]: unknown;
};

export type OBRRecord = {
  id: string;
  obr_number: string;

  obr_date?: string | null;
  payee?: string | null;
  particulars?: string | null;

  office_id?: string | null;
  sub_office_id?: string | null;
  category_id?: string | null;
  account_id?: string | null;

  office_name?: string | null;
  sub_office_name?: string | null;
  category_code?: string | null;
  category_name?: string | null;
  account_code?: string | null;
  account_name?: string | null;

  obligation_amount?: number | string | null;
  total_allocation?: number | string | null;
  total_amount?: number | string | null;
  available_amount?: number | string | null;
  status?: string | null;

  new_obr?: NewOBRData;
  [key: string]: unknown;
};

// ============================================================
// DV ITEM TYPES
// ============================================================

export type DVItem = {
  id: string;
  obr_id: string;
  obr_no: string;
  payee: string;

  office_name: string;
  sub_office_name: string;
  category_code: string;
  category_name: string;
  account_code: string;
  account_name: string;
  particulars: string;
  obligation_amount: number;
  total_debit: string;
  new_obr?: NewOBRData;
};

export type DVItemPayload = {
  obr_id: string;
  obr_no: string;
  account_code: string;
  particulars: string;
  total_debit: number;
  new_obr?: NewOBRData;
};

// ============================================================
// DV DEDUCTION TYPES
// ============================================================

export type DVDeductionType =
  | "CWT"
  | "WITHHOLDING_VAT"
  | "LIQUIDATED_DAMAGES"
  | "RETENTION"
  | "OTHER";

// Retained for compatibility with existing code
export type DVDeductionMode = "COMPUTED" | "MANUAL";

// Retained for compatibility with existing code
export type DVDeductionComputationMethod =
  | "PERCENTAGE"
  | "FIXED"
  | "MANUAL";

// Retained for compatibility with existing code
export type DVDeductionComputation = {
  id: string;
  dv_item_id: string | null;
  computation_method: DVDeductionComputationMethod;
  basis_amount: number | null;
  rate: number | null;
  computed_amount: number;
  remarks?: string;
};

// Simplified deduction record
export type DVDeduction = {
  id: string;

  deduction_name: string;
  deduction_type: DVDeductionComputationMethod;

  basis_amount: number;
  rate: number;
  deduction_amount: number;

  remarks?: string;
};

// Simplified deduction payload
export type DVDeductionPayload = {
  deduction_name: string;
  deduction_type: DVDeductionComputationMethod;

  basis_amount: number;
  rate: number;
  deduction_amount: number;

  remarks?: string;
};

// ============================================================
// DV FORM TYPES
// ============================================================

export type DVFormData = {
  dv_no: string;
  dv_date: string;
  payee: string;
  payor: string;
  particulars: string;
  items: DVItemPayload[];
  grand_total: number;
  deductions: DVDeductionPayload[];
  total_deductions: number;
  net_amount_due: number;
};

// ============================================================
// DV RECORD TYPES
// ============================================================

export type DVRecord = {
  id: string | number;
  dv_no: string;
  dv_date?: string | Date | null;
  payee: string;
  payor?: string | null;
  grand_total: number | string;
  status?: string | null;

  [key: string]: unknown;
};