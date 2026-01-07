import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  CreditCard, Smartphone, Building, MessageCircle, 
  ArrowLeft, Check, Copy, ExternalLink, Loader2 
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useCoverage } from "@/hooks/useCoverage";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const paymentMethods = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Confirma tu pedido por WhatsApp",
    icon: MessageCircle,
    color: "text-green-600",
  },
  {
    id: "transfer",
    name: "Transferencia SPEI",
    description: "Paga con transferencia bancaria",
    icon: Building,
    color: "text-blue-600",
  },
  {
    id: "stripe",
    name: "Tarjeta de crédito/débito",
    description: "Pago seguro con Stripe",
    icon: CreditCard,
    color: "text-purple-600",
    comingSoon: true,
  },
  {
    id: "mercadopago",
    name: "MercadoPago",
    description: "Tarjetas, OXXO, SPEI",
    icon: Smartphone,
    color: "text-sky-600",
    comingSoon: true,
  },
];

const bankInfo = {
  bank: "BBVA",
  clabe: "012180015239745892",
  beneficiary: "Raw Paw MX",
  concept: "Pedido Raw Paw",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getSubtotal, clearCart } = useCart();
  const { isConfirmed, zoneName, address, deliveryFee } = useCoverage();
  const { recommendation } = useRecommendation();
  
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: address || "",
    notes: "",
  });

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
        payment_status: paymentMethod === "whatsapp" ? "pending" : "pending",
        status: "pending",
        ai_recommendation: recommendation as any,
      });

      if (error) throw error;

      setOrderNumber(newOrderNumber);
      
      if (paymentMethod === "whatsapp") {
        // Generate WhatsApp message
        const itemsList = items.map(i => `• ${i.name} x${i.quantity} - $${(i.price * i.quantity).toLocaleString("es-MX")}`).join("\n");
        const message = encodeURIComponent(
          `🐾 *Nuevo Pedido Raw Paw*\n\n` +
          `📋 *Orden:* ${newOrderNumber}\n\n` +
          `*Productos:*\n${itemsList}\n\n` +
          `💰 *Subtotal:* $${subtotal.toLocaleString("es-MX")}\n` +
          `🚚 *Envío:* $${deliveryFee.toLocaleString("es-MX")}\n` +
          `*Total:* $${total.toLocaleString("es-MX")}\n\n` +
          `👤 *Nombre:* ${formData.name}\n` +
          `📱 *Teléfono:* ${formData.phone}\n` +
          `📍 *Dirección:* ${formData.address}\n` +
          (formData.notes ? `📝 *Notas:* ${formData.notes}\n` : "") +
          `\n¡Quiero confirmar mi pedido! 🙌`
        );
        
        window.open(`https://wa.me/5212223334455?text=${message}`, "_blank");
      }
      
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado al portapapeles" });
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
            
            {paymentMethod === "whatsapp" && (
              <Card className="mb-6 text-left">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Tu pedido ha sido enviado por WhatsApp. Te contactaremos para confirmar el pago y entrega.
                  </p>
                  <Button asChild className="w-full gap-2" variant="outline">
                    <a href="https://wa.me/5212223334455" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Abrir WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {paymentMethod === "transfer" && (
              <Card className="mb-6 text-left">
                <CardHeader>
                  <CardTitle className="text-lg">Datos para transferencia</CardTitle>
                  <CardDescription>Realiza tu pago y envíanos el comprobante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Banco:</span>
                    <span className="font-medium">{bankInfo.bank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CLABE:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{bankInfo.clabe}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(bankInfo.clabe)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Beneficiario:</span>
                    <span className="font-medium">{bankInfo.beneficiary}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monto:</span>
                    <span className="font-bold text-primary">${total.toLocaleString("es-MX")}</span>
                  </div>
                  <Separator />
                  <Button asChild className="w-full gap-2">
                    <a href={`https://wa.me/5212223334455?text=${encodeURIComponent(`Hola, ya realicé la transferencia para mi pedido ${orderNumber}. Adjunto comprobante.`)}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Enviar comprobante por WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button asChild>
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
                          placeholder="221 123 4567"
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
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas de entrega (opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Instrucciones especiales, referencias, etc."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                      />
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

                    {paymentMethod === "transfer" && (
                      <Card className="mt-4 bg-muted/50">
                        <CardContent className="pt-4 space-y-2 text-sm">
                          <p className="font-medium">Datos para transferencia:</p>
                          <div className="grid gap-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Banco:</span>
                              <span>{bankInfo.bank}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">CLABE:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono">{bankInfo.clabe}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(bankInfo.clabe)}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Beneficiario:</span>
                              <span>{bankInfo.beneficiary}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span>${(item.price * item.quantity).toLocaleString("es-MX")}</span>
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
                        {deliveryFee === 0 ? (
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
                      className="w-full gap-2" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Confirmar pedido
                          {paymentMethod === "whatsapp" && <ExternalLink className="h-4 w-4" />}
                        </>
                      )}
                    </Button>
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
