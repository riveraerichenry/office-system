"use client";

import {
  FileText,
  CheckCircle2,
  Clock3,
  Package,
} from "lucide-react";

type Props = {
  rows: any[];
};

export default function RISStats({ rows }: Props) {
  const total = rows.length;

  const approved = rows.filter(
    (r) => r.status === "APPROVED"
  ).length;

  const pending = rows.filter(
    (r) =>
      r.status === "PENDING" ||
      r.status === "SUBMITTED"
  ).length;

  const issued = rows.filter(
    (r) => r.status === "ISSUED"
  ).length;

  const cards = [
    {
      title: "Total RIS",
      value: total,
      icon: FileText,
      bg: "bg-blue-50",
      iconBg: "bg-blue-600",
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle2,
      bg: "bg-green-50",
      iconBg: "bg-green-600",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      bg: "bg-amber-50",
      iconBg: "bg-amber-600",
    },
    {
      title: "Issued",
      value: issued,
      icon: Package,
      bg: "bg-purple-50",
      iconBg: "bg-purple-600",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`rounded-xl border ${card.bg} p-5 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {card.value}
                </h2>
              </div>

              <div
                className={`rounded-xl ${card.iconBg} p-3 text-white`}
              >
                <Icon size={28} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}