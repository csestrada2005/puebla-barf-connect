import { Link } from "react-router-dom";
import { MessageCircle, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import isotipoFluffy from "@/assets/brand/isotipo-fluffy.png";

const WHATSAPP_NUMBER = "5212213606464";

export function Footer() {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={isotipoFluffy} 
                alt="Raw Paw" 
                className="h-14 w-auto brightness-0 invert"
              />
              <span className="text-xl font-bold">Raw Paw</span>
            </div>
            <p className="text-sm opacity-80">
              Alimentación BARF premium para perros en Puebla. Comida real, fresca y balanceada.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navegación</h4>
            <nav className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/tienda" className="hover:opacity-100 transition-opacity">Productos</Link>
              <Link to="/ai" className="hover:opacity-100 transition-opacity">Recomendador AI</Link>
              <Link to="/suscripcion" className="hover:opacity-100 transition-opacity">Suscripción</Link>
              <Link to="/cobertura" className="hover:opacity-100 transition-opacity">Cobertura</Link>
            </nav>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="font-semibold">Ayuda</h4>
            <nav className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/faq" className="hover:opacity-100 transition-opacity">Preguntas Frecuentes</Link>
              <Link to="/guias-barf" className="hover:opacity-100 transition-opacity">Guías BARF</Link>
              <Link to="/mi-cuenta" className="hover:opacity-100 transition-opacity">Mi Cuenta</Link>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                Contacto
              </a>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contáctanos</h4>
            <Button asChild variant="secondary" className="w-full gap-2">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href="https://instagram.com/rawpawmx" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href="https://facebook.com/rawpawmx" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
            <p>© {new Date().getFullYear()} Raw Paw. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link to="/terminos" className="hover:opacity-100 transition-opacity">Términos</Link>
              <Link to="/privacidad" className="hover:opacity-100 transition-opacity">Privacidad</Link>
            </div>
            <p>Puebla, México 🇲🇽</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
