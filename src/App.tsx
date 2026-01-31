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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={
              <Suspense fallback={<PageLoader />}>
                <Tienda />
              </Suspense>
            } />
            <Route path="/producto/:slug" element={
              <Suspense fallback={<PageLoader />}>
                <Producto />
              </Suspense>
            } />
            <Route path="/cobertura" element={
              <Suspense fallback={<PageLoader />}>
                <Cobertura />
              </Suspense>
            } />
            <Route path="/ai" element={
              <Suspense fallback={<PageLoader />}>
                <AIRecomendador />
              </Suspense>
            } />
            <Route path="/carrito" element={
              <Suspense fallback={<PageLoader />}>
                <Carrito />
              </Suspense>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Checkout />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/suscripcion" element={
              <Suspense fallback={<PageLoader />}>
                <Suscripcion />
              </Suspense>
            } />
            <Route path="/faq" element={
              <Suspense fallback={<PageLoader />}>
                <FAQ />
              </Suspense>
            } />
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/registro" element={
              <Suspense fallback={<PageLoader />}>
                <Registro />
              </Suspense>
            } />
            <Route path="/mi-cuenta" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <MiCuenta />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/terminos" element={
              <Suspense fallback={<PageLoader />}>
                <Terminos />
              </Suspense>
            } />
            <Route path="/privacidad" element={
              <Suspense fallback={<PageLoader />}>
                <Privacidad />
              </Suspense>
            } />
            <Route path="/guias-barf" element={
              <Suspense fallback={<PageLoader />}>
                <GuiasBarf />
              </Suspense>
            } />
            <Route path="/nosotros" element={
              <Suspense fallback={<PageLoader />}>
                <Nosotros />
              </Suspense>
            } />
            <Route path="*" element={
              <Suspense fallback={<PageLoader />}>
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
