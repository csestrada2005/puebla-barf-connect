import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Repeat, Star, Gift, Truck, CreditCard, Info, ShoppingCart, Dog, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/ai/LoginDialog";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

const proteinOptions = [{
  value: "pollo",
  label: "Pollo",
  emoji: "🍗",
  description: "Línea base, ideal para iniciar"
}, {
  value: "res",
  label: "Res",
  emoji: "🥩",
  description: "Línea premium, mayor proteína"
}];

const presentationOptions = [{
  value: "500g",
  label: "500g",
  description: "Perros pequeños (hasta 10kg)"
}, {
  value: "1kg",
  label: "1kg",
  description: "Perros medianos y grandes"
}];

const billingOptions = [{
  value: "mensual",
  label: "Mensual",
  description: "Pago cada mes, puedes iniciar con efectivo",
  discount: 0
}, {
  value: "anual",
  label: "Anual",
  description: "15% de descuento, solo tarjeta",
  discount: 15,
  requiresCard: true
}];

const frequencyOptions = [{
  value: "semanal",
  label: "Semanal",
  description: "Entregas cada 7 días"
}, {
  value: "quincenal",
  label: "Cada 15 días",
  description: "Entregas cada 2 semanas"
}];

export default function Suscripcion() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [protein, setProtein] = useState("pollo");
  const [presentation, setPresentation] = useState("500g");
  const [billing, setBilling] = useState("mensual");
  const [frequency, setFrequency] = useState("semanal");
  const [selectedDogId, setSelectedDogId] = useState<string>("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const { data: products } = useQuery({
    queryKey: ["subscription-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).eq("is_subscription", false);
      return data || [];
    }
  });

  // Fetch user's dog profiles
  const { data: dogProfiles } = useQuery({
    queryKey: ["my-dogs-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("dog_profiles")
        .select("id, name, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const activeDogs = dogProfiles || [];
  const selectedDog = activeDogs.find(d => d.id === selectedDogId);

  const selectedProduct = products?.find(p => p.protein_line === protein && p.presentation === presentation);
  const basePrice = selectedProduct ? Number(selectedProduct.price) : 0;
  const billingDiscount = billing === "anual" ? 0.85 : 1;
  const finalPrice = Math.round(basePrice * billingDiscount);
  
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    // Must select a dog
    if (!selectedDogId || !selectedDog) {
      toast({
        title: "Selecciona un perrito",
        description: "Debes seleccionar para qué perrito es esta suscripción.",
        variant: "destructive",
      });
      return;
    }

    const planType = billing === "anual" ? "annual" : "monthly";
    const discountPercent = billing === "anual" ? 15 : 0;

    const subscriptionItem = {
      id: `subscription-${planType}-${protein}-${presentation}`,
      name: `Suscripción ${billing === "anual" ? "Anual" : "Mensual"} - BARF ${protein === "res" ? "Res" : "Pollo"} ${presentation}`,
      price: finalPrice,
      isSubscription: true,
      subscriptionDetails: {
        planType: planType as "monthly" | "annual",
        proteinLine: protein,
        presentation,
        frequency: billing,
        discountPercent,
        dogName: selectedDog.name,
      },
    };

    addItem(subscriptionItem);

    // Navigate silently - no toast

    navigate("/carrito");
  };

  return (
    <Layout>
      <div className="container py-4 pt-12 md:pt-14 relative">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-4">
          <Badge variant="secondary" className="mb-2 gap-1">
            <Repeat className="h-3 w-3" />
            Suscripción mensual
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold">
            Nunca más te preocupes por la comida de tu perro
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {/* Configurator */}
          <div className="space-y-4">
            {/* Dog Selector */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dog className="h-5 w-5 text-primary" />
                  Perrito
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {!isAuthenticated ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Inicia sesión para ver tus perritos registrados
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setShowLoginDialog(true)} className="gap-2">
                      Iniciar Sesión
                    </Button>
                  </div>
                ) : activeDogs.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Aún no tienes perritos registrados
                    </p>
                    <Button asChild size="sm" className="gap-2">
                      <Link to="/ia">
                        <Sparkles className="h-4 w-4" />
                        Añadir perrito
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Select value={selectedDogId} onValueChange={setSelectedDogId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un perrito..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeDogs.map(dog => (
                          <SelectItem key={dog.id} value={dog.id}>
                            🐶 {dog.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button asChild variant="outline" size="sm" className="w-full gap-2">
                      <Link to="/ia?intent=new_profile">
                        <Sparkles className="h-4 w-4" />
                        Añadir otro perrito
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Protein Line */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg">1. Elige tu línea</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <RadioGroup value={protein} onValueChange={setProtein} className="grid grid-cols-2 gap-2">
                  {proteinOptions.map(option => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`protein-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`protein-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="font-semibold text-sm">{option.label}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Presentation */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base">2. Presentación</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <RadioGroup value={presentation} onValueChange={setPresentation} className="grid grid-cols-2 gap-2">
                  {presentationOptions.map(option => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`pres-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`pres-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="text-lg font-bold">{option.label}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Billing Plan */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base">3. Plan</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <RadioGroup value={billing} onValueChange={setBilling} className="grid grid-cols-2 gap-2">
                  {billingOptions.map(option => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`billing-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`billing-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="font-semibold text-sm">{option.label}</span>
                        {option.discount > 0 && <Badge variant="secondary" className="text-[10px]">-{option.discount}%</Badge>}
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {billing === "anual" && (
                  <Alert className="mt-3">
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      El plan anual requiere pago con tarjeta.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Frequency */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base">4. Frecuencia de entrega</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <RadioGroup value={frequency} onValueChange={setFrequency} className="grid grid-cols-2 gap-2">
                  {frequencyOptions.map(option => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`freq-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`freq-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="font-semibold text-sm">{option.label}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Benefits */}
          <div className="lg:sticky lg:top-16 space-y-3 h-fit">
            <Card className="border-primary border-2 relative z-10">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg">Tu suscripción</CardTitle>
                <CardDescription className="text-xs">
                  {selectedDog ? `Para ${selectedDog.name} • ` : ""}
                  BARF {protein === "res" ? "Res" : "Pollo"} {presentation} - {billing === "anual" ? "Anual" : "Mensual"} - {frequency === "semanal" ? "Semanal" : "Cada 15 días"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Paquetes al mes</span>
                    <span className="text-xl font-bold">{frequency === "semanal" ? "4" : "2"} × {presentation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total mensual</span>
                    <span className="text-xs font-medium">
                      {frequency === "semanal" 
                        ? (presentation === "500g" ? "2 kg" : "4 kg")
                        : (presentation === "500g" ? "1 kg" : "2 kg")
                      }
                    </span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="text-xs font-medium">Precio por entrega</span>
                    <span className="text-base font-bold text-primary">
                      ${Math.round(finalPrice / (frequency === "semanal" ? 4 : 2)).toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  {basePrice !== finalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${basePrice.toLocaleString("es-MX")}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary">
                    ${finalPrice.toLocaleString("es-MX")}
                  </span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    `Entrega automática ${frequency === "semanal" ? "cada semana" : "cada 15 días"}`,
                    "Sin compromiso, cancela cuando quieras",
                    "Regalos sorpresa cada mes",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-xs">{text}</span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSubscribe} className="w-full gap-2" size="default">
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al carrito
                </Button>

                <p className="text-[10px] text-center text-muted-foreground">
                  Sin compromiso. Cancela cuando quieras.
                </p>
              </CardContent>
            </Card>

            {/* Extra Benefits */}
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex gap-2">
                  <Gift className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Regalos sorpresa</p>
                    <p className="text-[10px] text-muted-foreground">Cada mes incluimos algo especial</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Truck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Entrega automática</p>
                    <p className="text-[10px] text-muted-foreground">Te avisamos 2 días antes</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Star className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Sin permanencia</p>
                    <p className="text-[10px] text-muted-foreground">Pausa o cancela cuando quieras</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Plan CTA */}
            <Alert className="border-primary/20 bg-primary/5">
              <Sparkles className="h-4 w-4" />
              <AlertDescription className="text-xs space-y-2">
                <p>
                  Para obtener un plan completamente personalizado según el peso, edad y actividad de tu perro, usa nuestro asesor nutricional:
                </p>
                <Button asChild size="sm" variant="outline" className="w-full gap-2">
                  <Link to="/ia">
                    <Sparkles className="h-4 w-4" />
                    Ir al Dogtor
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>

            {/* Policies */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  Políticas de suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] text-muted-foreground space-y-1 pb-3">
                <p>• <strong>Mensual:</strong> Puedes cambiar de línea cada mes y pagar con efectivo.</p>
                <p>• <strong>Anual:</strong> Línea fija durante el año, solo tarjeta.</p>
                <p>• Pausar está disponible en cualquier momento sin costo.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Regístrate para suscribirte"
        description="Para crear tu suscripción mensual, primero necesitas una cuenta Raw Paw."
      />
    </Layout>
  );
}