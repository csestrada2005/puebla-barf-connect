import { Link } from "react-router-dom";
import { MessageCircle, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const whatsappNumber = "5212223334455"; // Placeholder
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="text-xl">🐾</span>
              </div>
              <span className="text-xl font-bold">Raw Paw</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Alimentación BARF premium para perros en Puebla. Comida real, fresca y balanceada.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navegación</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/tienda" className="hover:text-primary transition-colors">Tienda</Link>
              <Link to="/ai" className="hover:text-primary transition-colors">Recomendador AI</Link>
              <Link to="/suscripcion" className="hover:text-primary transition-colors">Suscripción</Link>
              <Link to="/cobertura" className="hover:text-primary transition-colors">Cobertura</Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Soporte</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/faq" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link>
              <Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link>
              <Link to="/mi-cuenta" className="hover:text-primary transition-colors">Mi Cuenta</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contáctanos</h4>
            <Button asChild className="w-full gap-2">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild>
                <a href="https://instagram.com/rawpawmx" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://facebook.com/rawpawmx" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Raw Paw. Todos los derechos reservados.</p>
          <p className="mt-1">Puebla, México 🇲🇽</p>
        </div>
      </div>
    </footer>
  );
}