import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceWithClient {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  client_id: string;
  subscription_id: string;
  client_name: string;
}

export function useInvoices() {
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ["all-invoices"],
    queryFn: async (): Promise<InvoiceWithClient[]> => {
      // Fetch invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;
      if (!invoices) return [];

      // Fetch client names
      const clientIds = [...new Set(invoices.map((i) => i.client_id))];
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds);

      const clientMap = clients?.reduce((acc, c) => {
        acc[c.id] = c.name;
        return acc;
      }, {} as Record<string, string>) || {};

      return invoices.map((invoice) => ({
        ...invoice,
        client_name: clientMap[invoice.client_id] || "Unknown Client",
      }));
    },
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-invoices"] });
      toast.success("Invoice updated");
    },
    onError: (error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });

  // Calculate stats
  const invoices = invoicesQuery.data || [];
  const paidAmount = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const overdueAmount = invoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return {
    invoices,
    isLoading: invoicesQuery.isLoading,
    isError: invoicesQuery.isError,
    stats: {
      total: invoices.length,
      paid: paidAmount,
      overdue: overdueAmount,
      pending: pendingAmount,
      outstanding: overdueAmount + pendingAmount,
    },
    updateStatus: updateInvoiceStatusMutation.mutate,
  };
}
