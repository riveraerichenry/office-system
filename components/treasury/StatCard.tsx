import { ReactNode } from "react";

type Props = {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color,
}: Props) {
  return (
    <div
      className={`rounded-2xl ${color} p-6 text-white shadow`}
    >
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm opacity-90">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            {value}
          </h2>

        </div>

        {icon}

      </div>
    </div>
  );
}