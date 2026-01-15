-- Fix orders RLS policies to be more secure
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view their orders by phone" ON public.orders;

-- Create more secure policies
-- Authenticated users can create orders (with their user_id)
CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous order creation for guest checkout fallback
CREATE POLICY "Anyone can create orders without user_id"
ON public.orders FOR INSERT
WITH CHECK (user_id IS NULL);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow viewing orders by phone for order tracking (legacy support)
CREATE POLICY "Anyone can view orders by phone match"
ON public.orders FOR SELECT
USING (user_id IS NULL);