import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { useAuthContext } from "@/components/auth";
import { cn } from "@/lib/utils";
import logoWhite from "@/assets/brand/logo-white.png";
import isotipoWalking from "@/assets/brand/isotipo-walking.png";

const navLinks = [
  { href: "/tienda", label: "Tienda" },
  { href: "/suscripcion", label: "Suscripción" },
  { href: "/ai", label: "Recomendador AI" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { isAuthenticated, loading } = useAuthContext();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Hamburger Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex items-center gap-3 mb-8">
              <img 
                src={isotipoWalking} 
                alt="Raw Paw" 
                className="h-12 w-auto"
              />
              <span className="text-xl font-bold">Raw Paw</span>
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === "/"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Inicio
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-4" />
              <Link
                to={isAuthenticated ? "/mi-cuenta" : "/login"}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2"
              >
                {isAuthenticated ? (
                  <>
                    <User className="h-4 w-4" />
                    Mi Cuenta
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Center: Logo - Sin sombras ni biselados, plano */}
        <Link to="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <img 
            src={isotipoWalking} 
            alt="Raw Paw" 
            className="h-10 w-auto"
          />
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-xl font-bold text-foreground">Raw Paw</span>
            <span className="text-[10px] text-muted-foreground tracking-wide">la nueva forma de cuidarlos</span>
          </div>
        </Link>

        {/* Right: Cart & CTA */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Sticky CTA */}
          <Button asChild size="sm" className="gap-1.5 hidden sm:flex">
            <Link to="/ai">
              <Sparkles className="h-4 w-4" />
              Empieza
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
