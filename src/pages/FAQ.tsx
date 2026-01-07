import { Layout } from "@/components/layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "¿Qué es la dieta BARF?",
    answer: "BARF significa 'Biologically Appropriate Raw Food' (Alimentos Crudos Biológicamente Apropiados). Es una dieta basada en alimentos crudos y naturales que imita lo que los perros comerían en la naturaleza: carne, huesos carnosos, órganos y vegetales.",
  },
  {
    question: "¿Es segura la comida cruda para mi perro?",
    answer: "Sí, cuando se prepara correctamente. En Raw Paw seguimos estrictos protocolos de higiene y control de calidad. Usamos ingredientes de grado humano y congelamos rápidamente para eliminar patógenos. Miles de perros en México ya comen BARF sin problemas.",
  },
  {
    question: "¿Cómo hago la transición desde croquetas?",
    answer: "Recomendamos una transición gradual de 7-10 días. Comienza mezclando 25% BARF con 75% croquetas, y aumenta gradualmente. Algunos perros pueden cambiar de inmediato sin problemas. Te enviamos una guía completa con tu primer pedido.",
  },
  {
    question: "¿Cuánto debe comer mi perro?",
    answer: "La cantidad depende del peso, edad y nivel de actividad. Como regla general, un perro adulto come entre 2-3% de su peso corporal al día. Usa nuestro recomendador AI para calcular la porción exacta para tu perro.",
  },
  {
    question: "¿Cómo se mantiene la comida fresca?",
    answer: "Toda nuestra comida viene congelada. Debes almacenarla en el congelador y descongelar la porción del día en el refrigerador. Una vez descongelada, dura 3-4 días en refrigeración.",
  },
  {
    question: "¿Hacen entregas a domicilio?",
    answer: "Sí, entregamos directamente a tu puerta en zonas de Puebla. Verifica tu cobertura en nuestra página. Las entregas se hacen en hieleras especiales para mantener la cadena de frío.",
  },
  {
    question: "¿Puedo pausar o cancelar mi suscripción?",
    answer: "¡Claro! Las suscripciones son flexibles. Puedes pausar, modificar la frecuencia o cancelar en cualquier momento sin penalización. Solo avísanos por WhatsApp.",
  },
  {
    question: "¿Qué proteínas utilizan?",
    answer: "Trabajamos con pollo, res, cerdo y pavo de proveedores locales certificados. Todas las proteínas son de grado humano. Próximamente incluiremos opciones como pescado y venado.",
  },
  {
    question: "¿Sirve para perros con alergias?",
    answer: "La dieta BARF suele ayudar con alergias alimentarias porque elimina granos, conservadores y aditivos. Sin embargo, si tu perro tiene alergias específicas, consúltanos para diseñar un plan adecuado.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos transferencia SPEI, pago por WhatsApp, y próximamente tarjetas de crédito/débito y MercadoPago. El pago se confirma antes de preparar tu pedido.",
  },
];

export default function FAQ() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
            <p className="text-muted-foreground">
              Todo lo que necesitas saber sobre Raw Paw y la dieta BARF
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center p-6 bg-muted rounded-lg">
            <h3 className="font-bold mb-2">¿No encontraste tu respuesta?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Escríbenos por WhatsApp y te respondemos en minutos.
            </p>
            <Button asChild className="gap-2">
              <a href="https://wa.me/5212223334455" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Escribir por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
