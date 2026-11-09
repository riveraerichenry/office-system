
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Wallet,
  FileText,
  Receipt,
  Banknote,
  ChartNoAxesCombined,
  Settings,
  Menu,
  X,
  Building2,
  ClipboardList,
  FileBarChart,
  SlidersHorizontal,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const menuGroups = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/budget",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "BUDGET PREPARATION",
    items: [
      {
        label: "Appropriations",
        href: "/budget/appropriations",
        icon: Landmark,
      },
      {
        label: "Supplemental Appropriations",
        href: "/budget/supplemental_appropriations",
        icon: FolderOpen,
      },
      {
        label: "Budget Adjustments",
        href: "/budget/budget_adjustments",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    title: "BUDGET EXECUTION",
    items: [
      {
        label: "Allotments",
        href: "/budget/allotments",
        icon: Wallet,
      },
      {
        label: "Obligation Requests (OBR)",
        href: "/budget/obligations",
        icon: FileText,
      },
    ],
  },
  {
    title: "DISBURSEMENT",
    items: [
      {
        label: "Disbursement Vouchers",
        href: "/budget/disbursement_vouchers",
        icon: Receipt,
      },
      {
        label: "Disbursement Transactions",
        href: "/budget/disbursement_transactions",
        icon: ClipboardList,
      },
      {
        label: "Payments",
        href: "/budget/payments",
        icon: Banknote,
      },
    ],
  },
  {
    title: "REPORTS",
    items: [
      {
        label: "Budget Utilization",
        href: "/budget/reports/utilization",
        icon: ChartNoAxesCombined,
      },
      {
        label: "Appropriations Summary",
        href: "/budget/reports/appropriations",
        icon: FileBarChart,
      },
      {
        label: "Disbursement Summary",
        href: "/budget/reports/disbursements",
        icon: FileText,
      },
    ],
  },
];

const settingsItems = [
  {
    label: "Offices",
    href: "/budget/offices",
    icon: Building2,
  },
  {
    label: "Fund Sources",
    href: "/budget/fund_sources",
    icon: Landmark,
  },
  
  {
    label: "Categories and Expense Accounts",
    href: "/budget/accounts",
    icon: FolderOpen,
  },
];

interface BudgetSidebarProps {
  children: React.ReactNode;
}

export default function BudgetSidebar({
  children,
}: BudgetSidebarProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/budget") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(href + "/")
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7F9]">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#DCE3E9] bg-[#F8FAFC]
          transition-all duration-200
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${collapsed ? "lg:w-[76px]" : "lg:w-[265px]"}
          ${
            mobileOpen
              ? "translate-x-0 w-[265px]"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* BRAND */}
        <div className="flex h-[68px] items-center justify-between border-b border-[#DCE3E9] px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#6689A5] text-white">
              <Landmark size={21} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h2 className="whitespace-nowrap text-sm font-bold text-slate-800">
                  BUDGET MANAGEMENT
                </h2>
                <p className="text-[10px] tracking-wide text-slate-500">
                  FINANCIAL MANAGEMENT
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-slate-500 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">

          {/* MAIN MENU GROUPS */}
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-5">

              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex min-h-[39px] items-center gap-3 rounded-md
                        px-3 py-2 text-[13px] transition
                        ${
                          active
                            ? "bg-[#E3EDF4] font-semibold text-[#476C89]"
                            : "text-slate-600 hover:bg-[#EDF2F6] hover:text-slate-800"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                    >
                      <Icon size={17} className="shrink-0" />

                      {!collapsed && (
                        <span className="leading-5">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* SETTINGS */}
          <div className="mb-5">

            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400">
                SETTINGS
              </p>
            )}

            <div className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex min-h-[39px] items-center gap-3 rounded-md
                      px-3 py-2 text-[13px] transition
                      ${
                        active
                          ? "bg-[#E3EDF4] font-semibold text-[#476C89]"
                          : "text-slate-600 hover:bg-[#EDF2F6] hover:text-slate-800"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                  >
                    <Icon size={17} className="shrink-0" />

                    {!collapsed && (
                      <span className="leading-5">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* FOOTER */}
        <div className="border-t border-[#DCE3E9] p-3">
          <div
            className={`
              flex items-center gap-3 rounded-md bg-[#EDF2F6] p-3
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <Settings size={17} className="shrink-0 text-slate-500" />

            {!collapsed && (
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Budget Administration
                </p>
                <p className="text-[10px] text-slate-500">
                  System configuration
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-11 items-center justify-center border-t border-[#DCE3E9] text-slate-500 hover:bg-[#EDF2F6] lg:flex"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#DCE3E9] bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="text-slate-600 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Budget Management System
              </p>
              <p className="text-[11px] text-slate-400">
                Office System / Budget
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">
              Fiscal Year 2026
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E3EDF4] text-xs font-bold text-[#476C89]">
              AD
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
