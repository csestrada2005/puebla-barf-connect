-- Allow admins to insert and update app_config
CREATE POLICY "Admins can insert app_config" 
ON public.app_config 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

CREATE POLICY "Admins can update app_config" 
ON public.app_config 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);