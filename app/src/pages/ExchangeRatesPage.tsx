import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  useExchangeRates,
  useCreateExchangeRate,
  useUpdateExchangeRate,
  useDeleteExchangeRate,
} from "@/hooks/useExchangeRates";
import { useProfile } from "@/hooks/useProfile";
import { CURRENCY_CODES, getCurrencySymbol } from "@/types/domain";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function ExchangeRatesPage() {
  const { data: rates, isLoading } = useExchangeRates();
  const { data: profile } = useProfile();
  const createRate = useCreateExchangeRate();
  const updateRate = useUpdateExchangeRate();
  const deleteRate = useDeleteExchangeRate();

  const [newCurrency, setNewCurrency] = useState("");
  const [newRate, setNewRate] = useState("");

  const primaryCurrency = profile?.primary_currency ?? "USD";

  // Get currencies not yet added
  const existingCurrencies = new Set(rates?.map((r) => r.currency_code) ?? []);
  existingCurrencies.add(primaryCurrency); // Can't add primary currency
  const availableCurrencies = CURRENCY_CODES.filter(
    (c) => !existingCurrencies.has(c),
  );

  const handleCreate = async () => {
    if (!newCurrency || !newRate) return;
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) return;

    await createRate.mutateAsync({
      currency_code: newCurrency,
      rate_to_primary: rate,
    });
    setNewCurrency("");
    setNewRate("");
  };

  const handleUpdate = async (id: string, value: string) => {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate <= 0) return;
    await updateRate.mutateAsync({ id, rate_to_primary: rate });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this exchange rate?")) {
      await deleteRate.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Exchange Rates</h1>
        <p className="text-zinc-400">
          Set conversion rates to {primaryCurrency} (your primary currency)
        </p>
      </div>

      {/* Add new rate */}
      <Card className="border-zinc-800 bg-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">Add Currency Rate</CardTitle>
          <CardDescription>
            Enter how much 1 unit of the currency equals in {primaryCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="w-40">
              <CurrencySelect
                value={newCurrency}
                onChange={setNewCurrency}
                disabled={availableCurrencies.length === 0}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">1 {newCurrency || "???"} =</span>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="0.0000"
                className="w-32"
              />
              <span className="text-zinc-400">{primaryCurrency}</span>
            </div>
            <Button
              onClick={handleCreate}
              disabled={!newCurrency || !newRate || createRate.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing rates */}
      <Card className="border-zinc-800 bg-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">
            Your Rates ({rates?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!rates || rates.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No exchange rates configured. Add currencies you use for debts.
            </p>
          ) : (
            <div className="space-y-3">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex flex-wrap items-center gap-4 rounded-lg bg-zinc-700/30 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white">
                      {getCurrencySymbol(rate.currency_code)}
                    </span>
                    <span className="text-zinc-400">{rate.currency_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">
                      1 {rate.currency_code} =
                    </span>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      defaultValue={rate.rate_to_primary}
                      onBlur={(e) => handleUpdate(rate.id, e.target.value)}
                      className="w-32"
                    />
                    <span className="text-zinc-400">{primaryCurrency}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rate.id)}
                    disabled={deleteRate.isPending}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-zinc-700 bg-zinc-800/30">
        <CardContent className="pt-6">
          <p className="text-sm text-zinc-400">
            <strong className="text-zinc-300">💡 Tip:</strong> Exchange rates
            are used for the "shadow text" feature—showing converted values in
            your primary currency. Update rates periodically or use your own
            fixed rates for stability.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
