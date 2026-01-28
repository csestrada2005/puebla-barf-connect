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
  disabled?: boolean;
}

export function QuickReplies({ options, onSelect, columns = 2, disabled }: QuickRepliesProps) {
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  // If only one option, use flex to center it
  const isSingleOption = options.length === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={isSingleOption ? "flex justify-center w-full" : `grid ${gridClass} gap-3 w-full`}
    >
      {options.map((option, index) => (
        <motion.div
          key={option.value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * index }}
        >
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-3 flex flex-col gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all rounded-xl text-center"
            onClick={() => onSelect(option.value, option.label)}
            disabled={disabled}
          >
            {option.emoji && <span className="text-2xl">{option.emoji}</span>}
            <span className="text-sm font-medium leading-tight">{option.label}</span>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
