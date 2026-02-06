import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { OrderCard } from "./OrderCard";
import { 
  ShoppingCart, 
  Search, 
  Loader2,
  MessageSquare,
  CalendarDays,
  Trash2,
} from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type DateFilter = "all" | "today" | "this_week" | "next_week";

const DATE_FILTER_CONFIG: Record<DateFilter, { label: string }> = {
  all: { label: "Todos" },
  today: { label: "Hoy" },
  this_week: { label: "Esta semana" },
  next_week: { label: "Próxima semana" },
};

export default function OrdersView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Calculate date ranges
  const dateRanges = useMemo(() => {
    const now = new Date();
    return {
      today: {
        start: startOfDay(now),
        end: endOfDay(now),
      },
      this_week: {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      },
      next_week: {
        start: startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
        end: endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
      },
    };
  }, []);

  // Fetch all orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch driver config
  const { data: driverConfig } = useQuery({
    queryKey: ["admin-driver-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["driver_phone"]);
      
      if (error) throw error;
      
      const config: Record<string, string> = {};
      data?.forEach((item) => {
        config[item.key] = item.value as string;
      });
      return config;
    },
  });

  // Generic update mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Actualizado" });
    },
    onError: () => {
      toast({ title: "Error al actualizar", variant: "destructive" });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Pedido eliminado" });
    },
    onError: () => {
      toast({ title: "Error al eliminar", variant: "destructive" });
    },
  });

  // Delete selected orders mutation
  const deleteSelectedMutation = useMutation({
    mutationFn: async (orderIds: string[]) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .in("id", orderIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrders(new Set());
      toast({ title: "Pedidos eliminados" });
    },
    onError: () => {
      toast({ title: "Error al eliminar", variant: "destructive" });
    },
  });

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders?.filter((order) => {
      const matchesSearch = 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.includes(searchTerm) ||
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      if (dateFilter !== "all") {
        const orderDate = parseISO(order.created_at);
        const range = dateRanges[dateFilter];
        if (!isWithinInterval(orderDate, { start: range.start, end: range.end })) {
          return false;
        }
      }

      return true;
    }) || [];
  }, [orders, searchTerm, statusFilter, dateFilter, dateRanges]);

  const handleUpdateOrder = async (orderId: string, field: string, value: any) => {
    await updateOrderMutation.mutateAsync({ orderId, updates: { [field]: value } });
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const toggleOrderSelection = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllVisible = () => {
    const allIds = new Set(filteredOrders.map(o => o.id));
    setSelectedOrders(allIds);
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  const sendWhatsAppForSelected = async () => {
    if (selectedOrders.size === 0) {
      toast({ title: "Selecciona al menos un pedido", variant: "destructive" });
      return;
    }

    const driverPhone = driverConfig?.driver_phone;
    if (!driverPhone) {
      toast({ title: "Configura el número del chofer primero", variant: "destructive" });
      return;
    }

    setSendingWhatsApp(true);

    try {
      const selectedOrderData = orders?.filter(o => selectedOrders.has(o.id)) || [];
      
      if (selectedOrderData.length === 0) {
        toast({ title: "No se encontraron los pedidos seleccionados", variant: "destructive" });
        return;
      }

      const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
      const baseUrl = window.location.origin;
      
      let message = `🚚 *ENTREGAS PARA HOY*\n📅 ${today}\n\n`;
      message += `Total: ${selectedOrderData.length} entrega(s)\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

      selectedOrderData.forEach((order, index) => {
        const items = Array.isArray(order.items) 
          ? order.items.map((item: any) => `  • ${item.name} x${item.quantity}`).join('\n')
          : '  Sin productos';

        message += `📦 *PEDIDO ${index + 1}: ${order.order_number}*\n`;
        message += `👤 ${order.customer_name}\n`;
        message += `📍 ${order.customer_address}\n`;
        message += `📞 ${order.customer_phone}\n`;
        message += `\n🛒 Productos:\n${items}\n`;
        message += `💰 Total: $${order.total} (${order.payment_method === 'efectivo' ? 'Efectivo - COBRAR' : 'Tarjeta - YA PAGADO'})\n`;
        
        if (order.delivery_notes) {
          message += `📝 Notas: ${order.delivery_notes}\n`;
        }
        
        if (order.delivery_token) {
          message += `\n✅ *Confirmar entrega:*\n${baseUrl}/entrega/${order.delivery_token}\n`;
        }
        
        message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
      });

      message += `✅ ¡Buen día de entregas!`;

      const whatsappLink = `https://wa.me/52${driverPhone}?text=${encodeURIComponent(message)}`;
      
      toast({
        title: `${selectedOrderData.length} pedido(s) listos`,
        description: "Abriendo WhatsApp...",
      });

      window.open(whatsappLink, "_blank");
      setSelectedOrders(new Set());
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      toast({ title: "Error al generar mensaje", variant: "destructive" });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </CardTitle>
            <CardDescription>{filteredOrders.length} pedidos encontrados</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
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
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="new">Nuevos</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="in_route">En ruta</SelectItem>
                <SelectItem value="delivered">Entregados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="flex items-center gap-1 mr-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Fecha:</span>
          </div>
          {(Object.entries(DATE_FILTER_CONFIG) as [DateFilter, { label: string }][]).map(([key, config]) => (
            <Button
              key={key}
              variant={dateFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter(key)}
              className="h-8"
            >
              {config.label}
              {key !== "all" && dateFilter === key && (
                <span className="ml-1 text-xs opacity-70">
                  ({format(dateRanges[key].start, "d/M")} - {format(dateRanges[key].end, "d/M")})
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Selection controls */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllVisible}
            >
              Seleccionar todos ({filteredOrders.length})
            </Button>
            {selectedOrders.size > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  Limpiar ({selectedOrders.size})
                </Button>
                <Button
                  onClick={sendWhatsAppForSelected}
                  disabled={sendingWhatsApp || !driverConfig?.driver_phone}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {sendingWhatsApp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  Enviar {selectedOrders.size} al chofer
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      disabled={deleteSelectedMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar ({selectedOrders.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar {selectedOrders.size} pedido(s)?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Los pedidos seleccionados serán eliminados permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteSelectedMutation.mutate(Array.from(selectedOrders))}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {!driverConfig?.driver_phone && (
              <span className="text-xs text-muted-foreground">
                ⚠️ Configura el número del chofer primero
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrders.has(order.id)}
                isExpanded={expandedOrder === order.id}
                onToggleSelect={(e) => toggleOrderSelection(order.id, e)}
                onToggleExpand={() => toggleExpand(order.id)}
                onUpdate={(field, value) => handleUpdateOrder(order.id, field, value)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay pedidos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
