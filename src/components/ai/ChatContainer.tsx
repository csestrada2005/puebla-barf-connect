import { useRef, useEffect, ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import playHound from "@/assets/brand/play-hound.png";

interface ChatContainerProps {
  children: ReactNode;
  inputSection: ReactNode;
  scrollToEnd?: boolean;
  /** Whether the chat has active input options (buttons/quick replies visible) */
  hasActiveInput?: boolean;
}

export function ChatContainer({ children, inputSection, scrollToEnd = true, hasActiveInput = true }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(80);

  useEffect(() => {
    if (scrollToEnd) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [children, scrollToEnd]);

  // Track input section height for reactive dog positioning
  useEffect(() => {
    if (inputSectionRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setInputHeight(entry.contentRect.height + 32); // +32 for padding
        }
      });
      observer.observe(inputSectionRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[calc(100dvh-80px)] relative">
      {/* Hound (looking RIGHT) - positioned at LEFT edge, reacting to input section height */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            bottom: inputHeight + 8
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute left-0 z-10 pointer-events-none hidden md:block"
          style={{ bottom: inputHeight + 8 }}
        >
          <img 
            src={playHound} 
            alt="Perro atento mirando el chat" 
            className="w-32 md:w-40 lg:w-48 object-contain drop-shadow-xl"
          />
        </motion.div>
      </AnimatePresence>

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
      <div ref={inputSectionRef} className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto">
          {inputSection}
        </div>
      </div>
    </div>
  );
}
