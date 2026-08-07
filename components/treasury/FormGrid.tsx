import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function FormGrid({
  children,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {children}
    </div>
  );
}