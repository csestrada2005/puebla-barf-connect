-- Add DELETE policies for admins on orders, subscriptions, and dog_profiles

-- Admins can delete orders
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
USING (is_admin());

-- Admins can update subscriptions (missing policy)
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (is_admin());

-- Admins can delete subscriptions
CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (is_admin());

-- Admins can delete dog profiles
CREATE POLICY "Admins can delete dog profiles"
ON public.dog_profiles
FOR DELETE
USING (is_admin());