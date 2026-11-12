export type PurchaseRequestStatus =
  | "draft"
  | "submitted"
  | "for_review"
  | "approved"
  | "rejected"
  | "cancelled"
  | "partially_converted_to_obr"
  | "converted_to_obr"
  | string;

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

export type ExpenseAccountCategoryOption = {
  id: string;
  office_id?: string | null;
  sub_office_id?: string | null;
  category_code: string;
  category_name: string;
  description?: string | null;
  is_active: boolean;
};

export type ExpenseAccountOption = {
  id: string;
  category_id: string;
  account_code: string;
  account_name: string;
  description?: string | null;
  is_active: boolean;
  category_code?: string | null;
  category_name?: string | null;
};

export type PurchaseRequestItem = {
  id?: string;
  purchase_request_id?: string;
  unit: string;
  quantity: number;
  item_description: string;
  specifications?: string | null;
  estimated_unit_cost: number;
  total_cost?: number;
};

export type PurchaseRequestOBR = {
  id?: string;
  purchase_request_id?: string;
  obr_number: string;
  obr_date: string;
  payee: string;
  office_id?: string;
  sub_office_id?: string | null;
  category_id?: string;
  account_id?: string;
  particulars: string;
  amount: number;
  remarks?: string | null;
};

export type PurchaseRequest = {
  id: string;
  pr_number: string;
  pr_date: string;
  rp_number?: string | null;
  office_id?: string;
  sub_office_id?: string | null;
  office_name: string;
  sub_office_name?: string | null;
  category_id?: string;
  category_code?: string | null;
  category_name?: string | null;
  account_id?: string;
  account_code?: string | null;
  account_name?: string | null;
  purpose?: string | null;
  remarks?: string | null;
  item_count: number;
  obr_count?: number;
  total_amount: number;
  status: PurchaseRequestStatus;
  items?: PurchaseRequestItem[];
  obrs?: PurchaseRequestOBR[];
  created_at?: string;
  updated_at?: string;
};

export type PurchaseRequestItemFormData = {
  unit: string;
  quantity: number;
  item_description: string;
  specifications: string;
  estimated_unit_cost: number;
  total_cost: number;
};

export type PurchaseRequestOBRFormData = {
  obr_number: string;
  obr_date: string;
  payee: string;
  office_id: string;
  sub_office_id: string | null;
  category_id: string;
  account_id: string;
  particulars: string;
  amount: number;
  remarks: string;
};

export type PurchaseRequestFormData = {
  pr_date: string;
  rp_number: string;
  office_id: string | null;
  sub_office_id: string | null;
  category_id: string | null;
  account_id: string | null;
  purpose: string;
  remarks: string;
  items: PurchaseRequestItemFormData[];
  obrs: PurchaseRequestOBRFormData[];
  total_amount: number;
};

export type PurchaseRequestDetails = PurchaseRequest & {
  items: PurchaseRequestItem[];
  obrs: PurchaseRequestOBR[];
};
