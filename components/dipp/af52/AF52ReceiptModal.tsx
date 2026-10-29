"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CalendarDays, X } from "lucide-react";

import BookletHeader from "../general/BookletHeader";
import PayorSection from "../a58/PayorSection";

type Props = {
  open: boolean;
  booklet: any;
  onClose: () => void;
  onSuccess: () => void;
};

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

const LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const SECTION_CLASS =
  "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm";

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function getLocalDate() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={SECTION_CLASS}>
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={LABEL_CLASS}>{label}</label>
      {children}
    </div>
  );
}

export default function AF52ReceiptModal({
  open,
  booklet,
  onClose,
  onSuccess,
}: Props) {
  const [saving, setSaving] = useState(false);

  // Receipt and payment
  const [receiptDate, setReceiptDate] = useState(getLocalDate());
  const [payor, setPayor] = useState("");
  const [gender, setGender] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [cashAmount, setCashAmount] = useState("");
  const [checkAmount, setCheckAmount] = useState("");

  // Basic information
  const [municipality, setMunicipality] = useState("TAYTAY");
  const [province, setProvince] = useState("PALAWAN");

  // Current owner
  const [ownerName, setOwnerName] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerMunicipality, setOwnerMunicipality] = useState("TAYTAY");
  const [ownerProvince, setOwnerProvince] = useState("PALAWAN");

  // Transferee
  const [transfereeName, setTransfereeName] = useState("");
  const [transfereeAddress, setTransfereeAddress] = useState("");
  const [transfereeMunicipality, setTransfereeMunicipality] =
    useState("TAYTAY");
  const [transfereeProvince, setTransfereeProvince] = useState("PALAWAN");

  // Ownership and cattle
  const [buyingPrice, setBuyingPrice] = useState("");
  const [cattleSex, setCattleSex] = useState("Male");
  const [cattleAge, setCattleAge] = useState("");
  const [titleNumber, setTitleNumber] = useState("");

  // Issuing details
  const [issuingMunicipality, setIssuingMunicipality] = useState("TAYTAY");
  const [issuingProvince, setIssuingProvince] = useState("PALAWAN");
  const [transferDate, setTransferDate] = useState(getLocalDate());

  // Brand details
  const [brandMunicipality, setBrandMunicipality] = useState("");
  const [brandOwner, setBrandOwner] = useState("");

  useEffect(() => {
    if (!open) return;

    setSaving(false);
    setReceiptDate(getLocalDate());
    setPayor("");
    setGender("");
    setPaymentMode("Cash");
    setCashAmount("");
    setCheckAmount("");

    setMunicipality("TAYTAY");
    setProvince("PALAWAN");

    setOwnerName("");
    setOwnerAddress("");
    setOwnerMunicipality("TAYTAY");
    setOwnerProvince("PALAWAN");

    setTransfereeName("");
    setTransfereeAddress("");
    setTransfereeMunicipality("TAYTAY");
    setTransfereeProvince("PALAWAN");

    setBuyingPrice("");
    setCattleSex("Male");
    setCattleAge("");
    setTitleNumber("");

    setIssuingMunicipality("TAYTAY");
    setIssuingProvince("PALAWAN");
    setTransferDate(getLocalDate());

    setBrandMunicipality("");
    setBrandOwner("");
  }, [open]);

  const cash = Number(cashAmount || 0);
  const check = Number(checkAmount || 0);
  const grandTotal = Number((cash + check).toFixed(2));

  function handlePaymentModeChange(value: string) {
    setPaymentMode(value);

    if (value === "Cash") {
      setCheckAmount("");
    } else if (value === "Check") {
      setCashAmount("");
    }
  }

  function validateForm() {
    if (!booklet) {
      return "Please select an active AF52 booklet.";
    }

    if (!receiptDate) {
      return "Receipt date is required.";
    }

    if (!payor.trim()) {
      return "Please enter the payor name.";
    }

    if (!["Male", "Female"].includes(gender)) {
      return "Please select the payor's gender.";
    }

    if (!ownerName.trim()) {
      return "Current owner's name is required.";
    }

    if (!ownerAddress.trim()) {
      return "Current owner's address is required.";
    }

    if (!ownerMunicipality.trim() || !ownerProvince.trim()) {
      return "Please complete the current owner's municipality and province.";
    }

    if (!transfereeName.trim()) {
      return "Transferee's name is required.";
    }

    if (!transfereeAddress.trim()) {
      return "Transferee's address is required.";
    }

    if (!transfereeMunicipality.trim() || !transfereeProvince.trim()) {
      return "Please complete the transferee's municipality and province.";
    }

    if (!buyingPrice.trim() || !Number.isFinite(Number(buyingPrice))) {
      return "Please enter a valid buying price.";
    }

    if (Number(buyingPrice) < 0) {
      return "Buying price cannot be negative.";
    }

    if (!["Male", "Female"].includes(cattleSex)) {
      return "Please select the cattle's sex.";
    }

    if (
      cattleAge.trim() !== "" &&
      (!Number.isFinite(Number(cattleAge)) || Number(cattleAge) < 0)
    ) {
      return "Please enter a valid cattle age.";
    }

    if (!titleNumber.trim()) {
      return "Title of ownership number is required.";
    }

    if (!issuingMunicipality.trim() || !issuingProvince.trim()) {
      return "Please complete the issuing municipality and province.";
    }

    if (!transferDate) {
      return "Transfer date is required.";
    }

    if (!brandMunicipality.trim()) {
      return "Brand municipality is required.";
    }

    if (!brandOwner.trim()) {
      return "Brand owner's name is required.";
    }

    if (
      !["Cash", "Check", "Cash + Check"].includes(paymentMode)
    ) {
      return "Please select a valid payment mode.";
    }

    if (paymentMode === "Cash" && cash <= 0) {
      return "Enter a cash amount greater than zero.";
    }

    if (paymentMode === "Check" && check <= 0) {
      return "Enter a check amount greater than zero.";
    }

    if (paymentMode === "Cash + Check" && (cash <= 0 || check <= 0)) {
      return "For Cash + Check, both amounts must be greater than zero.";
    }

    if (
      !Number.isFinite(cash) ||
      !Number.isFinite(check) ||
      cash < 0 ||
      check < 0
    ) {
      return "Please enter valid cash and check amounts.";
    }

    return null;
  }

  async function processAF52() {
    const validationError = validateForm();

    if (validationError) {
      await Swal.fire({
        icon: "warning",
        title: "Check Required Fields",
        text: validationError,
      });

      return;
    }

    const confirmation = await Swal.fire({
      icon: "question",
      title: "Process AF52 Receipt?",
      html: `
        <div style="text-align:left;line-height:1.8">
          <div><strong>Payor:</strong> ${payor.trim()}</div>
          <div><strong>Owner:</strong> ${ownerName.trim()}</div>
          <div><strong>Transferee:</strong> ${transfereeName.trim()}</div>
          <div><strong>Payment Mode:</strong> ${paymentMode}</div>
          <div><strong>Total:</strong> ${formatPeso(grandTotal)}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Process Receipt",
      cancelButtonText: "Review Details",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!confirmation.isConfirmed) return;

    try {
      setSaving(true);

      const response = await axios.post("/api/dipp/af52-transactions", {
        booklet_registration_id:
          booklet.booklet_registration_id ?? booklet.id,

        receipt_date: receiptDate,
        payor: payor.trim(),
        gender,
        payment_mode: paymentMode,

        cash_amount: Number(cash.toFixed(2)),
        check_amount: Number(check.toFixed(2)),
        grand_total: grandTotal,

        province: province.trim(),
        municipality: municipality.trim(),

        owner_name: ownerName.trim(),
        owner_address: ownerAddress.trim(),
        owner_municipality: ownerMunicipality.trim(),
        owner_province: ownerProvince.trim(),

        transferee_name: transfereeName.trim(),
        transferee_address: transfereeAddress.trim(),
        transferee_municipality: transfereeMunicipality.trim(),
        transferee_province: transfereeProvince.trim(),

        buying_price: Number(Number(buyingPrice).toFixed(2)),
        cattle_sex: cattleSex,
        cattle_age: cattleAge.trim() === "" ? null : Number(cattleAge),

        title_of_ownership_number: titleNumber.trim(),

        issuing_municipality: issuingMunicipality.trim(),
        issuing_province: issuingProvince.trim(),

        transfer_date: transferDate,
        brand_municipality: brandMunicipality.trim(),
        brand_owner: brandOwner.trim(),
      });

      await Swal.fire({
        icon: "success",
        title: "AF52 Successfully Issued",
        html: `
          <div style="text-align:center;line-height:1.8">
            <div>Official Receipt Number</div>
            <strong style="font-size:26px">
              ${response.data.or_number ?? "Issued"}
            </strong>
            <div style="margin-top:12px">
              Total Amount:
              <strong>${formatPeso(
                Number(response.data.grand_total ?? grandTotal)
              )}</strong>
            </div>
          </div>
        `,
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error("AF52 ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "Unable to Process AF52",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!open || !booklet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6">
      <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Reusable booklet header */}
        <div className="relative shrink-0">
          <BookletHeader booklet={booklet} />

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close AF52 modal"
            className="absolute right-5 top-5 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-100 p-4 sm:p-6">
          <PayorSection
            payor={payor}
            gender={gender}
            paymentMode={paymentMode}
            saving={saving}
            onPayorChange={setPayor}
            onGenderChange={setGender}
            onPaymentModeChange={handlePaymentModeChange}
          />

          {/* Receipt information */}
          <Section title="Receipt Information">
            <Field label="Receipt Date">
              <div className="relative">
                <input
                  type="date"
                  value={receiptDate}
                  disabled={saving}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className={INPUT_CLASS}
                />
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute right-3 top-3 text-slate-400"
                />
              </div>
            </Field>

            <Field label="Municipality">
              <input
                value={municipality}
                disabled={saving}
                onChange={(e) =>
                  setMunicipality(e.target.value.toUpperCase())
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Province">
              <input
                value={province}
                disabled={saving}
                onChange={(e) => setProvince(e.target.value.toUpperCase())}
                className={INPUT_CLASS}
              />
            </Field>
          </Section>

          {/* Current owner */}
          <Section title="Current Owner Information">
            <Field label="Owner Name" className="sm:col-span-2">
              <input
                value={ownerName}
                disabled={saving}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter current owner's full name"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Owner Address" className="sm:col-span-2">
              <input
                value={ownerAddress}
                disabled={saving}
                onChange={(e) => setOwnerAddress(e.target.value)}
                placeholder="Enter current owner's address"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Municipality">
              <input
                value={ownerMunicipality}
                disabled={saving}
                onChange={(e) =>
                  setOwnerMunicipality(e.target.value.toUpperCase())
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Province">
              <input
                value={ownerProvince}
                disabled={saving}
                onChange={(e) =>
                  setOwnerProvince(e.target.value.toUpperCase())
                }
                className={INPUT_CLASS}
              />
            </Field>
          </Section>

          {/* Transferee */}
          <Section title="Transfer To / New Owner Information">
            <Field label="Transferee Name" className="sm:col-span-2">
              <input
                value={transfereeName}
                disabled={saving}
                onChange={(e) => setTransfereeName(e.target.value)}
                placeholder="Enter transferee's full name"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Transferee Address" className="sm:col-span-2">
              <input
                value={transfereeAddress}
                disabled={saving}
                onChange={(e) => setTransfereeAddress(e.target.value)}
                placeholder="Enter transferee's address"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Municipality">
              <input
                value={transfereeMunicipality}
                disabled={saving}
                onChange={(e) =>
                  setTransfereeMunicipality(e.target.value.toUpperCase())
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Province">
              <input
                value={transfereeProvince}
                disabled={saving}
                onChange={(e) =>
                  setTransfereeProvince(e.target.value.toUpperCase())
                }
                className={INPUT_CLASS}
              />
            </Field>
          </Section>

          {/* Cattle and ownership */}
          <Section title="Cattle and Ownership Details">
            <Field label="Buying Price (₱)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={buyingPrice}
                disabled={saving}
                onChange={(e) => setBuyingPrice(e.target.value)}
                placeholder="0.00"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Cattle Sex">
              <select
                value={cattleSex}
                disabled={saving}
                onChange={(e) => setCattleSex(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </Field>

            <Field label="Cattle Age">
              <input
                type="number"
                min="0"
                step="0.01"
                value={cattleAge}
                disabled={saving}
                onChange={(e) => setCattleAge(e.target.value)}
                placeholder="Enter age"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Title of Ownership No.">
              <input
                value={titleNumber}
                disabled={saving}
                onChange={(e) => setTitleNumber(e.target.value)}
                placeholder="Enter title number"
                className={INPUT_CLASS}
              />
            </Field>
          </Section>

          {/* Issuing and transfer details */}
          <Section title="Issuing and Transfer Details">
            <Field label="Issuing Municipality">
              <input
                value={issuingMunicipality}
                disabled={saving}
                onChange={(e) =>
                  setIssuingMunicipality(e.target.value.toUpperCase())
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Issuing Province">
              <input
                value={issuingProvince}
                disabled={saving}
                onChange={(e) =>
                  setIssuingProvince(e.target.value.toUpperCase())
                }
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Transfer Date">
              <input
                type="date"
                value={transferDate}
                disabled={saving}
                onChange={(e) => setTransferDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </Section>

          {/* Brand details */}
          <Section title="Brand Information">
            <Field label="Brand Municipality" className="sm:col-span-2">
              <input
                value={brandMunicipality}
                disabled={saving}
                onChange={(e) =>
                  setBrandMunicipality(e.target.value.toUpperCase())
                }
                placeholder="Enter brand municipality"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Brand Owner" className="sm:col-span-2">
              <input
                value={brandOwner}
                disabled={saving}
                onChange={(e) => setBrandOwner(e.target.value)}
                placeholder="Enter brand owner's name"
                className={INPUT_CLASS}
              />
            </Field>
          </Section>

          {/* Payment details */}
          <Section title="Payment Details">
            {paymentMode !== "Check" && (
              <Field label="Cash Amount (₱)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashAmount}
                  disabled={saving}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0.00"
                  className={INPUT_CLASS}
                />
              </Field>
            )}

            

            <Field label="Grand Total">
              <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 font-bold text-slate-800">
                {formatPeso(grandTotal)}
              </div>
            </Field>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Close
          </button>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Amount
              </p>
              <p className="text-2xl font-black text-green-700">
                {formatPeso(grandTotal)}
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={processAF52}
              className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Processing..." : "Process AF52"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}