import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Loader2, 
  Truck,
  MessageSquare,
} from "lucide-react";

export default function SettingsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [driverPhone, setDriverPhone] = useState("");
  const [deliveryHour, setDeliveryHour] = useState("07:00");

  // Fetch driver config
  const { data: driverConfig, isLoading: driverLoading } = useQuery({
    queryKey: ["admin-driver-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["driver_phone", "delivery_notification_hour"]);
      
      if (error) throw error;
      
      const config: Record<string, string> = {};
      data?.forEach((item) => {
        config[item.key] = item.value as string;
      });
      return config;
    },
  });

  // Initialize from config
  useEffect(() => {
    if (driverConfig) {
      setDriverPhone(driverConfig.driver_phone || "");
      setDeliveryHour(driverConfig.delivery_notification_hour || "07:00");
    }
  }, [driverConfig]);

  // Save driver config mutation
  const saveDriverConfigMutation = useMutation({
    mutationFn: async () => {
      const configs = [
        { key: "driver_phone", value: driverPhone },
        { key: "delivery_notification_hour", value: deliveryHour },
      ];

      for (const config of configs) {
        const { data: existing } = await supabase
          .from("app_config")
          .select("id")
          .eq("key", config.key)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("app_config")
            .update({ value: config.value as any, updated_at: new Date().toISOString() })
            .eq("key", config.key);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("app_config")
            .insert({ key: config.key, value: config.value as any });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-driver-config"] });
      toast({
        title: "Configuración guardada",
        description: "Los datos del chofer se han actualizado.",
      });
    },
    onError: (error) => {
      console.error("Error saving driver config:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    },
  });

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Driver WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Configuración del Chofer
          </CardTitle>
          <CardDescription>
            Configura el número de WhatsApp del chofer para recibir automáticamente las entregas del día.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver-phone">Número de WhatsApp del chofer</Label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 text-sm text-muted-foreground">
                +52
              </span>
              <Input
                id="driver-phone"
                type="tel"
                placeholder="221 123 4567"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1 rounded-l-none"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa los 10 dígitos sin espacios ni guiones
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-hour">Hora de envío del mensaje</Label>
            <Select value={deliveryHour} onValueChange={setDeliveryHour}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona hora" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour} hrs
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Cada día a esta hora se enviará el resumen de entregas por WhatsApp
            </p>
          </div>

          <Button
            onClick={() => saveDriverConfigMutation.mutate()}
            disabled={saveDriverConfigMutation.isPending || !driverPhone}
            className="w-full gap-2"
          >
            {saveDriverConfigMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar configuración
          </Button>

          {driverConfig?.driver_phone && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <MessageSquare className="h-4 w-4" />
              Mensaje configurado para +52 {driverConfig.driver_phone} a las {driverConfig.delivery_notification_hour || "07:00"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-medium text-sm mb-2">¿Cómo funciona?</h4>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Cada día a la hora configurada, el chofer recibirá un mensaje de WhatsApp</li>
            <li>El mensaje incluye todas las entregas pendientes del día</li>
            <li>Incluye: nombre del cliente, dirección, teléfono y productos</li>
            <li>Los pedidos en estado "Confirmado" se incluyen automáticamente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
