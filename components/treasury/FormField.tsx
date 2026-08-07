import { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  children: ReactNode;
};

export default function FormField({
  label,
  required,
  children,
}: Props) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}