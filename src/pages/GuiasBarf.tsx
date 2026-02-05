import { useRef, useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Book, Calculator, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { BrandImage } from "@/components/ui/BrandImage";
 import { Sticker } from "@/components/ui/Sticker";
import playLabrador from "@/assets/brand/play-labrador.png";
 import decoBall from "@/assets/brand/deco-ball.png";

export default function GuiasBarf() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // Hide dog when scrolled past the content section (into footer)
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Dog is visible when the container is in view (accounting for footer)
        // Hide when bottom of container is above viewport or we're past content
        const isInView = rect.top < viewportHeight && rect.bottom > 350;
        setIsVisible(isInView);
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <Layout>
      <div ref={containerRef} className="container py-8 md:py-12 pb-24 md:pb-48 relative">
        {/* Labrador - DESKTOP: fixed at bottom-left, visible only within content section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            x: isVisible ? 0 : -40 
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 z-10 pointer-events-none hidden lg:block"
        >
          <BrandImage 
            src={playLabrador}
            alt="Labrador sonriente"
            className="w-48 md:w-60 lg:w-72 object-contain drop-shadow-xl"
          />
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Book className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Guías BARF</h1>
            <p className="text-lg text-muted-foreground">
              Todo lo que necesitas saber sobre la alimentación natural para perros
            </p>
          </div>

          {/* Main Accordion with all sections as dropdowns */}
          <Accordion type="multiple" className="space-y-4">
            {/* What is BARF */}
            <AccordionItem value="what-is-barf" className="border rounded-xl px-4">
              <AccordionTrigger className="text-lg font-semibold py-4">
                ¿Qué es la dieta BARF?
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-0 shadow-none">
                  <CardContent className="pt-0 prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground mb-4">
                      Biologically Appropriate Raw Food (Alimento Crudo Biológicamente Apropiado)
                    </p>
                    <p>
                      La dieta BARF consiste en alimentar a tu perro con alimentos crudos y naturales, 
                      similares a lo que consumirían sus ancestros en estado salvaje. Esto incluye:
                    </p>
                    <ul>
                      <li><strong>Proteína animal</strong> - Carnes crudas como base principal</li>
                      <li><strong>Huesos carnosos</strong> - Fuente natural de calcio y fósforo</li>
                      <li><strong>Órganos</strong> - Hígado, corazón, riñones (vitaminas y minerales)</li>
                      <li><strong>Vegetales</strong> - Fibra y nutrientes adicionales</li>
                    </ul>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Benefits */}
            <AccordionItem value="benefits" className="border rounded-xl px-4">
              <AccordionTrigger className="text-lg font-semibold py-4">
                Beneficios de la dieta BARF
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🦷 Salud dental</h4>
                    <p className="text-sm text-muted-foreground">
                      Menos sarro y mejor aliento gracias a la masticación natural
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">✨ Pelaje brillante</h4>
                    <p className="text-sm text-muted-foreground">
                      Ácidos grasos naturales para piel sana y pelo sedoso
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">💪 Más energía</h4>
                    <p className="text-sm text-muted-foreground">
                      Proteínas de alta calidad fácilmente digeribles
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🌿 Mejor digestión</h4>
                    <p className="text-sm text-muted-foreground">
                      Heces más pequeñas y firmes, menos gases
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Portion Calculator */}
            <AccordionItem value="calculator" className="border-primary border rounded-xl px-4">
              <AccordionTrigger className="text-lg font-semibold py-4">
                <span className="flex items-center gap-2 relative">
                  <Calculator className="h-5 w-5" />
                  ¿Cuánto debe comer mi perro?
                  {/* Ball sticker next to calculator */}
                  <Sticker 
                    src={decoBall}
                    alt=""
                    className="w-6 h-6 -ml-1 hidden md:block"
                  />
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Fórmula básica BARF: peso (kg) × porcentaje × 1000 = gramos/día
                </p>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Cachorros (por edad)</h4>
                    <ul className="text-sm space-y-1">
                      <li>1-2 meses: <strong>10%</strong> del peso corporal</li>
                      <li>3-4 meses: <strong>8%</strong> del peso corporal</li>
                      <li>5-6 meses: <strong>6%</strong> del peso corporal</li>
                      <li>7-8 meses: <strong>4%</strong> del peso corporal</li>
                      <li>9-12 meses: <strong>3-3.5%</strong> del peso corporal</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Adultos (por actividad)</h4>
                    <ul className="text-sm space-y-1">
                      <li>Actividad baja / Senior: <strong>2.5%</strong> del peso corporal</li>
                      <li>Actividad normal: <strong>3%</strong> del peso corporal</li>
                      <li>Muy activos: <strong>4%</strong> del peso corporal</li>
                    </ul>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Ejemplo:</strong> Un perro adulto de 15kg con actividad normal 
                      necesita: 15 × 0.03 × 1000 = <strong>450g diarios</strong>
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full mt-4 gap-2">
                  <Link to="/ai">
                    <Sparkles className="h-4 w-4" />
                    Calcular con nuestro recomendador AI
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* FAQ - Parent accordion containing nested FAQs */}
            <AccordionItem value="faq" className="border rounded-xl px-4">
              <AccordionTrigger className="text-lg font-semibold py-4">
                Preguntas frecuentes
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>¿Es segura la carne cruda para mi perro?</AccordionTrigger>
                    <AccordionContent>
                      Sí, cuando se maneja correctamente. Los perros tienen un sistema digestivo 
                      más corto y ácido que el humano, diseñado para procesar carne cruda. 
                      En Raw Paw manejamos cadena de frío estricta y productos de alta calidad.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>¿Cómo hago la transición desde croquetas?</AccordionTrigger>
                    <AccordionContent>
                      Recomendamos una transición gradual de 7-10 días. Comienza mezclando 
                      25% BARF con 75% de su alimento actual, e incrementa progresivamente 
                      hasta llegar a 100% BARF. Esto permite que su sistema digestivo se adapte.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>¿Cómo almaceno los productos Raw Paw?</AccordionTrigger>
                    <AccordionContent>
                      Mantén los productos congelados. Descongela en el refrigerador la porción 
                      del día siguiente. Una vez descongelado, consume en 24-48 horas. 
                      Nunca vuelvas a congelar producto descongelado.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>¿Puedo darle BARF a un cachorro?</AccordionTrigger>
                    <AccordionContent>
                      ¡Sí! De hecho, los cachorros se benefician enormemente de una dieta natural. 
                      Solo asegúrate de ajustar las porciones según su edad (los cachorros 
                      necesitan un porcentaje mayor de su peso corporal).
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>¿Qué diferencia hay entre línea Pollo y Res?</AccordionTrigger>
                    <AccordionContent>
                      Nuestra línea <strong>Pollo</strong> es ideal para perros que inician con BARF 
                      o con estómagos sensibles. La línea <strong>Res Premium</strong> ofrece 
                      mayor contenido proteico y es perfecta para perros muy activos o 
                      aquellos que buscan la máxima calidad nutricional.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Disclaimer */}
          <Card className="bg-muted/50 mt-8">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Consulta a tu veterinario</h4>
                  <p className="text-sm text-muted-foreground">
                    Esta información es orientativa y no sustituye la consulta veterinaria. 
                    Cada perro es único y puede tener necesidades específicas. Consulta con 
                    un profesional antes de hacer cambios significativos en la dieta de tu mascota.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
}
