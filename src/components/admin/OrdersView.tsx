import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Search, 
  Loader2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
  Send,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type OrderStatus = "new" | "confirmed" | "in_route" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; next?: OrderStatus }> = {
  new: { label: "Nuevo", color: "bg-blue-100 text-blue-800", next: "confirmed" },
  confirmed: { label: "Confirmado", color: "bg-yellow-100 text-yellow-800", next: "in_route" },
  in_route: { label: "En ruta", color: "bg-purple-100 text-purple-800", next: "delivered" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function OrdersView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

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

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Estado actualizado" });
    },
    onError: () => {
      toast({ title: "Error al actualizar", variant: "destructive" });
    },
  });

  // Update delivery notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: string; notes: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ delivery_notes: notes, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setEditingNotes(null);
      toast({ title: "Notas guardadas" });
    },
    onError: () => {
      toast({ title: "Error al guardar", variant: "destructive" });
    },
  });

  // Filter orders
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && order.status === statusFilter;
  }) || [];

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const startEditNotes = (orderId: string, currentNotes: string | null) => {
    setEditingNotes(orderId);
    setTempNotes(currentNotes || "");
  };

  const saveNotes = (orderId: string) => {
    updateNotesMutation.mutate({ orderId, notes: tempNotes });
  };

  const cancelEditNotes = () => {
    setEditingNotes(null);
    setTempNotes("");
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

  const formatItems = (items: any) => {
    if (!items || !Array.isArray(items)) return "—";
    return items.map((item: any) => `${item.name} x${item.quantity}`).join(", ");
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
      // Get selected order details
      const selectedOrderData = orders?.filter(o => selectedOrders.has(o.id)) || [];
      
      if (selectedOrderData.length === 0) {
        toast({ title: "No se encontraron los pedidos seleccionados", variant: "destructive" });
        return;
      }

      // Format the message
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
        
        // Add confirmation link with delivery token
        if (order.delivery_token) {
          message += `\n✅ *Confirmar entrega:*\n${baseUrl}/entrega/${order.delivery_token}\n`;
        }
        
        message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
      });

      message += `✅ ¡Buen día de entregas!`;

      // Generate WhatsApp link
      const whatsappLink = `https://wa.me/52${driverPhone}?text=${encodeURIComponent(message)}`;
      
      toast({
        title: `${selectedOrderData.length} pedido(s) listos`,
        description: "Abriendo WhatsApp...",
      });

      window.open(whatsappLink, "_blank");
      
      // Clear selection after sending
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

        {/* Selection controls and WhatsApp button */}
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
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {sendingWhatsApp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  Enviar {selectedOrders.size} al chofer
                </Button>
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
            {filteredOrders.map((order: any) => {
              const status = (order.status as OrderStatus) || "new";
              const statusConfig = STATUS_CONFIG[status];
              const isExpanded = expandedOrder === order.id;
              const isEditingThis = editingNotes === order.id;
              const isSelected = selectedOrders.has(order.id);

              return (
                <div
                  key={order.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isSelected ? "ring-2 ring-primary border-primary" : ""
                  }`}
                >
                  {/* Order Header */}
                  <div 
                    className="p-4 bg-card hover:bg-muted/50 cursor-pointer flex items-center justify-between gap-3"
                    onClick={() => toggleExpand(order.id)}
                  >
                    {/* Checkbox */}
                    <div 
                      className="flex items-center"
                      onClick={(e) => toggleOrderSelection(order.id, e)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center gap-4 flex-wrap flex-1">
                      <div>
                        <p className="font-mono font-bold text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "d MMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.customer_phone}
                        </p>
                      </div>
                      <Badge className={`${statusConfig.color} border-0`}>
                        {statusConfig.label}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {order.payment_method === "efectivo" ? (
                          <Banknote className="h-4 w-4 text-green-600" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="font-bold">${order.total}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                      {/* Address & Delivery */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Dirección de entrega
                          </h4>
                          <p className="text-sm">{order.customer_address}</p>
                          {order.delivery_date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Entrega: {order.delivery_date}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Productos</h4>
                          <p className="text-sm">{formatItems(order.items)}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Subtotal: ${order.subtotal}</span>
                            <span>Envío: ${order.delivery_fee || 0}</span>
                            <span className="font-bold text-foreground">Total: ${order.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Notas de entrega</h4>
                          {!isEditingThis && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditNotes(order.id, order.delivery_notes);
                              }}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                        {isEditingThis ? (
                          <div className="flex gap-2">
                            <Input
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Agregar notas..."
                              className="flex-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveNotes(order.id);
                              }}
                              disabled={updateNotesMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEditNotes();
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {order.delivery_notes || "Sin notas"}
                          </p>
                        )}
                      </div>

                      {/* Status Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <Button
                            key={key}
                            variant={status === key ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(order.id, key as OrderStatus);
                            }}
                            disabled={updateStatusMutation.isPending}
                            className={status === key ? "" : "opacity-70"}
                          >
                            {config.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
