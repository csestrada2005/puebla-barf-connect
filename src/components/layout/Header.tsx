import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuthContext } from "@/components/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/ai", label: "Asistente AI" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/suscripcion", label: "Suscripción" },
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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-xl font-bold text-primary-foreground">🐾</span>
          </div>
          <span className="text-xl font-bold text-foreground">Raw Paw</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
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

        {/* Cart, Auth & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Auth Button */}
          {!loading && (
            <Link to={isAuthenticated ? "/mi-cuenta" : "/login"}>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                {isAuthenticated ? (
                  <User className="h-5 w-5" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
              </Button>
            </Link>
          )}

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

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-card animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile Auth Link */}
            <Link
              to={isAuthenticated ? "/mi-cuenta" : "/login"}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted flex items-center gap-2"
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
        </div>
      )}
    </header>
  );
}
