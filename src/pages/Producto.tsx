import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Check, 
  ArrowLeft, 
  Leaf, 
  Heart, 
  Sparkles, 
  Zap, 
  Dumbbell,
  AlertCircle
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import heroDogtongue from "@/assets/brand/hero-dog-tongue.png";

const benefitIcons: Record<string, React.ReactNode> = {
  "Mejora digestión y aliento": <Sparkles className="h-5 w-5" />,
  "Fortalece sistema inmune": <Heart className="h-5 w-5" />,
  "Piel sana y pelaje brillante": <Leaf className="h-5 w-5" />,
  "Mayor energía": <Zap className="h-5 w-5" />,
  "Mayor masa muscular": <Dumbbell className="h-5 w-5" />,
};

export default function Producto() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);

  // Fetch all products first to enable smooth switching
  const { data: allProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category", "barf")
        .order("sort_order");
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Find product from cached products list
  const product = useMemo(() => {
    return allProducts?.find(p => p.slug === slug);
  }, [allProducts, slug]);

  // Set initial selections based on current product
  useEffect(() => {
    if (product) {
      setSelectedLine(product.protein_line);
      setSelectedPresentation(product.presentation);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url || undefined,
    });
    
    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} se agregó a tu carrito`,
    });
  };

  // Find product by selected line and presentation
  const findProductByVariant = (line: string, presentation: string) => {
    return allProducts?.find(
      (p) => p.protein_line === line && p.presentation === presentation
    );
  };
  
  // Handle smooth variant navigation
  const handleVariantChange = (variant: typeof product) => {
    if (variant) {
      navigate(`/producto/${variant.slug}`, { replace: true });
    }
  };

  const isLoading = isLoadingProducts;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Button asChild>
            <Link to="/tienda">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la tienda
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const benefits = product.benefits as string[] || [];
  const ingredients = product.ingredients as string[] || [];
  const currentLine = selectedLine || product.protein_line;
  const currentPresentation = selectedPresentation || product.presentation;

  return (
    <Layout>
      <div className="container py-8 relative overflow-visible">
        {/* Playful dog with tongue excited about the product */}
        <motion.div 
          initial={{ opacity: 0, y: -30, rotate: 5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute -top-2 right-8 md:right-16 lg:right-24 z-10 pointer-events-none hidden lg:block"
        >
          <img 
            src={heroDogtongue} 
            alt="Perro emocionado" 
            className="w-28 md:w-36 object-contain drop-shadow-xl"
          />
        </motion.div>

        {/* Back link */}
        <Link 
          to="/tienda" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la tienda
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">🥩</span>
                </div>
              )}
            </div>
            <Badge className="absolute top-4 left-4 text-sm">
              {product.protein_line === "pollo" ? "🐔 Pollo" : "🥩 Res"}
            </Badge>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                ${Number(product.price).toLocaleString("es-MX")}
              </span>
              {product.original_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${Number(product.original_price).toLocaleString("es-MX")}
                </span>
              )}
            </div>

            {/* Variant Selectors */}
            <div className="space-y-4">
              {/* Protein Line Selector */}
              <div>
                <p className="text-sm font-medium mb-2">Línea de proteína</p>
                <div className="flex gap-2">
                  {["pollo", "res"].map((line) => {
                    const variant = findProductByVariant(line, currentPresentation);
                    return (
                      <Button
                        key={line}
                        variant={currentLine === line ? "default" : "outline"}
                        className="flex-1 transition-all"
                        onClick={() => handleVariantChange(variant)}
                        disabled={!variant}
                      >
                        {line === "pollo" ? "🐔 Pollo" : "🥩 Res"}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Presentation Selector */}
              <div>
                <p className="text-sm font-medium mb-2">Presentación</p>
                <div className="flex gap-2">
                  {["500g", "1kg"].map((presentation) => {
                    const variant = findProductByVariant(currentLine, presentation);
                    return (
                      <Button
                        key={presentation}
                        variant={currentPresentation === presentation ? "default" : "outline"}
                        className="flex-1 transition-all"
                        onClick={() => handleVariantChange(variant)}
                        disabled={!variant}
                      >
                        {presentation}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <Button 
              size="lg" 
              className="w-full gap-2 text-lg h-14"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              Agregar al carrito
            </Button>

            {/* Delivery Info */}
            <Card className="bg-secondary/30 border-secondary">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Entrega en 24-48h en zonas con cobertura
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Envío incluido • Pago contra entrega disponible
                </p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-bold mb-4">Beneficios</h3>
              <div className="space-y-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {benefitIcons[benefit] || <Check className="h-5 w-5" />}
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-bold mb-4">Ingredientes</h3>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  Esto no sustituye la recomendación de un veterinario. 
                  Consulta con tu veterinario antes de cambiar la dieta de tu mascota.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
