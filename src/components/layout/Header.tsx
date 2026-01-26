import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import logoRawPaw from "@/assets/brand/logo-rawpaw.png";

const navLinks = [
  { href: "/tienda", label: "Tienda" },
  { href: "/suscripcion", label: "Suscripción" },
  { href: "/ai", label: "Recomendador AI" },
  { href: "/guias-barf", label: "Guía BARF" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/faq", label: "FAQ" },
  { href: "/nosotros", label: "Nosotros" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logoRawPaw} 
            alt="Raw Paw" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Cart, Register & Mobile Menu */}
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

          {/* Auth CTA */}
          {!loading && (
            <Button asChild size="sm" className="hidden sm:flex gap-2">
              {isAuthenticated ? (
                <Link to="/mi-cuenta">
                  <User className="h-4 w-4" />
                  Mi cuenta
                </Link>
              ) : (
                <Link to="/registro">
                  Regístrate
                </Link>
              )}
            </Button>
          )}

          {/* Mobile Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center mb-8">
                <img 
                  src={logoRawPaw} 
                  alt="Raw Paw" 
                  className="h-10 w-auto"
                />
              </Link>
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
                {!loading && (
                  isAuthenticated ? (
                    <Link
                      to="/mi-cuenta"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center flex items-center justify-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Mi cuenta
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/registro"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center"
                      >
                        Regístrate
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted text-center"
                      >
                        Iniciar Sesión
                      </Link>
                    </>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
