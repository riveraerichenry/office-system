
export interface Office {
  id: string;
  office_code: string;
  office_name: string;
  office_description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  sub_office_count?: number;
}

export interface SubOffice {
  id: string;
  office_id: string;
  office_code?: string;
  office_name?: string;
  sub_office_code: string;
  sub_office_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}
