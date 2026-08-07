import { Inbox } from "lucide-react";

type Props = {
  title: string;
  description: string;
};

export default function EmptyState({
  title,
  description,
}: Props) {
  return (
    <div className="py-16 text-center">

      <Inbox
        className="mx-auto mb-5 text-slate-400"
        size={48}
      />

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-slate-500">
        {description}
      </p>

    </div>
  );
}