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
  const isSingleOption = options.length === 1;
  const isThreeOptions = options.length === 3;

  // For 3 options: T-shape on mobile, centered row on desktop
  if (isThreeOptions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Desktop: single centered row */}
        <div className="hidden md:flex justify-center gap-3">
          {options.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className="w-48"
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
        </div>

        {/* Mobile: T-shape (2 on top, 1 centered below) */}
        <div className="md:hidden flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {options.slice(0, 2).map((option, index) => (
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
          </div>
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-1/2"
            >
              <Button
                variant="outline"
                className="w-full h-auto py-4 px-3 flex flex-col gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all rounded-xl text-center"
                onClick={() => onSelect(options[2].value, options[2].label)}
                disabled={disabled}
              >
                {options[2].emoji && <span className="text-2xl">{options[2].emoji}</span>}
                <span className="text-sm font-medium leading-tight">{options[2].label}</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className={isSingleOption ? "w-full" : `grid ${gridClass} gap-3`}>
        {options.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * index }}
            className={isSingleOption ? "w-full" : ""}
          >
            <Button
              variant={isSingleOption ? "default" : "outline"}
              className={`w-full h-auto py-4 px-3 flex ${isSingleOption ? "flex-row justify-center gap-3" : "flex-col gap-1.5"} hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all rounded-xl text-center ${isSingleOption ? "text-lg font-semibold" : ""}`}
              onClick={() => onSelect(option.value, option.label)}
              disabled={disabled}
            >
              {option.emoji && <span className={isSingleOption ? "text-2xl" : "text-2xl"}>{option.emoji}</span>}
              <span className={isSingleOption ? "text-base font-semibold" : "text-sm font-medium leading-tight"}>{option.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
