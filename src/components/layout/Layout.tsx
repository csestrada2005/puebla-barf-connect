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
export function Layout({
  children,
  hideFooter,
  hideFab
}: LayoutProps) {
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
  return <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}

      {/* Omnipresent Dogtor FAB */}
      {!hideFab && <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Speech Bubble */}
          <AnimatePresence>
            {showBubble}
          </AnimatePresence>

          {/* FAB Button */}
          <Link to="/ai" className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-1 pr-1 md:pr-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img src={dogtorAvatar} alt="El Dogtor" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="hidden md:block font-medium pr-1">
              Asistente Nutricional
            </span>
          </Link>
        </div>}
    </div>;
}