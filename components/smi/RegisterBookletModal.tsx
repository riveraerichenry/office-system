"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  Clock3,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type AccountableForm = {
  id: string;
  form_code?: string;
  form_name?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  forms: AccountableForm[];
  onSuccess: () => void | Promise<void>;
};

const CARD_COLORS = [
  {
    name: "Blue",
    selected: "border-blue-600 bg-blue-50 ring-2 ring-blue-100",
    icon: "bg-blue-600 text-white",
    code: "text-blue-700",
    hover: "hover:border-blue-300 hover:bg-blue-50/50",
    check: "text-blue-700",
  },
  {
    name: "Emerald",
    selected: "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100",
    icon: "bg-emerald-600 text-white",
    code: "text-emerald-700",
    hover: "hover:border-emerald-300 hover:bg-emerald-50/50",
    check: "text-emerald-700",
  },
  {
    name: "Violet",
    selected: "border-violet-600 bg-violet-50 ring-2 ring-violet-100",
    icon: "bg-violet-600 text-white",
    code: "text-violet-700",
    hover: "hover:border-violet-300 hover:bg-violet-50/50",
    check: "text-violet-700",
  },
  {
    name: "Amber",
    selected: "border-amber-500 bg-amber-50 ring-2 ring-amber-100",
    icon: "bg-amber-500 text-white",
    code: "text-amber-700",
    hover: "hover:border-amber-300 hover:bg-amber-50/50",
    check: "text-amber-700",
  },
  {
    name: "Rose",
    selected: "border-rose-600 bg-rose-50 ring-2 ring-rose-100",
    icon: "bg-rose-600 text-white",
    code: "text-rose-700",
    hover: "hover:border-rose-300 hover:bg-rose-50/50",
    check: "text-rose-700",
  },
  {
    name: "Cyan",
    selected: "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100",
    icon: "bg-cyan-600 text-white",
    code: "text-cyan-700",
    hover: "hover:border-cyan-300 hover:bg-cyan-50/50",
    check: "text-cyan-700",
  },
];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function RegisterBookletModal({
  open,
  onClose,
  onOpen,
  forms,
  onSuccess,
}: Props) {
  const [saving, setSaving] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Current Date & Time
  const [currentDateTime, setCurrentDateTime] = useState(
    () => new Date()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Form fields
  const [form, setForm] = useState({
    accountable_form_id: "",
    fiscal_year: new Date().getFullYear(),
    series: "",
    beginning_or: "",
    ending_or: "",
    received_date: getToday(),
    supplier: "",
    remarks: "",
  });

  // Last successfully registered form type.
  // Kept when the entry fields are reset.
  const [lastRegisteredFormId, setLastRegisteredFormId] =
    useState<string | null>(null);

  // Reset entry fields without clearing the last registered form.
  function resetForm() {
    const today = new Date();

    setForm((prev) => ({
      ...prev,
      accountable_form_id: "",
      fiscal_year: today.getFullYear(),
      series: prev.series, // Retain the entered series
      beginning_or: "",
      ending_or: "",
      received_date: today.toLocaleDateString("en-CA"),
      supplier: "",
      remarks: "",
    }));
  }

  function handleClose() {
    if (saving) return;

    resetForm();
    onClose();
  }

  function change(key: string, value: string | number) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // Carousel navigation
  function scrollCarousel(direction: "left" | "right") {
    carouselRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  }

  // Register booklet
  async function save() {
    if (saving) return;

    if (!form.accountable_form_id) {
      await Swal.fire({
        icon: "warning",
        title: "Accountable Form Required",
        text: "Please select an accountable form.",
        confirmButtonColor: "#1e293b",
      });
      return;
    }

    const beginningNumber = Number(form.beginning_or);

    if (
      !form.beginning_or ||
      !Number.isSafeInteger(beginningNumber) ||
      beginningNumber < 1
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Beginning OR",
        text: "Please enter a valid positive whole-number OR.",
        confirmButtonColor: "#1e293b",
      });
      return;
    }

    if (!form.received_date) {
      await Swal.fire({
        icon: "warning",
        title: "Received Date Required",
        text: "Please select the received date.",
        confirmButtonColor: "#1e293b",
      });
      return;
    }

    if (
      !Number.isInteger(Number(form.fiscal_year)) ||
      Number(form.fiscal_year) < 1
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Fiscal Year",
        text: "Please enter a valid fiscal year.",
        confirmButtonColor: "#1e293b",
      });
      return;
    }

    // Keep the ending OR synchronized with the beginning OR.
    const endingNumber = beginningNumber + 49;

    const payload = {
      ...form,
      fiscal_year: Number(form.fiscal_year),
      beginning_or: String(beginningNumber),
      ending_or: String(endingNumber),
    };

    try {
      setSaving(true);

      await axios.post("/api/smi", payload);

      // Only update the highlighted form after the API succeeds.
      setLastRegisteredFormId(form.accountable_form_id);

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Booklet successfully registered.",
        confirmButtonText: "Continue",
        confirmButtonColor: "#1e293b",
      });

      resetForm();
      onClose();

      await onSuccess();

      onOpen();
    } catch (err: unknown) {
      console.error("Register Booklet Error:", err);

      const errorMessage =
        axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)
              ?.message
          : undefined;

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage ?? "Unable to register booklet.",
        confirmButtonColor: "#1e293b",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const selectedForm = forms.find(
    (item) => item.id === form.accountable_form_id
  );

  const lastRegisteredForm = forms.find(
    (item) => item.id === lastRegisteredFormId
  );

  return (
    <AnimatePresence>
      <motion.div
        key="register-booklet-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            handleClose();
          }
        }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-booklet-title"
          className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2
                  id="register-booklet-title"
                  className="text-base font-bold text-slate-900"
                >
                  Register Booklet
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Register a new accountable form booklet
                </p>
              </div>

              <div className="max-w-[52%] text-right">
                <div className="mb-1 flex items-center justify-end gap-1 text-slate-500">
                  <Clock3 size={13} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs">
                    Current Date & Time
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 sm:text-sm">
                  {currentDateTime.toLocaleDateString("en-PH", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {currentDateTime.toLocaleTimeString("en-PH", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6">
            {/* Accountable Form Cards */}
            <section className="min-w-0 sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Accountable Form
                    <span className="ml-1 text-rose-500">*</span>
                  </label>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Select the form type for this booklet.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => scrollCarousel("left")}
                    disabled={saving}
                    aria-label="Previous accountable forms"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => scrollCarousel("right")}
                    disabled={saving}
                    aria-label="Next accountable forms"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </motion.button>
                </div>
              </div>

              {forms.length === 0 ? (
                <div className="flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                  <div>
                    <FileText
                      size={24}
                      className="mx-auto mb-2 text-slate-400"
                    />
                    <p className="text-sm font-semibold text-slate-600">
                      No accountable forms available
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Check your accountable forms list.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <style jsx>{`
                    .booklet-form-carousel {
                      scrollbar-width: none;
                      -ms-overflow-style: none;
                    }

                    .booklet-form-carousel::-webkit-scrollbar {
                      display: none;
                    }

                    @media (max-width: 767px) {
                      .booklet-form-carousel {
                        scrollbar-width: thin;
                        scrollbar-color: #cbd5e1 transparent;
                      }

                      .booklet-form-carousel::-webkit-scrollbar {
                        display: block;
                        height: 5px;
                      }

                      .booklet-form-carousel::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 999px;
                      }
                    }
                  `}</style>

                  <div
                    ref={carouselRef}
                    className="booklet-form-carousel flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
                  >
                    {forms.map((item, index) => {
                      const color =
                        CARD_COLORS[index % CARD_COLORS.length];

                      const isCurrentSelection =
                        form.accountable_form_id === item.id;

                      const isLastRegistered =
                        lastRegisteredFormId === item.id;

                      const isHighlighted =
                        isCurrentSelection || isLastRegistered;

                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            change("accountable_form_id", item.id)
                          }
                          aria-pressed={isCurrentSelection}
                          aria-label={`Select ${
                            item.form_code || "form"
                          } ${item.form_name || ""}`}
                          whileHover={
                            saving ? undefined : { y: -2 }
                          }
                          whileTap={
                            saving ? undefined : { scale: 0.98 }
                          }
                          className={`relative flex min-h-[108px] w-[175px] shrink-0 snap-start flex-col rounded-xl border-2 p-3 text-left transition-colors duration-200 sm:w-[190px] ${
                            isHighlighted
                              ? color.selected
                              : `border-slate-200 bg-white ${color.hover}`
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${color.icon}`}
                            >
                              <FileText size={17} />
                            </div>

                            <AnimatePresence mode="wait">
                              {isHighlighted && (
                                <motion.span
                                  key="selected-check"
                                  initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -20,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                    rotate: 0,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    scale: 0.5,
                                  }}
                                  transition={{ duration: 0.16 }}
                                >
                                  <CheckCircle2
                                    size={18}
                                    className={color.check}
                                  />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide ${color.code}`}
                          >
                            {item.form_code || "FORM"}
                          </span>

                          <span className="mt-1 line-clamp-2 text-xs font-semibold leading-4 text-slate-800">
                            {item.form_name || "Unnamed Form"}
                          </span>

                          <div className="mt-2 min-h-[14px]">
                            {isCurrentSelection ? (
                              <span className={`text-[10px] font-bold ${color.code}`}>
                                Selected
                              </span>
                            ) : isLastRegistered ? (
                              <span className={`text-[10px] font-bold ${color.code}`}>
                                Last Registered
                              </span>
                            ) : null}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Selection status */}
              <AnimatePresence mode="wait">
                {selectedForm ? (
                  <motion.div
                    key={`selected-${selectedForm.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2"
                  >
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-blue-700"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                        Current Selection
                      </p>
                      <p className="truncate text-xs font-semibold text-blue-900">
                        {selectedForm.form_code || "FORM"} -{" "}
                        {selectedForm.form_name || "Unnamed Form"}
                      </p>
                    </div>
                  </motion.div>
                ) : lastRegisteredForm ? (
                  <motion.div
                    key={`last-${lastRegisteredForm.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2"
                  >
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-emerald-700"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Last Successfully Registered
                      </p>
                      <p className="truncate text-xs font-semibold text-emerald-900">
                        {lastRegisteredForm.form_code || "FORM"} -{" "}
                        {lastRegisteredForm.form_name || "Unnamed Form"}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>

            {/* Fiscal Year */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fiscal Year
              </label>

              <input
                type="number"
                value={form.fiscal_year}
                disabled={saving}
                onChange={(e) =>
                  change("fiscal_year", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Series */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Series
              </label>

              <input
                type="text"
                value={form.series}
                disabled={saving}
                onChange={(e) => change("series", e.target.value)}
                placeholder="Enter series"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            

            {/* Beginning OR */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Beginning OR
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={form.beginning_or}
                disabled={saving}
                onChange={(e) => {
                  const beginning = e.target.value;

                  if (beginning === "") {
                    setForm((prev) => ({
                      ...prev,
                      beginning_or: "",
                      ending_or: "",
                    }));
                    return;
                  }

                  const beginningNumber = Number(beginning);

                  setForm((prev) => ({
                    ...prev,
                    beginning_or: beginning,
                    ending_or:
                      Number.isSafeInteger(beginningNumber) &&
                      beginningNumber > 0
                        ? String(beginningNumber + 49)
                        : "",
                  }));
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="Beginning OR number"
              />
            </div>

            {/* Ending OR */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ending OR
              </label>

              <input
                type="number"
                value={form.ending_or}
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                placeholder="Automatically calculated"
              />

              <p className="mt-1 text-xs text-slate-400">
                Automatically calculated for 50 ORs per booklet.
              </p>
            </div>

            {/* Supplier - retained for compatibility */}
            {/*
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Supplier
              </label>
              <input
                type="text"
                value={form.supplier}
                disabled={saving}
                onChange={(e) => change("supplier", e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              />
            </div>
            */}


            {/* Received Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Received Date
              </label>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">
                  {form.received_date
                    ? new Date(
                        `${form.received_date}T00:00:00`
                      ).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })
                    : "Select date"}
                </p>

                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                  <input
                    type="date"
                    value={form.received_date}
                    disabled={saving}
                    onChange={(e) =>
                      change("received_date", e.target.value)
                    }
                    aria-label="Received date"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />

                  <span className="pointer-events-none rounded-lg border border-slate-300 bg-white p-2 text-slate-700">
                    <CalendarDays size={17} />
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Remarks
              </label>

              <textarea
                rows={3}
                value={form.remarks}
                disabled={saving}
                onChange={(e) => change("remarks", e.target.value)}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:px-6">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              onClick={handleClose}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </motion.button>

            <motion.button
              type="button"
              whileHover={saving ? undefined : { scale: 1.02 }}
              whileTap={saving ? undefined : { scale: 0.97 }}
              disabled={saving}
              onClick={save}
              className="flex min-w-[110px] items-center justify-center gap-2 rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-flex"
                  >
                    <Clock3 size={15} />
                  </motion.span>
                  Saving...
                </>
              ) : (
                "Save Booklet"
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}