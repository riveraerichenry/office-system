"use client";

import OBRFormModal from "./OBRFormModal";
import type {
  ExpenseAccountCategoryOption,
  ExpenseAccountOption,
  OfficeOption,
  SubOfficeOption,
  PurchaseRequestOBRFormData,
} from "./purchase-requests-types";

export type OBRDetails = {
  obr_id?: string;
  row_id: string;
  obr_number: string;
  obr_date: string;
  payee: string;
  particulars: string;
  amount: number;
  office_id?: string | null;
  sub_office_id?: string | null;
  category_id?: string | null;
  account_id?: string | null;
  remarks?: string | null;
};

type Props = {
  obr: OBRDetails;
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: ExpenseAccountCategoryOption[];
  accounts: ExpenseAccountOption[];
  onClose: () => void;
  onSave: (obr: OBRDetails) => void;
  onDelete?: () => void;
  deleting?: boolean;
};

export default function OBRDetailsModal({
  obr, offices, subOffices, categories, accounts, onClose, onSave, onDelete, deleting = false,
}: Props) {
  const initialData: PurchaseRequestOBRFormData = {
    obr_number: obr.obr_number,
    obr_date: obr.obr_date,
    payee: obr.payee,
    office_id: obr.office_id || "",
    sub_office_id: obr.sub_office_id || null,
    category_id: obr.category_id || "",
    account_id: obr.account_id || "",
    particulars: obr.particulars || "",
    amount: Number(obr.amount || 0),
    remarks: obr.remarks || "",
  };

  return (
    <OBRFormModal
      offices={offices}
      subOffices={subOffices}
      categories={categories}
      accounts={accounts}
      initialData={initialData}
      title="Edit Obligation Request (OBR)"
      submitLabel="Apply OBR Changes"
      onDelete={onDelete}
      deleting={deleting}
      onClose={onClose}
      onAdd={(updated) => onSave({ ...obr, ...updated, obr_id: obr.obr_id, row_id: obr.row_id })}
    />
  );
}
