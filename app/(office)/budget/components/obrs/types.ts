
export type OfficeOption = {
  id: string;
  office_code?: string | null;
  office_name: string;
  is_active?: boolean;
};

export type SubOfficeOption = {
  id: string;
  office_id: string;
  sub_office_code?: string | null;
  sub_office_name: string;
  is_active?: boolean;
};

export type CategoryOption = {
  id: string;
  category_code: string;
  category_name: string;
  is_active?: boolean;
};

export type AccountOption = {
  id: string;
  category_id: string;
  account_code: string;
  account_name: string;
  is_active?: boolean;
};

export type PurchaseRequestOption = {
  id: string;
  pr_number: string;
  pr_date: string;
  purpose: string | null;
  total_amount: number | string;
  allocated_amount?: number | string;
  remaining_amount?: number | string;
  office_id?: string | null;
  office_name?: string | null;
};

export type OBRPurchaseRequest = {
  id: string;
  pr_number: string;
  pr_date: string;
  purpose: string | null;
  amount: number | string;
};

export type OBRRecord = {
  id: string;
  obr_number: string;
  obr_date: string;
  payee: string;
  particulars: string;
  office_id: string;
  sub_office_id: string | null;
  category_id: string;
  account_id: string;
  remarks: string | null;

  office_name: string | null;
  sub_office_name: string | null;

  category_code: string | null;
  category_name: string | null;

  account_code: string | null;
  account_name: string | null;

  pr_count: number | string;
  total_allocation: number | string;

  purchase_requests: OBRPurchaseRequest[];

  created_at: string;
};

export type OBRFormValues = {
  obr_number: string;
  obr_date: string;
  payee: string;
  particulars: string;
  office_id: string;
  sub_office_id: string;
  category_id: string;
  account_id: string;
  remarks: string;
};

export type TemporaryPR = {
  purchase_request_id: string;
  pr_number: string;
  pr_date: string;
  purpose: string;
  total_amount: number;
  allocated_amount: number;
  remaining_amount: number;
  office_name: string;
  amount: number;
};
