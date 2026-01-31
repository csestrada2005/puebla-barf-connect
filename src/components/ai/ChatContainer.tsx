import { useRef, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import aiHoundRight from "@/assets/brand/ai-hound-right.png";
import playPomeranian from "@/assets/brand/play-pomeranian.png";

interface ChatContainerProps {
  children: ReactNode;
  inputSection: ReactNode;
  scrollToEnd?: boolean;
  /** Whether the chat has active input options (buttons/quick replies visible) */
  hasActiveInput?: boolean;
}

export function ChatContainer({ children, inputSection, scrollToEnd = true, hasActiveInput = true }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToEnd) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [children, scrollToEnd]);


  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[calc(100dvh-80px)] relative overflow-hidden">
      {/* Pomeranian (looking right) - LEFT side, peeking from bottom left */}
      <motion.img 
        src={playPomeranian}
        alt="Pomeranian mirando el chat"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="absolute -bottom-4 -left-4 md:-left-8 w-40 sm:w-48 md:w-56 lg:w-64 object-contain z-10 pointer-events-none drop-shadow-2xl hidden md:block"
      />

      {/* Hound (looking LEFT) - RIGHT side, peeking from bottom right */}
      <motion.img 
        src={aiHoundRight}
        alt="Perro atento mirando el chat"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="absolute -bottom-4 -right-4 md:-right-8 w-44 sm:w-52 md:w-60 lg:w-72 object-contain z-10 pointer-events-none drop-shadow-2xl hidden md:block"
      />

      {/* Header Badge */}
      <div className="flex-shrink-0 text-center py-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Asistente Raw Paw
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {children}
            <div ref={messagesEndRef} />
          </motion.div>
        </div>
      </div>

      {/* Fixed Input Section at Bottom */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto">
          {inputSection}
        </div>
      </div>
    </div>
  );
}
