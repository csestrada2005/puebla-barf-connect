import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Excepción para /ai con consulta activa
    if (pathname === "/ai") {
      const savedState = localStorage.getItem("ai-recommender-state");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.step === "result") {
            return; // No hacer scroll si hay consulta activa
          }
        } catch {}
      }
    }
    
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
