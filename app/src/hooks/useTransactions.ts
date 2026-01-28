import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type {
  Transaction,
  NewTransaction,
  TransactionWithPerson,
} from "@/types/domain";

export function useTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async (): Promise<TransactionWithPerson[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          person:people(*)
        `,
        )
        .eq("user_id", user.id)
        .order("incurred_date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TransactionWithPerson[];
    },
    enabled: !!user,
  });
}

export function useTransaction(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async (): Promise<TransactionWithPerson | null> => {
      if (!user || !id) return null;

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          person:people(*)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as TransactionWithPerson;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      transaction: Omit<NewTransaction, "user_id">,
    ): Promise<Transaction> => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      type?: string;
      person_id?: string;
      amount?: number;
      currency_code?: string;
      description?: string | null;
      incurred_date?: string;
    }): Promise<Transaction> => {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}
