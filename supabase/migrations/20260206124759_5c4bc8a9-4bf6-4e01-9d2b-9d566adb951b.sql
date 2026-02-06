-- Fix 1: Remove dangerous RLS policy that exposes guest orders
DROP POLICY IF EXISTS "Anyone can view orders by phone match" ON public.orders;

-- Fix 2: Add explicit deny policy for anonymous access to profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Fix 3: Add token expiration column to orders table and update RPC functions
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_token_expires_at timestamptz DEFAULT (now() + interval '7 days');

-- Fix 4: Recreate get_order_by_token with additional security validations
CREATE OR REPLACE FUNCTION public.get_order_by_token(p_token uuid)
RETURNS TABLE(
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
  driver_confirmed_at timestamp with time zone, 
  delivery_photo_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    o.id,
    o.order_number,
    -- Mask customer name for privacy (show first name only)
    split_part(o.customer_name, ' ', 1) as customer_name,
    o.customer_address,
    -- Mask phone number (show last 4 digits only)
    '******' || right(o.customer_phone, 4) as customer_phone,
    o.items,
    o.total,
    -- Show generic payment method instead of details
    CASE WHEN o.payment_method = 'efectivo' THEN 'Efectivo' ELSE 'Tarjeta' END as payment_method,
    o.delivery_notes,
    o.status,
    o.driver_status,
    o.driver_notes,
    o.driver_confirmed_at,
    o.delivery_photo_url
  FROM orders o
  WHERE o.delivery_token = p_token
    -- Only allow access to orders with status 'confirmed' or in active delivery
    AND o.status IN ('confirmed', 'in_transit', 'out_for_delivery')
    -- Check token hasn't expired (7 day window)
    AND (o.delivery_token_expires_at IS NULL OR o.delivery_token_expires_at > now());
$$;

-- Fix 5: Recreate update_order_by_token with additional security validations
CREATE OR REPLACE FUNCTION public.update_order_by_token(
  p_token uuid, 
  p_driver_status text, 
  p_driver_notes text DEFAULT NULL, 
  p_delivery_photo_url text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_exists boolean;
BEGIN
  -- Validate the order exists, has correct status, and token is not expired
  SELECT EXISTS (
    SELECT 1 FROM orders 
    WHERE delivery_token = p_token 
      AND status IN ('confirmed', 'in_transit', 'out_for_delivery')
      AND (delivery_token_expires_at IS NULL OR delivery_token_expires_at > now())
  ) INTO v_order_exists;

  IF NOT v_order_exists THEN
    RETURN FALSE;
  END IF;

  -- Only allow valid driver status values
  IF p_driver_status NOT IN ('delivered', 'postponed', 'failed', 'in_transit') THEN
    RETURN FALSE;
  END IF;

  UPDATE orders
  SET 
    driver_status = p_driver_status,
    driver_notes = COALESCE(p_driver_notes, driver_notes),
    delivery_photo_url = COALESCE(p_delivery_photo_url, delivery_photo_url),
    driver_confirmed_at = now(),
    status = CASE 
      WHEN p_driver_status = 'delivered' THEN 'delivered'
      WHEN p_driver_status = 'postponed' THEN 'confirmed'
      WHEN p_driver_status = 'failed' THEN 'confirmed'
      ELSE status
    END,
    updated_at = now()
  WHERE delivery_token = p_token
    AND status IN ('confirmed', 'in_transit', 'out_for_delivery')
    AND (delivery_token_expires_at IS NULL OR delivery_token_expires_at > now());
  
  RETURN FOUND;
END;
$$;