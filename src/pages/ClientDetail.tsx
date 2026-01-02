import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientHeader } from "@/components/clients/ClientHeader";
import { ContactInfoCard } from "@/components/clients/ContactInfoCard";
import { AssetManagementCard } from "@/components/clients/AssetManagementCard";
import { BillingCard } from "@/components/clients/BillingCard";
import { useClientData } from "@/hooks/useClientData";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { 
    data, 
    isLoading, 
    updateClient, 
    updateSubscription, 
    uploadAsset, 
    deleteAsset,
    isUploadingAsset 
  } = useClientData(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data.client) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground">Client not found</h2>
            <p className="text-muted-foreground mt-2">The client you're looking for doesn't exist.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleClientUpdate = (updates: { name?: string; source?: string; status?: string }) => {
    updateClient(updates);
  };

  const handleContactUpdate = (contact: { email?: string; phone?: string; address?: string; company?: string; notes?: string }) => {
    updateClient(contact);
  };

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      uploadAsset({ file, bucket: "client-assets" });
    });
  };

  const handleAudioUpload = (blob: Blob, fileName: string) => {
    const file = new File([blob], fileName, { type: blob.type });
    uploadAsset({ file, bucket: "voice-notes" });
  };

  const handleFileDownload = (assetId: string) => {
    const asset = data.assets.find(a => a.id === assetId);
    if (asset) {
      window.open(asset.file_url, "_blank");
    }
  };

  const handleFileDelete = (assetId: string) => {
    const asset = data.assets.find(a => a.id === assetId);
    if (asset) {
      deleteAsset(asset);
    }
  };

  const handleBillingUpdate = (billing: { 
    active?: boolean; 
    amount?: number; 
    currency?: string; 
    cycle?: string; 
    next_payment_date?: string;
  }) => {
    updateSubscription(billing);
  };

  const handleViewInvoice = (invoiceId: string) => {
    console.log("View invoice:", invoiceId);
  };

  // Map asset type from DB to component format
  const mapAssetType = (type: string): "pdf" | "image" | "doc" | "other" => {
    if (type === "pdf") return "pdf";
    if (type === "image") return "image";
    if (type === "document") return "doc";
    return "other";
  };

  // Map assets to the format expected by AssetManagementCard
  const mappedAssets = data.assets
    .filter(a => a.type !== "audio")
    .map(a => ({
      id: a.id,
      name: a.name,
      type: mapAssetType(a.type),
      size: a.size ? `${(a.size / 1024).toFixed(1)} KB` : "Unknown",
      uploadedAt: new Date(a.created_at).toLocaleDateString(),
    }));

  // Get voice notes for ContactInfoCard
  const voiceNotes = data.assets.filter(a => a.type === "audio");

  // Map invoices to the format expected by BillingCard
  const mappedInvoices = data.invoices.map(inv => ({
    id: inv.id,
    date: new Date(inv.created_at).toLocaleDateString(),
    amount: inv.amount,
    status: inv.status as "paid" | "pending" | "overdue",
  }));

  // Map subscription to billing settings format
  const billingSettings = data.subscription ? {
    recurringEnabled: data.subscription.active,
    amount: data.subscription.amount,
    currency: data.subscription.currency,
    cycle: data.subscription.cycle,
    nextPaymentDate: data.subscription.next_payment_date ? new Date(data.subscription.next_payment_date) : undefined,
  } : undefined;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <ClientHeader
          clientName={data.client.name}
          leadSource={data.client.source || ""}
          status={data.client.status as "active" | "archived"}
          onUpdate={handleClientUpdate}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <ContactInfoCard 
              contact={{
                email: data.client.email || "",
                phone: data.client.phone || "",
                address: data.client.address || "",
                company: data.client.company || "",
                notes: data.client.notes || "",
              }}
              voiceNotes={voiceNotes}
              onUpdate={handleContactUpdate} 
              onAudioUpload={handleAudioUpload}
            />
          </div>

          <div>
            <AssetManagementCard
              assets={mappedAssets}
              onUpload={handleFileUpload}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
              isUploading={isUploadingAsset}
            />
          </div>

          <div>
            <BillingCard
              billing={billingSettings}
              invoices={mappedInvoices}
              onBillingUpdate={handleBillingUpdate}
              onViewInvoice={handleViewInvoice}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
