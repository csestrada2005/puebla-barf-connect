import { Link } from "react-router-dom";
import { MessageCircle, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandImage } from "@/components/ui/BrandImage";
import isotipoBarky from "@/assets/brand/isotipo-barky.png";
const WHATSAPP_NUMBER = "5212213606464";
export function Footer() {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;
  return <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-8 md:py-12">
        <div className="grid gap-6 md:gap-8 grid-cols-2 md:grid-cols-4">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 md:col-span-1 space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <BrandImage src={isotipoBarky} alt="Raw Paw" className="h-12 md:h-14 w-auto brightness-0 invert" />
              <span className="text-lg md:text-xl font-bold">Raw Paw</span>
            </div>
            <p className="text-xs md:text-sm opacity-80">
              Comida real, fresca y balanceada.
            </p>
          </div>

          {/* Navigation - Left on mobile */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-sm md:text-base">Navegación</h4>
            <nav className="flex flex-col gap-1.5 md:gap-2 text-xs md:text-sm opacity-80">
              <Link to="/tienda" className="hover:opacity-100 transition-opacity">Productos</Link>
              <Link to="/ai" className="hover:opacity-100 transition-opacity">Suscripción IA</Link>
              <Link to="/cobertura" className="hover:opacity-100 transition-opacity">Cobertura</Link>
            </nav>
          </div>

          {/* Help - Right on mobile */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-semibold text-sm md:text-base">Ayuda</h4>
            <nav className="flex flex-col gap-1.5 md:gap-2 text-xs md:text-sm opacity-80">
              <Link to="/faq" className="hover:opacity-100 transition-opacity">Preguntas Frecuentes</Link>
              <Link to="/guias-barf" className="hover:opacity-100 transition-opacity">Guías BARF</Link>
              <Link to="/mi-cuenta" className="hover:opacity-100 transition-opacity">Mi Cuenta</Link>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                Contacto
              </a>
            </nav>
          </div>

          {/* Contact & Social - Full width on mobile */}
          <div className="col-span-2 md:col-span-1 space-y-3 md:space-y-4">
            <h4 className="font-semibold text-sm md:text-base">Contáctanos</h4>
            <div className="flex gap-2">
              <Button asChild variant="secondary" size="sm" className="gap-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="secondary" size="icon" asChild className="hover:bg-secondary/80 h-8 w-8 md:h-10 md:w-10">
                <a href="https://instagram.com/rawpawmx" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              </Button>
              <Button variant="secondary" size="icon" asChild className="hover:bg-secondary/80 h-8 w-8 md:h-10 md:w-10">
                <a href="https://facebook.com/rawpawmx" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-xs md:text-sm opacity-80">
            <p>© {new Date().getFullYear()} Raw Paw. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link to="/terminos" className="hover:opacity-100 transition-opacity">Términos</Link>
              <Link to="/privacidad" className="hover:opacity-100 transition-opacity">Privacidad</Link>
            </div>
            <p>Puebla, México 🇲🇽</p>
          </div>
        </div>
      </div>
    </footer>;
}