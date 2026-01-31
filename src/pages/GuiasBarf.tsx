import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Book, Calculator, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import playLabrador from "@/assets/brand/play-labrador.png";

export default function GuiasBarf() {
  return (
    <Layout>
      <div className="container py-12 relative overflow-visible">
        {/* Labrador (partial, looking forward) - bottom right, happy face peeking */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute -bottom-8 right-0 md:right-4 lg:right-12 z-10 pointer-events-none hidden lg:block"
        >
          <img 
            src={playLabrador} 
            alt="Labrador sonriente" 
            className="w-44 md:w-56 lg:w-72 object-contain drop-shadow-xl"
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

          {/* What is BARF */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>¿Qué es la dieta BARF?</CardTitle>
              <CardDescription>
                Biologically Appropriate Raw Food (Alimento Crudo Biológicamente Apropiado)
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
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

          {/* Benefits */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Beneficios de la dieta BARF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          {/* Portion Calculator */}
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                ¿Cuánto debe comer mi perro?
              </CardTitle>
              <CardDescription>
                Fórmula básica BARF: peso (kg) × porcentaje × 1000 = gramos/día
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Preguntas frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Es segura la carne cruda para mi perro?</AccordionTrigger>
                  <AccordionContent>
                    Sí, cuando se maneja correctamente. Los perros tienen un sistema digestivo 
                    más corto y ácido que el humano, diseñado para procesar carne cruda. 
                    En Raw Paw manejamos cadena de frío estricta y productos de alta calidad.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo hago la transición desde croquetas?</AccordionTrigger>
                  <AccordionContent>
                    Recomendamos una transición gradual de 7-10 días. Comienza mezclando 
                    25% BARF con 75% de su alimento actual, e incrementa progresivamente 
                    hasta llegar a 100% BARF. Esto permite que su sistema digestivo se adapte.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cómo almaceno los productos Raw Paw?</AccordionTrigger>
                  <AccordionContent>
                    Mantén los productos congelados. Descongela en el refrigerador la porción 
                    del día siguiente. Una vez descongelado, consume en 24-48 horas. 
                    Nunca vuelvas a congelar producto descongelado.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Puedo darle BARF a un cachorro?</AccordionTrigger>
                  <AccordionContent>
                    ¡Sí! De hecho, los cachorros se benefician enormemente de una dieta natural. 
                    Solo asegúrate de ajustar las porciones según su edad (los cachorros 
                    necesitan un porcentaje mayor de su peso corporal).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>¿Qué diferencia hay entre línea Pollo y Res?</AccordionTrigger>
                  <AccordionContent>
                    Nuestra línea <strong>Pollo</strong> es ideal para perros que inician con BARF 
                    o con estómagos sensibles. La línea <strong>Res Premium</strong> ofrece 
                    mayor contenido proteico y es perfecta para perros muy activos o 
                    aquellos que buscan la máxima calidad nutricional.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-muted/50">
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
