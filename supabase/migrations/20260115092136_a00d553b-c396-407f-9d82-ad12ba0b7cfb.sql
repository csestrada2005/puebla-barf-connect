-- 1. Create profiles table for customer data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  colonia TEXT,
  references_notes TEXT,
  special_notes TEXT,
  is_coverage_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'pro')),
  frequency TEXT NOT NULL CHECK (frequency IN ('mensual', 'anual')),
  protein_line TEXT NOT NULL CHECK (protein_line IN ('pollo', 'res')),
  presentation TEXT NOT NULL CHECK (presentation IN ('500g', '1kg')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  points INTEGER DEFAULT 0,
  next_delivery_date DATE,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create order_statuses table for order timeline
CREATE TABLE public.order_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('recibido', 'en_preparacion', 'en_ruta', 'entregado')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on order_statuses
ALTER TABLE public.order_statuses ENABLE ROW LEVEL SECURITY;

-- RLS policy for order_statuses (anyone can view if they can see the order)
CREATE POLICY "Users can view order statuses"
ON public.order_statuses FOR SELECT
USING (true);

-- 4. Add new columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS protein_line TEXT,
ADD COLUMN IF NOT EXISTS presentation TEXT,
ADD COLUMN IF NOT EXISTS benefits JSONB,
ADD COLUMN IF NOT EXISTS ingredients TEXT[];

-- 5. Add user_id to orders table for tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 6. Insert/update app_config values
INSERT INTO public.app_config (key, value) VALUES
  ('whatsapp_number', '"5212213606464"'),
  ('annual_discount_percent', '15'),
  ('bank_clabe', '"012180015678901234"'),
  ('bank_name', '"BBVA"'),
  ('bank_beneficiary', '"Raw Paw SA de CV"'),
  ('meta_pixel_id', '""'),
  ('ga_tracking_id', '""'),
  ('gtm_id', '""')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 7. Add missing coverage zones
INSERT INTO public.coverage_zones (zone_name, zone_type, postal_code, delivery_fee, is_active) VALUES
  ('Atlixco', 'ciudad', '74200', 0, true),
  ('Plaza Dorada', 'colonia', '72410', 0, true)
ON CONFLICT DO NOTHING;