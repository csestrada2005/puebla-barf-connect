import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  LogOut, 
  Package,
  Calendar,
  TrendingUp,
  Loader2,
  Search,
  Filter,
  Settings,
  Link as LinkIcon,
  Save,
  ExternalLink,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type AdminView = "dashboard" | "logistics" | "crm" | "settings";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;

  // Fetch subscriptions for logistics
  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          profiles:user_id (
            family_name,
            pet_name,
            address,
            phone,
            email
          )
        `)
        .eq("status", "active");
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch all profiles for CRM
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch subscription stats for chart
  const { data: subscriptionStats } = useQuery({
    queryKey: ["admin-subscription-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("created_at, plan_type")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Group by month
      const monthlyData: Record<string, number> = {};
      data?.forEach((sub) => {
        const month = format(new Date(sub.created_at), "MMM yyyy", { locale: es });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });
      
      return Object.entries(monthlyData).map(([month, count]) => ({
        month,
        subscriptions: count,
      }));
    },
    enabled: isAdmin,
  });

  // Fetch webhook URL from app_config
  const { data: webhookConfig, isLoading: webhookLoading } = useQuery({
    queryKey: ["admin-webhook-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "zapier_webhook_url")
        .maybeSingle();
      
      if (error) throw error;
      return data?.value as string | null;
    },
    enabled: isAdmin,
  });

  // Initialize webhook URL from config
  useEffect(() => {
    if (webhookConfig) {
      setWebhookUrl(webhookConfig);
    }
  }, [webhookConfig]);

  // Mutation to save webhook URL
  const saveWebhookMutation = useMutation({
    mutationFn: async (url: string) => {
      // Check if config exists
      const { data: existing } = await supabase
        .from("app_config")
        .select("id")
        .eq("key", "zapier_webhook_url")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("app_config")
          .update({ value: url as any, updated_at: new Date().toISOString() })
          .eq("key", "zapier_webhook_url");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("app_config")
          .insert({ key: "zapier_webhook_url", value: url as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-webhook-config"] });
      toast({
        title: "URL guardada",
        description: "El webhook de Zapier se ha configurado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error saving webhook:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la URL. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Loading states
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder al panel de administración.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get this week's deliveries
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  const thisWeekDeliveries = subscriptions?.filter((sub) => {
    if (!sub.next_delivery_date) return false;
    const deliveryDate = new Date(sub.next_delivery_date);
    return deliveryDate >= thisWeekStart && deliveryDate <= thisWeekEnd;
  }) || [];

  // Filter clients
  const filteredClients = clients?.filter((client) => {
    const matchesSearch = 
      client.family_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    // Add more filters as needed
    return matchesSearch;
  }) || [];

  const sidebarItems = [
    { id: "dashboard" as AdminView, label: "Dashboard", icon: LayoutDashboard },
    { id: "logistics" as AdminView, label: "Logística", icon: Truck },
    { id: "crm" as AdminView, label: "CRM", icon: Users },
    { id: "settings" as AdminView, label: "Configuración", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Raw Paw Admin</h2>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id)}
                        className={activeView === item.id ? "bg-primary/10 text-primary" : ""}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6 bg-muted/30">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">
              {activeView === "dashboard" && "Dashboard"}
              {activeView === "logistics" && "Logística - Esta Semana"}
              {activeView === "crm" && "CRM - Clientes"}
              {activeView === "settings" && "Configuración"}
            </h1>
          </div>

          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      Suscripciones Activas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Package className="h-8 w-8 text-primary" />
                      <span className="text-3xl font-bold">
                        {subscriptions?.length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      Entregas Esta Semana
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Truck className="h-8 w-8 text-secondary" />
                      <span className="text-3xl font-bold">
                        {thisWeekDeliveries.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      Total Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-8 w-8 text-accent" />
                      <span className="text-3xl font-bold">
                        {clients?.length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Nuevas Suscripciones por Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subscriptionStats || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="subscriptions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Logistics View */}
          {activeView === "logistics" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Entregas: {format(thisWeekStart, "d MMM", { locale: es })} - {format(thisWeekEnd, "d MMM yyyy", { locale: es })}
                </CardTitle>
                <CardDescription>
                  {thisWeekDeliveries.length} entregas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : thisWeekDeliveries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Cliente</th>
                          <th className="text-left py-3 px-2">Mascota</th>
                          <th className="text-left py-3 px-2">Cantidad</th>
                          <th className="text-left py-3 px-2">Dirección</th>
                          <th className="text-left py-3 px-2">Fecha</th>
                          <th className="text-left py-3 px-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {thisWeekDeliveries.map((sub: any) => (
                          <tr key={sub.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium">{sub.profiles?.family_name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{sub.profiles?.phone}</p>
                              </div>
                            </td>
                            <td className="py-3 px-2">{sub.profiles?.pet_name || "—"}</td>
                            <td className="py-3 px-2">{sub.weekly_amount_kg || sub.presentation}kg</td>
                            <td className="py-3 px-2 max-w-[200px] truncate">
                              {sub.profiles?.address || "—"}
                            </td>
                            <td className="py-3 px-2">
                              {sub.next_delivery_date 
                                ? format(new Date(sub.next_delivery_date), "EEE d MMM", { locale: es })
                                : "—"}
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant="secondary">{sub.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay entregas programadas esta semana</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* CRM View */}
          {activeView === "crm" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Clientes</CardTitle>
                    <CardDescription>{filteredClients.length} clientes registrados</CardDescription>
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
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredClients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Familia</th>
                          <th className="text-left py-3 px-2">Mascota</th>
                          <th className="text-left py-3 px-2">Email</th>
                          <th className="text-left py-3 px-2">Teléfono</th>
                          <th className="text-left py-3 px-2">Canal</th>
                          <th className="text-left py-3 px-2">Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map((client: any) => (
                          <tr key={client.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2 font-medium">{client.family_name}</td>
                            <td className="py-3 px-2">{client.pet_name}</td>
                            <td className="py-3 px-2">{client.email}</td>
                            <td className="py-3 px-2">{client.phone}</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className="capitalize">
                                {client.acquisition_channel || "web"}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground">
                              {format(new Date(client.created_at), "d MMM yyyy", { locale: es })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron clientes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings View */}
          {activeView === "settings" && (
            <div className="space-y-6 max-w-2xl">
              {/* Zapier Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Integración con Google Sheets
                  </CardTitle>
                  <CardDescription>
                    Conecta tu cuenta de Zapier para sincronizar pedidos automáticamente a Google Sheets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL del Webhook de Zapier</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhook-url"
                        type="url"
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => saveWebhookMutation.mutate(webhookUrl)}
                        disabled={saveWebhookMutation.isPending}
                        className="gap-2"
                      >
                        {saveWebhookMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Guardar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cada pedido nuevo se enviará automáticamente a esta URL.
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm">¿Cómo configurar Zapier?</h4>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Ve a <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">zapier.com <ExternalLink className="h-3 w-3" /></a> y crea una cuenta gratuita</li>
                      <li>Crea un nuevo Zap</li>
                      <li>Como trigger, selecciona <strong>Webhooks by Zapier</strong> → <strong>Catch Hook</strong></li>
                      <li>Copia la URL del webhook que te da Zapier y pégala aquí</li>
                      <li>Como action, selecciona <strong>Google Sheets</strong> → <strong>Create Spreadsheet Row</strong></li>
                      <li>Conecta tu cuenta de Google y selecciona tu hoja de cálculo</li>
                      <li>Mapea los campos: fecha, orden, cliente, teléfono, productos, total, etc.</li>
                    </ol>
                  </div>

                  {webhookConfig && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Webhook configurado y activo
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
