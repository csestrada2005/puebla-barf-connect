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
import { BrandImage } from "@/components/ui/BrandImage";
import coberturaPitbull from "@/assets/brand/cobertura-pitbull.png";

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
      <div className="container py-4 lg:py-6 relative min-h-[60vh]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-4">
          {/* Left side - Content */}
          <div className="w-full lg:w-[55%]">
            <div className="max-w-xl mx-auto lg:mx-0 lg:ml-auto lg:mr-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl lg:text-5xl font-bold">Verifica tu cobertura</h1>
              </div>

              {hasSearched && <>
                <CoverageResult status={selectedZone ? "covered" : "not-covered"} zoneName={selectedZone?.zone_name} deliveryFee={selectedZone?.delivery_fee} onJoinWaitlist={handleRequestCoverage} />

                {/* Enhanced no-coverage CTA */}
                {!selectedZone && <Card className="mt-3 border-primary/50">
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

              {zones && zones.length > 0 && !hasSearched && <div className="mt-4">
                <h3 className="font-semibold mb-4 text-lg text-center">Zonas con cobertura:</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {zones.map(z => <Button key={z.id} variant="outline" size="lg" className="text-lg px-6" onClick={() => {
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

          {/* Right side - Pitbull B&W - aligned to bottom via flexbox */}
          <div className="hidden lg:block lg:w-[45%] self-end mb-[-2rem]">
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex justify-end pointer-events-none"
            >
              <BrandImage 
                src={coberturaPitbull} 
                alt="Perro atento mirando" 
                className="w-56 lg:w-64 xl:w-72 object-contain drop-shadow-xl"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}