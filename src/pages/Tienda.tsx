import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { PromoPopup } from "@/components/PromoPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck, Clock, Check, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import productoRes from "@/assets/products/producto-res.png";
import productoPollo from "@/assets/products/producto-pollo.png";
const proteinProducts = [{
  protein: "res",
  name: "Res Premium",
  tagline: "Nutrición superior",
  description: "Variedad de órganos y carne de res de primera calidad",
  image: productoRes,
  badge: "✨ Premium",
  priceFrom: 349,
  slug: "barf-res-500g",
  benefits: ["Mayor variedad de órganos", "Proteína de alta densidad", "Ideal para perros activos"]
}, {
  protein: "pollo",
  name: "Pollo Esencial",
  tagline: "Digestión ligera",
  description: "Fórmula balanceada y suave para el estómago",
  image: productoPollo,
  badge: null,
  priceFrom: 299,
  slug: "barf-pollo-500g",
  benefits: ["Fácil digestión", "Ideal para estómagos sensibles", "Proteína magra"]
}];
interface ProteinCardProps {
  protein: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  badge: string | null;
  priceFrom: number;
  slug: string;
  benefits: string[];
}
function ProteinCard({
  name,
  tagline,
  image,
  badge,
  priceFrom,
  slug,
  benefits
}: ProteinCardProps) {
  return <Link to={`/producto/${slug}`} className="block h-full">
      <Card className="group hover:shadow-xl transition-all duration-300 h-full overflow-hidden border-2 hover:border-primary/20">
        {/* Visual Header - Compact */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary/30 to-muted/50 flex items-center justify-center overflow-hidden p-3">
          <img src={image} alt={name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
          {badge && <Badge className="absolute top-3 left-3 text-xs font-semibold">
              {badge}
            </Badge>}
        </div>

        {/* Content - Compact */}
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground">{tagline}</p>
          </div>

          <ul className="space-y-1.5">
            {benefits.map((benefit) => <li key={benefit} className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{benefit}</span>
              </li>)}
          </ul>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs text-muted-foreground">Desde</p>
              <span className="text-2xl font-bold text-primary">
                ${priceFrom.toLocaleString("es-MX")}
              </span>
            </div>
            <Button size="sm" className="gap-1.5 group-hover:gap-2 transition-all">
              Ver opciones
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>;
}
export default function Tienda() {
  return <Layout>
      <PromoPopup />
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <Badge variant="secondary" className="mb-3 md:mb-4">
            🐾 Alimentación Natural BARF
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Nuestra Tienda</h1>
        </div>

        {/* Feeding Guide Disclaimer */}
        <div className="max-w-4xl mx-auto mb-6">
          <Alert className="border-amber-500/40 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300">⚠️ Guía de Raciones para Pruebas</AlertTitle>
            <AlertDescription className="text-xs space-y-2 mt-2 text-amber-900/80 dark:text-amber-200/80">
              <p>Esta compra única es ideal para probar, pero recuerda que cada perro es único:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Perritos Sedentarios/Esterilizados:</strong> Calculan al 2% de su peso.</li>
                <li><strong>Activos/Nerviosos:</strong> Calculan al 3%.</li>
                <li><strong>Cachorros:</strong> Requieren entre 3% y 10% según su edad.</li>
              </ul>
              <p className="pt-1">
                <strong>Recomendación:</strong> Para una ración exacta y personalizada,{" "}
                <Link to="/ai" className="text-primary underline font-semibold">usa nuestro Dogtor IA</Link>.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        {/* Products - Carousel on mobile, Grid on desktop */}
        <div className="md:hidden mb-6">
          <Carousel className="w-full" opts={{
          align: "center",
          loop: true
        }}>
            <CarouselContent className="-ml-2">
              {proteinProducts.map((product) => <CarouselItem key={product.protein} className="pl-2 basis-full">
                  <ProteinCard {...product} />
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Benefits Bar - Below products on mobile, above on desktop */}
        <div className="mb-8 md:mb-10 md:hidden">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Envío gratis (excepto Juárez y Centro Histórico: $25)</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Entrega 24-48h</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Pago contra entrega</span>
            </div>
          </div>
        </div>

        {/* Benefits Bar - Desktop only (above products) */}
        <div className="mb-10 hidden md:block">
          <div className="grid grid-cols-3 gap-4">
            



            



            



          </div>
        </div>
        
        <div className="hidden md:grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {proteinProducts.map((product) => <ProteinCard key={product.protein} {...product} />)}
        </div>

      </div>
    </Layout>;
}