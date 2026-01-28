import { useExchangeRatesMap } from "@/hooks/useExchangeRates";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, getCurrencySymbol } from "@/types/domain";

interface ShadowTextProps {
  amount: number;
  currencyCode: string;
  className?: string;
}

/**
 * Displays currency amount with a shadow showing the converted primary currency value.
 * Core UX feature for multi-currency debt tracking.
 */
export function ShadowText({
  amount,
  currencyCode,
  className,
}: ShadowTextProps) {
  const { data: profile } = useProfile();
  const ratesMap = useExchangeRatesMap();

  const primaryCurrency = profile?.primary_currency ?? "USD";
  const isPrimaryCurrency = currencyCode === primaryCurrency;

  // Get conversion rate
  let convertedAmount = amount;
  if (!isPrimaryCurrency) {
    const rate = ratesMap.get(currencyCode) ?? 1;
    convertedAmount = amount * rate;
  }

  const mainText = formatCurrency(amount, currencyCode);
  const shadowText = formatCurrency(convertedAmount, primaryCurrency);

  return (
    <div className={className}>
      {/* Main amount */}
      <span className="font-semibold text-white">{mainText}</span>

      {/* Shadow text - only show if different from primary currency */}
      {!isPrimaryCurrency && (
        <span className="ml-2 text-sm text-zinc-500">≈ {shadowText}</span>
      )}
    </div>
  );
}

/**
 * Compact inline version for tables
 */
export function ShadowTextInline({
  amount,
  currencyCode,
}: {
  amount: number;
  currencyCode: string;
}) {
  const { data: profile } = useProfile();
  const ratesMap = useExchangeRatesMap();

  const primaryCurrency = profile?.primary_currency ?? "USD";
  const isPrimaryCurrency = currencyCode === primaryCurrency;

  let convertedAmount = amount;
  if (!isPrimaryCurrency) {
    const rate = ratesMap.get(currencyCode) ?? 1;
    convertedAmount = amount * rate;
  }

  const symbol = getCurrencySymbol(currencyCode);
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? "-" : "";

  return (
    <span className="inline-flex flex-col">
      <span className="font-medium text-white">
        {sign}
        {symbol}
        {formatted}
      </span>
      {!isPrimaryCurrency && (
        <span className="text-xs text-zinc-500">
          ≈ {formatCurrency(convertedAmount, primaryCurrency)}
        </span>
      )}
    </span>
  );
}
