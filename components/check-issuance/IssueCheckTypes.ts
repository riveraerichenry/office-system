
import type { AvailableCheck } from "@/components/check-issuance/AvailableChecks";

export type Signatory = {
  id: string;
  full_name: string;
  office: string | null;
  position: string | null;
  remarks: string | null;
};

export type IssueCheckItem = {
  id: string;
  obr_no: string;
  responsibility_center: string;
  account_code: string;
  payee_name: string;
  nature_of_payment: string;
  item_date: string;
  total_debit: string;
  total_wtax: string;
  other_deduction: string;
  retention_10_percent: string;
  wtax_1_percent: string;
  wtax_2_percent: string;
  wtax_3_percent: string;
  wtax_4_percent: string;
  excavation_fees: string;
  advance_payment: string;
  liquidated_damages: string;
  accounts_payable: string;
  others: string;
  remarks: string;
};

export type IssueCheckForm = {
  booklet_id: string;
  booklet_number: string;
  check_number: string;
  dv_no: string;
  check_date: string;
  payee: string;
  payor: string;
  signatory_1: string;
  signatory_2: string;
  fund_source_id: string;
  fund_source: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  particulars: string;
  items: IssueCheckItem[];
  grand_total: number;
};

export type IssueCheckModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IssueCheckForm) => void;
  selectedBooklet: AvailableCheck | null;
};

export type IssueCheckDetailsProps = {
  dvNo: string;
  setDvNo: (value: string) => void;
  checkDate: string;
  setCheckDate: (value: string) => void;
  payee: string;
  setPayee: (value: string) => void;
  payor: string;
  setPayor: (value: string) => void;
  signatory1: string;
  setSignatory1: (value: string) => void;
  signatory2: string;
  setSignatory2: (value: string) => void;
  particulars: string;
  setParticulars: (value: string) => void;
  signatories: Signatory[];
  loadingSignatories: boolean;
  signatoryError: string;
  onRetrySignatories: () => void;
};
