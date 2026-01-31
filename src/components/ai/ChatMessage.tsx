import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import dogtorAvatar from "@/assets/brand/dogtor-avatar.png";

interface ChatMessageProps {
  content: string;
  isBot?: boolean;
  children?: React.ReactNode;
}

export function ChatMessage({ content, isBot = true, children }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="w-24 h-24 flex-shrink-0">
          <img 
            src={dogtorAvatar} 
            alt="El Dogtor" 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-5 py-3 max-w-[80%]",
          isBot
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        <p className="text-base leading-relaxed">{content}</p>
        {children}
      </div>
    </motion.div>
  );
}
