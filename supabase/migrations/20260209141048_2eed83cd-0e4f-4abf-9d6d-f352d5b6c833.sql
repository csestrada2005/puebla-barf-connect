-- Drop the restrictive policies and replace with a single flexible one
DROP POLICY IF EXISTS "Anyone can create orders without user_id" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

-- Allow anon users to create orders without user_id
CREATE POLICY "Anon can create guest orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow authenticated users to create orders with their user_id
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);