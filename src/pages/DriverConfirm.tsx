import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Truck, 
  MapPin, 
  Phone, 
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import logoWhite from "@/assets/brand/logo-white.png";
import DeliveryPhotoUpload from "@/components/driver/DeliveryPhotoUpload";

type DriverStatus = "delivered" | "postponed" | "failed";

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  items: any;
  total: number;
  payment_method: string;
  delivery_notes: string | null;
  status: string;
  driver_status: string | null;
  driver_notes: string | null;
  driver_confirmed_at: string | null;
  delivery_photo_url: string | null;
}

export default function DriverConfirm() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError("Token inválido");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc("get_order_by_token", { p_token: token });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setOrder(data[0] as OrderData);
          setNotes(data[0].driver_notes || "");
        } else {
          setError("Pedido no encontrado");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Error al cargar el pedido");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const handleConfirm = async (status: DriverStatus) => {
    if (!token) return;

    // Require photo for "delivered" status
    if (status === "delivered" && !photoUrl) {
      toast({
        title: "Foto requerida",
        description: "Por favor sube una foto antes de confirmar la entrega",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .rpc("update_order_by_token", {
          p_token: token,
          p_driver_status: status,
          p_driver_notes: notes || null,
          p_delivery_photo_url: photoUrl || null,
        });

      if (error) throw error;

      toast({
        title: status === "delivered" 
          ? "✅ Entrega confirmada" 
          : status === "postponed" 
            ? "🕐 Entrega pospuesta"
            : "❌ Problema reportado",
        description: "El estado se ha actualizado correctamente",
      });

      // Refresh order data
      const { data: refreshed } = await supabase
        .rpc("get_order_by_token", { p_token: token });
      
      if (refreshed && refreshed.length > 0) {
        setOrder(refreshed[0] as OrderData);
        setPhotoUrl(refreshed[0].delivery_photo_url || "");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatItems = (items: any) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item: any) => `${item.name} x${item.quantity}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-bold mb-2">Error</h2>
            <p className="text-muted-foreground">{error || "Pedido no encontrado"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadyConfirmed = !!order.driver_status;

  return (
    <div className="min-h-screen bg-primary p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <img src={logoWhite} alt="Raw Paw" className="h-10 mx-auto mb-2" />
          <h1 className="text-white font-bold text-lg flex items-center justify-center gap-2">
            <Truck className="h-5 w-5" />
            Confirmación de Entrega
          </h1>
        </div>

        {/* Order Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-mono">{order.order_number}</CardTitle>
              {order.driver_status && (
                <Badge 
                  className={
                    order.driver_status === "delivered" ? "bg-green-100 text-green-800" :
                    order.driver_status === "postponed" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }
                >
                  {order.driver_status === "delivered" ? "Entregado" :
                   order.driver_status === "postponed" ? "Pospuesto" : "Problema"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Info */}
            <div className="space-y-2">
              <h3 className="font-medium">{order.customer_name}</h3>
              <p className="text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                {order.customer_address}
              </p>
              <a 
                href={`tel:${order.customer_phone}`}
                className="text-sm flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {order.customer_phone}
              </a>
            </div>

            {/* Products */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos
              </h4>
              <ul className="text-sm space-y-1">
                {formatItems(order.items).map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>

            {/* Payment */}
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm">
                {order.payment_method === "efectivo" ? "💵 Cobrar en efectivo" : "💳 Ya pagado"}
              </span>
              <span className="text-xl font-bold">${order.total}</span>
            </div>

            {/* Delivery Notes */}
            {order.delivery_notes && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">📝 Notas: </span>
                  {order.delivery_notes}
                </p>
              </div>
            )}

            {/* Photo Upload */}
            {!isAlreadyConfirmed && order && (
              <DeliveryPhotoUpload
                orderId={order.id}
                onPhotoUploaded={setPhotoUrl}
                existingPhoto={order.delivery_photo_url}
                disabled={submitting}
              />
            )}

            {/* Show existing photo if already confirmed */}
            {isAlreadyConfirmed && order?.delivery_photo_url && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Foto de entrega</label>
                <img
                  src={order.delivery_photo_url}
                  alt="Foto de entrega"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}

            {/* Driver Notes Input */}
            {!isAlreadyConfirmed && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas del chofer (opcional)</label>
                <Textarea
                  placeholder="Ej: Se entregó al vecino, cliente no contestó..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {/* Confirmation Buttons */}
            {!isAlreadyConfirmed ? (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  onClick={() => handleConfirm("delivered")}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 flex-col h-auto py-3"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 mb-1" />
                      <span className="text-xs">Entregado</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleConfirm("postponed")}
                  disabled={submitting}
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 flex-col h-auto py-3"
                >
                  <Clock className="h-6 w-6 mb-1" />
                  <span className="text-xs">Posponer</span>
                </Button>
                <Button
                  onClick={() => handleConfirm("failed")}
                  disabled={submitting}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 flex-col h-auto py-3"
                >
                  <XCircle className="h-6 w-6 mb-1" />
                  <span className="text-xs">Problema</span>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium">Estado ya confirmado</p>
                {order.driver_notes && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Notas: {order.driver_notes}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs">
          Raw Paw • Sistema de entregas
        </p>
      </div>
    </div>
  );
}
