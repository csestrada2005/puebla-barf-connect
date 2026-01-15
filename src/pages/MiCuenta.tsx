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
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Dog, MapPin, Package, LogOut, Save } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function MiCuenta() {
  const { user, signOut } = useAuthContext();
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});

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
          <div className="flex items-center justify-between mb-8">
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

          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="perfil" className="gap-2">
                <User className="h-4 w-4" />
                Mi Perfil
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="gap-2">
                <Package className="h-4 w-4" />
                Mis Pedidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-6">
              {/* Pet Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dog className="h-5 w-5 text-primary" />
                    Mi Mejor Amigo
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pet_name">Nombre de la mascota</Label>
                    <Input
                      id="pet_name"
                      name="pet_name"
                      defaultValue={profile?.pet_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="family_name">Apellido de la familia</Label>
                    <Input
                      id="family_name"
                      name="family_name"
                      defaultValue={profile?.family_name}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
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

            <TabsContent value="pedidos">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pedidos</CardTitle>
                  <CardDescription>
                    Tus últimos pedidos realizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <Link 
                          key={order.id} 
                          to={`/pedido/${order.order_number}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium">#{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("es-MX")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ${Number(order.total).toLocaleString("es-MX")}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {order.status}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aún no tienes pedidos</p>
                      <Button asChild className="mt-4">
                        <Link to="/tienda">Ir a la tienda</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
