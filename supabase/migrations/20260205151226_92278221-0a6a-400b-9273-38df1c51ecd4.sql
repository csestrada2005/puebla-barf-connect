-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all dog profiles" ON public.dog_profiles;
DROP POLICY IF EXISTS "Admins can view all deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Admins can update all deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Admins can insert deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Admins can insert app_config" ON public.app_config;
DROP POLICY IF EXISTS "Admins can update app_config" ON public.app_config;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = true
  )
$$;

-- Recreate admin policies using the new function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update all orders" 
ON public.orders FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can view all dog profiles" 
ON public.dog_profiles FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can view all deliveries" 
ON public.deliveries FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update all deliveries" 
ON public.deliveries FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can insert deliveries" 
ON public.deliveries FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can insert app_config" 
ON public.app_config FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update app_config" 
ON public.app_config FOR UPDATE 
USING (public.is_admin());