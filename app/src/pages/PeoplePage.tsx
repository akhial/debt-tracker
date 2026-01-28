import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import {
  usePeople,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
} from "@/hooks/usePeople";
import { useBalances } from "@/hooks/useBalances";
import { formatCurrency } from "@/types/domain";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function PeoplePage() {
  const { data: people, isLoading } = usePeople();
  const { balances, primaryCurrency } = useBalances();
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const deletePerson = useDeletePerson();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createPerson.mutateAsync({ name: newName.trim() });
    setNewName("");
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    await updatePerson.mutateAsync({ id, name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id: string) => {
    if (
      confirm("Delete this person? Their transactions will also be deleted.")
    ) {
      await deletePerson.mutateAsync(id);
    }
  };

  const getBalance = (personId: string) => {
    const balance = balances.find((b) => b.person.id === personId);
    return balance?.totalInPrimaryCurrency ?? 0;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">People</h1>
          <p className="text-zinc-400">Manage your contacts</p>
        </div>
      </div>

      {/* Add new person */}
      <Card className="border-zinc-800 bg-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">Add Person</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name..."
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="flex-1"
            />
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || createPerson.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* People list */}
      <Card className="border-zinc-800 bg-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">
            All People ({people?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!people || people.length === 0 ? (
            <p className="text-sm text-zinc-500">No people added yet</p>
          ) : (
            <div className="space-y-2">
              {people.map((person) => {
                const balance = getBalance(person.id);
                const isEditing = editingId === person.id;

                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-700/30 p-4"
                  >
                    {isEditing ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="mr-3 flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdate(person.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdate(person.id)}
                            disabled={updatePerson.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium text-white">
                            {person.name}
                          </p>
                          <p
                            className={`text-sm ${balance >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {balance === 0
                              ? "No balance"
                              : balance > 0
                                ? `Owes you ${formatCurrency(balance, primaryCurrency)}`
                                : `You owe ${formatCurrency(Math.abs(balance), primaryCurrency)}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(person.id);
                              setEditingName(person.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(person.id)}
                            disabled={deletePerson.isPending}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
