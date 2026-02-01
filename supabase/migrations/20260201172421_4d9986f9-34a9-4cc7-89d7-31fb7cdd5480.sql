-- Add image_url column to dog_profiles for storing dog photos
ALTER TABLE public.dog_profiles ADD COLUMN IF NOT EXISTS image_url TEXT;