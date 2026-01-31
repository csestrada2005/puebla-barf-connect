import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";
import dogPeeking from "@/assets/brand/dog-peeking.png";
import decoPuppy from "@/assets/brand/deco-puppy.png";

type ProteinFilter = "all" | "pollo" | "res";

export default function Tienda() {
  const [proteinFilter, setProteinFilter] = useState<ProteinFilter>("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category", "barf")
        .order("sort_order");
      return data || [];
    },
  });

  const filteredProducts = products?.filter((product) => {
    if (proteinFilter === "all") return true;
    return product.protein_line === proteinFilter;
  });

  return (
    <Layout>
      <div className="container py-12 relative overflow-visible">
        {/* Playful dog peeking from top-right */}
        <motion.div 
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="absolute -top-4 -right-4 md:right-0 z-10 pointer-events-none hidden md:block"
        >
          <img 
            src={dogPeeking} 
            alt="Perro curioso asomándose" 
            className="w-32 md:w-40 lg:w-48 object-contain drop-shadow-xl"
          />
        </motion.div>

        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            🐾 Alimentación Natural BARF
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Nuestra Tienda</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Alimento natural premium para tu mejor amigo. Elaborado con ingredientes frescos y de alta calidad.
          </p>
        </div>

        {/* Benefits Bar */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-secondary/30">
            <Truck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Envío incluido</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-secondary/30">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Entrega 24-48h</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-secondary/30">
            <Check className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Pago contra entrega</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={proteinFilter === "all" ? "default" : "outline"}
            onClick={() => setProteinFilter("all")}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={proteinFilter === "pollo" ? "default" : "outline"}
            onClick={() => setProteinFilter("pollo")}
            size="sm"
            className="gap-2"
          >
            🐔 Pollo
          </Button>
          <Button
            variant={proteinFilter === "res" ? "default" : "outline"}
            onClick={() => setProteinFilter("res")}
            size="sm"
            className="gap-2"
          >
            🥩 Res
          </Button>
        </div>

        {/* Products Grid */}
        <div className="relative">
          {/* Decorative puppy at bottom-left of products grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute -bottom-8 -left-4 md:-left-8 z-10 pointer-events-none hidden lg:block"
          >
            <img 
              src={decoPuppy} 
              alt="" 
              className="w-28 md:w-36 object-contain opacity-80 drop-shadow-lg"
              aria-hidden="true"
            />
          </motion.div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[380px] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts?.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  shortDescription={product.short_description || undefined}
                  price={Number(product.price)}
                  originalPrice={product.original_price ? Number(product.original_price) : undefined}
                  imageUrl={product.image_url || undefined}
                  proteinLine={product.protein_line || undefined}
                  presentation={product.presentation || undefined}
                  isSubscription={product.is_subscription || false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredProducts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
