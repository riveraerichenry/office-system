export type ExpenseAccountCategory = {
  id: string;
  category_code: string;
  category_name: string;
  description: string | null;
  is_active: boolean;
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
  category_code?: string;
  category_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type CategoryFormData = {
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
