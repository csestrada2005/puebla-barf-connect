-- Create dog_profiles table to store pet data and recommendations
CREATE TABLE public.dog_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_stage TEXT NOT NULL CHECK (age_stage IN ('puppy', 'adult', 'senior')),
  weight_kg NUMERIC NOT NULL,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('low', 'normal', 'high')),
  body_condition TEXT NOT NULL CHECK (body_condition IN ('underweight', 'ideal', 'overweight')),
  sensitivity TEXT NOT NULL CHECK (sensitivity IN ('high', 'medium', 'low')),
  goal TEXT NOT NULL CHECK (goal IN ('trial', 'routine', 'variety')),
  daily_grams INTEGER NOT NULL,
  weekly_kg NUMERIC NOT NULL,
  recommended_plan_type TEXT NOT NULL CHECK (recommended_plan_type IN ('standard', 'premium')),
  recommended_protein TEXT NOT NULL CHECK (recommended_protein IN ('chicken', 'beef', 'mix')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dog_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own dog profiles" 
ON public.dog_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dog profiles" 
ON public.dog_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dog profiles" 
ON public.dog_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dog profiles" 
ON public.dog_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dog_profiles_updated_at
BEFORE UPDATE ON public.dog_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();