import { ArrowUpRight, ArrowDownRight, TrendingUp, Users } from "lucide-react";
import { useBalances } from "@/hooks/useBalances";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/types/domain";
import { ShadowTextInline } from "@/components/ui/ShadowText";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function Dashboard() {
  const { balances, grandTotal, primaryCurrency, isLoading } = useBalances();
  const { data: transactions } = useTransactions();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const recentTransactions = transactions?.slice(0, 5) ?? [];
  const peopleWithBalance = balances.filter(
    (b) => Math.abs(b.totalInPrimaryCurrency) > 0.01,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">
          Overview of your debts in {primaryCurrency}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Net Balance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${grandTotal >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {formatCurrency(grandTotal, primaryCurrency)}
            </div>
            <p className="text-xs text-zinc-500">
              {grandTotal >= 0 ? "You are owed" : "You owe"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Money Owed to You
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(
                balances
                  .filter((b) => b.totalInPrimaryCurrency > 0)
                  .reduce((sum, b) => sum + b.totalInPrimaryCurrency, 0),
                primaryCurrency,
              )}
            </div>
            <p className="text-xs text-zinc-500">From others</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Money You Owe
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(
                Math.abs(
                  balances
                    .filter((b) => b.totalInPrimaryCurrency < 0)
                    .reduce((sum, b) => sum + b.totalInPrimaryCurrency, 0),
                ),
                primaryCurrency,
              )}
            </div>
            <p className="text-xs text-zinc-500">To others</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              People
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {peopleWithBalance.length}
            </div>
            <p className="text-xs text-zinc-500">With outstanding balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Two columns: People with balance + Recent transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* People with Balance */}
        <Card className="border-zinc-800 bg-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white">Outstanding by Person</CardTitle>
          </CardHeader>
          <CardContent>
            {peopleWithBalance.length === 0 ? (
              <p className="text-sm text-zinc-500">No outstanding balances</p>
            ) : (
              <div className="space-y-3">
                {peopleWithBalance.slice(0, 6).map((balance) => (
                  <div
                    key={balance.person.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-700/30 p-3"
                  >
                    <span className="font-medium text-white">
                      {balance.person.name}
                    </span>
                    <span
                      className={`font-semibold ${balance.totalInPrimaryCurrency >= 0 ? "text-green-400" : "text-red-400"}`}
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

        {/* Recent Transactions */}
        <Card className="border-zinc-800 bg-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-zinc-500">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-700/30 p-3"
                  >
                    <div>
                      <p className="font-medium text-white">{tx.person.name}</p>
                      <p className="text-xs text-zinc-500">
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
      </div>
    </div>
  );
}
