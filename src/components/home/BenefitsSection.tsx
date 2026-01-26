import { motion } from "framer-motion";
import { Leaf, Zap, Sparkles, ShieldCheck, Smile, Scale } from "lucide-react";
import benefitsDog from "@/assets/brand/benefits-dog.jpeg";

const benefits = [
  {
    icon: Leaf,
    title: "Digestión saludable",
    description: "Alimentos naturales que tu perro digiere fácilmente.",
  },
  {
    icon: Zap,
    title: "Más energía y fuerza",
    description: "Proteínas de alta calidad.",
  },
  {
    icon: Sparkles,
    title: "Pelaje brillante",
    description: "Menos caída de pelo y piel sana.",
  },
  {
    icon: ShieldCheck,
    title: "Sistema inmune fuerte",
    description: "Nutrientes que fortalecen las defensas y aumentan la longevidad.",
  },
  {
    icon: Smile,
    title: "Salud bucal",
    description: "Mejora la dentadura y elimina el mal aliento de forma natural.",
  },
  {
    icon: Scale,
    title: "Heces pequeñas",
    description: "Mejor absorción significa menos residuos y menos idas al baño.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué elegir Raw Paw?
            </h2>
            <p className="text-muted-foreground mb-10">
              Los beneficios que notarás en tu perro
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="text-center p-4 rounded-2xl hover:bg-card transition-colors duration-300"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
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
  );
}
