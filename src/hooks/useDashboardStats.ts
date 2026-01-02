import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Fetch clients count
      const { count: totalClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      const { count: activeClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("amount, status, created_at");

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const openInvoices = invoices
        ?.filter((i) => i.status === "pending" || i.status === "overdue")
        .reduce((sum, i) => sum + Number(i.amount), 0) || 0;

      const revenueThisMonth = invoices
        ?.filter((i) => {
          const createdAt = new Date(i.created_at);
          return i.status === "paid" && createdAt >= startOfMonth;
        })
        .reduce((sum, i) => sum + Number(i.amount), 0) || 0;

      // Fetch pending reminders count (subscriptions with upcoming payments)
      const { count: pendingReminders } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("active", true);

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        openInvoices,
        revenueThisMonth,
        pendingReminders: pendingReminders || 0,
      };
    },
  });
}
