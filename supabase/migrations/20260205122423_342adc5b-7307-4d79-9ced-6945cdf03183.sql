-- Add RLS policy for admins to update orders
CREATE POLICY "Admins can update all orders" 
ON public.orders 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.is_admin = true
));

-- Add RLS policy for admins to view all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.is_admin = true
));