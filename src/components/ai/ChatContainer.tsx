import { useRef, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ChatContainerProps {
  children: ReactNode;
  inputSection: ReactNode;
}

export function ChatContainer({ children, inputSection }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [children]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[calc(100dvh-80px)]">
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
