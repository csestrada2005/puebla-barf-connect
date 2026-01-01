import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { CoverageResult } from "@/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCoverage } from "@/hooks/useCoverage";

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
    },
  });

  const handleSearch = () => {
    if (!search.trim()) return;
    setHasSearched(true);
    const found = zones?.find(
      (z) =>
        z.zone_name.toLowerCase().includes(search.toLowerCase()) ||
        z.postal_code?.includes(search)
    );
    setSelectedZone(found || null);
    if (found) {
      setCoverage(found.zone_name, search, Number(found.delivery_fee) || 0);
    }
  };

  const handleJoinWaitlist = () => {
    const whatsappNumber = "5212223334455";
    const message = encodeURIComponent(`Hola, me interesa Raw Paw pero mi zona (${search}) aún no tiene cobertura. ¿Pueden avisarme cuando lleguen?`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Verifica tu cobertura</h1>
            <p className="text-muted-foreground">
              Ingresa tu colonia o código postal para confirmar que entregamos en tu zona.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Ej: Angelópolis, 72830..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {hasSearched && (
            <CoverageResult
              status={selectedZone ? "covered" : "not-covered"}
              zoneName={selectedZone?.zone_name}
              deliveryFee={selectedZone?.delivery_fee}
              onJoinWaitlist={handleJoinWaitlist}
            />
          )}

          {zones && zones.length > 0 && !hasSearched && (
            <div className="mt-8">
              <h3 className="font-medium mb-4">Zonas con cobertura:</h3>
              <div className="flex flex-wrap gap-2">
                {zones.map((z) => (
                  <Button
                    key={z.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch(z.zone_name);
                      setSelectedZone(z);
                      setHasSearched(true);
                      setCoverage(z.zone_name, z.zone_name, Number(z.delivery_fee) || 0);
                    }}
                  >
                    {z.zone_name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}