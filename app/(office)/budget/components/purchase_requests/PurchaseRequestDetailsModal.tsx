
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
  ClipboardList,
  Loader2,
  Plus,
  Trash2,
  Save,
  Receipt,
  ShoppingCart,
  Search,
} from "lucide-react";

import type {
  PurchaseRequest,
  OfficeOption,
  SubOfficeOption,
  ExpenseAccountCategoryOption,
  ExpenseAccountOption,
} from "./purchase-requests-types";
import AddOBRModal from "./AddOBRModal";
import OBRDetailsModal from "./OBRDetailsModal";

type Props = {
  record: PurchaseRequest;
  onClose: () => void;
  onSaved?: () => void;
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: ExpenseAccountCategoryOption[];
  accounts: ExpenseAccountOption[];
};

type Item = {
  id?: string;
  row_id: string;
  item_description: string;
  specifications: string;
  unit: string;
  quantity: number;
  estimated_unit_cost: number;
};

type OBR = {
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


const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-xs text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400 disabled:opacity-50";

const labelClass =
  "mb-0.5 block text-[10px] font-medium text-slate-400";

const sectionTitleClass =
  "mb-2 border-b border-slate-300 pb-1 text-xs font-semibold text-[#557992]";

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const today = () => {
  const date = new Date();
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
};

const dateOnly = (value?: string) =>
  value?.slice(0, 10) || "";

const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));


export default function PurchaseRequestDetailsModal({
  record,
  onClose,
  onSaved,
  offices = [],
  subOffices = [],
  categories = [],
  accounts = [],
}: Props) {
  const recordId = record?.id;

  const [data, setData] = useState<any>(record);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingObr, setDeletingObr] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [prNumber, setPrNumber] = useState(
    (record as any)?.pr_number ||
      (record as any)?.rp_number ||
      ""
  );

  const [prDate, setPrDate] = useState(
    dateOnly(record.pr_date)
  );

  const [purpose, setPurpose] = useState(
    record.purpose || ""
  );

  const [remarks, setRemarks] = useState(
    record.remarks || ""
  );

  const [items, setItems] = useState<Item[]>([]);
  const [obrs, setObrs] = useState<OBR[]>([]);

  const [choices, setChoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [showObrForm, setShowObrForm] = useState(false);
  const [selectedObr, setSelectedObr] = useState<OBR | null>(null);


  /* =====================================================
     LOAD PURCHASE REQUEST DETAILS
  ===================================================== */

  const load = useCallback(async () => {
    if (!recordId) {
      setError(
        "Missing purchase request ID. Close this window and refresh the purchase request list."
      );

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/budget/api/purchase_requests/${encodeURIComponent(recordId)}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load purchase request."
        );
      }

      const pr = result.data;

      setData(pr);

      setPrNumber(pr.pr_number || pr.rp_number || "");
      setPrDate(dateOnly(pr.pr_date));
      setPurpose(pr.purpose || "");
      setRemarks(pr.remarks || "");

      setItems(
        (pr.items || []).map((item: any) => ({
          id: item.id,
          row_id: makeId(),
          item_description: item.item_description || "",
          specifications: item.specifications || "",
          unit: item.unit || "",
          quantity: Number(item.quantity ?? 1),
          estimated_unit_cost: Number(
            item.estimated_unit_cost ?? 0
          ),
        }))
      );

      setObrs(
        (pr.obrs || []).map((obr: any) => ({
          obr_id: obr.obr_id || obr.id,
          row_id: makeId(),
          obr_number: obr.obr_number || "",
          obr_date: dateOnly(obr.obr_date),
          payee: obr.payee || "",
          particulars: obr.particulars || "",
          amount: Number(
            obr.amount ?? obr.allocated_amount ?? 0
          ),
          office_id: obr.office_id,
          sub_office_id: obr.sub_office_id,
          category_id: obr.category_id,
          account_id: obr.account_id,
          remarks: obr.remarks || "",
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load purchase request."
      );
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    void load();
  }, [load]);

  /* =====================================================
     SEARCH EXISTING OBRs
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function searchObrs() {
      try {
        const params = new URLSearchParams({
          search,
          purchase_request_id: recordId || "",
        });

        const response = await fetch(
          `/budget/api/purchase_request_obrs?${params.toString()}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!cancelled && response.ok && result.success) {
          setChoices(result.data || []);
        }
      } catch {
        if (!cancelled) {
          setChoices([]);
        }
      }
    }

    void searchObrs();

    return () => {
      cancelled = true;
    };
  }, [search, recordId]);

  /* =====================================================
     TOTALS
  ===================================================== */

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.estimated_unit_cost || 0),
        0
      ),
    [items]
  );

  const allocatedTotal = useMemo(
    () =>
      obrs.reduce(
        (sum, obr) => sum + Number(obr.amount || 0),
        0
      ),
    [obrs]
  );


  /* =====================================================
     ITEM ACTIONS
  ===================================================== */

  function addItem() {
    setItems((current) => [
      ...current,
      {
        row_id: makeId(),
        item_description: "",
        specifications: "",
        unit: "",
        quantity: 1,
        estimated_unit_cost: 0,
      },
    ]);
  }

  function updateItem(
    rowId: string,
    key: keyof Item,
    value: string | number
  ) {
    setItems((current) =>
      current.map((item) =>
        item.row_id === rowId
          ? { ...item, [key]: value }
          : item
      )
    );
  }

  function removeItem(rowId: string) {
    if (items.length <= 1) {
      setError(
        "A purchase request must have at least one item."
      );
      return;
    }

    setItems((current) =>
      current.filter((item) => item.row_id !== rowId)
    );
  }

  /* =====================================================
     ATTACH EXISTING OBR
  ===================================================== */

  function addExistingObr(obr: any) {
    if (
      obrs.some(
        (item) =>
          item.obr_id === obr.id ||
          item.obr_number.toLowerCase() ===
            String(obr.obr_number).toLowerCase()
      )
    ) {
      setError("This OBR is already attached.");
      return;
    }

    setError("");

    setObrs((current) => [
      ...current,
      {
        obr_id: obr.id,
        row_id: makeId(),
        obr_number: obr.obr_number,
        obr_date: dateOnly(obr.obr_date),
        payee: obr.payee,
        particulars: obr.particulars || "",
        amount: 0,
        office_id: obr.office_id,
        sub_office_id: obr.sub_office_id,
        category_id: obr.category_id,
        account_id: obr.account_id,
        remarks: obr.remarks || "",
      },
    ]);
  }

  /* =====================================================
     CREATE NEW OBR
  ===================================================== */

  function addNewObr(savedObr: any) {
    setError("");

    const obrId = savedObr.obr_id || savedObr.id;
    const duplicate = obrs.some(
      (obr) =>
        (obr.obr_id && obr.obr_id === obrId) ||
        obr.obr_number.toLowerCase() ===
          String(savedObr.obr_number || "").toLowerCase()
    );

    if (duplicate) {
      setError("This OBR is already attached to this Purchase Request.");
      return;
    }

    setObrs((current) => [
      ...current,
      {
        obr_id: obrId,
        row_id: makeId(),
        obr_number: savedObr.obr_number,
        obr_date: dateOnly(savedObr.obr_date),
        payee: savedObr.payee,
        particulars: savedObr.particulars || "",
        amount: Number(savedObr.amount ?? savedObr.allocated_amount ?? 0),
        office_id: savedObr.office_id,
        sub_office_id: savedObr.sub_office_id,
        category_id: savedObr.category_id,
        account_id: savedObr.account_id,
        remarks: savedObr.remarks || "",
      },
    ]);

    setShowObrForm(false);
    setSuccess("OBR created and linked to this Purchase Request.");
  }

  /* =====================================================
     EDIT OBR
  ===================================================== */

  function saveObrDetails(updated: OBR) {
    setObrs((current) =>
      current.map((obr) =>
        obr.row_id === updated.row_id ? updated : obr
      )
    );
    setSelectedObr(null);
  }

  async function removeObr(obr: OBR) {
    if (!obr.obr_id) {
      setError("This OBR does not have a saved database record.");
      return;
    }

    const confirmed = window.confirm(
      `Delete OBR ${obr.obr_number} from this Purchase Request? This will also delete the OBR record if it is not linked to another Purchase Request.`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingObr(true);

    try {
      const response = await fetch(
        `/budget/api/purchase_requests/${encodeURIComponent(recordId)}/obrs`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ obr_id: obr.obr_id }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete OBR.");
      }

      setObrs((current) => current.filter((item) => item.row_id !== obr.row_id));
      setSelectedObr(null);
      setSuccess(result.message || "OBR deleted successfully.");
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete OBR.");
    } finally {
      setDeletingObr(false);
    }
  }

  /* =====================================================
     SAVE
  ===================================================== */

  async function save() {
    setError("");
    setSuccess("");

    if (!recordId) {
      setError("Missing purchase request ID.");
      return;
    }

    if (!prNumber.trim() || !prDate) {
      setError("PR number and date are required.");
      return;
    }

    if (!items.length) {
      setError(
        "A purchase request must have at least one item."
      );
      return;
    }

    if (
      items.some(
        (item) =>
          !item.item_description.trim() ||
          !item.unit.trim() ||
          !Number.isFinite(Number(item.quantity)) ||
          Number(item.quantity) <= 0 ||
          !Number.isFinite(
            Number(item.estimated_unit_cost)
          ) ||
          Number(item.estimated_unit_cost) < 0
      )
    ) {
      setError(
        "Please complete all item descriptions, units, quantities, and costs."
      );
      return;
    }


    if (
      obrs.some(
        (obr) =>
          !obr.obr_number.trim() ||
          !obr.obr_date ||
          !obr.payee.trim() ||
          !Number.isFinite(Number(obr.amount)) ||
          Number(obr.amount) <= 0
      )
    ) {
      setError("Complete all OBR details and enter positive allocation amounts.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/budget/api/purchase_requests/${encodeURIComponent(recordId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pr_number: prNumber.trim(),
            pr_date: prDate,
            purpose,
            remarks,

            items: items.map((item) => ({
              id: item.id,
              item_description: item.item_description,
              specifications: item.specifications,
              unit: item.unit,
              quantity: Number(item.quantity),
              estimated_unit_cost: Number(
                item.estimated_unit_cost
              ),
            })),

            obrs: obrs.map((obr) => ({
              ...(obr.obr_id ? { obr_id: obr.obr_id } : {}),
              obr_number: obr.obr_number.trim(),
              obr_date: obr.obr_date,
              payee: obr.payee.trim(),
              particulars: obr.particulars,
              amount: Number(obr.amount),
              office_id: obr.office_id,
              sub_office_id: obr.sub_office_id,
              category_id: obr.category_id,
              account_id: obr.account_id,
              remarks: obr.remarks,
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update purchase request."
        );
      }

      setSuccess(
        "Purchase request saved successfully."
      );

      await load();
      onSaved?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save purchase request."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     REUSABLE INPUT
  ===================================================== */

  const field = (
    label: string,
    value: string | number,
    onChange: (value: string) => void,
    type = "text",
    placeholder = ""
  ) => (
    <label className="block">
      <span className={labelClass}>{label}</span>

      <input
        className={inputClass}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={saving}
      />
    </label>
  );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 backdrop-blur-[2px]">
      <div className="flex max-h-[98vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <ClipboardList size={23} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Purchase Request Details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {prNumber || recordId || "Purchase Request"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60"
          >
            <X size={19} />
          </button>
        </div>

        {/* BODY */}

        <main className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2
                className="animate-spin text-[#6689A5]"
                size={28}
              />
            </div>
          ) : (
            <>

              {/* PR INFORMATION */}

              <section>
                <h3 className={sectionTitleClass}>
                  Purchase Request Information
                </h3>

                <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">

                  {field(
                    "PR Number *",
                    prNumber,
                    setPrNumber,
                    "text",
                    "Enter PR number"
                  )}

                  {field(
                    "Purchase Request Date *",
                    prDate,
                    setPrDate,
                    "date"
                  )}

                  <div>
                    <span className={labelClass}>
                      Office
                    </span>
                    <p className="border-b border-slate-200 py-1 text-xs text-slate-700">
                      {data?.office_name || data?.office?.office_name || data?.office?.name || (record as any)?.office_name || (record as any)?.office?.name || offices.find((item) => item.id === data?.office_id)?.office_name || "—"}
                    </p>
                  </div>

                  <div>
                    <span className={labelClass}>
                      Sub-office
                    </span>
                    <p className="border-b border-slate-200 py-1 text-xs text-slate-700">
                      {data?.sub_office_name || subOffices.find((item) => item.id === data?.sub_office_id)?.sub_office_name || "—"}
                    </p>
                  </div>

                  <div>
                    <span className={labelClass}>
                      Expense Category
                    </span>
                    <p className="border-b border-slate-200 py-1 text-xs text-slate-700">
                      {data?.category_code || categories.find((item) => item.id === data?.category_id)?.category_code || "—"}{" "}
                      {data?.category_name || categories.find((item) => item.id === data?.category_id)?.category_name || ""}
                    </p>
                  </div>

                  <div>
                    <span className={labelClass}>
                      Expense Account
                    </span>
                    <p className="border-b border-slate-200 py-1 text-xs text-slate-700">
                      {data?.account_code || accounts.find((item) => item.id === data?.account_id)?.account_code || "—"}{" "}
                      {data?.account_name || accounts.find((item) => item.id === data?.account_id)?.account_name || ""}
                    </p>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block">
                      <span className={labelClass}>
                        Purpose
                      </span>

                      <textarea
                        className="w-full resize-y border-b border-slate-300 bg-transparent px-0 py-1 text-xs outline-none focus:border-[#6689A5]"
                        rows={1}
                        value={purpose}
                        onChange={(event) =>
                          setPurpose(event.target.value)
                        }
                        disabled={saving}
                      />
                    </label>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block">
                      <span className={labelClass}>
                        Remarks
                      </span>

                      <textarea
                        className="w-full resize-y border-b border-slate-300 bg-transparent px-0 py-1 text-xs outline-none focus:border-[#6689A5]"
                        rows={1}
                        value={remarks}
                        onChange={(event) =>
                          setRemarks(event.target.value)
                        }
                        disabled={saving}
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* PURCHASE ITEMS */}

              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <ShoppingCart
                      size={16}
                      className="text-[#6689A5]"
                    />

                    <h3 className="text-sm font-medium text-[#557992]">
                      Purchase Request Items
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-sm bg-[#6689A5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#557992] disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-[#EDF3F7] text-[11px] font-semibold text-slate-500">
                      <tr>
                        <th className="w-12 px-2 py-2 text-center">
                          #
                        </th>

                        <th className="w-24 px-2 py-2">
                          Unit
                        </th>

                        <th className="w-24 px-2 py-2">
                          Qty
                        </th>

                        <th className="px-2 py-2">
                          Item / Description
                        </th>

                        <th className="w-40 px-2 py-2">
                          Specifications
                        </th>

                        <th className="w-36 px-2 py-2 text-right">
                          Unit Cost
                        </th>

                        <th className="w-36 px-2 py-2 text-right">
                          Total Cost
                        </th>

                        <th className="w-12 px-2 py-2" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => {
                        const lineTotal =
                          Number(item.quantity || 0) *
                          Number(
                            item.estimated_unit_cost || 0
                          );

                        return (
                          <tr key={item.row_id}>
                            <td className="px-2 py-2 text-center text-xs text-slate-400">
                              {index + 1}
                            </td>

                            <td className="px-3 py-2">
                              <input
                                value={item.unit}
                                onChange={(event) =>
                                  updateItem(
                                    item.row_id,
                                    "unit",
                                    event.target.value
                                  )
                                }
                                placeholder="Unit"
                                className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                                disabled={saving}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateItem(
                                    item.row_id,
                                    "quantity",
                                    Number(event.target.value)
                                  )
                                }
                                className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                                disabled={saving}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <input
                                value={item.item_description}
                                onChange={(event) =>
                                  updateItem(
                                    item.row_id,
                                    "item_description",
                                    event.target.value
                                  )
                                }
                                placeholder="Enter item description"
                                className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                                disabled={saving}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <input
                                value={item.specifications}
                                onChange={(event) =>
                                  updateItem(
                                    item.row_id,
                                    "specifications",
                                    event.target.value
                                  )
                                }
                                placeholder="Optional"
                                className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                                disabled={saving}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.estimated_unit_cost}
                                onChange={(event) =>
                                  updateItem(
                                    item.row_id,
                                    "estimated_unit_cost",
                                    Number(event.target.value)
                                  )
                                }
                                className="w-full border-b border-slate-200 bg-transparent py-2 text-right text-xs outline-none focus:border-[#6689A5]"
                                disabled={saving}
                              />
                            </td>

                            <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-slate-700">
                              {peso(lineTotal)}
                            </td>

                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.row_id)
                                }
                                disabled={
                                  saving || items.length === 1
                                }
                                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                title="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>


                  </table>
                </div>

                <p className="mt-2 text-[10px] text-slate-400">
                  Total cost is calculated automatically:
                  Quantity × Unit Cost.
                </p>
              </section>

              {/* OBR SECTION */}

              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Receipt
                      size={16}
                      className="text-[#6689A5]"
                    />

                    <h3 className="text-sm font-medium text-[#557992]">
                      Obligation Requests (OBR)
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowObrForm((value) => !value)
                    }
                    disabled={saving}
                    className="flex items-center gap-2 rounded-sm border border-[#6689A5] bg-white px-3 py-2 text-xs font-semibold text-[#557992] hover:bg-[#EDF3F7]"
                  >
                    <Plus size={14} />
                    Create New OBR
                  </button>
                </div>

                {/* SEARCH EXISTING OBR */}

                <div className="mb-4">
                  <label className={labelClass}>
                    Attach an Existing OBR
                  </label>

                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search OBR number or payee..."
                      className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#6689A5]"
                      disabled={saving}
                    />
                  </div>

                  {search.trim() && choices.length > 0 && (
                    <div className="mt-2 max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-white">
                      {choices.map((obr) => (
                        <div
                          key={obr.id}
                          className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700">
                              {obr.obr_number}
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                              {obr.payee} ·{" "}
                              {dateOnly(obr.obr_date)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => addExistingObr(obr)}
                            disabled={saving}
                            className="shrink-0 rounded-sm bg-[#6689A5] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#557992]"
                          >
                            Attach
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {search.trim() && choices.length === 0 && (
                    <p className="mt-2 text-xs text-slate-400">
                      No matching OBR records.
                    </p>
                  )}
                </div>

                {/* ATTACHED OBR TABLE */}

                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-[#EDF3F7] text-[11px] font-semibold text-slate-500">
                      <tr>
                        <th className="w-10 px-2 py-2 text-center">#</th>
                        <th className="w-36 px-2 py-2">OBR Number</th>
                        <th className="w-28 px-2 py-2">Date</th>
                        <th className="w-40 px-2 py-2">Payee</th>
                        <th className="px-2 py-2">Particulars</th>
                        <th className="w-36 px-2 py-2 text-right">Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {obrs.map((obr, index) => (
                        <tr
                          key={obr.row_id}
                          className="cursor-pointer transition hover:bg-[#F4F8FB]"
                          onClick={() => setSelectedObr(obr)}
                          title="Click to view or edit OBR details"
                          aria-label={`Edit OBR ${obr.obr_number}`}
                        >
                          <td className="px-2 py-2 text-center text-xs text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 text-xs font-semibold text-[#557992]">
                            {obr.obr_number}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600">
                            {dateOnly(obr.obr_date) || "—"}
                          </td>
                          <td className="max-w-[180px] truncate px-2 py-2 text-xs text-slate-700">
                            {obr.payee || "—"}
                          </td>
                          <td className="max-w-[320px] truncate px-2 py-2 text-xs text-slate-600">
                            {obr.particulars || "—"}
                          </td>
                          <td className="px-2 py-2 text-right text-xs font-semibold tabular-nums text-slate-700">
                            {peso(obr.amount)}
                          </td>

                        </tr>
                      ))}
                      {!obrs.length && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">
                            No OBR allocations attached. You can add an OBR now or later.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#F5F8FA]">
                        <td colSpan={5} className="px-3 py-2 text-right text-xs font-semibold text-slate-600">
                          TOTAL OBR ALLOCATION
                        </td>
                        <td className="px-2 py-2 text-right text-xs font-bold text-[#557992]">
                          {peso(allocatedTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>

        {/* FOOTER */}

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Purchase Request Total
            </span>
            <span className="text-base font-bold tabular-nums text-[#557992]">
              {peso(total)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-sm border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-sm bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Save size={14} />
            )}

            {saving ? "Saving..." : "Save Changes"}
          </button>
          </div>
        </footer>
      </div>

      {showObrForm && (
        <AddOBRModal
          purchaseRequestId={recordId}
          onClose={() => setShowObrForm(false)}
          onAdd={addNewObr}
        />
      )}

      {selectedObr && (
        <OBRDetailsModal
          obr={selectedObr}
          offices={offices}
          subOffices={subOffices}
          categories={categories}
          accounts={accounts}
          onClose={() => setSelectedObr(null)}
          onSave={saveObrDetails}
          onDelete={() => void removeObr(selectedObr)}
          deleting={deletingObr}
        />
      )}
    </div>
  );
}
