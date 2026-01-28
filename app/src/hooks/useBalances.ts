import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useExchangeRatesMap } from "./useExchangeRates";
import { useProfile } from "./useProfile";
import { usePeople } from "./usePeople";
import type { PersonBalance, CurrencyBalance } from "@/types/domain";

export function useBalances() {
  const { data: transactions } = useTransactions();
  const { data: profile } = useProfile();
  const { data: people } = usePeople();
  const ratesMap = useExchangeRatesMap();

  const balances = useMemo((): PersonBalance[] => {
    if (!transactions || !people || !profile) return [];

    const primaryCurrency = profile.primary_currency;

    // Group transactions by person
    const byPerson = new Map<
      string,
      { debts: Map<string, number>; repayments: Map<string, number> }
    >();

    transactions.forEach((tx) => {
      if (!byPerson.has(tx.person_id)) {
        byPerson.set(tx.person_id, { debts: new Map(), repayments: new Map() });
      }
      const personData = byPerson.get(tx.person_id)!;
      const targetMap =
        tx.type === "DEBT" ? personData.debts : personData.repayments;
      const current = targetMap.get(tx.currency_code) ?? 0;
      targetMap.set(tx.currency_code, current + tx.amount);
    });

    // Calculate balances for each person
    return people.map((person): PersonBalance => {
      const personData = byPerson.get(person.id);
      const balancesByCurrency: CurrencyBalance[] = [];
      let totalInPrimaryCurrency = 0;

      if (personData) {
        // Get all currencies involved
        const currencies = new Set([
          ...personData.debts.keys(),
          ...personData.repayments.keys(),
        ]);

        currencies.forEach((currency) => {
          const debts = personData.debts.get(currency) ?? 0;
          const repayments = personData.repayments.get(currency) ?? 0;
          const amount = debts - repayments;

          if (Math.abs(amount) > 0.01) {
            // Get conversion rate
            let rate = 1;
            if (currency !== primaryCurrency) {
              rate = ratesMap.get(currency) ?? 1;
            }
            const convertedAmount = amount * rate;

            balancesByCurrency.push({
              currencyCode: currency,
              amount,
              convertedAmount,
            });

            totalInPrimaryCurrency += convertedAmount;
          }
        });
      }

      return {
        person,
        balancesByCurrency,
        totalInPrimaryCurrency,
      };
    });
  }, [transactions, people, profile, ratesMap]);

  // Sort by total outstanding (descending by absolute value)
  const sortedBalances = useMemo(() => {
    return [...balances].sort(
      (a, b) =>
        Math.abs(b.totalInPrimaryCurrency) - Math.abs(a.totalInPrimaryCurrency),
    );
  }, [balances]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.totalInPrimaryCurrency, 0);
  }, [balances]);

  return {
    balances: sortedBalances,
    grandTotal,
    primaryCurrency: profile?.primary_currency ?? "USD",
    isLoading: !transactions || !people || !profile,
  };
}
