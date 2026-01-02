import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientWithStats {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string | null;
  created_at: string;
  total_billed: number;
  last_activity: string | null;
}

export function useClients() {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<ClientWithStats[]> => {
      // Fetch clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;
      if (!clients) return [];

      // Fetch all invoices for total billed calculation
      const { data: invoices } = await supabase
        .from("invoices")
        .select("client_id, amount, status");

      // Calculate totals per client
      const billedByClient = invoices?.reduce((acc, inv) => {
        if (inv.status === "paid") {
          acc[inv.client_id] = (acc[inv.client_id] || 0) + Number(inv.amount);
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return clients.map((client) => ({
        ...client,
        total_billed: billedByClient[client.id] || 0,
        last_activity: client.updated_at,
      }));
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (newClient: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
      source?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: newClient.name,
          email: newClient.email || null,
          phone: newClient.phone || null,
          company: newClient.company || null,
          source: newClient.source || null,
          status: newClient.status || "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create client: ${error.message}`);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });

  // Calculate stats
  const clients = clientsQuery.data || [];
  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.total_billed, 0);

  return {
    clients,
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    stats: {
      total: clients.length,
      active: activeClients,
      totalRevenue,
    },
    createClient: createClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isCreating: createClientMutation.isPending,
  };
}
