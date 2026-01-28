import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Person, NewPerson } from "@/types/domain";

export function usePeople() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["people", user?.id],
    queryFn: async (): Promise<Person[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return (data ?? []) as Person[];
    },
    enabled: !!user,
  });
}

export function useCreatePerson() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (person: Omit<NewPerson, "user_id">): Promise<Person> => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("people")
        .insert({ ...person, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
    }: {
      id: string;
      name: string;
    }): Promise<Person> => {
      const { data, error } = await supabase
        .from("people")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("people").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
