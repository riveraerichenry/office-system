export interface Booklet {
  id: string;

  control_no: string;

  accountable_form_id: string;

  fiscal_year: number;

  series: string;

  beginning_or: number;

  ending_or: number;

  receipt_count: number;

  current_or: number;

  status: string;

  received_date: string;

  issued_date?: string | null;

  supplier?: string | null;

  remarks?: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;

  created_by?: string | null;
  updated_by?: string | null;
}