export type CurrencyCode = "NGN" | "USD" | "GHS" | "KES";

export const DEFAULT_CURRENCY: CurrencyCode = "NGN";

export const currencies: { value: CurrencyCode; label: string }[] = [
  { value: "NGN", label: "NGN — Nigerian naira" },
  { value: "USD", label: "USD — US dollar" },
  { value: "GHS", label: "GHS — Ghanaian cedi" },
  { value: "KES", label: "KES — Kenyan shilling" },
];

export function formatCurrency(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}
