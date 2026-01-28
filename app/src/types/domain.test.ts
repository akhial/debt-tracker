import { describe, expect, test } from "bun:test";
import { getCurrencySymbol, formatCurrency, CURRENCY_SYMBOLS } from "./domain";

describe("getCurrencySymbol", () => {
  test("returns $ for USD", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
  });

  test("returns € for EUR", () => {
    expect(getCurrencySymbol("EUR")).toBe("€");
  });

  test("returns د.ج for DZD", () => {
    expect(getCurrencySymbol("DZD")).toBe("د.ج");
  });

  test("returns code itself for unknown currency", () => {
    expect(getCurrencySymbol("XYZ")).toBe("XYZ");
  });
});

describe("formatCurrency", () => {
  test("formats positive USD amount", () => {
    const result = formatCurrency(100, "USD");
    expect(result).toBe("$100.00");
  });

  test("formats negative USD amount with sign", () => {
    const result = formatCurrency(-50.5, "USD");
    expect(result).toBe("-$50.50");
  });

  test("formats EUR amount", () => {
    const result = formatCurrency(1234.56, "EUR");
    expect(result).toBe("€1,234.56");
  });

  test("formats DZD amount", () => {
    const result = formatCurrency(5000, "DZD");
    expect(result).toBe("د.ج5,000.00");
  });

  test("formats zero correctly", () => {
    const result = formatCurrency(0, "USD");
    expect(result).toBe("$0.00");
  });

  test("formats small decimal amounts", () => {
    const result = formatCurrency(0.01, "USD");
    expect(result).toBe("$0.01");
  });

  test("uses currency code for unknown currency", () => {
    const result = formatCurrency(100, "XYZ");
    expect(result).toBe("XYZ100.00");
  });
});

describe("CURRENCY_SYMBOLS", () => {
  test("contains all supported currencies", () => {
    expect(CURRENCY_SYMBOLS).toHaveProperty("USD");
    expect(CURRENCY_SYMBOLS).toHaveProperty("EUR");
    expect(CURRENCY_SYMBOLS).toHaveProperty("DZD");
  });
});
