type Props = {
  rows?: number;
};

export default function LoadingTable({
  rows = 8,
}: Props) {
  return (
    <div className="divide-y">

      {Array.from({
        length: rows,
      }).map((_, i) => (

        <div
          key={i}
          className="flex gap-4 p-4"
        >

          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />

          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />

        </div>

      ))}

    </div>
  );
}