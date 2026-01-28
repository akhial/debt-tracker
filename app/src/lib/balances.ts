import type { Person, CurrencyBalance, PersonBalance } from "@/types/domain";

export interface TransactionData {
  person_id: string;
  type: "DEBT" | "REPAYMENT";
  currency_code: string;
  amount: number;
}

export function groupTransactionsByPerson(
  transactions: TransactionData[],
): Map<
  string,
  { debts: Map<string, number>; repayments: Map<string, number> }
> {
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

  return byPerson;
}

export function calculateCurrencyBalances(
  personData: { debts: Map<string, number>; repayments: Map<string, number> },
  primaryCurrency: string,
  ratesMap: Map<string, number>,
): { balances: CurrencyBalance[]; total: number } {
  const balancesByCurrency: CurrencyBalance[] = [];
  let totalInPrimaryCurrency = 0;

  const currencies = new Set([
    ...personData.debts.keys(),
    ...personData.repayments.keys(),
  ]);

  currencies.forEach((currency) => {
    const debts = personData.debts.get(currency) ?? 0;
    const repayments = personData.repayments.get(currency) ?? 0;
    const amount = debts - repayments;

    if (Math.abs(amount) > 0.01) {
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

  return { balances: balancesByCurrency, total: totalInPrimaryCurrency };
}

export function calculatePersonBalances(
  transactions: TransactionData[],
  people: Person[],
  primaryCurrency: string,
  ratesMap: Map<string, number>,
): PersonBalance[] {
  const byPerson = groupTransactionsByPerson(transactions);

  return people.map((person): PersonBalance => {
    const personData = byPerson.get(person.id);

    if (!personData) {
      return {
        person,
        balancesByCurrency: [],
        totalInPrimaryCurrency: 0,
      };
    }

    const { balances, total } = calculateCurrencyBalances(
      personData,
      primaryCurrency,
      ratesMap,
    );

    return {
      person,
      balancesByCurrency: balances,
      totalInPrimaryCurrency: total,
    };
  });
}

export function sortBalancesByTotal(
  balances: PersonBalance[],
): PersonBalance[] {
  return [...balances].sort(
    (a, b) =>
      Math.abs(b.totalInPrimaryCurrency) - Math.abs(a.totalInPrimaryCurrency),
  );
}

export function calculateGrandTotal(balances: PersonBalance[]): number {
  return balances.reduce((sum, b) => sum + b.totalInPrimaryCurrency, 0);
}
