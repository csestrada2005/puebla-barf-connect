import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tienda() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nuestra Tienda</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Planes de alimentación BARF diseñados para la salud de tu perro. Elige el que mejor se adapte a sus necesidades.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                shortDescription={product.short_description || undefined}
                price={Number(product.price)}
                originalPrice={product.original_price ? Number(product.original_price) : undefined}
                imageUrl={product.image_url || undefined}
                weightRangeMin={product.weight_range_min || undefined}
                weightRangeMax={product.weight_range_max || undefined}
                durationDays={product.duration_days || undefined}
                isSubscription={product.is_subscription || false}
                subscriptionDiscount={product.subscription_discount || 0}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}