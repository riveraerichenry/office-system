import { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
};

export default function DetailItem({
  icon,
  label,
  value,
}: Props) {
  return (
    <div className="flex items-start gap-3">

      {icon && (
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          {icon}
        </div>
      )}

      <div>

        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <div className="mt-1 font-semibold text-slate-800">
          {value}
        </div>

      </div>

    </div>
  );
}