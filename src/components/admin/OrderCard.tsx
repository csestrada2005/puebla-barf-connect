import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableField } from "./EditableField";
import { EditableSelect } from "./EditableSelect";
import { 
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type OrderStatus = "new" | "confirmed" | "in_route" | "delivered" | "cancelled";

const STATUS_OPTIONS = [
  { value: "new", label: "Nuevo", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Confirmado", color: "bg-yellow-100 text-yellow-800" },
  { value: "in_route", label: "En ruta", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" },
];

const PAYMENT_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
];

interface OrderCardProps {
  order: any;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
  onToggleExpand: () => void;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function OrderCard({
  order,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onUpdate,
}: OrderCardProps) {
  const status = (order.status as OrderStatus) || "new";
  const statusConfig = STATUS_OPTIONS.find((s) => s.value === status);

  const formatItems = (items: any) => {
    if (!items || !Array.isArray(items)) return "—";
    return items.map((item: any) => `${item.name} x${item.quantity}`).join(", ");
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        isSelected ? "ring-2 ring-primary border-primary" : ""
      }`}
    >
      {/* Order Header */}
      <div 
        className="p-4 bg-card hover:bg-muted/50 cursor-pointer flex items-center justify-between gap-3"
        onClick={onToggleExpand}
      >
        {/* Checkbox */}
        <div 
          className="flex items-center"
          onClick={onToggleSelect}
        >
          <Checkbox 
            checked={isSelected}
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap flex-1">
          {/* Order number & date */}
          <div>
            <p className="font-mono font-bold text-sm">{order.order_number}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(order.created_at), "d MMM, HH:mm", { locale: es })}
            </p>
          </div>

          {/* Delivery day & time */}
          {order.delivery_date && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary">
              <Calendar className="h-3.5 w-3.5" />
              <div className="text-xs font-medium leading-tight">
                <p className="capitalize">{format(parseISO(order.delivery_date), "EEEE d MMM", { locale: es })}</p>
                <p className="text-[10px] opacity-80">{format(parseISO(order.delivery_date), "h:mm a")}</p>
              </div>
            </div>
          )}
          
          {/* Customer name - editable */}
          <div className="min-w-[120px]">
            <EditableField
              value={order.customer_name}
              onSave={(v) => onUpdate("customer_name", v)}
              placeholder="Nombre"
              className="font-medium"
            />
            <EditableField
              value={order.customer_phone}
              onSave={(v) => onUpdate("customer_phone", v)}
              placeholder="Teléfono"
              type="tel"
              prefix={<Phone className="h-3 w-3 text-muted-foreground" />}
              className="text-xs text-muted-foreground"
            />
          </div>

          {/* Status - editable */}
          <EditableSelect
            value={order.status}
            options={STATUS_OPTIONS}
            onSave={(v) => onUpdate("status", v)}
          />

          {/* Payment & Total */}
          <div className="flex items-center gap-2">
            <EditableSelect
              value={order.payment_method}
              options={PAYMENT_OPTIONS}
              onSave={(v) => onUpdate("payment_method", v)}
              className="w-[110px]"
            />
            {order.payment_method === "tarjeta" && (
              <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className={`text-xs ${order.payment_status === "paid" ? "bg-green-600" : "bg-yellow-500 text-yellow-950"}`}>
                {order.payment_status === "paid" ? "✅ Pagado" : "⏳ Pendiente"}
              </Badge>
            )}
            <EditableField
              value={order.total?.toString()}
              onSave={(v) => onUpdate("total", parseFloat(v) || 0)}
              type="number"
              prefix={<span className="font-bold">$</span>}
              className="font-bold"
              inputClassName="w-20"
            />
          </div>

          {/* Delivery photo indicator */}
          {order.delivery_photo_url && (
            <Badge variant="outline" className="gap-1">
              <ImageIcon className="h-3 w-3" />
              Foto
            </Badge>
          )}
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
              <EditableField
                value={order.customer_address}
                onSave={(v) => onUpdate("customer_address", v)}
                placeholder="Dirección"
                className="text-sm"
              />
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <EditableField
                  value={order.delivery_date}
                  onSave={(v) => onUpdate("delivery_date", v)}
                  placeholder="Fecha de entrega"
                  type="date"
                  className="text-xs text-muted-foreground"
                  emptyText="Sin fecha"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Productos</h4>
              <p className="text-sm">{formatItems(order.items)}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  Subtotal: 
                  <EditableField
                    value={order.subtotal?.toString()}
                    onSave={(v) => onUpdate("subtotal", parseFloat(v) || 0)}
                    type="number"
                    prefix={<span>$</span>}
                    inputClassName="w-16"
                  />
                </span>
                <span className="flex items-center gap-1">
                  Envío: 
                  <EditableField
                    value={(order.delivery_fee || 0).toString()}
                    onSave={(v) => onUpdate("delivery_fee", parseFloat(v) || 0)}
                    type="number"
                    prefix={<span>$</span>}
                    inputClassName="w-16"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Notas de entrega</h4>
            <EditableField
              value={order.delivery_notes}
              onSave={(v) => onUpdate("delivery_notes", v)}
              placeholder="Agregar notas..."
              emptyText="Sin notas"
              className="text-sm"
            />
          </div>

          {/* Driver notes if any */}
          {order.driver_notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notas del chofer</h4>
              <p className="text-sm text-muted-foreground">{order.driver_notes}</p>
            </div>
          )}

          {/* Delivery photo if any */}
          {order.delivery_photo_url && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Foto de entrega
              </h4>
              <a 
                href={order.delivery_photo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={order.delivery_photo_url} 
                  alt="Foto de entrega" 
                  className="h-32 w-auto rounded-lg border object-cover hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          )}

          {/* Quick status buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground mr-2">Cambiar a:</span>
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={status === opt.value ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate("status", opt.value);
                }}
                className={status === opt.value ? "" : "opacity-70"}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
