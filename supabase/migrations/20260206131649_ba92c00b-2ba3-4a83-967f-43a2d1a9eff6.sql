-- Create a security definer function to check if user owns an order
CREATE OR REPLACE FUNCTION public.user_owns_order(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = p_order_id
      AND user_id = auth.uid()
  )
$$;

-- Drop the existing subquery-based policy
DROP POLICY IF EXISTS "Users can view their order statuses" ON public.order_statuses;

-- Create a new policy using the security definer function (more secure)
CREATE POLICY "Users can view their own order statuses"
ON public.order_statuses
FOR SELECT
TO authenticated
USING (public.user_owns_order(order_id));

-- Add explicit denial for anonymous users
CREATE POLICY "Deny anonymous access to order statuses"
ON public.order_statuses
FOR ALL
TO anon
USING (false)
WITH CHECK (false);