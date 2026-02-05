import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialCard } from "@/components";
import { BrandImage } from "@/components/ui/BrandImage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import isotipoBarky from "@/assets/brand/isotipo-barky.png";
import isotipoBowl from "@/assets/brand/isotipo-bowl.png";
import heroBorderCollie from "@/assets/brand/hero-border-collie.png";
import logoTaglineBlack from "@/assets/brand/logo-tagline-black.png";
// Decorative icons
import decoBowl from "@/assets/brand/deco-bowl.png";
import decoCarrot from "@/assets/brand/deco-carrot.png";
import decoDogRunning from "@/assets/brand/deco-dog-running.png";
import decoDogStanding from "@/assets/brand/deco-dog-standing.png";
import decoBall from "@/assets/brand/deco-ball.png";
import decoPuppy from "@/assets/brand/deco-puppy.png";
import decoPaw from "@/assets/brand/deco-paw.png";
import decoFluffy from "@/assets/brand/deco-fluffy.png";

const howItWorks = [{
  step: 1,
  title: "Cuéntanos sobre tu perro",
  description: "Nombre, peso, edad y nivel de actividad. El Dogtor analiza todo."
}, {
  step: 2,
  title: "Recibe tu receta personalizada",
  description: "Calculamos la porción exacta y la proteína ideal para su perfil."
}, {
  step: 3,
  title: "Entrega en 24-48h",
  description: "Alimento fresco directo a tu puerta en Puebla."
}];

export default function Home() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("is_active", true);
      return data || [];
    }
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "¡Gracias por suscribirte!",
        description: "Recibirás nuestras ofertas y novedades."
      });
      setEmail("");
    }
  };

  return (
    <Layout>
      {/* Hero - Full viewport */}
      <section className="relative h-[calc(100svh-4rem)] flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90">
        {/* Centered Logo at Top - PRIORITY */}
        <BrandImage 
          src={logoTaglineBlack} 
          alt="Raw Paw - La nueva forma de cuidarlos" 
          className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-6 md:top-8 w-48 sm:w-60 md:w-72 lg:w-80 z-10 pointer-events-none brightness-0 invert" 
          priority 
        />

        {/* Playful hero dog - peeking from bottom right - PRIORITY */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute -bottom-4 -right-4 md:-right-8 w-64 sm:w-80 md:w-[420px] lg:w-[520px] xl:w-[600px] z-10 pointer-events-none"
        >
          <BrandImage 
            src={heroBorderCollie} 
            alt="Perro feliz" 
            className="w-full h-auto object-contain drop-shadow-2xl" 
            priority 
          />
        </motion.div>

        <div className="container relative z-20 h-full flex flex-col justify-center pt-20 sm:pt-24 md:pt-28">
          <div className="flex-col text-left flex items-start justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-4">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-base md:text-lg text-primary-foreground/90 font-medium">Nutrición calculada con IA</span>
              </div>

              <div className="mb-6 max-w-2xl">
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-primary-foreground font-bold leading-snug tracking-tight">
                  Donde la{" "}
                  <span className="text-secondary">Frescura</span>{" "}
                  nutre,
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-primary-foreground font-bold leading-snug tracking-tight">
                  la calidad se siente
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-primary-foreground font-bold leading-snug tracking-tight">
                  y la{" "}
                  <span className="text-secondary">Nutrición</span>{" "}
                  permanece.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-start">
                <Button asChild size="lg" variant="secondary" className="text-lg md:text-xl px-10 py-7 rounded-2xl btn-bounce shadow-lg">
                  <Link to="/ai">
                    <Sparkles className="h-6 w-6 mr-2" />
                    Iniciar
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="text-lg text-primary-foreground hover:text-primary-foreground hover:bg-white/10">
                  <Link to="/tienda">
                    Explorar productos
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works - Simplified */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        {/* Decorative background icons - LAZY */}
        <BrandImage src={decoBowl} alt="" className="absolute top-10 left-4 w-36 md:w-48 opacity-30 pointer-events-none" />
        <BrandImage src={decoCarrot} alt="" className="absolute bottom-10 right-4 w-32 md:w-44 opacity-30 pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <BrandImage src={isotipoBowl} alt="Raw Paw" className="h-16 w-auto mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Así de fácil funciona
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              En 3 pasos simples, tu perro estará comiendo mejor que nunca
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}>
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
      <section className="py-16 md:py-20 bg-secondary text-secondary-foreground relative overflow-hidden">
        {/* Decorative background icons - LAZY */}
        <BrandImage src={decoDogRunning} alt="" className="absolute bottom-4 left-4 w-48 md:w-64 opacity-20 pointer-events-none" />
        <BrandImage src={decoBall} alt="" className="absolute top-8 right-8 w-28 md:w-40 opacity-20 pointer-events-none" />
        
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
            <BrandImage src={isotipoBarky} alt="Raw Paw" className="h-20 w-auto mx-auto mb-6" />
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
      <BenefitsSection />

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-card relative overflow-hidden">
          {/* Decorative background icons - LAZY */}
          <BrandImage src={decoFluffy} alt="" className="absolute top-8 right-4 w-36 md:w-52 opacity-20 pointer-events-none" />
          
          <div className="container relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-muted-foreground">
                Perros felices, familias felices
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.slice(0, 3).map(t => (
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
      <section className="py-16 md:py-24 bg-muted/50 relative overflow-hidden">
        {/* Decorative background icons - LAZY */}
        <BrandImage src={decoPuppy} alt="" className="absolute bottom-4 right-4 w-40 md:w-56 opacity-20 pointer-events-none" />
        <BrandImage src={decoPaw} alt="" className="absolute top-8 left-8 w-32 md:w-44 opacity-20 pointer-events-none" />
        
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="max-w-xl mx-auto text-center">
            <BrandImage src={isotipoBarky} alt="Raw Paw" className="h-20 w-auto mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Recibe ofertas exclusivas
            </h2>
            <p className="text-muted-foreground mb-6">
              Suscríbete para recibir tips de nutrición canina, ofertas y novedades.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1 rounded-xl" />
              <Button type="submit" className="rounded-xl btn-bounce">Suscribir</Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative background icons - LAZY */}
        <BrandImage src={decoDogStanding} alt="" className="absolute bottom-0 left-4 w-40 md:w-56 opacity-10 pointer-events-none" />
        
        <div className="container text-center relative z-10">
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
