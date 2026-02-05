-- Add delivery_token to orders for driver confirmation
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS driver_confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS driver_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS driver_notes text DEFAULT NULL;

-- Create index for token lookup
CREATE INDEX IF NOT EXISTS idx_orders_delivery_token ON public.orders(delivery_token);

-- Allow public access to update order by delivery token (for driver confirmation)
CREATE POLICY "Anyone can update order by delivery token" 
ON public.orders 
FOR UPDATE 
USING (true)
WITH CHECK (delivery_token IS NOT NULL);

-- Allow public to view order by delivery token
CREATE POLICY "Anyone can view order by delivery token" 
ON public.orders 
FOR SELECT 
USING (delivery_token IS NOT NULL);

-- Allow admins to view all profiles for customer management
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Allow admins to view all dog profiles
CREATE POLICY "Admins can view all dog profiles" 
ON public.dog_profiles 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));