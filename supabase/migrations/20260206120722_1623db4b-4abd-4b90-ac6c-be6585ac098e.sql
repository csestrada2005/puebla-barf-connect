-- Add admin update policies for profiles and dog_profiles tables
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can update all dog profiles" 
ON public.dog_profiles 
FOR UPDATE 
USING (is_admin());