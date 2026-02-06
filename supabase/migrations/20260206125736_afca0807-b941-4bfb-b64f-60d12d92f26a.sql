-- Fix remaining policy issue: drop the overly permissive order_statuses policy
DROP POLICY IF EXISTS "Anyone can view order statuses by order" ON public.order_statuses;

-- Ensure only authenticated users with valid ownership can view
CREATE POLICY "Admins can view all order statuses" ON public.order_statuses
FOR SELECT USING (public.is_admin());