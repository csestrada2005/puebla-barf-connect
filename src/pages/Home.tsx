import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Heart, Zap, Leaf, Shield, Smile, Wind, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestimonialCard } from "@/components";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  { 
    icon: Heart, 
    title: "Digestión saludable", 
    description: "Alimentos naturales que tu perro digiere **fácilmente**, sin aditivos artificiales." 
  },
  { 
    icon: Zap, 
    title: "Más energía", 
    description: "Proteínas de **alta calidad** que mantienen a tu perro activo y feliz." 
  },
  { 
    icon: Leaf, 
    title: "Pelaje brillante", 
    description: "Ácidos grasos esenciales para un **pelaje suave** y piel sana." 
  },
  { 
    icon: Shield, 
    title: "Sistema inmune fuerte", 
    description: "Nutrientes que **fortalecen** las defensas naturales de tu mascota." 
  },
  { 
    icon: Smile, 
    title: "Dientes y aliento", 
    description: "Dieta natural que mejora la **salud bucal** y reduce el mal aliento." 
  },
  { 
    icon: Wind, 
    title: "Heces pequeñas", 
    description: "Mejor absorción significa **menos residuos** y heces más firmes." 
  },
];

const steps = [
  {
    number: 1,
    title: "Cuéntanos sobre tu perro",
    description: "Nuestra IA te guía para encontrar el plan perfecto según raza, peso y necesidades.",
    image: "🐕",
  },
  {
    number: 2,
    title: "Confirma tu zona",
    description: "Verifica que entregamos en tu colonia de Puebla y selecciona tu línea favorita.",
    image: "📍",
  },
  {
    number: 3,
    title: "Recibe en 24-48h",
    description: "Entrega rápida a tu puerta. También puedes cotizar por WhatsApp.",
    image: "🚚",
  },
];

export default function Home() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_subscription", false)
        .order("sort_order")
        .limit(4);
      return data || [];
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "¡Gracias por suscribirte!",
        description: "Recibirás nuestras ofertas y novedades.",
      });
      setEmail("");
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              Comida real para perros.{" "}
              <span className="text-primary">Entrega rápida en Puebla.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Alimentación BARF natural, fresca y balanceada. Tu perro merece lo mejor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link to="/ai">
                  <Sparkles className="h-5 w-5" />
                  Empieza aquí
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-base">
                <Link to="/tienda">
                  Ver productos
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              ⏱️ Toma menos de 3 minutos
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Así de fácil funciona
            </h2>
            <p className="text-muted-foreground">
              En 3 simples pasos tu perro estará comiendo mejor
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step) => (
              <Card key={step.number} className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="text-6xl mb-4">{step.image}</div>
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="gap-2">
              <Link to="/ai">
                <Sparkles className="h-5 w-5" />
                Comenzar ahora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué elegir Raw Paw?
            </h2>
            <p className="text-muted-foreground">
              Los beneficios que notarás en tu perro
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4 p-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{
                    __html: benefit.description.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      {products && products.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nuestros productos
              </h2>
              <p className="text-muted-foreground">
                Líneas premium elaboradas con ingredientes frescos
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/producto/${product.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="aspect-square bg-gradient-to-br from-secondary/50 to-muted flex items-center justify-center relative">
                      <span className="text-6xl group-hover:scale-110 transition-transform">
                        {product.protein_line === "res" ? "🥩" : "🍗"}
                      </span>
                      <Badge 
                        className="absolute top-3 right-3" 
                        variant={product.protein_line === "res" ? "default" : "secondary"}
                      >
                        {product.protein_line === "res" ? "Premium" : "Base"}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.presentation === "1kg" ? "Perro mediano-grande" : "Perro pequeño"}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${Number(product.price).toLocaleString("es-MX")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/tienda">
                  Ver todos los productos
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-muted-foreground">
                Perros felices, familias felices
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.slice(0, 3).map((t) => (
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

      {/* Email Capture */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Recibe ofertas exclusivas
            </h2>
            <p className="text-muted-foreground mb-6">
              Suscríbete para recibir tips de nutrición canina, ofertas y novedades.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit">Suscribir</Button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para mejorar la alimentación de tu perro?
          </h2>
          <p className="mb-8 opacity-90 text-lg">
            Empieza hoy y ve la diferencia en semanas.
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2">
            <Link to="/ai">
              <Sparkles className="h-5 w-5" />
              Arma tu pedido
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
