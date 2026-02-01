import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuthContext } from "@/components/auth";
import { useProfile, ProfileFormData } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Dog, MapPin, Package, LogOut, Save, Calendar, Truck, Sparkles, Plus, XCircle, Camera } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BirthdayBanner, CancellationModal, DogCard } from "@/components/plan";
import { isBirthday } from "@/hooks/usePlanCalculator";

export default function MiCuenta() {
  const { user, signOut } = useAuthContext();
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  // Fetch user's active subscriptions
  const { data: subscriptions } = useQuery({
    queryKey: ["my-subscriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const activeSubscription = subscriptions?.find(s => s.status === "active");

  // Fetch user's dog profiles
  const { data: dogProfiles } = useQuery({
    queryKey: ["my-dogs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dog_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Filter active dogs (exclude deceased/archived)
  const activeDogs = dogProfiles?.filter(d => d.status !== 'deceased' && d.status !== 'archived') || [];
  const birthdayDog = activeDogs.find(d => isBirthday(d.birthday));

  // Fetch user orders
  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(formData).length === 0) return;
    
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente",
      });
      setFormData({});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate("/");
  };

  const handleOpenCancelModal = (subscription: any) => {
    setSelectedSubscription(subscription);
    setCancelModalOpen(true);
  };

  const handleCancelled = () => {
    queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["my-dogs"] });
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case "monthly": return "Mensual";
      case "semestral": return "Semestral";
      case "annual": return "Anual";
      default: return planType;
    }
  };

  const getSubscriptionTypeLabel = (type: string) => {
    return type === "pro" ? "Pro" : "Básico";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Mi Cuenta</h1>
              <p className="text-muted-foreground">
                Hola, Familia {profile?.family_name} 👋
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>

          {/* Birthday Banner */}
          {birthdayDog && (
            <div className="mb-6">
              <BirthdayBanner dogName={birthdayDog.name} />
            </div>
          )}

          <Tabs defaultValue="suscripcion" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suscripcion" className="gap-2">
                <Package className="h-4 w-4" />
                Mi Suscripción
              </TabsTrigger>
              <TabsTrigger value="perros" className="gap-2">
                <Dog className="h-4 w-4" />
                Mis Perros
              </TabsTrigger>
              <TabsTrigger value="perfil" className="gap-2">
                <User className="h-4 w-4" />
                Mi Perfil
              </TabsTrigger>
            </TabsList>

            {/* Subscription Tab */}
            <TabsContent value="suscripcion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Mi Suscripción Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeSubscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">
                              Plan {activeSubscription.frequency_days === 15 ? '15 Días' : '7 Días'}
                            </span>
                            <Badge className="bg-primary/10 text-primary border-0">
                              {activeSubscription.status === "active" ? "Activo" : activeSubscription.status}
                            </Badge>
                            {activeSubscription.type && (
                              <Badge variant="secondary">
                                {getSubscriptionTypeLabel(activeSubscription.type)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activeSubscription.protein_line} • {activeSubscription.presentation}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/suscripcion">Modificar</Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleOpenCancelModal(activeSubscription)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <Truck className="h-8 w-8 text-secondary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Próxima Entrega</p>
                            <p className="font-semibold">
                              {activeSubscription.next_delivery_date 
                                ? format(new Date(activeSubscription.next_delivery_date), "EEEE d 'de' MMMM", { locale: es })
                                : "Por confirmar"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <Calendar className="h-8 w-8 text-secondary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Próxima Facturación</p>
                            <p className="font-semibold">
                              {activeSubscription.next_billing_date 
                                ? format(new Date(activeSubscription.next_billing_date), "d 'de' MMMM yyyy", { locale: es })
                                : "Por confirmar"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground mb-4">Aún no tienes una suscripción activa</p>
                      <Button asChild className="gap-2">
                        <Link to="/ai">
                          <Sparkles className="h-4 w-4" />
                          Obtener mi Plan Personalizado
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pedidos</CardTitle>
                  <CardDescription>Tus últimos pedidos realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders && orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order: any) => (
                        <Link 
                          key={order.id} 
                          to={`/pedido/${order.order_number}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium">#{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("es-MX")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${order.total?.toLocaleString("es-MX")}</p>
                              <Badge variant="outline" className="text-xs">
                                {order.status === "delivered" ? "Entregado" : 
                                 order.status === "pending" ? "Pendiente" : order.status}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">
                      Aún no tienes pedidos
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dogs Tab - Multi-Dog Dashboard */}
            <TabsContent value="perros" className="space-y-6">
              {/* Add Dog Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Mis Perros</h2>
                  <p className="text-sm text-muted-foreground">
                    Perfiles nutricionales calculados por El Dogtor
                  </p>
                </div>
                <Button asChild className="gap-2">
                  <Link to="/ai?intent=new_profile">
                    <Plus className="h-4 w-4" />
                    Agregar Perro
                  </Link>
                </Button>
              </div>

              {/* Dog Cards */}
              {activeDogs.length > 0 ? (
                <div className="grid gap-4">
                  {activeDogs.map((dog: any) => (
                    <DogCard 
                      key={dog.id} 
                      dog={dog} 
                      onImageUpdate={async (imageUrl) => {
                        try {
                          await supabase
                            .from("dog_profiles")
                            .update({ image_url: imageUrl })
                            .eq("id", dog.id);
                          queryClient.invalidateQueries({ queryKey: ["my-dogs"] });
                          toast({
                            title: "Foto actualizada",
                            description: `La foto de ${dog.name} ha sido guardada`,
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: "No se pudo guardar la foto",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Dog className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-2">No tienes perros registrados</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Crea tu primer perfil nutricional con El Dogtor
                    </p>
                    <Button asChild className="gap-2">
                      <Link to="/ai?intent=new_profile">
                        <Sparkles className="h-4 w-4" />
                        Crear Perfil
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="perfil" className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="family_name">Apellido de la Familia</Label>
                      <Input
                        id="family_name"
                        name="family_name"
                        defaultValue={profile?.family_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={profile?.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono WhatsApp</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile?.phone}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Dirección de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección completa</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={profile?.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="colonia">Colonia</Label>
                      <Input
                        id="colonia"
                        name="colonia"
                        defaultValue={profile?.colonia || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Código Postal</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        defaultValue={profile?.postal_code}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="references_notes">Referencias</Label>
                    <Input
                      id="references_notes"
                      name="references_notes"
                      defaultValue={profile?.references_notes || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="special_notes">Notas especiales</Label>
                    <Textarea
                      id="special_notes"
                      name="special_notes"
                      defaultValue={profile?.special_notes || ""}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleSave} 
                disabled={isSaving || Object.keys(formData).length === 0}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Cancellation Modal */}
      {selectedSubscription && (
        <CancellationModal
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
          subscriptionId={selectedSubscription.id}
          dogName={activeDogs[0]?.name}
          dogId={activeDogs[0]?.id}
          onCancelled={handleCancelled}
        />
      )}
    </Layout>
  );
}
