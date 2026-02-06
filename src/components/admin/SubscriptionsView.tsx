import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditableField } from "./EditableField";
import { EditableSelect } from "./EditableSelect";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Search, 
  Loader2,
  Calendar,
  User,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_OPTIONS = [
  { value: "active", label: "Activa", color: "bg-green-100 text-green-800" },
  { value: "paused", label: "Pausada", color: "bg-yellow-100 text-yellow-800" },
  { value: "cancelled", label: "Cancelada", color: "bg-red-100 text-red-800" },
];

const PLAN_OPTIONS = [
  { value: "basico", label: "Básico" },
  { value: "pro", label: "Pro" },
];

const FREQUENCY_OPTIONS = [
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
];

const PROTEIN_OPTIONS = [
  { value: "pollo", label: "Pollo" },
  { value: "res", label: "Res" },
  { value: "mix", label: "Mix" },
];

const PRESENTATION_OPTIONS = [
  { value: "500g", label: "500g" },
  { value: "1kg", label: "1kg" },
  { value: "2kg", label: "2kg" },
  { value: "5kg", label: "5kg" },
];

export default function SubscriptionsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch subscriptions with profile data
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["admin-subscriptions-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch profiles for lookup
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, family_name, email, phone");
      if (error) throw error;
      return data || [];
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ subId, updates }: { subId: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("subscriptions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", subId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-full"] });
      toast({ title: "Suscripción actualizada" });
    },
    onError: () => {
      toast({ title: "Error al actualizar", variant: "destructive" });
    },
  });

  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (subId: string) => {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-full"] });
      toast({ title: "Suscripción eliminada" });
    },
    onError: () => {
      toast({ title: "Error al eliminar", variant: "destructive" });
    },
  });

  const handleUpdateSubscription = async (subId: string, field: string, value: any) => {
    await updateSubscriptionMutation.mutateAsync({ subId, updates: { [field]: value } });
  };

  const getProfile = (userId: string) => profiles?.find(p => p.id === userId);

  // Filter subscriptions
  const filteredSubs = subscriptions?.filter((sub) => {
    const profile = getProfile(sub.user_id);
    const matchesSearch = 
      profile?.family_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.protein_line?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && sub.status === statusFilter;
  }) || [];

  // Calculate stats
  const activeCount = subscriptions?.filter(s => s.status === "active").length || 0;
  const pausedCount = subscriptions?.filter(s => s.status === "paused").length || 0;
  const cancelledCount = subscriptions?.filter(s => s.status === "cancelled").length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
              <Package className="h-8 w-8 text-green-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pausedCount}</p>
                <p className="text-xs text-muted-foreground">Pausadas</p>
              </div>
              <Package className="h-8 w-8 text-yellow-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
              <Package className="h-8 w-8 text-red-600/20" />
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
                <Package className="h-5 w-5" />
                Suscripciones
              </CardTitle>
              <CardDescription>{filteredSubs.length} suscripciones</CardDescription>
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
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
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
          ) : filteredSubs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Cliente</th>
                    <th className="text-left py-3 px-2">Plan</th>
                    <th className="text-left py-3 px-2">Proteína</th>
                    <th className="text-left py-3 px-2">Frecuencia</th>
                    <th className="text-left py-3 px-2">Próx. Entrega</th>
                    <th className="text-left py-3 px-2">Estado</th>
                    <th className="text-left py-3 px-2">Puntos</th>
                    <th className="text-left py-3 px-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((sub) => {
                    const profile = getProfile(sub.user_id);
                    return (
                      <tr key={sub.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{profile?.family_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{profile?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={sub.plan_type}
                            options={PLAN_OPTIONS}
                            onSave={(v) => handleUpdateSubscription(sub.id, "plan_type", v)}
                          />
                          <EditableSelect
                            value={sub.presentation}
                            options={PRESENTATION_OPTIONS}
                            onSave={(v) => handleUpdateSubscription(sub.id, "presentation", v)}
                            className="mt-1"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={sub.protein_line}
                            options={PROTEIN_OPTIONS}
                            onSave={(v) => handleUpdateSubscription(sub.id, "protein_line", v)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={sub.frequency}
                            options={FREQUENCY_OPTIONS}
                            onSave={(v) => handleUpdateSubscription(sub.id, "frequency", v)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableField
                            value={sub.next_delivery_date}
                            onSave={(v) => handleUpdateSubscription(sub.id, "next_delivery_date", v)}
                            type="date"
                            prefix={<Calendar className="h-3 w-3" />}
                            emptyText="Sin fecha"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableSelect
                            value={sub.status}
                            options={STATUS_OPTIONS}
                            onSave={(v) => handleUpdateSubscription(sub.id, "status", v)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <EditableField
                            value={(sub.points || 0).toString()}
                            onSave={(v) => handleUpdateSubscription(sub.id, "points", parseInt(v) || 0)}
                            type="number"
                            inputClassName="w-16"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar suscripción?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. La suscripción de {profile?.family_name || "este cliente"} será eliminada permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteSubscriptionMutation.mutate(sub.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay suscripciones</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
