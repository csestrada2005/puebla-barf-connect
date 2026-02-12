import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BrandImage } from "@/components/ui/BrandImage";
import { useCart } from "@/hooks/useCart";
import { useCoverage } from "@/hooks/useCoverage";
import { motion } from "framer-motion";
import playAussie from "@/assets/brand/play-aussie.png";

export default function Carrito() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart();
  const { isConfirmed, zoneName, deliveryFee } = useCoverage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const subtotal = getSubtotal();
  const total = subtotal + (isConfirmed ? deliveryFee : 0);

  // Hide dog when scrolled past the content section (into footer)
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Dog is visible when the container is in view
        const isInView = rect.top < viewportHeight && rect.bottom > 350;
        setIsVisible(isInView);
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (items.length === 0) {
    return (
      <Layout>
        <div ref={containerRef} className="container py-20 pb-48 lg:pb-48 relative">
          {/* Aussie (looking left) - fixed at bottom left, fades with scroll */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              x: isVisible ? 0 : -40 
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-0 -left-8 z-10 pointer-events-none hidden md:block"
          >
            <BrandImage 
              src={playAussie} 
              alt="Perro esperando" 
              className="w-52 md:w-64 lg:w-80 object-contain drop-shadow-xl"
            />
          </motion.div>
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-6">
              Agrega productos para comenzar tu pedido de comida natural para tu perro.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/tienda">Ver productos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/ai">Usar recomendador AI</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div ref={containerRef} className="container py-12 pb-48 lg:pb-48 relative px-4 sm:px-6">
        {/* Aussie (looking left) - fixed at bottom left, fades with scroll */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            x: isVisible ? 0 : -40 
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 -left-8 z-10 pointer-events-none hidden lg:block"
        >
          <BrandImage 
            src={playAussie} 
            alt="Perro feliz por el pedido" 
            className="w-52 md:w-64 lg:w-80 object-contain drop-shadow-xl"
          />
        </motion.div>

        <div className="max-w-3xl mx-auto px-2 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Tu Carrito</h1>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Vaciar carrito
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex items-center justify-center text-3xl shrink-0">
                        {item.imageUrl ? (
                          <BrandImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          "🥩"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        {item.packSize && (
                          <span className="text-xs text-muted-foreground">{item.packSize * item.quantity} paquetes</span>
                        )}
                        <p className="text-lg font-bold text-primary">
                          ${(item.price * item.quantity).toLocaleString("es-MX")}
                        </p>
                        {item.isSubscription && (
                          <span className="text-xs text-muted-foreground">Suscripción mensual</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString("es-MX")}</span>
                  </div>
                  
                  {isConfirmed ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Envío a {zoneName}
                      </span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-primary font-medium">Gratis</span>
                        ) : (
                          `$${deliveryFee.toLocaleString("es-MX")}`
                        )}
                      </span>
                    </div>
                  ) : (
                    <Link to="/cobertura" className="block">
                      <div className="flex justify-between text-sm text-primary hover:underline">
                        <span>Calcular envío</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toLocaleString("es-MX")}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button asChild className="w-full gap-2" size="lg">
                    <Link to="/checkout">
                      Continuar al checkout
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full gap-2">
                    <Link to="/tienda">
                      <ArrowLeft className="h-4 w-4" />
                      Seguir comprando
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
