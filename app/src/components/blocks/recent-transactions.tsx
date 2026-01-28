import { useTransactions } from "@/hooks/useTransactions";
import { ShadowTextInline } from "@/components/ui/ShadowText";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentTransactions() {
  const { data: transactions } = useTransactions();

  const recentTransactions = transactions?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div>
                  <p className="font-medium">{tx.person.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.type === "DEBT" ? "owes you" : "repaid"} •{" "}
                    {new Date(tx.incurred_date).toLocaleDateString()}
                  </p>
                </div>
                <ShadowTextInline
                  amount={tx.amount}
                  currencyCode={tx.currency_code}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
