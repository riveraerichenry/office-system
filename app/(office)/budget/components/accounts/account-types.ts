export type OfficeOption = {
  id: string;
  office_code: string;
  office_name: string;
  is_active: boolean;
};

export type SubOfficeOption = {
  id: string;
  office_id: string;
  sub_office_code: string | null;
  sub_office_name: string;
  office_name?: string;
  is_active: boolean;
};

export type ExpenseAccountCategory = {
  id: string;
  office_id: string | null;
  sub_office_id: string | null;
  category_code: string;
  category_name: string;
  description: string | null;
  is_active: boolean;

  office_code?: string | null;
  office_name?: string | null;

  sub_office_code?: string | null;
  sub_office_name?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type ExpenseAccount = {
  id: string;
  category_id: string;
  account_code: string;
  account_name: string;
  description: string | null;
  is_active: boolean;

  // Category information
  category_code?: string;
  category_name?: string;

  // Office assignment
  office_id?: string | null;
  office_code?: string | null;
  office_name?: string | null;

  // Sub-office assignment
  sub_office_id?: string | null;
  sub_office_code?: string | null;
  sub_office_name?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type CategoryFormData = {
  owner_type: "office" | "sub_office";
  office_id: string;
  sub_office_id: string;
  category_code: string;
  category_name: string;
  description: string;
  is_active: boolean;
};

export type AccountFormData = {
  category_id: string;
  account_code: string;
  account_name: string;
  description: string;
  is_active: boolean;
};