import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/auth";
import Home from "./pages/Home";
import Tienda from "./pages/Tienda";
import Producto from "./pages/Producto";
import Cobertura from "./pages/Cobertura";
import AIRecomendador from "./pages/AIRecomendador";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import Suscripcion from "./pages/Suscripcion";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import MiCuenta from "./pages/MiCuenta";
import NotFound from "./pages/NotFound";
import { PromoPopup } from "./components/PromoPopup";

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
