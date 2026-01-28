import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { TransactionAttachment } from "@/types/domain";

export function useAttachments(transactionId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["attachments", transactionId],
    queryFn: async (): Promise<TransactionAttachment[]> => {
      if (!user || !transactionId) return [];

      const { data, error } = await supabase
        .from("transaction_attachments")
        .select("*")
        .eq("transaction_id", transactionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TransactionAttachment[];
    },
    enabled: !!user && !!transactionId,
  });
}

export function useUploadAttachment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      file,
    }: {
      transactionId: string;
      file: File;
    }): Promise<TransactionAttachment> => {
      if (!user) throw new Error("Not authenticated");

      // Generate unique file path: userId/transactionId/timestamp-filename
      const timestamp = Date.now();
      const filePath = `${user.id}/${transactionId}/${timestamp}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { data, error: dbError } = await supabase
        .from("transaction_attachments")
        .insert({
          transaction_id: transactionId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data as TransactionAttachment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", variables.transactionId],
      });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      filePath: string;
      transactionId: string;
    }): Promise<void> => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove([params.filePath]);

      if (storageError) throw storageError;

      // Delete database record
      const { error: dbError } = await supabase
        .from("transaction_attachments")
        .delete()
        .eq("id", params.id);

      if (dbError) throw dbError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", variables.transactionId],
      });
    },
  });
}

export function getAttachmentUrl(filePath: string): Promise<string> {
  return (async (): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("attachments")
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  })();
}
