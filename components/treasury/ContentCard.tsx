import { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
};

export default function ContentCard({
  title,
  children,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      {title && (
        <div className="border-b px-6 py-4">

          <h2 className="font-semibold text-slate-800">
            {title}
          </h2>

        </div>
      )}

      <div className="p-6">
        {children}
      </div>

    </div>
  );
}