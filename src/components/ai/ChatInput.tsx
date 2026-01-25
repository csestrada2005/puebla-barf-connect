import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  type?: "text" | "number";
}

export function ChatInput({ placeholder, onSubmit, type = "text" }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className="flex gap-2 mt-4"
    >
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
        autoFocus
      />
      <Button type="submit" size="icon" disabled={!value.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </motion.form>
  );
}
