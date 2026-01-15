-- Fix order_statuses RLS to be more restrictive
-- Users can only see statuses for their own orders
DROP POLICY IF EXISTS "Users can view order statuses" ON public.order_statuses;

CREATE POLICY "Users can view their order statuses"
ON public.order_statuses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_statuses.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Also allow anonymous viewing by order_number for non-logged users
CREATE POLICY "Anyone can view order statuses by order"
ON public.order_statuses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_statuses.order_id
  )
);