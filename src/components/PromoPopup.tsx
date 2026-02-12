import { useState, useEffect } from "react";
import { X, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const PROMO_SHOWN_KEY = "rawpaw-promo-shown";
const PROMO_DELAY_MS = 3000; // Show after 3 seconds

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if promo was already shown in this session
    const wasShown = sessionStorage.getItem(PROMO_SHOWN_KEY);
    
    if (!wasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(PROMO_SHOWN_KEY, "true");
      }, PROMO_DELAY_MS);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShowCode(true);
    setIsSubmitting(false);
    
    // Code shown in UI, no toast needed
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowCode(false);
    setEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
            <Gift className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-2 text-primary-foreground">
            ¡Bienvenido a Raw Paw! 🐾
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/90">
            Obtén 15% de descuento en tu primer pedido
          </DialogDescription>
        </div>

        <div className="p-6">
          {showCode ? (
            <div className="text-center space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Tu código de descuento:</p>
                <p className="text-3xl font-bold font-mono text-primary">BIENVENIDO15</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Válido para tu primera compra. ¡No expira!
              </p>
              <div className="flex gap-3">
                <Button asChild className="flex-1" onClick={handleClose}>
                  <Link to="/tienda">Ir a la tienda</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1" onClick={handleClose}>
                  <Link to="/ai">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Usar IA
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 gap-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Activando..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Obtener mi 15% de descuento
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Al suscribirte aceptas recibir ofertas y novedades. 
                Sin spam, lo prometemos 🐕
              </p>
            </form>
          )}
        </div>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
