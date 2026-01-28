import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { ExchangeRate, NewExchangeRate } from "@/types/domain";

export function useExchangeRates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exchangeRates", user?.id],
    queryFn: async (): Promise<ExchangeRate[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("user_id", user.id)
        .order("currency_code");

      if (error) throw error;
      return (data ?? []) as ExchangeRate[];
    },
    enabled: !!user,
  });
}

export function useExchangeRatesMap() {
  const { data: rates } = useExchangeRates();

  // Create a map of currency_code -> rate_to_primary
  const ratesMap = new Map<string, number>();
  rates?.forEach((rate) => {
    ratesMap.set(rate.currency_code, rate.rate_to_primary);
  });

  return ratesMap;
}

export function useCreateExchangeRate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      rate: Omit<NewExchangeRate, "user_id">,
    ): Promise<ExchangeRate> => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("exchange_rates")
        .insert({ ...rate, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as ExchangeRate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
    },
  });
}

export function useUpdateExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      rate_to_primary,
    }: {
      id: string;
      rate_to_primary: number;
    }): Promise<ExchangeRate> => {
      const { data, error } = await supabase
        .from("exchange_rates")
        .update({ rate_to_primary })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ExchangeRate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
    },
  });
}

export function useDeleteExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("exchange_rates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
    },
  });
}
