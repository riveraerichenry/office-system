type Props = {
  status: string;
};

export default function StatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    AVAILABLE:
      "bg-green-100 text-green-700",

    ISSUED:
      "bg-orange-100 text-orange-700",

    LIQUIDATED:
      "bg-purple-100 text-purple-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    ARCHIVED:
      "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}