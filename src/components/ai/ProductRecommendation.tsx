import { motion } from "framer-motion";
import { ShoppingCart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductRecommendationProps {
  petName: string;
  dailyGrams: number;
  packagesPerMonth: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  } | null;
  onAddToCart: () => void;
  onRestart: () => void;
}

export function ProductRecommendation({
  petName,
  dailyGrams,
  packagesPerMonth,
  product,
  onAddToCart,
  onRestart,
}: ProductRecommendationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="border-primary border-2 overflow-hidden">
        <div className="bg-primary/10 p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {dailyGrams}g / día
          </p>
          <p className="text-sm text-muted-foreground">
            para {petName}
          </p>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paquetes al mes:</span>
            <span className="font-semibold">{packagesPerMonth}</span>
          </div>
          
          {product && (
            <>
              <div className="flex justify-between items-center">
                <span className="font-medium">{product.name}</span>
                <span className="text-lg font-bold text-primary">
                  ${Number(product.price).toLocaleString("es-MX")}
                </span>
              </div>
              
              <Button onClick={onAddToCart} className="w-full gap-2">
                <ShoppingCart className="h-4 w-4" />
                Agregar al carrito
              </Button>
            </>
          )}
          
          <Button variant="ghost" onClick={onRestart} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Empezar de nuevo
          </Button>
        </CardContent>
      </Card>
      
      <p className="text-xs text-muted-foreground text-center mt-3">
        ⚠️ Consulta a tu veterinario para casos especiales
      </p>
    </motion.div>
  );
}
