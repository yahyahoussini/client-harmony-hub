export interface Client {
  id: string;
  name: string;
  source: string | null;
  status: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  amount: number;
  currency: string;
  cycle: string;
  next_payment_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  client_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Asset {
  id: string;
  client_id: string;
  name: string;
  type: string;
  size: number | null;
  file_url: string;
  bucket_path: string;
  created_at: string;
}

export interface ClientData {
  client: Client | null;
  subscription: Subscription | null;
  invoices: Invoice[];
  assets: Asset[];
}
