import { Link } from "react-router-dom";
import { ShoppingCart, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BrandImage } from "@/components/ui/BrandImage";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  proteinLine?: string;
  presentation?: string;
  weightRangeMin?: number;
  weightRangeMax?: number;
  durationDays?: number;
  isSubscription?: boolean;
  subscriptionDiscount?: number;
  className?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  shortDescription,
  price,
  originalPrice,
  imageUrl,
  proteinLine,
  presentation,
  weightRangeMin,
  weightRangeMax,
  durationDays,
  isSubscription,
  subscriptionDiscount,
  className,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const savings = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      price,
      isSubscription,
      imageUrl,
    });
    // Silent add - no toast
  };

  const proteinEmoji = proteinLine === "pollo" ? "🐔" : proteinLine === "res" ? "🥩" : null;

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg group", className)}>
      <Link to={`/producto/${slug}`}>
        <div className="aspect-square bg-muted relative overflow-hidden">
          {imageUrl ? (
            <BrandImage
              src={imageUrl}
              alt={name}
              width={500}
              height={500}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-secondary/50 to-muted">
              {proteinEmoji || "🥩"}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {proteinLine && (
              <Badge variant="secondary" className="bg-card/90 backdrop-blur">
                {proteinEmoji} {proteinLine === "pollo" ? "Pollo" : "Res"}
              </Badge>
            )}
            {isSubscription && (
              <Badge variant="secondary" className="gap-1 bg-card/90 backdrop-blur">
                <Repeat className="h-3 w-3" />
                Suscripción
              </Badge>
            )}
          </div>
          
          {savings > 0 && (
            <Badge className="absolute top-2 right-2 bg-primary">
              -{savings}%
            </Badge>
          )}
          
          {presentation && (
            <Badge variant="outline" className="absolute bottom-2 right-2 bg-card/90 backdrop-blur">
              {presentation}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
          {shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">{shortDescription}</p>
          )}
        </CardHeader>

        <CardContent className="pb-2">
          {(weightRangeMin || weightRangeMax) && (
            <p className="text-xs text-muted-foreground mb-2">
              Ideal para perros de {weightRangeMin}–{weightRangeMax} kg
            </p>
          )}
          {durationDays && (
            <p className="text-xs text-muted-foreground mb-2">
              {durationDays} días de alimentación
            </p>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              ${price.toLocaleString("es-MX")}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toLocaleString("es-MX")}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="pt-2">
        <Button onClick={handleAddToCart} className="w-full gap-2">
          <ShoppingCart className="h-4 w-4" />
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
