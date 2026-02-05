import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Clock, Check, ArrowRight } from "lucide-react";
 import { Sticker } from "@/components/ui/Sticker";
import productoRes from "@/assets/products/producto-res.png";
import productoPollo from "@/assets/products/producto-pollo.png";
 import decoBowl from "@/assets/brand/deco-bowl.png";
 import decoPaw from "@/assets/brand/deco-paw.png";

const proteinProducts = [
  {
    protein: "res",
    name: "Res Premium",
    tagline: "Nutrición superior",
    description: "Variedad de órganos y carne de res de primera calidad",
    image: productoRes,
    badge: "✨ Premium",
    priceFrom: 349,
    slug: "barf-res-500g",
    benefits: ["Mayor variedad de órganos", "Proteína de alta densidad", "Ideal para perros activos"],
  },
  {
    protein: "pollo",
    name: "Pollo Esencial",
    tagline: "Digestión ligera",
    description: "Fórmula balanceada y suave para el estómago",
    image: productoPollo,
    badge: "💚 Recomendado",
    priceFrom: 299,
    slug: "barf-pollo-500g",
    benefits: ["Fácil digestión", "Ideal para estómagos sensibles", "Proteína magra"],
  },
];

interface ProteinCardProps {
  protein: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  badge: string;
  priceFrom: number;
  slug: string;
  benefits: string[];
}

function ProteinCard({ name, tagline, image, badge, priceFrom, slug, benefits }: ProteinCardProps) {
  return (
    <Link to={`/producto/${slug}`} className="block h-full">
      <Card className="group hover:shadow-xl transition-all duration-300 h-full overflow-hidden border-2 hover:border-primary/20">
        {/* Visual Header */}
        <div className="relative aspect-square bg-gradient-to-br from-secondary/30 to-muted/50 flex items-center justify-center overflow-hidden p-4">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-4 left-4 text-sm font-semibold">
            {badge}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{name}</h3>
            <p className="text-muted-foreground">{tagline}</p>
          </div>

          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Desde</p>
              <span className="text-3xl font-bold text-primary">
                ${priceFrom.toLocaleString("es-MX")}
              </span>
            </div>
            <Button className="gap-2 group-hover:gap-3 transition-all">
              Ver opciones
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Tienda() {
  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Mobile Bowl Sticker - Top right of header */}
          <Sticker 
            src={decoBowl}
            alt=""
            className="absolute -top-2 right-0 md:hidden w-14 h-14 rotate-12"
          />
          
          <Badge variant="secondary" className="mb-4">
            🐾 Alimentación Natural BARF
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Nuestra Tienda</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Solo 2 productos, infinitas posibilidades. Elige la proteína que mejor se adapte a tu mejor amigo.
          </p>
        </div>

        {/* Benefits Bar */}
        <div className="mb-10">
          <div className="grid sm:grid-cols-3 gap-4">
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
        </div>

        {/* Products Grid - 2 Large Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {proteinProducts.map((product, index) => (
            <div key={product.protein}>
              <ProteinCard {...product} />
              {/* Mobile Paw Separator between cards */}
              {index === 0 && (
                <div className="block md:hidden py-4 flex justify-center">
                  <Sticker 
                    src={decoPaw}
                    alt=""
                    className="w-10 h-10 opacity-60 rotate-45"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tip Section */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted/50 text-sm text-muted-foreground">
            <span>💡</span>
            <span>
              <strong>Tip:</strong> Para perros grandes (+20kg) recomendamos la presentación de 1kg para mejor almacenamiento
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
