export type OBRRecord = {
  id: string;
  obr_number: string;
  obr_date?: string;
  payee?: string;
  particulars?: string;

  office_name?: string;
  sub_office_name?: string | null;

  category_code?: string;
  category_name?: string;

  account_code?: string;
  account_name?: string;

  obligation_amount?: number | string;
  total_allocation?: number | string;
  total_amount?: number | string;
  available_amount?: number | string;

  office_id?: string;
  sub_office_id?: string | null;
  category_id?: string;
  account_id?: string;

  status?: string;
};

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

  // Additional display fields
  office_name?: string;
  sub_office_name?: string | null;

  category_name?: string;
  category_code?: string;

  account_name?: string;
  account_code?: string;
};

export type DVItem = {
  id: string;
  obr_id: string;
  obr_no: string;

  office_name?: string;
  sub_office_name?: string | null;

  category_code?: string;
  category_name?: string;

  account_code: string;
  account_name?: string;

  particulars: string;

  obligation_amount?: number | string;
  total_debit: string;

  new_obr?: NewOBRData;
};

export type DVFormData = {
  dv_no: string;
  dv_date: string;
  payee: string;
  payor: string;
  particulars: string;

  items: {
    obr_id: string;
    obr_no: string;

    account_code: string;
    particulars: string;
    total_debit: number;

    new_obr?: NewOBRData;
  }[];

  grand_total: number;
};

export type DVRecord = {
  id: string;
  dv_no: string;
  dv_date: string;
  payee: string;
  payor?: string;
  particulars?: string;

  grand_total: number | string;
  status?: string;
  created_at?: string;
  items_count?: number;
};