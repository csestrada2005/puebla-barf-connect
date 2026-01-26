-- Create table to store cancellation reasons for analytics
CREATE TABLE public.cancellations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dog_profile_id UUID REFERENCES public.dog_profiles(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  reason_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

-- Users can view their own cancellations
CREATE POLICY "Users can view their own cancellations"
ON public.cancellations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own cancellations
CREATE POLICY "Users can insert their own cancellations"
ON public.cancellations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_cancellations_user_id ON public.cancellations(user_id);
CREATE INDEX idx_cancellations_dog_profile_id ON public.cancellations(dog_profile_id);