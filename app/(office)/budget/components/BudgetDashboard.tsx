
"use client";

import Link from "next/link";
import BudgetUtilizationByOffice from "./BudgetUtilizationByOffice";
import {
  Wallet,
  Landmark,
  FileText,
  Receipt,
  Banknote,
  ChartNoAxesCombined,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  CalendarDays,
  Plus,
  ChevronRight,
  CircleDollarSign,
  Building2,
  FileCheck2,
  Clock,
} from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

const budgetCards = [
  {
    title: "Total Appropriations",
    amount: 125000000,
    description: "Approved budget",
    icon: Landmark,
    color: "blue",
    percentage: "+8.5%",
    trend: "up",
  },
  {
    title: "Total Allotments",
    amount: 98000000,
    description: "Released allotments",
    icon: Wallet,
    color: "cyan",
    percentage: "78.4%",
    trend: "up",
  },
  {
    title: "Total Obligations",
    amount: 67500000,
    description: "Approved OBRs",
    icon: FileText,
    color: "indigo",
    percentage: "68.9%",
    trend: "up",
  },
  {
    title: "Total Disbursements",
    amount: 48200000,
    description: "Processed payments",
    icon: Receipt,
    color: "green",
    percentage: "49.2%",
    trend: "up",
  },
];

const transactions = [
  {
    reference: "OBR-2026-0001",
    payee: "ABC Construction Supply",
    type: "Obligation Request",
    date: "Nov 09, 2026",
    amount: 125000,
    status: "Approved",
  },
  {
    reference: "DV-2026-0001",
    payee: "Palawan Office Supplies",
    type: "Disbursement Voucher",
    date: "Nov 08, 2026",
    amount: 48500,
    status: "Pending",
  },
  {
    reference: "OBR-2026-0002",
    payee: "Utility Services",
    type: "Obligation Request",
    date: "Nov 07, 2026",
    amount: 78000,
    status: "For Review",
  },
  {
    reference: "DV-2026-0002",
    payee: "Equipment Solutions",
    type: "Disbursement Voucher",
    date: "Nov 06, 2026",
    amount: 215000,
    status: "Paid",
  },
];


const quickActions = [
  {
    title: "New Appropriation",
    description: "Create budget appropriation",
    icon: Landmark,
    href: "/budget/appropriations",
  },
  {
    title: "Create OBR",
    description: "Register an obligation request",
    icon: FileText,
    href: "/budget/obligations",
  },
  {
    title: "Create DV",
    description: "Prepare disbursement voucher",
    icon: Receipt,
    href: "/budget/disbursement_vouchers",
  },
  {
    title: "View Reports",
    description: "Review budget performance",
    icon: ChartNoAxesCombined,
    href: "/budget/reports",
  },
];

export default function BudgetDashboard() {
  const totalAppropriation = 125000000;
  const totalAllotment = 98000000;
  const totalObligations = 67500000;
  const totalDisbursement = 48200000;

  const availableAllotment = totalAllotment - totalObligations;
  const unpaidObligations = totalObligations - totalDisbursement;

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-6 lg:p-8">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Budget Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor appropriations, allotments, obligations and disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-[#D5DCE3] bg-white px-3 py-2 text-sm text-slate-600">
            <CalendarDays size={16} />
            Fiscal Year 2026
          </div>
        </div>
      </div>

      {/* BUDGET UTILIZATION BY OFFICE */}
      <div className="mb-6 grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="min-w-0 xl:col-span-4">
          <BudgetUtilizationByOffice />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {budgetCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-lg border border-[#DCE3E9] bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-800">
                    {formatCurrency(card.amount)}
                  </h2>
                </div>

                <div className="rounded-md bg-[#EAF1F6] p-3 text-[#6689A5]">
                  <Icon size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">
                  {card.description}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ArrowUpRight size={14} />
                  {card.percentage}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* BALANCE SUMMARY */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-[#DCE3E9] bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CircleDollarSign size={18} />
            Available Appropriation
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-800">
            {formatCurrency(totalAppropriation - totalAllotment)}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Appropriation less allotments
          </p>
        </div>

        <div className="rounded-lg border border-[#DCE3E9] bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Wallet size={18} />
            Available Allotment
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-800">
            {formatCurrency(availableAllotment)}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Allotments less obligations
          </p>
        </div>

        <div className="rounded-lg border border-[#DCE3E9] bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={18} />
            Unpaid Obligations
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-800">
            {formatCurrency(unpaidObligations)}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Obligations less disbursements
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-7">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Common budget management transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-3 rounded-lg border border-[#DCE3E9] bg-white p-4 transition hover:border-[#91AEC4] hover:bg-[#F9FBFC]"
              >
                <div className="rounded-md bg-[#EAF1F6] p-3 text-[#6689A5]">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {action.description}
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* LOWER DASHBOARD */}
      <div className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* RECENT TRANSACTIONS */}
        <div className="overflow-hidden rounded-lg border border-[#DCE3E9] bg-white xl:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="font-semibold text-slate-800">
                Recent Transactions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest obligation and disbursement records.
              </p>
            </div>

            <Link
              href="/budget/obligations"
              className="text-xs font-semibold text-[#6689A5] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#F7F9FA] text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Payee</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.reference}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#6689A5]">
                        {transaction.reference}
                      </span>
                      <p className="mt-1 text-xs text-slate-400">
                        {transaction.type}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {transaction.payee}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {transaction.date}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-slate-700">
                      {formatCurrency(transaction.amount)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          transaction.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : transaction.status === "Paid"
                              ? "bg-blue-50 text-blue-700"
                              : transaction.status === "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            Displaying sample transaction records.
          </div>
        </div>
      </div>
    </div>
  );
}
