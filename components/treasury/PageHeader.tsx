import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  actions,
}: Props) {
  return (
    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-3xl font-bold text-slate-800">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-slate-500">
            {description}
          </p>
        )}

      </div>

      {actions}

    </div>
  );
}