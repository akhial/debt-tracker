import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useExchangeRatesMap } from "./useExchangeRates";
import { useProfile } from "./useProfile";
import { usePeople } from "./usePeople";
import {
  calculatePersonBalances,
  sortBalancesByTotal,
  calculateGrandTotal,
  type TransactionData,
} from "@/lib/balances";

export function useBalances() {
  const { data: transactions } = useTransactions();
  const { data: profile } = useProfile();
  const { data: people } = usePeople();
  const ratesMap = useExchangeRatesMap();

  const balances = useMemo(() => {
    if (!transactions || !people || !profile) return [];

    const primaryCurrency = profile.primary_currency;
    return calculatePersonBalances(
      transactions as TransactionData[],
      people,
      primaryCurrency,
      ratesMap,
    );
  }, [transactions, people, profile, ratesMap]);

  // Sort by total outstanding (descending by absolute value)
  const sortedBalances = useMemo(() => {
    return sortBalancesByTotal(balances);
  }, [balances]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return calculateGrandTotal(balances);
  }, [balances]);

  return {
    balances: sortedBalances,
    grandTotal,
    primaryCurrency: profile?.primary_currency ?? "USD",
    isLoading: !transactions || !people || !profile,
  };
}
