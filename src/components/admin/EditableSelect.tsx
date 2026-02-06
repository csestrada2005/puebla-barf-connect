import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EditableSelectProps {
  value: string | null | undefined;
  options: { value: string; label: string; color?: string }[];
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EditableSelect({
  value,
  options,
  onSave,
  placeholder = "Seleccionar",
  className,
  disabled = false,
}: EditableSelectProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (newValue: string) => {
    if (newValue === value) return;
    setIsSaving(true);
    try {
      await onSave(newValue);
    } finally {
      setIsSaving(false);
    }
  };

  const currentOption = options.find((opt) => opt.value === value);

  return (
    <Select
      value={value || ""}
      onValueChange={handleChange}
      disabled={disabled || isSaving}
    >
      <SelectTrigger
        className={cn("h-7 text-xs w-auto min-w-[100px]", currentOption?.color, className)}
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent onClick={(e) => e.stopPropagation()}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className={cn("px-1 rounded", option.color)}>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
