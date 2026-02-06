-- Step 1: Drop public policy on order_statuses
DROP POLICY IF EXISTS "Anyone can view order statuses by order" ON public.order_statuses;

-- Step 2: Secure delivery-photos bucket
UPDATE storage.buckets SET public = false WHERE id = 'delivery-photos';

-- Drop existing permissive policies on delivery-photos
DROP POLICY IF EXISTS "Anyone can upload delivery photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view delivery photos" ON storage.objects;

-- Create secure policies - only admins can view/delete
CREATE POLICY "Admins can view delivery photos" ON storage.objects
FOR SELECT USING (bucket_id = 'delivery-photos' AND public.is_admin());

CREATE POLICY "Admins can delete delivery photos" ON storage.objects
FOR DELETE USING (bucket_id = 'delivery-photos' AND public.is_admin());

-- Step 3: Add CHECK constraints to orders table for input validation
ALTER TABLE public.orders
ADD CONSTRAINT check_customer_name_length CHECK (length(customer_name) >= 2 AND length(customer_name) <= 100),
ADD CONSTRAINT check_customer_phone_format CHECK (customer_phone ~ '^[0-9+ ()-]{7,20}$'),
ADD CONSTRAINT check_customer_address_length CHECK (length(customer_address) >= 10 AND length(customer_address) <= 500),
ADD CONSTRAINT check_delivery_notes_length CHECK (delivery_notes IS NULL OR length(delivery_notes) <= 1000);