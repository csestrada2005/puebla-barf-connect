import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/auth";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
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
        <ScrollToTop />
        <AuthProvider>
          <PromoPopup />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={
              <Suspense fallback={null}>
                <Tienda />
              </Suspense>
            } />
            <Route path="/producto/:slug" element={
              <Suspense fallback={null}>
                <Producto />
              </Suspense>
            } />
            <Route path="/cobertura" element={
              <Suspense fallback={null}>
                <Cobertura />
              </Suspense>
            } />
            <Route path="/ai" element={
              <Suspense fallback={null}>
                <AIRecomendador />
              </Suspense>
            } />
            <Route path="/carrito" element={
              <Suspense fallback={null}>
                <Carrito />
              </Suspense>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Suspense fallback={null}>
                  <Checkout />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/suscripcion" element={
              <Suspense fallback={null}>
                <Suscripcion />
              </Suspense>
            } />
            <Route path="/faq" element={
              <Suspense fallback={null}>
                <FAQ />
              </Suspense>
            } />
            <Route path="/login" element={
              <Suspense fallback={null}>
                <Login />
              </Suspense>
            } />
            <Route path="/registro" element={
              <Suspense fallback={null}>
                <Registro />
              </Suspense>
            } />
            <Route path="/mi-cuenta" element={
              <ProtectedRoute>
                <Suspense fallback={null}>
                  <MiCuenta />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Suspense fallback={null}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/terminos" element={
              <Suspense fallback={null}>
                <Terminos />
              </Suspense>
            } />
            <Route path="/privacidad" element={
              <Suspense fallback={null}>
                <Privacidad />
              </Suspense>
            } />
            <Route path="/guias-barf" element={
              <Suspense fallback={null}>
                <GuiasBarf />
              </Suspense>
            } />
            <Route path="/nosotros" element={
              <Suspense fallback={null}>
                <Nosotros />
              </Suspense>
            } />
            <Route path="*" element={
              <Suspense fallback={null}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
