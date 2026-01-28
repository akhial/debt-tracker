import { useBalances } from "@/hooks/useBalances";
import { formatCurrency } from "@/types/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OutstandingBalances() {
  const { balances, primaryCurrency } = useBalances();

  const peopleWithBalance = balances.filter(
    (b) => Math.abs(b.totalInPrimaryCurrency) > 0.01,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding by Person</CardTitle>
      </CardHeader>
      <CardContent>
        {peopleWithBalance.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No outstanding balances
          </p>
        ) : (
          <div className="space-y-3">
            {peopleWithBalance.slice(0, 6).map((balance) => (
              <div
                key={balance.person.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <span className="font-medium">{balance.person.name}</span>
                <span
                  className={`font-semibold ${balance.totalInPrimaryCurrency >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {formatCurrency(
                    balance.totalInPrimaryCurrency,
                    primaryCurrency,
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
