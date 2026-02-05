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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import isotipoBarky from "@/assets/brand/isotipo-barky.png";
import heroBorderCollie from "@/assets/brand/hero-border-collie.png";
import logoTaglineBlack from "@/assets/brand/logo-tagline-black.png";
import herodog from "@/assets/brand/hero-dog.jpeg";
import heroVideo from "@/assets/brand/hero-video.mp4";
import stepDog1 from "@/assets/brand/step-dog-1.png";
import stepDog2 from "@/assets/brand/step-dog-2.png";
import stepDog3 from "@/assets/brand/step-dog-3.png";
import decoBowlFull from "@/assets/brand/deco-bowl-full.png";
import decoHappyDog from "@/assets/brand/deco-happy-dog.png";

const stepDogImages = [stepDog1, stepDog2, stepDog3];

const howItWorks = [{
  step: 1,
  title: "Cuéntanos sobre tu perro",
  description: "Nombre, peso, edad y nivel de actividad. El Dogtor analiza todo.",
  image: stepDog1
}, {
  step: 2,
  title: "Recibe tu receta personalizada",
  description: "Calculamos la porción exacta y la proteína ideal para su perfil.",
  image: stepDog2
}, {
  step: 3,
  title: "Entrega en 24-48h",
  description: "Alimento fresco directo a tu puerta en Puebla.",
  image: stepDog3
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
      {/* ===== MOBILE HERO - Full Video Background ===== */}
      <section className="md:hidden h-[calc(100svh-4rem)] relative flex flex-col overflow-hidden">
        {/* Video Background */}
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col flex-1 px-6 pt-6 pb-20">
          {/* Logo centrado */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <BrandImage 
              src={logoTaglineBlack} 
              alt="Raw Paw" 
              className="w-44 brightness-0 invert drop-shadow-lg" 
              priority 
            />
          </motion.div>

          {/* Spacer to push content down */}
          <div className="flex-grow" />

          {/* Texto centrado */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-6"
          >
            <p className="text-3xl font-bold text-white leading-tight mb-1 drop-shadow-md">
              <span className="text-secondary">Fresco.</span> Real.
            </p>
            <p className="text-3xl font-bold text-white leading-tight drop-shadow-md">
              Para quien <span className="text-secondary">amas.</span>
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col gap-3 items-center"
          >
            <Button asChild size="lg" variant="secondary" className="w-full max-w-xs text-lg px-8 py-6 rounded-2xl btn-bounce shadow-lg">
              <Link to="/ai">
                <Sparkles className="h-5 w-5 mr-2" />
                Crear mi plan
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
              <Link to="/tienda">
                Ver productos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== DESKTOP HERO ===== */}
      <section className="relative h-[calc(100svh-4rem)] hidden md:flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90">
        {/* Centered Logo at Top - PRIORITY */}
        <BrandImage 
          src={logoTaglineBlack} 
          alt="Raw Paw - La nueva forma de cuidarlos" 
          className="absolute left-1/2 -translate-x-1/2 top-8 w-72 lg:w-80 z-10 pointer-events-none brightness-0 invert" 
          priority 
        />

        {/* Desktop hero dog - peeking from bottom right */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute -bottom-4 -right-8 md:w-[420px] lg:w-[520px] xl:w-[600px] z-10 pointer-events-none"
        >
          <BrandImage 
            src={heroBorderCollie} 
            alt="Perro feliz" 
            className="w-full h-auto object-contain drop-shadow-2xl" 
            priority 
          />
        </motion.div>

        <div className="container relative z-20 h-full flex flex-col justify-center pt-28">
          <div className="flex-col text-left flex items-start justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-4">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-lg text-primary-foreground/90 font-medium">Nutrición calculada con IA</span>
              </div>

              <div className="mb-6 max-w-2xl">
                <p className="text-4xl lg:text-5xl xl:text-6xl text-primary-foreground font-bold leading-snug tracking-tight">
                  Donde la{" "}
                  <span className="text-secondary">Frescura</span>{" "}
                  nutre,
                </p>
                <p className="text-4xl lg:text-5xl xl:text-6xl text-primary-foreground font-bold leading-snug tracking-tight">
                  la calidad se siente
                </p>
                <p className="text-4xl lg:text-5xl xl:text-6xl text-primary-foreground font-bold leading-snug tracking-tight">
                  y la{" "}
                  <span className="text-secondary">Nutrición</span>{" "}
                  permanece.
                </p>
              </div>

              <div className="flex flex-row gap-4 justify-start">
                <Button asChild size="lg" variant="secondary" className="text-xl px-10 py-7 rounded-2xl btn-bounce shadow-lg">
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
      <section className="py-10 md:py-24 bg-background relative overflow-hidden" id="como-funciona">
        <div className="container relative z-10">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
              Así de fácil funciona
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              En 3 pasos simples, tu perro estará comiendo mejor que nunca
            </p>
          </div>

          {/* Carousel for mobile, grid for desktop */}
          <div className="md:hidden">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-xs mx-auto"
            >
              <CarouselContent className="ml-0">
                {howItWorks.map((item) => (
                  <CarouselItem key={item.step} className="basis-full pl-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      className="px-2"
                    >
                      <div className="flex flex-col items-center">
                        {/* Sticker above card */}
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-24 h-24 object-contain mb-2"
                        />
                        
                        <div className="relative pt-5 w-full">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg z-10">
                            {item.step}
                          </div>

                          <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg rounded-3xl">
                            <CardContent className="pt-8 pb-5 text-center">
                              <h3 className="text-lg font-semibold mb-2 mt-2">{item.title}</h3>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-4">
                <CarouselPrevious className="static translate-y-0 bg-primary/10 hover:bg-primary/20 border-0" />
                <CarouselNext className="static translate-y-0 bg-primary/10 hover:bg-primary/20 border-0" />
              </div>
            </Carousel>
          </div>

          {/* Grid for desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}>
                <div className="flex flex-col items-center">
                  {/* Sticker above card */}
                  <img 
                    src={item.image} 
                    alt="" 
                    className="w-28 h-28 object-contain mb-2"
                  />
                  
                  <div className="relative pt-5 w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg z-10">
                      {item.step}
                    </div>

                    <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg rounded-3xl">
                      <CardContent className="pt-8 pb-6 text-center">
                        <h3 className="text-xl font-semibold mb-3 mt-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12">
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
        <section className="py-10 md:py-24 bg-card relative overflow-hidden">
          <div className="container relative z-10">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Perros felices, familias felices
              </p>
            </div>

            {/* Carousel for mobile */}
            <div className="md:hidden">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-xs mx-auto"
              >
                <CarouselContent className="ml-0">
                  {testimonials.slice(0, 3).map((t) => (
                    <CarouselItem key={t.id} className="basis-full pl-0">
                      <div className="px-2">
                        <TestimonialCard 
                          customerName={t.customer_name} 
                          petName={t.pet_name || undefined} 
                          petBreed={t.pet_breed || undefined} 
                          content={t.content} 
                          rating={t.rating || 5} 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-2 mt-4">
                  <CarouselPrevious className="static translate-y-0 bg-primary/10 hover:bg-primary/20 border-0" />
                  <CarouselNext className="static translate-y-0 bg-primary/10 hover:bg-primary/20 border-0" />
                </div>
              </Carousel>
            </div>

            {/* Grid for desktop */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.slice(0, 3).map((t, index) => (
                <div key={t.id} className="relative">
                  {/* Decorative sticker on first card (left) - happy dog */}
                  {index === 0 && (
                    <img 
                      src={decoHappyDog} 
                      alt="" 
                      className="absolute -top-36 left-1/2 -translate-x-1/2 w-48 h-48 object-contain pointer-events-none z-10"
                    />
                  )}
                  {/* Decorative sticker on last card (right) - bowl */}
                  {index === 2 && (
                    <img 
                      src={decoBowlFull} 
                      alt="" 
                      className="absolute -top-24 left-1/2 -translate-x-1/2 w-36 h-36 object-contain pointer-events-none z-10"
                    />
                  )}
                  <TestimonialCard 
                    customerName={t.customer_name} 
                    petName={t.pet_name || undefined} 
                    petBreed={t.pet_breed || undefined} 
                    content={t.content} 
                    rating={t.rating || 5} 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Email Capture */}
      <section className="py-16 md:py-24 bg-muted/50 relative overflow-hidden">
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
