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
        "flex gap-3 max-w-[85%]",
        isBot ? "self-start" : "self-end flex-row-reverse"
      )}
    >
      {isBot && (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={dogtorAvatar} 
            alt="El Dogtor" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-3",
          isBot
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        {children}
      </div>
    </motion.div>
  );
}
