-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can update order by delivery token" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view order by delivery token" ON public.orders;

-- Create a more secure function for driver updates
CREATE OR REPLACE FUNCTION public.update_order_by_token(
  p_token uuid,
  p_driver_status text,
  p_driver_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET 
    driver_status = p_driver_status,
    driver_notes = COALESCE(p_driver_notes, driver_notes),
    driver_confirmed_at = now(),
    status = CASE 
      WHEN p_driver_status = 'delivered' THEN 'delivered'
      WHEN p_driver_status = 'postponed' THEN 'confirmed'
      WHEN p_driver_status = 'failed' THEN 'confirmed'
      ELSE status
    END,
    updated_at = now()
  WHERE delivery_token = p_token;
  
  RETURN FOUND;
END;
$$;

-- Create a function to get order by token (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_order_by_token(p_token uuid)
RETURNS TABLE (
  id uuid,
  order_number text,
  customer_name text,
  customer_address text,
  customer_phone text,
  items jsonb,
  total numeric,
  payment_method text,
  delivery_notes text,
  status text,
  driver_status text,
  driver_notes text,
  driver_confirmed_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_address,
    o.customer_phone,
    o.items,
    o.total,
    o.payment_method,
    o.delivery_notes,
    o.status,
    o.driver_status,
    o.driver_notes,
    o.driver_confirmed_at
  FROM orders o
  WHERE o.delivery_token = p_token;
$$;