import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactions";
import { usePeople } from "@/hooks/usePeople";

import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import { PersonSelect } from "@/components/ui/PersonSelect";
import { ShadowTextInline } from "@/components/ui/ShadowText";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: people } = usePeople();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "DEBT" as "DEBT" | "REPAYMENT",
    person_id: "",
    amount: "",
    currency_code: "USD",
    description: "",
    incurred_date: new Date().toISOString().split("T")[0],
  });

  // Filters
  const [filterPerson, setFilterPerson] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  const handleCreate = async () => {
    const amount = parseFloat(formData.amount);
    if (!formData.person_id || isNaN(amount) || amount <= 0) return;

    await createTransaction.mutateAsync({
      type: formData.type,
      person_id: formData.person_id,
      amount,
      currency_code: formData.currency_code,
      description: formData.description || null,
      incurred_date: formData.incurred_date,
    });

    setFormData({
      type: "DEBT",
      person_id: "",
      amount: "",
      currency_code: "USD",
      description: "",
      incurred_date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this transaction?")) {
      await deleteTransaction.mutateAsync(id);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions?.filter((tx) => {
    if (filterPerson && tx.person_id !== filterPerson) return false;
    if (filterType && tx.type !== filterType) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Track debts and repayments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Add transaction form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select
                  value={formData.type}
                  onValueChange={(v) => {
                    if (v !== null)
                      setFormData({
                        ...formData,
                        type: v as "DEBT" | "REPAYMENT",
                      });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBT">Debt (they owe me)</SelectItem>
                    <SelectItem value="REPAYMENT">Repayment</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Person</FieldLabel>
                <PersonSelect
                  value={formData.person_id}
                  onChange={(v) => setFormData({ ...formData, person_id: v })}
                />
              </Field>

              <Field>
                <FieldLabel>Amount</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </Field>

              <Field>
                <FieldLabel>Currency</FieldLabel>
                <CurrencySelect
                  value={formData.currency_code}
                  onChange={(v) =>
                    setFormData({ ...formData, currency_code: v })
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Date</FieldLabel>
                <Input
                  type="date"
                  value={formData.incurred_date}
                  onChange={(e) =>
                    setFormData({ ...formData, incurred_date: e.target.value })
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Description (optional)</FieldLabel>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What is this for?"
                />
              </Field>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={createTransaction.isPending}
              >
                Create Transaction
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div className="w-48">
            <Select
              value={filterPerson}
              onValueChange={(v) => {
                if (v !== null) setFilterPerson(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All people" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All people</SelectItem>
                {people?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select
              value={filterType}
              onValueChange={(v) => {
                if (v !== null) setFilterType(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="DEBT">Debts only</SelectItem>
                <SelectItem value="REPAYMENT">Repayments only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(filterPerson || filterType) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterPerson("");
                setFilterType("");
              }}
            >
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Transactions list */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transactions ({filteredTransactions?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredTransactions || filteredTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transactions found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg bg-muted p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${tx.type === "DEBT" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}
                      >
                        {tx.type}
                      </span>
                      <span className="font-medium">{tx.person.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(tx.incurred_date).toLocaleDateString()}
                      </span>
                      {tx.description && (
                        <>
                          <span>•</span>
                          <span className="truncate">{tx.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ShadowTextInline
                      amount={tx.amount}
                      currencyCode={tx.currency_code}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tx.id)}
                      disabled={deleteTransaction.isPending}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
