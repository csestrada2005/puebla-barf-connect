-- Fix profiles RLS: Remove confusing deny policy and keep clean explicit policies
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Fix waitlist: Add explicit deny SELECT for non-admins (table is write-only for public)
CREATE POLICY "Admins can view waitlist entries" ON public.waitlist
FOR SELECT USING (public.is_admin());

-- Strengthen anonymous order creation with better constraints
-- Orders without user_id are allowed but the CHECK constraints we added ensure data quality