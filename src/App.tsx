import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tienda from "./pages/Tienda";
import Cobertura from "./pages/Cobertura";
import AIRecomendador from "./pages/AIRecomendador";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import Suscripcion from "./pages/Suscripcion";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import { PromoPopup } from "./components/PromoPopup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PromoPopup />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/cobertura" element={<Cobertura />} />
          <Route path="/ai" element={<AIRecomendador />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/suscripcion" element={<Suscripcion />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
