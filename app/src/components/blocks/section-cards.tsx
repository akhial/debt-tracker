import {
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";

import { useBalances } from "@/hooks/useBalances";
import { formatCurrency } from "@/types/domain";
import { Badge } from "@/components/ui/badge/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  const { balances, grandTotal, primaryCurrency } = useBalances();

  const owedToYou = balances
    .filter((b) => b.totalInPrimaryCurrency > 0)
    .reduce((sum, b) => sum + b.totalInPrimaryCurrency, 0);

  const youOwe = Math.abs(
    balances
      .filter((b) => b.totalInPrimaryCurrency < 0)
      .reduce((sum, b) => sum + b.totalInPrimaryCurrency, 0),
  );

  const peopleWithBalance = balances.filter(
    (b) => Math.abs(b.totalInPrimaryCurrency) > 0.01,
  );

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 lg:px-6 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Net Balance</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${grandTotal >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {formatCurrency(grandTotal, primaryCurrency)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconWallet className="size-4" />
              {grandTotal >= 0 ? "Net positive" : "Net negative"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {grandTotal >= 0 ? "You are owed" : "You owe"}{" "}
            {grandTotal >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Overview in {primaryCurrency}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Money Owed to You</CardDescription>
          <CardTitle className="text-2xl font-semibold text-green-500 tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(owedToYou, primaryCurrency)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="size-4" />
              Receivables
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            From others <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Pending collection</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Money You Owe</CardDescription>
          <CardTitle className="text-2xl font-semibold text-red-500 tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(youOwe, primaryCurrency)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown className="size-4" />
              Payables
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            To others <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Pending payment</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>People</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {peopleWithBalance.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            With outstanding balance
          </div>
          <div className="text-muted-foreground">Across all currencies</div>
        </CardFooter>
      </Card>
    </div>
  );
}
