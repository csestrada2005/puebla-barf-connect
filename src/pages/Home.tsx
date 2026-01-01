import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Sparkles, Heart, Zap, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { BenefitCard, StepCard, TestimonialCard } from "@/components";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("is_active", true);
      return data || [];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background" />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              BARF real y fresco.{" "}
              <span className="text-primary">Entrega en Puebla.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Alimentación natural para perros. Comida real, balanceada y lista para servir. 
              Tu perro merece lo mejor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/cobertura">
                  <MapPin className="h-5 w-5" />
                  Verificar cobertura
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/ai">
                  <Sparkles className="h-5 w-5" />
                  Recomiéndame mi plan
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir Raw Paw?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              icon={Heart}
              title="Digestión saludable"
              description="Alimentos naturales que tu perro digiere fácilmente, sin aditivos artificiales."
            />
            <BenefitCard
              icon={Zap}
              title="Más energía"
              description="Proteínas de alta calidad que mantienen a tu perro activo y feliz todo el día."
            />
            <BenefitCard
              icon={Leaf}
              title="Pelaje brillante"
              description="Ácidos grasos esenciales que dan brillo y suavidad al pelaje de tu mascota."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Así de fácil funciona
          </h2>
          <div className="max-w-md mx-auto space-y-8">
            <StepCard
              number={1}
              title="Verifica tu cobertura"
              description="Confirma que entregamos en tu zona de Puebla."
            />
            <StepCard
              number={2}
              title="Elige tu plan"
              description="Selecciona el plan ideal para tu perro o usa nuestro recomendador AI."
            />
            <StepCard
              number={3}
              title="Confirma por WhatsApp"
              description="Finaliza tu pedido y recibe confirmación instantánea."
            />
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/tienda">
                Ver productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Lo que dicen nuestros clientes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  customerName={t.customer_name}
                  petName={t.pet_name || undefined}
                  petBreed={t.pet_breed || undefined}
                  content={t.content}
                  rating={t.rating || 5}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para mejorar la alimentación de tu perro?
          </h2>
          <p className="mb-8 opacity-90">
            Empieza hoy con nuestro Starter Pack de 7 días.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/tienda">Comprar ahora</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}