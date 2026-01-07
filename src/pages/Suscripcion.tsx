import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Repeat, Sparkles, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const features = [
  "Entrega semanal automática",
  "10% de descuento permanente",
  "Prioridad en entregas",
  "Pausar o cancelar cuando quieras",
  "Soporte prioritario por WhatsApp",
];

export default function Suscripcion() {
  const { data: subscription } = useQuery({
    queryKey: ["subscription-product"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_subscription", true)
        .eq("is_active", true)
        .single();
      return data;
    },
  });

  return (
    <Layout>
      <div className="container py-12">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Repeat className="h-3 w-3" />
            Suscripción mensual
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Nunca más te preocupes por la comida de tu perro
          </h1>
          <p className="text-lg text-muted-foreground">
            Recibe cada mes la comida natural de tu perro en la puerta de tu casa. 
            Sin olvidos, sin estrés.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan card */}
          <Card className="border-primary border-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
              Más popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Suscripción Mensual</CardTitle>
              <CardDescription>
                Plan mensual BARF entregado cada 30 días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-2">
                {subscription?.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${Number(subscription.original_price).toLocaleString("es-MX")}
                  </span>
                )}
                <span className="text-4xl font-bold text-primary">
                  ${subscription ? Number(subscription.price).toLocaleString("es-MX") : "1,709"}
                </span>
                <span className="text-muted-foreground">/mes</span>
              </div>

              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <Button asChild className="w-full gap-2" size="lg">
                  <Link to="/ai">
                    <Sparkles className="h-4 w-4" />
                    Calcular mi plan ideal
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Usa nuestro recomendador AI para encontrar las porciones ideales
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How it works */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">¿Cómo funciona?</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Elige tu plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Usa el recomendador AI o elige manualmente según el peso de tu perro.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Confirma por WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">
                    Completa tu primera orden y activa tu suscripción.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Recibe cada mes</h3>
                  <p className="text-sm text-muted-foreground">
                    Entregamos automáticamente. Te avisamos 2 días antes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold shrink-0">
                  ∞
                </div>
                <div>
                  <h3 className="font-medium">Sin compromisos</h3>
                  <p className="text-sm text-muted-foreground">
                    Pausa, modifica o cancela cuando quieras sin penalización.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <strong>¿Tienes dudas?</strong> Escríbenos por WhatsApp y te ayudamos 
                  a elegir el plan perfecto para tu perro.
                </p>
                <Button asChild variant="outline" className="mt-4 gap-2" size="sm">
                  <a href="https://wa.me/5212223334455" target="_blank" rel="noopener noreferrer">
                    Contactar por WhatsApp
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
