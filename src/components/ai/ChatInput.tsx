import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  type?: "text" | "number";
  disabled?: boolean;
  allowEmpty?: boolean;
}

export function ChatInput({ placeholder, onSubmit, type = "text", disabled, allowEmpty = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    if (allowEmpty || value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  const canSubmit = allowEmpty || value.trim();

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex gap-3 w-full"
    >
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 h-12 text-base rounded-xl"
        autoFocus
        disabled={disabled}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!canSubmit || disabled}
        className="h-12 w-12 rounded-xl"
      >
        <Send className="h-5 w-5" />
      </Button>
    </motion.form>
  );
}
