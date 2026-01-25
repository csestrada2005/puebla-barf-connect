import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface QuickReplyOption {
  label: string;
  value: string;
  emoji?: string;
}

interface QuickRepliesProps {
  options: QuickReplyOption[];
  onSelect: (value: string, label: string) => void;
  columns?: 2 | 3 | 4;
}

export function QuickReplies({ options, onSelect, columns = 2 }: QuickRepliesProps) {
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`grid ${gridClass} gap-2 mt-4`}
    >
      {options.map((option, index) => (
        <motion.div
          key={option.value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * index }}
        >
          <Button
            variant="outline"
            className="w-full h-auto py-3 px-3 flex flex-col gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            onClick={() => onSelect(option.value, option.label)}
          >
            {option.emoji && <span className="text-xl">{option.emoji}</span>}
            <span className="text-xs font-medium">{option.label}</span>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
