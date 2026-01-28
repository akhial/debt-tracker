import { describe, expect, test } from "bun:test";
import {
  groupTransactionsByPerson,
  calculateCurrencyBalances,
  calculatePersonBalances,
  sortBalancesByTotal,
  calculateGrandTotal,
  type TransactionData,
} from "./balances";
import type { Person } from "@/types/domain";

function createPerson(id: string, name: string): Person {
  return {
    id,
    user_id: "user-1",
    name,
    created_at: new Date().toISOString(),
  };
}

function createTransaction(
  personId: string,
  type: "DEBT" | "REPAYMENT",
  amount: number,
  currency: string = "USD",
): TransactionData {
  return {
    person_id: personId,
    type,
    currency_code: currency,
    amount,
  };
}

describe("groupTransactionsByPerson", () => {
  test("returns empty map for empty transactions", () => {
    const result = groupTransactionsByPerson([]);
    expect(result.size).toBe(0);
  });

  test("groups single debt correctly", () => {
    const transactions = [createTransaction("p1", "DEBT", 100)];
    const result = groupTransactionsByPerson(transactions);

    expect(result.size).toBe(1);
    expect(result.get("p1")?.debts.get("USD")).toBe(100);
    expect(result.get("p1")?.repayments.size).toBe(0);
  });

  test("groups single repayment correctly", () => {
    const transactions = [createTransaction("p1", "REPAYMENT", 50)];
    const result = groupTransactionsByPerson(transactions);

    expect(result.size).toBe(1);
    expect(result.get("p1")?.repayments.get("USD")).toBe(50);
    expect(result.get("p1")?.debts.size).toBe(0);
  });

  test("sums multiple debts for same person and currency", () => {
    const transactions = [
      createTransaction("p1", "DEBT", 100),
      createTransaction("p1", "DEBT", 50),
    ];
    const result = groupTransactionsByPerson(transactions);

    expect(result.get("p1")?.debts.get("USD")).toBe(150);
  });

  test("handles multiple currencies for same person", () => {
    const transactions = [
      createTransaction("p1", "DEBT", 100, "USD"),
      createTransaction("p1", "DEBT", 200, "EUR"),
    ];
    const result = groupTransactionsByPerson(transactions);

    expect(result.get("p1")?.debts.get("USD")).toBe(100);
    expect(result.get("p1")?.debts.get("EUR")).toBe(200);
  });

  test("handles multiple people", () => {
    const transactions = [
      createTransaction("p1", "DEBT", 100),
      createTransaction("p2", "DEBT", 200),
    ];
    const result = groupTransactionsByPerson(transactions);

    expect(result.size).toBe(2);
    expect(result.get("p1")?.debts.get("USD")).toBe(100);
    expect(result.get("p2")?.debts.get("USD")).toBe(200);
  });
});

describe("calculateCurrencyBalances", () => {
  test("calculates net balance (debts - repayments)", () => {
    const personData = {
      debts: new Map([["USD", 100]]),
      repayments: new Map([["USD", 30]]),
    };
    const result = calculateCurrencyBalances(personData, "USD", new Map());

    expect(result.balances).toHaveLength(1);
    expect(result.balances[0].amount).toBe(70);
    expect(result.balances[0].convertedAmount).toBe(70);
    expect(result.total).toBe(70);
  });

  test("handles negative balance (more repayments than debts)", () => {
    const personData = {
      debts: new Map([["USD", 50]]),
      repayments: new Map([["USD", 100]]),
    };
    const result = calculateCurrencyBalances(personData, "USD", new Map());

    expect(result.balances[0].amount).toBe(-50);
    expect(result.total).toBe(-50);
  });

  test("excludes near-zero balances", () => {
    const personData = {
      debts: new Map([["USD", 100]]),
      repayments: new Map([["USD", 99.999]]),
    };
    const result = calculateCurrencyBalances(personData, "USD", new Map());

    expect(result.balances).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  test("applies exchange rate for non-primary currency", () => {
    const personData = {
      debts: new Map([["EUR", 100]]),
      repayments: new Map(),
    };
    const ratesMap = new Map([["EUR", 1.1]]); // 1 EUR = 1.1 USD
    const result = calculateCurrencyBalances(personData, "USD", ratesMap);

    expect(result.balances[0].amount).toBe(100);
    expect(result.balances[0].convertedAmount).toBeCloseTo(110, 2);
    expect(result.total).toBeCloseTo(110, 2);
  });

  test("handles multiple currencies with conversion", () => {
    const personData = {
      debts: new Map([
        ["USD", 100],
        ["EUR", 100],
      ]),
      repayments: new Map(),
    };
    const ratesMap = new Map([["EUR", 1.1]]);
    const result = calculateCurrencyBalances(personData, "USD", ratesMap);

    expect(result.balances).toHaveLength(2);
    expect(result.total).toBe(210); // 100 USD + 110 (100 EUR * 1.1)
  });
});

describe("calculatePersonBalances", () => {
  test("returns zero balances for people with no transactions", () => {
    const people = [createPerson("p1", "Alice")];
    const result = calculatePersonBalances([], people, "USD", new Map());

    expect(result).toHaveLength(1);
    expect(result[0].balancesByCurrency).toHaveLength(0);
    expect(result[0].totalInPrimaryCurrency).toBe(0);
  });

  test("calculates balances for person with transactions", () => {
    const people = [createPerson("p1", "Alice")];
    const transactions = [
      createTransaction("p1", "DEBT", 100),
      createTransaction("p1", "REPAYMENT", 25),
    ];
    const result = calculatePersonBalances(
      transactions,
      people,
      "USD",
      new Map(),
    );

    expect(result[0].totalInPrimaryCurrency).toBe(75);
  });
});

describe("sortBalancesByTotal", () => {
  test("sorts by absolute total descending", () => {
    const balances = [
      {
        person: createPerson("p1", "Alice"),
        balancesByCurrency: [],
        totalInPrimaryCurrency: 50,
      },
      {
        person: createPerson("p2", "Bob"),
        balancesByCurrency: [],
        totalInPrimaryCurrency: -100,
      },
      {
        person: createPerson("p3", "Charlie"),
        balancesByCurrency: [],
        totalInPrimaryCurrency: 75,
      },
    ];

    const result = sortBalancesByTotal(balances);

    expect(result[0].person.name).toBe("Bob"); // |100|
    expect(result[1].person.name).toBe("Charlie"); // |75|
    expect(result[2].person.name).toBe("Alice"); // |50|
  });
});

describe("calculateGrandTotal", () => {
  test("sums all totals", () => {
    const balances = [
      {
        person: createPerson("p1", "Alice"),
        balancesByCurrency: [],
        totalInPrimaryCurrency: 100,
      },
      {
        person: createPerson("p2", "Bob"),
        balancesByCurrency: [],
        totalInPrimaryCurrency: -50,
      },
    ];

    const result = calculateGrandTotal(balances);
    expect(result).toBe(50);
  });

  test("returns 0 for empty balances", () => {
    expect(calculateGrandTotal([])).toBe(0);
  });
});
