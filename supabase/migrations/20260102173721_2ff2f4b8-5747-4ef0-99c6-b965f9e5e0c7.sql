-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  cycle TEXT NOT NULL DEFAULT 'monthly',
  next_payment_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  file_url TEXT NOT NULL,
  bucket_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for now, since no auth yet)
CREATE POLICY "Allow public read access on clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public read access on subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on subscriptions" ON public.subscriptions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on subscriptions" ON public.subscriptions FOR DELETE USING (true);

CREATE POLICY "Allow public read access on invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on invoices" ON public.invoices FOR DELETE USING (true);

CREATE POLICY "Allow public read access on assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on assets" ON public.assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on assets" ON public.assets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on assets" ON public.assets FOR DELETE USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('client-assets', 'client-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', true);

-- Storage policies for client-assets bucket
CREATE POLICY "Allow public read on client-assets" ON storage.objects FOR SELECT USING (bucket_id = 'client-assets');
CREATE POLICY "Allow public upload on client-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'client-assets');
CREATE POLICY "Allow public update on client-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'client-assets');
CREATE POLICY "Allow public delete on client-assets" ON storage.objects FOR DELETE USING (bucket_id = 'client-assets');

-- Storage policies for voice-notes bucket
CREATE POLICY "Allow public read on voice-notes" ON storage.objects FOR SELECT USING (bucket_id = 'voice-notes');
CREATE POLICY "Allow public upload on voice-notes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice-notes');
CREATE POLICY "Allow public update on voice-notes" ON storage.objects FOR UPDATE USING (bucket_id = 'voice-notes');
CREATE POLICY "Allow public delete on voice-notes" ON storage.objects FOR DELETE USING (bucket_id = 'voice-notes');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();