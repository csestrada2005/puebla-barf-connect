-- Add birthday and status to dog_profiles
ALTER TABLE public.dog_profiles
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add constraint for status values
ALTER TABLE public.dog_profiles
DROP CONSTRAINT IF EXISTS dog_profiles_status_check;

ALTER TABLE public.dog_profiles
ADD CONSTRAINT dog_profiles_status_check 
CHECK (status IN ('active', 'deceased', 'archived'));

-- Add subscription type and frequency_days to subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS type text DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS frequency_days integer DEFAULT 7;

-- Add constraint for type values
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_type_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_type_check 
CHECK (type IN ('basic', 'pro'));

-- Add constraint for frequency_days values
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_frequency_days_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_frequency_days_check 
CHECK (frequency_days IN (7, 15));

-- Create index for dog status filtering
CREATE INDEX IF NOT EXISTS idx_dog_profiles_status ON public.dog_profiles(status);
CREATE INDEX IF NOT EXISTS idx_dog_profiles_birthday ON public.dog_profiles(birthday);