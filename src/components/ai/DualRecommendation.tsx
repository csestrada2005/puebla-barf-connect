import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, RotateCcw, Scale, Sparkles, Leaf, Eye, Repeat, ChevronDown, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";

interface ProductOption {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  presentation: string;
}

interface RecommendationOption {
  title: string;
  subtitle: string;
  products: ProductOption[];
  totalPrice: number;
  badge?: string;
  isRecommended?: boolean;
  durationDays: number;
}

interface RecommendationReasoning {
  planReason: string;
  proteinReason: string;
  dailyGramsReason: string;
}

interface DualRecommendationProps {
  petName: string;
  dailyGrams: number;
  weeklyKg: number;
  durationDays: number;
  planType: "standard" | "premium";
  optionA: RecommendationOption;
  optionB: RecommendationOption;
  deliveryFee?: number;
  zoneName?: string;
  reasoning?: RecommendationReasoning;
  onSelectOption: (option: "A" | "B", products: ProductOption[]) => void;
  onViewProduct: (productSlug: string) => void;
  onRestart: () => void;
}

export function DualRecommendation({
  petName,
  dailyGrams,
  weeklyKg,
  durationDays,
  planType,
  optionA,
  optionB,
  deliveryFee = 0,
  zoneName,
  reasoning,
  onSelectOption,
  onViewProduct,
  onRestart,
}: DualRecommendationProps) {
  const navigate = useNavigate();
  const [selectedFrequency, setSelectedFrequency] = useState<"A" | "B">("A");
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const currentOption = selectedFrequency === "A" ? optionA : optionB;
  
  const getPlanBadge = () => {
    return planType === "premium" ? "✨ Premium" : "🌿 Standard";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      {/* Compact Header - Nutrition Ticket Style */}
      <div className="border-dashed border-2 border-primary rounded-xl p-4 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">Fórmula Ideal para {petName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Ración diaria: {dailyGrams}g</span>
        </div>
      </div>

      {/* Frequency Toggle - Central Feature */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">¿Con qué frecuencia quieres recibir?</p>
        <ToggleGroup
          type="single"
          value={selectedFrequency}
          onValueChange={(value) => value && setSelectedFrequency(value as "A" | "B")}
          className="w-full grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl"
        >
          <ToggleGroupItem
            value="B"
            className="flex-1 flex flex-col gap-0.5 py-3 px-4 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm transition-all"
          >
            <span className="text-base font-semibold">📦 Semanal</span>
            <span className="text-xs text-muted-foreground">Para empezar</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="A"
            className="flex-1 flex flex-col gap-0.5 py-3 px-4 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:ring-2 data-[state=on]:ring-primary transition-all"
          >
            <span className="text-base font-semibold">📦📦 Quincenal</span>
            <span className="text-xs text-muted-foreground">Mejor Valor</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Dynamic Product Card with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFrequency}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={`border-2 ${selectedFrequency === "A" ? 'border-primary' : 'border-muted'}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold">{currentOption.title}</h3>
                  <p className="text-xs text-muted-foreground">{currentOption.subtitle}</p>
                </div>
                {selectedFrequency === "A" && (
                  <Badge className="bg-primary/10 text-primary border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recomendado
                  </Badge>
                )}
              </div>
              
              {/* Product List - Compact */}
              <div className="space-y-2 mb-4">
                {currentOption.products.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed last:border-0 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-0.5 rounded">
                        {product.quantity}x
                      </span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => onViewProduct(product.slug)}
                    >
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Sticky/Prominent CTA */}
      <Button 
        onClick={() => onSelectOption(selectedFrequency, currentOption.products)} 
        className="w-full gap-2 h-14 text-base font-bold shadow-lg" 
        size="lg"
      >
        <ShoppingCart className="h-5 w-5" />
        Agregar Plan ({currentOption.durationDays} días) — ${currentOption.totalPrice.toLocaleString("es-MX")}
      </Button>

      {/* Subscription Quick CTA */}
      <Button 
        variant="outline" 
        className="w-full gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
        onClick={() => navigate("/suscripcion")}
      >
        <Repeat className="h-4 w-4" />
        Suscríbete y ahorra
      </Button>

      {/* Collapsible Details Section */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
            <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            Ver detalles y beneficios
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          {/* Why BARF */}
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl text-sm">
            <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">¿Por qué BARF?</p>
              <p className="text-xs text-muted-foreground">
                Alimentación natural que mejora digestión, pelaje brillante y más energía para {petName}.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Restart */}
      <div className="text-center pt-2">
        <Button variant="ghost" size="sm" onClick={onRestart} className="gap-2 text-muted-foreground">
          <RotateCcw className="h-4 w-4" />
          Nueva consulta
        </Button>
        <p className="text-[10px] text-muted-foreground mt-1">
          ⚠️ Consulta a tu veterinario para casos especiales
        </p>
      </div>
    </motion.div>
  );
}
