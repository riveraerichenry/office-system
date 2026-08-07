import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function FormSection({
  title,
  description,
  children,
}: Props) {
  return (
    <div className="space-y-4 rounded-xl border p-5">

      <div>

        <h3 className="font-semibold text-slate-800">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}

      </div>

      {children}

    </div>
  );
}