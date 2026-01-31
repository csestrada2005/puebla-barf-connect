import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/auth";
import { PageLoader } from "@/components/ui/PageLoader";
import { PromoPopup } from "./components/PromoPopup";

// Eager load: Home (initial route)
import Home from "./pages/Home";

// Lazy load: All other routes
const Tienda = lazy(() => import("./pages/Tienda"));
const Producto = lazy(() => import("./pages/Producto"));
const Cobertura = lazy(() => import("./pages/Cobertura"));
const AIRecomendador = lazy(() => import("./pages/AIRecomendador"));
const Carrito = lazy(() => import("./pages/Carrito"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Suscripcion = lazy(() => import("./pages/Suscripcion"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Login = lazy(() => import("./pages/Login"));
const Registro = lazy(() => import("./pages/Registro"));
const MiCuenta = lazy(() => import("./pages/MiCuenta"));
const Terminos = lazy(() => import("./pages/Terminos"));
const Privacidad = lazy(() => import("./pages/Privacidad"));
const GuiasBarf = lazy(() => import("./pages/GuiasBarf"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PromoPopup />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tienda" element={<Tienda />} />
              <Route path="/producto/:slug" element={<Producto />} />
              <Route path="/cobertura" element={<Cobertura />} />
              <Route path="/ai" element={<AIRecomendador />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/suscripcion" element={<Suscripcion />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/mi-cuenta" element={
                <ProtectedRoute>
                  <MiCuenta />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/terminos" element={<Terminos />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/guias-barf" element={<GuiasBarf />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
