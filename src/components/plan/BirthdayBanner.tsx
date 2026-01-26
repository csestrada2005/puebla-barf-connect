import { motion } from "framer-motion";
import { Cake, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BirthdayBannerProps {
  dogName: string;
  onDismiss?: () => void;
}

export function BirthdayBanner({ dogName, onDismiss }: BirthdayBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 p-1"
    >
      <div className="relative bg-white/95 backdrop-blur rounded-xl px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 pr-8">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="flex-shrink-0"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-200 to-pink-200 flex items-center justify-center">
              <Cake className="h-6 w-6 text-pink-600" />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg truncate">
                ¡Hoy es el cumple de {dogName}!
              </h3>
              <PartyPopper className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">
              🎉 Felicidades a tu peludo favorito 🎂
            </p>
          </div>
        </div>

        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#FFD700', '#FF69B4', '#9B59B6', '#3498DB', '#2ECC71', '#E74C3C'][i],
                left: `${10 + i * 15}%`,
                top: '-10px',
              }}
              animate={{
                y: [0, 100],
                x: [0, (i % 2 === 0 ? 20 : -20)],
                opacity: [1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
