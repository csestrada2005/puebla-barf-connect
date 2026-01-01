import { Link } from "react-router-dom";
import { ShoppingCart, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      isSubscription,
      imageUrl,
    });
    toast({
      title: "¡Agregado al carrito!",
      description: name,
    });
  };

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg", className)}>
      <Link to={`/producto/${slug}`}>
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🥩
            </div>
          )}
          {savings > 0 && (
            <Badge className="absolute top-2 right-2 bg-primary">
              Ahorra {savings}%
            </Badge>
          )}
          {isSubscription && (
            <Badge variant="secondary" className="absolute top-2 left-2 gap-1">
              <Repeat className="h-3 w-3" />
              Suscripción
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="pb-2">
        <Link to={`/producto/${slug}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors">{name}</h3>
        </Link>
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

      <CardFooter className="pt-2">
        <Button onClick={handleAddToCart} className="w-full gap-2">
          <ShoppingCart className="h-4 w-4" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}