import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Toolbar({
  children,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-slate-50 p-4">
      {children}
    </div>
  );
}