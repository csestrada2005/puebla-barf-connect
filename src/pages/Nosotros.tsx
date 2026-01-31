import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Eye, Award, ShieldCheck, Handshake, Smile, ArrowRight } from "lucide-react";
import nosotrosBrownDog from "@/assets/brand/nosotros-brown-dog.png";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15
    }
  },
  viewport: { once: true }
};

const values = [
  { icon: Award, title: "Calidad", description: "Ingredientes de consumo humano en cada receta" },
  { icon: ShieldCheck, title: "Honestidad", description: "Transparencia total en lo que hacemos" },
  { icon: Handshake, title: "Confianza", description: "Tu tranquilidad es nuestra prioridad" },
  { icon: Smile, title: "Servicio", description: "Atención personalizada siempre" },
];

export default function Nosotros() {
  return (
    <Layout>
      {/* Hero / Manifesto Section */}
      <section className="relative bg-primary/10 overflow-hidden">
        {/* Brown dog peeking from top-right */}
        <motion.div 
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="absolute top-12 right-0 z-20 pointer-events-none"
        >
          <img 
            src={nosotrosBrownDog} 
            alt="Perro curioso asomándose" 
            className="w-52 sm:w-64 md:w-80 lg:w-[400px] xl:w-[480px] object-contain drop-shadow-2xl translate-x-[2%]"
          />
        </motion.div>

        <div className="container py-16 md:py-24 pt-32 sm:pt-36 md:pt-20">
          <div className="max-w-2xl">
            <motion.div {...fadeInUp} className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium">
                Nuestra Filosofía
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Nutrición con Intención
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                En Raw-Paw no creemos en alimentar por costumbre. Creemos en nutrir con intención. 
                No hacemos comida para perros. Hacemos alimento real y fresco con ingredientes de 
                calidad humana, porque creemos que la salud empieza en el plato.
              </p>
              <p className="text-xl md:text-2xl font-medium text-foreground italic">
                "Cada receta está pensada, probada y aprobada por quienes amamos."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Lo que nos mueve
            </h2>
          </motion.div>
          
          <motion.div 
            {...staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div {...fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Misión</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Brindar alimentación natural, fresca y de alta calidad para perros, 
                    elaborada con ingredientes de consumo humano, para mejorar su salud, 
                    vitalidad y calidad de vida, ofreciendo a los dueños la confianza de 
                    que están cuidando lo más importante: el bienestar de su compañero.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div {...fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <Eye className="w-7 h-7 text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Visión</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser la marca líder en nutrición natural para perros en México, 
                    reconocida por transformar la forma en que los humanos alimentan 
                    a sus mascotas, impulsando una cultura consciente, saludable y sostenible.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nuestros Pilares
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Los valores que guían cada decisión que tomamos
            </p>
          </motion.div>
          
          <motion.div 
            {...staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value) => (
              <motion.div key={value.title} {...fadeInUp}>
                <Card className="h-full text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container">
          <motion.div 
            {...fadeInUp}
            className="text-center space-y-6 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              ¿Listo para cambiar su vida?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Descubre la diferencia que una nutrición real puede hacer en tu mejor amigo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="text-foreground font-semibold"
              >
                <Link to="/ai">
                  Consulta al Dogtor 🩺
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/tienda" className="flex items-center gap-2">
                  Ver Tienda <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
