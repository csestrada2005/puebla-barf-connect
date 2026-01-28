import { Header } from "./Header";
import { Footer } from "./Footer";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dogtorAvatar from "@/assets/brand/dogtor-avatar.png";

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideFab?: boolean;
}

export function Layout({ children, hideFooter, hideFab }: LayoutProps) {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    // Show bubble after a short delay
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("dogtor-bubble-dismissed");
      if (!dismissed) {
        setShowBubble(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const dismissBubble = () => {
    setShowBubble(false);
    sessionStorage.setItem("dogtor-bubble-dismissed", "true");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}

      {/* Omnipresent Dogtor FAB */}
      {!hideFab && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Speech Bubble */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white rounded-2xl shadow-lg px-4 py-3 max-w-[200px] mb-2"
              >
                <button
                  onClick={dismissBubble}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="text-sm font-medium text-foreground">
                  ¿Dudas con la ración? 🦴
                </p>
                {/* Bubble tail */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAB Button */}
          <Link
            to="/ai"
            className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-1.5 sm:p-2 pr-1.5 sm:pr-2 md:pr-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img 
                src={dogtorAvatar} 
                alt="El Dogtor" 
                className="w-12 h-12 sm:w-10 sm:h-10 object-cover"
              />
            </div>
            <span className="hidden md:block font-medium pr-1">
              Asistente Nutricional
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
