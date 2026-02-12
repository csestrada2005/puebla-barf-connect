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
  Send,
  ExternalLink,
  Plus,
  Trash2,
  User,
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  phone: string;
}

export default function SettingsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveryHour, setDeliveryHour] = useState("07:00");
  const [testingNotification, setTestingNotification] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");

  // Fetch driver config
  const { data: driverConfig, isLoading: driverLoading } = useQuery({
    queryKey: ["admin-driver-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["drivers", "driver_phone", "delivery_notification_hour"]);
      
      if (error) throw error;
      
      const config: Record<string, any> = {};
      data?.forEach((item) => {
        config[item.key] = item.value;
      });
      return config;
    },
  });

  // Initialize from config
  useEffect(() => {
    if (driverConfig) {
      // Support both old single driver format and new multi-driver format
      if (driverConfig.drivers && Array.isArray(driverConfig.drivers)) {
        setDrivers(driverConfig.drivers);
      } else if (driverConfig.driver_phone) {
        // Legacy format: single driver
        setDrivers([{ id: "1", name: "Chofer principal", phone: driverConfig.driver_phone }]);
      }
      setDeliveryHour(driverConfig.delivery_notification_hour || "07:00");
    }
  }, [driverConfig]);

  // Save driver config mutation
  const saveDriverConfigMutation = useMutation({
    mutationFn: async () => {
      const configs = [
        { key: "drivers", value: drivers },
        { key: "delivery_notification_hour", value: deliveryHour },
        // Keep driver_phone for backwards compatibility (first driver)
        { key: "driver_phone", value: drivers[0]?.phone || "" },
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

  const addDriver = () => {
    if (!newDriverName.trim() || !newDriverPhone.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Ingresa nombre y teléfono del chofer.",
        variant: "destructive",
      });
      return;
    }
    if (newDriverPhone.length !== 10) {
      toast({
        title: "Teléfono inválido",
        description: "El teléfono debe tener 10 dígitos.",
        variant: "destructive",
      });
      return;
    }
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
    };
    setDrivers([...drivers, newDriver]);
    setNewDriverName("");
    setNewDriverPhone("");
    // Driver added, no toast
  };

  const removeDriver = (driverId: string) => {
    setDrivers(drivers.filter(d => d.id !== driverId));
    // Driver removed, no toast
  };

  const updateDriver = (driverId: string, field: keyof Driver, value: string) => {
    setDrivers(drivers.map(d => 
      d.id === driverId ? { ...d, [field]: value } : d
    ));
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  return (
    <div className="flex justify-center">
      <div className="space-y-6 w-full max-w-2xl">
        {/* Driver WhatsApp Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Configuración de Choferes
            </CardTitle>
            <CardDescription>
              Configura los números de WhatsApp de los choferes para recibir automáticamente las entregas del día.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing drivers list */}
            {drivers.length > 0 && (
              <div className="space-y-3">
                <Label>Choferes registrados</Label>
                {drivers.map((driver, index) => (
                  <div key={driver.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={driver.name}
                        onChange={(e) => updateDriver(driver.id, "name", e.target.value)}
                        placeholder="Nombre"
                        className="h-8"
                      />
                      <div className="flex gap-1">
                        <span className="flex items-center px-2 bg-background rounded border text-xs text-muted-foreground">
                          +52
                        </span>
                        <Input
                          type="tel"
                          value={driver.phone}
                          onChange={(e) => updateDriver(driver.id, "phone", e.target.value.replace(/\D/g, ""))}
                          placeholder="Teléfono"
                          className="h-8 flex-1"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDriver(driver.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new driver */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Añadir nuevo chofer</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre del chofer"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <span className="flex items-center px-2 bg-muted rounded-l-md border border-r-0 text-sm text-muted-foreground">
                    +52
                  </span>
                  <Input
                    type="tel"
                    placeholder="Teléfono"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-32 rounded-l-none"
                    maxLength={10}
                  />
                </div>
                <Button onClick={addDriver} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Añadir
                </Button>
              </div>
            </div>

            <Button
              onClick={() => saveDriverConfigMutation.mutate()}
              disabled={saveDriverConfigMutation.isPending || drivers.length === 0}
              className="w-full gap-2"
            >
              {saveDriverConfigMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar configuración
            </Button>

            {drivers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <MessageSquare className="h-4 w-4" />
                {drivers.length} chofer{drivers.length > 1 ? "es" : ""} configurado{drivers.length > 1 ? "s" : ""}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-medium text-sm mb-2">¿Cómo funciona?</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Desde la sección de Pedidos, envía manualmente los pedidos del día a los choferes por WhatsApp</li>
              <li>El mensaje incluye todas las entregas seleccionadas</li>
              <li>Incluye: nombre del cliente, dirección, teléfono y productos</li>
              <li>Los pedidos en estado "Confirmado" se incluyen automáticamente</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
