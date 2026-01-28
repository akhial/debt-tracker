import { useBalances } from "@/hooks/useBalances";
import { OutstandingBalances } from "@/components/blocks/outstanding-balances";
import { RecentTransactions } from "@/components/blocks/recent-transactions";
import { SectionCards } from "@/components/blocks/section-cards";
import { Spinner } from "@/components/ui/spinner";

export function Dashboard() {
  const { isLoading } = useBalances();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <>
      <SectionCards />
      <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
        <OutstandingBalances />
        <RecentTransactions />
      </div>
    </>
  );
}
