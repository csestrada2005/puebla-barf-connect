import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Heart, Zap, Leaf, Shield, Smile, Wind, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialCard } from "@/components";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import benefitsDog from "@/assets/brand/benefits-dog.jpeg";
import isotipoTall from "@/assets/brand/isotipo-tall.png";
import isotipoBowl from "@/assets/brand/isotipo-bowl.png";
import isotipoFluffy from "@/assets/brand/isotipo-fluffy.png";
import dogtorAvatar from "@/assets/brand/dogtor-avatar.png";
import heroDogLicking from "@/assets/brand/hero-dog-licking.png";
import heroLogoTagline from "@/assets/brand/hero-logo-tagline.png";

const benefits = [
  { 
    icon: Heart, 
    title: "Digestión saludable", 
    description: "Alimentos naturales que tu perro digiere **fácilmente**, sin aditivos artificiales." 
  },
  { 
    icon: Zap, 
    title: "Más energía y fuerza", 
    description: "Proteínas de **alta calidad** que incrementan la masa muscular." 
  },
  { 
    icon: Leaf, 
    title: "Pelaje brillante", 
    description: "Menos caída de pelo y **piel sana** gracias a los ácidos grasos naturales." 
  },
  { 
    icon: Shield, 
    title: "Sistema inmune fuerte", 
    description: "Nutrientes que **fortalecen** las defensas y aumentan la longevidad." 
  },
  { 
    icon: Smile, 
    title: "Salud bucal", 
    description: "Mejora la dentadura y **elimina el mal aliento** de forma natural." 
  },
  { 
    icon: Wind, 
    title: "Heces pequeñas", 
    description: "Mejor absorción significa **menos residuos** y menos idas al baño." 
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Cuéntanos sobre tu perro",
    description: "Nombre, peso, edad y nivel de actividad. El Dogtor analiza todo.",
  },
  {
    step: 2,
    title: "Recibe tu receta personalizada",
    description: "Calculamos la porción exacta y la proteína ideal para su perfil.",
  },
  {
    step: 3,
    title: "Entrega en 24-48h",
    description: "Alimento fresco directo a tu puerta en Puebla.",
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
      {/* Hero - Dogtor First */}
      <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 min-h-[520px] md:min-h-[600px]">
        {/* Decorative dog */}
        <img 
          src={heroDogLicking} 
          alt="Perro feliz" 
          className="absolute bottom-0 right-0 w-40 sm:w-56 md:w-72 lg:w-[380px] object-contain z-10 pointer-events-none opacity-90"
        />

        <div className="container relative z-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left max-w-xl"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span className="text-sm text-primary-foreground/90">Nutrición calculada con IA</span>
              </div>

              <img 
                src={heroLogoTagline} 
                alt="Raw Paw - La nueva forma de cuidarlos" 
                className="w-64 sm:w-80 md:w-96 mb-6"
              />

              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-md">
                Donde la frescura nutre, la calidad se siente y la alegría permanece.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 py-6 rounded-2xl btn-bounce shadow-lg"
                >
                  <Link to="/ai">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Iniciar Análisis Nutricional 🧬
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="lg"
                  className="text-primary-foreground hover:text-primary-foreground hover:bg-white/10"
                >
                  <Link to="/tienda">
                    O ver catálogo completo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-8 text-primary-foreground/70 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>100% Natural</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>Entrega 24-48h</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* How it works - Simplified */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <img 
              src={isotipoBowl} 
              alt="Raw Paw" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Así de fácil funciona
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              En 3 pasos simples, tu perro estará comiendo mejor que nunca
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative h-full border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg rounded-3xl">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 mt-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-2xl btn-bounce gap-2">
              <Link to="/ai">
                <Sparkles className="h-5 w-5" />
                Empezar ahora — Es gratis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="py-16 md:py-20 bg-secondary text-secondary-foreground">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <img 
              src={isotipoTall} 
              alt="Raw Paw" 
              className="h-20 w-auto mx-auto mb-6"
            />
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              En Raw Paw <span className="opacity-60">no</span> hacemos comida para perros
            </h2>
            <p className="text-xl md:text-2xl opacity-90">
              Hacemos alimento <strong>real y fresco</strong>, con ingredientes de <strong>calidad humana</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Por qué elegir Raw Paw?
              </h2>
              <p className="text-muted-foreground mb-8">
                Los beneficios que notarás en tu perro
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {benefits.map((benefit) => (
                  <motion.div 
                    key={benefit.title} 
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{
                        __html: benefit.description.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                      }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img 
                src={benefitsDog} 
                alt="Beneficios de la dieta BARF" 
                className="w-full rounded-3xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <img 
              src={isotipoFluffy} 
              alt="Raw Paw" 
              className="h-20 w-auto mx-auto mb-4"
            />
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
                className="flex-1 rounded-xl"
              />
              <Button type="submit" className="rounded-xl btn-bounce">Suscribir</Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para mejorar la alimentación de tu perro?
          </h2>
          <p className="mb-8 opacity-90 text-lg">
            El Dogtor está listo para ayudarte. Empieza hoy.
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2 rounded-2xl btn-bounce text-lg px-8 py-6">
            <Link to="/ai">
              <Sparkles className="h-5 w-5" />
              Iniciar Diagnóstico Gratuito
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
