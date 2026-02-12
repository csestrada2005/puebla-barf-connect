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
  driver_confirmed_at timestamptz,
  delivery_photo_url text
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
    CASE WHEN o.payment_method = 'efectivo' THEN 'Efectivo' ELSE 'Tarjeta' END as payment_method,
    o.delivery_notes,
    o.status,
    o.driver_status,
    o.driver_notes,
    o.driver_confirmed_at,
    o.delivery_photo_url
  FROM orders o
  WHERE o.delivery_token = p_token
    AND (o.delivery_token_expires_at IS NULL OR o.delivery_token_expires_at > now());
$$;

CREATE OR REPLACE FUNCTION public.update_order_by_token(p_token uuid, p_driver_status text, p_driver_notes text DEFAULT NULL, p_delivery_photo_url text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM orders 
    WHERE delivery_token = p_token 
      AND (delivery_token_expires_at IS NULL OR delivery_token_expires_at > now())
  ) INTO v_order_exists;

  IF NOT v_order_exists THEN
    RETURN FALSE;
  END IF;

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
    AND (delivery_token_expires_at IS NULL OR delivery_token_expires_at > now());
  
  RETURN FOUND;
END;
$$;