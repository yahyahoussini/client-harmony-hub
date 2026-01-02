import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientHeader } from "@/components/clients/ClientHeader";
import { ContactInfoCard } from "@/components/clients/ContactInfoCard";
import { AssetManagementCard } from "@/components/clients/AssetManagementCard";
import { BillingCard } from "@/components/clients/BillingCard";

export default function ClientDetail() {
  // These would come from your backend/state management
  const handleClientUpdate = (data: any) => {
    console.log("Client updated:", data);
  };

  const handleContactUpdate = (contact: any) => {
    console.log("Contact updated:", contact);
  };

  const handleFileUpload = (files: FileList) => {
    console.log("Files uploaded:", files);
  };

  const handleFileDownload = (assetId: string) => {
    console.log("Download asset:", assetId);
  };

  const handleFileDelete = (assetId: string) => {
    console.log("Delete asset:", assetId);
  };

  const handleBillingUpdate = (billing: any) => {
    console.log("Billing updated:", billing);
  };

  const handleViewInvoice = (invoiceId: string) => {
    console.log("View invoice:", invoiceId);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <ClientHeader
          clientName="Acme Corporation"
          leadSource="Website Referral"
          status="active"
          onUpdate={handleClientUpdate}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column 1: Contact Info */}
          <div>
            <ContactInfoCard onUpdate={handleContactUpdate} />
          </div>

          {/* Column 2: Asset Management */}
          <div>
            <AssetManagementCard
              assets={[]}
              onUpload={handleFileUpload}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
            />
          </div>

          {/* Column 3: Billing */}
          <div>
            <BillingCard
              invoices={[]}
              onBillingUpdate={handleBillingUpdate}
              onViewInvoice={handleViewInvoice}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
