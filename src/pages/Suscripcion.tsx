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
const planTypes = [{
  id: "basico",
  name: "Plan Básico",
  description: "Recibe cada mes sin complicaciones",
  benefits: ["Precio igual al producto individual", "No requiere re-ingresar tarjeta", "Status de cliente fiel", "Regalos sorpresa mensuales", "Cambia línea cada mes si quieres"],
  badge: null
}, {
  id: "pro",
  name: "Plan Pro",
  description: "Beneficios exclusivos para los más comprometidos",
  benefits: ["Sistema de puntos acumulables", "Prioridad en entregas", "Acceso a productos exclusivos", "Descuentos en productos adicionales", "Soporte prioritario por WhatsApp"],
  badge: "Recomendado",
  priceMultiplier: 1.15
}];
const frequencyOptions = [{
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
export default function Suscripcion() {
  const [protein, setProtein] = useState("pollo");
  const [presentation, setPresentation] = useState("500g");
  const [planType, setPlanType] = useState("basico");
  const [frequency, setFrequency] = useState("mensual");
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
  const planMultiplier = planType === "pro" ? 1.15 : 1;
  const frequencyDiscount = frequency === "anual" ? 0.85 : 1;
  const finalPrice = Math.round(basePrice * planMultiplier * frequencyDiscount);
  const handleSubscribe = () => {
    const productName = `BARF ${protein === "res" ? "Res" : "Pollo"} ${presentation}`;
    const planName = planType === "pro" ? "Pro" : "Básico";
    const freqName = frequency === "anual" ? "Anual" : "Mensual";
    const message = encodeURIComponent(`Hola! Quiero suscribirme a Raw Paw:\n\n` + `*Producto:* ${productName}\n` + `*Plan:* ${planName}\n` + `*Frecuencia:* ${freqName}\n` + `*Precio:* $${finalPrice.toLocaleString("es-MX")}/mes\n\n` + `¿Cómo puedo continuar?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };
  return <Layout>
      <div className="container py-12 pt-20 md:pt-24 lg:pt-28 relative">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Repeat className="h-3 w-3" />
            Suscripción mensual
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Nunca más te preocupes por la comida de tu perro
          </h1>
          
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Configurator */}
          <div className="space-y-6">
            {/* Protein Line */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">1. Elige tu línea</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={protein} onValueChange={setProtein} className="grid grid-cols-2 gap-3">
                  {proteinOptions.map(option => <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`protein-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`protein-${option.value}`} className="flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="text-3xl">{option.emoji}</span>
                        <span className="font-semibold">{option.label}</span>
                        <span className="text-xs text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>)}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Presentation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">2. Presentación</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={presentation} onValueChange={setPresentation} className="grid grid-cols-2 gap-3">
                  {presentationOptions.map(option => <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`pres-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`pres-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="text-xl font-bold">{option.label}</span>
                        <span className="text-xs text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>)}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Plan Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">3. Tipo de plan</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={planType} onValueChange={setPlanType} className="space-y-3">
                  {planTypes.map(plan => <div key={plan.id} className="relative">
                      <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} className="peer sr-only" />
                      <Label htmlFor={`plan-${plan.id}`} className="flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{plan.name}</span>
                            {plan.badge && <Badge variant="default" className="text-xs">{plan.badge}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                          <ul className="space-y-1">
                            {plan.benefits.slice(0, 3).map((b, i) => <li key={i} className="flex items-center gap-2 text-xs">
                                <Check className="h-3 w-3 text-primary" />
                                <span>{b}</span>
                              </li>)}
                          </ul>
                        </div>
                      </Label>
                    </div>)}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Frequency */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">4. Frecuencia</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={frequency} onValueChange={setFrequency} className="grid grid-cols-2 gap-3">
                  {frequencyOptions.map(option => <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`freq-${option.value}`} className="peer sr-only" />
                      <Label htmlFor={`freq-${option.value}`} className="flex flex-col items-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        <span className="font-semibold">{option.label}</span>
                        {option.discount > 0 && <Badge variant="secondary" className="text-xs">-{option.discount}%</Badge>}
                        <span className="text-xs text-muted-foreground text-center">{option.description}</span>
                      </Label>
                    </div>)}
                </RadioGroup>

                {frequency === "anual" && <Alert className="mt-4">
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      El plan anual requiere pago con tarjeta. Próximamente disponible.
                    </AlertDescription>
                  </Alert>}
              </CardContent>
            </Card>
          </div>

          {/* Summary & Benefits - Sticky container */}
          <div className="lg:sticky lg:top-24 space-y-6 h-fit">
            {/* Price Card with Bulldogs standing on top - outside/above the card */}
            <div className="relative pt-28 md:pt-32 lg:pt-36">
              {/* Bulldogs (full body pair) - standing ON TOP of the card, completely visible */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              >
                <img 
                  src={playBulldogs} 
                  alt="Bulldogs felices" 
                  className="w-52 md:w-60 lg:w-72 object-contain drop-shadow-xl"
                />
              </motion.div>
              
              <Card className="border-primary border-2 relative z-10">
                <CardHeader>
                  <CardTitle className="text-xl">Tu suscripción</CardTitle>
                <CardDescription>
                  BARF {protein === "res" ? "Res" : "Pollo"} {presentation} - Plan {planType === "pro" ? "Pro" : "Básico"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-2">
                  {basePrice !== finalPrice && <span className="text-xl text-muted-foreground line-through">
                      ${basePrice.toLocaleString("es-MX")}
                    </span>}
                  <span className="text-4xl font-bold text-primary">
                    ${finalPrice.toLocaleString("es-MX")}
                  </span>
                  <span className="text-muted-foreground">/mes</span>
                </div>

                <div className="space-y-2">
                  {planTypes.find(p => p.id === planType)?.benefits.map((benefit, i) => <div key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </div>)}
                </div>

                <Button onClick={handleSubscribe} className="w-full gap-2" size="lg" disabled={frequency === "anual"}>
                  <MessageCircle className="h-4 w-4" />
                  {frequency === "anual" ? "Próximamente" : "Suscribirme por WhatsApp"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Sin compromiso. Cancela cuando quieras.
                </p>
              </CardContent>
              </Card>
            </div>

            {/* Extra Benefits */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-3">
                  <Gift className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Regalos sorpresa</p>
                    <p className="text-xs text-muted-foreground">Cada mes incluimos algo especial para tu perro</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Entrega automática</p>
                    <p className="text-xs text-muted-foreground">Te avisamos 2 días antes de cada entrega</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Star className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Sin permanencia</p>
                    <p className="text-xs text-muted-foreground">Pausa o cancela cuando quieras sin penalización</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Políticas de suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• <strong>Mensual:</strong> Puedes cambiar de línea cada mes y pagar con efectivo.</p>
                <p>• <strong>Anual:</strong> Línea fija durante el año, solo pago con tarjeta. Cancelación disponible 2 semanas después del pago.</p>
                <p>• Pausar la suscripción está disponible en cualquier momento sin costo.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>;
}