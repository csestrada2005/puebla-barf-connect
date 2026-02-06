-- 1. Add delivery photo URL column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;

-- 2. Create storage bucket for delivery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-photos', 'delivery-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS policies for delivery photos storage
CREATE POLICY "Anyone can upload delivery photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'delivery-photos');

CREATE POLICY "Anyone can view delivery photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'delivery-photos');

-- 4. Drop and recreate get_order_by_token with new return type
DROP FUNCTION IF EXISTS public.get_order_by_token(uuid);

CREATE FUNCTION public.get_order_by_token(p_token uuid)
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
    o.driver_confirmed_at,
    o.delivery_photo_url
  FROM orders o
  WHERE o.delivery_token = p_token;
$$;

-- 5. Drop and recreate update_order_by_token with new parameter
DROP FUNCTION IF EXISTS public.update_order_by_token(uuid, text, text);

CREATE FUNCTION public.update_order_by_token(
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
BEGIN
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
  WHERE delivery_token = p_token;
  
  RETURN FOUND;
END;
$$;