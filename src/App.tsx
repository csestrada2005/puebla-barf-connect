import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/auth";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

import { RouteSkeleton } from "@/components/ui/RouteSkeleton";

// Eager load: Critical conversion routes
import Home from "./pages/Home";
import Tienda from "./pages/Tienda";
import AIRecomendador from "./pages/AIRecomendador";

// Lazy load: Secondary routes
const Producto = lazy(() => import("./pages/Producto"));
const Cobertura = lazy(() => import("./pages/Cobertura"));
const Carrito = lazy(() => import("./pages/Carrito"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutConfirmacion = lazy(() => import("./pages/CheckoutConfirmacion"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Login = lazy(() => import("./pages/Login"));
const Registro = lazy(() => import("./pages/Registro"));
const RecuperarContrasena = lazy(() => import("./pages/RecuperarContrasena"));
const RestablecerContrasena = lazy(() => import("./pages/RestablecerContrasena"));
const MiCuenta = lazy(() => import("./pages/MiCuenta"));
const Terminos = lazy(() => import("./pages/Terminos"));
const Privacidad = lazy(() => import("./pages/Privacidad"));
const GuiasBarf = lazy(() => import("./pages/GuiasBarf"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const Admin = lazy(() => import("./pages/Admin"));
const DriverConfirm = lazy(() => import("./pages/DriverConfirm"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="overflow-x-hidden w-full">
          <ScrollToTop />
          <AuthProvider>
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tienda" element={<Tienda />} />
              <Route path="/producto/:slug" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Producto />
                </Suspense>
              } />
              <Route path="/cobertura" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Cobertura />
                </Suspense>
              } />
              <Route path="/ai" element={<AIRecomendador />} />
              <Route path="/carrito" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Carrito />
                </Suspense>
              } />
              <Route path="/checkout" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Checkout />
                </Suspense>
              } />
              <Route path="/checkout/confirmacion" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <CheckoutConfirmacion />
                </Suspense>
              } />
              <Route path="/faq" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <FAQ />
                </Suspense>
              } />
              <Route path="/login" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Login />
                </Suspense>
              } />
              <Route path="/registro" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Registro />
                </Suspense>
              } />
              <Route path="/recuperar-contrasena" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <RecuperarContrasena />
                </Suspense>
              } />
              <Route path="/restablecer-contrasena" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <RestablecerContrasena />
                </Suspense>
              } />
              <Route path="/mi-cuenta" element={
                <ProtectedRoute>
                  <Suspense fallback={<RouteSkeleton />}>
                    <MiCuenta />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Suspense fallback={<RouteSkeleton />}>
                    <Admin />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/terminos" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Terminos />
                </Suspense>
              } />
              <Route path="/privacidad" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Privacidad />
                </Suspense>
              } />
              <Route path="/guias-barf" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <GuiasBarf />
                </Suspense>
              } />
              <Route path="/nosotros" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <Nosotros />
                </Suspense>
              } />
              <Route path="/entrega/:token" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <DriverConfirm />
                </Suspense>
              } />
              <Route path="*" element={
                <Suspense fallback={<RouteSkeleton />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </AuthProvider>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
