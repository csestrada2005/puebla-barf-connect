import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableField } from "./EditableField";
import { EditableSelect } from "./EditableSelect";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Dog,
  Package,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ACQUISITION_OPTIONS = [
  { value: "web", label: "Web" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "referido", label: "Referido" },
  { value: "otro", label: "Otro" },
];

export default function CustomersView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Fetch all profiles
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-customers-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all orders
  const { data: orders } = useQuery({
    queryKey: ["admin-customers-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all subscriptions
  const { data: subscriptions } = useQuery({
    queryKey: ["admin-customers-subs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all dogs
  const { data: dogs } = useQuery({
    queryKey: ["admin-customers-dogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dog_profiles")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ profileId, updates }: { profileId: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers-profiles"] });
      toast({ title: "Cliente actualizado" });
    },
    onError: () => {
      toast({ title: "Error al actualizar", variant: "destructive" });
    },
  });

  const handleUpdateProfile = async (profileId: string, field: string, value: any) => {
    await updateProfileMutation.mutateAsync({ profileId, updates: { [field]: value } });
  };

  // Filter profiles
  const filteredProfiles = profiles?.filter((profile) => {
    const term = searchTerm.toLowerCase();
    return (
      profile.family_name?.toLowerCase().includes(term) ||
      profile.pet_name?.toLowerCase().includes(term) ||
      profile.email?.toLowerCase().includes(term) ||
      profile.phone?.includes(searchTerm) ||
      profile.postal_code?.includes(searchTerm)
    );
  }) || [];

  // Get customer data
  const getCustomerOrders = (userId: string) => orders?.filter(o => o.user_id === userId) || [];
  const getCustomerSubs = (userId: string) => subscriptions?.filter(s => s.user_id === userId) || [];
  const getCustomerDogs = (userId: string) => dogs?.filter(d => d.user_id === userId) || [];

  const toggleExpand = (id: string) => {
    setExpandedCustomer(expandedCustomer === id ? null : id);
  };

  // Calculate totals
  const getCustomerTotal = (userId: string) => {
    return getCustomerOrders(userId).reduce((sum, o) => sum + (o.total || 0), 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes
            </CardTitle>
            <CardDescription>{filteredProfiles.length} clientes registrados</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-[300px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {profilesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="space-y-3">
            {filteredProfiles.map((profile) => {
              const isExpanded = expandedCustomer === profile.id;
              const customerOrders = getCustomerOrders(profile.id);
              const customerSubs = getCustomerSubs(profile.id);
              const customerDogs = getCustomerDogs(profile.id);
              const totalSpent = getCustomerTotal(profile.id);
              const activeSubs = customerSubs.filter(s => s.status === "active");

              return (
                <div
                  key={profile.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Customer Header */}
                  <div 
                    className="p-4 bg-card hover:bg-muted/50 cursor-pointer flex items-center justify-between gap-4"
                    onClick={() => toggleExpand(profile.id)}
                  >
                    <div className="flex items-center gap-4 flex-wrap flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {profile.family_name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <EditableField
                          value={profile.family_name}
                          onSave={(v) => handleUpdateProfile(profile.id, "family_name", v)}
                          placeholder="Nombre"
                          className="font-medium"
                        />
                        <EditableField
                          value={profile.email}
                          onSave={(v) => handleUpdateProfile(profile.id, "email", v)}
                          placeholder="Email"
                          prefix={<Mail className="h-3 w-3 text-muted-foreground" />}
                          className="text-xs text-muted-foreground"
                        />
                      </div>
                      <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
                        <EditableField
                          value={profile.phone}
                          onSave={(v) => handleUpdateProfile(profile.id, "phone", v)}
                          placeholder="Teléfono"
                          type="tel"
                          prefix={<Phone className="h-3 w-3" />}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        {activeSubs.length > 0 && (
                          <Badge variant="default" className="gap-1">
                            <Package className="h-3 w-3" />
                            {activeSubs.length} sub
                          </Badge>
                        )}
                        {customerDogs.length > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Dog className="h-3 w-3" />
                            {customerDogs.length}
                          </Badge>
                        )}
                        {customerOrders.length > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            {customerOrders.length}
                          </Badge>
                        )}
                      </div>
                      {totalSpent > 0 && (
                        <span className="font-bold text-primary">
                          ${totalSpent.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 border-t bg-muted/30 space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Contact Info */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Información de Contacto</h4>
                          <div className="text-sm space-y-2">
                            <EditableField
                              value={profile.email}
                              onSave={(v) => handleUpdateProfile(profile.id, "email", v)}
                              placeholder="Email"
                              prefix={<Mail className="h-4 w-4 text-muted-foreground" />}
                            />
                            <EditableField
                              value={profile.phone}
                              onSave={(v) => handleUpdateProfile(profile.id, "phone", v)}
                              placeholder="Teléfono"
                              type="tel"
                              prefix={<Phone className="h-4 w-4 text-muted-foreground" />}
                            />
                            <EditableField
                              value={profile.address}
                              onSave={(v) => handleUpdateProfile(profile.id, "address", v)}
                              placeholder="Dirección"
                              prefix={<MapPin className="h-4 w-4 text-muted-foreground" />}
                            />
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground">CP:</span>
                              <EditableField
                                value={profile.postal_code}
                                onSave={(v) => handleUpdateProfile(profile.id, "postal_code", v)}
                                placeholder="CP"
                                className="text-xs"
                                inputClassName="w-20"
                              />
                              <EditableField
                                value={profile.colonia}
                                onSave={(v) => handleUpdateProfile(profile.id, "colonia", v)}
                                placeholder="Colonia"
                                className="text-xs"
                              />
                            </div>
                            <EditableField
                              value={profile.references_notes}
                              onSave={(v) => handleUpdateProfile(profile.id, "references_notes", v)}
                              placeholder="Referencias..."
                              emptyText="Sin referencias"
                              className="text-xs text-muted-foreground"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Registro: {format(new Date(profile.created_at), "d MMM yyyy", { locale: es })}
                          </p>
                          <div onClick={(e) => e.stopPropagation()}>
                            <EditableSelect
                              value={profile.acquisition_channel}
                              options={ACQUISITION_OPTIONS}
                              onSave={(v) => handleUpdateProfile(profile.id, "acquisition_channel", v)}
                              placeholder="Canal"
                            />
                          </div>
                        </div>

                        {/* Dogs */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Dog className="h-4 w-4" />
                            Perritos ({customerDogs.length})
                          </h4>
                          {customerDogs.length > 0 ? (
                            <div className="space-y-2">
                              {customerDogs.map((dog) => (
                                <div key={dog.id} className="p-2 bg-background rounded border text-sm">
                                  <p className="font-medium">{dog.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {dog.weight_kg}kg • {dog.age_stage} • {dog.activity_level}
                                  </p>
                                  <p className="text-xs">
                                    Recomendado: {dog.recommended_protein} {dog.recommended_plan_type}
                                  </p>
                                  <Badge 
                                    variant={dog.status === "active" ? "default" : "secondary"}
                                    className="text-xs mt-1"
                                  >
                                    {dog.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin perritos registrados</p>
                          )}
                        </div>

                        {/* Subscriptions & Orders */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Suscripciones ({customerSubs.length})
                          </h4>
                          {customerSubs.length > 0 ? (
                            <div className="space-y-2">
                              {customerSubs.map((sub) => (
                                <div key={sub.id} className="p-2 bg-background rounded border text-sm">
                                  <p className="font-medium">{sub.plan_type} - {sub.protein_line}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {sub.frequency} • {sub.presentation}
                                  </p>
                                  <Badge 
                                    variant={sub.status === "active" ? "default" : "secondary"}
                                    className="text-xs mt-1"
                                  >
                                    {sub.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin suscripciones</p>
                          )}

                          <h4 className="text-sm font-medium flex items-center gap-2 pt-2">
                            <ShoppingCart className="h-4 w-4" />
                            Últimos Pedidos ({customerOrders.length})
                          </h4>
                          {customerOrders.slice(0, 3).map((order) => (
                            <div key={order.id} className="p-2 bg-background rounded border text-sm">
                              <div className="flex justify-between">
                                <span className="font-mono">{order.order_number}</span>
                                <span className="font-bold">${order.total}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(order.created_at), "d MMM yyyy", { locale: es })}
                              </p>
                            </div>
                          ))}
                          {customerOrders.length === 0 && (
                            <p className="text-sm text-muted-foreground">Sin pedidos</p>
                          )}
                        </div>
                      </div>

                      {/* Special Notes */}
                      <div className="pt-2 border-t space-y-2">
                        <h4 className="text-sm font-medium">Notas Especiales</h4>
                        <EditableField
                          value={profile.special_needs}
                          onSave={(v) => handleUpdateProfile(profile.id, "special_needs", v)}
                          placeholder="Necesidades especiales..."
                          emptyText="Sin necesidades especiales"
                          className="text-sm"
                        />
                        <EditableField
                          value={profile.special_notes}
                          onSave={(v) => handleUpdateProfile(profile.id, "special_notes", v)}
                          placeholder="Notas adicionales..."
                          emptyText="Sin notas"
                          className="text-sm"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://wa.me/52${profile.phone?.replace(/\D/g, '')}`, "_blank")}
                          className="gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay clientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
