export function formatDate(
  date?: string | Date | null
) {
  if (!date) return "-";

  const parsed =
    new Date(date);

  if (
    isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );
}