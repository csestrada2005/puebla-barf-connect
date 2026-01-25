import { motion } from "framer-motion";
import { ShoppingCart, RotateCcw, Package, Calendar, Scale, Sparkles, Leaf, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
}

interface DualRecommendationProps {
  petName: string;
  dailyGrams: number;
  weeklyKg: number;
  durationDays: number;
  planType: "standard" | "mix" | "premium";
  optionA: RecommendationOption;
  optionB: RecommendationOption;
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
  onSelectOption,
  onViewProduct,
  onRestart,
}: DualRecommendationProps) {
  const getPlanLabel = () => {
    switch (planType) {
      case "premium": return "✨ Plan Premium (Res)";
      case "mix": return "🔄 Plan Mix (Pollo + Res)";
      default: return "🌿 Plan Standard (Pollo)";
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Header Card */}
      <Card className="border-primary border-2 overflow-hidden">
        <div className="bg-primary/10 p-5 text-center">
          <p className="text-xl font-bold text-primary mb-2">
            🩺 ¡Diagnóstico listo para {petName}!
          </p>
          <Badge variant={planType === "premium" ? "default" : planType === "mix" ? "outline" : "secondary"} className="text-sm">
            {getPlanLabel()}
          </Badge>
        </div>
        
        <CardContent className="p-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-xl">
              <Scale className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">{dailyGrams}g</p>
              <p className="text-xs text-muted-foreground">por día</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">{weeklyKg.toFixed(1)}kg</p>
              <p className="text-xs text-muted-foreground">por semana</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">{durationDays}</p>
              <p className="text-xs text-muted-foreground">días aprox.</p>
            </div>
          </div>

          {/* Why BARF */}
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl text-sm">
            <Leaf className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">¿Por qué BARF?</p>
              <p className="text-muted-foreground">Alimentación natural que mejora digestión, pelaje brillante y más energía para {petName}.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option A - Recommended */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={`border-2 ${optionA.isRecommended ? 'border-primary shadow-lg' : 'border-muted'}`}>
          {optionA.isRecommended && (
            <div className="bg-primary text-primary-foreground px-4 py-2 text-center text-sm font-medium">
              <Sparkles className="h-4 w-4 inline mr-2" />
              {optionA.badge || "Recomendado"}
            </div>
          )}
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{optionA.title}</h3>
                <p className="text-sm text-muted-foreground">{optionA.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ${optionA.totalPrice.toLocaleString("es-MX")}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {optionA.products.map((product, idx) => (
                <div key={idx} className="flex flex-col gap-2 py-3 border-b border-dashed last:border-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{product.quantity}x {product.name}</span>
                    <span className="text-muted-foreground">${(product.price * product.quantity).toLocaleString("es-MX")}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => onViewProduct(product.slug)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver Producto
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => onSelectOption("A", optionA.products)} 
              className="w-full gap-2" 
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              Elegir Opción A
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Option B - Alternative */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-muted">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{optionB.title}</h3>
                <p className="text-sm text-muted-foreground">{optionB.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${optionB.totalPrice.toLocaleString("es-MX")}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {optionB.products.map((product, idx) => (
                <div key={idx} className="flex flex-col gap-2 py-3 border-b border-dashed last:border-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{product.quantity}x {product.name}</span>
                    <span className="text-muted-foreground">${(product.price * product.quantity).toLocaleString("es-MX")}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => onViewProduct(product.slug)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver Producto
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              variant="outline"
              onClick={() => onSelectOption("B", optionB.products)} 
              className="w-full gap-2" 
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              Elegir Opción B
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Restart */}
      <div className="text-center">
        <Button variant="ghost" onClick={onRestart} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Nueva consulta
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          ⚠️ Consulta a tu veterinario para casos especiales
        </p>
      </div>
    </motion.div>
  );
}
