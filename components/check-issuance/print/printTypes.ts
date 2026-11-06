
export type CheckPrintDetails = {
  check_date: string | null;
  payee: string;
  total_amount: number | string;
  bank_code: string | null;
  signatory_1_name?: string | null;
  signatory_1_position?: string | null;
  signatory_2_name?: string | null;
  signatory_2_position?: string | null;
};

export function formatPrintDate(value: string | null): string {
  if (!value) return "";

  const datePart = value.substring(0, 10);
  const parts = datePart.split("-");

  if (parts.length !== 3) return value;

  const [year, month, day] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

export function numberToWords(value: number): string {
  const ones = [
    "Zero", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
    "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convert(num: number): string {
    if (num < 20) return ones[num];

    if (num < 100) {
      return tens[Math.floor(num / 10)] +
        (num % 10 ? " " + ones[num % 10] : "");
    }

    if (num < 1000) {
      return ones[Math.floor(num / 100)] + " Hundred" +
        (num % 100 ? " " + convert(num % 100) : "");
    }

    const units = [
      { value: 1_000_000_000, label: "Billion" },
      { value: 1_000_000, label: "Million" },
      { value: 1000, label: "Thousand" },
    ];

    for (const unit of units) {
      if (num >= unit.value) {
        return convert(Math.floor(num / unit.value)) +
          " " + unit.label +
          (num % unit.value ? " " + convert(num % unit.value) : "");
      }
    }

    return String(num);
  }

  const safe = Number.isFinite(value) ? Math.abs(value) : 0;
  const centsTotal = Math.round(safe * 100);
  const pesos = Math.floor(centsTotal / 100);
  const centavos = centsTotal % 100;

  let result = convert(pesos) + " Pesos";

  if (centavos > 0) {
    result += " and " + convert(centavos) + " Centavos";
  }

  return (value < 0 ? "Negative " : "") + result + " Only";
}

export function formatPrintAmount(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
