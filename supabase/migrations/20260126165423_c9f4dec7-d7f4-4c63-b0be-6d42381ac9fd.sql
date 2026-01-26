-- ==============================================
-- TASK 1: DATABASE SCHEMA EXPANSION FOR SUBSCRIPTION-FIRST MODEL
-- ==============================================

-- Add CRM fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS acquisition_channel text DEFAULT 'web',
ADD COLUMN IF NOT EXISTS special_needs text,
ADD COLUMN IF NOT EXISTS main_breed text,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update subscriptions table with billing logic
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS weekly_amount_kg numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_billing_date date,
ADD COLUMN IF NOT EXISTS price_per_kg numeric DEFAULT 150,
ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 0;

-- Create deliveries table for logistics
CREATE TABLE IF NOT EXISTS public.deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  delivery_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'shipped', 'delivered', 'cancelled')),
  contents_summary text,
  amount_kg numeric,
  tracking_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on deliveries
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliveries
CREATE POLICY "Users can view their own deliveries"
  ON public.deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = deliveries.subscription_id
      AND s.user_id = auth.uid()
    )
  );

-- Admin can view all deliveries (using is_admin from profiles)
CREATE POLICY "Admins can view all deliveries"
  ON public.deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- Admin can update deliveries
CREATE POLICY "Admins can update all deliveries"
  ON public.deliveries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- Admin can insert deliveries
CREATE POLICY "Admins can insert deliveries"
  ON public.deliveries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- Create trigger for updated_at on deliveries
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_deliveries_subscription_id ON public.deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date ON public.deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_delivery_date ON public.subscriptions(next_delivery_date);