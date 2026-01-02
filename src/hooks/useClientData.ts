import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client, Subscription, Invoice, Asset, ClientData } from "@/types/database";
import { toast } from "sonner";

export function useClientData(clientId: string | undefined) {
  const queryClient = useQueryClient();

  const clientQuery = useQuery({
    queryKey: ["client", clientId],
    queryFn: async (): Promise<Client | null> => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", clientId],
    queryFn: async (): Promise<Subscription | null> => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices", clientId],
    queryFn: async (): Promise<Invoice[]> => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  const assetsQuery = useQuery({
    queryKey: ["assets", clientId],
    queryFn: async (): Promise<Asset[]> => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  const updateClientMutation = useMutation({
    mutationFn: async (updates: Partial<Client>) => {
      if (!clientId) throw new Error("No client ID");
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", clientId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      toast.success("Client updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update client: ${error.message}`);
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (updates: Partial<Subscription>) => {
      if (!clientId) throw new Error("No client ID");
      
      // Check if subscription exists
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("client_id", clientId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("subscriptions")
          .update(updates)
          .eq("client_id", clientId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("subscriptions")
          .insert({ client_id: clientId, ...updates })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["subscription", clientId] });
      const previous = queryClient.getQueryData(["subscription", clientId]);
      queryClient.setQueryData(["subscription", clientId], (old: Subscription | null) => 
        old ? { ...old, ...updates } : { client_id: clientId, ...updates }
      );
      return { previous };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(["subscription", clientId], context?.previous);
      toast.error(`Failed to update subscription: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", clientId] });
    },
    onSuccess: () => {
      toast.success("Subscription updated");
    },
  });

  const uploadAssetMutation = useMutation({
    mutationFn: async ({ file, bucket }: { file: File; bucket: "client-assets" | "voice-notes" }) => {
      if (!clientId) throw new Error("No client ID");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${clientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const assetType = file.type.startsWith("image/") ? "image" 
        : file.type.includes("pdf") ? "pdf" 
        : file.type.startsWith("audio/") ? "audio" 
        : "document";

      const { data, error } = await supabase
        .from("assets")
        .insert({
          client_id: clientId,
          name: file.name,
          type: assetType,
          size: file.size,
          file_url: publicUrl,
          bucket_path: `${bucket}/${fileName}`,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", clientId] });
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (asset: Asset) => {
      const [bucket, ...pathParts] = asset.bucket_path.split("/");
      const filePath = pathParts.join("/");
      
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (storageError) throw storageError;

      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", clientId] });
      toast.success("Asset deleted");
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const clientData: ClientData = {
    client: clientQuery.data ?? null,
    subscription: subscriptionQuery.data ?? null,
    invoices: invoicesQuery.data ?? [],
    assets: assetsQuery.data ?? [],
  };

  return {
    data: clientData,
    isLoading: clientQuery.isLoading || subscriptionQuery.isLoading || invoicesQuery.isLoading || assetsQuery.isLoading,
    isError: clientQuery.isError || subscriptionQuery.isError || invoicesQuery.isError || assetsQuery.isError,
    updateClient: updateClientMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    uploadAsset: uploadAssetMutation.mutate,
    deleteAsset: deleteAssetMutation.mutate,
    isUpdatingClient: updateClientMutation.isPending,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,
    isUploadingAsset: uploadAssetMutation.isPending,
  };
}
