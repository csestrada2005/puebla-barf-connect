import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  pet_name: string;
  family_name: string;
  phone: string;
  email: string;
  address: string;
  postal_code: string;
  colonia: string | null;
  references_notes: string | null;
  special_notes: string | null;
  is_coverage_verified: boolean;
  is_admin: boolean | null;
  acquisition_channel: string | null;
  special_needs: string | null;
  main_breed: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  pet_name: string;
  family_name: string;
  phone: string;
  email: string;
  address: string;
  postal_code: string;
  colonia?: string;
  references_notes?: string;
  special_notes?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });

  const createProfile = useMutation({
    mutationFn: async (formData: ProfileFormData) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          ...formData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (formData: Partial<ProfileFormData>) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return {
    profile,
    isLoading,
    error,
    hasProfile: !!profile,
    createProfile,
    updateProfile,
  };
}
