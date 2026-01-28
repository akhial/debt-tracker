import type { Tables, TablesInsert } from "@/lib/database.types";

// Database row types
export type Profile = Tables<"profiles">;
export type ExchangeRate = Tables<"exchange_rates">;
export type Person = Tables<"people">;
export type Transaction = Tables<"transactions">;
export type TransactionAttachment = Tables<"transaction_attachments">;

// Insert types
export type NewExchangeRate = TablesInsert<"exchange_rates">;
export type NewPerson = TablesInsert<"people">;
export type NewTransaction = TablesInsert<"transactions">;
export type NewTransactionAttachment = TablesInsert<"transaction_attachments">;

// Transaction types enum
export const TransactionType = {
  DEBT: "DEBT",
  REPAYMENT: "REPAYMENT",
} as const;

export type TransactionTypeValue =
  (typeof TransactionType)[keyof typeof TransactionType];

// Calculated balance types
export interface CurrencyBalance {
  currencyCode: string;
  amount: number;
  convertedAmount: number; // In primary currency
}

export interface PersonBalance {
  person: Person;
  balancesByCurrency: CurrencyBalance[];
  totalInPrimaryCurrency: number;
}

// Transaction with person details for display
export interface TransactionWithPerson extends Transaction {
  person: Person;
}

// Common currency codes
export const CURRENCY_CODES = ["USD", "EUR", "DZD"] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

// Currency display info
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  DZD: "د.ج",
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? "-" : "";
  return `${sign}${symbol}${formatted}`;
}
