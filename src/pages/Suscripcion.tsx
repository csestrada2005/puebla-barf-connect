import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Repeat, Star, Gift, Truck, MessageCircle, CreditCard, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { BrandImage } from "@/components/ui/BrandImage";
import playBulldogs from "@/assets/brand/play-bulldogs.png";
const WHATSAPP_NUMBER = "5212213606464";
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
  const [protein, setProtein] = useState("pollo");
  const [presentation, setPresentation] = useState("500g");
  const [billing, setBilling] = useState("mensual");
  const [frequency, setFrequency] = useState("semanal");
  const {
    data: products
  } = useQuery({
    queryKey: ["subscription-products"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("products").select("*").eq("is_active", true).eq("is_subscription", false);
      return data || [];
    }
  });

  // Find matching product
  const selectedProduct = products?.find(p => p.protein_line === protein && p.presentation === presentation);

  // Calculate price
  const basePrice = selectedProduct ? Number(selectedProduct.price) : 0;
  const billingDiscount = billing === "anual" ? 0.85 : 1;
  const finalPrice = Math.round(basePrice * billingDiscount);
  
  const handleSubscribe = () => {
    const productName = `BARF ${protein === "res" ? "Res" : "Pollo"} ${presentation}`;
    const billingName = billing === "anual" ? "Anual" : "Mensual";
    const freqName = frequency === "semanal" ? "Semanal" : "Cada 15 días";
    const message = encodeURIComponent(`Hola! Quiero suscribirme a Raw Paw:\n\n` + `*Producto:* ${productName}\n` + `*Plan:* ${billingName}\n` + `*Frecuencia de entrega:* ${freqName}\n` + `*Precio:* $${finalPrice.toLocaleString("es-MX")}/mes\n\n` + `¿Cómo puedo continuar?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };
  return <Layout>
      <div className="container py-6 pt-16 md:pt-20 relative">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <Badge variant="secondary" className="mb-2 gap-1">
            <Repeat className="h-3 w-3" />
            Suscripción mensual
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold">
            Nunca más te preocupes por la comida de tu perro
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Configurator */}
          <div className="space-y-4">
            {/* Protein Line */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg">1. Elige tu línea</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <RadioGroup value={protein} onValueChange={setProtein} className="grid grid-cols-2 gap-2">
                  {proteinOptions.map(option => <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`protein-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`protein-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="font-semibold text-sm">{option.label}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>)}
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
                  {presentationOptions.map(option => <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`pres-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`pres-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="text-lg font-bold">{option.label}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>)}
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
                  {billingOptions.map(option => <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`billing-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`billing-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="font-semibold text-sm">{option.label}</span>
                        {option.discount > 0 && <Badge variant="secondary" className="text-[10px]">-{option.discount}%</Badge>}
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>)}
                </RadioGroup>

                {billing === "anual" && <Alert className="mt-3">
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      El plan anual requiere pago con tarjeta. Próximamente disponible.
                    </AlertDescription>
                  </Alert>}
              </CardContent>
            </Card>

            {/* Frequency */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base">4. Frecuencia de entrega</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <RadioGroup value={frequency} onValueChange={setFrequency} className="grid grid-cols-2 gap-2">
                  {frequencyOptions.map(option => <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`freq-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`freq-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="font-semibold text-sm">{option.label}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>)}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Benefits - Sticky container */}
          <div className="lg:sticky lg:top-20 space-y-4 h-fit">
            {/* Price Card with Bulldogs standing on top - outside/above the card */}
            <div className="relative pt-20 md:pt-24">
              {/* Bulldogs (full body pair) - standing ON TOP of the card, completely visible */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              >
                <BrandImage 
                  src={playBulldogs} 
                  alt="Bulldogs felices" 
                  className="w-40 md:w-48 lg:w-56 object-contain drop-shadow-xl"
                  priority
                />
              </motion.div>
              
              <Card className="border-primary border-2 relative z-10">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg">Tu suscripción</CardTitle>
                <CardDescription className="text-xs">
                  BARF {protein === "res" ? "Res" : "Pollo"} {presentation} - {billing === "anual" ? "Anual" : "Mensual"} - {frequency === "semanal" ? "Semanal" : "Cada 15 días"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                {/* Package Summary */}
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

                {/* Total Price */}
                <div className="flex items-baseline gap-2">
                  {basePrice !== finalPrice && <span className="text-lg text-muted-foreground line-through">
                      ${basePrice.toLocaleString("es-MX")}
                    </span>}
                  <span className="text-3xl font-bold text-primary">
                    ${finalPrice.toLocaleString("es-MX")}
                  </span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-xs">Entrega automática {frequency === "semanal" ? "cada semana" : "cada 15 días"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-xs">Sin compromiso, cancela cuando quieras</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-xs">Regalos sorpresa cada mes</span>
                  </div>
                </div>

                <Button onClick={handleSubscribe} className="w-full gap-2" size="default" disabled={billing === "anual"}>
                  <MessageCircle className="h-4 w-4" />
                  {billing === "anual" ? "Próximamente" : "Suscribirme por WhatsApp"}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground">
                  Sin compromiso. Cancela cuando quieras.
                </p>
              </CardContent>
              </Card>
            </div>

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
    </Layout>;
}