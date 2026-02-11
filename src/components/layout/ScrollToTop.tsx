import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    // Don't scroll when switching product variants (same base route)
    if (prev.startsWith("/producto/") && pathname.startsWith("/producto/")) {
      return;
    }

    // Exception for /ai with active consultation
    if (pathname === "/ai") {
      const savedState = localStorage.getItem("ai-recommender-state");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.step === "result") {
            return;
          }
        } catch {}
      }
    }
    
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
