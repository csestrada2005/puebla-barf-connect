import { useRef, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import playHound from "@/assets/brand/play-hound.png";

interface ChatContainerProps {
  children: ReactNode;
  inputSection: ReactNode;
  scrollToEnd?: boolean;
}

export function ChatContainer({ children, inputSection, scrollToEnd = true }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToEnd) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [children, scrollToEnd]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[calc(100dvh-80px)] relative overflow-hidden">
      {/* Hound (looking RIGHT) - peeking from LEFT side, watching the chat */}
      <motion.div 
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-24 -left-8 md:-left-12 lg:-left-16 z-10 pointer-events-none hidden md:block"
      >
        <img 
          src={playHound} 
          alt="Perro atento mirando el chat" 
          className="w-40 md:w-48 lg:w-56 object-contain drop-shadow-xl"
        />
      </motion.div>

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
