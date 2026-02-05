import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  LogOut, 
  Package,
  Settings,
  ShoppingCart,
  Dog,
  Loader2,
} from "lucide-react";
import {
  OrdersView,
  SettingsView,
  DashboardView,
  CustomersView,
  SubscriptionsView,
  DogsView,
} from "@/components/admin";

type AdminView = "dashboard" | "orders" | "customers" | "subscriptions" | "dogs" | "settings";

export default function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [activeView, setActiveView] = useState<AdminView>("dashboard");

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;

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

  const sidebarItems = [
    { id: "dashboard" as AdminView, label: "Dashboard", icon: LayoutDashboard },
    { id: "orders" as AdminView, label: "Pedidos", icon: ShoppingCart },
    { id: "customers" as AdminView, label: "Clientes", icon: Users },
    { id: "subscriptions" as AdminView, label: "Suscripciones", icon: Package },
    { id: "dogs" as AdminView, label: "Perritos", icon: Dog },
    { id: "settings" as AdminView, label: "Configuración", icon: Settings },
  ];

  const viewTitles: Record<AdminView, string> = {
    dashboard: "Dashboard",
    orders: "Pedidos",
    customers: "Clientes",
    subscriptions: "Suscripciones",
    dogs: "Perritos",
    settings: "Configuración",
  };

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

        <main className="flex-1 p-6 bg-muted/30 overflow-auto">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">{viewTitles[activeView]}</h1>
          </div>

          {activeView === "dashboard" && <DashboardView />}
          {activeView === "orders" && <OrdersView />}
          {activeView === "customers" && <CustomersView />}
          {activeView === "subscriptions" && <SubscriptionsView />}
          {activeView === "dogs" && <DogsView />}
          {activeView === "settings" && <SettingsView />}
        </main>
      </div>
    </SidebarProvider>
  );
}
