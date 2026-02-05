import { useRef, useEffect, ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import aiHoundRight from "@/assets/brand/ai-hound-right.png";
import playPomeranian from "@/assets/brand/play-pomeranian.png";
import mobileDogLeft from "@/assets/brand/mobile-dog-left.png";
import mobileDogRight from "@/assets/brand/mobile-dog-right.png";

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
      {/* Desktop: Pomeranian (looking right) - LEFT side, standing on input bar */}
      <AnimatePresence>
        <motion.img 
          src={playPomeranian}
          alt="Pomeranian mirando el chat"
          initial={{ opacity: 0, x: -40 }}
          animate={{ 
            opacity: 1, 
            x: 0
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed -left-12 z-10 pointer-events-none hidden md:block w-64 md:w-72 lg:w-80 object-contain drop-shadow-xl"
          style={{ bottom: inputHeight - 42 }}
        />
      </AnimatePresence>

      {/* Desktop: Hound (looking LEFT) - RIGHT side, standing on input bar */}
      <AnimatePresence>
        <motion.img 
          src={aiHoundRight}
          alt="Perro atento mirando el chat"
          initial={{ opacity: 0, x: 40 }}
          animate={{ 
            opacity: 1, 
            x: 0
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed right-0 z-10 pointer-events-none hidden md:block w-52 md:w-64 lg:w-72 object-contain drop-shadow-xl"
          style={{ bottom: inputHeight + 16 }}
        />
      </AnimatePresence>

      {/* Mobile: Dog (sitting, looking left) - LEFT side, on top of input bar */}
      <AnimatePresence>
        <motion.img 
          src={mobileDogLeft}
          alt="Perrito sentado"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed left-0 z-10 pointer-events-none md:hidden w-20 object-contain drop-shadow-lg"
          style={{ bottom: inputHeight - 8 }}
        />
      </AnimatePresence>

      {/* Mobile: Dog (fluffy, laying) - RIGHT side, on top of input bar */}
      <AnimatePresence>
        <motion.img 
          src={mobileDogRight}
          alt="Perrito acostado"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed right-0 z-10 pointer-events-none md:hidden w-24 object-contain drop-shadow-lg"
          style={{ bottom: inputHeight - 12 }}
        />
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

      {/* Fixed Input Section at Bottom - with delineated border */}
      <div ref={inputSectionRef} className="flex-shrink-0 border-t-2 border-foreground/80 bg-background/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto">
          {inputSection}
        </div>
      </div>
    </div>
  );
}
