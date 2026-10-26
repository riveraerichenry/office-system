
"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileBarChart2,
  FolderOpen,
  Landmark,
  ClipboardList,
  FileSpreadsheet,
  Receipt,
  ChevronRight,
  CalendarDays,
  Send,
} from "lucide-react";

import MyRCDReportsModal from "./systemoptionmodal/rcd-reports/MyRCDReportsModal";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSetupBooklet: () => void;
  onGenerateRCD: () => void;
  onMyReports: () => void;
  onDeposits: () => void;
  onRemittance: () => void;
  onSkip: () => void;
  onExcl: () => void;
  onRAAF: () => void;
  onMonthlyReport: () => void;
};

export default function DIPPSystemOptions({
  open,
  setOpen,
  onSetupBooklet,
  onGenerateRCD,
  onMyReports,
  onDeposits,
  onRemittance,
  onSkip,
  onExcl,
  onRAAF,
  onMonthlyReport,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  const [myRCDReportsOpen, setMyRCDReportsOpen] =
    useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open, setOpen]);

  function Item({
    icon,
    title,
    onClick,
  }: {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          onClick();
        }}
        className="flex w-full items-center justify-between border-b border-gray-200 px-4 py-3 text-left transition hover:bg-blue-50"
      >
        <span className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-700">
            {title}
          </span>
        </span>

        <ChevronRight
          size={18}
          className="text-gray-400"
        />
      </button>
    );
  }

  function InactiveItem({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="flex w-full cursor-not-allowed items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 text-left opacity-50"
      >
        <span className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-500">
            {title}
          </span>
        </span>

        <span className="text-xs font-semibold text-gray-400">
          Inactive
        </span>
      </button>
    );
  }

  return (
    <>
      <div
        ref={panelRef}
        className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 items-center"
      >
        {/* SYSTEM OPTIONS PANEL */}
        <div
          className={`overflow-hidden rounded-l-xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 ${
            open
              ? "w-80 opacity-100"
              : "pointer-events-none w-0 opacity-0"
          }`}
        >
          <div className="bg-blue-900 px-5 py-4 text-lg font-bold text-white">
            System Options
          </div>

          {/* GENERATE RCD */}
          <Item
            icon={<FileBarChart2 size={18} />}
            title="Generate RCD Report"
            onClick={onGenerateRCD}
          />

          {/* RCD REMITTANCE - DISABLED */}
          <InactiveItem
            icon={<Send size={18} />}
            title="My RCD Remittance"
          />

          {/* RCD DEPOSITS - DISABLED */}
          <InactiveItem
            icon={<Landmark size={18} />}
            title="My RCD Deposits"
          />

          {/* SKIP REQUESTS - DISABLED */}
          <InactiveItem
            icon={<ClipboardList size={18} />}
            title="My SKIP Requests"
          />

          {/* EXCL TRANSACTIONS - DISABLED */}
          <InactiveItem
            icon={<FileSpreadsheet size={18} />}
            title="My EXCL Transactions"
          />

          {/* RAAF REPORTS - ACTIVE */}
          <Item
            icon={<Receipt size={18} />}
            title="My RAAF Reports"
            onClick={onRAAF}
          />

          {/* RCD REPORTS - ACTIVE */}
          <Item
            icon={<FolderOpen size={18} />}
            title="My RCD Reports"
            onClick={() => {
              onMyReports();
              setMyRCDReportsOpen(true);
            }}
          />

          {/* MONTHLY REPORT - ACTIVE */}
          <Item
            icon={<CalendarDays size={18} />}
            title="Monthly Report"
            onClick={onMonthlyReport}
          />
        </div>

        {/* SIDE TOGGLE */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-40 w-11 items-center justify-center rounded-l-lg bg-yellow-500 font-bold text-white shadow-xl transition hover:bg-yellow-600"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
          aria-label={
            open
              ? "Close System Options"
              : "Open System Options"
          }
        >
          {open ? "Close" : "System Options"}
        </button>
      </div>

      {/* EXISTING RCD REPORTS MODAL */}
      <MyRCDReportsModal
        open={myRCDReportsOpen}
        onClose={() => setMyRCDReportsOpen(false)}
      />
    </>
  );
}
