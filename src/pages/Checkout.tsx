import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  CreditCard, Banknote, MessageCircle, 
  ArrowLeft, Check, Loader2, AlertCircle, LogIn, UserPlus, Calendar 
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/hooks/useCart";
import { useCoverage } from "@/hooks/useCoverage";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Product images
import productoRes from "@/assets/products/producto-res.png";
import productoPollo from "@/assets/products/producto-pollo.png";

const WHATSAPP_NUMBER = "5212213606464";

const paymentMethods = [
  {
    id: "efectivo",
    name: "Efectivo",
    description: "Pago al recibir tu pedido",
    icon: Banknote,
    color: "text-green-600",
  },
  {
    id: "tarjeta",
    name: "Tarjeta de crédito/débito",
    description: "Pago seguro con tarjeta",
    icon: CreditCard,
    color: "text-purple-600",
    comingSoon: true,
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getSubtotal, clearCart } = useCart();
  const { isConfirmed, zoneName, address, deliveryFee } = useCoverage();
  const { recommendation } = useRecommendation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: address || "",
    notes: "",
    deliveryWindow: "",
    preferredDeliveryDay: "" as "" | "monday" | "sunday",
  });

  const getProductImage = (itemName: string) => {
    const nameLower = itemName.toLowerCase();
    if (nameLower.includes("res") || nameLower.includes("beef")) return productoRes;
    if (nameLower.includes("pollo") || nameLower.includes("chicken")) return productoPollo;
    return productoRes; // default
  };

  const subtotal = getSubtotal();
  const total = subtotal + (isConfirmed ? deliveryFee : 0);

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RP-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      toast({
        title: "Completa todos los campos",
        description: "Necesitamos tu nombre, teléfono y dirección.",
        variant: "destructive",
      });
      return;
    }

    if (!isConfirmed) {
      toast({
        title: "Verifica tu cobertura",
        description: "Necesitas confirmar que entregamos en tu zona.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const newOrderNumber = generateOrderNumber();
    
    try {
      // Save order to database
      const { error } = await supabase.from("orders").insert({
        order_number: newOrderNumber,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        delivery_notes: formData.notes || null,
        items: items as any,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: paymentMethod,
        payment_status: "pending",
        status: "pending",
        ai_recommendation: recommendation as any,
      });

      if (error) throw error;

      setOrderNumber(newOrderNumber);
      
      // Generate WhatsApp message with structured format
      const itemsList = items.map(i => `• ${i.name} x${i.quantity} - $${(i.price * i.quantity).toLocaleString("es-MX")}`).join("\n");
      const petInfo = recommendation?.breed ? `${recommendation.breed}` : "No especificado";
      const familyName = formData.name.split(" ").slice(-1)[0];
      
      const message = encodeURIComponent(
        `*Nuevo Pedido Raw Paw*\n` +
        `ID: ${newOrderNumber}\n\n` +
        `*Productos:*\n${itemsList}\n\n` +
        `*Total:* $${total.toLocaleString("es-MX")}\n` +
        `*Pago:* ${paymentMethod === "efectivo" ? "Efectivo por cobrar" : "Tarjeta"}\n\n` +
        `*Cliente:* ${petInfo} - Fam. ${familyName}\n` +
        `*Tel:* ${formData.phone}\n` +
        `*Dirección:* ${formData.address}\n` +
        (formData.notes ? `*Referencias:* ${formData.notes}\n` : "") +
        (formData.deliveryWindow ? `*Ventana horaria:* ${formData.deliveryWindow}\n` : "") +
        (formData.preferredDeliveryDay ? `*Día preferido:* ${formData.preferredDeliveryDay === "monday" ? "Lunes" : "Domingo"}\n` : "") +
        `\n*Entrega:* 24-48h`
      );
      
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
      
      setOrderComplete(true);
      clearCart();
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error al crear pedido",
        description: "Intenta de nuevo o contáctanos por WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    navigate("/carrito");
    return null;
  }

  if (orderComplete) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">¡Pedido recibido!</h1>
            <p className="text-muted-foreground mb-4">
              Tu número de orden es:
            </p>
            <p className="text-2xl font-mono font-bold text-primary mb-6">{orderNumber}</p>
            
            <Card className="mb-6 text-left">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  {paymentMethod === "efectivo" 
                    ? "Tu pedido ha sido enviado por WhatsApp. Te contactaremos para coordinar la entrega y cobro."
                    : "Tu pedido ha sido registrado. Te contactaremos para confirmar."
                  }
                </p>
                <Button asChild className="w-full gap-2">
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Abrir WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Button asChild variant="outline">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-6 gap-2">
            <Link to="/carrito">
              <ArrowLeft className="h-4 w-4" />
              Volver al carrito
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {/* Guest Gate */}
          {!authLoading && !isAuthenticated && (
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="font-medium">¿Ya has comprado antes?</p>
                    <p className="text-sm text-muted-foreground">Inicia sesión para acceder a tus datos guardados</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <Link to="/login">
                        <LogIn className="h-4 w-4" />
                        Iniciar Sesión
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="gap-2">
                      <Link to="/registro">
                        <UserPlus className="h-4 w-4" />
                        Crear Cuenta
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isConfirmed && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Necesitas verificar tu cobertura antes de continuar.{" "}
                <Link to="/cobertura" className="underline font-medium">
                  Verificar ahora
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                          id="name"
                          placeholder="Tu nombre"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono (WhatsApp) *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="221 360 6464"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección de entrega *</Label>
                      <Input
                        id="address"
                        placeholder="Calle, número, colonia, CP"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="notes">Referencias (opcional)</Label>
                        <Input
                          id="notes"
                          placeholder="Casa azul, junto al parque..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryWindow">Ventana horaria (opcional)</Label>
                        <Input
                          id="deliveryWindow"
                          placeholder="Ej: 10am-2pm"
                          value={formData.deliveryWindow}
                          onChange={(e) => setFormData({ ...formData, deliveryWindow: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Preferred Delivery Day */}
                    <div className="space-y-3 pt-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Día de entrega preferencial
                      </Label>
                      <RadioGroup
                        value={formData.preferredDeliveryDay}
                        onValueChange={(v) => setFormData({ ...formData, preferredDeliveryDay: v as "monday" | "sunday" })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monday" id="delivery-monday" />
                          <Label htmlFor="delivery-monday" className="cursor-pointer font-normal">
                            Lunes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sunday" id="delivery-sunday" />
                          <Label htmlFor="delivery-sunday" className="cursor-pointer font-normal">
                            Domingo
                          </Label>
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground">
                        Selecciona el día que prefieres recibir tus entregas
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Método de pago</CardTitle>
                    <CardDescription>Selecciona cómo deseas pagar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-3"
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="relative">
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="peer sr-only"
                            disabled={method.comingSoon}
                          />
                          <Label
                            htmlFor={method.id}
                            className={`flex items-center gap-4 rounded-lg border-2 p-4 transition-colors cursor-pointer
                              ${method.comingSoon ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"}
                              peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5`}
                          >
                            <div className={`p-2 rounded-lg bg-muted ${method.color}`}>
                              <method.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                            {method.comingSoon && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">Próximamente</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Tu pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <img 
                          src={getProductImage(item.name)} 
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover bg-secondary/30"
                        />
                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">${(item.price * item.quantity).toLocaleString("es-MX")}</span>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toLocaleString("es-MX")}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span>
                        {!isConfirmed ? (
                          <span className="text-muted-foreground">Verifica cobertura</span>
                        ) : deliveryFee === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          `$${deliveryFee.toLocaleString("es-MX")}`
                        )}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${total.toLocaleString("es-MX")}</span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isSubmitting || !isConfirmed}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          Confirmar por WhatsApp
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Al confirmar, te redirigiremos a WhatsApp para finalizar tu pedido
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
