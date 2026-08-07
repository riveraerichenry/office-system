"use client";

import {
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Props = {
  data: any[];
};

export default function RISApprovalStats({
  data,
}: Props) {

  const pending =
    data.filter(
      (x) => x.status === "PENDING"
    ).length;

  const approved =
    data.filter(
      (x) => x.status === "APPROVED"
    ).length;

  const returned =
    data.filter(
      (x) => x.status === "RETURNED"
    ).length;

  const rejected =
    data.filter(
      (x) => x.status === "REJECTED"
    ).length;

  const cards = [
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color:
        "bg-yellow-500",
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle2,
      color:
        "bg-green-600",
    },
    {
      title: "Returned",
      value: returned,
      icon: ClipboardCheck,
      color:
        "bg-orange-500",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color:
        "bg-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-5">

      {cards.map((card) => {

        const Icon =
          card.icon;

        return (

          <div
            key={card.title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {card.value}
                </h2>

              </div>

              <div
                className={`rounded-xl p-3 text-white ${card.color}`}
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