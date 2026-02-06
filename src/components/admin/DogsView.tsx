import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditableField } from "./EditableField";
import { EditableSelect } from "./EditableSelect";
import { useToast } from "@/hooks/use-toast";
import { 
  Dog, 
  Search, 
  Loader2,
  Scale,
  Activity,
  Cake,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_OPTIONS = [
  { value: "active", label: "Activo", color: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archivado", color: "bg-yellow-100 text-yellow-800" },
  { value: "deceased", label: "Fallecido", color: "bg-gray-100 text-gray-800" },
];

const AGE_STAGE_OPTIONS = [
  { value: "puppy", label: "Cachorro" },
  { value: "adult", label: "Adulto" },
  { value: "senior", label: "Senior" },
];

const ACTIVITY_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "moderate", label: "Moderada" },
  { value: "high", label: "Alta" },
];

const BODY_CONDITION_OPTIONS = [
  { value: "underweight", label: "Bajo peso" },
  { value: "ideal", label: "Ideal" },
  { value: "overweight", label: "Sobrepeso" },
];

const PROTEIN_OPTIONS = [
  { value: "pollo", label: "Pollo" },
  { value: "res", label: "Res" },
  { value: "mix", label: "Mix" },
];

const PLAN_TYPE_OPTIONS = [
  { value: "standard", label: "Estándar" },
  { value: "premium", label: "Premium" },
];

export default function DogsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all dogs
  const { data: dogs, isLoading } = useQuery({
    queryKey: ["admin-dogs-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dog_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch profiles for lookup
  const { data: profiles } = useQuery({
    queryKey: ["admin-dogs-profiles-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, family_name, email");
      if (error) throw error;
      return data || [];
    },
  });

  // Update dog mutation
  const updateDogMutation = useMutation({
    mutationFn: async ({ dogId, updates }: { dogId: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("dog_profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", dogId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dogs-full"] });
      toast({ title: "Perrito actualizado" });
    },
    onError: () => {
      toast({ title: "Error al actualizar", variant: "destructive" });
    },
  });

  const handleUpdateDog = async (dogId: string, field: string, value: any) => {
    await updateDogMutation.mutateAsync({ dogId, updates: { [field]: value } });
  };

  const getProfile = (userId: string | null) => profiles?.find(p => p.id === userId);

  // Filter dogs
  const filteredDogs = dogs?.filter((dog) => {
    const profile = getProfile(dog.user_id);
    const matchesSearch = 
      dog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile?.family_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dog.recommended_protein?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && dog.status === statusFilter;
  }) || [];

  // Calculate stats
  const activeCount = dogs?.filter(d => d.status === "active").length || 0;
  const avgWeight = dogs?.length 
    ? (dogs.reduce((sum, d) => sum + (d.weight_kg || 0), 0) / dogs.length).toFixed(1)
    : 0;
  const totalDailyGrams = dogs?.filter(d => d.status === "active")
    .reduce((sum, d) => sum + (d.daily_grams || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Perritos activos</p>
              </div>
              <Dog className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{avgWeight}kg</p>
                <p className="text-xs text-muted-foreground">Peso promedio</p>
              </div>
              <Scale className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{(totalDailyGrams / 1000).toFixed(1)}kg</p>
                <p className="text-xs text-muted-foreground">Consumo diario total</p>
              </div>
              <Activity className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dog className="h-5 w-5" />
                Perfiles de Perritos
              </CardTitle>
              <CardDescription>{filteredDogs.length} perritos registrados</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                  <SelectItem value="deceased">Fallecidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredDogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Nombre</th>
                    <th className="text-left py-3 px-2">Dueño</th>
                    <th className="text-left py-3 px-2">Peso</th>
                    <th className="text-left py-3 px-2">Edad</th>
                    <th className="text-left py-3 px-2">Actividad</th>
                    <th className="text-left py-3 px-2">Condición</th>
                    <th className="text-left py-3 px-2">Recomendación</th>
                    <th className="text-left py-3 px-2">Diario</th>
                    <th className="text-left py-3 px-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDogs.map((dog) => {
                    const profile = getProfile(dog.user_id);
                    return (
                      <tr key={dog.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {dog.image_url ? (
                              <img 
                                src={dog.image_url} 
                                alt={dog.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Dog className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <EditableField
                              value={dog.name}
                              onSave={(v) => handleUpdateDog(dog.id, "name", v)}
                              placeholder="Nombre"
                              className="font-medium"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{profile?.family_name || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <EditableField
                            value={dog.weight_kg?.toString()}
                            onSave={(v) => handleUpdateDog(dog.id, "weight_kg", parseFloat(v) || 0)}
                            type="number"
                            inputClassName="w-16"
                          />
                          <span className="text-xs text-muted-foreground ml-1">kg</span>
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={dog.age_stage}
                            options={AGE_STAGE_OPTIONS}
                            onSave={(v) => handleUpdateDog(dog.id, "age_stage", v)}
                          />
                          {dog.birthday && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Cake className="h-3 w-3" />
                              {format(new Date(dog.birthday), "d MMM", { locale: es })}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={dog.activity_level}
                            options={ACTIVITY_OPTIONS}
                            onSave={(v) => handleUpdateDog(dog.id, "activity_level", v)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={dog.body_condition}
                            options={BODY_CONDITION_OPTIONS}
                            onSave={(v) => handleUpdateDog(dog.id, "body_condition", v)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={dog.recommended_protein}
                            options={PROTEIN_OPTIONS}
                            onSave={(v) => handleUpdateDog(dog.id, "recommended_protein", v)}
                          />
                          <EditableSelect
                            value={dog.recommended_plan_type}
                            options={PLAN_TYPE_OPTIONS}
                            onSave={(v) => handleUpdateDog(dog.id, "recommended_plan_type", v)}
                            className="mt-1"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableField
                            value={dog.daily_grams?.toString()}
                            onSave={(v) => handleUpdateDog(dog.id, "daily_grams", parseInt(v) || 0)}
                            type="number"
                            inputClassName="w-16"
                          />
                          <span className="text-xs text-muted-foreground ml-1">g</span>
                          <p className="text-xs text-muted-foreground">
                            {dog.weekly_kg}kg/sem
                          </p>
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={dog.status}
                            options={STATUS_OPTIONS}
                            onSave={(v) => handleUpdateDog(dog.id, "status", v)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Dog className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay perritos registrados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
