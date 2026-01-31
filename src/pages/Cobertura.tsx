import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { CoverageResult } from "@/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCoverage } from "@/hooks/useCoverage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import dogLicking from "@/assets/brand/dog-licking.png";

const WHATSAPP_NUMBER = "5212213606464";

export default function Cobertura() {
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { setCoverage } = useCoverage();

  const { data: zones } = useQuery({
    queryKey: ["coverage-zones"],
    queryFn: async () => {
      const { data } = await supabase.from("coverage_zones").select("*").eq("is_active", true);
      return data || [];
    }
  });

  const handleSearch = () => {
    if (!search.trim()) return;
    setHasSearched(true);
    const found = zones?.find(z => z.zone_name.toLowerCase().includes(search.toLowerCase()) || z.postal_code?.includes(search));
    setSelectedZone(found || null);
    if (found) {
      setCoverage(found.zone_name, search, Number(found.delivery_fee) || 0);
    }
  };

  const handleRequestCoverage = () => {
    const message = encodeURIComponent(`Hola! Me interesa Raw Paw pero mi zona no aparece en cobertura.\n\n` + `*Mi ubicación:* ${search}\n` + `*Producto de interés:* [Por definir]\n` + `*Cantidad estimada:* [Por definir]\n` + `*Tipo:* Compra única / Suscripción\n\n` + `¿Pueden cotizar envío a mi zona?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <Layout>
      <div className="container py-12 relative overflow-visible">
        {/* Playful dog licking - positioned at top-right */}
        <motion.div 
          initial={{ opacity: 0, x: 40, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="absolute -top-2 right-0 md:right-4 lg:right-16 z-10 pointer-events-none hidden md:block"
        >
          <img 
            src={dogLicking} 
            alt="Perro feliz esperando" 
            className="w-28 md:w-36 lg:w-44 object-contain drop-shadow-xl"
          />
        </motion.div>

        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Verifica tu cobertura</h1>
          </div>

          {hasSearched && <>
            <CoverageResult status={selectedZone ? "covered" : "not-covered"} zoneName={selectedZone?.zone_name} deliveryFee={selectedZone?.delivery_fee} onJoinWaitlist={handleRequestCoverage} />

            {/* Enhanced no-coverage CTA */}
            {!selectedZone && <Card className="mt-6 border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  ¿No está tu localidad?
                </CardTitle>
                <CardDescription>
                  Estamos creciendo en Puebla. Escríbenos para cotizar envío a tu zona.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleRequestCoverage} className="w-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Solicitar cobertura por WhatsApp
                </Button>
              </CardContent>
            </Card>}
          </>}

          {zones && zones.length > 0 && !hasSearched && <div className="mt-8">
            <h3 className="font-medium mb-4">Zonas con cobertura:</h3>
            <div className="flex flex-wrap gap-2">
              {zones.map(z => <Button key={z.id} variant="outline" size="sm" onClick={() => {
                setSearch(z.zone_name);
                setSelectedZone(z);
                setHasSearched(true);
                setCoverage(z.zone_name, z.zone_name, Number(z.delivery_fee) || 0);
              }}>
                {z.zone_name}
              </Button>)}
            </div>
          </div>}
        </div>
      </div>
    </Layout>
  );
}
