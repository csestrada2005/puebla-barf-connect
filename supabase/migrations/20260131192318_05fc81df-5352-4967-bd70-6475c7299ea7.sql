-- Add dog_profile_id column to orders table for "History per Dog" feature
ALTER TABLE public.orders 
ADD COLUMN dog_profile_id uuid REFERENCES public.dog_profiles(id) ON DELETE SET NULL;

-- Create index for faster lookups when querying orders by dog
CREATE INDEX idx_orders_dog_profile_id ON public.orders(dog_profile_id);

-- Add comment explaining the column purpose
COMMENT ON COLUMN public.orders.dog_profile_id IS 'Links order to specific dog profile for per-dog order history tracking';