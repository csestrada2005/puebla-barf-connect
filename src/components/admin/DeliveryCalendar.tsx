import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { es } from "date-fns/locale";

// Delivery days: Tue=2, Wed=3, Fri=5
const DELIVERY_DAYS = [2, 3, 5];

interface DeliveryCalendarProps {
  orders: any[];
}

export function DeliveryCalendar({ orders }: DeliveryCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const base = new Date();
    const adjusted = weekOffset > 0 ? addWeeks(base, weekOffset) : weekOffset < 0 ? subWeeks(base, Math.abs(weekOffset)) : base;
    return startOfWeek(adjusted, { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group orders by delivery date
  const ordersByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    orders.forEach((order) => {
      if (order.delivery_date) {
        try {
          const d = parseISO(order.delivery_date);
          const key = format(d, "yyyy-MM-dd");
          if (!map[key]) map[key] = [];
          map[key].push(order);
        } catch {}
      }
    });
    return map;
  }, [orders]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selectedOrders = selectedDay ? ordersByDay[selectedDay] || [] : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            📅 Calendario de Entregas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(w => w - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">
              Hoy
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(w => w + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Semana del {format(weekStart, "d MMM", { locale: es })} al {format(weekEnd, "d MMM yyyy", { locale: es })}
        </p>
      </CardHeader>
      <CardContent>
        {/* Week grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayOrders = ordersByDay[key] || [];
            const isDeliveryDay = DELIVERY_DAYS.includes(getDay(day));
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary/10"
                    : isToday
                    ? "border-primary/50 bg-primary/5"
                    : isDeliveryDay
                    ? "border-dashed border-muted-foreground/30 hover:border-primary/50"
                    : "border-transparent bg-muted/30 opacity-50"
                }`}
              >
                <p className="text-[10px] text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </p>
                {dayOrders.length > 0 ? (
                  <Badge className="text-[10px] mt-1">{dayOrders.length} pedido{dayOrders.length > 1 ? "s" : ""}</Badge>
                ) : isDeliveryDay ? (
                  <p className="text-[10px] text-muted-foreground mt-1">—</p>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Selected day details */}
        {selectedDay && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-semibold capitalize">
              {format(parseISO(selectedDay), "EEEE d 'de' MMMM", { locale: es })}
              <Badge variant="secondary" className="ml-2">{selectedOrders.length} pedido{selectedOrders.length !== 1 ? "s" : ""}</Badge>
            </h4>
            {selectedOrders.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        order.status === "delivered" ? "bg-green-500" :
                        order.status === "in_route" ? "bg-purple-500" :
                        order.status === "confirmed" ? "bg-yellow-500" :
                        order.status === "cancelled" ? "bg-red-500" : "bg-blue-500"
                      }`} />
                      <div>
                        <p className="font-mono text-xs font-bold">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                        {order.delivery_date && (
                          <p className="text-[10px] text-muted-foreground">
                            🕐 {format(parseISO(order.delivery_date), "h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${order.total}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {order.status === "new" ? "Nuevo" :
                         order.status === "confirmed" ? "Confirmado" :
                         order.status === "in_route" ? "En ruta" :
                         order.status === "delivered" ? "Entregado" : "Cancelado"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay pedidos para este día</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}