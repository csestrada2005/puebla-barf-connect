import { motion } from "framer-motion";
import { ShoppingCart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductRecommendationProps {
  petName: string;
  dailyGrams: number;
  packagesPerMonth: number;
  productName?: string;
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
  productName,
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
          <p className="text-lg font-bold text-primary mb-1">
            🩺 ¡Diagnóstico listo!
          </p>
          <p className="text-sm text-muted-foreground">
            Para <span className="font-semibold text-foreground">{petName}</span> receto nuestro plan{" "}
            <span className="font-semibold text-primary">{productName || product?.name}</span>
          </p>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="text-center py-2">
            <p className="text-3xl font-bold text-primary">
              {dailyGrams}g / día
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Dosis diaria ideal
            </p>
          </div>
          
          <div className="flex justify-between text-sm border-t pt-3">
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
              
              <Button onClick={onAddToCart} className="w-full gap-2" size="lg">
                <ShoppingCart className="h-4 w-4" />
                🛒 Agregar Receta al Carrito
              </Button>
            </>
          )}
          
          <Button variant="ghost" onClick={onRestart} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Nueva consulta
          </Button>
        </CardContent>
      </Card>
      
      <p className="text-xs text-muted-foreground text-center mt-3">
        ⚠️ Consulta a tu veterinario para casos especiales
      </p>
    </motion.div>
  );
}
